"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ResizableSplitPane } from "@/components/layout/ResizableSplitPane";
import { PracticeStatementPanel } from "@/components/lesson/PracticeStatementPanel";
import { PracticeCodeEditorPanel } from "@/components/editor/PracticeCodeEditorPanel";
import { PracticeChatPanel } from "@/components/practiceTutor/PracticeChatPanel";
import { ActiveExerciseProvider } from "@/lib/practiceTutor/ActiveExerciseContext";

interface PracticeScreenProps {
  lessonId: string;
  lessonSlug: string;
  topicSlug: string;
  statementEs: ReactNode;
  statementEn: ReactNode | null;
  /** Código de arranque/tests por exerciseId (ver extractStarterCodeByExercise) — precarga el editor al activar un ejercicio. */
  starterCodeByExerciseId: Record<string, string>;
  /** Todos los exerciseId de este tema, por locale (ver page.tsx — no se mergean, el id difiere por título traducido). */
  topicExerciseIdsEs: string[];
  topicExerciseIdsEn: string[];
}

/**
 * Client wrapper de la pantalla de práctica: derecha = código (columna
 * entera); izquierda apilada verticalmente = enunciado (60%) arriba, chat
 * de IA (40%) abajo — dos ResizableSplitPane anidados, cada uno con su
 * propia barra deslizante. También comparte, vía `ActiveExerciseProvider`:
 * - qué ejercicio está desplegado/activo (escrito por Exercise.tsx, leído
 *   por PracticeChatPanel y PracticeCodeEditorPanel).
 * - el lenguaje seleccionado (`selectedLanguage`, mismo valor que el tab
 *   Python/TypeScript del editor) — lo escribe PracticeCodeEditorPanel, lo
 *   leen Exercise.tsx (filtro de idioma) y PracticeChatPanel (contexto del
 *   mentor). Vive en el Context, no acá, porque lo necesitan 3 consumidores
 *   sin relación padre-hijo directa entre sí.
 *
 * `currentCode` SÍ se levanta acá (no en el Context): cambia en cada
 * tecleo, y solo lo necesita PracticeChatPanel — meterlo en el mismo
 * Context que consume Exercise.tsx re-renderizaría todo el enunciado en
 * cada tecleo.
 */
export function PracticeScreen({
  lessonId,
  lessonSlug,
  topicSlug,
  statementEs,
  statementEn,
  starterCodeByExerciseId,
  topicExerciseIdsEs,
  topicExerciseIdsEn,
}: PracticeScreenProps) {
  const { t } = useLocale();
  const [currentCode, setCurrentCode] = useState("");

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
        <ActiveExerciseProvider lessonId={lessonId}>
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
                second={<PracticeChatPanel lessonId={lessonId} topicSlug={topicSlug} currentCode={currentCode} />}
              />
            }
            second={
              <PracticeCodeEditorPanel
                lessonId={lessonId}
                topicSlug={topicSlug}
                starterCodeByExerciseId={starterCodeByExerciseId}
                topicExerciseIdsEs={topicExerciseIdsEs}
                topicExerciseIdsEn={topicExerciseIdsEn}
                onCodeChange={setCurrentCode}
              />
            }
          />
        </ActiveExerciseProvider>
      </div>
    </div>
  );
}
