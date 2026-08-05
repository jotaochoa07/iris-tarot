/**
 * IRIS Marseille Deck — geometría de los Arcanos Menores.
 *
 * Los cuarenta números del Tarot de Marsella no son ilustraciones: son
 * composiciones que obedecen a una regla. Tantos signos curvos entrelazados y,
 * si el número es impar, un eje recto que los atraviesa. Eso significa que se
 * pueden GENERAR, y que salen más coherentes entre sí de lo que sale cualquier
 * baraja impresa a mano.
 *
 * Aquí vive esa regla, en coordenadas. No hay colores: los pone la paleta.
 */

/**
 * Proporción 2:3, la misma a la que se generan los Arcanos Mayores.
 *
 * No es un detalle: si los Menores fueran 0.6 y los Mayores 0.667, al encajar
 * la imagen en el naipe habría que recortarla, y el recorte se comería la orla
 * justo por donde las 78 cartas tienen que coincidir.
 */
export const W = 400;
export const H = 600;
export const CX = W / 2;

/**
 * Zona útil.
 *
 * Por arriba deja sitio al numeral del centro; por abajo, a la doble regla y a
 * la cartela con el nombre. En un impar, la empuñadura del eje termina
 * exactamente en FIELD_BOT: nada asoma por debajo.
 */
export const FIELD_TOP = 104;
export const FIELD_BOT = 452;

/** Alto que ocupa guarda, puño y pomo bajo el eje. */
export const HILT_HEIGHT = 70;

export interface Mandorla {
  /** Vértice superior e inferior donde se juntan las dos hojas. */
  top: number;
  bot: number;
  /** Cuánto se abre hacia los lados. */
  half: number;
  /** Grosor de la hoja en su parte más ancha. */
  thick: number;
}

export interface Cross {
  top: number;
  bot: number;
  half: number;
  thick: number;
}

export interface Node {
  x: number;
  y: number;
  scale: number;
}

/**
 * Reparte los pares en uno o dos campos.
 *
 * Hasta tres pares caben anidados en un solo campo sin apelmazarse. A partir
 * de ahí el naipe se divide en dos, que es lo que hacen las barajas históricas
 * con los ochos y los dieces: no aprietan más, cambian de estructura.
 */
function fields(pairs: number): { top: number; bot: number; pairs: number }[] {
  if (pairs <= 3) {
    return [{ top: FIELD_TOP, bot: FIELD_BOT, pairs }];
  }
  const arriba = Math.floor(pairs / 2);
  const abajo = pairs - arriba;
  const mid = (FIELD_TOP + FIELD_BOT) / 2;
  return [
    { top: FIELD_TOP, bot: mid - 10, pairs: arriba },
    { top: mid + 10, bot: FIELD_BOT, pairs: abajo },
  ];
}

/** Mandorlas anidadas para Espadas. */
export function mandorlas(pairs: number): Mandorla[] {
  const out: Mandorla[] = [];
  for (const f of fields(pairs)) {
    const alto = f.bot - f.top;
    for (let i = 0; i < f.pairs; i++) {
      const k = i / Math.max(f.pairs, 1);
      out.push({
        top: f.top + alto * 0.09 * k,
        bot: f.bot - alto * 0.09 * k,
        half: 118 - i * 30,
        thick: 17 - i * 2.5,
      });
    }
  }
  return out;
}

/** Aspas cruzadas para Bastos. */
export function crosses(pairs: number): Cross[] {
  const out: Cross[] = [];
  for (const f of fields(pairs)) {
    const alto = f.bot - f.top;
    for (let i = 0; i < f.pairs; i++) {
      const k = i / Math.max(f.pairs, 1);
      out.push({
        top: f.top + alto * 0.1 * k,
        bot: f.bot - alto * 0.1 * k,
        half: 112 - i * 28,
        thick: 11 - i * 1.4,
      });
    }
  }
  return out;
}

/**
 * Retícula para Copas y Oros.
 *
 * Estos dos palos no se entrelazan: se ordenan. Filas de a dos y, en los
 * impares, un signo suelto en el eje — que es exactamente la misma regla del
 * eje recto de Espadas y Bastos, dicha de otra manera.
 */
