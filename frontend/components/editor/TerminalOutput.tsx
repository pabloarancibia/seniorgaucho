"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ExecutionResult } from "@/lib/execution/types";

interface TerminalOutputProps {
  result: ExecutionResult | null;
}

export function TerminalOutput({ result }: TerminalOutputProps) {
  const { t } = useLocale();

  return (
    <div className="flex h-full flex-col border-t border-border">
      <div className="border-b border-border px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {t("editor.output")}
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
