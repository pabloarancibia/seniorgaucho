/**
 * Distingue por qué falló una llamada al LLM sin acoplar el dominio al
 * vocabulario de errores de un proveedor puntual. `quota_exceeded` y
 * `rate_limited` son el motivo por el que existe el selector de proveedor
 * en la UI: si uno se queda sin cupo, la UI puede ofrecer específicamente
 * "cambiar de proveedor" en vez de un error genérico.
 */
export type LlmErrorKind =
  | "quota_exceeded"
  | "rate_limited"
  | "invalid_request"
  | "auth_error"
  | "network_error"
  | "unknown";

export class LlmError extends Error {
  constructor(
    message: string,
    readonly kind: LlmErrorKind,
    readonly providerKey: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "LlmError";
  }
}
