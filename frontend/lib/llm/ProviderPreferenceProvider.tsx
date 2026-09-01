"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import { PROVIDER_STORAGE_KEY } from "@/lib/llm/constants";
import type { LlmProviderKey } from "@/lib/api/types";

interface ProviderPreferenceContextValue {
  providerKey: LlmProviderKey | undefined;
  setProviderKey: (key: LlmProviderKey) => void;
  availableProviders: LlmProviderKey[];
}

const ProviderPreferenceContext = createContext<ProviderPreferenceContextValue | null>(null);

/**
 * Preferencia de proveedor LLM (persistida en localStorage), compartida por
 * cualquier pantalla que tenga chat de práctica. `providerKey` arranca
 * undefined hasta resolver contra el backend qué proveedores están
 * disponibles — el ProviderSelect se queda oculto mientras tanto, y las
 * sesiones que arrancan sin providerKey usan el default del backend igual.
 */
export function ProviderPreferenceProvider({ children }: { children: ReactNode }) {
  const [providerKey, setProviderKeyState] = useState<LlmProviderKey | undefined>(undefined);
  const [availableProviders, setAvailableProviders] = useState<LlmProviderKey[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.listLlmProviders();
        if (cancelled) return;
        const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY) as LlmProviderKey | null;
        const resolved = stored && response.available.includes(stored) ? stored : response.default;
        setAvailableProviders(response.available);
        setProviderKeyState(resolved);
      } catch {
        // Si el backend no responde, el selector se queda oculto y las
        // sesiones siguen sin providerKey — no hay nada más que hacer acá.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setProviderKey = useCallback((key: LlmProviderKey) => {
    setProviderKeyState(key);
    window.localStorage.setItem(PROVIDER_STORAGE_KEY, key);
  }, []);

  const value = useMemo(
    () => ({ providerKey, setProviderKey, availableProviders }),
    [providerKey, setProviderKey, availableProviders]
  );

  return <ProviderPreferenceContext.Provider value={value}>{children}</ProviderPreferenceContext.Provider>;
}

export function useProviderPreference(): ProviderPreferenceContextValue {
  const ctx = useContext(ProviderPreferenceContext);
  if (!ctx) {
    throw new Error("useProviderPreference debe usarse dentro de <ProviderPreferenceProvider>");
  }
  return ctx;
}
