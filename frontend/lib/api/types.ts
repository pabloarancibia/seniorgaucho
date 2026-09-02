export interface Lesson {
  id: string;
  slug: string;
  title: string;
  mdxContent: string;
  /** Traducción al inglés, null hasta que se cargue. */
  titleEn: string | null;
  mdxContentEn: string | null;
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

export interface QuizAnswer {
  id: string;
  lessonId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ExerciseCompletion {
  id: string;
  lessonId: string;
  exerciseId: string;
  completed: boolean;
  completedAt: string;
}

export interface PracticeCodeSnippet {
  id: string;
  lessonId: string;
  topicSlug: string;
  exerciseId: string;
  language: CodeLanguage;
  codeContent: string;
  updatedAt: string;
}

export type LlmProviderKey = "anthropic" | "google" | "fake";

export interface LlmProvidersResponse {
  available: LlmProviderKey[];
  default: LlmProviderKey;
}

export type PracticeChatSessionStatus = "ACTIVE" | "ARCHIVED";

export interface PracticeChatSession {
  id: string;
  lessonId: string;
  topicSlug: string;
  status: PracticeChatSessionStatus;
  providerKey: LlmProviderKey;
  model: string;
  locale: string;
  startedAt: string;
  lastActivityAt: string;
}

export type PracticeChatRole = "USER" | "ASSISTANT";

export interface PracticeChatMessage {
  id: string;
  sessionId: string;
  sequence: number;
  role: PracticeChatRole;
  text: string;
  providerBlocks: unknown | null;
  createdAt: string;
}

export type PracticeChatIntent = "hint" | "explain" | "free";

/** Eventos del stream SSE de POST /practice-sessions/:sessionId/messages. */
export type PracticeChatEvent =
  | { type: "token"; text: string }
  | { type: "done"; message: PracticeChatMessage }
  | { type: "error"; code: string; message: string };
