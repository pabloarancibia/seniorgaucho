import type { LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";

export type PracticeChatSessionStatus = "ACTIVE" | "ARCHIVED";

export interface PracticeChatSessionProps {
  id: string;
  lessonId: string;
  topicSlug: string;
  status: PracticeChatSessionStatus;
  providerKey: LlmProviderKey;
  model: string;
  locale: string;
  startedAt: Date;
  lastActivityAt: Date;
}

/**
 * Sesión de chat con IA para un tema (topicSlug) de una lección. Puede haber
 * varias sesiones ARCHIVED por (lessonId, topicSlug) a lo largo del tiempo —
 * cambiar de proveedor (p. ej. por cuota agotada) archiva la sesión ACTIVE
 * actual y arranca una nueva en vez de mezclar proveedores en un mismo
 * transcript (ver StartPracticeChatSessionUseCase).
 */
export class PracticeChatSession {
  private constructor(private readonly props: PracticeChatSessionProps) {}

  static reconstitute(props: PracticeChatSessionProps): PracticeChatSession {
    return new PracticeChatSession(props);
  }

  get id(): string {
    return this.props.id;
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get topicSlug(): string {
    return this.props.topicSlug;
  }

  get status(): PracticeChatSessionStatus {
    return this.props.status;
  }

  get providerKey(): LlmProviderKey {
    return this.props.providerKey;
  }

  get model(): string {
    return this.props.model;
  }

  get locale(): string {
    return this.props.locale;
  }

  get isActive(): boolean {
    return this.props.status === "ACTIVE";
  }

  toPrimitives(): PracticeChatSessionProps {
    return { ...this.props };
  }
}
