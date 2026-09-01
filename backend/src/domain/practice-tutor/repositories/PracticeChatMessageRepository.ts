import type { PracticeChatMessage, PracticeChatRole } from "@domain/practice-tutor/entities/PracticeChatMessage.js";

export interface NewPracticeChatMessage {
  sessionId: string;
  role: PracticeChatRole;
  text: string;
  providerBlocks: unknown | null;
}

export interface PracticeChatMessageRepository {
  findBySessionId(sessionId: string): Promise<PracticeChatMessage[]>;
  /** sequence se asigna internamente (max(sequence) + 1), nunca lo pasa el caller. */
  append(message: NewPracticeChatMessage): Promise<PracticeChatMessage>;
}
