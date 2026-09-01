"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface PracticeStatementPanelProps {
  /** Subárbol MDX ya compilado (Exercise/Hint del tema activo) por idioma. */
  statementEs: ReactNode;
  statementEn: ReactNode | null;
}

/**
 * Panel del enunciado del ejercicio — extraído de PracticeCodeEditorPanel
 * para que sea su propia columna redimensionable (ver PracticeScreen.tsx).
 */
export function PracticeStatementPanel({ statementEs, statementEn }: PracticeStatementPanelProps) {
  const { locale } = useLocale();
  const showEnglish = locale === "en" && statementEn !== null;

  return <div className="h-full overflow-y-auto p-4">{showEnglish ? statementEn : statementEs}</div>;
}
