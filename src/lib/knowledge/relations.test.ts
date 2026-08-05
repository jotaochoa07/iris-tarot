import { test } from "node:test";
import assert from "node:assert/strict";
import { majorRelations } from "./relations";
import type { DrawnCard, Orientation } from "@/lib/types";

/**
 * Pruebas del motor estructural.
 *
 * La mitad de estas pruebas comprueban que algo SE DICE. La otra mitad, más
 * importante, comprueban que algo NO se dice: que ninguna frase de este módulo
 * interpreta. Esa frontera es el producto entero, y es exactamente el tipo de
 * cosa que se erosiona sola si nadie la vigila.
 *
 *   npm test
 */

const c = (
  slug: string,
  order: number,
  orientation: Orientation = "upright",
): DrawnCard => ({
  slug,
  order,
  orientation,
  confidence: null,
  alternative_slug: null,
  confirmed_by_user: true,
});

/** La tirada de referencia: las tres primeras cartas ilustradas. */
const PAPISA_EMPERATRIZ_EMPERADOR = [
  c("arcano-02", 1),
  c("arcano-03", 2),
  c("arcano-04", 3),
];

const textos = (cards: DrawnCard[]) =>
  majorRelations(cards).map((r) => r.text.toLowerCase());

/* ---------------------------------------------------------------------------
 * Lo que debe decir
 * ------------------------------------------------------------------------- */

test("II · III · IIII: encuentra los objetos repetidos", () => {
  const t = textos(PAPISA_EMPERATRIZ_EMPERADOR);
  for (const objeto of ["águila", "cetro", "corona", "trono"]) {
    assert.ok(
      t.some((x) => x.startsWith(objeto)),
      `esperaba una relación sobre "${objeto}"`,
    );
  }
});

test("II · III · IIII: señala a la única que mira al frente", () => {
  const t = textos(PAPISA_EMPERATRIZ_EMPERADOR);
  assert.ok(t.some((x) => x.includes("la papisa") && x.includes("al frente")));
});

test("II · III · IIII: detecta el giro progresivo", () => {
  const t = textos(PAPISA_EMPERATRIZ_EMPERADOR);
  assert.ok(t.some((x) => x.includes("más girada")));
});

test("una carta invertida invierte su mirada", () => {
  // El Emperador mira a la izquierda; invertido mira a la derecha, y entonces
  // coincide con El Loco, que camina hacia la derecha.
  const derecho = textos([c("arcano-04", 1), c("arcano-00", 2)]);
  const invertido = textos([c("arcano-04", 1, "reversed"), c("arcano-00", 2)]);

  assert.ok(
    !derecho.some((x) => x.includes("misma dirección")),
    "al derecho no deberían coincidir",
  );
  assert.ok(
    invertido.some((x) => x.includes("misma dirección") && x.includes("derecha")),
    "invertido deberían coincidir hacia la derecha",
  );
});

test("las miradas que se cruzan solo cuentan entre cartas contiguas", () => {
  // El Loco mira a la derecha; el Emperador, a la izquierda. Juntos se cruzan.
  const juntas = textos([c("arcano-00", 1), c("arcano-04", 2)]);
  assert.ok(juntas.some((x) => x.includes("se cruzan")));

  // Con La Justicia en medio, ya no se están mirando.
  const separadas = textos([c("arcano-00", 1), c("arcano-08", 2), c("arcano-04", 3)]);
  assert.ok(!separadas.some((x) => x.includes("se cruzan")));
});

test("sin Arcanos Mayores no inventa nada", () => {
  assert.equal(majorRelations([c("espadas-05", 1), c("bastos-02", 2)]).length, 0);
});

test("una sola carta no produce relaciones de pareja", () => {
  const t = textos([c("arcano-04", 1)]);
  assert.ok(!t.some((x) => x.includes("misma dirección") || x.includes("se cruzan")));
});

