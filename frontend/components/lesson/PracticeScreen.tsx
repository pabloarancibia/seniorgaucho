"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ResizableSplitPane } from "@/components/layout/ResizableSplitPane";
import { PracticeStatementPanel } from "@/components/lesson/PracticeStatementPanel";
import { PracticeCodeEditorPanel } from "@/components/editor/PracticeCodeEditorPanel";
import { PracticeChatPanel } from "@/components/practiceTutor/PracticeChatPanel";
import { ActiveExerciseProvider } from "@/lib/practiceTutor/ActiveExerciseContext";
import type { CodeLanguage } from "@/lib/api/types";

interface PracticeScreenProps {
  lessonId: string;
  lessonSlug: string;
  topicSlug: string;
  statementEs: ReactNode;
  statementEn: ReactNode | null;
}

/**
 * Client wrapper de la pantalla de práctica: derecha = código (columna
 * entera); izquierda apilada verticalmente = enunciado (60%) arriba, chat
 * de IA (40%) abajo — dos ResizableSplitPane anidados, cada uno con su
 * propia barra deslizante. También comparte, vía Context:
 * - `ActiveExerciseProvider`: qué ejercicio está desplegado/activo,
 *   escrito por Exercise.tsx y leído por PracticeChatPanel.
 * - código/lenguaje actuales del editor (estado propio acá, reportado por
 *   PracticeCodeEditorPanel vía onCodeChange): el chat lo necesita como
 *   contexto en cada mensaje (ver PracticeTutorPromptBuilder).
 */
export function PracticeScreen({ lessonId, lessonSlug, topicSlug, statementEs, statementEn }: PracticeScreenProps) {
  const { t } = useLocale();
  const [currentCode, setCurrentCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<CodeLanguage>("python");

  const handleCodeChange = useCallback((code: string, language: CodeLanguage) => {
    setCurrentCode(code);
    setCurrentLanguage(language);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="shrink-0 border-b border-border bg-bg-subtle px-4 py-2">
        <Link
          href={`/lessons/${lessonSlug}#${topicSlug}`}
          className="text-sm text-accent underline underline-offset-2"
        >
          {t("practice.backToTheory")}
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <ActiveExerciseProvider>
          <ResizableSplitPane
            id="practice-outer"
            orientation="horizontal"
            first={
              <ResizableSplitPane
                id="practice-statement-chat"
                orientation="vertical"
                defaultFirstPercent={60}
                allowHideSecond={false}
                first={<PracticeStatementPanel statementEs={statementEs} statementEn={statementEn} />}
                second={
                  <PracticeChatPanel
                    lessonId={lessonId}
                    topicSlug={topicSlug}
                    currentCode={currentCode}
                    currentLanguage={currentLanguage}
                  />
                }
              />
            }
            second={
              <PracticeCodeEditorPanel lessonId={lessonId} topicSlug={topicSlug} onCodeChange={handleCodeChange} />
            }
          />
        </ActiveExerciseProvider>
      </div>
    </div>
  );
}
