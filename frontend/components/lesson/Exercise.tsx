import type { ReactNode } from "react";

interface ExerciseProps {
  title: string;
  language: "python" | "typescript";
  children: ReactNode;
}

const LANGUAGE_LABEL: Record<ExerciseProps["language"], string> = {
  python: "🐍 Python",
  typescript: "🟦 TypeScript",
};

export function Exercise({ title, language, children }: ExerciseProps) {
  return (
    <div className="not-prose my-4 rounded-lg border border-dashed border-accent/50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-semibold">✏️ {title}</span>
        <span className="shrink-0 text-xs text-fg-muted">{LANGUAGE_LABEL[language]}</span>
      </div>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
