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

const t = (v) => EN[v] ?? ES_EN[v] ?? v;

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

  l.push(
    nombre
      ? `The name at the foot reads exactly: ${nombre} — in serif capitals, directly below the double rule, with NO box or panel around it. Roman numeral at top centre and on both side edges reads exactly: ${a.numeral}.`
      : `This card carries NO name at the foot — leave that space empty below the double rule. Roman numeral at top centre and on both side edges reads exactly: ${a.numeral}.`,
  );

  if (a.numeral === "—") {
    l[l.length - 1] =
      "This card carries NO roman numeral at all, in any position. The name at the foot reads exactly: EL LOCO — in serif capitals, directly below the double rule, with NO box or panel around it.";
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
