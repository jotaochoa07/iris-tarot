/**
 * Prompts de ilustración de los 22 Arcanos Mayores.
 *
 *   node scripts/prompts-mayores.mjs            → los 22, a docs/prompts-mayores.md
 *   node scripts/prompts-mayores.mjs arcano-04  → uno solo, por pantalla
 *
 * El bloque SUBJECT se escribe SOLO desde los atributos canónicos. Ni las
 * observaciones visuales ni las interpretaciones entran: al ilustrador se le
 * dice qué hay en la carta, nunca qué significa. Si se le cuela el significado,
 * lo dibuja, y entonces la carta deja de poder enseñarlo.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/* Leemos el TypeScript como texto y extraemos el objeto. Evita montar un
   compilador solo para esto. */
const src = readFileSync(
  resolve(process.cwd(), "src/lib/knowledge/major-attributes.ts"),
  "utf8",
);
const body = src.slice(
  src.indexOf("export const MAJOR_ATTRIBUTES"),
  src.indexOf("/* ---------------------------------------------------------------------------\n * Utilidades"),
);
const objeto = body.slice(body.indexOf("{"), body.lastIndexOf("};") + 1);

const JC = () => null;
const IRIS_SRC = null;
const iris = (t) => ({ text: t, source: null });
const jc = (t) => ({ text: t, source: "jc" });
const ATTRS = eval(`(${objeto.replace(/;$/, "")})`);

/* El grafo de relaciones, del mismo modo. */
const gsrc = readFileSync(
  resolve(process.cwd(), "src/lib/knowledge/major-graph.ts"),
  "utf8",
);
const gbody = gsrc.slice(
  gsrc.indexOf("export const MAJOR_GRAPH"),
  gsrc.indexOf("export function graphFor"),
);
const GRAPH = eval(`(${gbody.slice(gbody.indexOf("{"), gbody.lastIndexOf("};") + 1)})`);

/**
 * Verbos del grafo, en inglés.
 *
 * Se traducen aquí y no en el grafo por la misma razón que el resto: una sola
 * fuente, en el idioma en que IRIS piensa.
 */
const VERBOS = {
  sostiene: "HOLDS",
  cuelga_de: "HANGS FROM",
  se_apoya_en: "RESTS AGAINST",
  toca: "TOUCHES",
  atraviesa: "CROSSES OVER",
  rodea: "ENCIRCLES",
  tira_de: "TUGS AT",
  "está_detrás_de": "BEHIND",
  "está_delante_de": "IN FRONT OF",
  "está_encima_de": "ABOVE",
  "está_debajo_de": "BELOW",
  "está_entre": "BETWEEN",
  "está_atado_a": "TETHERED TO",
  mira_a: "LOOKS AT",
  da_la_espalda_a: "BACK TURNED TO",
  se_desplaza_hacia: "MOVES TOWARD",
  sale_de: "EMERGES FROM",
  cae_de: "FALLS FROM",
  vierte_sobre: "POURS ONTO",
  apunta_a: "POINTS AT",
  reposa_sobre: "RESTS ON",
};

const NOMBRES = {
  "arcano-00": "EL LOCO",
  "arcano-01": "EL MAGO",
  "arcano-02": "LA PAPISA",
  "arcano-03": "LA EMPERATRIZ",
  "arcano-04": "EL EMPERADOR",
  "arcano-05": "EL PAPA",
  "arcano-06": "EL ENAMORADO",
  "arcano-07": "EL CARRO",
  "arcano-08": "LA JUSTICIA",
  "arcano-09": "EL ERMITAÑO",
  "arcano-10": "LA RUEDA DE LA FORTUNA",
  "arcano-11": "LA FUERZA",
  "arcano-12": "EL COLGADO",
  "arcano-13": "",
  "arcano-14": "TEMPLANZA",
  "arcano-15": "EL DIABLO",
  "arcano-16": "LA TORRE",
  "arcano-17": "LA ESTRELLA",
  "arcano-18": "LA LUNA",
  "arcano-19": "EL SOL",
  "arcano-20": "EL JUICIO",
  "arcano-21": "EL MUNDO",
};

