export interface Lesson {
  id: string;
  slug: string;
  title: string;
  mdxContent: string;
  language: "es" | "en";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProgressStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Progress {
  id: string;
  lessonId: string;
  status: ProgressStatus;
  lastAccessed: string;
}

export type CodeLanguage = "python" | "typescript";

export interface CodeSnippet {
  id: string;
  lessonId: string;
  language: CodeLanguage;
  codeContent: string;
  updatedAt: string;
}

export interface QuizAnswer {
  id: string;
  lessonId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  answeredAt: string;
}
