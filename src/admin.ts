/**
 * 가게 관리자 대시보드 (웹).
 *   npm run admin   → http://localhost:4000
 * PowerShell·메모장 없이 브라우저에서 가게를 추가/수정한다.
 */
import express from "express";
import {
  listShops,
  loadShop,
  saveShop,
  type BusinessInfo,
  type MenuItem,
  type FaqItem,
} from "./business.js";

const app = express();
app.use(express.urlencoded({ extended: true }));

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const page = (title: string, body: string) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  body{font-family:system-ui,'Malgun Gothic',sans-serif;max-width:760px;margin:30px auto;padding:0 16px;color:#222}
  h1{font-size:22px} h2{font-size:17px;margin-top:24px}
  a{color:#2a6df4;text-decoration:none} a:hover{text-decoration:underline}
  .card{border:1px solid #e3e3e3;border-radius:10px;padding:14px 16px;margin:10px 0}
  label{display:block;font-weight:600;margin:14px 0 4px}
  input,textarea{width:100%;padding:9px;border:1px solid #ccc;border-radius:7px;font-size:14px;box-sizing:border-box}
  textarea{min-height:90px;font-family:inherit}
  .btn{display:inline-block;background:#2a6df4;color:#fff;padding:9px 16px;border:0;border-radius:8px;font-size:14px;cursor:pointer}
  .btn.gray{background:#777} .hint{color:#888;font-size:12px;margin-top:3px}
  .row{display:flex;gap:10px;flex-wrap:wrap} .row>div{flex:1;min-width:200px}
</style></head><body>${body}</body></html>`;

// 가게 목록
app.get("/", (_req, res) => {
  const rows = listShops()
    .map(
      (s) =>
        `<div class="card"><b>${esc(s.info.shopName)}</b> <span class="hint">(${esc(s.info.industry)})</span><br>
         <a href="/edit/${esc(s.id)}">✏️ 정보 수정</a></div>`,
    )
    .join("");
  res.send(
    page(
      "가게 관리",
      `<h1>🦞 가게 관리 대시보드</h1>
       <p class="hint">여기서 각 가게의 정보를 수정하면 봇 답변에 바로 반영돼요.</p>
       <h2>등록된 가게 (${listShops().length})</h2>
       ${rows || "<p>아직 가게가 없어요.</p>"}
       <h2>새 가게 추가</h2>
       <form method="post" action="/new" class="card">
         <label>가게 ID (영문/숫자, 예: gangnam-studycafe)</label>
         <input name="id" placeholder="gangnam-studycafe" required>
         <label>가게 이름</label>
         <input name="shopName" placeholder="강남 무인스터디카페" required>
         <div style="margin-top:12px"><button class="btn">+ 가게 만들기</button></div>
       </form>`,
    ),
  );
});

// 수정 폼
app.get("/edit/:id", (req, res) => {
  let b: BusinessInfo;
  try {
    b = loadShop(req.params.id);
  } catch {
    return res.status(404).send(page("없음", "<p>가게를 찾을 수 없어요. <a href='/'>목록으로</a></p>"));
  }
  const menuText = b.menu.map((m) => `${m.name} | ${m.price}`).join("\n");
  const faqText = b.faq.map((f) => `${f.q} || ${f.a}`).join("\n");
  res.send(
    page(
      `수정 - ${b.shopName}`,
      `<p><a href="/">← 목록</a></p>
       <h1>✏️ ${esc(b.shopName)}</h1>
       <form method="post" action="/save/${esc(req.params.id)}">
         <label>가게 이름</label><input name="shopName" value="${esc(b.shopName)}" required>
         <label>업종</label><input name="industry" value="${esc(b.industry)}">
         <div class="row">
           <div><label>영업시간</label><input name="hours" value="${esc(b.hours)}"></div>
           <div><label>전화</label><input name="phone" value="${esc(b.phone)}"></div>
         </div>
         <label>주소</label><input name="address" value="${esc(b.address)}">
         <label>메뉴/가격</label>
         <textarea name="menu">${esc(menuText)}</textarea>
         <div class="hint">한 줄에 하나씩:  이름 | 가격  (예:  커트 | 15,000원)</div>
         <label>자주 묻는 질문</label>
         <textarea name="faq" style="min-height:150px">${esc(faqText)}</textarea>
         <div class="hint">한 줄에 하나씩:  질문 || 답변</div>
         <label>참고사항</label>
         <textarea name="notes">${esc(b.notes ?? "")}</textarea>
         <div style="margin:16px 0"><button class="btn">💾 저장</button>
         <a class="btn gray" href="/">취소</a></div>
       </form>`,
    ),
  );
});

function parseMenu(text: string): MenuItem[] {
  return String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, ...rest] = l.split("|");
      return { name: name.trim(), price: rest.join("|").trim() };
    });
}

function parseFaq(text: string): FaqItem[] {
  return String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [q, ...rest] = l.split("||");
      return { q: q.trim(), a: rest.join("||").trim() };
    });
}

// 저장
app.post("/save/:id", (req, res) => {
  const body = req.body;
  const info: BusinessInfo = {
    shopName: body.shopName || "이름없음",
    industry: body.industry || "",
    hours: body.hours || "",
    address: body.address || "",
    phone: body.phone || "",
    menu: parseMenu(body.menu),
    faq: parseFaq(body.faq),
    notes: body.notes || "",
  };
  saveShop(req.params.id, info);
  res.redirect("/edit/" + encodeURIComponent(req.params.id));
});

// 새 가게
app.post("/new", (req, res) => {
  const id = String(req.body.id || "").trim();
  if (!id) return res.redirect("/");
  saveShop(id, {
    shopName: req.body.shopName || "새 가게",
    industry: "",
    hours: "",
    address: "",
    phone: "",
    menu: [],
    faq: [],
    notes: "",
  });
  res.redirect("/edit/" + encodeURIComponent(id));
});

const port = Number(process.env.ADMIN_PORT || 4000);
app.listen(port, () => {
  console.log(`🦞 가게 관리 대시보드: http://localhost:${port}`);
});
