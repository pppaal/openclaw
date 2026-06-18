import express from "express";
import { Assistant } from "./assistant.js";

/**
 * 카카오 i 오픈빌더 "스킬 서버" 웹훅.
 * 카카오 채널 챗봇 → 이 서버(/kakao/skill) → Claude → 답변.
 *
 * 주의: 카카오 오픈빌더는 응답을 5초 안에 받아야 해서, 여기선 fast 모드
 * (thinking 끔 + effort low)로 호출한다. 더 긴 답이 필요하면 오픈빌더의
 * "콜백(callback)" 기능을 써야 하는데, 그건 다음 단계 과제로 남겨둔다.
 */
const app = express();
app.use(express.json());

app.post("/kakao/skill", async (req, res) => {
  const utterance: string = req.body?.userRequest?.utterance ?? "";
  const userId: string = req.body?.userRequest?.user?.id ?? "anonymous";
  // 여러 가게를 한 서버로 운영: 스킬 URL 뒤에 ?shop=가게ID 를 붙여 가게별 분기
  const shopId = typeof req.query.shop === "string" ? req.query.shop : undefined;

  let text: string;
  try {
    const assistant = new Assistant(`kakao-${shopId || "default"}-${userId}`, shopId);
    text = await assistant.reply(utterance, { fast: true });
  } catch (err) {
    console.error("Claude 호출 실패:", err);
    text = "죄송해요, 잠시 문제가 생겼어요. 다시 시도해 주세요.";
  }

  res.json({
    version: "2.0",
    template: { outputs: [{ simpleText: { text } }] },
  });
});

app.get("/health", (_req, res) => res.send("ok"));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`🦞 카카오 웹훅 서버 실행 중: http://localhost:${port}/kakao/skill`);
  console.log("   오픈빌더 스킬 URL에 위 주소(공개 도메인)를 등록하세요.");
});
