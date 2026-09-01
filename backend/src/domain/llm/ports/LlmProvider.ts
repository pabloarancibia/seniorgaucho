import type { LlmMessage } from "@domain/llm/value-objects/LlmMessage.js";
import type { LlmToolDefinition } from "@domain/llm/value-objects/LlmToolDefinition.js";
import type { LlmStreamEvent } from "@domain/llm/value-objects/LlmStreamEvent.js";

export type LlmProviderKey = "anthropic" | "google" | "fake";

export interface LlmRequest {
  system: string;
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
  maxOutputTokens?: number;
  effort?: "low" | "medium" | "high";
  /** JSON Schema; activa salida estructurada en generate(). */
  responseSchema?: Record<string, unknown>;
}

export interface LlmResult {
  text: string;
  /** Presente sólo cuando el request incluyó responseSchema — ya parseado. */
  structured?: unknown;
}

/**
 * Puerto de dominio para hablar con un LLM, sin acoplarse a ningún SDK.
 * Cada adapter (Anthropic/Google/Fake) implementa esto — agregar un
 * proveedor nuevo es una clase más acá adentro, cero cambios en el resto
 * del código (ver LlmProviderRegistry).
 */
export interface LlmProvider {
  readonly key: LlmProviderKey;
  readonly model: string;

  /** Llamada de una sola vuelta, con salida estructurada opcional. */
  generate(request: LlmRequest): Promise<LlmResult>;

  /** Llamada en streaming (chat de práctica). */
  stream(request: LlmRequest, signal?: AbortSignal): AsyncIterable<LlmStreamEvent>;
}
