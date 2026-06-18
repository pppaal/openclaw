/**
 * 사장님께 보여줄 "손님 질문 리포트".
 *   npm run report
 * 손님들이 뭘 물어봤는지, 봇이 못 답해서 전화로 넘긴 질문은 뭔지 보여준다.
 * → 그 질문들 답을 business.json 의 faq 에 추가하면 봇이 점점 똑똑해진다.
 */
import { readLogs } from "./logger.js";

const logs = readLogs();

console.log("📊 손님 질문 리포트\n");

if (logs.length === 0) {
  console.log("아직 기록된 질문이 없어요. `npm run chat` 으로 손님처럼 몇 개 물어보면 여기 쌓입니다.");
  process.exit(0);
}

console.log(`총 손님 질문: ${logs.length}건`);

// 자주 들어온 질문 Top
const freq = new Map<string, number>();
for (const l of logs) freq.set(l.question, (freq.get(l.question) ?? 0) + 1);
const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log("\n🔝 많이 들어온 질문:");
for (const [q, n] of top) console.log(`   (${n}회) ${q}`);

// 봇이 전화로 넘긴(=답이 부족한) 질문
const handoff = logs.filter((l) => l.handoff);
console.log(`\n⚠️ 봇이 못 풀고 전화로 넘긴 질문: ${handoff.length}건`);
if (handoff.length > 0) {
  console.log("   👉 아래 질문들 답을 business.json 의 faq 에 추가하면 봇이 더 똑똑해져요:");
  for (const l of handoff.slice(-15)) console.log(`   - ${l.question}`);
}

console.log("\n(전체 기록 파일: data/qa-log.jsonl)");
