import type { Suit, SourceRef } from "@/lib/types";

/**
 * Territorio simbólico de los cuatro palos.
 *
 * Capa 1 del corpus: redacción original de IRIS, atribuida al sistema de
 * Jodorowsky/Costa. No es una transcripción del libro. Cuando la capa 2 (RAG
 * privado sobre tus PDFs) esté activa, cada entrada podrá ampliarse con
 * localizadores verificables.
 */

export const JODO: SourceRef = {
  school: "jodorowsky-costa",
  author: "Alejandro Jodorowsky y Marianne Costa",
  work: "La vía del Tarot",
  locator: null,
  via: "structured-kb",
  note: "Atribución de sistema. Redacción original de IRIS; localizador no verificado.",
};

export interface SuitEntry {
  id: Suit;
  label: string;
  singular: string;
  /** Elemento tradicionalmente asociado. */
  element: string;
  /** Qué territorio de la experiencia recoge este palo. */
  territory: string;
  /** Cómo se manifiesta cuando domina una tirada. */
  when_dominant: string;
  /** Qué falta cuando el palo no aparece. */
  when_absent: string;
  /** Cómo está construido el signo del palo en la iconografía de Marsella. */
  sign_construction: string;
  /** Pigmentos habituales del signo en las ediciones clásicas. */
  palette: string[];
}

export const SUITS: Record<Suit, SuitEntry> = {
  bastos: {
    id: "bastos",
    label: "Bastos",
    singular: "Basto",
    element: "fuego",
    territory:
      "la energía creativa y sexual, el deseo, el impulso que empuja a hacer. Es el territorio de lo que quiere manifestarse: proyectos, iniciativa, potencia vital.",
    when_dominant:
      "la tirada habla de energía disponible, de ganas, de algo que empuja desde dentro. Conviene preguntarse hacia dónde se dirige esa fuerza.",
    when_absent:
      "puede faltar impulso, deseo o iniciativa: la situación se comprende o se siente, pero todavía no se mueve.",
    sign_construction:
      "bastones vegetales cruzados en celosía, con las puntas hacia fuera. En los números impares aparece además un bastón vertical en el eje central.",
    palette: ["marseille-red", "marseille-blue", "marseille-flesh"],
  },
  copas: {
    id: "copas",
    label: "Copas",
    singular: "Copa",
    element: "agua",
    territory:
      "la vida emocional y receptiva: el amor, el vínculo, la capacidad de recibir y de contener. Es el territorio de lo que se siente antes de poder nombrarse.",
    when_dominant:
      "la tirada se juega en el plano afectivo. La pregunta, aunque sea práctica, tiene una raíz emocional.",
    when_absent:
      "puede haber lucidez o acción sin conexión emocional: se piensa o se hace, pero no se siente.",
    sign_construction:
      "copas de pie ancho dispuestas en filas simétricas, unidas por ornamento vegetal. El recipiente es cóncavo: está construido para recibir.",
    palette: ["marseille-blue", "marseille-red", "marseille-yellow"],
  },
  espadas: {
    id: "espadas",
    label: "Espadas",
    singular: "Espada",
    element: "aire",
    territory:
      "el intelecto y la palabra: pensar, distinguir, nombrar, decidir, cortar. Es el territorio donde se separa una cosa de otra para poder verla.",
    when_dominant:
      "la tirada trata de ideas, conversaciones, decisiones o conflictos mentales. Hay algo que necesita ser dicho o comprendido con precisión.",
    when_absent:
      "puede faltar claridad, formulación o distancia crítica: se siente o se actúa sin haberlo pensado.",
    sign_construction:
      "espadas curvas entrelazadas formando una elipse cerrada. En los números impares una espada recta atraviesa el conjunto por el eje vertical.",
    palette: ["marseille-blue", "marseille-yellow", "marseille-red"],
  },
  oros: {
    id: "oros",
    label: "Oros",
    singular: "Oro",
    element: "tierra",
    territory:
      "la materia y el cuerpo: el dinero, la salud, lo concreto, lo que se puede tocar y contar. Es el territorio de lo que ya tiene forma.",
    when_dominant:
      "la tirada apunta a lo concreto: recursos, cuerpo, trabajo, condiciones materiales.",
    when_absent:
      "puede faltar concreción o anclaje: la situación existe en la idea o en el deseo, pero no todavía en el mundo.",
    sign_construction:
      "discos circulares con roseta interior, distribuidos en retícula sobre fondo de vegetación. La forma es cerrada y repetida: lo material se cuenta.",
    palette: ["marseille-yellow", "marseille-red", "marseille-green"],
  },
};

export const SUIT_ORDER: Suit[] = ["bastos", "copas", "espadas", "oros"];
