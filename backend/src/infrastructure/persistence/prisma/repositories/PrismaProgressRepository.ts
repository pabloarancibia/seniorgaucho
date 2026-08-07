import { Progress } from "@domain/progress/entities/Progress.js";
import type { ProgressRepository } from "@domain/progress/repositories/ProgressRepository.js";
import type { ProgressStatus } from "@domain/progress/value-objects/ProgressStatus.js";
import type {
  PrismaClient,
  Progress as PrismaProgress,
} from "@infrastructure/persistence/prisma/generated/client.js";
import type { ProgressStatus as PrismaProgressStatus } from "@infrastructure/persistence/prisma/generated/enums.js";

export class PrismaProgressRepository implements ProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByLessonId(lessonId: string): Promise<Progress | null> {
    const record = await this.prisma.progress.findUnique({ where: { lessonId } });
    return record ? PrismaProgressRepository.toDomain(record) : null;
  }

  async upsert(lessonId: string, status: ProgressStatus): Promise<Progress> {
    const record = await this.prisma.progress.upsert({
      where: { lessonId },
      create: { lessonId, status: status as PrismaProgressStatus },
      update: { status: status as PrismaProgressStatus, lastAccessed: new Date() },
    });
    return PrismaProgressRepository.toDomain(record);
  }

  private static toDomain(record: PrismaProgress): Progress {
    return Progress.reconstitute({ ...record, status: record.status as ProgressStatus });
  }
}
