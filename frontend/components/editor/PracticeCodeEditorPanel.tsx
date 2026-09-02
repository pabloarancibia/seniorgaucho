"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePyodide } from "@/lib/execution/usePyodide";
import { useWebContainer } from "@/lib/execution/useWebContainer";
import { useActiveExercise } from "@/lib/practiceTutor/ActiveExerciseContext";
import { TerminalOutput } from "@/components/editor/TerminalOutput";
import { ResizableSplitPane } from "@/components/layout/ResizableSplitPane";
import { clearDraft, readDraft, writeDraft } from "@/lib/editor/draftStorage";
import { parseTestSummary } from "@/lib/editor/parseTestSummary";
import { api } from "@/lib/api/client";
import type { CodeLanguage } from "@/lib/api/types";
import type { ExecutionResult } from "@/lib/execution/types";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STARTER_CODE: Record<CodeLanguage, string> = {
  python: 'print("Hello, SeniorGaucho!")\n',
  typescript: 'console.log("Hello, SeniorGaucho!");\n',
};

const LANGUAGES: CodeLanguage[] = ["python", "typescript"];

/** Buffer sin ningún ejercicio desplegado todavía — mismo comportamiento que antes de existir el código por ejercicio. */
const DEFAULT_EXERCISE_ID = "_default";

interface PracticeCodeEditorPanelProps {
  lessonId: string;
  topicSlug: string;
  /** Código de arranque/tests por exerciseId (ver extractStarterCodeByExercise) — fallback antes que STARTER_CODE genérico. */
  starterCodeByExerciseId: Record<string, string>;
  /** Todos los exerciseId de este tema, por locale — ver comentario en el prop de más abajo. */
  topicExerciseIdsEs: string[];
  topicExerciseIdsEn: string[];
  /** Notifica el código actual en cada cambio — el chat de práctica lo usa como contexto. */
  onCodeChange?: (code: string) => void;
}

/**
 * Evolución de lo que era CodeEditorPanel: vive en la pantalla de práctica
 * de un tema puntual, y el buffer de código (draft local + snippet
 * persistido) se scopea por (lessonId, topicSlug, exerciseId, language) —
 * cada ejercicio activo (ver ActiveExerciseContext) tiene su propio
 * código, no uno compartido para todo el tema. El lenguaje seleccionado
 * (`selectedLanguage`) también vive en ese Context, no acá — lo necesitan
 * Exercise.tsx (filtro) y PracticeChatPanel además de este panel; activar
 * un ejercicio de otro lenguaje lo cambia automáticamente (ver el Context).
 * El progreso ya no es un flag manual a nivel lección (el viejo `Progress`
 * quedó sin uso, ver [[project_seniorgaucho]]) — se deriva de
 * `completionsByExerciseId` (Context), cruzado contra `topicExerciseIds`.
 */
