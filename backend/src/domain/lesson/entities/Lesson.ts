export interface LessonProps {
  id: string;
  slug: string;
  title: string;
  mdxContent: string;
  language: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NewLessonProps = Omit<LessonProps, "id" | "createdAt" | "updatedAt">;

/**
 * Entidad de dominio. No conoce Prisma, Express ni Zod — solo las reglas
 * de negocio propias de una lección (invariantes de sus atributos).
 */
export class Lesson {
  private constructor(private readonly props: LessonProps) {}

  static reconstitute(props: LessonProps): Lesson {
    return new Lesson(props);
  }

  static create(props: NewLessonProps): NewLessonProps {
    if (props.slug.trim().length === 0) {
      throw new Error("El slug de la lección no puede estar vacío");
    }
    if (props.title.trim().length === 0) {
      throw new Error("El título de la lección no puede estar vacío");
    }
    return props;
  }

  get id(): string {
    return this.props.id;
  }

  get slug(): string {
    return this.props.slug;
  }

  get title(): string {
    return this.props.title;
  }

  get mdxContent(): string {
    return this.props.mdxContent;
  }

  get language(): string {
    return this.props.language;
  }

  get order(): number {
    return this.props.order;
  }

  toPrimitives(): LessonProps {
    return { ...this.props };
  }
}
