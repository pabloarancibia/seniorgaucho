import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { Hint, type HintProps } from "@/components/lesson/Hint";

interface ExerciseProps {
  title: string;
  language: "python" | "typescript";
  /** Prosa del enunciado + cero o más <Hint> con pistas progresivas. */
  children: ReactNode;
}

const LANGUAGE_LABEL: Record<ExerciseProps["language"], string> = {
  python: "🐍 Python",
  typescript: "🟦 TypeScript",
};

export function Exercise({ title, language, children }: ExerciseProps) {
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
    <div className="not-prose my-4 rounded-lg border border-dashed border-accent/50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-semibold">✏️ {title}</span>
        <span className="shrink-0 text-xs text-fg-muted">{LANGUAGE_LABEL[language]}</span>
      </div>
      <div className="space-y-2 text-sm leading-relaxed">{content}</div>
    </div>
  );
}
