import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { ANTHROPIC_BASE_URL } from "@/lib/iris/anthropic";
import { Display, Notice, Rule, Screen, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

/**
 * Diagnóstico de configuración.
 *
 * Existe para responder en pantalla —sin consola ni terminal— si el motor está
 * bien conectado: claves presentes, modelos válidos en la cuenta y visión
 * operativa. Si algo falla, aquí se ve por qué.
 */

type Check = {
  label: string;
  ok: boolean | null;
  detail: string;
};

const PIXEL =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/**
 * Solo en desarrollo.
 *
 * Enseña qué modelos hay configurados, a qué URL apuntan las llamadas y si
 * las claves están puestas. Útil en local, información de más en producción.
 */
function soloEnDesarrollo() {
  if (process.env.NODE_ENV === "production") notFound();
}

export default async function DiagnosticoPage() {
  soloEnDesarrollo();

  await requireSession();

  const checks: Check[] = [];
  let modelIds: string[] = [];

  const key = process.env.ANTHROPIC_API_KEY;
  const reading = process.env.IRIS_MODEL_READING ?? "(sin definir)";
  const vision = process.env.IRIS_MODEL_VISION ?? "(sin definir)";

  checks.push({
    label: "Clave de Anthropic",
    ok: Boolean(key),
    detail: key
      ? `Presente, empieza por ${key.slice(0, 12)}…`
      : "Falta ANTHROPIC_API_KEY en .env.local",
  });

  // El SDK lee ANTHROPIC_BASE_URL del sistema si existe. IRIS la ignora, pero
  // conviene ver aquí si hay una puesta, porque explica desvíos raros.
  const envBaseUrl = process.env.ANTHROPIC_BASE_URL;
  checks.push({
    label: "Destino de la API",
    ok: ANTHROPIC_BASE_URL === "https://api.anthropic.com",
    detail:
      `IRIS llama a ${ANTHROPIC_BASE_URL}` +
      (envBaseUrl
        ? ` · Tu sistema tiene ANTHROPIC_BASE_URL=${envBaseUrl}, ignorada a propósito.`
        : ""),
  });

  checks.push({
    label: "Supabase",
    ok: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    detail: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Falta la URL",
  });

  const headers = {
    "x-api-key": key ?? "",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  };

  if (key) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        checks.push({
          label: "Conexión con la API",
          ok: false,
          detail: `Error ${res.status}. ${(await res.text()).slice(0, 300)}`,
        });
      } else {
        const json = (await res.json()) as { data: { id: string }[] };
        modelIds = json.data.map((m) => m.id);
        checks.push({
          label: "Conexión con la API",
          ok: true,
          detail: `${modelIds.length} modelos disponibles en tu cuenta`,
        });
      }
    } catch (e) {
      checks.push({
        label: "Conexión con la API",
        ok: false,
        detail: e instanceof Error ? e.message : "Fallo de red",
      });
    }
  }

  if (modelIds.length) {
    checks.push({
      label: "Modelo de lectura",
      ok: modelIds.includes(reading),
      detail: reading,
    });
    checks.push({
      label: "Modelo de visión",
      ok: modelIds.includes(vision),
      detail: vision,
    });

    if (modelIds.includes(vision)) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers,
          cache: "no-store",
          body: JSON.stringify({
            model: vision,
            max_tokens: 32,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: "image/png",
                      data: PIXEL,
                    },
                  },
                  { type: "text", text: "Responde solo con: ok" },
                ],
              },
            ],
          }),
        });
        if (!res.ok) {
          checks.push({
            label: "Prueba de visión",
            ok: false,
            detail: `Error ${res.status}. ${(await res.text()).slice(0, 300)}`,
          });
        } else {
          const out = (await res.json()) as {
            content: { type: string; text?: string }[];
          };
          const text = out.content
            .map((b) => (b.type === "text" ? b.text : ""))
            .join("")
            .trim();
          checks.push({
            label: "Prueba de visión",
            ok: true,
            detail: `El modelo acepta imágenes y responde: «${text}»`,
          });
        }
      } catch (e) {
        checks.push({
          label: "Prueba de visión",
          ok: false,
          detail: e instanceof Error ? e.message : "Fallo de red",
        });
      }
    }
  }

  const allOk = checks.every((c) => c.ok);

  return (
    <Screen>
      <header className="mb-9">
        <Link href="/" className="eyebrow hover:text-ink-700">
          ← IRIS
        </Link>
      </header>

      <Display className="text-[2rem] leading-tight">Diagnóstico</Display>
      <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-ink-500">
        Estado real de la conexión con el motor. Nada de esto se guarda.
      </p>

      <Rule />

      <ul className="flex flex-col">
        {checks.map((c, i) => (
          <li key={i} className="border-b border-ink-100 py-4 last:border-0">
            <div className="flex items-baseline gap-3">
              <span
                className={`text-[0.875rem] ${
                  c.ok ? "text-marseille-green" : "text-marseille-red"
                }`}
              >
                {c.ok ? "●" : "✕"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1.0625rem] text-ink-900">
                  {c.label}
                </p>
                <p className="mt-1 break-words text-[0.8125rem] leading-relaxed text-ink-500">
                  {c.detail}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Rule />

      {allOk ? (
        <Notice>
          Todo conectado. Si la detección sigue fallando, el problema está en la
          fotografía: encuadre, luz o ángulo.
        </Notice>
      ) : (
        <Notice tone="warn">
          Hay algo marcado en rojo. Si es un modelo, cámbialo en .env.local por
          uno de la lista de abajo y reinicia el servidor.
        </Notice>
      )}

      {modelIds.length > 0 && (
        <>
          <Rule />
          <SectionTitle>Modelos disponibles en tu cuenta</SectionTitle>
          <ul className="flex flex-col gap-1.5">
            {modelIds.map((m) => (
              <li
                key={m}
                className={`font-mono text-[0.75rem] ${
                  m === reading || m === vision
                    ? "text-ink-900"
                    : "text-ink-400"
                }`}
              >
                {m}
                {m === reading ? "  ← lectura" : ""}
                {m === vision ? "  ← visión" : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </Screen>
  );
}
