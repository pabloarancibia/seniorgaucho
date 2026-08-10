"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

const STORAGE_KEY = "seniorgaucho:split-pane-percent";
const MIN_PERCENT = 25;
const MAX_PERCENT = 75;
const DEFAULT_PERCENT = 50;
const KEYBOARD_STEP = 2;

function clamp(percent: number): number {
  return Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent));
}

interface ResizableSplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

/**
 * Dual-pane con divisor arrastrable: mueve el mouse a izquierda/derecha
 * para aumentar/reducir el espacio del panel de teoría vs. el editor. El
 * ancho elegido se recuerda entre sesiones.
 *
 * El corte mobile/desktop se resuelve con media queries de CSS (`lg:`), no
 * con JS: así el primer render del servidor ya es correcto — un chequeo de
 * `window.matchMedia` en un efecto solo sabría la respuesta después de
 * hidratar, mostrando el layout apilado un instante de más en desktop.
 */
export function ResizableSplitPane({ left, right }: ResizableSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(DEFAULT_PERCENT);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored >= MIN_PERCENT && stored <= MAX_PERCENT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync inicial desde localStorage, no un external store subscribible
      setLeftPercent(stored);
    }
  }, []);

  const persist = useCallback((percent: number) => {
    window.localStorage.setItem(STORAGE_KEY, String(percent));
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setLeftPercent(clamp(((event.clientX - rect.left) / rect.width) * 100));
  }, []);

  const stopDragging = useCallback(() => {
    setDragging(false);
    setLeftPercent((current) => {
      persist(current);
      return current;
    });
  }, [persist]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, handlePointerMove, stopDragging]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        setLeftPercent((current) => {
          const next = clamp(current - KEYBOARD_STEP);
          persist(next);
          return next;
        });
      } else if (event.key === "ArrowRight") {
        setLeftPercent((current) => {
          const next = clamp(current + KEYBOARD_STEP);
          persist(next);
          return next;
        });
      } else if (event.key === "Home") {
        setLeftPercent(DEFAULT_PERCENT);
        persist(DEFAULT_PERCENT);
      }
    },
    [persist]
  );

  const resetToDefault = useCallback(() => {
    setLeftPercent(DEFAULT_PERCENT);
    persist(DEFAULT_PERCENT);
  }, [persist]);

  const paneWidths = {
    "--left-width": `${leftPercent}%`,
    "--right-width": `${100 - leftPercent}%`,
  } as CSSProperties;

  return (
    <div ref={containerRef} style={paneWidths} className="flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="w-full min-w-0 border-b border-border p-6 lg:w-[var(--left-width)] lg:overflow-y-auto lg:border-b-0">
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar paneles"
        aria-valuenow={Math.round(leftPercent)}
        aria-valuemin={MIN_PERCENT}
        aria-valuemax={MAX_PERCENT}
        tabIndex={0}
        onPointerDown={() => setDragging(true)}
        onKeyDown={handleKeyDown}
        onDoubleClick={resetToDefault}
        title="Arrastrá para redimensionar. Doble click para restablecer."
        className="group hidden w-2 shrink-0 cursor-col-resize items-center justify-center focus:outline-none lg:flex"
      >
        <div className="h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-accent group-focus-visible:bg-accent" />
      </div>
      <div className="h-full w-full min-w-0 lg:h-full lg:w-[var(--right-width)] lg:overflow-hidden">{right}</div>
    </div>
  );
}
