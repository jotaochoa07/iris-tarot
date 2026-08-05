import { CARDS } from "@/lib/knowledge/cards";
import type { DrawnCard } from "@/lib/types";

/**
 * Barajar y sacar, para quien no tiene una baraja delante.
 *
 * Una advertencia que el producto sostiene entera: esto NO es equivalente a
 * echar las cartas. Falta el gesto de barajar con una pregunta en la cabeza,
 * que es donde ocurre casi todo lo que el Tarot tiene de útil. Es una manera de
 * practicar la lectura de estructuras, no de consultar.
 *
 * Por eso la tirada queda marcada como simulada y así se guarda en el Diario:
 * mezclarla con las reales estropearía el único registro honesto que hay.
 */

/**
 * Fisher-Yates con la entropía del sistema.
 *
 * `Math.random` no está pensado para esto. Como el gesto de barajar ya se ha
 * perdido, al menos que el reparto no sea peor que el de una baraja bien
 * mezclada.
 */
function shuffled<T>(items: readonly T[]): T[] {
  const a = [...items];
  const bytes = new Uint32Array(a.length);
  crypto.getRandomValues(bytes);
  for (let i = a.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface DrawOptions {
  count: number;
  /** Si el reparto puede sacar cartas invertidas. */
  allowReversed?: boolean;
  /** Limitar a los 22 Arcanos Mayores, como se estudia al principio. */
  majorsOnly?: boolean;
}

export function drawSpread({
  count,
  allowReversed = false,
  majorsOnly = false,
}: DrawOptions): DrawnCard[] {
  const pool = majorsOnly ? CARDS.filter((c) => c.arcana === "major") : CARDS;
  const n = Math.min(Math.max(count, 1), Math.min(12, pool.length));

  const flips = new Uint8Array(n);
  if (allowReversed) crypto.getRandomValues(flips);

  return shuffled(pool)
    .slice(0, n)
    .map((c, i) => ({
      slug: c.slug,
      order: i + 1,
      // Una carta invertida es una decisión de lectura, no de azar puro: solo
      // aparece si se ha pedido, y con menos frecuencia que la mitad.
      orientation:
        allowReversed && flips[i] < 64 ? ("reversed" as const) : ("upright" as const),
      confidence: null,
      alternative_slug: null,
      confirmed_by_user: true,
    }));
}