const EN = {
  sentado: "seated",
  "de pie": "standing",
  caminando: "walking",
  suspendido: "hanging upside down",
  tendido: "lying down",
  "sin figura": "no human figure",
  frontal: "facing the viewer",
  perfil: "in profile",
  "tres cuartos": "in three-quarter view",
  izquierda: "toward the LEFT of the card",
  derecha: "toward the RIGHT of the card",
  "al frente": "straight at the viewer",
  abajo: "downward",
  arriba: "upward",
};

/**
 * Glosario.
 *
 * Los atributos se escriben en castellano porque su primer lector es IRIS, que
 * habla en castellano. El ilustrador recibe inglés. Traducir aquí, y no
 * duplicar cada ficha en dos idiomas, evita que las dos versiones se separen
 * con el tiempo: solo hay una fuente.
 */
const ES_EN = {
  "abriendo las fauces del animal": "opening the animal's jaws with bare hands, without strain",
  agua: "water",
  alas: "wings",
  "alas del respaldo": "wings on the back of the throne",
  "alzada, con dos dedos extendidos": "raised, two fingers extended, holding nothing",
  alzadas: "both raised",
  animal: "a small animal",
  "apoyada en el trono": "resting on the arm of the throne",
  "apoyada, o alzada con la palma abierta": "raised with the palm open",
  arco: "a bow",
  astas: "horns",
  "ave sobre un arbusto": "a bird perched on a bush",
  balanza: "a balance scale",
  "balanza de dos platos": "a two-pan balance scale, level",
  "bastón": "a staff",
  "bastón al hombro del que cuelga un hatillo": "a staff over the shoulder with a bundle hanging from it",
  "bastón largo": "a long staff touching the ground",
  "báculo": "a crozier",
  "báculo de tres travesaños": "a crozier with three crossbars",
  "cabezas coronadas": "crowned heads",
  cangrejo: "a crayfish",
  capucha: "a hood",
  carro: "a chariot",
  "carro tirado por dos caballos": "a chariot drawn by two horses facing opposite ways, with no reins",
  cascabeles: "bells",
  cetro: "a sceptre",
  "cetro rematado en globo y cruz, en alto": "a long sceptre topped with an orb and cross, held upright",
  "cetro rematado en globo y cruz, apoyado en el hombro": "a long sceptre topped with an orb and cross, resting against her shoulder",
  "escudo con águila, apoyado en el regazo": "a shield bearing a black eagle, resting on her lap",
  collar: "a chain collar",
  columnas: "columns",
  copa: "a cup",
  corona: "a crown",
  "corona de la torre, desprendida": "the tower's crown, broken loose and falling",
  "corona vegetal": "an oval wreath of leaves",
  "cuatro criaturas en las esquinas": "four different creatures, one in each corner, all facing inward",
  cuchillo: "a knife",
  cuerda: "a rope",
  cuerdas: "ropes",
  "detrás de la espalda, oculta": "hidden behind the back",
  "doce muñones": "twelve pruned branch stumps, six on each trunk",
  "dos animales": "two animals howling upward",
  "dos caballos": "two horses",
  "dos figuras": "two figures",
  "dos figuras atadas": "two smaller figures loosely tethered by the neck, hands free",
  "dos figuras cayendo": "two figures falling in opposite directions",
  "dos figuras menores, de espaldas al observador": "two smaller figures seen from behind",
  "dos jarras": "two jugs",
  "dos tonsuras": "two tonsured heads",
  "dos torres": "two towers",
  "dos troncos": "two pruned tree trunks",
  "eje sobre dos soportes": "an axle on two supports",
  escudo: "a shield",
  "escudo con águila, apoyado": "a shield bearing an eagle, propped up",
  "escudo con águila, en el suelo": "a shield bearing a black eagle, standing on the ground",
  espada: "a sword",
  "espada corta o antorcha, en alto": "a short sword held up",
  "espada en alto, vertical": "a sword held straight up, vertical",
  estandarte: "a banner",
  "estanque en el que hay un cangrejo": "a pool with a crayfish in it",
  farol: "a lantern",
  "farol encendido, en alto": "a lit lantern held up and forward",
  "figura alada con arco tendido, dentro de un sol": "a winged figure inside a sun, drawing a bow, arrow not yet loosed",
  "figura alada tocando una trompeta, dentro de un halo": "a winged figure in a halo blowing a trumpet",
  "figura coronada, sentada sobre la rueda": "a crowned creature seated on top of the wheel, not gripping it",
  flecha: "an arrow",
  "flor frontal": "a flower on the forehead",
  "flor o disco sobre la frente": "a flower or disc on the forehead",
  "gorro con cascabeles": "a cap with bells",
  gotas: "falling droplets",
  guadaña: "a scythe",
  "hatillo colgando del bastón, por detrás de él":
    "a bundle hanging from the staff, BEHIND him",
  "un animal que le tira de la ropa por detrás, a la altura de las piernas":
    "a small animal BEHIND him, tearing at his clothes at leg height",
  "un segundo bastón más corto, sostenido en la mano y apoyado en el suelo por delante":
    "a second, shorter stick HELD IN HIS HAND, its tip resting on the ground ahead of him",
  "dos caballos que miran cada uno hacia un lado distinto":
    "two horses, each facing a different way",
  "la pierna libre cruzada por detrás, formando un cuatro invertido":
    "the free leg crossed behind the other, forming an upside-down number four",
  "guadaña segando en horizontal, hacia un lado, no hacia abajo":
    "a scythe sweeping horizontally to one side, not downward",
  "dos figuras juntas que se tocan": "two figures standing together, touching",
  hatillo: "a bundle",
  horca: "a gallows",
  hueso: "a bone",
  "jarra, recibiendo": "a jug receiving the flow",
  "jarra, vertiendo": "a jug pouring",
  "jarra, vertiendo sobre el agua": "a jug pouring onto the water",
  "jarra, vertiendo sobre la tierra": "a jug pouring onto the earth",
  "león": "a lion",
  libro: "a book",
  "libro abierto sobre el regazo": "an open book resting on the lap",
  "lluvia de puntos de color": "a rain of coloured dots",
  luna: "a moon",
  "luna de perfil dentro de un disco, con gotas cayendo": "a moon in profile inside a disc, shedding droplets",
  manivela: "a crank handle",
  manto: "a cloak covering everything but face and hands",
  "mesa de tres patas": "a table with three visible legs",
  monedas: "coins",
  muro: "a low wall",
  "objeto pequeño, entre el pulgar y el índice": "a tiny object held between thumb and forefinger",
  "ocho estrellas": "eight stars, one large and seven smaller",
  palio: "a canopy",
  "palio sostenido por cuatro columnas": "a canopy held up by four columns",
  pedestal: "a pedestal",
  "pedestal al que están atadas dos figuras menores": "a pedestal with two smaller figures tethered to it",
  rueda: "a wheel",
  "segundo bastón, apoyado en el suelo": "a second stick, planted on the ground",
  sol: "a sun",
  "sol con rostro": "a sun with a face",
  "sol con rostro, del que caen gotas": "a sun with a face, looking down, shedding droplets",
  "sombrero de ala ancha en forma de lemniscata": "a wide brimmed hat shaped like a lemniscate",
  "sombrero de lemniscata": "a lemniscate-shaped hat",
  "sujeta el borde derecho del libro": "holding the right edge of the book",
  "sujeta el borde izquierdo del libro": "holding the left edge of the same book",
  "un único libro abierto sobre el regazo":
    "ONE single open book resting on her lap, held with both hands \u2014 not two books",
  "velo tendido entre dos columnas, que oculta lo que hay al fondo":
    "a veil stretched between two columns behind her, hiding whatever is beyond",
  "dos columnas": "two columns",
  "dos torres, una a cada lado": "two towers, one on each side",
  "un muro bajo por el que se ve el fondo": "a low wall with the background visible above it",
  "nada: la figura flota dentro de la corona vegetal":
    "nothing \u2014 the figure floats inside the wreath",
  suelo: "ground",
  "suelo desnudo": "bare ground",
  "suelo vegetal": "ground with small plants",
  "suelo, con dos figuras cayendo hacia él": "ground, with two figures falling toward it",
  "suelo, delante de un muro bajo": "ground, in front of a low wall",
  "terreno abierto, sin marco que lo detenta": "open ground",
  "terreno abierto, sin marco que lo detenga": "open ground with nothing blocking the way",
  "tiara": "a tiara",
  "tiara de tres pisos": "a three-tiered tiara",
  tierra: "earth",
  "tierra abierta, de la que emerge una figura": "opened earth, a figure rising out of it, seen from behind",
  "tierra negra de la que asoman cabezas, manos y pies": "black earth with heads, hands and feet emerging from it",
  toca: "a wimple",
  "tocando a la otra": "touching the other figure",
  "tocando a una de las figuras": "touching one of the figures",
  "tocando al otro": "touching the other figure",
  torre: "a tower, still standing",
  "travesaño del que cuelga, sostenido por dos troncos podados":
    "a crossbeam he hangs from, held by two pruned trunks",
  "tres animales": "three creatures, one rising, one falling, one still",
  "tres figuras humanas": "three human figures",
  trompeta: "a trumpet",
  trono: "a cubic throne",
  "una estrella grande y siete menores": "one large star and seven smaller ones",
  "una rodilla en tierra, junto a la orilla": "one knee on the ground at the water's edge",
  "una varita": "a wand",
  varita: "a wand",
  "varita corta, en alto": "a short wand held up",
  varitas: "wands",
  velo: "a veil",
  "águila": "an eagle",
};


