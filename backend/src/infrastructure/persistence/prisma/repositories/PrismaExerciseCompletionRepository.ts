import { ExerciseCompletion } from "@domain/exercise-completion/entities/ExerciseCompletion.js";
import type { ExerciseCompletionRepository } from "@domain/exercise-completion/repositories/ExerciseCompletionRepository.js";
import type {
  PrismaClient,
  ExerciseCompletion as PrismaExerciseCompletion,
} from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaExerciseCompletionRepository implements ExerciseCompletionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByLessonId(lessonId: string): Promise<ExerciseCompletion[]> {
    const records = await this.prisma.exerciseCompletion.findMany({ where: { lessonId } });
    return records.map(PrismaExerciseCompletionRepository.toDomain);
  }

  async upsert(lessonId: string, exerciseId: string, completed: boolean): Promise<ExerciseCompletion> {
    const record = await this.prisma.exerciseCompletion.upsert({
      where: { lessonId_exerciseId: { lessonId, exerciseId } },
      create: { lessonId, exerciseId, completed },
      update: { completed, completedAt: new Date() },
    });
    return PrismaExerciseCompletionRepository.toDomain(record);
  }

  private static toDomain(record: PrismaExerciseCompletion): ExerciseCompletion {
    return ExerciseCompletion.reconstitute(record);
  }
}
