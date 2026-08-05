import type { CardSlug, DrawnCard, Orientation } from "@/lib/types";
import { MAJOR_ATTRIBUTES, type Gaze, type MajorAttributes } from "./major-attributes";
import { requireCard } from "./cards";

/**
 * Relaciones entre Arcanos Mayores dentro de una tirada.
 *
 * Aquí es donde la ficha de atributos deja de ser documentación y se convierte
 * en producto. Todo lo que sale de este archivo es un HECHO comprobable
 * mirando las cartas: quién mira a quién, qué objeto se repite, cuántas figuras
 * están sentadas. Procedencia `structural`, nunca `interpretation`.
 *
 * ---------------------------------------------------------------------------
 * REGLA DURA DE REDACCIÓN
 *
 * Este módulo NUNCA dice lo que algo significa, ni lo insinúa. Nada de «esto
 * quiere decir», «no es casualidad», «llama la atención», «conviven la quietud
 * y el movimiento». Todo eso son lecturas, y aquí solo se cuenta y se señala.
 *
 * La prueba es simple: si dos personas mirando las mismas cartas pudieran
 * discrepar de la frase, la frase no pertenece a este archivo.
 *
 * Interpretar viene después, en otra capa, y se presenta como lo que es.
 * ---------------------------------------------------------------------------
 */

export type RelationKind =
  | "mirada"
  | "simbolo"
  | "postura"
  | "tocado"
  | "orientacion"
  | "presencia";

export interface StructuralNote {
  kind: RelationKind;
  text: string;
  /** Cartas implicadas, para que la interfaz pueda señalarlas. */
  cards: CardSlug[];
}

/* ---------------------------------------------------------------------------
 * Una carta invertida mira al revés
 * ------------------------------------------------------------------------- */

const FLIP: Record<Gaze, Gaze> = {
  izquierda: "derecha",
  derecha: "izquierda",
  arriba: "abajo",
  abajo: "arriba",
  "al frente": "al frente",
  "n/a": "n/a",
};

/**
 * Girar una carta 180° intercambia su izquierda y su derecha.
 *
 * Parece obvio y es justo lo que se olvida: si el Emperador mira a la izquierda
 * y sale invertido, mira a la derecha, y entonces la pareja que formaba con su
 * vecina se deshace o se crea. La geometría no opina.
 */
function gazeOf(a: MajorAttributes, orientation: Orientation): Gaze {
  return orientation === "reversed" ? FLIP[a.mirada] : a.mirada;
}

interface Present {
  slug: CardSlug;
  order: number;
  attrs: MajorAttributes;
  gaze: Gaze;
  name: string;
}

function majorsIn(cards: DrawnCard[]): Present[] {
  return [...cards]
    .sort((a, b) => a.order - b.order)
    .flatMap((d) => {
      const attrs = MAJOR_ATTRIBUTES[d.slug];
      if (!attrs) return [];
      return [
        {
          slug: d.slug,
          order: d.order,
          attrs,
          gaze: gazeOf(attrs, d.orientation),
          name: requireCard(d.slug).name,
        },
      ];
    });
}

/* ---------------------------------------------------------------------------
 * Cálculo
 * ------------------------------------------------------------------------- */

