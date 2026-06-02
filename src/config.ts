import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type Effort = "low" | "medium" | "high" | "max";

/** 비서의 성격을 정하는 시스템 프롬프트. 프롬프트 캐싱을 위해 자주 안 바뀌게 고정. */
const SYSTEM_PROMPT = `당신은 "클로(Claw)"라는 이름의 개인 AI 비서입니다. 🦞
오픈소스 비서 OpenClaw에서 영감을 받아 만들어졌고, 사용자의 한국어 비서로 동작합니다.

성격과 태도:
- 친근하지만 군더더기 없이 핵심부터 말합니다. 존댓말을 씁니다.
- 모르는 건 모른다고 솔직히 말하고, 추측일 때는 추측이라고 표시합니다.
- 사용자가 한 이전 대화를 기억하고 맥락을 이어갑니다.
- 답이 길어질 것 같으면 먼저 요약하고, 필요하면 더 자세히 풀어줍니다.

능력과 한계(중요):
- 당신은 "미니 데모" 버전입니다. 진짜 OpenClaw처럼 사용자의 컴퓨터 파일을 직접
  조작하거나 셸 명령을 실행하지는 못합니다. 그런 요청이 오면, 할 수 있는 것처럼
  꾸미지 말고 한계를 솔직히 알리고 대안(방법 안내 등)을 제시하세요.
- 대신 질문 답변, 정리, 글쓰기, 아이디어, 번역, 코딩 도움 등은 잘 해냅니다.

항상 사용자에게 실제로 도움이 되는 방향으로 답하세요.`;

export const CONFIG = {
  model: process.env.OPENCLAW_MODEL || "claude-opus-4-8",
  effort: (process.env.OPENCLAW_EFFORT as Effort) || "high",
  maxTokens: Number(process.env.OPENCLAW_MAX_TOKENS || 8000),
  /** 메모리에서 모델에 넘길 최대 대화 턴 수(사용자+비서 한 쌍을 1턴으로 셈) */
  maxTurns: Number(process.env.OPENCLAW_MAX_TURNS || 20),
  dataDir: path.resolve(__dirname, "..", "data"),
  systemPrompt: SYSTEM_PROMPT,
};
