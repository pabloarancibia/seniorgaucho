import type Anthropic from "@anthropic-ai/sdk";
import type { LlmMessage, LlmToolCall } from "@domain/llm/value-objects/LlmMessage.js";
import type { LlmToolDefinition } from "@domain/llm/value-objects/LlmToolDefinition.js";

export function toAnthropicTool(tool: LlmToolDefinition): Anthropic.Tool {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
    ...(tool.strict !== undefined ? { strict: tool.strict } : {}),
  };
}

/**
 * Convierte un LlmMessage de dominio a un MessageParam de Anthropic.
 *
 * Los mensajes ASSISTANT con providerBlocks presentes (siempre que vengan
 * de una respuesta previa de ESTE mismo proveedor) reenvían esos bloques
 * verbatim — incluye los thinking blocks, cuya firma se invalida si se
 * editan o se reconstruyen desde el texto normalizado. Solo se reconstruye
 * desde texto/toolCalls cuando no hay providerBlocks (fallback de
 * replay entre proveedores distintos).
 */
export function toAnthropicMessage(message: LlmMessage): Anthropic.MessageParam {
  if (message.role === "tool") {
    const result = message.toolResult;
    if (!result) {
      throw new Error("LlmMessage con role=tool sin toolResult");
    }
    const block: Anthropic.ToolResultBlockParam = {
      type: "tool_result",
      tool_use_id: result.toolCallId,
      content: JSON.stringify(result.output),
      ...(result.isError !== undefined ? { is_error: result.isError } : {}),
    };
    return { role: "user", content: [block] };
  }

  if (message.role === "assistant") {
    if (message.providerBlocks) {
      return { role: "assistant", content: message.providerBlocks as Anthropic.ContentBlockParam[] };
    }
    const blocks: Anthropic.ContentBlockParam[] = [];
    if (message.text) blocks.push({ type: "text", text: message.text });
    for (const call of message.toolCalls ?? []) {
      blocks.push({ type: "tool_use", id: call.id, name: call.name, input: call.input });
    }
    return { role: "assistant", content: blocks };
  }

  return { role: "user", content: message.text ?? "" };
}

/**
 * Extrae el texto y las tool calls de un Message final de Anthropic, más
 * los content blocks crudos (para persistir como providerBlocks).
 */
export function fromAnthropicMessage(message: Anthropic.Message): {
  text: string;
  toolCalls: LlmToolCall[];
  providerBlocks: Anthropic.ContentBlock[];
} {
  let text = "";
  const toolCalls: LlmToolCall[] = [];

  for (const block of message.content) {
    if (block.type === "text") {
      text += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({ id: block.id, name: block.name, input: block.input });
    }
  }

  return { text, toolCalls, providerBlocks: message.content };
}
