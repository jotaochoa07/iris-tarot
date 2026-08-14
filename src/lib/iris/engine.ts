import type { DrawnCard, SpreadPosition, SpreadType } from "@/lib/types";
import { CARDS, requireCard } from "@/lib/knowledge/cards";
import { buildReadout } from "@/lib/knowledge/readout";
import { retrieveForSpread } from "@/lib/knowledge/retrieval";
import { deckBlock } from "@/lib/knowledge/deck";
import { majorRelations } from "@/lib/knowledge/relations";
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

CARACTERÍSTICAS CLAVE DE LA BARAJA HABITUAL (EDICIÓN MANUAL DEL TAROT / ADIVINATORIO):
Esta baraja contiene títulos y textos explícitos impresos en cada carta o junto a ella:
1. ARCANOS MENORES: Tienen el título explícito impreso arriba o al lado en mayúsculas rojas/negras. Por ejemplo:
   - Copas: "I COPAS", "II COPAS", "III COPAS", "IIII COPAS", "V COPAS", "VI COPAS", "VII COPAS", "VIII COPAS", "VIIII COPAS", "X COPAS"
   - Espadas: "I ESPADAS", "II ESPADAS", "III ESPADAS", "IIII ESPADAS", "V ESPADAS", "VI ESPADAS", "VII ESPADAS", "VIII ESPADAS", "VIIII ESPADAS", "X ESPADAS"
   - Bastos: "I BASTOS", "II BASTOS", "III BASTOS", "IIII BASTOS", "V BASTOS", "VI BASTOS", "VII BASTOS", "VIII BASTOS", "IX BASTOS", "X BASTOS"
   - Oros: "I OROS", "II OROS", "III OROS", "IIII OROS", "V OROS", "VI OROS", "VII OROS", "VIII OROS", "IX OROS", "X OROS"
   - Figuras: "LE VALET DE COUPES", "CAVALIER DE COUPES", "LA REINE DE COUPES", "LE ROI DE COUPES", "LE VALET D'ÉPÉES", "LE CAVALIER D'ÉPÉES", "LA REINE D'ÉPÉES", "LE ROI D'ÉPÉES", "LE VALET DE DENIERS", "LE CAVALIER DE DENIERS", "LA REINE DE DENIERS", "LE ROI DE DENIERS", "LE VALET DE BÂTONS", "LE CAVALIER DE BÂTONS", "LA REYNE DE BÂTONS", "LE ROI DE BATONS".
2. ARCANOS MAYORES: Tienen el numeral romano arriba ("I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "VIIII", "X", "XI", "XII", "XIII", "XIIII", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "LE MAT") y el nombre impreso ("EL MAGO", "LA PAPESSE", "L'IMPÉRATRICE", "EL EMPERADOR", "EL SUMO SACERDOTE", "LES AMOUREUX", "LE CHARIOT", "LA JUSTICE", "L'ERMITE", "LA ROUE DE FORTUNE", "LA FORCE", "LE PENDU", "LA MAISON DIEU", "L'ÉTOILE", "LA LUNE", "LE SOLEIL", "LE JUGEMENT", "LE MONDE", "LE MAT").
3. BLOQUES DE TEXTO EN ROJO: Llevan encabezados impresos que dicen "ADIVINACIÓN NORMAL:" y "ADIVINACIÓN INVERTIDA:".
4. REGLA PRINCIPAL: LEE PRIMERO EL TEXTO Y EL TÍTULO IMPRESO. Si el texto o numeral ("I COPAS", "VII ESPADAS", "VIII OROS", "EL MAGO") es visible en la foto, identifica la carta DIRECTAMENTE por ese texto impreso con confianza alta. No intentes contar piezas visuales cuando el título o numeral está escrito.

Reglas adicionales:

1. EL NUMERAL Y TÍTULO IMPRESO MANDAN. Si lees "I COPAS", "VII ESPADAS", "VIII OROS", o el número romano I a XXI, ese es el resultado. No lo contradigas contando signos.

2. PARIDAD: el eje recto decide. En Espadas y Bastos, una pieza RECTA que
   atraviesa la composición por el centro aparece únicamente en los números
   IMPARES (I, III, V, VII, VIIII). En números pares (II, IIII, VI, VIII, X) no hay eje recto.

3. ORIENTACIÓN. Ver texto en rojo de "ADIVINACIÓN INVERTIDA" en la parte inferior NO significa que la carta esté invertida — es así como está impresa. Decide la orientación solo por la figura o el sentido del dibujo. Ante la duda, "upright".

4. Si dudas entre dos cartas, pon la más probable en "slug" y la otra en "alternative_slug".

5. Si en la imagen no hay ninguna carta reconocible, devuelve "cards": [] y explícalo en "overall_note".

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
    // El campo "reasoning" de cada carta se alarga: con 2000 la respuesta se
    // cortaba a media estructura en tiradas de tres o más cartas.
    maxTokens: 4000,
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
  /** Cómo quiere que la llamen quien está leyendo. null si aún no lo ha dicho. */
  readerName?: string | null;
}