/** Sustantivos del grafo. Mismo criterio: una sola fuente, traducida aquí. */
const GRAFO_ES_EN = {
  "abajo, por el otro lado": "downward, on the other side",
  "arriba, por un lado de la rueda": "upward, on one side of the wheel",
  "dos columnas": "two columns",
  "dos troncos podados": "two pruned trunks",
  "el agua del estanque": "the water of the pool",
  "el agua, con una jarra": "the water, from one jug",
  "el animal": "the animal",
  "el ave": "the bird",
  "el bastón": "the staff",
  "el borde derecho de la carta": "the RIGHT edge of the card",
  "el borde izquierdo de la carta": "the LEFT edge of the card",
  "el brazo del trono": "the arm of the throne",
  "el cangrejo": "the crayfish",
  "el carro": "the chariot",
  "el cetro": "the sceptre",
  "el colgado": "the hanged man",
  "el conductor": "the charioteer",
  "el diablo": "the devil",
  "el eje, hacia fuera de la rueda": "the axle, sticking out of the wheel",
  "el emperador": "the emperor",
  "el ermitaño": "the hermit",
  "el escudo del águila": "the eagle shield",
  "el estandarte": "the banner",
  "el farol": "the lantern",
  "el hatillo": "the bundle",
  "el lado, en horizontal, no hacia abajo": "sideways, horizontally, NOT downward",
  "el libro": "the book",
  "el loco": "the fool",
  "el líquido": "the liquid",
  "el mago": "the magician",
  "el manto": "the cloak",
  "el mismo nivel": "the same level as each other",
  "el mismo suelo del que brotan": "the same ground they emerge from",
  "el muro": "the wall",
  "el palio": "the canopy",
  "el papa": "the pope",
  "el segundo bastón": "the second stick",
  "el sol": "the sun",
  "el suelo": "the ground",
  "el suelo, a sus pies": "the ground, at his feet",
  "el suelo, junto a la orilla": "the ground, at the water's edge",
  "el suelo, por delante de él": "the ground, AHEAD of him",
  "el suelo, todavía en pie": "the ground, still standing",
  "el travesaño": "the crossbeam",
  "el velo": "the veil",
  ella: "her",
  "ese bastón, por detrás de su cabeza": "that staff, BEHIND his head",
  "ese pedestal, por el cuello": "that pedestal, by the neck",
  "la corona de la torre": "the crown of the tower",
  "la corona vegetal": "the wreath",
  "la criatura coronada": "the crowned creature",
  "la cuerda": "the rope",
  "la emperatriz": "the empress",
  "la escena, sin haber salido aún del arco": "the scene, still not loosed from the bow",
  "la estrella mayor": "the largest star",
  "la figura": "the figure",
  "la figura alada": "the winged figure",
  "la figura central": "the central figure",
  "la figura central, desde las esquinas": "the central figure, from the corners",
  "la flecha": "the arrow",
  "la guadaña": "the scythe",
  "la justicia": "justice",
  "la luna": "the moon",
  "la luna, hacia arriba": "the moon, upward",
  "la manivela": "the crank",
  "la mesa": "the table",
  "la mujer": "the woman",
  "la otra por detrás, formando un cuatro invertido":
    "the other leg from behind, forming an upside-down number four",
  "la otra, formando un cuatro": "the other leg, forming a number four",
  "la papisa": "the popess",
  "la rueda, quieta y sin agarrarse": "the wheel, still and not holding on",
  "la tierra abierta": "the opened earth",
  "la tierra negra": "the black earth",
  "la tierra, con la otra jarra": "the earth, from the other jug",
  "la torre": "the tower",
  "la torre, hacia lados opuestos": "the tower, in opposite directions",
  "la trompeta": "the trumpet",
  "la una a la otra": "one another",
  "lados distintos": "different directions from each other",
  "las alas": "the wings",
  "las cabezas, manos y pies": "the heads, hands and feet",
  "las cuatro criaturas": "the four creatures",
  "las dos columnas": "the two columns",
  "las dos figuras": "the two figures",
  "las dos figuras menores": "the two smaller figures",
  "las dos figuras que la flanquean": "the two figures flanking it",
  "las dos figuras, desde arriba": "the two figures, from above",
  "las dos torres": "the two towers",
  "las fauces del animal, con las dos manos":
    "the animal's jaws, with both hands",
  "las gotas": "the droplets",
  "las otras dos": "the other two",
  "las otras dos figuras": "the other two figures",
  "las que flanquean a la que emerge": "the ones flanking the emerging figure",
  "las tres": "the three of them",
  "lo alto del edificio": "the top of the building",
  "los cuatro palos": "the four suits",
  "los dos animales": "the two animals",
  "los dos caballos": "the two horses",
  "los dos platos": "the two pans",
  "nada: está suspendida": "nothing at all: it is suspended in mid-air",
  "su ropa, a la altura de las piernas": "his clothes, at leg height",
  "su espalda": "its back",
  "su espalda, ocultas": "his back, hidden from view",
  "su hombro": "her shoulder",
  "su regazo": "her lap",
  "sus cuellos, floja": "their necks, loosely",
  "sus manos": "his hands",
  "un arbusto, al fondo": "a bush in the background",
  "un báculo de tres travesaños": "a crozier with three crossbars",
  "un bastón apoyado en el hombro": "a staff resting on his shoulder",
  "un cetro con globo y cruz": "a sceptre with orb and cross",
  "un cetro con globo y cruz, en alto": "a sceptre with orb and cross, held up",
  "un farol encendido": "a lit lantern",
  "un objeto diminuto entre dos dedos": "a tiny object between two fingers",
  "un pedestal": "a pedestal",
  "un pie, cabeza abajo": "one foot, head downward",
  "un segundo bastón, más corto": "a second, shorter stick",
  "una balanza, colgando": "a pair of scales, hanging",
  "una espada recta y vertical": "a straight, vertical sword",
  "una jarra, desde la otra": "one jug, from the other",
  "una varita en alto": "a wand held up",
  "una jarra": "a jug",
  "un único libro abierto, por los dos bordes":
    "ONE single open book, by both its edges",
  "el mismo libro": "the same book",
  "el libro abierto": "the open book",
  "todo su cuerpo salvo el rostro y las manos":
    "his whole body except face and hands",
  "quien mira la carta": "the person looking at the card",
  "quien tiene la carta delante": "the person holding the card",
  "sus manos": "his hands",
  "los dos platos": "the two pans of the scales",
  "una mesa": "a table",
  "su mano izquierda": "his left hand",
  "su pierna": "his leg",
  "su pierna libre": "his free leg",
  "su rodilla": "her knee",
  "él, en la dirección en que camina": "him, in the direction he is walking",
  "una criatura": "one creature",
  "otra criatura": "another creature",
  "un lado, en horizontal": "one side, horizontally",
};

