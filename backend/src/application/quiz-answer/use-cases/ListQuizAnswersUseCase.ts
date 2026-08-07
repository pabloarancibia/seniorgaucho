import type { QuizAnswer } from "@domain/quiz-answer/entities/QuizAnswer.js";
import type { QuizAnswerRepository } from "@domain/quiz-answer/repositories/QuizAnswerRepository.js";

export class ListQuizAnswersUseCase {
  constructor(private readonly quizAnswerRepository: QuizAnswerRepository) {}

  async execute(lessonId: string): Promise<QuizAnswer[]> {
    return this.quizAnswerRepository.findByLessonId(lessonId);
  }
}
