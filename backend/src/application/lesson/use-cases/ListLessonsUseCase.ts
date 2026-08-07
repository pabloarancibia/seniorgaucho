import type { Lesson } from "@domain/lesson/entities/Lesson.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";

export class ListLessonsUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(): Promise<Lesson[]> {
    return this.lessonRepository.findAll();
  }
}