const t = (v) => EN[v] ?? ES_EN[v] ?? GRAFO_ES_EN[v] ?? v;

function subject(a) {
  const nombre = NOMBRES[a.slug];
  const l = [];

  l.push(
    `SUBJECT — ${nombre || "the unnamed thirteenth arcanum"}. ` +
      (a.postura === "sin figura"
        ? "No human figure."
        : `${a.figuras > 1 ? `${a.figuras} figures. The main figure is ` : "A single figure, "}${t(a.postura)}, ${t(a.orientacion)}, looking ${t(a.mirada)}.`),
  );

  if (a.tocado) l.push(`Headwear: ${t(a.tocado)}.`);
  if (a.manos.derecha) l.push(`In the figure's RIGHT hand: ${t(a.manos.derecha)}.`);
  if (a.manos.izquierda) l.push(`In the figure's LEFT hand: ${t(a.manos.izquierda)}.`);
  if (a.bajo_los_pies) l.push(`Below / at the feet: ${t(a.bajo_los_pies)}.`);
  if (a.encima) l.push(`Above: ${t(a.encima)}.`);
  if (a.detras) l.push(`Behind the figure: ${t(a.detras)}.`);
  if (a.simbolos.length) l.push(`Must include: ${a.simbolos.map(t).join(", ")}.`);

  const rels = GRAPH[a.slug] ?? [];
  if (rels.length) {
    l.push(
      "SPATIAL RELATIONS — these are not optional details, they are what the card " +
        "means. Every one of them must be visible in the drawing:",
    );
    for (const r of rels) {
      l.push(`  · ${t(r.de)} —${VERBOS[r.verbo] ?? r.verbo}→ ${t(r.a)}`);
    }
  }

  l.push(
    nombre
      ? `FOOT OF THE CARD, in this exact order from top to bottom: (1) the double rule — a dark line with a greenish line just under it; (2) BELOW that rule, the name in serif capitals reading exactly: ${nombre}. The rule goes ABOVE the name, never below it. No box, panel or outline around the name. Roman numeral at top centre and on both side edges reads exactly: ${a.numeral}.`
      : `FOOT OF THE CARD: the double rule — a dark line with a greenish line just under it — and BELOW it nothing: this card carries NO name. The rule goes above the empty space, never below. Roman numeral at top centre and on both side edges reads exactly: ${a.numeral}.`,
  );

  if (a.numeral === "—") {
    l[l.length - 1] =
      "This card carries NO roman numeral at all, in any position. FOOT OF THE CARD, in this exact order from top to bottom: (1) the double rule — a dark line with a greenish line just under it; (2) BELOW that rule, the name in serif capitals reading exactly: EL LOCO. The rule goes ABOVE the name, never below it. No box, panel or outline around the name.";
  }

  l.push(
    "Match the reference image of THE EMPEROR exactly: same border, same corner leaves, " +
      "same cartouche, same lettering, same line weight, same palette, same paper, " +
      "same level of hatching detail. Same world, same hand, same printing.",
  );

  return l.join("\n");
}

