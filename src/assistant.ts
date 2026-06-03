import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import { Memory } from "./memory.js";
import { buildSystemPrompt } from "./business.js";

export type ReplyOptions = {
  /** 빠른 응답 모드: thinking 끄고 effort를 낮춰 지연시간을 줄인다(예: 카카오 5초 제한). */
  fast?: boolean;
};

/**
 * 비서의 두뇌. Claude(Opus 4.8)를 호출하고 대화 기억을 관리한다.
 * - 시스템 프롬프트에 prompt caching 적용(반복 호출 비용 절감)
 * - 기본은 적응형 thinking + 스트리밍
 */
export class Assistant {
  private client: Anthropic;
  private memory: Memory;
  private systemPrompt: string;

  constructor(conversationId: string) {
    // ANTHROPIC_API_KEY 환경변수를 자동으로 읽는다.
    this.client = new Anthropic();
    this.memory = new Memory(conversationId);
    // business.json(가게 정보)로 만든 "이 가게 전용" 상담 프롬프트
    this.systemPrompt = buildSystemPrompt();
  }

  private params(opts: ReplyOptions = {}): Anthropic.MessageCreateParamsNonStreaming {
    // thinking / output_config(effort)는 API는 지원하지만 SDK 정적 타입에 아직
    // 없을 수 있어 any로 전달한다. 런타임 동작에는 영향 없음.
    const base = {
      model: CONFIG.model,
      max_tokens: opts.fast ? 1024 : CONFIG.maxTokens,
      thinking: { type: opts.fast ? "disabled" : "adaptive" } as any,
      output_config: { effort: opts.fast ? "low" : CONFIG.effort } as any,
      system: [
        {
          type: "text" as const,
          text: this.systemPrompt,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      messages: this.memory.messages() as Anthropic.MessageParam[],
    };
    return base as Anthropic.MessageCreateParamsNonStreaming;
  }

  /** 터미널용: 토큰을 스트리밍으로 흘려보내고, 끝나면 기억에 저장한다. */
  async *streamReply(userMessage: string): AsyncGenerator<string> {
    this.memory.addUser(userMessage);
    const stream = this.client.messages.stream(this.params() as any);
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
    const final = await stream.finalMessage();
    this.memory.addAssistant(extractText(final));
  }

  /** 웹훅용: 한 번에 전체 답을 받는다(카카오 등 동기 응답이 필요한 곳). */
  async reply(userMessage: string, opts: ReplyOptions = {}): Promise<string> {
    this.memory.addUser(userMessage);
    const res = await this.client.messages.create(this.params(opts));
    const text = extractText(res);
    this.memory.addAssistant(text);
    return text;
  }

  reset(): void {
    this.memory.reset();
  }
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
