import type { Lesson, NewLessonProps } from "@domain/lesson/entities/Lesson.js";

/**
 * Puerto (interfaz) que el dominio expone para persistir lecciones.
 * La implementación concreta (Prisma, in-memory para tests, etc.) vive en
 * infrastructure/ y se inyecta donde se necesite.
 */
export interface LessonRepository {
  findAll(): Promise<Lesson[]>;
  findBySlug(slug: string): Promise<Lesson | null>;
  findById(id: string): Promise<Lesson | null>;
  create(props: NewLessonProps): Promise<Lesson>;
}
