import type { LlmProvider, LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";

/**
 * Puerto para resolver qué LlmProvider usar. La implementación concreta
 * (infrastructure/llm/LlmProviderRegistry.ts) sabe qué adapters están
 * disponibles; los casos de uso solo conocen esta interfaz.
 */
export interface LlmProviderRegistryPort {
  resolve(key?: LlmProviderKey): LlmProvider;
  readonly defaultProviderKey: LlmProviderKey;
  available(): LlmProviderKey[];
}
