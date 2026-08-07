"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { type Locale, dictionaries, locales } from "@/lib/i18n/dictionaries";

const STORAGE_KEY = "seniorgaucho:locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useLayoutEffect(() => {
    // localStorage no existe en el server; sincronizar el locale persistido
    // solo puede pasar acá, después del render inicial en "es". useLayoutEffect
    // (no useEffect) para que corra antes del primer paint y minimizar el
    // flash de idioma si el usuario tiene "en" guardado.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync inicial desde localStorage, no un external store subscribible
      setLocaleState(stored as Locale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "es" ? "en" : "es");
  }, [locale, setLocale]);

  const t = useCallback((key: string) => dictionaries[locale][key] ?? key, [locale]);

  const value = useMemo(() => ({ locale, setLocale, toggleLocale, t }), [locale, setLocale, toggleLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale debe usarse dentro de <LocaleProvider>");
  }
  return ctx;
}
