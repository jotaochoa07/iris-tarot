/**
 * Enlace de acceso sin correo — solo para desarrollo.
 *
 *   node scripts/enlace.mjs tu@correo.com
 *
 * El SMTP que Supabase incluye de regalo permite muy pocos envíos por hora, y
 * en desarrollo se agota en una tarde. Esto pide a Supabase que EMITA el enlace
 * en lugar de enviarlo: no sale ningún correo, el enlace aparece en la terminal
 * y lo pegas en el navegador.
 *
 * Necesita SUPABASE_SERVICE_ROLE_KEY, que es una credencial de administrador:
 * este script se ejecuta en tu máquina y nunca en un servidor.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("No encuentro .env.local. Ejecuta desde la raíz del proyecto.");
    process.exit(1);
  }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const site = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("\nUso: node scripts/enlace.mjs tu@correo.com\n");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

// magiclink exige que el usuario ya exista; invite lo crea. Probamos en ese
// orden para que el script sirva tanto la primera vez como las siguientes.
async function link() {
  for (const type of ["magiclink", "signup"]) {
    const { data, error } = await db.auth.admin.generateLink({
      type,
      email,
      password: type === "signup" ? crypto.randomUUID() : undefined,
      options: { redirectTo: `${site}/auth/callback` },
    });
    if (!error && data?.properties?.hashed_token) {
      return { token: data.properties.hashed_token, type };
    }
    if (error && !/not found|does not exist/i.test(error.message)) {
      throw new Error(error.message);
    }
  }
  throw new Error("No he podido emitir el enlace.");
}

const { token, type } = await link();

console.log("\nAbre esto en el navegador (caduca en una hora, un solo uso):\n");
console.log(`${site}/auth/callback?token_hash=${token}&type=${type === "signup" ? "signup" : "magiclink"}`);
console.log("");
