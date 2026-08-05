import type { CardSlug } from "@/lib/types";

/**
 * El grafo de relaciones visuales de los 22 Arcanos Mayores.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ EXISTE
 *
 * Los campos planos de `major-attributes.ts` —manos, bajo_los_pies, encima,
 * detras— responden a «¿qué hay?». Se quedan cortos en cuanto la carta dice
 * algo con el CÓMO, y eso ha costado dos ilustraciones:
 *
 *   · La Papisa salió con dos libros, porque «un libro en cada mano» no decía
 *     que fuera el mismo libro sostenido por los dos bordes.
 *   · El Loco salió con el bastón clavado en el suelo en lugar de en la mano, y
 *     con el perro delante en vez de detrás mordiéndole la ropa.
 *
 * La pregunta que hay que hacerle a cada objeto de cada carta es: ¿importa solo
 * que exista, o importa también dónde está, quién lo sostiene, cómo interactúa,
 * hacia dónde apunta y respecto a qué otra cosa se sitúa? Si alguna de esas
 * relaciones enseña algo, es canon semántico y tiene que estar escrita.
 *
 * ---------------------------------------------------------------------------
 * QUÉ NO ES
 *
 * No es una capa de significado. `EL_LOCO —se_desplaza_hacia→ DERECHA` es un
 * hecho comprobable mirando la carta. Que eso quiera decir algo sobre el futuro
 * o sobre la huida es otra capa, y vive en `lecturas`.
 *
 * El verbo es cerrado a propósito: si cada carta pudiera inventar su verbo, en
 * dos semanas habría cuarenta maneras de decir «encima» y el grafo dejaría de
 * poder consultarse.
 * ---------------------------------------------------------------------------
 */

export const RELATION_VERBS = [
  "sostiene",
  "cuelga_de",
  "se_apoya_en",
  "toca",
  "atraviesa",
  "rodea",
  "tira_de",
  "está_detrás_de",
  "está_delante_de",
  "está_encima_de",
  "está_debajo_de",
  "está_entre",
  "está_atado_a",
  "mira_a",
  "da_la_espalda_a",
  "se_desplaza_hacia",
  "sale_de",
  "cae_de",
  "vierte_sobre",
  "apunta_a",
  "reposa_sobre",
] as const;

export type RelationVerb = (typeof RELATION_VERBS)[number];

export interface VisualRelation {
  /** Quién o qué actúa. */
  de: string;
  verbo: RelationVerb;
  /** Sobre qué o hacia dónde. */
  a: string;
}

/**
 * Solo se escriben las relaciones que ENSEÑAN algo.
 *
 * Que el manto toque el suelo no le importa a nadie. Que el farol vaya delante
 * y no detrás, sí: es la diferencia entre alumbrar el camino y alumbrar lo que
 * ya se ha andado.
 */
