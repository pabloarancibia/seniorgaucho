"use client";

import { useProviderPreference } from "@/lib/llm/ProviderPreferenceProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LlmProviderKey } from "@/lib/api/types";

const LABEL_KEY: Record<LlmProviderKey, string> = {
  fake: "provider.label.fake",
  google: "provider.label.google",
  anthropic: "provider.label.anthropic",
};

/**
 * Selector de proveedor LLM para el chat de práctica. Vive en el header del
 * panel de chat (no en el nav global) porque solo importa donde hay chat de
 * IA. Auto-oculto con menos de 2 proveedores configurados — con uno solo no
 * hay nada para elegir. Cambiar de proveedor acá archiva la sesión de chat
 * activa y arranca una nueva (ver usePracticeChatSession) — es el flujo de
 * "cambiar de proveedor si uno se queda sin cuota".
 */
export function ProviderSelect() {
  const { t } = useLocale();
  const { providerKey, setProviderKey, availableProviders } = useProviderPreference();

  if (availableProviders.length < 2 || !providerKey) return null;

  return (
    <label className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent">
      <span className="sr-only">{t("provider.select.label")}</span>
      <select
        value={providerKey}
        onChange={(e) => setProviderKey(e.target.value as LlmProviderKey)}
        className="bg-transparent outline-none"
        aria-label={t("provider.select.label")}
      >
        {availableProviders.map((key) => (
          <option key={key} value={key}>
            {t(LABEL_KEY[key])}
          </option>
        ))}
      </select>
    </label>
  );
}
