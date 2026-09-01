"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface ActiveExerciseContextValue {
  activeExerciseId: string | null;
  activeExerciseTitle: string | null;
  setActiveExercise: (id: string, title: string) => void;
}

const ActiveExerciseContext = createContext<ActiveExerciseContextValue | null>(null);

/**
 * Qué ejercicio está "en curso" en la pantalla de práctica — lo escribe
 * `Exercise.tsx` al desplegarse (ver su `onToggle`), lo lee
 * `PracticeChatPanel` para mandárselo al mentor de IA en cada mensaje
 * (`SendPracticeChatMessageUseCase` lo usa para armar el system prompt con
 * el detalle completo de ESE ejercicio en vez de listar todos). Un único
 * Context en vez de prop-drilling porque enunciado y chat son paneles
 * hermanos en PracticeScreen.tsx, no hay una relación padre-hijo directa
 * entre quien escribe y quien lee.
 */
export function ActiveExerciseProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<{ id: string; title: string } | null>(null);

  const setActiveExercise = useCallback((id: string, title: string) => {
    setActive({ id, title });
  }, []);

  const value = useMemo(
    () => ({
      activeExerciseId: active?.id ?? null,
      activeExerciseTitle: active?.title ?? null,
      setActiveExercise,
    }),
    [active, setActiveExercise]
  );

  return <ActiveExerciseContext.Provider value={value}>{children}</ActiveExerciseContext.Provider>;
}

/**
 * A diferencia de otros hooks de Context de esta app, NO tira si falta el
 * Provider: `Exercise.tsx` es el mismo componente en modo teoría (sin
 * Provider — MdxContent en /lessons/[slug]/page.tsx no lo envuelve) y en
 * modo práctica (con Provider — ver PracticeScreen.tsx), y en teoría
 * retorna null de entrada, así que este hook debe poder no-opear ahí.
 */
export function useActiveExercise(): ActiveExerciseContextValue | null {
  return useContext(ActiveExerciseContext);
}
