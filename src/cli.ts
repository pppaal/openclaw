import readline from "node:readline";
import { Assistant } from "./assistant.js";

// npm run chat [가게ID]  — shops/ 의 특정 가게로 테스트 (없으면 기본 가게)
const shopId = process.argv[2];
const conversationId = `cli-${shopId || "default"}`;
const assistant = new Assistant(conversationId, shopId);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🦞 OpenClaw mini — Claude 비서 '클로'");
console.log("   종료: exit  |  기억 비우기: /reset\n");

function ask(): void {
  rl.question("나 > ", async (line) => {
    const msg = line.trim();
    if (!msg) return ask();
    if (msg === "exit" || msg === "quit") {
      rl.close();
      return;
    }
    if (msg === "/reset") {
      assistant.reset();
      console.log("(대화 기억을 비웠어요)\n");
      return ask();
    }

    process.stdout.write("클로 > ");
    try {
      for await (const chunk of assistant.streamReply(msg)) {
        process.stdout.write(chunk);
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      process.stdout.write(`\n[오류] ${m}\n(ANTHROPIC_API_KEY가 설정됐는지 확인하세요)`);
    }
    process.stdout.write("\n\n");
    ask();
  });
}

ask();
