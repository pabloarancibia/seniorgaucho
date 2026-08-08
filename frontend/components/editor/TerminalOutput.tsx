"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ExecutionResult } from "@/lib/execution/types";

interface TerminalOutputProps {
  result: ExecutionResult | null;
  onReset: () => void;
}

export function TerminalOutput({ result, onReset }: TerminalOutputProps) {
  const { t } = useLocale();

  return (
    <div className="flex h-full flex-col border-t border-border">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">{t("editor.output")}</span>
        <button
          type="button"
          onClick={onReset}
          disabled={!result}
          aria-label={t("editor.output.reset")}
          title={t("editor.output.reset")}
          className="text-xs text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
        >
          {t("editor.output.reset")}
        </button>
      </div>
      <pre
        className={[
          "flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm",
          result && !result.success ? "text-red-400" : "text-fg",
        ].join(" ")}
      >
        {result ? result.output || " " : t("editor.output.empty")}
      </pre>
    </div>
  );
}