export const MAJOR_GRAPH: Record<CardSlug, VisualRelation[]> = {
  "arcano-00": [
    { de: "el loco", verbo: "se_desplaza_hacia", a: "el borde derecho de la carta" },
    { de: "el loco", verbo: "sostiene", a: "un bastón apoyado en el hombro" },
    { de: "el hatillo", verbo: "cuelga_de", a: "ese bastón, por detrás de su cabeza" },
    { de: "el loco", verbo: "sostiene", a: "un segundo bastón, más corto" },
    { de: "el segundo bastón", verbo: "toca", a: "el suelo, por delante de él" },
    { de: "el animal", verbo: "está_detrás_de", a: "el loco" },
    { de: "el animal", verbo: "tira_de", a: "su ropa, a la altura de las piernas" },
  ],

  "arcano-01": [
    { de: "el mago", verbo: "está_detrás_de", a: "una mesa" },
    { de: "los cuatro palos", verbo: "reposa_sobre", a: "la mesa" },
    { de: "el mago", verbo: "sostiene", a: "una varita en alto" },
    { de: "el mago", verbo: "sostiene", a: "un objeto diminuto entre dos dedos" },
  ],

  "arcano-02": [
    { de: "la papisa", verbo: "sostiene", a: "un único libro abierto, por los dos bordes" },
    { de: "el libro", verbo: "reposa_sobre", a: "su regazo" },
    { de: "el velo", verbo: "está_detrás_de", a: "la papisa" },
    { de: "el velo", verbo: "está_entre", a: "las dos columnas" },
  ],

  "arcano-03": [
    { de: "la emperatriz", verbo: "sostiene", a: "un cetro con globo y cruz" },
    { de: "el cetro", verbo: "se_apoya_en", a: "su hombro" },
    { de: "el escudo del águila", verbo: "reposa_sobre", a: "su regazo" },
  ],

  "arcano-04": [
    { de: "el emperador", verbo: "sostiene", a: "un cetro con globo y cruz, en alto" },
    { de: "su mano izquierda", verbo: "se_apoya_en", a: "el brazo del trono" },
    { de: "su pierna", verbo: "atraviesa", a: "la otra, formando un cuatro" },
    { de: "el escudo del águila", verbo: "reposa_sobre", a: "el suelo, a sus pies" },
  ],

  "arcano-05": [
    { de: "las dos figuras menores", verbo: "está_debajo_de", a: "el papa" },
    { de: "las dos figuras menores", verbo: "da_la_espalda_a", a: "quien mira la carta" },
    { de: "el papa", verbo: "sostiene", a: "un báculo de tres travesaños" },
    { de: "el papa", verbo: "está_entre", a: "dos columnas" },
  ],

  "arcano-06": [
    { de: "la figura central", verbo: "está_entre", a: "las otras dos" },
    { de: "la figura alada", verbo: "está_encima_de", a: "las tres" },
    { de: "la flecha", verbo: "apunta_a", a: "la escena, sin haber salido aún del arco" },
    { de: "la figura central", verbo: "toca", a: "las dos figuras que la flanquean" },
  ],

  "arcano-07": [
    { de: "el conductor", verbo: "está_encima_de", a: "el carro" },
    { de: "los dos caballos", verbo: "se_desplaza_hacia", a: "lados distintos" },
    { de: "el palio", verbo: "está_encima_de", a: "el conductor" },
  ],

  "arcano-08": [
    { de: "la justicia", verbo: "sostiene", a: "una espada recta y vertical" },
    { de: "la justicia", verbo: "sostiene", a: "una balanza, colgando" },
    { de: "los dos platos", verbo: "reposa_sobre", a: "el mismo nivel" },
  ],

  "arcano-09": [
    { de: "el ermitaño", verbo: "se_desplaza_hacia", a: "el borde izquierdo de la carta" },
    { de: "el ermitaño", verbo: "sostiene", a: "un farol encendido" },
    { de: "el farol", verbo: "está_delante_de", a: "él, en la dirección en que camina" },
    { de: "el bastón", verbo: "toca", a: "el suelo" },
    { de: "el manto", verbo: "rodea", a: "todo su cuerpo salvo el rostro y las manos" },
  ],

  "arcano-10": [
    { de: "una criatura", verbo: "se_desplaza_hacia", a: "arriba, por un lado de la rueda" },
    { de: "otra criatura", verbo: "se_desplaza_hacia", a: "abajo, por el otro lado" },
    { de: "la criatura coronada", verbo: "está_encima_de", a: "la rueda, quieta y sin agarrarse" },
    { de: "la manivela", verbo: "sale_de", a: "el eje, hacia fuera de la rueda" },
  ],

  "arcano-11": [
    { de: "la mujer", verbo: "toca", a: "las fauces del animal, con las dos manos" },
    { de: "el animal", verbo: "está_debajo_de", a: "ella" },
  ],

  "arcano-12": [
    { de: "el colgado", verbo: "cuelga_de", a: "un pie, cabeza abajo" },
    { de: "la cuerda", verbo: "cuelga_de", a: "el travesaño" },
    { de: "el travesaño", verbo: "se_apoya_en", a: "dos troncos podados" },
    { de: "su pierna libre", verbo: "atraviesa", a: "la otra por detrás, formando un cuatro invertido" },
    { de: "sus manos", verbo: "está_detrás_de", a: "su espalda, ocultas" },
  ],

  "arcano-13": [
    { de: "la guadaña", verbo: "se_desplaza_hacia", a: "un lado, en horizontal" },
    { de: "las cabezas, manos y pies", verbo: "sale_de", a: "la tierra negra" },
    { de: "la figura", verbo: "toca", a: "el mismo suelo del que brotan" },
  ],

  "arcano-14": [
    { de: "la figura", verbo: "vierte_sobre", a: "una jarra, desde la otra" },
    { de: "el líquido", verbo: "se_desplaza_hacia", a: "el lado, en horizontal, no hacia abajo" },
    { de: "las alas", verbo: "sale_de", a: "su espalda" },
  ],

  "arcano-15": [
    { de: "el diablo", verbo: "está_encima_de", a: "un pedestal" },
    { de: "las dos figuras menores", verbo: "está_atado_a", a: "ese pedestal, por el cuello" },
    { de: "la cuerda", verbo: "rodea", a: "sus cuellos, floja" },
    { de: "el diablo", verbo: "mira_a", a: "quien tiene la carta delante" },
  ],

  "arcano-16": [
    { de: "la corona de la torre", verbo: "cae_de", a: "lo alto del edificio" },
    { de: "las dos figuras", verbo: "cae_de", a: "la torre, hacia lados opuestos" },
    { de: "la torre", verbo: "toca", a: "el suelo, todavía en pie" },
  ],

  "arcano-17": [
    { de: "la mujer", verbo: "vierte_sobre", a: "el agua, con una jarra" },
    { de: "la mujer", verbo: "vierte_sobre", a: "la tierra, con la otra jarra" },
    { de: "su rodilla", verbo: "toca", a: "el suelo, junto a la orilla" },
    { de: "la estrella mayor", verbo: "está_encima_de", a: "ella" },
    { de: "el ave", verbo: "reposa_sobre", a: "un arbusto, al fondo" },
  ],

  "arcano-18": [
    { de: "los dos animales", verbo: "mira_a", a: "la luna, hacia arriba" },
    { de: "los dos animales", verbo: "está_entre", a: "las dos torres" },
    { de: "el cangrejo", verbo: "está_debajo_de", a: "el agua del estanque" },
    { de: "las gotas", verbo: "cae_de", a: "la luna" },
  ],

  "arcano-19": [
    { de: "las dos figuras", verbo: "toca", a: "la una a la otra" },
    { de: "el muro", verbo: "está_detrás_de", a: "las dos figuras" },
    { de: "el sol", verbo: "mira_a", a: "las dos figuras, desde arriba" },
    { de: "las gotas", verbo: "cae_de", a: "el sol" },
  ],

  "arcano-20": [
    { de: "la figura central", verbo: "sale_de", a: "la tierra abierta" },
    { de: "la figura central", verbo: "da_la_espalda_a", a: "quien mira la carta" },
    { de: "las otras dos figuras", verbo: "está_entre", a: "las que flanquean a la que emerge" },
    { de: "la figura alada", verbo: "está_encima_de", a: "las tres" },
    { de: "el estandarte", verbo: "cuelga_de", a: "la trompeta" },
  ],

  "arcano-21": [
    { de: "la corona vegetal", verbo: "rodea", a: "la figura central" },
    { de: "la figura central", verbo: "toca", a: "nada: está suspendida" },
    { de: "las cuatro criaturas", verbo: "mira_a", a: "la figura central, desde las esquinas" },
  ],
};

export function graphFor(slug: CardSlug): VisualRelation[] {
  return MAJOR_GRAPH[slug] ?? [];
}

/** Todas las cartas donde aparece un verbo. Para consultar el grafo. */
export function cardsWithVerb(verbo: RelationVerb): CardSlug[] {
  return Object.entries(MAJOR_GRAPH)
    .filter(([, rels]) => rels.some((r) => r.verbo === verbo))
    .map(([slug]) => slug);
}
