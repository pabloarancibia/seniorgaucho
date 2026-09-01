import type { PracticeChatMessage } from "@domain/practice-tutor/entities/PracticeChatMessage.js";
import type { LlmMessage } from "@domain/llm/value-objects/LlmMessage.js";

/** Convierte un PracticeChatMessage persistido a un LlmMessage para mandarle al proveedor. */
export function practiceChatMessageToLlmMessage(message: PracticeChatMessage): LlmMessage {
  if (message.role === "USER") {
    return { role: "user", text: message.text };
  }

  return {
    role: "assistant",
    text: message.text,
    ...(message.providerBlocks !== null ? { providerBlocks: message.providerBlocks } : {}),
  };
}
