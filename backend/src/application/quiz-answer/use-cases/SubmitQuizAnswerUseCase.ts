import type { QuizAnswer } from "@domain/quiz-answer/entities/QuizAnswer.js";
import type { QuizAnswerRepository } from "@domain/quiz-answer/repositories/QuizAnswerRepository.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class SubmitQuizAnswerUseCase {
  constructor(
    private readonly quizAnswerRepository: QuizAnswerRepository,
    private readonly lessonRepository: LessonRepository
  ) {}

  async execute(
    lessonId: string,
    questionId: string,
    selectedOption: string,
    isCorrect: boolean
  ): Promise<QuizAnswer> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección con id "${lessonId}"`);
    }

    return this.quizAnswerRepository.upsert(lessonId, questionId, selectedOption, isCorrect);
  }
}
