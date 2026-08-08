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
    <details className="group my-2 rounded-md border border-border bg-bg px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-accent [&::-webkit-details-marker]:hidden">
        <span className="text-fg-muted transition-transform group-open:rotate-90" aria-hidden>
          ▸
        </span>
        💡 Pista {number}
      </summary>
      <div className="mt-2 space-y-2 border-t border-border pt-2 text-sm leading-relaxed">{children}</div>
    </details>
  );
}
