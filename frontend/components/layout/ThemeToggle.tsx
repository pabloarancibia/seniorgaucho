"use client";

import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ThemeToggle() {
  // resolvedTheme es undefined hasta que next-themes se hidrata en el cliente,
  // lo que evita mostrar el ícono equivocado durante el render del servidor.
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <button
      type="button"
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:text-fg"
    >
      {resolvedTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
