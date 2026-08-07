export interface CodeSnippetProps {
  id: string;
  lessonId: string;
  language: string;
  codeContent: string;
  updatedAt: Date;
}

export class CodeSnippet {
  private constructor(private readonly props: CodeSnippetProps) {}

  static reconstitute(props: CodeSnippetProps): CodeSnippet {
    return new CodeSnippet(props);
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get language(): string {
    return this.props.language;
  }

  get codeContent(): string {
    return this.props.codeContent;
  }

  toPrimitives(): CodeSnippetProps {
    return { ...this.props };
  }
}
