import type { DrawnCard, SpreadPosition, SpreadType } from "@/lib/types";
import { CARDS, requireCard } from "@/lib/knowledge/cards";
import { buildReadout } from "@/lib/knowledge/readout";
import { retrieveForSpread } from "@/lib/knowledge/retrieval";
import {
  IRIS_VOICE,
  JSON_DISCIPLINE,
  NON_DETERMINISM_REMINDER,
} from "./voice";
import {
  MODEL_READING,
  MODEL_VISION,
  jsonCall,
} from "./anthropic";
import {
  archetypesSchema,
  detectionSchema,
  learnSchema,
  reflectSchema,
  type ArchetypesResult,
  type DetectionResult,
  type LearnResult,
  type ReflectResult,
} from "./schemas";

/* ===========================================================================
 * 1. Detección por visión
 *
 * Devuelve una PROPUESTA, nunca una certeza. La confirmación del usuario es
 * obligatoria antes de interpretar (§8 del brief). Por eso el modelo está
 * instruido para declarar dudas en lugar de disimularlas.
 * ========================================================================= */

const SLUG_INDEX = CARDS.map((c) => `${c.slug} = ${c.name}`).join("\n");

const DETECT_SYSTEM = `Eres el módulo de reconocimiento visual de IRIS.

Recibes la fotografía de una tirada física de Tarot de Marsella y devuelves las
cartas que crees ver, en el orden en que están dispuestas: de izquierda a
derecha y, si hay varias filas, de arriba abajo.

Catálogo de identificadores válidos (usa EXACTAMENTE estos slugs):
${SLUG_INDEX}

Reglas:

1. EL NUMERAL IMPRESO MANDA. Muchas ediciones imprimen el número romano de la
   carta (I, II, III, IIII, V, VI, VII, VIII, VIIII, X). Búscalo SIEMPRE antes
   de contar nada, y búscalo en los cuatro bordes:
   - arriba y abajo, en horizontal;
   - en los laterales izquierdo y derecho, GIRADO 90 GRADOS. Es el sitio más
     frecuente y el más fácil de pasar por alto. Muchas ediciones lo repiten a
     ambos lados, pequeño y en el mismo tono que la orla.
   Si lo lees, ese es el número: no lo contradigas contando signos, y la
   confianza es alta. Contar es solo el método de reserva.

2. PARIDAD: el eje recto decide. En Espadas y Bastos, una pieza RECTA que
   atraviesa la composición por el centro aparece únicamente en los números
   IMPARES. Es una regla dura de la baraja:
   - Hay espada o bastón recto vertical en el centro → el número es IMPAR
     (I, III, V, VII, VIIII). Nunca puede ser par.
   - No hay eje recto, solo piezas curvas o cruzadas → el número es PAR
     (II, IIII, VI, VIII, X).
   Comprueba esta coherencia antes de responder. Si tu recuento da un número
   par pero ves eje recto, tu recuento está mal.

3. Método de reserva, si no hay numeral legible: cuenta las piezas CURVAS
   completas —no cada mitad de un arco— y suma una si hay eje recto. Cuatro
   curvas más un eje recto son cinco: un V, no un VIII.

4. ORIENTACIÓN. Muchas ediciones imprimen texto en los DOS extremos de la
   carta: el significado al derecho arriba y el invertido abajo, cabeza abajo.
   Ver texto invertido en la parte inferior NO significa que la carta esté
   invertida — es así como está impresa. Decide la orientación solo por la
   figura o la composición del dibujo. Ante la duda, "upright".

5. La confianza es información de producto, no un defecto. Si una carta no se
   ve bien, baja la confianza y explica por qué en "reasoning".

6. Si dudas entre dos cartas, pon la más probable en "slug" y la otra en
   "alternative_slug". Si no dudas, "alternative_slug" es null.

7. Si en la imagen no hay ninguna carta reconocible, devuelve "cards": [] y
   explícalo en "overall_note".

8. Nunca inventes una carta para rellenar. Es preferible devolver menos cartas.

9. Las palabras impresas en algunas ediciones ("conquista", "derrota",
   "riqueza") son una capa editorial de esa baraja. Úsalas como pista de
   identificación si ayudan, jamás como significado.

${JSON_DISCIPLINE}

Esquema:
{
  "cards": [
    { "order": 1, "slug": "espadas-01", "orientation": "upright",
      "confidence": 0.0-1.0, "alternative_slug": null, "reasoning": "..." }
  ],
  "layout_note": "cómo estaban dispuestas espacialmente, o null",
  "overall_note": "advertencia general si la hay, o null"
}`;

