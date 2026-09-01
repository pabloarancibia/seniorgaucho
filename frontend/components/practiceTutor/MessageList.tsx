"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { PracticeChatMessage } from "@/lib/api/types";

const BUBBLE_STYLES: Record<string, string> = {
  USER: "self-end bg-accent text-accent-fg",
  ASSISTANT: "self-start bg-bg-subtle text-fg border border-border",
};

interface MessageListProps {
  messages: PracticeChatMessage[];
  streamingText: string;
  isStreaming: boolean;
}

export function MessageList({ messages, streamingText, isStreaming }: MessageListProps) {
  const { t } = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streamingText]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.length === 0 && !isStreaming && <p className="text-sm text-fg-muted">{t("chat.empty")}</p>}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${BUBBLE_STYLES[message.role] ?? BUBBLE_STYLES.ASSISTANT}`}
        >
          {message.text}
        </div>
      ))}

      {isStreaming && (
        <div className="self-start max-w-[85%] rounded-2xl border border-border bg-bg-subtle px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-fg">
          {streamingText || <span className="text-fg-muted">{t("chat.thinking")}</span>}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
