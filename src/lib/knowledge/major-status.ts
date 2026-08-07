import type { CardSlug } from "@/lib/types";

/**
 * Estado de producción de los 22 Arcanos Mayores.
 *
 * Existe porque conté ocho cartas y escribí diez. Una cuenta a mano en medio de
 * una conversación se equivoca, y el estado del mazo no puede depender de eso:
 * aquí se apunta una vez, y `node scripts/estado.mjs` lo lee.
 *
 * Una carta entra en APROBADAS cuando su ilustración ha pasado el canon
 * semántico entero y el visual. No cuando está generada: cuando está aprobada.
 */

/** Ilustración generada, revisada y aceptada. */
export const APROBADAS: CardSlug[] = [
  "arcano-00", // El Loco — v3, con el bastón en la mano
  "arcano-02", // La Papisa — v2, un solo libro y el velo al fondo
  "arcano-03", // La Emperatriz
  "arcano-04", // El Emperador — la MAESTRA, congelada
  "arcano-05", // El Papa — pendiente la edición de la cartela
  "arcano-07", // El Carro
  "arcano-08", // La Justicia
  "arcano-09", // El Ermitaño
  "arcano-10", // La Rueda de la Fortuna
  "arcano-12", // El Colgado — v4, seis muñones por tronco y numerales corregidos
  "arcano-13", // El XIII — v2, esqueleto descubierto
  "arcano-14", // Templanza
  "arcano-16", // La Torre
  "arcano-18", // La Luna
  "arcano-21", // El Mundo
];

/**
 * Ediciones menores pendientes sobre cartas ya aprobadas.
 *
 * Se apuntan para que no se pierdan: una carta aprobada con una corrección
 * pendiente sigue siendo aprobada, pero el archivo final no es el que hay.
 */
export const RETOQUES_PENDIENTES: Record<CardSlug, string> = {
  "arcano-05": "Quitar el recuadro que rodea el nombre y devolver la regla verdosa.",
  "arcano-07": "Comprobar el numeral del canto derecho: puede estar invertido.",
  "arcano-14": "Numeral del canto derecho invertido: dice IIIIX.",
  "arcano-16": "Comprobar el numeral del canto derecho: puede estar invertido.",
  "arcano-18": "Comprobar el numeral del canto derecho: puede estar invertido.",
  "arcano-21": "Numeral del canto derecho invertido: dice IXX.",
};

/** La referencia visual de toda la baraja. No se regenera nunca. */
export const MAESTRA: CardSlug = "arcano-04";
