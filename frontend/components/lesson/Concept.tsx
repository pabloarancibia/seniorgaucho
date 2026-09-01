import type { ReactNode } from "react";

interface ConceptProps {
  title: string;
  language?: "python" | "typescript";
  children: ReactNode;
}

const LANGUAGE_LABEL: Record<NonNullable<ConceptProps["language"]>, string> = {
  python: "🐍 Python",
  typescript: "🟦 TypeScript",
};

/**
 * Panel de refuerzo colapsado por default: explicación básica de un
 * concepto que la lección da por sabido, para no interrumpir el flujo de
 * quien ya lo domina pero sí ayudar a quien lo olvidó. <details> nativo:
 * sin JS ni estado de React, funciona server-rendered.
 */
export function Concept({ title, language, children }: ConceptProps) {
  return (
    <details className="not-prose group my-4 overflow-hidden rounded-xl border border-border bg-bg-subtle transition-shadow open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium transition-colors hover:bg-border/30 [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-border/60 text-xs text-fg-muted transition-transform group-open:rotate-90 group-open:bg-accent group-open:text-accent-fg"
          aria-hidden
        >
          ▸
        </span>
        <span>📖 {title}</span>
        {language && <span className="ml-auto shrink-0 text-xs text-fg-muted">{LANGUAGE_LABEL[language]}</span>}
      </summary>
      <div className="accordion-content space-y-2 border-t border-border px-4 py-3 text-sm leading-relaxed">
        {children}
      </div>
    </details>
  );
}
