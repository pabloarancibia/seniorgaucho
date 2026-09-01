import { randomUUID } from "node:crypto";
import { GoogleGenAI, ApiError as GoogleApiError, FinishReason } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import type { LlmProvider, LlmProviderKey, LlmRequest, LlmResult } from "@domain/llm/ports/LlmProvider.js";
import type { LlmMessage, LlmToolCall } from "@domain/llm/value-objects/LlmMessage.js";
import type { LlmStreamEvent, LlmStopReason } from "@domain/llm/value-objects/LlmStreamEvent.js";
import { LlmError } from "@domain/llm/errors/LlmError.js";
import { toGoogleContent, toGoogleTool, fromGoogleResponse } from "@infrastructure/llm/google/googleMappers.js";

function mapFinishReason(reason: FinishReason | undefined, hasToolCalls: boolean): LlmStopReason {
  if (hasToolCalls) return "tool_use";
  switch (reason) {
    case FinishReason.MAX_TOKENS:
      return "max_tokens";
    case FinishReason.SAFETY:
    case FinishReason.RECITATION:
    case FinishReason.LANGUAGE:
    case FinishReason.BLOCKLIST:
    case FinishReason.PROHIBITED_CONTENT:
    case FinishReason.SPII:
      return "refusal";
    default:
      return "end_turn";
  }
}

function mapGoogleError(error: unknown, providerKey: LlmProviderKey): LlmError {
  if (error instanceof GoogleApiError) {
    if (error.status === 401 || error.status === 403) {
      return new LlmError("Error de autenticación con Google", "auth_error", providerKey, { cause: error });
    }
    if (error.status === 429) {
      return new LlmError("Límite de requests de Google alcanzado", "rate_limited", providerKey, { cause: error });
    }
    if (error.status === 400) {
      return new LlmError("Request inválido a Google", "invalid_request", providerKey, { cause: error });
    }
    if (error.status >= 500) {
      // Modelos preview en el free tier devuelven 503 UNAVAILABLE seguido
      // ante demanda alta — es transitorio, no un request inválido.
      return new LlmError(
        "Servicio de Google no disponible momentáneamente, reintentá",
        "network_error",
        providerKey,
        { cause: error }
      );
    }
    return new LlmError(error.message, "unknown", providerKey, { cause: error });
  }
  if (error instanceof TypeError) {
    // fetch falla con TypeError ante problemas de red/DNS — no hay una clase de error de red dedicada en el SDK.
    return new LlmError("Error de red hablando con Google", "network_error", providerKey, { cause: error });
  }
  return new LlmError(error instanceof Error ? error.message : "Error desconocido de Google", "unknown", providerKey, {
    cause: error,
  });
}

export class GoogleLlmProvider implements LlmProvider {
  readonly key: LlmProviderKey = "google";
  private readonly client: GoogleGenAI;

  constructor(
    apiKey: string,
    readonly model: string
  ) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: LlmRequest): Promise<LlmResult> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: request.messages.map(toGoogleContent),
        config: {
          systemInstruction: request.system,
          ...(request.responseSchema
            ? { responseMimeType: "application/json", responseJsonSchema: request.responseSchema }
            : {}),
        },
      });

      const { text } = fromGoogleResponse(response);
      const structured = request.responseSchema ? safeJsonParse(text) : undefined;
      return { text, ...(structured !== undefined ? { structured } : {}) };
    } catch (error) {
      throw mapGoogleError(error, this.key);
    }
  }

  async *stream(request: LlmRequest, signal?: AbortSignal): AsyncIterable<LlmStreamEvent> {
    let chunks: AsyncGenerator<GenerateContentResponse>;

    try {
      chunks = await this.client.models.generateContentStream({
        model: this.model,
        contents: request.messages.map(toGoogleContent),
        config: {
          systemInstruction: request.system,
          thinkingConfig: { includeThoughts: true },
          ...(signal ? { abortSignal: signal } : {}),
          ...(request.tools && request.tools.length > 0
            ? { tools: [{ functionDeclarations: request.tools.map(toGoogleTool) }] }
            : {}),
        },
      });
    } catch (error) {
      const llmError = mapGoogleError(error, this.key);
      yield { type: "error", code: llmError.kind, message: llmError.message };
      return;
    }

    try {
      // A diferencia de Anthropic (que arma el mensaje final con
      // finalMessage()), acá no hay ayudante que reensamble los chunks: el
      // texto visible llega repartido en varios chunks tempranos, y el
      // thought part con su signature suele llegar en un chunk final
      // aparte, casi sin texto propio. Hay que acumular texto y parts a lo
      // largo de todo el stream.
      let text = "";
      const parts: Part[] = [];
      let finishReason: FinishReason | undefined;
      let usageMetadata: GenerateContentResponse["usageMetadata"];
      let sawAnyChunk = false;

      for await (const chunk of chunks) {
        sawAnyChunk = true;
        const chunkParts = chunk.candidates?.[0]?.content?.parts ?? [];
        for (const part of chunkParts) {
          if (part.text && !part.thought) {
            text += part.text;
            yield { type: "text_delta", text: part.text };
          }
          parts.push(part);
        }
        if (chunk.candidates?.[0]?.finishReason) finishReason = chunk.candidates[0].finishReason;
        if (chunk.usageMetadata) usageMetadata = chunk.usageMetadata;
      }

      if (!sawAnyChunk) {
        yield { type: "error", code: "no_response", message: "Google no devolvió ninguna respuesta" };
        return;
      }

      const toolCalls: LlmToolCall[] = parts
        .filter((part) => part.functionCall)
        .map((part) => ({
          id: part.functionCall?.id ?? randomUUID(),
          name: part.functionCall?.name ?? "",
          input: part.functionCall?.args ?? {},
        }));

      const message: LlmMessage = {
        role: "assistant",
        text,
        ...(toolCalls.length > 0 ? { toolCalls } : {}),
        providerBlocks: parts,
      };

      for (const call of toolCalls) {
        yield { type: "tool_call", call };
      }

      const stopReason = mapFinishReason(finishReason, toolCalls.length > 0);

      if (stopReason === "refusal") {
        yield { type: "error", code: "refusal", message: "El modelo rechazó continuar esta respuesta." };
        return;
      }

      yield {
        type: "done",
        message,
        stopReason,
        ...(usageMetadata
          ? {
              usage: {
                inputTokens: usageMetadata.promptTokenCount ?? 0,
                outputTokens: usageMetadata.candidatesTokenCount ?? 0,
              },
            }
          : {}),
      };
    } catch (error) {
      const llmError = mapGoogleError(error, this.key);
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
