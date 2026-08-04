/**
 * Ingesta del corpus privado — capa 2.
 *
 *   node scripts/ingest-corpus.mjs
 *
 * Lee los EPUB de corpus/, los trocea respetando los capítulos reales del
 * índice del libro y los sube a Supabase. Solo se ejecuta a mano, en la
 * máquina del propietario, y necesita SUPABASE_SERVICE_ROLE_KEY.
 *
 * Los libros nunca salen de aquí: lo que viaja a la base de datos son
 * fragmentos de texto para poder citarlos con su capítulo.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import { createClient } from "@supabase/supabase-js";

/* --- Catálogo -------------------------------------------------------------
 * Cada fichero declara a qué escuela pertenece. La escuela es lo que permite
 * a IRIS no mezclar el canon del Tarot con la psicología junguiana.
 * ------------------------------------------------------------------------- */

const CATALOG = {
  "jodorowsky-costa-la-via-del-tarot.epub": {
    slug: "la-via-del-tarot",
    title: "La vía del Tarot",
    authors: "Alejandro Jodorowsky y Marianne Costa",
    school: "jodorowsky-costa",
    year: 2004,
  },
  "nichols-jung-y-el-tarot.epub": {
    slug: "jung-y-el-tarot",
    title: "Jung y el tarot: un viaje arquetípico",
    authors: "Sallie Nichols",
    school: "nichols",
    year: 1980,
  },
  "jung-el-hombre-y-sus-simbolos.epub": {
    slug: "el-hombre-y-sus-simbolos",
    title: "El hombre y sus símbolos",
    authors: "Carl G. Jung",
    school: "jung",
    year: 1964,
    // Las dos ediciones que hemos probado son escaneos: una sin capa de texto y
    // otra con OCR de un maquetado a dos columnas, que entrelaza las líneas de
    // ambas ("...entre lo que cativas. Los textos clásicos chinos no pregun-").
    // Ingerir eso haría que IRIS citara frases que nadie escribió.
    skip: "escaneo con OCR a dos columnas: el texto sale entrelazado y no se puede citar",
  },
};

const CHUNK_CHARS = 1100;
const OVERLAP_CHARS = 150;
const MIN_CHUNK_CHARS = 220;

/* --- Entorno --------------------------------------------------------------- */

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

if (!url || !serviceKey) {
  console.error(
    "\nFalta SUPABASE_SERVICE_ROLE_KEY en .env.local.\n" +
      "Está en Supabase → Project Settings → API Keys → service_role.\n" +
      "Es una clave de administrador: no la subas a ningún sitio.\n",
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

/* --- EPUB ------------------------------------------------------------------ */

function readEpub(file) {
  const zip = unzipSync(new Uint8Array(readFileSync(file)));
  const text = (name) => (zip[name] ? strFromU8(zip[name]) : null);
  return { zip, text };
}

/** Ficheros del libro en orden de lectura, según el spine del OPF. */
function spineOrder({ zip, text }) {
  const container = text("META-INF/container.xml") ?? "";
  const opfPath =
    container.match(/full-path="([^"]+)"/)?.[1] ??
    Object.keys(zip).find((n) => n.endsWith(".opf"));
  if (!opfPath) return { files: [], base: "", opf: "" };

  const opf = text(opfPath) ?? "";
  const base = opfPath.includes("/")
    ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1)
    : "";

  const manifest = new Map();
  for (const m of opf.matchAll(/<item\b([^>]*)>/g)) {
    const id = m[1].match(/id="([^"]+)"/)?.[1];
    const href = m[1].match(/href="([^"]+)"/)?.[1];
    if (id && href) manifest.set(id, base + decodeURIComponent(href));
  }

  const files = [];
  for (const m of opf.matchAll(/<itemref\b[^>]*idref="([^"]+)"/g)) {
    const href = manifest.get(m[1]);
    if (href && /\.x?html?$/i.test(href) && zip[href]) files.push(href);
  }
  return { files, base, opf };
}

/** Etiqueta de capítulo por ancla, tomada del índice real del libro. */
function tocLabels({ zip, text }, base) {
  const labels = new Map(); // "fichero#ancla" -> título

  const ncxName = Object.keys(zip).find((n) => n.endsWith(".ncx"));
  if (ncxName) {
    const ncx = text(ncxName) ?? "";
    for (const m of ncx.matchAll(
      /<navPoint[^>]*>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?src="([^"]+)"/g,
    )) {
      const label = stripTags(m[1]).trim();
      const src = decodeURIComponent(m[2]);
      if (label) labels.set(base + src, label);
    }
  }

  // EPUB 3: nav.xhtml
  const navName = Object.keys(zip).find((n) => /nav\.x?html$/i.test(n));
  if (navName) {
    const nav = text(navName) ?? "";
    for (const m of nav.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const src = decodeURIComponent(m[1]);
      const label = stripTags(m[2]).trim();
      const key = base + src;
      if (label && !labels.has(key)) labels.set(key, label);
    }
  }

  return labels;
}

function stripTags(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&[a-z]+;/gi, " ");
}

