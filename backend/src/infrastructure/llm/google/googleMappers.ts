import { randomUUID } from "node:crypto";
import type { Content, FunctionDeclaration, GenerateContentResponse, Part } from "@google/genai";
import type { LlmMessage, LlmToolCall } from "@domain/llm/value-objects/LlmMessage.js";
import type { LlmToolDefinition } from "@domain/llm/value-objects/LlmToolDefinition.js";

export function toGoogleTool(tool: LlmToolDefinition): FunctionDeclaration {
  return {
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: tool.inputSchema,
  };
}

/**
 * Convierte un LlmMessage de dominio a un Content de Gemini.
 *
 * Gemini no tiene un rol "tool" separado: el resultado de una tool call va
 * como un Content con role "user" conteniendo un Part.functionResponse.
 *
 * Los mensajes ASSISTANT con providerBlocks presentes (siempre que vengan
 * de una respuesta previa de ESTE mismo proveedor) reenvían esos Parts
 * verbatim — incluye los parts de thought con su thoughtSignature, que se
 * invalida si se editan o se reconstruyen desde el texto normalizado. Solo
 * se reconstruye desde texto/toolCalls cuando no hay providerBlocks
 * (fallback de replay entre proveedores distintos, p. ej. una sesión que
 * arrancó con otro provider).
 */
export function toGoogleContent(message: LlmMessage): Content {
  if (message.role === "tool") {
    const result = message.toolResult;
    if (!result) {
      throw new Error("LlmMessage con role=tool sin toolResult");
    }
    const part: Part = {
      functionResponse: {
        name: result.name,
        response: { output: result.output, ...(result.isError ? { error: true } : {}) },
      },
    };
    return { role: "user", parts: [part] };
  }

  if (message.role === "assistant") {
    if (message.providerBlocks) {
      return { role: "model", parts: message.providerBlocks as Part[] };
    }
    const parts: Part[] = [];
    if (message.text) parts.push({ text: message.text });
    for (const call of message.toolCalls ?? []) {
      parts.push({ functionCall: { name: call.name, args: call.input as Record<string, unknown> } });
    }
    return { role: "model", parts };
  }

  return { role: "user", parts: [{ text: message.text ?? "" }] };
}

/**
 * Extrae el texto (excluyendo los parts de thought) y las tool calls de una
 * respuesta de Gemini, más los Parts crudos (para persistir como
 * providerBlocks). Gemini no siempre asigna un id a cada FunctionCall — se
 * genera uno sintético para satisfacer LlmToolCall.id.
 */
export function fromGoogleResponse(response: GenerateContentResponse): {
  text: string;
  toolCalls: LlmToolCall[];
  providerBlocks: Part[];
} {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  let text = "";
  const toolCalls: LlmToolCall[] = [];

  for (const part of parts) {
    if (part.text && !part.thought) {
      text += part.text;
    }
    if (part.functionCall) {
      toolCalls.push({
        id: part.functionCall.id ?? randomUUID(),
        name: part.functionCall.name ?? "",
        input: part.functionCall.args ?? {},
      });
    }
  }

  return { text, toolCalls, providerBlocks: parts };
}
