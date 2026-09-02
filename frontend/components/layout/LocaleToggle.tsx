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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent text-xs font-bold text-accent-fg shadow-md transition-all hover:scale-105 hover:shadow-lg"
    >
      {locale === "es" ? "ES" : "EN"}
    </button>
  );
}
