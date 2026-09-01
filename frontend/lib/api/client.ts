import type {
  CodeLanguage,
  ExerciseCompletion,
  Lesson,
  LlmProviderKey,
  LlmProvidersResponse,
  PracticeChatMessage,
  PracticeChatSession,
  PracticeCodeSnippet,
  Progress,
  ProgressStatus,
  QuizAnswer,
} from "@/lib/api/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code: string; message: string } } | null;
    throw new ApiError(body?.error?.message ?? res.statusText, res.status, body?.error?.code ?? "UNKNOWN");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  listLessons: () => request<Lesson[]>("/lessons"),
  getLesson: (slug: string) => request<Lesson>(`/lessons/${encodeURIComponent(slug)}`),

  getProgress: (lessonId: string) => request<Progress>(`/lessons/${lessonId}/progress`),
  upsertProgress: (lessonId: string, status: ProgressStatus) =>
    request<Progress>(`/lessons/${lessonId}/progress`, { method: "PUT", body: JSON.stringify({ status }) }),

  listQuizAnswers: (lessonId: string) => request<QuizAnswer[]>(`/lessons/${lessonId}/quiz-answers`),
  submitQuizAnswer: (lessonId: string, questionId: string, selectedOption: string, isCorrect: boolean) =>
    request<QuizAnswer>(`/lessons/${lessonId}/quiz-answers/${encodeURIComponent(questionId)}`, {
      method: "PUT",
      body: JSON.stringify({ selectedOption, isCorrect }),
    }),

  listExerciseCompletions: (lessonId: string) =>
    request<ExerciseCompletion[]>(`/lessons/${lessonId}/exercise-completions`),
  submitExerciseCompletion: (lessonId: string, exerciseId: string, completed: boolean) =>
    request<ExerciseCompletion>(`/lessons/${lessonId}/exercise-completions/${encodeURIComponent(exerciseId)}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    }),

  getPracticeCodeSnippet: (lessonId: string, topicSlug: string, language: CodeLanguage) =>
    request<PracticeCodeSnippet | null>(
      `/lessons/${lessonId}/practice-code-snippets/${encodeURIComponent(topicSlug)}/${language}`
    ),
  savePracticeCodeSnippet: (lessonId: string, topicSlug: string, language: CodeLanguage, codeContent: string) =>
    request<PracticeCodeSnippet>(
      `/lessons/${lessonId}/practice-code-snippets/${encodeURIComponent(topicSlug)}/${language}`,
      { method: "PUT", body: JSON.stringify({ codeContent }) }
    ),

  listLlmProviders: () => request<LlmProvidersResponse>("/llm-providers"),

  startPracticeChatSession: (lessonId: string, topicSlug: string, providerKey?: LlmProviderKey, locale?: string) =>
    request<PracticeChatSession>(`/lessons/${lessonId}/practice-sessions`, {
      method: "POST",
      body: JSON.stringify({ topicSlug, providerKey, locale }),
    }),
  getPracticeChatSession: (lessonId: string, sessionId: string) =>
    request<{ session: PracticeChatSession; messages: PracticeChatMessage[] }>(
      `/lessons/${lessonId}/practice-sessions/${sessionId}`
    ),
};
