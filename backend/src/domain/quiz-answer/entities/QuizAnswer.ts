export interface QuizAnswerProps {
  id: string;
  lessonId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  answeredAt: Date;
}

export class QuizAnswer {
  private constructor(private readonly props: QuizAnswerProps) {}

  static reconstitute(props: QuizAnswerProps): QuizAnswer {
    return new QuizAnswer(props);
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get questionId(): string {
    return this.props.questionId;
  }

  toPrimitives(): QuizAnswerProps {
    return { ...this.props };
  }
}
