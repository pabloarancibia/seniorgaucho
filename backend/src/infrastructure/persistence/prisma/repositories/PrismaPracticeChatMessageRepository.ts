import {
  PracticeChatMessage,
  type PracticeChatRole,
} from "@domain/practice-tutor/entities/PracticeChatMessage.js";
import type {
  NewPracticeChatMessage,
  PracticeChatMessageRepository,
} from "@domain/practice-tutor/repositories/PracticeChatMessageRepository.js";
import type {
  PrismaClient,
  PracticeChatMessage as PrismaPracticeChatMessage,
} from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaPracticeChatMessageRepository implements PracticeChatMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySessionId(sessionId: string): Promise<PracticeChatMessage[]> {
    const records = await this.prisma.practiceChatMessage.findMany({
      where: { sessionId },
      orderBy: { sequence: "asc" },
    });
    return records.map(PrismaPracticeChatMessageRepository.toDomain);
  }

  async append(message: NewPracticeChatMessage): Promise<PracticeChatMessage> {
    // sequence = max(sequence) + 1 dentro de una transacción, para que dos
    // appends concurrentes a la misma sesión no puedan pisarse el número.
    const record = await this.prisma.$transaction(async (tx) => {
      const last = await tx.practiceChatMessage.findFirst({
        where: { sessionId: message.sessionId },
        orderBy: { sequence: "desc" },
        select: { sequence: true },
      });
      const sequence = (last?.sequence ?? 0) + 1;

      return tx.practiceChatMessage.create({
        data: {
          sessionId: message.sessionId,
          sequence,
          role: message.role,
          text: message.text,
          providerBlocksJson: message.providerBlocks !== null ? JSON.stringify(message.providerBlocks) : null,
        },
      });
    });

    return PrismaPracticeChatMessageRepository.toDomain(record);
  }

  private static toDomain(record: PrismaPracticeChatMessage): PracticeChatMessage {
    return PracticeChatMessage.reconstitute({
      id: record.id,
      sessionId: record.sessionId,
      sequence: record.sequence,
      role: record.role as PracticeChatRole,
      text: record.text,
      providerBlocks: record.providerBlocksJson ? (JSON.parse(record.providerBlocksJson) as unknown) : null,
      createdAt: record.createdAt,
    });
  }
}
