import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type Effort = "low" | "medium" | "high" | "max";

export const CONFIG = {
  model: process.env.OPENCLAW_MODEL || "claude-opus-4-8",
  effort: (process.env.OPENCLAW_EFFORT as Effort) || "high",
  maxTokens: Number(process.env.OPENCLAW_MAX_TOKENS || 8000),
  /** 메모리에서 모델에 넘길 최대 대화 턴 수(사용자+비서 한 쌍을 1턴으로 셈) */
  maxTurns: Number(process.env.OPENCLAW_MAX_TURNS || 20),
  dataDir: path.resolve(__dirname, "..", "data"),
};
