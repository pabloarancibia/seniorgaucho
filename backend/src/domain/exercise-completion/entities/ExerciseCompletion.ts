export interface ExerciseCompletionProps {
  id: string;
  lessonId: string;
  exerciseId: string;
  completed: boolean;
  completedAt: Date;
}

export class ExerciseCompletion {
  private constructor(private readonly props: ExerciseCompletionProps) {}

  static reconstitute(props: ExerciseCompletionProps): ExerciseCompletion {
    return new ExerciseCompletion(props);
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get exerciseId(): string {
    return this.props.exerciseId;
  }

  toPrimitives(): ExerciseCompletionProps {
    return { ...this.props };
  }
}