export function majorRelations(cards: DrawnCard[]): StructuralNote[] {
  const majors = majorsIn(cards);
  if (majors.length === 0) return [];

  const notes: StructuralNote[] = [];

  /* --- Miradas entre vecinas --------------------------------------------
   * Solo entre cartas contiguas: dos figuras separadas por una tercera no se
   * están mirando, están mirando por encima de alguien. */
  for (let i = 0; i < majors.length - 1; i++) {
    const a = majors[i];
    const b = majors[i + 1];

    if (a.gaze === "derecha" && b.gaze === "izquierda") {
      notes.push({
        kind: "mirada",
        text: `${a.name} mira hacia la derecha y ${b.name}, que está a su lado, mira hacia la izquierda: las dos miradas se cruzan.`,
        cards: [a.slug, b.slug],
      });
    } else if (a.gaze === "izquierda" && b.gaze === "derecha") {
      notes.push({
        kind: "mirada",
        text: `${a.name} mira hacia la izquierda y ${b.name}, que está a su lado, mira hacia la derecha: las dos miradas se alejan.`,
        cards: [a.slug, b.slug],
      });
    } else if (
      a.gaze === b.gaze &&
      (a.gaze === "izquierda" || a.gaze === "derecha")
    ) {
      notes.push({
        kind: "mirada",
        text: `${a.name} ${y(b.name)} ${b.name} miran en la misma dirección, hacia la ${a.gaze}.`,
        cards: [a.slug, b.slug],
      });
    }
  }

  /* --- Quién te mira a ti ------------------------------------------------ */
  const frontales = majors.filter((m) => m.gaze === "al frente");
  if (frontales.length > 0 && frontales.length === majors.length && majors.length > 1) {
    notes.push({
      kind: "mirada",
      text: `Las ${majors.length} figuras miran al frente, hacia quien tiene la tirada delante. Ninguna mira a otra carta.`,
      cards: frontales.map((m) => m.slug),
    });
  } else if (frontales.length === 1 && majors.length > 1) {
    notes.push({
      kind: "mirada",
      text: `${frontales[0].name} es la única que mira al frente, mientras las demás miran a un lado.`,
      cards: [frontales[0].slug],
    });
  }

  /* --- Objetos que se repiten -------------------------------------------
   * Se cuenta la repetición y se nombra. Qué implique, aquí no se dice. */
  const porSimbolo = new Map<string, Present[]>();
  for (const m of majors) {
    for (const s of m.attrs.simbolos) {
      const clave = normalizar(s);
      const lista = porSimbolo.get(clave) ?? [];
      lista.push(m);
      porSimbolo.set(clave, lista);
    }
  }
  const yaDicho = new Set<string>();
  for (const [clave, lista] of porSimbolo) {
    if (lista.length < 2) continue;
    yaDicho.add(clave);
    notes.push({
      kind: "simbolo",
      text: `${capitalizar(clave)}: aparece en ${listar(lista.map((m) => m.name))}.`,
      cards: lista.map((m) => m.slug),
    });
  }

  /* --- Tocados repetidos ------------------------------------------------- */
  const porTocado = new Map<string, Present[]>();
  for (const m of majors) {
    if (!m.attrs.tocado) continue;
    const clave = normalizar(m.attrs.tocado);
    const lista = porTocado.get(clave) ?? [];
    lista.push(m);
    porTocado.set(clave, lista);
  }
  for (const [clave, lista] of porTocado) {
    // Si ya se ha dicho como símbolo, decirlo otra vez como tocado es ruido.
    if (lista.length < 2 || yaDicho.has(clave)) continue;
    notes.push({
      kind: "tocado",
      text: `${capitalizar(clave)}: el mismo tocado en ${listar(lista.map((m) => m.name))}.`,
      cards: lista.map((m) => m.slug),
    });
  }

  /* --- Postura ----------------------------------------------------------- */
  if (majors.length > 1) {
    const posturas = new Set(majors.map((m) => m.attrs.postura));
    if (posturas.size === 1) {
      const p = majors[0].attrs.postura;
      if (p !== "sin figura") {
        notes.push({
          kind: "postura",
          text: `Las ${majors.length} figuras están ${p === "sentado" ? "sentadas" : p === "de pie" ? "de pie" : p}.`,
          cards: majors.map((m) => m.slug),
        });
      }
    } else {
      const sentadas = majors.filter((m) => m.attrs.postura === "sentado");
      const enMarcha = majors.filter((m) => m.attrs.postura === "caminando");
      if (sentadas.length && enMarcha.length) {
        notes.push({
          kind: "postura",
          text:
            `En ${listar(sentadas.map((m) => m.name))} la figura está sentada; ` +
            `en ${listar(enMarcha.map((m) => m.name))} camina.`,
          cards: [...sentadas, ...enMarcha].map((m) => m.slug),
        });
      }
    }
  }

  /* --- Cómo se ofrecen a quien mira -------------------------------------- */
  /**
   * Cuánto se aparta la figura de quien la mira.
   *
   * No basta la orientación del cuerpo: la Papisa y la Emperatriz están las dos
   * de frente, pero una mira al observador y la otra ha girado la cabeza. El
   * grado de retirada es cuerpo + cabeza.
   */
  const giro = (m: Present): number => {
    const cuerpo = { frontal: 0, "tres cuartos": 2, perfil: 3, "n/a": -1 }[
      m.attrs.orientacion
    ];
    if (cuerpo < 0) return -1;
    const cabeza = m.gaze === "al frente" ? 0 : 1;
    return cuerpo + cabeza;
  };
  const validas = majors.filter((m) => giro(m) >= 0);
  if (validas.length >= 3) {
    const vals = validas.map(giro);
    const sube = vals.every((v, i) => i === 0 || v > vals[i - 1]);
    const baja = vals.every((v, i) => i === 0 || v < vals[i - 1]);
    if (sube) {
      notes.push({
        kind: "orientacion",
        text: "De la primera a la última, cada figura está más girada respecto a quien mira: de frente, luego de tres cuartos, luego de perfil.",
        cards: validas.map((m) => m.slug),
      });
    } else if (baja) {
      notes.push({
        kind: "orientacion",
        text: "De la primera a la última, cada figura está menos girada respecto a quien mira: de perfil, luego de tres cuartos, luego de frente.",
        cards: validas.map((m) => m.slug),
      });
    }
  }

  /* --- Cartas sin nadie -------------------------------------------------- */
  const vacias = majors.filter((m) => m.attrs.postura === "sin figura");
  if (vacias.length) {
    notes.push({
      kind: "presencia",
      text: `${listar(vacias.map((m) => m.name))} no ${vacias.length > 1 ? "tienen" : "tiene"} ninguna figura humana entera.`,
      cards: vacias.map((m) => m.slug),
    });
  }

  /* --- Quién da la espalda ----------------------------------------------- */
  const deEspaldas = majors.filter((m) =>
    (m.attrs.bajo_los_pies ?? "").includes("de espaldas") ||
    m.attrs.observaciones.some((o) => o.includes("de espaldas")),
  );
  if (deEspaldas.length) {
    notes.push({
      kind: "presencia",
      text: `En ${listar(deEspaldas.map((m) => m.name))} hay figuras dibujadas de espaldas a quien mira la carta.`,
      cards: deEspaldas.map((m) => m.slug),
    });
  }

  return notes;
}

/* ---------------------------------------------------------------------------
 * Texto
 * ------------------------------------------------------------------------- */

function normalizar(s: string): string {
  return s.trim().toLowerCase();
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** «y», salvo delante de palabra que empieza por i- o hi-. */
function y(siguiente: string): string {
  return /^(i|hi)(?!e)/i.test(siguiente.trim()) ? "e" : "y";
}

/** «A», «A y B», «A, B y C». */
function listar(nombres: string[]): string {
  if (nombres.length === 1) return nombres[0];
  const ultimo = nombres[nombres.length - 1];
  return `${nombres.slice(0, -1).join(", ")} ${y(ultimo)} ${ultimo}`;
}
