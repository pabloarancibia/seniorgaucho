"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useProviderPreference } from "@/lib/llm/ProviderPreferenceProvider";
import { usePracticeChatSession } from "@/lib/practiceTutor/usePracticeChatSession";
import { useActiveExercise } from "@/lib/practiceTutor/ActiveExerciseContext";
import { ProviderSelect } from "@/components/layout/ProviderSelect";
import { MessageList } from "@/components/practiceTutor/MessageList";
import { QuickActions } from "@/components/practiceTutor/QuickActions";
import { ChatComposer } from "@/components/practiceTutor/ChatComposer";

interface PracticeChatPanelProps {
  lessonId: string;
  topicSlug: string;
  /** Código actual del editor (PracticeCodeEditorPanel), para dar contexto al mentor. */
  currentCode: string;
}

/**
 * Panel derecho de la pantalla de práctica: chat con IA (multi-LLM) para
 * pistas, explicaciones y preguntas libres sobre el tema activo. Ve el
 * código actual del editor en cada mensaje (currentCode, prop) y el
 * lenguaje seleccionado (selectedLanguage, del ActiveExerciseContext — lo
 * escribe PracticeCodeEditorPanel) — ver usePracticeChatSession.sendMessage.
 */
export function PracticeChatPanel({ lessonId, topicSlug, currentCode }: PracticeChatPanelProps) {
  const { locale, t } = useLocale();
  const { providerKey } = useProviderPreference();
  const { activeExerciseId, selectedLanguage } = useActiveExercise() ?? {
    activeExerciseId: undefined,
    selectedLanguage: "python" as const,
  };
  const { session, messages, loading, isStreaming, streamingText, error, sendMessage } = usePracticeChatSession(
    lessonId,
    topicSlug,
    locale,
    providerKey
  );

  const disabled = loading || isStreaming || !session;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-4 py-2.5">
        <span className="text-sm font-medium text-fg-muted">{t("chat.title")}</span>
        <ProviderSelect />
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-fg-muted">{t("chat.loading")}</div>
      ) : (
        <>
          <MessageList messages={messages} streamingText={streamingText} isStreaming={isStreaming} />
          {error && <p className="border-t border-border px-4 py-2 text-xs text-red-500">{error}</p>}
          <QuickActions
            disabled={disabled}
            onSelect={(text, intent) =>
              sendMessage(text, currentCode, selectedLanguage, intent, activeExerciseId ?? undefined)
            }
          />
          <ChatComposer
            disabled={disabled}
            onSend={(text) => sendMessage(text, currentCode, selectedLanguage, "free", activeExerciseId ?? undefined)}
          />
        </>
      )}
    </div>
  );
}