export async function detectCards(input: {
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<DetectionResult> {
  const result = await jsonCall({
    model: MODEL_VISION,
    system: DETECT_SYSTEM,
    schema: detectionSchema,
    maxTokens: 2000,
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: input.mediaType,
          data: input.imageBase64,
        },
      },
      {
        type: "text",
        text: "Identifica las cartas de esta tirada. Devuelve solo el JSON.",
      },
    ],
  });

  // Descartamos cualquier slug que el modelo se haya inventado.
  const invalid: string[] = [];
  const valid = result.cards.filter((c) => {
    try {
      requireCard(c.slug);
      return true;
    } catch {
      invalid.push(c.slug);
      return false;
    }
  });

  console.log(
    `[IRIS] visión (${MODEL_VISION}): ${result.cards.length} propuestas, ` +
      `${valid.length} válidas` +
      (invalid.length ? `, descartadas: ${invalid.join(", ")}` : "") +
      (result.overall_note ? ` · nota: ${result.overall_note}` : ""),
  );

  const note =
    valid.length === 0
      ? result.overall_note ??
        (invalid.length
          ? `El modelo propuso cartas que no existen en el catálogo (${invalid.join(", ")}). Elige las cartas a mano.`
          : "No he identificado ninguna carta en la fotografía. Puede ser el encuadre, la luz o el ángulo. Añádelas a mano y seguimos.")
      : result.overall_note;

  return {
    ...result,
    overall_note: note,
    cards: valid.map((c, i) => ({ ...c, order: i + 1 })),
  };
}

/* ===========================================================================
 * 2. Contexto compartido de interpretación
 * ========================================================================= */

export interface SpreadInput {
  cards: DrawnCard[];
  question: string | null;
  spreadType: SpreadType;
  positions: SpreadPosition[];
  personLabel: string;
  isGuest: boolean;
}

const SPREAD_LABELS: Record<SpreadType, string> = {
  open: "Secuencia abierta, sin posiciones predefinidas",
  "past-present-future": "Pasado / Presente / Futuro",
  "situation-obstacle-advice": "Situación / Obstáculo / Consejo",
  "self-other-relationship": "Yo / El otro / La relación",
  custom: "Posiciones personalizadas",
};

