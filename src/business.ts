import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export type MenuItem = { name: string; price: string };
export type FaqItem = { q: string; a: string };

export type BusinessInfo = {
  shopName: string;
  industry: string;
  hours: string;
  address: string;
  phone: string;
  menu: MenuItem[];
  faq: FaqItem[];
  notes?: string;
};

/**
 * 가게 정보를 불러온다.
 * - business.json 이 있으면 그걸(=실제 사장님이 채운 정보) 사용
 * - 없으면 business.example.json(데모 데이터)로 바로 돌아가게 한다
 */
export function loadBusiness(): BusinessInfo {
  const real = path.join(root, "business.json");
  const example = path.join(root, "business.example.json");
  const file = fs.existsSync(real) ? real : example;
  return JSON.parse(fs.readFileSync(file, "utf8")) as BusinessInfo;
}

/** 가게 정보를 바탕으로 "이 가게 전용 상담 직원" 시스템 프롬프트를 만든다. */
export function buildSystemPrompt(b: BusinessInfo = loadBusiness()): string {
  const menu = b.menu.map((m) => `- ${m.name}: ${m.price}`).join("\n");
  const faq = b.faq.map((f) => `Q. ${f.q}\nA. ${f.a}`).join("\n\n");

  return `당신은 "${b.shopName}"(${b.industry})의 카카오톡 상담 직원입니다. 손님에게 친절한 존댓말로 응대하세요.

[가게 정보]
- 상호: ${b.shopName}
- 영업시간: ${b.hours}
- 주소: ${b.address}
- 전화: ${b.phone}

[메뉴/가격]
${menu}

[자주 묻는 질문]
${faq}

${b.notes ? `[참고]\n${b.notes}\n` : ""}
응대 규칙(중요):
- 위 [가게 정보]에 있는 내용으로만 답하세요. 모르는 건 지어내지 말고
  "정확한 안내를 위해 전화(${b.phone})로 문의해 주세요"라고 안내하세요.
- 실제 예약 확정, 결제, 클레임 처리 같은 건 봇이 직접 못 합니다.
  안내까지만 하고 전화 연결을 권하세요.
- 답변은 카카오톡에 맞게 짧고 명확하게. 핵심부터 말하세요.
- 손님이 인사하면 가볍게 인사하고 무엇을 도와드릴지 물어보세요.`;
}
