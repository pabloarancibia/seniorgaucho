"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LocaleToggle() {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <button
      type="button"
      aria-label={t("locale.toggle")}
      title={t("locale.toggle")}
      onClick={toggleLocale}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
    >
      {locale === "es" ? "ES" : "EN"}
    </button>
  );
}
