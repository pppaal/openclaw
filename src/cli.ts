import readline from "node:readline";
import { Assistant } from "./assistant.js";

// node src/cli.ts [대화ID]  — 대화ID별로 기억이 따로 저장됨
const conversationId = process.argv[2] || "cli-default";
const assistant = new Assistant(conversationId);

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
