"use client";

import { useState, type KeyboardEvent } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ChatComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const { t } = useLocale();
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-1.5 border-t border-border p-2.5">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={t("chat.composerPlaceholder")}
        rows={2}
        className="flex-1 resize-none rounded-xl border border-border bg-bg px-2.5 py-1.5 text-sm text-fg outline-none transition-colors focus:border-accent disabled:opacity-50"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        aria-label={t("chat.send")}
        title={t("chat.send")}
      >
        ➤
      </button>
    </div>
  );
}