const uno = process.argv[2];

if (uno) {
  const a = ATTRS[uno];
  if (!a) {
    console.error(`No conozco "${uno}". Usa arcano-00 … arcano-21.`);
    process.exit(1);
  }
  console.log(`\n${subject(a)}\n`);
} else {
  const partes = ["# Prompts de los 22 Arcanos Mayores\n"];
  partes.push(
    "Generado desde `src/lib/knowledge/major-attributes.ts`. No editar a mano:\n" +
      "cambia los atributos y vuelve a ejecutar `node scripts/prompts-mayores.mjs`.\n\n" +
      "Cada bloque va DEBAJO del prompt maestro de `docs/iris-tarot-style-v1.md`,\n" +
      "sustituyendo su bloque SUBJECT.\n",
  );

  for (const a of Object.values(ATTRS)) {
    partes.push(
      `\n---\n\n## ${a.numeral === "—" ? "sin número" : a.numeral} · ${NOMBRES[a.slug] || "sin nombre"}\n`,
    );
    if (a.verify) partes.push(`> Comprobar antes de generar: ${a.verify_note}\n`);
    partes.push("```\n" + subject(a) + "\n```\n");
  }

  const destino = resolve(process.cwd(), "docs/prompts-mayores.md");
  writeFileSync(destino, partes.join(""));
  console.log(`\n22 prompts escritos en docs/prompts-mayores.md\n`);
}
