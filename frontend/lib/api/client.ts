import type { CodeLanguage, CodeSnippet, Lesson, Progress, ProgressStatus, QuizAnswer } from "@/lib/api/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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

  getCodeSnippet: (lessonId: string, language: CodeLanguage) =>
    request<CodeSnippet | null>(`/lessons/${lessonId}/code-snippets/${language}`),
  saveCodeSnippet: (lessonId: string, language: CodeLanguage, codeContent: string) =>
    request<CodeSnippet>(`/lessons/${lessonId}/code-snippets/${language}`, {
      method: "PUT",
      body: JSON.stringify({ codeContent }),
    }),

  listQuizAnswers: (lessonId: string) => request<QuizAnswer[]>(`/lessons/${lessonId}/quiz-answers`),
  submitQuizAnswer: (lessonId: string, questionId: string, selectedOption: string, isCorrect: boolean) =>
    request<QuizAnswer>(`/lessons/${lessonId}/quiz-answers/${encodeURIComponent(questionId)}`, {
      method: "PUT",
      body: JSON.stringify({ selectedOption, isCorrect }),
    }),
};
