import { ProgressStatus } from "@domain/progress/value-objects/ProgressStatus.js";

export interface ProgressProps {
  id: string;
  lessonId: string;
  status: ProgressStatus;
  lastAccessed: Date;
}

export class Progress {
  private constructor(private readonly props: ProgressProps) {}

  static reconstitute(props: ProgressProps): Progress {
    return new Progress(props);
  }

  /** Estado por defecto para una lección que el usuario todavía no abrió. */
  static pending(lessonId: string): Progress {
    return new Progress({
      id: "",
      lessonId,
      status: ProgressStatus.PENDING,
      lastAccessed: new Date(),
    });
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get status(): ProgressStatus {
    return this.props.status;
  }

  toPrimitives(): ProgressProps {
    return { ...this.props };
  }
}
