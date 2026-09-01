import type { LlmProvider, LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";
import type { LlmProviderRegistryPort } from "@domain/llm/ports/LlmProviderRegistry.js";
import { NotFoundError } from "@shared/errors/AppError.js";

/**
 * Registro de proveedores disponibles. Agregar uno nuevo es: una clase
 * adapter más que implemente LlmProvider, más una entrada acá — el resto
 * del código (casos de uso, controllers, UI) no cambia.
 */
export class LlmProviderRegistry implements LlmProviderRegistryPort {
  constructor(
    private readonly providers: Map<LlmProviderKey, LlmProvider>,
    private readonly defaultKey: LlmProviderKey
  ) {}

  resolve(key?: LlmProviderKey): LlmProvider {
    const resolvedKey = key ?? this.defaultKey;
    const provider = this.providers.get(resolvedKey);
    if (!provider) {
      throw new NotFoundError(`Proveedor LLM "${resolvedKey}" no está configurado`);
    }
    return provider;
  }

  get defaultProviderKey(): LlmProviderKey {
    return this.defaultKey;
  }

  available(): LlmProviderKey[] {
    return [...this.providers.keys()];
  }
}