/* ---------------------------------------------------------------------------
 * Lo que NO debe decir
 *
 * La frontera entre hecho e interpretación no se defiende con buenas
 * intenciones: se defiende con una prueba que falla.
 * ------------------------------------------------------------------------- */

const PROHIBIDAS = [
  "no es casualidad",
  "casualidad",
  "significa",
  "simboliza",
  "representa",
  "revela",
  "nos habla",
  "llama la atención",
  "sugiere",
  "indica que",
  "conviven",
  "quiere decir",
  "podría",
  "quizá",
];

test("ninguna frase interpreta", () => {
  const tiradas = [
    PAPISA_EMPERATRIZ_EMPERADOR,
    [c("arcano-05", 1), c("arcano-08", 2), c("arcano-04", 3)],
    [c("arcano-00", 1), c("arcano-04", 2, "reversed")],
    [c("arcano-10", 1), c("arcano-16", 2), c("arcano-18", 3)],
    [c("arcano-01", 1), c("arcano-11", 2)],
  ];

  for (const tirada of tiradas) {
    for (const frase of textos(tirada)) {
      for (const palabra of PROHIBIDAS) {
        assert.ok(
          !frase.includes(palabra),
          `frase con interpretación («${palabra}»): ${frase}`,
        );
      }
    }
  }
});

test("las frases están bien construidas en castellano", () => {
  const tiradas = [
    PAPISA_EMPERATRIZ_EMPERADOR,
    [c("arcano-00", 1), c("arcano-04", 2)],
    [c("arcano-05", 1), c("arcano-02", 2)],
  ];

  for (const tirada of tiradas) {
    for (const frase of textos(tirada)) {
      /*
       * Concordancia: una carta de nombre masculino seguida DIRECTAMENTE de un
       * participio femenino. Tiene que ser directo: «en El Emperador la figura
       * está sentada» es correcto, porque el participio concuerda con «figura».
       * La primera versión de esta prueba no lo distinguía y fallaba sola.
       */
      assert.ok(
        !/el (emperador|papa|loco|mago|ermitaño|colgado|diablo|sol|juicio|mundo|carro)\s+(?:está|aparece|queda|se ve)\s+\w+(?:ada|ida)\b/.test(
          frase,
        ),
        `posible fallo de concordancia: ${frase}`,
      );
      assert.ok(frase.trim().endsWith("."), `sin punto final: ${frase}`);
      assert.ok(!frase.includes("  "), `doble espacio: ${frase}`);
      assert.ok(!frase.includes(" y i"), `debería ser «e» y no «y»: ${frase}`);
    }
  }
});

/* ---------------------------------------------------------------------------
 * El grafo
 * ------------------------------------------------------------------------- */

test("las 22 cartas tienen relaciones escritas", async () => {
  const { MAJOR_GRAPH } = await import("./major-graph");
  const { MAJOR_ATTRIBUTES } = await import("./major-attributes");
  for (const slug of Object.keys(MAJOR_ATTRIBUTES)) {
    assert.ok(
      (MAJOR_GRAPH[slug] ?? []).length > 0,
      `${slug} no tiene ninguna relación en el grafo`,
    );
  }
});

test("el grafo tampoco interpreta", async () => {
  const { MAJOR_GRAPH } = await import("./major-graph");
  for (const [slug, rels] of Object.entries(MAJOR_GRAPH)) {
    for (const r of rels) {
      const frase = `${r.de} ${r.a}`.toLowerCase();
      for (const palabra of PROHIBIDAS) {
        assert.ok(!frase.includes(palabra), `${slug}: interpretación en «${frase}»`);
      }
    }
  }
});

test("los verbos del grafo salen del vocabulario cerrado", async () => {
  const { MAJOR_GRAPH, RELATION_VERBS } = await import("./major-graph");
  const permitidos = new Set<string>(RELATION_VERBS);
  for (const [slug, rels] of Object.entries(MAJOR_GRAPH)) {
    for (const r of rels) {
      assert.ok(permitidos.has(r.verbo), `${slug}: verbo desconocido «${r.verbo}»`);
    }
  }
});