const SPREAD_LABELS: Record<SpreadType, string> = {
  open: "Secuencia abierta, sin posiciones predefinidas",
  "past-present-future": "Pasado / Presente / Futuro",
  "situation-obstacle-advice": "Situación / Obstáculo / Consejo",
  "self-other-relationship": "Yo / El otro / La relación",
  custom: "Posiciones personalizadas",
};

async function buildContext(input: SpreadInput): Promise<string> {
  const readout = buildReadout(input.cards);
  const ctx = await retrieveForSpread(input.cards);
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
      ? [
          "Estos son pasajes literales de los libros que has leído. Son tuyos: los",
          "conoces, no los estás consultando delante de la persona. Úsalos para que",
          "lo que dices tenga peso, con tus palabras, y cita el libro solo cuando",
          "estés usando algo específico de él. Si un pasaje no aporta nada a esta",
          "tirada, ignóralo: no hay obligación de usarlos todos.",
          "",
          "Cuando uses uno, la afirmación lleva provenance \"source\" y un objeto de",
          "fuente con via \"corpus-retrieval\", el work y el locator EXACTOS que",
          "aparecen aquí. No inventes páginas ni cambies el capítulo.",
          "",
          ...ctx.corpus_passages.map(
            (p, i) =>
              `[${i + 1}] «${p.text}»\n    → school: ${p.source.school} · author: ${p.source.author} · work: ${p.source.work ?? "s/t"} · locator: ${
                p.source.locator ? `«${p.source.locator}»` : "null (no disponible)"
              }`,
          ),
        ].join("\n")
      : "La capa 2 está activa pero no ha devuelto pasajes relevantes para estas cartas. No atribuyas nada a una fuente por este motivo."
    : "La capa 2 (corpus privado) está desactivada. Solo dispones de la base estructurada. Ninguna afirmación puede llevar via='corpus-retrieval'.";

  const relations = majorRelations(input.cards);
  const name = input.readerName?.trim();

  return `## A quién le hablas
${
  name
    ? `Quien está leyendo se llama ${name}. Le hablas a ${name}, no a un usuario. Usa su nombre donde caiga natural —al abrir, al entrar en lo que de verdad importa, al cerrar— y no más de dos o tres veces en toda la lectura. Un nombre repetido en cada párrafo suena a vendedor, no a alguien que te conoce.`
    : "Aún no sabes cómo se llama. No inventes un nombre ni uses fórmulas de relleno del tipo «querido consultante»."
}

## Pregunta de la persona
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

## La baraja que tiene delante
${deckBlock()}

## Relaciones entre Arcanos Mayores (calculadas — procedencia "structural")
${
  relations.length
    ? relations.map((r) => `- ${r.text}`).join("\n") +
      "\n\nEstas frases son HECHOS comprobables mirando las cartas, no lecturas. " +
      "Puedes construir sobre ellas y puedes elegir cuáles usar, pero no puedes " +
      "contradecirlas ni presentarlas como interpretación tuya. Si una te sirve, " +
      "va con provenance \"structural\"."
    : "Ninguna relación calculable: o no hay Arcanos Mayores en la tirada, o no comparten nada observable."
}

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

Produces la lectura del modo REFLEXIONAR. Elegante y humana. Ni telegráfica ni
inflada: cada párrafo desarrolla una idea hasta que está entendida, y entonces
para.

- "observes": de 2 a 4 párrafos, de tres a cinco frases cada uno. Miras el
  CONJUNTO antes que las cartas sueltas. Respondes a «¿qué llama primero la
  atención al mirar esta tirada?». Palo dominante, números, progresión,
  ausencias, figuras, composición. No enumeres los datos estructurales como una
  ficha: cuéntalos como quien mira la mesa y señala lo que salta. Y explica por
  qué eso importa para esta persona, no solo que ocurre. Cada párrafo es un
  objeto con su procedencia.
- "movement": un concepto por carta, en orden. Dos o tres palabras como mucho.
  Son conceptos específicos de ESTA tirada, no etiquetas genéricas
  reutilizables. Evita repetir «claridad → contraste → acción» salvo que sea
  realmente lo que la tirada muestra.
- "movement_rationale": por qué propones ese movimiento. Un párrafo con
  desarrollo, no una justificación telegráfica.
- "interprets": de 2 a 4 párrafos aplicados a la pregunta concreta. No repites
  significados abstractos: hablas de la situación que te han traído, con sus
  palabras y su contexto. Aquí es donde más se nota si has entendido la
  pregunta o solo has descrito las cartas. Si la pregunta menciona una reunión,
  una relación o una decisión, esa cosa concreta debe aparecer en tus frases.
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

export async function reflect(input: SpreadInput): Promise<ReflectResult> {
  return jsonCall({
    model: MODEL_READING,
    system: REFLECT_SYSTEM,
    schema: reflectSchema,
    maxTokens: 6000,
    content: [{ type: "text", text: await buildContext(input) }],
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
- "look_at_this": de 1 a 3 bloques «Mira esto». Es el corazón pedagógico del
  producto y tiene TRES CAPAS que no se mezclan nunca:

  1. "fact" — el hecho. Se toma de la sección «Relaciones entre Arcanos
     Mayores», que ya viene CALCULADA, o de la lectura estructural. Lo
     reformulas con tus palabras si quieres, pero no añades nada que no esté
     ahí. Procedencia "structural". Prohibido: «no es casualidad», «llama la
     atención», «significa», «revela», «nos habla de». Si dos personas mirando
     las cartas pudieran discrepar de la frase, la frase no es un hecho.

  2. "question" — UNA pregunta abierta que devuelve la mirada a la carta.
     Invita a observar, no a adivinar. No tiene respuesta correcta escondida.
     No empieza por «¿No crees que...?» ni por «¿Te das cuenta de que...?».

  3. "interpretation" — qué PODRÍA implicar ese hecho. Es opcional y puede ser
     null: a veces basta con mirar, y forzar una lectura estropea el ejercicio.
     Cuando la escribas, va en condicional o como propuesta, con procedencia
     "interpretation" o "source", jamás "structural".

  El orden importa y es el producto entero: primero se aprende a VER, después
  se interpreta. Al revés, la persona memoriza significados sin llegar a mirar
  una carta nunca.

  Si en la tirada hay relaciones calculadas, al menos un bloque debe partir de
  una de ellas.

${NON_DETERMINISM_REMINDER}

${JSON_DISCIPLINE}

Esquema:
{
  "key_lesson": {"title":"...","body":"...","concept_tags":["..."]},
  "cards": [{"card_slug":"...","family":"...","suit_territory":claim|null,
             "degree":claim|null,"visual_composition":claim,
             "in_this_spread":claim,"relation_to_next":claim|null}],
  "look_at_this": [{"title":"...","fact":claim,"question":"...","interpretation":claim|null}]
}

claim = {"text":"...","provenance":"source|structural|interpretation","sources":[]}`;

export async function learn(input: SpreadInput): Promise<LearnResult> {
  return jsonCall({
    model: MODEL_READING,
    system: LEARN_SYSTEM,
    schema: learnSchema,
    maxTokens: 6000,
    content: [{ type: "text", text: await buildContext(input) }],
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

export async function archetypes(input: SpreadInput): Promise<ArchetypesResult> {
  return jsonCall({
    model: MODEL_READING,
    system: ARCHETYPES_SYSTEM,
    schema: archetypesSchema,
    maxTokens: 2000,
    content: [{ type: "text", text: await buildContext(input) }],
  });
}

export { buildReadout };
