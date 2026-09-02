"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import type { CodeLanguage } from "@/lib/api/types";

interface ActiveExercise {
  id: string;
  title: string;
  language: CodeLanguage;
}

interface ActiveExerciseContextValue {
  activeExerciseId: string | null;
  activeExerciseTitle: string | null;
  activeExerciseLanguage: CodeLanguage | null;
  setActiveExercise: (id: string, title: string, language: CodeLanguage) => void;
  /**
   * Lenguaje seleccionado en la pantalla de práctica — mismo valor que
   * maneja el tab Python/TypeScript del editor. Vive acá (no como estado
   * local de PracticeCodeEditorPanel) porque también lo necesita
   * PracticeStatementPanel/Exercise.tsx para filtrar qué ejercicios mostrar.
   */
  selectedLanguage: CodeLanguage;
  setSelectedLanguage: (language: CodeLanguage) => void;
  /**
   * Estado de completitud de TODOS los ejercicios de la lección
   * (exerciseId -> completed), fuente única para el checkbox manual, el
   * badge de auto-grading y el rollup "X/Y ejercicios" — ver
   * PracticeScreen.tsx (un solo fetch al montar) en vez de que cada
   * <Exercise> se auto-fetchee por separado.
   */
  completionsByExerciseId: Record<string, boolean>;
  /** Actualiza el Context (optimista) y persiste contra el backend. */
  setCompletion: (exerciseId: string, completed: boolean) => void;
}

const ActiveExerciseContext = createContext<ActiveExerciseContextValue | null>(null);

/**
 * Qué ejercicio está "en curso" en la pantalla de práctica — lo escribe
 * `Exercise.tsx` al desplegarse (ver su `onToggle`), lo lee
 * `PracticeChatPanel` para mandárselo al mentor de IA en cada mensaje
 * (`SendPracticeChatMessageUseCase` lo usa para armar el system prompt con
 * el detalle completo de ESE ejercicio en vez de listar todos) y
 * `PracticeCodeEditorPanel` para precargar el código de arranque/tests de
 * ese ejercicio puntual. Un único Context en vez de prop-drilling porque
 * enunciado, editor y chat son paneles hermanos en PracticeScreen.tsx, no
 * hay una relación padre-hijo directa entre quien escribe y quien lee.
 *
 * Activar un ejercicio de OTRO lenguaje también cambia `selectedLanguage`
 * — mantiene el tab del editor y el filtro del enunciado coherentes con lo
 * que se acaba de abrir.
 */
export function ActiveExerciseProvider({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const [active, setActive] = useState<ActiveExercise | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>("python");
  const [completionsByExerciseId, setCompletionsByExerciseId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api
      .listExerciseCompletions(lessonId)
      .then((completions) => {
        setCompletionsByExerciseId(Object.fromEntries(completions.map((c) => [c.exerciseId, c.completed])));
      })
      .catch(() => {
        // Sin estado previo persistido, arranca sin marcar nada.
      });
  }, [lessonId]);

  const setActiveExercise = useCallback((id: string, title: string, language: CodeLanguage) => {
    setActive({ id, title, language });
    setSelectedLanguage(language);
  }, []);

  const setCompletion = useCallback(
    (exerciseId: string, completed: boolean) => {
      setCompletionsByExerciseId((prev) => ({ ...prev, [exerciseId]: completed }));
      api.submitExerciseCompletion(lessonId, exerciseId, completed).catch(() => {
        // Falla silenciosa: el estado optimista ya refleja la intención del
        // usuario; un refresh eventualmente resincroniza con el backend.
      });
    },
    [lessonId]
  );

  const value = useMemo(
    () => ({
      activeExerciseId: active?.id ?? null,
      activeExerciseTitle: active?.title ?? null,
      activeExerciseLanguage: active?.language ?? null,
      setActiveExercise,
      selectedLanguage,
      setSelectedLanguage,
      completionsByExerciseId,
      setCompletion,
    }),
    [active, setActiveExercise, selectedLanguage, completionsByExerciseId, setCompletion]
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