function clean(text) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Trocea un fichero del libro en secciones según sus anclas.
 * Devuelve [{ locator, text }] en orden de lectura.
 */
function sectionsOf(html, fileName, labels) {
  // Posiciones de las anclas que el índice conoce para este fichero.
  // El corte debe caer en el "<" de la etiqueta, no en el atributo: si no,
  // el resto de la etiqueta ('id="p4">') sobrevive a stripTags y acaba dentro
  // de la cita.
  const marks = [];
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
    const label = labels.get(`${fileName}#${m[1]}`);
    if (!label) continue;
    const idx = m.index ?? 0;
    const tagStart = html.lastIndexOf("<", idx);
    marks.push({ at: tagStart === -1 ? idx : tagStart, label });
  }
  marks.sort((a, b) => a.at - b.at);

  const fileLabel = labels.get(fileName) ?? null;
  if (marks.length === 0) {
    return [{ locator: fileLabel, text: clean(stripTags(html)) }];
  }

  const out = [];
  const head = clean(stripTags(html.slice(0, marks[0].at)));
  if (head.length >= MIN_CHUNK_CHARS) out.push({ locator: fileLabel, text: head });

  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].at : html.length;
    const text = clean(stripTags(html.slice(marks[i].at, end)));
    if (text) out.push({ locator: marks[i].label, text });
  }
  return out;
}

/** Corta un texto largo en fragmentos con solape, sin partir frases. */
function chunk(text) {
  if (text.length <= CHUNK_CHARS) return text.length >= MIN_CHUNK_CHARS ? [text] : [];

  const out = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_CHARS, text.length);
    if (end < text.length) {
      // Retrocede hasta el final de frase más cercano.
      const window = text.slice(start, end);
      const cut = Math.max(
        window.lastIndexOf(". "),
        window.lastIndexOf("? "),
        window.lastIndexOf("! "),
      );
      if (cut > CHUNK_CHARS * 0.5) end = start + cut + 1;
    }
    const piece = text.slice(start, end).trim();
    if (piece.length >= MIN_CHUNK_CHARS) out.push(piece);
    if (end >= text.length) break;
    start = Math.max(end - OVERLAP_CHARS, start + 1);
  }
  return out;
}

/* --- Ingesta --------------------------------------------------------------- */

async function ingest(file, meta) {
  const epub = readEpub(file);
  const { files, base } = spineOrder(epub);
  const labels = tocLabels(epub, base);

  const pieces = [];
  let currentLocator = null;

  for (const name of files) {
    const html = epub.text(name);
    if (!html) continue;
    for (const section of sectionsOf(html, name, labels)) {
      if (section.locator) currentLocator = section.locator;
      for (const text of chunk(section.text)) {
        pieces.push({ locator: currentLocator, content: text });
      }
    }
  }

  if (pieces.length === 0) {
    console.log(`  ${meta.title}: no he extraído texto. Revisa el fichero.`);
    return;
  }

  // Reingesta limpia: borramos el documento anterior y sus fragmentos.
  await db.from("corpus_documents").delete().eq("slug", meta.slug);

  const { data: doc, error: docErr } = await db
    .from("corpus_documents")
    .insert({
      slug: meta.slug,
      title: meta.title,
      authors: meta.authors,
      school: meta.school,
      year: meta.year,
    })
    .select("id")
    .single();

  if (docErr) throw new Error(`${meta.title}: ${docErr.message}`);

  const rows = pieces.map((p, i) => ({
    document_id: doc.id,
    ordinal: i,
    locator: p.locator,
    content: p.content,
  }));

  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await db.from("corpus_chunks").insert(rows.slice(i, i + 200));
    if (error) throw new Error(`${meta.title}, lote ${i}: ${error.message}`);
    process.stdout.write(`\r  ${meta.title}: ${Math.min(i + 200, rows.length)}/${rows.length}`);
  }

  const locators = new Set(pieces.map((p) => p.locator).filter(Boolean));
  console.log(
    `\r  ${meta.title}: ${rows.length} fragmentos, ${locators.size} secciones con localizador`,
  );
}

/* --- Principal ------------------------------------------------------------- */

const dir = resolve(process.cwd(), "corpus");
const found = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".epub"));

if (found.length === 0) {
  console.error("No hay ningún .epub en corpus/.");
  process.exit(1);
}

console.log("\n— Ingesta del corpus —\n");

for (const file of found) {
  const meta = CATALOG[file];
  if (!meta) {
    console.log(`  ${file}: no está en el catálogo del script. Lo salto.`);
    console.log(`    Añádelo a CATALOG en scripts/ingest-corpus.mjs con su escuela.`);
    continue;
  }
  if (meta.skip) {
    console.log(`  ${meta.title}: lo salto — ${meta.skip}`);
    continue;
  }
  await ingest(join(dir, file), meta);
}

const { count } = await db
  .from("corpus_chunks")
  .select("*", { count: "exact", head: true });

console.log(`\nCorpus listo: ${count} fragmentos consultables.`);
console.log("Activa la capa 2 poniendo IRIS_CORPUS_RAG_ENABLED=true en .env.local.\n");