function buildContext(input: SpreadInput): string {
  const readout = buildReadout(input.cards);
  const ctx = retrieveForSpread(input.cards);
  const ordered = [...input.cards].sort((a, b) => a.order - b.order);

  const cardBlocks = ctx.cards
    .map((c, i) => {
      const drawn = ordered[i];
      const position = input.positions.find((p) => p.order === drawn.order);
      return [
        `### ${i + 1}. ${c.name}${drawn.orientation === "reversed" ? " (invertida)" : ""}`,
        position ? `Posición asignada: ${position.label}` : null,
        `Familia: ${c.arcana === "major" ? "Arcano Mayor" : "Arcano Menor"}`,
        c.suit_label ? `Palo: ${c.suit_label} — ${c.suit_territory}` : null,
        c.suit_sign_construction
          ? `Construcción del signo del palo: ${c.suit_sign_construction}`
          : null,
        c.degree_label
          ? `Grado ${c.degree_label}: ${c.degree_gesture}`
          : null,
        c.degree_observe ? `Qué observar del grado: ${c.degree_observe}` : null,
        c.major_axis ? `Eje del arcano: ${c.major_axis}` : null,
        c.major_observe ? `Qué observar: ${c.major_observe}` : null,
        `Composición gráfica verificable: ${c.visual}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const corpus = ctx.corpus_enabled
    ? ctx.corpus_passages.length
      ? ctx.corpus_passages
          .map(
            (p) =>
              `- «${p.text}» — ${p.source.author}, ${p.source.work ?? "s/t"}${
                p.source.locator ? `, ${p.source.locator}` : ", localizador no disponible"
              }`,
          )
          .join("\n")
      : "La capa 2 está activa pero no ha devuelto pasajes relevantes. No atribuyas nada a una fuente por este motivo."
    : "La capa 2 (corpus privado) está desactivada. Solo dispones de la base estructurada. Ninguna afirmación puede llevar via='corpus-retrieval'.";

  return `## Pregunta de la persona
${input.question ? `«${input.question}»` : "No formuló una pregunta específica. Trata la tirada como una lectura abierta."}

## A quién pertenece esta tirada
${input.isGuest ? `Es una lectura hecha para otra persona: ${input.personLabel}. Habla de esa persona en tercera persona cuando corresponda, y dirígete a quien lee.` : "Es una tirada propia de quien está leyendo."}

## Estructura
${SPREAD_LABELS[input.spreadType]}
${input.positions.length ? input.positions.map((p) => `${p.order}. ${p.label}`).join("\n") : ""}

## Lectura estructural (calculada, no inferida — procedencia "structural")
- Palos presentes: ${readout.suits_present.join(", ") || "ninguno"}
- Palos ausentes: ${readout.suits_absent.join(", ") || "ninguno"}
- Palo dominante: ${readout.dominant_suit ?? "ninguno claro"}
- Arcanos Mayores: ${readout.major_count} / Menores: ${readout.minor_count} / Figuras: ${readout.court_count}
- Números en juego: ${readout.numbers.join(" → ") || "—"}
- Grados repetidos: ${readout.repeated_numbers.join(", ") || "ninguno"}
- Dirección numérica: ${readout.numeric_direction}
- Observaciones: ${readout.notes.join(" ")}

## Base de conocimiento estructurada (capa 1)
Escuela: Jodorowsky/Costa. Redacción original de IRIS, sin localizador
verificado. Si citas de aquí, usa provenance "source" con
via "structured-kb", work "La vía del Tarot" y locator null.

### Grados en juego
${ctx.degrees.join("\n") || "—"}

### Palos en juego
${ctx.suits.join("\n\n") || "—"}

### Cartas
${cardBlocks}

## Corpus privado (capa 2)
${corpus}`;
}

/* ===========================================================================
 * 3. Modo Reflexionar
 * ========================================================================= */

const REFLECT_SYSTEM = `${IRIS_VOICE}

## Tarea

Produces la lectura del modo REFLEXIONAR. Es elegante, humana y contenida. No
son paredes de texto.

- "observes": de 2 a 4 párrafos. Miras el CONJUNTO antes que las cartas
  sueltas. Respondes a «¿qué llama primero la atención al mirar esta tirada?».
  Palo dominante, números, progresión, ausencias, figuras, composición. Cada
  párrafo es un objeto con su procedencia.
- "movement": un concepto por carta, en orden. Dos o tres palabras como mucho.
  Son conceptos específicos de ESTA tirada, no etiquetas genéricas
  reutilizables. Evita repetir «claridad → contraste → acción» salvo que sea
  realmente lo que la tirada muestra.
- "movement_rationale": por qué propones ese movimiento. Un párrafo.
- "interprets": de 2 a 4 párrafos aplicados a la pregunta concreta. No repites
  significados abstractos: hablas de la situación que te han traído.
- "what_to_watch": de 1 a 3 cosas que la persona puede observar en su
  experiencia. Formuladas como observación, jamás como pronóstico.
- "uncertainty": lo que no puedes afirmar con la información disponible, o null.
- "reflection_question": UNA sola pregunta, potente y abierta. No retórica. No
  empieza por «¿Estás listo para...?».

${NON_DETERMINISM_REMINDER}

${JSON_DISCIPLINE}

Esquema:
{
  "observes": [{"text":"...","provenance":"structural|source|interpretation","sources":[]}],
  "movement": [{"card_slug":"...","concept":"..."}],
  "movement_rationale": {"text":"...","provenance":"...","sources":[]},
  "interprets": [{"text":"...","provenance":"...","sources":[]}],
  "what_to_watch": ["..."],
  "uncertainty": "..." | null,
  "reflection_question": "..."
}

Un objeto de fuente tiene esta forma:
{"school":"jodorowsky-costa","author":"Alejandro Jodorowsky y Marianne Costa","work":"La vía del Tarot","locator":null,"via":"structured-kb","note":null}`;

export function reflect(input: SpreadInput): Promise<ReflectResult> {
  return jsonCall({
    model: MODEL_READING,
    system: REFLECT_SYSTEM,
    schema: reflectSchema,
    maxTokens: 4000,
    content: [{ type: "text", text: buildContext(input) }],
  });
}

/* ===========================================================================
 * 4. Modo Aprender
 * ========================================================================= */

const LEARN_SYSTEM = `${IRIS_VOICE}

## Tarea

Produces el modo APRENDER: la tirada convertida en microclase.

Regla pedagógica central: esta sesión debe dejar UNA idea importante, dos como
mucho. No cinco. "key_lesson" es esa idea, y todo lo demás la sostiene.

- "key_lesson": título breve y cuerpo de un párrafo o dos. Puede ser un grado
  numerológico, un palo, una relación entre dos cartas, un detalle de
  composición, una transición o una diferencia entre escuelas.
- "cards": una entrada por carta, en orden.
  - "family": "Arcano Mayor" o "Arcano Menor".
  - "suit_territory": el territorio del palo, breve. null en Arcanos Mayores.
  - "degree": explica el GRADO ANTES de combinarlo con el palo. Primero qué es
    un V; después qué ocurre cuando ese V se expresa en Espadas. null si es
    Arcano Mayor.
  - "visual_composition": qué mirar en la carta. SOLO elementos que aparezcan
    en la composición verificable que se te ha dado. Si quieres hablar de algo
    que no consta, formúlalo como invitación a mirarlo en la baraja física.
    Procedencia "structural".
  - "in_this_spread": cómo funciona esa carta dentro de ESTA secuencia.
  - "relation_to_next": qué ocurre al pasar a la carta siguiente. Es la sección
    más importante del modo. null solo en la última carta.
- "look_at_this": de 1 a 3 bloques «Mira esto». Enseñan a OBSERVAR, no dan la
  respuesta. Cada uno puede terminar con una pregunta abierta en "prompt".

${NON_DETERMINISM_REMINDER}

${JSON_DISCIPLINE}

Esquema:
{
  "key_lesson": {"title":"...","body":"...","concept_tags":["..."]},
  "cards": [{"card_slug":"...","family":"...","suit_territory":claim|null,
             "degree":claim|null,"visual_composition":claim,
             "in_this_spread":claim,"relation_to_next":claim|null}],
  "look_at_this": [{"title":"...","body":"...","prompt":"..."|null}]
}

claim = {"text":"...","provenance":"source|structural|interpretation","sources":[]}`;

export function learn(input: SpreadInput): Promise<LearnResult> {
  return jsonCall({
    model: MODEL_READING,
    system: LEARN_SYSTEM,
    schema: learnSchema,
    maxTokens: 6000,
    content: [{ type: "text", text: buildContext(input) }],
  });
}

/* ===========================================================================
 * 5. Capa junguiana
 *
 * Estrictamente separada del canon del Tarot. Puede declararse no aplicable:
 * no hay que forzar un arquetipo para cada carta.
 * ========================================================================= */

const ARCHETYPES_SYSTEM = `${IRIS_VOICE}

## Tarea

Ofreces una lente psicológica opcional sobre esta tirada.

REGLA DURA: Jung no escribió sobre el significado de las cartas del Tarot de
Marsella. Nunca escribas «para Jung, esta carta significa». La formulación
correcta es «desde una lente junguiana, esta dinámica puede explorarse mediante
el concepto de...».

Conceptos disponibles: arquetipo, Persona, Sombra, Self, Ánima, Ánimus,
proyección, individuación, inconsciente personal, inconsciente colectivo,
símbolo, integración de opuestos.

Si no hay una conexión razonable, devuelve "applicable": false con "body"
vacío. Es una respuesta legítima y preferible a forzar una lectura.

Esto no es un diagnóstico psicológico y así debe decirlo el "disclaimer".
Máximo tres párrafos. Todos con provenance "archetypal".

${JSON_DISCIPLINE}

Esquema:
{
  "applicable": true|false,
  "concepts": ["..."],
  "body": [{"text":"...","provenance":"archetypal","sources":[]}],
  "disclaimer": "..."
}`;

export function archetypes(input: SpreadInput): Promise<ArchetypesResult> {
  return jsonCall({
    model: MODEL_READING,
    system: ARCHETYPES_SYSTEM,
    schema: archetypesSchema,
    maxTokens: 2000,
    content: [{ type: "text", text: buildContext(input) }],
  });
}

export { buildReadout };
