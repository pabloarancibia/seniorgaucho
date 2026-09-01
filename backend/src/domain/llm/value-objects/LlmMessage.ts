export type LlmRole = "user" | "assistant" | "tool";

export interface LlmToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface LlmToolResult {
  toolCallId: string;
  name: string;
  output: unknown;
  isError?: boolean;
}

export interface LlmMessage {
  role: LlmRole;
  text?: string;
  toolCalls?: LlmToolCall[];
  toolResult?: LlmToolResult;
  /**
   * Bloques crudos del proveedor. Opaco para el dominio; sólo el adapter que
   * los produjo los reinterpreta. Permite reenviar thinking blocks intactos
   * en el siguiente turno sin que el dominio conozca su forma.
   */
  providerBlocks?: unknown;
}
