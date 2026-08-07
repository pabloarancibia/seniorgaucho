import { Lesson, type NewLessonProps } from "@domain/lesson/entities/Lesson.js";
import type { LessonRepository, UpdateLessonProps } from "@domain/lesson/repositories/LessonRepository.js";
import type { PrismaClient, Lesson as PrismaLesson } from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Lesson[]> {
    const records = await this.prisma.lesson.findMany({ orderBy: { order: "asc" } });
    return records.map(PrismaLessonRepository.toDomain);
  }

  async findBySlug(slug: string): Promise<Lesson | null> {
    const record = await this.prisma.lesson.findUnique({ where: { slug } });
    return record ? PrismaLessonRepository.toDomain(record) : null;
  }

  async findById(id: string): Promise<Lesson | null> {
    const record = await this.prisma.lesson.findUnique({ where: { id } });
    return record ? PrismaLessonRepository.toDomain(record) : null;
  }

  async create(props: NewLessonProps): Promise<Lesson> {
    const record = await this.prisma.lesson.create({ data: props });
    return PrismaLessonRepository.toDomain(record);
  }

  async update(id: string, props: UpdateLessonProps): Promise<Lesson> {
    const record = await this.prisma.lesson.update({ where: { id }, data: props });
    return PrismaLessonRepository.toDomain(record);
  }

  private static toDomain(record: PrismaLesson): Lesson {
    return Lesson.reconstitute(record);
  }
}
