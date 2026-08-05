/**
 * La baraja física del lector.
 *
 * El canon del Tarot de Marsella se escribió mirando el linaje Conver / Noblet
 * / Dodal, y los libros describen SUS colores. Cuando alguien lee con otra
 * edición y el libro habla de «las curvas azules», la frase deja de señalar
 * nada: el lector está mirando curvas marrones y concluye que no entiende.
 *
 * Este perfil existe para que IRIS sepa con qué cartas está mirando de verdad y
 * pueda hacer lo único honesto: traducir la observación del canon a lo que hay
 * sobre la mesa, y decirlo cuando no coincide. Eso enseña más que ocultarlo.
 *
 * Está escrito a partir de fotografías de la baraja, no de un catálogo. Todo lo
 * que no se ve con claridad se queda fuera: aquí no se inventa nada.
 */

export interface DeckProfile {
  id: string;
  label: string;
  /** Lo que hay que saber para no describir una carta que el lector no tiene. */
  notes: string[];
  /** Cómo se lee el número en esta edición. Afecta al reconocimiento visual. */
  numbering: string;
  /** Diferencias frente al linaje que describen los libros. */
  divergences: string[];
}

export const DECK_MARSELLA_ES: DeckProfile = {
  id: "marsella-es-leyendas",
  label: "Marsellesa española con leyendas adivinatorias impresas",
  numbering:
    "El numeral romano va impreso en los bordes laterales, girado 90 grados y repetido a izquierda y derecha, no en la parte superior.",
  notes: [
    "Cada carta lleva dos leyendas impresas en mayúsculas pequeñas: arriba «ADIVINACIÓN NORMAL» con palabras clave, y abajo, cabeza abajo, «ADIVINACIÓN INVERTIDA». Son una capa editorial de esta edición concreta, no del Tarot de Marsella. IRIS puede mencionarlas como lo que son —una interpretación fija impresa por el editor— pero jamás las trata como significado, y desde luego no como fuente.",
    "El texto invertido del borde inferior está impreso así siempre. Ver texto cabeza abajo no significa que la carta esté invertida.",
    "El campo interior está tintado y el tinte cambia de una carta a otra: azul muy pálido, blanco, verde pálido. No es el fondo crema uniforme de los facsímiles históricos, así que el color de fondo no significa nada por sí mismo.",
    "Borde blanco ancho con un doble filete rojo que enmarca el campo.",
    "Relleno plano y contorno negro, sin degradados ni sombreado.",
  ],
  divergences: [
    "La paleta no es la del Conver. Domina el rojo bermellón, el amarillo, un violeta intenso y un marrón muy oscuro casi negro. El azul saturado que los libros mencionan constantemente prácticamente no aparece: donde el canon dice «azul», esta baraja suele poner marrón oscuro o violeta.",
    "En Espadas, las hojas curvas son de trazo oscuro perfilado y la espada recta del eje va en rojo con empuñadura amarilla.",
    "En Bastos, los bastones van en rojo con nudos marcados, y el follaje que los acompaña combina amarillo y violeta.",
  ],
};

/** La baraja activa. Cuando IRIS admita varias, esto se leerá del perfil. */
export const ACTIVE_DECK = DECK_MARSELLA_ES;

/** Bloque listo para inyectar en el contexto de interpretación. */
export function deckBlock(deck: DeckProfile = ACTIVE_DECK): string {
  return `Edición: ${deck.label}.

Numeración: ${deck.numbering}

Cómo es esta baraja:
${deck.notes.map((n) => `- ${n}`).join("\n")}

En qué se aparta de la baraja que describen los libros:
${deck.divergences.map((d) => `- ${d}`).join("\n")}

REGLA. Los libros del corpus describen el linaje Conver/Noblet/Dodal. Cuando
una fuente mencione un color o un detalle que en esta edición se ve distinto,
NO repitas el dato del libro como si el lector lo tuviera delante. Haz una de
estas dos cosas:

  - Traduce la observación: si el canon señala «el hueco entre las curvas
    azules», tú dices «el hueco que se abre entre las curvas —en tu baraja van
    en marrón oscuro—». El detalle estructural es el mismo; el color, no.
  - O señala la diferencia como parte de la clase, cuando aporte: que una
    edición tiña los fondos o cambie los pigmentos enseña que el color es
    decisión de imprenta y la estructura no.

Nunca describas un elemento que esta edición no tiene. Si dudas de si está,
invítale a mirarlo en la carta física en vez de afirmarlo.`;
}
