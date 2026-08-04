/**
 * Comprobador de configuración.
 *
 *   node scripts/check-models.mjs
 *
 * Lee .env.local, pregunta a la API de Anthropic qué modelos existen realmente
 * en tu cuenta y verifica que los identificadores configurados sean válidos.
 * Después hace una llamada de visión mínima para confirmar que el modelo de
 * detección responde.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  } catch {
    console.error("No encuentro .env.local en esta carpeta.");
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const key = env.ANTHROPIC_API_KEY;

if (!key) {
  console.error("Falta ANTHROPIC_API_KEY en .env.local");
  process.exit(1);
}

const headers = {
  "x-api-key": key,
  "anthropic-version": "2023-06-01",
  "content-type": "application/json",
};

console.log("\n— Modelos disponibles en tu cuenta —\n");

const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
  headers,
});

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`);
  console.error("\nSi es 401, la clave no es válida.");
  process.exit(1);
}

const { data } = await res.json();
const ids = data.map((m) => m.id);
for (const m of data) console.log(`  ${m.id}`);

const configured = {
  IRIS_MODEL_READING: env.IRIS_MODEL_READING,
  IRIS_MODEL_VISION: env.IRIS_MODEL_VISION,
};

console.log("\n— Tu configuración —\n");
let allValid = true;
for (const [k, v] of Object.entries(configured)) {
  const ok = ids.includes(v);
  if (!ok) allValid = false;
  console.log(`  ${ok ? "OK " : "MAL"}  ${k} = ${v}`);
}

if (!allValid) {
  console.log(
    "\nUn identificador marcado MAL no existe. Cámbialo en .env.local por uno de la lista de arriba y reinicia el servidor.",
  );
  process.exit(1);
}

/* --- Prueba de visión ---------------------------------------------------- */

console.log("\n— Prueba de visión —\n");

// PNG mínimo de 1x1, solo para confirmar que el modelo acepta imágenes.
const PIXEL =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const vis = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers,
  body: JSON.stringify({
    model: configured.IRIS_MODEL_VISION,
    max_tokens: 64,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: PIXEL },
          },
          { type: "text", text: "Responde solo con: ok" },
        ],
      },
    ],
  }),
});

if (!vis.ok) {
  console.error(`  Falla la llamada de visión (${vis.status}):`);
  console.error(`  ${await vis.text()}`);
  process.exit(1);
}

const out = await vis.json();
const text = out.content.map((b) => (b.type === "text" ? b.text : "")).join("");
console.log(`  El modelo de visión responde: «${text.trim()}»`);
console.log("\nConfiguración correcta. Si la detección sigue fallando, es la fotografía.\n");
