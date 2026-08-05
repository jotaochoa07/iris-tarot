/**
 * IRIS Marseille Deck — pigmentos.
 *
 * La baraja se dibuja UNA vez. Lo que cambia entre estilos es el pigmento, no
 * la geometría: las mismas cuatro hojas curvas, el mismo eje recto, la misma
 * roseta de ocho pétalos. Por eso los estilos no son dos barajas, son dos
 * tiradas de imprenta de la misma plancha.
 *
 * Los tokens describen OFICIO, no color: `line` es el contorno del taco,
 * `accent` es el pigmento caro que solo se usa donde significa algo. Añadir un
 * estilo nuevo es rellenar esta tabla, sin tocar una sola curva.
 */

export type DeckStyleId = "iluminacion" | "nocturno";

export interface DeckPalette {
  id: DeckStyleId;
  label: string;
  /** Una frase para la interfaz. */
  note: string;
  /** Si el naipe es oscuro. La interfaz lo usa para ajustar sombras. */
  dark: boolean;

  field: string; // campo del naipe
  fieldAlt: string; // fondo de los recuadros interiores
  line: string; // contorno principal
  lineSoft: string; // filetes y nervaduras

  /** Los cuatro palos. Cada uno con su masa y su nervadura. */
  suits: Record<
    "espadas" | "bastos" | "copas" | "oros",
    { body: string; vein: string }
  >;

  axis: string; // el eje recto de los impares
  axisVein: string;
  gold: string; // rosetas, guarnición, numeral
  goldDeep: string;
  ember: string; // el rojo que marca el centro
  foliage: string;
  foliageBody: string;
}

export const PALETTES: Record<DeckStyleId, DeckPalette> = {
  iluminacion: {
    id: "iluminacion",
    label: "Iluminación",
    note: "Pergamino cálido, pigmento pleno. Para mirar el detalle.",
    dark: false,

    field: "#f1e7d2",
    fieldAlt: "#e7dbc0",
    line: "#241c14",
    lineSoft: "#8a7a63",

    suits: {
      espadas: { body: "#3b2d4a", vein: "#6b5a80" },
      bastos: { body: "#a8452c", vein: "#d99070" },
      copas: { body: "#2f5a86", vein: "#7ea3c4" },
      oros: { body: "#c9a23c", vein: "#8a6b3a" },
    },

    axis: "#b0392c",
    axisVein: "#e0a99c",
    gold: "#c9a23c",
    goldDeep: "#8a6b3a",
    ember: "#b0392c",
    foliage: "#557a4c",
    foliageBody: "#557a4c",
  },

  nocturno: {
    id: "nocturno",
    label: "Nocturno",
    note: "Fondo tinta y pan de oro. Para la tirada, donde manda el contraste.",
    dark: true,

    field: "#17130f",
    fieldAlt: "#241d17",
    line: "#e8dcc2",
    lineSoft: "#7d6535",

    suits: {
      espadas: { body: "#241d17", vein: "#7d6535" },
      bastos: { body: "#3a1f18", vein: "#b0644a" },
      copas: { body: "#1e2a33", vein: "#5f8bb0" },
      oros: { body: "#3a2f18", vein: "#c9a23c" },
    },

    axis: "#b0392c",
    axisVein: "#ffd9cd",
    gold: "#c9a23c",
    goldDeep: "#7d6535",
    ember: "#b0392c",
    foliage: "#4f6a46",
    foliageBody: "#25341f",
  },
};

export const DEFAULT_DECK_STYLE: DeckStyleId = "iluminacion";

export const DECK_STYLE_LIST = Object.values(PALETTES);