export function PracticeCodeEditorPanel({
  lessonId,
  topicSlug,
  starterCodeByExerciseId,
  topicExerciseIdsEs,
  topicExerciseIdsEn,
  onCodeChange,
}: PracticeCodeEditorPanelProps) {
  const { t, locale } = useLocale();
  const { theme } = useTheme();
  const pyodide = usePyodide();
  const webcontainer = useWebContainer();
  const activeExercise = useActiveExercise();

  // El exerciseId sale de slugify(title) y el título SÍ está traducido, así
  // que el mismo ejercicio tiene un id distinto en cada locale — no se
  // puede mergear ES+EN acá (contaría cada ejercicio dos veces). Se elige
  // la lista del locale actual, con fallback a ES si esa lección todavía no
  // tiene traducción de este tema (mismo criterio que LessonTheory.tsx).
  const topicExerciseIds = locale === "en" && topicExerciseIdsEn.length > 0 ? topicExerciseIdsEn : topicExerciseIdsEs;

  const selectedLanguage = activeExercise?.selectedLanguage ?? "python";
  const setSelectedLanguage = activeExercise?.setSelectedLanguage;
  const codeExerciseId = activeExercise?.activeExerciseId ?? DEFAULT_EXERCISE_ID;
  const currentKey = `${topicSlug}:${codeExerciseId}:${selectedLanguage}`;

  const [code, setCode] = useState("");
  // Clave (topicSlug:exerciseId:language) cuyo código ya terminó de cargar
  // — evita pisar el buffer con el draft/snippet viejo mientras cambia de
  // ejercicio o de lenguaje.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const completionsByExerciseId = activeExercise?.completionsByExerciseId ?? {};
  const completedCount = topicExerciseIds.filter((id) => completionsByExerciseId[id]).length;
  const completionPercent =
    topicExerciseIds.length > 0 ? Math.round((completedCount / topicExerciseIds.length) * 100) : 0;

  useEffect(() => {
    if (loadedKey === currentKey) return;

    // El borrador local (si existe) es más reciente que cualquier snippet
    // guardado en el backend, porque se escribe en cada edición sin
    // necesidad de click en "Guardar". Gana por sobre el backend.
    const draft = readDraft(lessonId, topicSlug, codeExerciseId, selectedLanguage);
    if (draft !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync inicial desde localStorage, no un external store subscribible
      setCode(draft);
      setLoadedKey(currentKey);
      return;
    }

    api
      .getPracticeCodeSnippet(lessonId, topicSlug, codeExerciseId, selectedLanguage)
      .then((snippet) => {
        const fallback = starterCodeByExerciseId[codeExerciseId] ?? STARTER_CODE[selectedLanguage];
        setCode(snippet ? snippet.codeContent : fallback);
      })
      .catch(() => {
        setCode(starterCodeByExerciseId[codeExerciseId] ?? STARTER_CODE[selectedLanguage]);
      })
      .finally(() => {
        setLoadedKey(currentKey);
      });
  }, [lessonId, topicSlug, codeExerciseId, selectedLanguage, currentKey, loadedKey, starterCodeByExerciseId]);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  useEffect(() => {
    // No pisar el draft mientras todavía se está cargando el valor inicial.
    if (loadedKey !== currentKey) return;
    const timeout = setTimeout(() => writeDraft(lessonId, topicSlug, codeExerciseId, selectedLanguage, code), 500);
    return () => clearTimeout(timeout);
  }, [lessonId, topicSlug, codeExerciseId, selectedLanguage, code, loadedKey, currentKey]);

  const persistToBackend = useCallback(
    async (exerciseId: string, language: CodeLanguage, codeContent: string) => {
      await api.savePracticeCodeSnippet(lessonId, topicSlug, exerciseId, language, codeContent);
      // Ya quedó persistido en el backend, el borrador local deja de ser necesario.
      clearDraft(lessonId, topicSlug, exerciseId, language);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [lessonId, topicSlug]
  );

  useEffect(() => {
    // Guardado automático y permanente contra el backend (no solo el
    // borrador local): si volvés a este ejercicio en otro navegador o
    // dispositivo, tu código sigue ahí sin que hayas tocado "Guardar".
    if (loadedKey !== currentKey) return;
    const timeout = setTimeout(() => {
      persistToBackend(codeExerciseId, selectedLanguage, code).catch(() => {
        // Sin conexión o error del backend: el borrador local en
        // localStorage sigue como red de seguridad, no se pierde nada.
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [codeExerciseId, selectedLanguage, code, loadedKey, currentKey, persistToBackend]);

  const runner = selectedLanguage === "python" ? pyodide : webcontainer;

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      const runResult = await runner.run(code);
      setResult(runResult);
      // Auto-grading: si el ejercicio activo trae <ExerciseStarter> con
      // check() (ver parseTestSummary), su completitud se deriva de si
      // pasaron TODOS los tests en esta corrida — sin checkbox manual para
      // estos casos (ver Exercise.tsx). Corre en cada Ejecutar, así que
      // romper algo después de resolverlo también lo refleja.
      const isTestedExercise = codeExerciseId !== DEFAULT_EXERCISE_ID && codeExerciseId in starterCodeByExerciseId;
      if (isTestedExercise) {
        const summary = parseTestSummary(runResult.output);
        if (summary) {
          activeExercise?.setCompletion(codeExerciseId, summary.passed === summary.total);
        }
      }
    } catch (error) {
      setResult({ output: String(error), success: false });
    } finally {
      setRunning(false);
    }
  }, [runner, code, codeExerciseId, starterCodeByExerciseId, activeExercise]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await persistToBackend(codeExerciseId, selectedLanguage, code);
    } finally {
      setSaving(false);
    }
  }, [codeExerciseId, selectedLanguage, code, persistToBackend]);

  const handleResetOutput = useCallback(() => setResult(null), []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-2.5 py-2">
        <div className="flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLanguage?.(lang)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all",
                selectedLanguage === lang
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "text-fg-muted hover:bg-border/40 hover:text-fg",
              ].join(" ")}
            >
              {lang}
            </button>
          ))}
        </div>
        {topicExerciseIds.length > 0 && (
          <span className="text-xs font-medium text-fg-muted">
            {completedCount}/{topicExerciseIds.length} {t("editor.exercisesCompleted")} · {completionPercent}%
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <ResizableSplitPane
          id="practice-editor-output"
          orientation="vertical"
          defaultFirstPercent={75}
          allowHideSecond={false}
          first={
            <Editor
              height="100%"
              language={selectedLanguage}
              value={code}
              theme={theme === "dark" ? "vs-dark" : "light"}
              onChange={(value) => setCode(value ?? "")}
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
            />
          }
          second={<TerminalOutput result={result} onReset={handleResetOutput} />}
        />
      </div>

      <div className="flex items-center gap-1.5 border-t border-border p-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        >
          {running ? t("editor.running") : t("editor.run")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {saving ? t("editor.saving") : saved ? t("editor.saved") : t("editor.save")}
        </button>
      </div>
    </div>
  );
}
