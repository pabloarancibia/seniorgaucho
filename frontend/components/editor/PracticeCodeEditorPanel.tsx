"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePyodide } from "@/lib/execution/usePyodide";
import { useWebContainer } from "@/lib/execution/useWebContainer";
import { TerminalOutput } from "@/components/editor/TerminalOutput";
import { clearDraft, readDraft, writeDraft } from "@/lib/editor/draftStorage";
import { api } from "@/lib/api/client";
import type { CodeLanguage, ProgressStatus } from "@/lib/api/types";
import type { ExecutionResult } from "@/lib/execution/types";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STARTER_CODE: Record<CodeLanguage, string> = {
  python: 'print("Hello, SeniorGaucho!")\n',
  typescript: 'console.log("Hello, SeniorGaucho!");\n',
};

const LANGUAGES: CodeLanguage[] = ["python", "typescript"];

interface PracticeCodeEditorPanelProps {
  lessonId: string;
  topicSlug: string;
  /** Notifica el código/lenguaje activos en cada cambio — el chat de práctica los usa como contexto. */
  onCodeChange?: (code: string, language: CodeLanguage) => void;
}

/**
 * Evolución de lo que era CodeEditorPanel: ahora vive en la pantalla de
 * práctica de un tema puntual, no en la lección entera — el buffer de
 * código, el borrador local y el snippet persistido se scopean por
 * (lessonId, topicSlug) en vez de solo lessonId. "Marcar como completada"
 * sigue siendo a nivel lección (Progress no tiene noción de tema). El
 * enunciado del ejercicio ya no vive acá — es su propia columna,
 * PracticeStatementPanel — así que el editor ocupa toda la altura de la suya.
 */
export function PracticeCodeEditorPanel({ lessonId, topicSlug, onCodeChange }: PracticeCodeEditorPanelProps) {
  const { t } = useLocale();
  const { theme } = useTheme();
  const pyodide = usePyodide();
  const webcontainer = useWebContainer();

  const [activeLanguage, setActiveLanguage] = useState<CodeLanguage>("python");
  const [codeByLanguage, setCodeByLanguage] = useState<Record<CodeLanguage, string>>(STARTER_CODE);
  const [loadedLanguages, setLoadedLanguages] = useState<Set<CodeLanguage>>(new Set());
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>("PENDING");

  useEffect(() => {
    api
      .getProgress(lessonId)
      .then((progress) => setProgressStatus(progress.status))
      .catch(() => {});
  }, [lessonId]);

  useEffect(() => {
    if (loadedLanguages.has(activeLanguage)) return;

    // El borrador local (si existe) es más reciente que cualquier snippet
    // guardado en el backend, porque se escribe en cada edición sin
    // necesidad de click en "Guardar". Gana por sobre el backend.
    const draft = readDraft(lessonId, topicSlug, activeLanguage);
    if (draft !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync inicial desde localStorage, no un external store subscribible
      setCodeByLanguage((prev) => ({ ...prev, [activeLanguage]: draft }));
      setLoadedLanguages((prev) => new Set(prev).add(activeLanguage));
      return;
    }

    api
      .getPracticeCodeSnippet(lessonId, topicSlug, activeLanguage)
      .then((snippet) => {
        if (snippet) {
          setCodeByLanguage((prev) => ({ ...prev, [activeLanguage]: snippet.codeContent }));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadedLanguages((prev) => new Set(prev).add(activeLanguage));
      });
  }, [lessonId, topicSlug, activeLanguage, loadedLanguages]);

  const activeCode = codeByLanguage[activeLanguage];

  useEffect(() => {
    onCodeChange?.(activeCode, activeLanguage);
  }, [activeCode, activeLanguage, onCodeChange]);

  useEffect(() => {
    // No pisar el draft mientras todavía se está cargando el valor inicial.
    if (!loadedLanguages.has(activeLanguage)) return;
    const timeout = setTimeout(() => writeDraft(lessonId, topicSlug, activeLanguage, activeCode), 500);
    return () => clearTimeout(timeout);
  }, [lessonId, topicSlug, activeLanguage, activeCode, loadedLanguages]);

  const persistToBackend = useCallback(
    async (language: CodeLanguage, code: string) => {
      await api.savePracticeCodeSnippet(lessonId, topicSlug, language, code);
      // Ya quedó persistido en el backend, el borrador local deja de ser necesario.
      clearDraft(lessonId, topicSlug, language);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [lessonId, topicSlug]
  );

  useEffect(() => {
    // Guardado automático y permanente contra el backend (no solo el
    // borrador local): si volvés a este tema en otro navegador o
    // dispositivo, tu código sigue ahí sin que hayas tocado "Guardar".
    if (!loadedLanguages.has(activeLanguage)) return;
    const timeout = setTimeout(() => {
      persistToBackend(activeLanguage, activeCode).catch(() => {
        // Sin conexión o error del backend: el borrador local en
        // localStorage sigue como red de seguridad, no se pierde nada.
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [activeLanguage, activeCode, loadedLanguages, persistToBackend]);

  const runner = activeLanguage === "python" ? pyodide : webcontainer;

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      setResult(await runner.run(codeByLanguage[activeLanguage]));
    } catch (error) {
      setResult({ output: String(error), success: false });
    } finally {
      setRunning(false);
    }
  }, [runner, codeByLanguage, activeLanguage]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await persistToBackend(activeLanguage, codeByLanguage[activeLanguage]);
    } finally {
      setSaving(false);
    }
  }, [activeLanguage, codeByLanguage, persistToBackend]);

  const handleResetOutput = useCallback(() => setResult(null), []);

  const handleMarkCompleted = useCallback(async () => {
    const progress = await api.upsertProgress(lessonId, "COMPLETED");
    setProgressStatus(progress.status);
  }, [lessonId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-3 py-2.5">
        <div className="flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLanguage(lang)}
              className={[
                "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all",
                activeLanguage === lang
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "text-fg-muted hover:bg-border/40 hover:text-fg",
              ].join(" ")}
            >
              {lang}
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-fg-muted">{t(`lesson.status.${progressStatus.toLowerCase()}`)}</span>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={activeLanguage}
          value={codeByLanguage[activeLanguage]}
          theme={theme === "dark" ? "vs-dark" : "light"}
          onChange={(value) => setCodeByLanguage((prev) => ({ ...prev, [activeLanguage]: value ?? "" }))}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />
      </div>

      <div className="h-40 shrink-0">
        <TerminalOutput result={result} onReset={handleResetOutput} />
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        >
          {running ? t("editor.running") : t("editor.run")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {saving ? t("editor.saving") : saved ? t("editor.saved") : t("editor.save")}
        </button>
        <button
          type="button"
          onClick={handleMarkCompleted}
          disabled={progressStatus === "COMPLETED"}
          className="ml-auto rounded-full border border-accent-secondary/50 px-4 py-2 text-sm font-medium text-accent-secondary transition-colors hover:bg-accent-secondary/10 disabled:opacity-60"
        >
          {progressStatus === "COMPLETED" ? t("editor.completed") : t("editor.markCompleted")}
        </button>
      </div>
    </div>
  );
}
