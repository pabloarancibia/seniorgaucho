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
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-fg-muted transition-all hover:border-accent hover:text-accent hover:scale-105"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
