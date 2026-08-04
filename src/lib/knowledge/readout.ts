import type { DrawnCard, StructuralReadout, Suit } from "@/lib/types";
import { requireCard } from "./cards";
import { SUITS, SUIT_ORDER } from "./suits";

/**
 * Lectura estructural de la tirada.
 *
 * Se calcula en código, no con IA. Es la respuesta a las preguntas del brief
 * (§7) que tienen respuesta objetiva: qué palos hay, cuáles faltan, si hay
 * progresión, si se repiten grados. El modelo recibe esto ya resuelto y no
 * puede equivocarse en ello ni inventarlo.
 *
 * Todo lo que aparece aquí tiene procedencia `structural`.
 */
export function buildReadout(cards: DrawnCard[]): StructuralReadout {
  const ordered = [...cards].sort((a, b) => a.order - b.order);
  const entries = ordered.map((c) => requireCard(c.slug));

  const suitsPresent = SUIT_ORDER.filter((s) =>
    entries.some((c) => c.suit === s),
  );
  const suitsAbsent = SUIT_ORDER.filter((s) => !suitsPresent.includes(s));

  const suitCounts = new Map<Suit, number>();
  for (const c of entries) {
    if (c.suit) suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }
  let dominant: Suit | null = null;
  let top = 0;
  let tie = false;
  for (const [s, n] of suitCounts) {
    if (n > top) {
      top = n;
      dominant = s;
      tie = false;
    } else if (n === top) {
      tie = true;
    }
  }
  if (tie || top < 2) dominant = null;

  const majorCount = entries.filter((c) => c.arcana === "major").length;
  const courtCount = entries.filter((c) => c.is_court).length;
  const minorCount = entries.length - majorCount;

  const numbers = entries
    .map((c) => (c.arcana === "major" ? c.number : c.degree))
    .filter((n): n is number => typeof n === "number" && n <= 10);

  const seen = new Map<number, number>();
  for (const n of numbers) seen.set(n, (seen.get(n) ?? 0) + 1);
  const repeated = [...seen.entries()]
    .filter(([, n]) => n > 1)
    .map(([v]) => v)
    .sort((a, b) => a - b);

  let direction: StructuralReadout["numeric_direction"] = "n/a";
  if (numbers.length >= 2) {
    const asc = numbers.every((n, i) => i === 0 || n > numbers[i - 1]);
    const desc = numbers.every((n, i) => i === 0 || n < numbers[i - 1]);
    const flat = numbers.every((n) => n === numbers[0]);
    direction = flat
      ? "flat"
      : asc
        ? "ascending"
        : desc
          ? "descending"
          : "mixed";
  }

  const notes: string[] = [];

  if (dominant) {
    notes.push(
      `${top} de ${entries.length} cartas pertenecen a ${SUITS[dominant].label}.`,
    );
  }
  if (suitsAbsent.length && suitsPresent.length) {
    notes.push(
      `No aparece ningún ${suitsAbsent.map((s) => SUITS[s].label).join(", ")}.`,
    );
  }
  if (majorCount === 0 && entries.length > 0) {
    notes.push(
      "No hay Arcanos Mayores: la tirada se mueve en el plano de lo cotidiano y concreto.",
    );
  } else if (majorCount === entries.length) {
    notes.push(
      "Todas las cartas son Arcanos Mayores: la tirada se plantea en un plano estructural o de fondo.",
    );
  } else if (majorCount > 0) {
    notes.push(
      `${majorCount} Arcano${majorCount > 1 ? "s" : ""} Mayor${majorCount > 1 ? "es" : ""} entre ${entries.length} cartas.`,
    );
  }
  if (repeated.length) {
    notes.push(`Se repite el grado ${repeated.join(" y ")}.`);
  }
  if (direction === "ascending") {
    notes.push(`Progresión numérica ascendente: ${numbers.join(" → ")}.`);
  } else if (direction === "descending") {
    notes.push(`Progresión numérica descendente: ${numbers.join(" → ")}.`);
  }
  if (courtCount) {
    notes.push(
      `${courtCount} figura${courtCount > 1 ? "s" : ""} en la tirada: aparece la dimensión de las personas o de los roles.`,
    );
  }

  const hasReversed = ordered.some((c) => c.orientation === "reversed");
  if (hasReversed) {
    notes.push(
      "Hay cartas invertidas. En el Tarot de Marsella la inversión no es un significado opuesto automático; conviene tratarla como matiz de orientación.",
    );
  }

  return {
    suits_present: suitsPresent,
    suits_absent: suitsAbsent,
    dominant_suit: dominant,
    major_count: majorCount,
    minor_count: minorCount,
    court_count: courtCount,
    numbers,
    repeated_numbers: repeated,
    numeric_direction: direction,
    has_reversed: hasReversed,
    notes,
  };
}
