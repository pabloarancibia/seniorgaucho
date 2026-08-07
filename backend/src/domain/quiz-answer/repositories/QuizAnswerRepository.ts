import type { QuizAnswer } from "@domain/quiz-answer/entities/QuizAnswer.js";

export interface QuizAnswerRepository {
  findByLessonId(lessonId: string): Promise<QuizAnswer[]>;
  /** Registra o corrige la respuesta a una pregunta (última respuesta gana). */
  upsert(
    lessonId: string,
    questionId: string,
    selectedOption: string,
    isCorrect: boolean
  ): Promise<QuizAnswer>;
}
