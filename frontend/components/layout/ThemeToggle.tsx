"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function ThemeToggle() {
  const { t } = useLocale();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:text-fg"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
