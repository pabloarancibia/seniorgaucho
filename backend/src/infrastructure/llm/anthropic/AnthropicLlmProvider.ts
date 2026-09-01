import Anthropic from "@anthropic-ai/sdk";
import type { LlmProvider, LlmProviderKey, LlmRequest, LlmResult } from "@domain/llm/ports/LlmProvider.js";
import type { LlmMessage } from "@domain/llm/value-objects/LlmMessage.js";
import type { LlmStreamEvent, LlmStopReason } from "@domain/llm/value-objects/LlmStreamEvent.js";
import { LlmError, type LlmErrorKind } from "@domain/llm/errors/LlmError.js";
import {
  toAnthropicMessage,
  toAnthropicTool,
  fromAnthropicMessage,
} from "@infrastructure/llm/anthropic/anthropicMappers.js";

// El thinking + la respuesta comparten el mismo presupuesto de max_tokens
// en los modelos actuales — un tope chico corta la respuesta a mitad de
// camino. 16000 da margen real para una respuesta de mentor completa.
const CHAT_MAX_TOKENS = 16000;

function mapStopReason(reason: Anthropic.StopReason | null): LlmStopReason {
  switch (reason) {
    case "tool_use":
      return "tool_use";
    case "max_tokens":
      return "max_tokens";
    case "refusal":
      return "refusal";
    default:
      return "end_turn";
  }
}

function mapAnthropicError(error: unknown, providerKey: LlmProviderKey): LlmError {
  if (error instanceof Anthropic.RateLimitError) {
    return new LlmError("Límite de requests de Anthropic alcanzado", "rate_limited", providerKey, { cause: error });
  }
  if (error instanceof Anthropic.PermissionDeniedError || error instanceof Anthropic.AuthenticationError) {
    return new LlmError("Error de autenticación con Anthropic", "auth_error", providerKey, { cause: error });
  }
  if (error instanceof Anthropic.BadRequestError) {
    return new LlmError("Request inválido a Anthropic", "invalid_request", providerKey, { cause: error });
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new LlmError("Error de red hablando con Anthropic", "network_error", providerKey, { cause: error });
  }
  const kind: LlmErrorKind = "unknown";
  return new LlmError(error instanceof Error ? error.message : "Error desconocido de Anthropic", kind, providerKey, {
    cause: error,
  });
}

export class AnthropicLlmProvider implements LlmProvider {
  readonly key: LlmProviderKey = "anthropic";
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    readonly model: string
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(request: LlmRequest): Promise<LlmResult> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: request.maxOutputTokens ?? CHAT_MAX_TOKENS,
        system: request.system,
        thinking: { type: "adaptive" },
        output_config: {
          effort: request.effort ?? "medium",
          ...(request.responseSchema ? { format: { type: "json_schema", schema: request.responseSchema } } : {}),
        },
        messages: request.messages.map(toAnthropicMessage),
      });

      const { text } = fromAnthropicMessage(message);
      const structured = request.responseSchema ? safeJsonParse(text) : undefined;
      return { text, ...(structured !== undefined ? { structured } : {}) };
    } catch (error) {
      throw mapAnthropicError(error, this.key);
    }
  }

  async *stream(request: LlmRequest, signal?: AbortSignal): AsyncIterable<LlmStreamEvent> {
    let anthropicStream: ReturnType<Anthropic.Messages["stream"]>;

    try {
      anthropicStream = this.client.messages.stream(
        {
          model: this.model,
          max_tokens: request.maxOutputTokens ?? CHAT_MAX_TOKENS,
          system: request.system,
          thinking: { type: "adaptive" },
          output_config: { effort: request.effort ?? "medium" },
          ...(request.tools && request.tools.length > 0 ? { tools: request.tools.map(toAnthropicTool) } : {}),
          messages: request.messages.map(toAnthropicMessage),
        },
        { signal }
      );
    } catch (error) {
      yield { type: "error", code: "request_error", message: (error as Error).message };
      return;
    }

    try {
      for await (const event of anthropicStream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield { type: "text_delta", text: event.delta.text };
        }
      }

      const final = await anthropicStream.finalMessage();

      if (final.stop_reason === "refusal") {
        yield { type: "error", code: "refusal", message: "El modelo rechazó continuar esta respuesta." };
        return;
      }

      const { text, toolCalls, providerBlocks } = fromAnthropicMessage(final);
      const message: LlmMessage = {
        role: "assistant",
        text,
        ...(toolCalls.length > 0 ? { toolCalls } : {}),
        providerBlocks,
      };

      for (const call of toolCalls) {
        yield { type: "tool_call", call };
      }

      yield {
        type: "done",
        message,
        stopReason: mapStopReason(final.stop_reason),
        usage: { inputTokens: final.usage.input_tokens, outputTokens: final.usage.output_tokens },
      };
    } catch (error) {
      const llmError = mapAnthropicError(error, this.key);
      yield { type: "error", code: llmError.kind, message: llmError.message };
    }
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
