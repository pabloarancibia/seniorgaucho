"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

const MIN_PERCENT = 25;
const MAX_PERCENT = 75;
const KEYBOARD_STEP = 2;

function clamp(percent: number): number {
  return Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent));
}

interface ResizableSplitPaneProps {
  first: ReactNode;
  second: ReactNode;
  /**
   * Namespacea las claves de localStorage — necesario para poder anidar dos
   * instancias en la misma pantalla (p. ej. la pantalla de práctica: un
   * split afuera para enunciado+chat vs. código, y uno adentro para
   * enunciado vs. chat) sin que ambas compartan el mismo estado persistido.
   */
  id?: string;
  /** % inicial del primer panel. Default 50 (comportamiento histórico). */
  defaultFirstPercent?: number;
  /**
   * Si se muestra el botón de ocultar/mostrar el segundo panel. Default
   * true. Ponelo en false cuando el segundo panel no es "el editor de
   * código" — el botón y su texto ("Ocultar panel de código") asumen eso.
   */
  allowHideSecond?: boolean;
  /**
   * "horizontal" (default) = paneles lado a lado, arrastre en X, se apila
   * verticalmente en mobile (`lg:` breakpoint). "vertical" = paneles
   * apilados arriba/abajo siempre, arrastre en Y — no hay distinción
   * mobile/desktop porque ya está apilado.
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * Dual-pane con divisor arrastrable: mueve el mouse para aumentar/reducir
 * el espacio de un panel vs. el otro (en X si `orientation="horizontal"`,
 * en Y si `"vertical"`). El tamaño elegido se recuerda entre sesiones.
 * Ocupa el 100% de la altura de su contenedor (`h-full`) — quien lo monta
 * es responsable de darle una altura real (ver PracticeScreen.tsx), para
 * poder anidar una instancia dentro de otra sin que cada una recalcule el
 * viewport de nuevo.
 *
 * El corte mobile/desktop (solo aplica a `orientation="horizontal"`) se
 * resuelve con media queries de CSS (`lg:`), no con JS: así el primer
 * render del servidor ya es correcto — un chequeo de `window.matchMedia`
 * en un efecto solo sabría la respuesta después de hidratar, mostrando el
 * layout apilado un instante de más en desktop.
 */
export function ResizableSplitPane({
  first,
  second,
  id,
  defaultFirstPercent = 50,
  allowHideSecond = true,
  orientation = "horizontal",
}: ResizableSplitPaneProps) {
  const isVertical = orientation === "vertical";
  const storageKey = useMemo(() => `seniorgaucho:split-pane-percent${id ? `:${id}` : ""}`, [id]);
  const hiddenKey = useMemo(() => `seniorgaucho:split-pane-right-hidden${id ? `:${id}` : ""}`, [id]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [firstPercent, setFirstPercent] = useState(defaultFirstPercent);
  const [dragging, setDragging] = useState(false);
  const [secondHidden, setSecondHidden] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(stored) && stored >= MIN_PERCENT && stored <= MAX_PERCENT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync inicial desde localStorage, no un external store subscribible
      setFirstPercent(stored);
    }
    if (allowHideSecond) {
      setSecondHidden(window.localStorage.getItem(hiddenKey) === "1");
    }
  }, [storageKey, hiddenKey, allowHideSecond]);

  const toggleSecondHidden = useCallback(() => {
    setSecondHidden((current) => {
      const next = !current;
      window.localStorage.setItem(hiddenKey, next ? "1" : "0");
      return next;
    });
  }, [hiddenKey]);

  const persist = useCallback(
    (percent: number) => {
      window.localStorage.setItem(storageKey, String(percent));
    },
    [storageKey]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const percent = isVertical
        ? ((event.clientY - rect.top) / rect.height) * 100
        : ((event.clientX - rect.left) / rect.width) * 100;
      setFirstPercent(clamp(percent));
    },
    [isVertical]
  );

  const stopDragging = useCallback(() => {
    setDragging(false);
    setFirstPercent((current) => {
      persist(current);
      return current;
    });
  }, [persist]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    document.body.style.cursor = isVertical ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, handlePointerMove, stopDragging, isVertical]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const decreaseKey = isVertical ? "ArrowUp" : "ArrowLeft";
      const increaseKey = isVertical ? "ArrowDown" : "ArrowRight";

      if (event.key === decreaseKey) {
        setFirstPercent((current) => {
          const next = clamp(current - KEYBOARD_STEP);
          persist(next);
          return next;
        });
      } else if (event.key === increaseKey) {
        setFirstPercent((current) => {
          const next = clamp(current + KEYBOARD_STEP);
          persist(next);
          return next;
        });
      } else if (event.key === "Home") {
        setFirstPercent(defaultFirstPercent);
        persist(defaultFirstPercent);
      }
    },
    [persist, defaultFirstPercent, isVertical]
  );

  const resetToDefault = useCallback(() => {
    setFirstPercent(defaultFirstPercent);
    persist(defaultFirstPercent);
  }, [persist, defaultFirstPercent]);

  const paneSizes = {
    "--first-size": secondHidden ? "100%" : `${firstPercent}%`,
    "--second-size": secondHidden ? "0%" : `${100 - firstPercent}%`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      style={paneSizes}
      className={
        isVertical
          ? "relative flex h-full min-h-0 flex-col overflow-hidden"
          : "relative flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden"
      }
    >
      <div
        className={
          isVertical
            ? "h-[var(--first-size)] min-h-0 min-w-0 overflow-y-auto"
            : "min-h-0 w-full min-w-0 lg:h-full lg:w-[var(--first-size)] lg:overflow-y-auto"
        }
      >
        {first}
      </div>

      {!secondHidden && (
        <div
          role="separator"
          aria-orientation={isVertical ? "horizontal" : "vertical"}
          aria-label="Redimensionar paneles"
          aria-valuenow={Math.round(firstPercent)}
          aria-valuemin={MIN_PERCENT}
          aria-valuemax={MAX_PERCENT}
          tabIndex={0}
          onPointerDown={() => setDragging(true)}
          onKeyDown={handleKeyDown}
          onDoubleClick={resetToDefault}
          title="Arrastrá para redimensionar. Doble click para restablecer."
          className={
            isVertical
              ? "group relative flex h-6 shrink-0 cursor-row-resize items-center justify-center focus:outline-none"
              : "group relative hidden w-6 shrink-0 cursor-col-resize items-center justify-center focus:outline-none lg:flex"
          }
        >
          <div
            className={
              isVertical
                ? "h-1 w-10 rounded-full bg-border transition-colors group-hover:bg-accent group-focus-visible:bg-accent"
                : "h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-accent group-focus-visible:bg-accent"
            }
          />
          {allowHideSecond && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleSecondHidden();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              title="Ocultar panel de código"
              className="absolute top-4 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-bg text-fg-muted shadow-sm transition-colors hover:border-accent hover:text-accent"
            >
              <span aria-hidden>›</span>
              <span className="sr-only">Ocultar panel de código</span>
            </button>
          )}
        </div>
      )}

      {!secondHidden && (
        <div
          className={
            isVertical
              ? "h-[var(--second-size)] min-h-0 min-w-0 overflow-hidden"
              : "h-full w-full min-w-0 lg:h-full lg:w-[var(--second-size)] lg:overflow-hidden"
          }
        >
          {second}
        </div>
      )}

      {allowHideSecond && secondHidden && (
        <button
          type="button"
          onClick={toggleSecondHidden}
          title="Mostrar panel de código"
          className="fixed top-1/2 right-0 z-10 hidden -translate-y-1/2 items-center gap-1.5 rounded-l-lg border border-r-0 border-border bg-bg-subtle px-2 py-4 text-xs font-medium text-fg-muted shadow-md transition-colors hover:border-accent hover:text-accent lg:flex"
          style={{ writingMode: "vertical-rl" }}
        >
          <span aria-hidden className="rotate-180">
            ‹
          </span>
          Código
        </button>
      )}
    </div>
  );
}
