export type PracticeChatRole = "USER" | "ASSISTANT";

export interface PracticeChatMessageProps {
  id: string;
  sessionId: string;
  sequence: number;
  role: PracticeChatRole;
  text: string;
  /**
   * Bloques crudos del proveedor (p. ej. content[] de Anthropic, incluidos
   * thinking blocks). Opaco para el dominio — se reenvía verbatim al mismo
   * proveedor que lo generó si la sesión sigue con ese proveedor; ver
   * AnthropicLlmProvider/GoogleLlmProvider para el porqué.
   */
  providerBlocks: unknown | null;
  createdAt: Date;
}

export class PracticeChatMessage {
  private constructor(private readonly props: PracticeChatMessageProps) {}

  static reconstitute(props: PracticeChatMessageProps): PracticeChatMessage {
    return new PracticeChatMessage(props);
  }

  get sequence(): number {
    return this.props.sequence;
  }

  get role(): PracticeChatRole {
    return this.props.role;
  }

  get text(): string {
    return this.props.text;
  }

  get providerBlocks(): unknown | null {
    return this.props.providerBlocks;
  }

  toPrimitives(): PracticeChatMessageProps {
    return { ...this.props };
  }
}
