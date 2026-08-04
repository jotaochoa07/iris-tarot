import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

let cached: Anthropic | null = null;

export function anthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new IrisConfigError(
      "Falta ANTHROPIC_API_KEY. IRIS no puede generar lecturas sin ella.",
    );
  }
  cached ??= new Anthropic({ apiKey: key });
  return cached;
}

export class IrisConfigError extends Error {}
export class IrisModelError extends Error {}

export const MODEL_READING =
  process.env.IRIS_MODEL_READING || "claude-opus-5";
export const MODEL_VISION = process.env.IRIS_MODEL_VISION || "claude-sonnet-5";

type Block = Anthropic.Messages.ContentBlockParam;

interface JsonCallOptions<T> {
  model: string;
  system: string;
  content: Block[];
  schema: z.ZodType<T>;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Llamada al modelo con salida JSON validada.
 *
 * Prellenamos la respuesta con «{» para forzar JSON puro, y validamos con zod.
 * Si el esquema no se cumple, fallamos de forma explícita: es preferible un
 * error visible a una lectura malformada mostrada como si fuera correcta.
 */
export async function jsonCall<T>({
  model,
  system,
  content,
  schema,
  maxTokens = 4000,
  temperature = 0.7,
}: JsonCallOptions<T>): Promise<T> {
  const res = await anthropic().messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [
      { role: "user", content },
      { role: "assistant", content: "{" },
    ],
  });

  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  const raw = "{" + text;
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new IrisModelError("El modelo no devolvió JSON interpretable.");
    }
    try {
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      throw new IrisModelError("El modelo no devolvió JSON interpretable.");
    }
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new IrisModelError(
      `La respuesta no cumple el esquema esperado: ${result.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
}
