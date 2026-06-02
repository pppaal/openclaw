import fs from "node:fs";
import path from "node:path";
import { CONFIG } from "./config.js";

export type StoredMessage = { role: "user" | "assistant"; content: string };

/**
 * 대화 기억(메모리). conversationId별로 data/<id>.json 파일에 저장한다.
 * 임시 컨테이너가 아니라 본인 PC에서 돌리면 세션이 끝나도 기억이 남는다.
 */
export class Memory {
  private file: string;
  private history: StoredMessage[] = [];

  constructor(conversationId: string) {
    fs.mkdirSync(CONFIG.dataDir, { recursive: true });
    const safe = conversationId.replace(/[^a-zA-Z0-9_-]/g, "_") || "default";
    this.file = path.join(CONFIG.dataDir, `${safe}.json`);
    this.load();
  }

  private load(): void {
    try {
      this.history = JSON.parse(fs.readFileSync(this.file, "utf8"));
    } catch {
      this.history = [];
    }
  }

  private save(): void {
    fs.writeFileSync(this.file, JSON.stringify(this.history, null, 2));
  }

  addUser(content: string): void {
    this.history.push({ role: "user", content });
    this.save();
  }

  addAssistant(content: string): void {
    this.history.push({ role: "assistant", content });
    this.save();
  }

  /**
   * 모델에 넘길 최근 메시지들. 너무 길어지지 않게 최근 N턴만 자르고,
   * 첫 메시지는 반드시 user여야 하므로 앞쪽의 assistant 메시지는 떼어낸다.
   */
  messages(): StoredMessage[] {
    const recent = this.history.slice(-CONFIG.maxTurns * 2);
    let start = 0;
    while (start < recent.length && recent[start].role !== "user") start++;
    return recent.slice(start);
  }

  reset(): void {
    this.history = [];
    this.save();
  }
}