export function grid(n: number): Node[] {
  const odd = n % 2 === 1;
  const pairs = Math.floor(n / 2);
  const out: Node[] = [];

  if (n === 1) return [{ x: CX, y: (FIELD_TOP + FIELD_BOT) / 2, scale: 2.2 }];

  const alto = FIELD_BOT - FIELD_TOP;
  const filas = Math.max(pairs, 1);
  const paso = alto / (filas + (odd ? 1 : 0));
  const escala = filas >= 4 ? 0.78 : filas >= 3 ? 0.9 : 1;

  for (let i = 0; i < pairs; i++) {
    const y = FIELD_TOP + paso * (i + 0.5) + (odd ? paso * 0.5 : 0);
    out.push({ x: CX - 66, y, scale: escala });
    out.push({ x: CX + 66, y, scale: escala });
  }

  if (odd) {
    // El signo del eje va arriba en los bajos y al centro en los altos: así el
    // naipe no queda descabezado.
    const y = n <= 5 ? FIELD_TOP + paso * 0.55 : (FIELD_TOP + FIELD_BOT) / 2;
    out.push({ x: CX, y, scale: escala * 1.12 });
  }

  return out;
}

/* ---------------------------------------------------------------------------
 * Trazados
 * ------------------------------------------------------------------------- */

/**
 * Una hoja curva: no un trazo, una forma maciza que se afila.
 *
 * `side` -1 es la hoja izquierda, 1 la derecha. Se dibuja el filo exterior
 * hasta la punta y se vuelve por el interior, de modo que la silueta se
 * estrecha en los dos vértices como una hoja de verdad.
 */
export function bladePath(m: Mandorla, side: 1 | -1): string {
  const { top, bot, half, thick } = m;
  const cy = (top + bot) / 2;
  const xo = CX + side * half;
  const xi = CX + side * (half - thick);
  const k = (bot - top) * 0.28;

  return [
    `M${CX},${bot}`,
    `C${CX + side * half * 0.62},${bot - k * 0.7} ${xo},${cy + k} ${xo},${cy}`,
    `C${xo},${cy - k} ${CX + side * half * 0.62},${top + k * 0.7} ${CX},${top}`,
    `C${CX + side * (half - thick) * 0.6},${top + k * 0.78} ${xi},${cy - k * 0.9} ${xi},${cy}`,
    `C${xi},${cy + k * 0.9} ${CX + side * (half - thick) * 0.6},${bot - k * 0.78} ${CX},${bot}`,
    "Z",
  ].join(" ");
}

/** Nervadura interior de la hoja. */
export function veinPath(m: Mandorla, side: 1 | -1): string {
  const { top, bot, half, thick } = m;
  const cy = (top + bot) / 2;
  const x = CX + side * (half - thick * 0.5);
  const k = (bot - top) * 0.26;
  return [
    `M${CX},${bot - 14}`,
    `C${CX + side * half * 0.58},${bot - k} ${x},${cy + k * 0.8} ${x},${cy}`,
    `C${x},${cy - k * 0.8} ${CX + side * half * 0.58},${top + k} ${CX},${top + 14}`,
  ].join(" ");
}

/** Bastón en diagonal, con los extremos cortados en bisel. */
export function batonPath(c: Cross, dir: 1 | -1): string {
  const { top, bot, half, thick } = c;
  const x1 = CX - dir * half;
  const x2 = CX + dir * half;
  const t = thick / 2;
  return [
    `M${x1 - t},${top + t}`,
    `L${x1 + t},${top - t}`,
    `L${x2 + t},${bot - t}`,
    `L${x2 - t},${bot + t}`,
    "Z",
  ].join(" ");
}

/** El eje recto de los impares: hoja afilada, de la punta al talón. */
export function axisPath(top: number, bot: number, w = 10): string {
  const h = w / 2;
  return [
    `M${CX},${top}`,
    `L${CX + h},${top + 46}`,
    `L${CX + h - 0.6},${bot}`,
    `L${CX - h + 0.6},${bot}`,
    `L${CX - h},${top + 46}`,
    "Z",
  ].join(" ");
}
