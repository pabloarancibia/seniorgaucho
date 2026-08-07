"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePyodide } from "@/lib/execution/usePyodide";
import { useWebContainer } from "@/lib/execution/useWebContainer";
import { TerminalOutput } from "@/components/editor/TerminalOutput";
import { api } from "@/lib/api/client";
import type { CodeLanguage, ProgressStatus } from "@/lib/api/types";
import type { ExecutionResult } from "@/lib/execution/types";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STARTER_CODE: Record<CodeLanguage, string> = {
  python: 'print("Hello, SeniorGaucho!")\n',
  typescript: 'console.log("Hello, SeniorGaucho!");\n',
};

const LANGUAGES: CodeLanguage[] = ["python", "typescript"];

interface CodeEditorPanelProps {
  lessonId: string;
}

export function CodeEditorPanel({ lessonId }: CodeEditorPanelProps) {
  const { t } = useLocale();
  const { resolvedTheme } = useTheme();
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
    api
      .getCodeSnippet(lessonId, activeLanguage)
      .then((snippet) => {
        if (snippet) {
          setCodeByLanguage((prev) => ({ ...prev, [activeLanguage]: snippet.codeContent }));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadedLanguages((prev) => new Set(prev).add(activeLanguage));
      });
  }, [lessonId, activeLanguage, loadedLanguages]);

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
      await api.saveCodeSnippet(lessonId, activeLanguage, codeByLanguage[activeLanguage]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [lessonId, activeLanguage, codeByLanguage]);

  const handleMarkCompleted = useCallback(async () => {
    const progress = await api.upsertProgress(lessonId, "COMPLETED");
    setProgressStatus(progress.status);
  }, [lessonId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLanguage(lang)}
              className={[
                "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
                activeLanguage === lang ? "bg-accent text-accent-fg" : "text-fg-muted hover:text-fg",
              ].join(" ")}
            >
              {lang}
            </button>
          ))}
        </div>
        <span className="text-xs text-fg-muted">{t(`lesson.status.${progressStatus.toLowerCase()}`)}</span>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={activeLanguage}
          value={codeByLanguage[activeLanguage]}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          onChange={(value) => setCodeByLanguage((prev) => ({ ...prev, [activeLanguage]: value ?? "" }))}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />
      </div>

      <div className="h-40 shrink-0">
        <TerminalOutput result={result} />
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60"
        >
          {running ? t("editor.running") : t("editor.run")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          {saving ? t("editor.saving") : saved ? t("editor.saved") : t("editor.save")}
        </button>
        <button
          type="button"
          onClick={handleMarkCompleted}
          disabled={progressStatus === "COMPLETED"}
          className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          {progressStatus === "COMPLETED" ? t("editor.completed") : t("editor.markCompleted")}
        </button>
      </div>
    </div>
  );
}
