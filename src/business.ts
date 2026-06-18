import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const shopsDir = path.join(root, "shops");

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

/** shops/ 폴더의 가게 목록 (id = 파일명에서 .json 뺀 것) */
export function listShops(): { id: string; info: BusinessInfo }[] {
  if (!fs.existsSync(shopsDir)) return [];
  return fs
    .readdirSync(shopsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      id: f.replace(/\.json$/, ""),
      info: JSON.parse(fs.readFileSync(path.join(shopsDir, f), "utf8")) as BusinessInfo,
    }));
}

export function shopPath(id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(shopsDir, `${safe}.json`);
}

export function loadShop(id: string): BusinessInfo {
  return JSON.parse(fs.readFileSync(shopPath(id), "utf8")) as BusinessInfo;
}

export function saveShop(id: string, info: BusinessInfo): void {
  fs.mkdirSync(shopsDir, { recursive: true });
  fs.writeFileSync(shopPath(id), JSON.stringify(info, null, 2));
}

export function defaultShopId(): string {
  if (process.env.OPENCLAW_SHOP) return process.env.OPENCLAW_SHOP;
  const shops = listShops();
  return shops[0]?.id ?? "demo-studycafe";
}

/**
 * 가게 정보를 불러온다 (기존 호환).
 * 1) 루트 business.json 이 있으면 그걸(빠른 단일 가게 테스트용)
 * 2) 없으면 shops/ 의 기본 가게
 * 3) 그것도 없으면 business.example.json
 */
export function loadBusiness(shopId?: string): BusinessInfo {
  if (shopId) return loadShop(shopId);
  const rootBiz = path.join(root, "business.json");
  if (fs.existsSync(rootBiz)) return JSON.parse(fs.readFileSync(rootBiz, "utf8")) as BusinessInfo;
  const shops = listShops();
  if (shops.length > 0) return loadShop(defaultShopId());
  return JSON.parse(fs.readFileSync(path.join(root, "business.example.json"), "utf8")) as BusinessInfo;
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
