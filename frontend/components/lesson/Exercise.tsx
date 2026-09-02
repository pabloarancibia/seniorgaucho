"use client";

import { Children, cloneElement, isValidElement, useState, type ReactNode } from "react";
import { Hint, type HintProps } from "@/components/lesson/Hint";
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
  /**
   * Código de arranque/tests de TODOS los ejercicios del tema (inyectado
   * por mdxComponents en modo práctica) — si el propio exerciseId está acá,
   * el ejercicio tiene `<ExerciseStarter>` con check() y su completitud se
   * calcula sola (ver PracticeCodeEditorPanel.handleRun), sin checkbox.
   */
  starterCodeByExerciseId?: Record<string, string>;
}

const LANGUAGE_LABEL: Record<ExerciseProps["language"], string> = {
  python: "🐍 Python",
  typescript: "🟦 TypeScript",
};

/**
 * Reescrito (2026-09-02) para separar por completo dos controles que antes
 * compartían el mismo `<summary>` nativo: abrir/cerrar el enunciado, y
 * marcar el ejercicio como completado. Con `<details>/<summary>`, un click
 * en el checkbox SIEMPRE disparaba también el toggle nativo del browser
 * (event.stopPropagation() solo frena el bubbling sintético de React hacia
 * onToggle, no el listener nativo del browser sobre el click crudo en
 * summary) — por eso acá el disclosure es 100% controlado (`useState`, sin
 * <details>) y el checkbox/badge vive como hermano del botón que abre/
 * cierra, no anidado adentro.
 */
export function Exercise({
  title,
  language,
  children,
  mode = "practice",
  starterCodeByExerciseId,
}: ExerciseProps) {
  // Ver slugify.ts: id derivado del title, no un id explícito en el MDX.
  const exerciseId = slugify(title);
  const [open, setOpen] = useState(false);
  const activeExercise = useActiveExercise();

  if (mode === "theory") return null;
  // Filtro de lenguaje (tabs Python/TypeScript del editor, ver
  // ActiveExerciseContext): un ejercicio del lenguaje no seleccionado no
  // se muestra. `activeExercise` solo falta si por algún motivo no hay
  // Provider en modo práctica — no debería pasar, pero no bloquea el render.
  if (activeExercise && activeExercise.selectedLanguage !== language) return null;

  const hasTests = Boolean(starterCodeByExerciseId?.[exerciseId]);
  const completed = activeExercise?.completionsByExerciseId[exerciseId] ?? false;

  const handleOpenToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) activeExercise?.setActiveExercise(exerciseId, title, language);
  };

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
    <div
      className={[
        "not-prose my-4 overflow-hidden rounded-xl border transition-colors",
        completed ? "border-accent-secondary/60 bg-accent-secondary/5" : "border-dashed border-accent/50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={handleOpenToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left font-semibold"
        >
          <span
            className={["flex h-4 w-4 shrink-0 items-center justify-center text-fg-muted transition-transform", open ? "rotate-90" : ""].join(
              " "
            )}
            aria-hidden
          >
            ▸
          </span>
          <span className="truncate">✏️ {title}</span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {hasTests ? (
            <span
              className={[
                "rounded-full px-2 py-0.5 text-xs font-medium",
                completed ? "bg-accent-secondary/15 text-accent-secondary" : "bg-border/40 text-fg-muted",
              ].join(" ")}
              title={completed ? "Tests pasando" : "Corré tu código para completar"}
            >
              {completed ? "✅" : "⏳"}
            </span>
          ) : (
            <input
              type="checkbox"
              checked={completed}
              onChange={(event) => activeExercise?.setCompletion(exerciseId, event.target.checked)}
              aria-label={`Marcar "${title}" como completado`}
              className="h-4 w-4 accent-accent-secondary"
            />
          )}
          <span className="text-xs text-fg-muted">{LANGUAGE_LABEL[language]}</span>
        </div>
      </div>
      {open && <div className="accordion-content space-y-2 px-4 pb-4 text-sm leading-relaxed">{content}</div>}
    </div>
  );
}
