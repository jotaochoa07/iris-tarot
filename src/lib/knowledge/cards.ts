import type { Arcana, CardSlug, Suit } from "@/lib/types";
import { SUITS, SUIT_ORDER } from "./suits";
import { DEGREES, isCourt } from "./degrees";
import { MAJORS, MAJORS_BY_SLUG } from "./majors";

/**
 * Las 78 cartas.
 *
 * Los Arcanos Menores se construyen a partir de las reglas de composición
 * efectivas del Tarot de Marsella, no de descripciones inventadas carta a carta:
 *
 *   - Espadas: las espadas curvas se entrelazan formando una elipse cerrada.
 *     Los números impares añaden una espada recta en el eje vertical.
 *   - Bastos: los bastones se cruzan en celosía. Los impares añaden un bastón
 *     vertical central.
 *   - Copas y Oros: los signos se distribuyen en filas o retícula simétrica
 *     sobre ornamento vegetal. Los impares sitúan un signo en el eje central.
 *
 * Esta regla es una propiedad estructural verificable de la baraja, y por eso
 * IRIS puede afirmarla sin atribuirla a ningún autor.
 */

export const ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IIII",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "VIIII",
  10: "X",
};

export interface Card {
  slug: CardSlug;
  arcana: Arcana;
  name: string;
  /** Número impreso. null en El Loco. */
  number: number | null;
  /** Grado 1–14. null en Arcanos Mayores. */
  degree: number | null;
  suit: Suit | null;
  roman: string;
  /** Descripción iconográfica. Solo elementos efectivamente impresos. */
  visual: string;
  /** Pigmentos dominantes, para la representación en pantalla. */
  palette: string[];
  is_court: boolean;
}

const COURT_NAMES: Record<number, string> = {
  11: "Sota",
  12: "Caballero",
  13: "Reina",
  14: "Rey",
};

function aceVisual(suit: Suit): string {
  switch (suit) {
    case "espadas":
      return "Una única espada recta y vertical atraviesa una corona. A ambos lados se despliegan dos ramas. El resto del campo queda casi vacío.";
    case "bastos":
      return "Un único bastón de gran tamaño cruza la carta en diagonal, con los extremos cortados y pequeñas formas desprendidas a su alrededor.";
    case "copas":
      return "Una única copa de gran tamaño, construida como una pequeña arquitectura con torres y aberturas, ocupa el centro de la carta.";
    case "oros":
      return "Un único disco de gran tamaño con roseta interior, rodeado de ornamento vegetal, ocupa el centro de la carta.";
  }
}

function pipVisual(suit: Suit, n: number): string {
  if (n === 1) return aceVisual(suit);

  const odd = n % 2 === 1;
  const curved = odd ? n - 1 : n;

  switch (suit) {
    case "espadas":
      return odd
        ? `${curved} espadas curvas se entrelazan formando una elipse cerrada, y una espada recta la atraviesa por el eje vertical. Ese eje recto es lo que distingue a los números impares en este palo.`
        : `${curved} espadas curvas se entrelazan formando una elipse cerrada y simétrica. No hay eje vertical: el conjunto se sostiene solo por el entrelazado.`;
    case "bastos":
      return odd
        ? `${curved} bastones se cruzan en celosía y un bastón recto los atraviesa por el eje vertical. La composición queda abierta hacia las cuatro esquinas.`
        : `${curved} bastones se cruzan en celosía simétrica, con las puntas dirigidas hacia las esquinas. No hay eje central.`;
    case "copas":
      return odd
        ? `${n} copas dispuestas en filas simétricas, con una de ellas ocupando el eje central. Ornamento vegetal une el conjunto.`
        : `${n} copas dispuestas en filas simétricas y emparejadas, unidas por ornamento vegetal. El eje central queda libre.`;
    case "oros":
      return odd
        ? `${n} discos con roseta interior distribuidos en retícula simétrica, con uno de ellos en el eje central, sobre fondo de vegetación.`
        : `${n} discos con roseta interior distribuidos en retícula simétrica y emparejada, sobre fondo de vegetación. El eje central queda libre.`;
  }
}

function courtVisual(suit: Suit, degree: number): string {
  const sign = SUITS[suit].singular.toLowerCase();
  switch (degree) {
    case 11:
      return `Figura de pie, sin trono ni montura, sosteniendo el signo del palo. El ${sign} aparece a su escala, todavía manejable.`;
    case 12:
      return `Figura a caballo, en movimiento lateral, portando el signo del palo. La dirección de la montura marca hacia dónde se desplaza la energía.`;
    case 13:
      return `Figura femenina sentada y frontal, con el signo del palo sostenido junto al cuerpo. La postura recoge hacia dentro.`;
    case 14:
      return `Figura masculina sentada, coronada, con el signo del palo sostenido hacia fuera. La postura proyecta hacia el exterior.`;
    default:
      return "";
  }
}

function minorName(suit: Suit, degree: number): string {
  const s = SUITS[suit];
  if (degree === 1) return `As de ${s.label}`;
  if (isCourt(degree)) return `${COURT_NAMES[degree]} de ${s.label}`;
  return `${ROMAN[degree]} de ${s.label}`;
}

function buildMinors(): Card[] {
  const out: Card[] = [];
  for (const suit of SUIT_ORDER) {
    for (let degree = 1; degree <= 14; degree++) {
      const court = isCourt(degree);
      out.push({
        slug: `${suit}-${String(degree).padStart(2, "0")}`,
        arcana: "minor",
        name: minorName(suit, degree),
        number: court ? null : degree,
        degree,
        suit,
        roman: court ? "—" : ROMAN[degree],
        visual: court ? courtVisual(suit, degree) : pipVisual(suit, degree),
        palette: SUITS[suit].palette,
        is_court: court,
      });
    }
  }
  return out;
}

function buildMajors(): Card[] {
  return MAJORS.map((m) => ({
    slug: m.slug,
    arcana: "major" as const,
    name: m.name,
    number: m.number,
    degree: null,
    suit: null,
    roman: m.roman,
    visual: m.visual,
    palette: ["marseille-red", "marseille-blue", "marseille-yellow", "marseille-flesh"],
    is_court: false,
  }));
}

export const CARDS: Card[] = [...buildMajors(), ...buildMinors()];

export const CARDS_BY_SLUG: Record<CardSlug, Card> = Object.fromEntries(
  CARDS.map((c) => [c.slug, c]),
);

export function getCard(slug: CardSlug): Card | null {
  return CARDS_BY_SLUG[slug] ?? null;
}

export function requireCard(slug: CardSlug): Card {
  const c = CARDS_BY_SLUG[slug];
  if (!c) throw new Error(`Carta desconocida: ${slug}`);
  return c;
}

/** Búsqueda tolerante para el selector manual y para normalizar la visión. */
export function searchCards(query: string): Card[] {
  const q = normalize(query);
  if (!q) return CARDS;
  return CARDS.filter((c) => {
    const hay = normalize(
      `${c.name} ${c.slug} ${c.roman} ${c.suit ?? ""} ${
        c.arcana === "major" ? MAJORS_BY_SLUG[c.slug]?.name_fr ?? "" : ""
      }`,
    );
    return hay.includes(q);
  });
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export const DEGREE_TABLE = DEGREES;
