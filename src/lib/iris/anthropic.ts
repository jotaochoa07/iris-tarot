import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

let cached: Anthropic | null = null;

/**
 * Destino de la API.
 *
 * Se fija de forma explícita a propósito. El SDK lee `ANTHROPIC_BASE_URL` del
 * entorno si existe, y una variable puesta a nivel de sistema por otro proyecto
 * —un proxy, OpenRouter— desviaría silenciosamente todas las llamadas de IRIS.
 * Para apuntar a otro sitio hay que declararlo aquí, con esta variable propia.
 */
export const ANTHROPIC_BASE_URL =
  process.env.IRIS_ANTHROPIC_BASE_URL || "https://api.anthropic.com";

export function anthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new IrisConfigError(
      "Falta ANTHROPIC_API_KEY. IRIS no puede generar lecturas sin ella.",
    );
  }
  cached ??= new Anthropic({ apiKey: key, baseURL: ANTHROPIC_BASE_URL });
  return cached;
}

export class IrisConfigError extends Error {}
export class IrisModelError extends Error {}

/**
 * Extrae el primer objeto JSON completo de un texto.
 *
 * Recorre contando llaves y respetando cadenas y escapes, para que un `{` o un
 * `}` dentro de una frase interpretativa no rompa el corte. Devuelve undefined
 * si no hay ningún objeto válido.
 */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  if (start === -1) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}

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
}: JsonCallOptions<T>): Promise<T> {
  // Ni `temperature` ni prefill de asistente: los modelos actuales rechazan
  // ambos. La disciplina de JSON queda enteramente en el prompt, y aquí
  // extraemos el objeto de la respuesta sea cual sea el envoltorio.
  const res = await anthropic().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
  });

  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const parsed = extractJson(cleaned);
  if (parsed === undefined) {
    console.error("[IRIS] sin JSON en la respuesta:", cleaned.slice(0, 1200));
    throw new IrisModelError("El modelo no devolvió JSON interpretable.");
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error("[IRIS] respuesta fuera de esquema:", cleaned.slice(0, 1200));
    throw new IrisModelError(
      `La respuesta no cumple el esquema esperado: ${result.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
}
