import type { LlmMessage, LlmToolCall } from "@domain/llm/value-objects/LlmMessage.js";

export type LlmStopReason = "end_turn" | "tool_use" | "max_tokens" | "refusal";

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export type LlmStreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_call"; call: LlmToolCall }
  | { type: "done"; message: LlmMessage; stopReason: LlmStopReason; usage?: LlmUsage }
  | { type: "error"; code: string; message: string };
