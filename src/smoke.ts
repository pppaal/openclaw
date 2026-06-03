/**
 * API 키 없이 돌려보는 점검 스크립트. Claude를 호출하진 않고,
 * 설정 로딩 + 메모리 저장/불러오기 + 슬라이싱 로직이 제대로 도는지 확인한다.
 *   npm run smoke
 */
import assert from "node:assert";
import { CONFIG } from "./config.js";
import { Memory } from "./memory.js";
import { loadBusiness, buildSystemPrompt } from "./business.js";

console.log("1) 설정 로딩 확인");
assert.ok(CONFIG.model, "model이 비어있음");
console.log(`   model=${CONFIG.model}, effort=${CONFIG.effort}, maxTurns=${CONFIG.maxTurns}`);

console.log("1-2) 가게 정보 + 상담 프롬프트 생성 확인");
const biz = loadBusiness();
assert.ok(biz.shopName, "가게 이름이 비어있음");
const prompt = buildSystemPrompt(biz);
assert.ok(prompt.includes(biz.shopName), "프롬프트에 가게 이름이 들어가야 함");
console.log(`   가게="${biz.shopName}"(${biz.industry}), 메뉴 ${biz.menu.length}개, FAQ ${biz.faq.length}개`);

console.log("2) 메모리 저장/불러오기 확인");
const mem = new Memory("smoke-test");
mem.reset();
mem.addUser("안녕");
mem.addAssistant("안녕하세요! 무엇을 도와드릴까요?");
mem.addUser("내 이름은 지윤이야");

const fresh = new Memory("smoke-test"); // 파일에서 다시 읽기
const msgs = fresh.messages();
assert.equal(msgs.length, 3, "메시지 3개가 보존돼야 함");
assert.equal(msgs[0].role, "user", "첫 메시지는 user여야 함");
console.log(`   저장된 메시지 ${msgs.length}개, 첫 역할=${msgs[0].role}`);

console.log("3) 첫 메시지 user 보장(앞쪽 assistant 잘라내기) 확인");
const mem2 = new Memory("smoke-test-2");
mem2.reset();
mem2.addAssistant("(잘려야 하는 비서 메시지)");
mem2.addUser("진짜 첫 user 메시지");
assert.equal(new Memory("smoke-test-2").messages()[0].role, "user");
console.log("   OK");

mem.reset();
mem2.reset();
console.log("\n✅ 점검 통과 — 설정/메모리 로직 정상. (실제 대화는 API 키 넣고 npm run chat)");
