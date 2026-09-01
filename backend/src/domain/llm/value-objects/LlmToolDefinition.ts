/**
 * Definición de una tool que el LLM puede invocar, en JSON Schema puro. No
 * se usa en el v1 del chat de práctica (sin tool-calling, ver
 * practice-tutor) — se deja en el puerto para no romper compatibilidad si
 * se agrega tool-calling más adelante (ver Fase D del plan).
 */
export interface LlmToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  /** Validación estricta del proveedor (Anthropic strict mode), cuando esté disponible. */
  strict?: boolean;
}
