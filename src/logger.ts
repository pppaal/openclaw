import fs from "node:fs";
import path from "node:path";
import { CONFIG } from "./config.js";

export const LOG_PATH = path.join(CONFIG.dataDir, "qa-log.jsonl");

export type QaLog = {
  time: string;
  conversationId: string;
  question: string;
  answer: string;
  /** 봇이 자신있게 못 답하고 "전화/연락" 으로 넘긴 것으로 추정되는 경우 */
  handoff: boolean;
};

/** 봇 답변이 "전화로 문의하세요" 류면 = 봇이 직접 못 푼 것으로 추정 */
function isHandoff(answer: string): boolean {
  return /전화|연락\s*주|문의\s*(주세요|해\s*주|바랍)|\d{2,4}[-)]\d{3,4}-\d{4}/.test(answer);
}

/** 손님 질문 1건과 봇 답변을 기록한다 (사장님 리포트용) */
export function logQA(conversationId: string, question: string, answer: string): void {
  fs.mkdirSync(CONFIG.dataDir, { recursive: true });
  const line: QaLog = {
    time: new Date().toISOString(),
    conversationId,
    question,
    answer,
    handoff: isHandoff(answer),
  };
  fs.appendFileSync(LOG_PATH, JSON.stringify(line) + "\n");
}

export function readLogs(): QaLog[] {
  try {
    return fs
      .readFileSync(LOG_PATH, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as QaLog);
  } catch {
    return [];
  }
}
