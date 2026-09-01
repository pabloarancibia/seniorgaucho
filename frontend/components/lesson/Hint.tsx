import type { ReactNode } from "react";

export interface HintProps {
  children: ReactNode;
  /** Inyectado por Exercise vía cloneElement — numera las pistas en orden. */
  number?: number;
}

/**
 * Pista progresiva dentro de un <Exercise>: oculta por default, un click la
 * expande. Se usan varias en secuencia (empujón conceptual -> estructura ->
 * solución casi completa) para no regalar la respuesta de una.
 */
export function Hint({ children, number }: HintProps) {
  return (
    <details className="group my-2 overflow-hidden rounded-lg border border-border bg-bg transition-shadow open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/5 [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center text-fg-muted transition-transform group-open:rotate-90 group-open:text-accent"
          aria-hidden
        >
          ▸
        </span>
        💡 Pista {number}
      </summary>
      <div className="accordion-content space-y-2 border-t border-border px-3 py-2 text-sm leading-relaxed">
        {children}
      </div>
    </details>
  );
}
