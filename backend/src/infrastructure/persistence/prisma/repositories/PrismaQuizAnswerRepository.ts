import { QuizAnswer } from "@domain/quiz-answer/entities/QuizAnswer.js";
import type { QuizAnswerRepository } from "@domain/quiz-answer/repositories/QuizAnswerRepository.js";
import type {
  PrismaClient,
  QuizAnswer as PrismaQuizAnswer,
} from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaQuizAnswerRepository implements QuizAnswerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByLessonId(lessonId: string): Promise<QuizAnswer[]> {
    const records = await this.prisma.quizAnswer.findMany({ where: { lessonId } });
    return records.map(PrismaQuizAnswerRepository.toDomain);
  }

  async upsert(
    lessonId: string,
    questionId: string,
    selectedOption: string,
    isCorrect: boolean
  ): Promise<QuizAnswer> {
    const record = await this.prisma.quizAnswer.upsert({
      where: { lessonId_questionId: { lessonId, questionId } },
      create: { lessonId, questionId, selectedOption, isCorrect },
      update: { selectedOption, isCorrect, answeredAt: new Date() },
    });
    return PrismaQuizAnswerRepository.toDomain(record);
  }

  private static toDomain(record: PrismaQuizAnswer): QuizAnswer {
    return QuizAnswer.reconstitute(record);
  }
}
