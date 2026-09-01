import type { Request, Response } from "express";
import type { LlmProviderRegistryPort } from "@domain/llm/ports/LlmProviderRegistry.js";

export class LlmProviderController {
  constructor(private readonly registry: LlmProviderRegistryPort) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    res.json({ available: this.registry.available(), default: this.registry.defaultProviderKey });
  };
}
