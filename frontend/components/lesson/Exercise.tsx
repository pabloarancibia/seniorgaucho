"use client";

import { Children, cloneElement, isValidElement, useEffect, useState, type ReactNode } from "react";
import { Hint, type HintProps } from "@/components/lesson/Hint";
import { api } from "@/lib/api/client";
import { slugify } from "@/lib/lesson/slugify";
import { useActiveExercise } from "@/lib/practiceTutor/ActiveExerciseContext";

interface ExerciseProps {
  title: string;
  language: "python" | "typescript";
  /** Prosa del enunciado + cero o más <Hint> con pistas progresivas. */
  children: ReactNode;
  /** Inyectado por MdxContent, no lo pasa el autor del MDX. */
  lessonId?: string;
  /**
   * Inyectado por mdxComponents. En "theory" no se renderiza (los
   * ejercicios viven en la pantalla de práctica) — se resuelve DENTRO del
   * componente, no reemplazando a Exercise por () => null en el mapa de
   * mdxComponents, porque Section.tsx necesita poder seguir detectando
   * `child.type === Exercise` (mismo identity check) para decidir si
   * muestra el CTA "Practicá este tema" — un componente nulo distinto
   * rompería esa detección.
   */
  mode?: "theory" | "practice";
}

const LANGUAGE_LABEL: Record<ExerciseProps["language"], string> = {
  python: "🐍 Python",
  typescript: "🟦 TypeScript",
};

export function Exercise({ title, language, children, lessonId, mode = "practice" }: ExerciseProps) {
  // Ver slugify.ts: id derivado del title, no un id explícito en el MDX.
  const exerciseId = slugify(title);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const activeExercise = useActiveExercise();

  useEffect(() => {
    if (!lessonId || mode === "theory") return;
    api
      .listExerciseCompletions(lessonId)
      .then((completions) => {
        const previous = completions.find((c) => c.exerciseId === exerciseId);
        if (previous) setCompleted(previous.completed);
      })
      .catch(() => {
        // Sin estado previo persistido, arranca sin marcar.
      });
  }, [lessonId, exerciseId, mode]);

  const handleToggle = async (): Promise<void> => {
    const next = !completed;
    setCompleted(next);
    if (!lessonId) return;

    setSubmitting(true);
    try {
      await api.submitExerciseCompletion(lessonId, exerciseId, next);
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "theory") return null;

  // Reduce puro (sin variable mutable) para numerar los <Hint> en orden:
  // el compilador de React exige que el cuerpo del render no reasigne
  // variables locales.
  const { nodes: content } = Children.toArray(children).reduce<{ nodes: ReactNode[]; count: number }>(
    (acc, child) => {
      if (isValidElement<HintProps>(child) && child.type === Hint) {
        const count = acc.count + 1;
        return { nodes: [...acc.nodes, cloneElement(child, { number: count })], count };
      }
      return { nodes: [...acc.nodes, child], count: acc.count };
    },
    { nodes: [], count: 0 }
  );

  return (
    <details
      className={[
        "group not-prose my-4 overflow-hidden rounded-xl border p-4 transition-colors",
        completed ? "border-accent/60 bg-accent/5" : "border-dashed border-accent/50",
      ].join(" ")}
      onToggle={(event) => {
        if (event.currentTarget.open) activeExercise?.setActiveExercise(exerciseId, title);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <label
          className="flex cursor-pointer items-center gap-2 font-semibold"
          onClick={(event) => event.stopPropagation()}
        >
          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center text-fg-muted transition-transform group-open:rotate-90"
            aria-hidden
          >
            ▸
          </span>
          <input
            type="checkbox"
            checked={completed}
            disabled={submitting}
            onChange={handleToggle}
            aria-label={`Marcar "${title}" como completado`}
            className="h-4 w-4 accent-accent"
          />
          <span className={completed ? "text-fg-muted line-through" : ""}>✏️ {title}</span>
        </label>
        <span className="shrink-0 text-xs text-fg-muted">{LANGUAGE_LABEL[language]}</span>
      </summary>
      <div className="accordion-content space-y-2 pt-3 text-sm leading-relaxed">{content}</div>
    </details>
  );
}
