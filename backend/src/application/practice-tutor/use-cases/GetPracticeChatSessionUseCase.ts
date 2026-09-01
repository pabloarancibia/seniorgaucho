import type { PracticeChatSession } from "@domain/practice-tutor/entities/PracticeChatSession.js";
import type { PracticeChatSessionRepository } from "@domain/practice-tutor/repositories/PracticeChatSessionRepository.js";
import type { PracticeChatMessage } from "@domain/practice-tutor/entities/PracticeChatMessage.js";
import type { PracticeChatMessageRepository } from "@domain/practice-tutor/repositories/PracticeChatMessageRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export interface PracticeChatSessionDetail {
  session: PracticeChatSession;
  messages: PracticeChatMessage[];
}

/** Trae la sesión + su historial completo de mensajes, para resumir el chat al volver a la pantalla. */
export class GetPracticeChatSessionUseCase {
  constructor(
    private readonly practiceChatSessionRepository: PracticeChatSessionRepository,
    private readonly practiceChatMessageRepository: PracticeChatMessageRepository
  ) {}

  async execute(sessionId: string): Promise<PracticeChatSessionDetail> {
    const session = await this.practiceChatSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError(`No existe la sesión "${sessionId}"`);
    }
    const messages = await this.practiceChatMessageRepository.findBySessionId(sessionId);
    return { session, messages };
  }
}
