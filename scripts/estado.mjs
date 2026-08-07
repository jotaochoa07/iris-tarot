/**
 * Estado del IRIS Marseille Deck.
 *
 *   node scripts/estado.mjs
 *
 * Lee los datos y cuenta. Nadie vuelve a contar a mano.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function leer(archivo, exportName, hasta) {
  const src = readFileSync(resolve(process.cwd(), archivo), "utf8");
  const cuerpo = src.slice(src.indexOf(exportName), src.indexOf(hasta));
  const abre = cuerpo.indexOf("{") !== -1 ? "{" : "[";
  const cierra = abre === "{" ? cuerpo.lastIndexOf("};") : cuerpo.lastIndexOf("];");
  const iris = (t) => ({ text: t, source: null });
  const jc = (t) => ({ text: t, source: "jc" });
  void iris;
  void jc;
  return eval(`(${cuerpo.slice(cuerpo.indexOf(abre), cierra + 1)})`);
}

const ATTRS = leer(
  "src/lib/knowledge/major-attributes.ts",
  "export const MAJOR_ATTRIBUTES",
  "/* ---------------------------------------------------------------------------\n * Utilidades",
);
const APROBADAS = leer(
  "src/lib/knowledge/major-status.ts",
  "export const APROBADAS",
  "/**\n * Ediciones menores",
);
const RETOQUES = leer(
  "src/lib/knowledge/major-status.ts",
  "export const RETOQUES_PENDIENTES",
  "/** La referencia visual",
);

const NOMBRES = {
  "arcano-00": "El Loco", "arcano-01": "El Mago", "arcano-02": "La Papisa",
  "arcano-03": "La Emperatriz", "arcano-04": "El Emperador", "arcano-05": "El Papa",
  "arcano-06": "El Enamorado", "arcano-07": "El Carro", "arcano-08": "La Justicia",
  "arcano-09": "El Ermitaño", "arcano-10": "La Rueda de la Fortuna",
  "arcano-11": "La Fuerza", "arcano-12": "El Colgado", "arcano-13": "(sin nombre)",
  "arcano-14": "Templanza", "arcano-15": "El Diablo", "arcano-16": "La Torre",
  "arcano-17": "La Estrella", "arcano-18": "La Luna", "arcano-19": "El Sol",
  "arcano-20": "El Juicio", "arcano-21": "El Mundo",
};

const todos = Object.values(ATTRS);
const aprobadas = new Set(APROBADAS);

const listas = todos.filter((a) => !aprobadas.has(a.slug) && !a.verify);
const porVerificar = todos.filter((a) => !aprobadas.has(a.slug) && a.verify);

const fila = (a) =>
  `| ${a.numeral === "—" ? "sin nº" : a.numeral} | ${NOMBRES[a.slug]} | ${a.slug} |`;

const doc = [
  "# Estado del IRIS Marseille Deck",
  "",
  "> Generado por `node scripts/estado.mjs`. No editar a mano.",
  "",
  `**${APROBADAS.length} de 22** Arcanos Mayores aprobados.`,
  `Los 56 Menores se generan en SVG y están completos.`,
  "",
  "## Aprobadas",
  "",
  "| nº | carta | archivo |",
  "|---|---|---|",
  ...todos.filter((a) => aprobadas.has(a.slug)).map(fila),
  "",
  ...(Object.keys(RETOQUES).length
    ? [
        "### Con retoque pendiente",
        "",
        ...Object.entries(RETOQUES).map(
          ([slug, nota]) => `- **${NOMBRES[slug]}** — ${nota}`,
        ),
        "",
      ]
    : []),
  `## Ficha cerrada, listas para generar (${listas.length})`,
  "",
  "| nº | carta | archivo |",
  "|---|---|---|",
  ...listas.map(fila),
  "",
  `## Ficha por verificar contra una baraja física (${porVerificar.length})`,
  "",
  "No se generan hasta cerrarlas: rehacer una ilustración cuesta más que",
  "comprobar un dato.",
  "",
  "| nº | carta | qué comprobar |",
  "|---|---|---|",
  ...porVerificar.map(
    (a) => `| ${a.numeral} | ${NOMBRES[a.slug]} | ${a.verify_note ?? "—"} |`,
  ),
  "",
].join("\n");

writeFileSync(resolve(process.cwd(), "docs/estado-mazo.md"), doc);

console.log(`
  IRIS Marseille Deck
  ───────────────────────────────────────────
  Aprobadas              ${String(APROBADAS.length).padStart(2)} / 22
  Listas para generar    ${String(listas.length).padStart(2)}
  Por verificar          ${String(porVerificar.length).padStart(2)}
  Retoques pendientes    ${String(Object.keys(RETOQUES).length).padStart(2)}
  ───────────────────────────────────────────
  Menores en SVG         56 / 56

  Escrito en docs/estado-mazo.md
`);

if (!existsSync(resolve(process.cwd(), "docs/master/MASTER_REFERENCE.png"))) {
  console.log("  Aviso: falta docs/master/MASTER_REFERENCE.png\n");
}
