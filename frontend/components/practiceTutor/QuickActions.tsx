"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { PracticeChatIntent } from "@/lib/api/types";

interface QuickActionsProps {
  onSelect: (text: string, intent: PracticeChatIntent) => void;
  disabled: boolean;
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const { t } = useLocale();

  const actions: { label: string; text: string; intent: PracticeChatIntent }[] = [
    { label: t("chat.quickHint"), text: t("chat.quickHintText"), intent: "hint" },
    { label: t("chat.quickExplain"), text: t("chat.quickExplainText"), intent: "explain" },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action.text, action.intent)}
          className="rounded-full border border-border bg-bg-subtle px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
