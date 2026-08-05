import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

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

const TOOL_NAME = "responder";

/**
 * Traduce el esquema de zod al que espera la API para una herramienta.
 *
 * Devuelve null si zod no puede convertirlo, y en ese caso la llamada vuelve al
 * modo texto. Vale la pena intentarlo siempre: cuando el esquema viaja en la
 * definición de la herramienta, la API garantiza la forma de la respuesta y
 * desaparece toda una familia de fallos.
 */
function toolSchemaFor(schema: z.ZodType): Record<string, unknown> | null {
  try {
    const json = z.toJSONSchema(schema, { io: "input" }) as Record<
      string,
      unknown
    >;
    delete json.$schema;
    return json.type === "object" ? json : null;
  } catch (e) {
    console.warn("[IRIS] esquema no convertible a JSON Schema:", e);
    return null;
  }
}

/**
 * Llamada al modelo con salida JSON validada.
 *
 * El JSON no se pide por escrito: se declara como herramienta y se obliga al
 * modelo a usarla. Así la estructura la impone la API y no la buena voluntad
 * del modelo, que era de donde venía el «no devolvió JSON interpretable».
 *
 * Queda una vía de reserva en texto por si un modelo no admite herramientas.
 * En ambos casos zod tiene la última palabra: es preferible un error visible a
 * una lectura malformada presentada como si estuviera bien.
 */
export async function jsonCall<T>({
  model,
  system,
  content,
  schema,
  maxTokens = 4000,
}: JsonCallOptions<T>): Promise<T> {
  const toolSchema = toolSchemaFor(schema as unknown as z.ZodType);

  // Ni `temperature` ni prefill de asistente: los modelos actuales rechazan
  // ambos.
  const res = await anthropic().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
    ...(toolSchema
      ? {
          tools: [
            {
              name: TOOL_NAME,
              description:
                "Entrega tu respuesta con esta estructura. Es la única forma de responder.",
              input_schema: toolSchema as Anthropic.Messages.Tool["input_schema"],
            },
          ],
          tool_choice: { type: "tool" as const, name: TOOL_NAME },
        }
      : {}),
  });

  const truncated = res.stop_reason === "max_tokens";

  const toolBlock = res.content.find((b) => b.type === "tool_use");
  let parsed: unknown = toolBlock?.type === "tool_use" ? toolBlock.input : undefined;
  let raw = "";

  if (parsed === undefined) {
    raw = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    parsed = extractJson(raw);
  }

  if (parsed === undefined) {
    console.error(
      `[IRIS] sin JSON en la respuesta (stop_reason=${res.stop_reason}, ` +
        `herramienta=${toolSchema ? "sí" : "no"}):`,
      raw.slice(0, 1200) || "(respuesta vacía)",
    );
    throw new IrisModelError(
      truncated
        ? "La respuesta se cortó por longitud antes de completarse. Prueba con una tirada más corta o sube el límite de tokens."
        : "El modelo no devolvió JSON interpretable.",
    );
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(
      `[IRIS] respuesta fuera de esquema (stop_reason=${res.stop_reason}):`,
      JSON.stringify(parsed).slice(0, 1200),
    );
    throw new IrisModelError(
      (truncated ? "La respuesta se cortó por longitud. " : "") +
        `La respuesta no cumple el esquema esperado: ${result.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
    );
  }
  return result.data;
}
