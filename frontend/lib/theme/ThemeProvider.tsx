"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme/constants";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // "dark" coincide con el default estático de <html data-theme="dark"> en
  // layout.tsx, para que el primer render en cliente no dispare un mismatch
  // de hidratación.
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    // Corre antes del primer paint: sincroniza con localStorage y también
    // resetea el atributo que React/Strict-Mode pudo limpiar en dev al
    // remontar. No-op en producción. Ver:
    // node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync inicial con localStorage/DOM, no un external store subscribible
    setTheme((current) => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      const resolved = stored ?? current;
      document.documentElement.setAttribute("data-theme", resolved);
      return resolved;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return ctx;
}
