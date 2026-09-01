export interface PracticeCodeSnippetProps {
  id: string;
  lessonId: string;
  topicSlug: string;
  language: string;
  codeContent: string;
  updatedAt: Date;
}

export class PracticeCodeSnippet {
  private constructor(private readonly props: PracticeCodeSnippetProps) {}

  static reconstitute(props: PracticeCodeSnippetProps): PracticeCodeSnippet {
    return new PracticeCodeSnippet(props);
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get topicSlug(): string {
    return this.props.topicSlug;
  }

  get language(): string {
    return this.props.language;
  }

  get codeContent(): string {
    return this.props.codeContent;
  }

  toPrimitives(): PracticeCodeSnippetProps {
    return { ...this.props };
  }
}
