export interface LessonProps {
  id: string;
  slug: string;
  title: string;
  mdxContent: string;
  /** Traducción al inglés, opcional: null hasta que se cargue. */
  titleEn: string | null;
  mdxContentEn: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NewLessonProps = Omit<LessonProps, "id" | "createdAt" | "updatedAt" | "titleEn" | "mdxContentEn"> & {
  titleEn?: string | null;
  mdxContentEn?: string | null;
};

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

  get titleEn(): string | null {
    return this.props.titleEn;
  }

  get mdxContentEn(): string | null {
    return this.props.mdxContentEn;
  }

  get order(): number {
    return this.props.order;
  }

  toPrimitives(): LessonProps {
    return { ...this.props };
  }
}
