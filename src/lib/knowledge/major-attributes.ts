import type { CardSlug, SourceRef } from "@/lib/types";

/**
 * Atributos de los 22 Arcanos Mayores.
 *
 * Este archivo sirve a dos cosas a la vez, y por eso existe:
 *
 *  1. ENCARGO VISUAL. Define qué debe dibujarse en cada carta sin ambigüedad.
 *  2. MOTOR PEDAGÓGICO. Define qué debe aprender IRIS a señalar.
 *
 * Si el dibujo y el análisis beben de aquí, no pueden contradecirse. Ese era el
 * fallo de fondo: la carta decía una cosa y la lectura decía otra.
 *
 * ---------------------------------------------------------------------------
 * LA REGLA DE LAS TRES CAPAS
 *
 * Es la misma que gobierna todo el producto (ver `Provenance` en types.ts), y
 * aquí se aplica a los datos de la carta:
 *
 *   canonical    lo que la carta TIENE. Verificable mirándola. Un dato.
 *   visual       lo que se VE al mirarla, dicho sin explicar qué significa.
 *   reading      lo que alguien INTERPRETA. Nunca se presenta como lo anterior.
 *
 * Codificar una interpretación como si fuera una característica objetiva es
 * exactamente el vicio que IRIS existe para no cometer.
 * ---------------------------------------------------------------------------
 *
 * SOBRE LA VERIFICACIÓN
 *
 * Estos atributos están redactados desde el canon marsellés (linaje Conver /
 * Noblet). Los que llevan `verify: true` necesitan un vistazo a una baraja
 * física antes de tratarse como hecho: normalmente son direcciones de mirada o
 * detalles que cambian entre ediciones. Preferimos decir que dudamos a afirmar
 * de más.
 */

/* ---------------------------------------------------------------------------
 * Vocabulario
 * ------------------------------------------------------------------------- */

export type Posture =
  | "sentado"
  | "de pie"
  | "caminando"
  | "suspendido"
  | "tendido"
  | "sin figura";

export type Orientation = "frontal" | "perfil" | "tres cuartos" | "n/a";

/**
 * Dirección de la mirada, SIEMPRE desde el punto de vista de quien mira la
 * carta. «izquierda» significa hacia el borde izquierdo del naipe.
 *
 * Es el atributo que más se usa en la lectura: dos figuras que se miran o que
 * se dan la espalda cambian el sentido de una tirada entera.
 */
export type Gaze = "izquierda" | "derecha" | "al frente" | "abajo" | "arriba" | "n/a";

/**
 * Manos.
 *
 * `derecha` es la mano derecha DE LA FIGURA, no la que queda a la derecha de
 * quien mira. Cuando una figura está de perfil mirando a la izquierda, su mano
 * derecha es la que queda más cerca del observador.
 */
export interface Hands {
  derecha: string | null;
  izquierda: string | null;
}

export interface Reading {
  text: string;
  /** null cuando es lectura propia de IRIS y no de una escuela identificada. */
  source: SourceRef | null;
}

export interface MajorAttributes {
  slug: CardSlug;
  numeral: string;

  /* --- canónico: lo que la carta tiene ---------------------------------- */
  figuras: number;
  postura: Posture;
  orientacion: Orientation;
  mirada: Gaze;
  tocado: string | null;
  manos: Hands;
  bajo_los_pies: string | null;
  encima: string | null;
  /**
   * Qué hay al fondo.
   *
   * Existe porque se nos escapó en La Papisa. El velo tendido detrás de ella no
   * es decorado: es lo que significa la carta —hay algo y decide no enseñarlo—
   * y estaba escrito en la capa de observación visual, que no viaja al encargo.
   * Las relaciones espaciales son canon semántico y tienen que estar aquí.
   */
  detras: string | null;
  simbolos: string[];

  /* --- visual: lo que se ve, sin decir qué significa --------------------- */
  observaciones: string[];

  /* --- interpretación: separada y atribuida ------------------------------ */
  lecturas: Reading[];

  /** true si algún atributo necesita comprobarse contra una baraja física. */
  verify: boolean;
  /** Qué hay que comprobar exactamente. */
  verify_note?: string;
}

/* ---------------------------------------------------------------------------
 * Fuentes
 * ------------------------------------------------------------------------- */

/** Sistema atribuible a Jodorowsky/Costa. Redacción original, sin localizador. */
const JC = (): SourceRef => ({
  school: "jodorowsky-costa",
  author: "Alejandro Jodorowsky y Marianne Costa",
  work: "La vía del Tarot",
  locator: null,
  via: "structured-kb",
  note: "Sistema atribuido a Jodorowsky/Costa. Redacción original de IRIS; localizador no verificado.",
});

/** Lectura propia. No se atribuye a nadie. */
const IRIS_SRC: SourceRef = {
  school: "iris",
  author: "IRIS",
  work: null,
  locator: null,
  via: "structured-kb",
  note: "Lectura propia, ofrecida como propuesta y no como doctrina.",
};

const iris = (text: string): Reading => ({ text, source: IRIS_SRC });
const jc = (text: string): Reading => ({ text, source: JC() });

/* ---------------------------------------------------------------------------
 * Las 22
 * ------------------------------------------------------------------------- */

export const MAJOR_ATTRIBUTES: Record<CardSlug, MajorAttributes> = {
  "arcano-00": {
    slug: "arcano-00",
    numeral: "—",
    figuras: 2,
    postura: "caminando",
    orientacion: "perfil",
    mirada: "derecha",
    tocado: "gorro con cascabeles",
    manos: {
      derecha: "bastón al hombro del que cuelga un hatillo",
      izquierda: "un segundo bastón más corto, sostenido en la mano y apoyado en el suelo por delante",
    },
    bajo_los_pies: "terreno abierto, sin marco que lo detenga",
    encima: null,
    detras: null,
    simbolos: [
      "hatillo colgando del bastón, por detrás de él",
      "un animal que le tira de la ropa por detrás, a la altura de las piernas",
      "cascabeles",
    ],
    observaciones: [
      "Es la única carta sin numeral.",
      "Un animal le tira de la ropa por detrás, a la altura de las piernas.",
      "Camina hacia el borde derecho y ya lo está tocando.",
      "El hatillo va detrás de él, no delante.",
    ],
    lecturas: [
      jc("Energía sin forma ni destino asignado: libertad y desamparo a la vez."),
      iris(
        "Al no tener número, no ocupa lugar en la serie. Puede leerse antes del I, después del XXI, o entre dos cualesquiera.",
      ),
    ],
    verify: false,
  },

  "arcano-01": {
    slug: "arcano-01",
    numeral: "I",
    figuras: 1,
    postura: "de pie",
    orientacion: "tres cuartos",
    mirada: "izquierda",
    tocado: "sombrero de ala ancha en forma de lemniscata",
    manos: {
      derecha: "varita corta, en alto",
      izquierda: "objeto pequeño, entre el pulgar y el índice",
    },
    bajo_los_pies: "suelo vegetal",
    encima: null,
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["mesa de tres patas", "varita", "copa", "cuchillo", "monedas"],
    observaciones: [
      "Sobre la mesa están los cuatro palos a la vez: algo de copas, algo de espadas, algo de oros, y el bastón lo lleva él.",
      "La mesa solo muestra tres patas.",
      "Todo lo que hay sobre la mesa es pequeño y está sin usar.",
      "Las dos manos hacen cosas distintas: una levanta, la otra sujeta algo diminuto.",
    ],
    lecturas: [
      jc("Comienzo y potencial: todo está disponible y nada se ha decidido."),
      iris("Tiene los cuatro palos delante, lo que en la baraja significa tenerlo todo y aún nada."),
    ],
    verify: true,
    verify_note:
      "Confirmar hacia qué lado mira y en qué mano lleva la varita: cambia entre ediciones.",
  },

  "arcano-02": {
    slug: "arcano-02",
    numeral: "II",
    figuras: 1,
    postura: "sentado",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "tiara de tres pisos",
    manos: {
      derecha: "sujeta el borde derecho del libro",
      izquierda: "sujeta el borde izquierdo del libro",
    },
    bajo_los_pies: null,
    encima: null,
    detras: "velo tendido entre dos columnas, que oculta lo que hay al fondo",
    simbolos: [
      "un único libro abierto sobre el regazo",
      "tiara",
      "velo",
      "toca",
      "dos columnas",
    ],
    observaciones: [
      "El velo va tendido entre dos columnas y tapa todo el fondo.",
      "El libro está abierto, pero no lo está leyendo: mira al frente.",
      "Es de las pocas figuras completamente frontales de la serie.",
      "Está sentada y quieta. No hay ningún movimiento en la carta.",
    ],
    lecturas: [
      jc("Acumulación en quietud: lo que se guarda antes de expresarse."),
      iris("El velo es lo importante: hay algo detrás y la carta decide no enseñarlo."),
    ],
    verify: false,
  },

  "arcano-03": {
    slug: "arcano-03",
    numeral: "III",
    figuras: 1,
    postura: "sentado",
    orientacion: "frontal",
    mirada: "izquierda",
    tocado: "corona",
    manos: {
      derecha: "cetro rematado en globo y cruz, apoyado en el hombro",
      izquierda: "escudo con águila, apoyado en el regazo",
    },
    bajo_los_pies: null,
    encima: null,
    detras: null,
    simbolos: ["cetro", "águila", "corona", "trono", "collar"],
    observaciones: [
      "Está sentada y el cuerpo va de frente, no de perfil como el Emperador.",
      "El águila del escudo es la misma que la del Emperador, y aquí la sostiene ella.",
      "Sujeta el cetro con una mano y el escudo con la otra: las dos manos ocupadas.",
      "El cetro no está en alto: descansa contra el hombro.",
    ],
    lecturas: [
      jc("Fecundidad y expansión: lo que el dos guardaba, el tres lo produce."),
      iris(
        "Emperatriz y Emperador comparten corona, cetro y águila. Lo que cambia es el cuerpo: ella de frente y con el escudo en el regazo, él de perfil y con el escudo en el suelo. Cuando salen juntas, ahí está la lectura.",
      ),
    ],
    verify: true,
    verify_note:
      "Confirmar la dirección de la mirada contra la baraja física: de frente o ligeramente a la izquierda.",
  },

  "arcano-04": {
    slug: "arcano-04",
    numeral: "IIII",
    figuras: 1,
    postura: "sentado",
    orientacion: "perfil",
    mirada: "izquierda",
    tocado: "corona",
    manos: {
      derecha: "cetro rematado en globo y cruz, en alto",
      izquierda: "apoyada en el trono",
    },
    bajo_los_pies: "escudo con águila, en el suelo",
    encima: null,
    detras: null,
    simbolos: ["águila", "trono", "cetro", "escudo", "corona"],
    observaciones: [
      "Las piernas cruzadas dibujan un cuatro con el cuerpo.",
      "Es de perfil, no de frente: no se le ve entero.",
      "El cetro es la única vertical larga de la carta.",
      "El águila aparece dos veces: en el trono y en el escudo.",
      "Está sentado sobre una forma cúbica.",
    ],
    lecturas: [
      jc("Estabilidad y estructura: lo que se sostiene porque tiene forma."),
      iris(
        "La postura repite el número de la carta. Antes de preguntarte qué significa el Emperador, pregúntate qué relación hay entre esas piernas y el grado IIII.",
      ),
    ],
    verify: false,
  },

  "arcano-05": {
    slug: "arcano-05",
    numeral: "V",
    figuras: 3,
    postura: "sentado",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "tiara de tres pisos",
    manos: {
      derecha: "alzada, con dos dedos extendidos",
      izquierda: "báculo de tres travesaños",
    },
    bajo_los_pies: "dos figuras menores, de espaldas al observador",
    encima: null,
    detras: "dos columnas",
    simbolos: ["báculo", "tiara", "dos tonsuras", "columnas"],
    observaciones: [
      "Hay tres figuras: una sentada y elevada, dos de pie y más pequeñas.",
      "Las dos figuras pequeñas están de espaldas a quien mira la carta.",
      "La mano alzada no sostiene nada.",
      "El báculo tiene tres travesaños, uno más que el de otras cartas.",
    ],
    lecturas: [
      jc("Puesta en relación: el cinco rompe la estabilidad del cuatro y abre al otro."),
      iris("Es la primera carta de la serie donde alguien habla con alguien."),
    ],
    verify: false,
  },

  "arcano-06": {
    slug: "arcano-06",
    numeral: "VI",
    figuras: 4,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "izquierda",
    tocado: "ninguno en la figura central; las dos que la flanquean sí llevan tocado",
    manos: {
      derecha: "tocando a una de las figuras",
      izquierda: "tocando a la otra",
    },
    bajo_los_pies: "suelo vegetal",
    encima: "figura alada con arco tendido, dentro de un sol",
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["sol", "flecha", "arco", "tres figuras humanas"],
    observaciones: [
      "Una figura central entre otras dos, una a cada lado.",
      "La cabeza de la figura central está girada hacia un lado, pero el cuerpo sigue de frente.",
      "Arriba hay un ser alado apuntando con un arco.",
      "La flecha aún no ha salido.",
    ],
    lecturas: [
      jc("Elección y vínculo: hay que decidir hacia dónde se orienta el deseo."),
      iris("Lo que decide la carta no es a quién toca, sino hacia dónde ha girado la cabeza."),
    ],
    verify: true,
    verify_note: "Confirmar hacia qué lado gira la cabeza de la figura central.",
  },

  "arcano-07": {
    slug: "arcano-07",
    numeral: "VII",
    figuras: 1,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "corona",
    manos: {
      derecha: "cetro",
      izquierda: "vacía, apoyada en el borde del carro",
    },
    bajo_los_pies: "carro tirado por dos caballos",
    encima: "palio sostenido por cuatro columnas",
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: [
      "carro",
      "dos caballos que miran cada uno hacia un lado distinto",
      "palio",
      "cetro",
      "corona",
    ],
    observaciones: [
      "Los dos caballos miran cada uno hacia un lado distinto.",
      "No hay riendas.",
      "El conductor va de frente, en pie, dentro de una caja.",
      "El palio va sostenido por cuatro columnas, una en cada esquina.",
    ],
    lecturas: [
      jc("Avance y conquista: la energía sale al mundo y se pone en movimiento."),
      iris("Sin riendas, la pregunta de la carta es qué sostiene la dirección."),
    ],
    verify: false,
  },

  "arcano-08": {
    slug: "arcano-08",
    numeral: "VIII",
    figuras: 1,
    postura: "sentado",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "corona",
    manos: {
      derecha: "espada en alto, vertical",
      izquierda: "balanza de dos platos",
    },
    bajo_los_pies: null,
    encima: null,
    detras: null,
    simbolos: ["espada", "balanza", "trono", "corona"],
    observaciones: [
      "La espada está recta y vertical; la balanza cuelga.",
      "Los dos platos están al mismo nivel.",
      "Mira al frente, sin inclinar la cabeza a ningún lado.",
      "Sostiene un objeto distinto en cada mano.",
    ],
    lecturas: [
      jc("Equilibrio y medida: lo que se ajusta sin inclinarse."),
      iris("Es la única figura que sostiene a la vez un instrumento de cortar y uno de pesar."),
    ],
    verify: false,
  },

  "arcano-09": {
    slug: "arcano-09",
    numeral: "VIIII",
    figuras: 1,
    postura: "caminando",
    orientacion: "perfil",
    mirada: "izquierda",
    tocado: "capucha",
    manos: {
      derecha: "farol encendido, en alto",
      izquierda: "bastón largo",
    },
    bajo_los_pies: "suelo desnudo",
    encima: null,
    detras: null,
    simbolos: ["farol", "bastón", "manto", "capucha"],
    observaciones: [
      "El farol va delante de él, en la dirección en que camina.",
      "El manto lo cubre entero salvo el rostro y las manos.",
      "Va solo. Es de las pocas cartas sin nadie más ni objeto alrededor.",
      "El bastón toca el suelo; el farol no ilumina lejos.",
    ],
    lecturas: [
      jc("Búsqueda y retirada: el nueve completa el ciclo y obliga a mirar hacia dentro."),
      iris("El farol alumbra poco a propósito: solo el paso siguiente."),
    ],
    verify: false,
  },

  "arcano-10": {
    slug: "arcano-10",
    numeral: "X",
    figuras: 3,
    postura: "sin figura",
    orientacion: "n/a",
    mirada: "n/a",
    tocado: null,
    manos: { derecha: null, izquierda: null },
    bajo_los_pies: "eje sobre dos soportes",
    encima: "figura coronada, sentada sobre la rueda",
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["rueda", "manivela", "tres animales"],
    observaciones: [
      "Tres criaturas: una sube, otra baja, una tercera está arriba y quieta.",
      "La de arriba lleva corona y no está agarrada a la rueda.",
      "La rueda tiene manivela, así que alguien la gira desde fuera.",
      "No hay ninguna figura humana entera.",
    ],
    lecturas: [
      jc("Ciclo y giro: lo que sube volverá a bajar, y al revés."),
      iris("La única que no gira es la que está en el eje. Vale la pena preguntarse por qué."),
    ],
    verify: false,
  },

  "arcano-11": {
    slug: "arcano-11",
    numeral: "XI",
    figuras: 2,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "izquierda",
    tocado: "sombrero de ala ancha en forma de lemniscata",
    manos: {
      derecha: "abriendo las fauces del animal",
      izquierda: "abriendo las fauces del animal",
    },
    bajo_los_pies: "suelo vegetal",
    encima: null,
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["león", "sombrero de lemniscata"],
    observaciones: [
      "Usa las dos manos para lo mismo, cosa rara en la serie.",
      "No hay tensión en el gesto: no sujeta, abre.",
      "Lleva el mismo sombrero que el Mago.",
      "El animal no se resiste.",
    ],
    lecturas: [
      jc("Fuerza sin violencia: se trata con lo instintivo, no se lo somete."),
      iris("Comparte sombrero con el arcano I. Cuando salen juntas, la repetición es un dato."),
    ],
    verify: true,
    verify_note: "Confirmar hacia dónde miran la figura y el animal.",
  },

  "arcano-12": {
    slug: "arcano-12",
    numeral: "XII",
    figuras: 1,
    postura: "suspendido",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "ninguno: cabeza descubierta y pelo suelto cayendo hacia abajo",
    manos: {
      derecha: "detrás de la espalda, oculta",
      izquierda: "detrás de la espalda, oculta",
    },
    bajo_los_pies: "nada: cuelga en el aire, y bajo su cabeza no hay suelo",
    encima: "travesaño del que cuelga, sostenido por dos troncos podados",
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: [
      "horca",
      "cuerda",
      "dos troncos",
      "doce muñones",
      "la pierna libre cruzada por detrás, formando un cuatro invertido",
    ],
    observaciones: [
      "Cuelga de un pie, cabeza abajo.",
      "La pierna libre se cruza por detrás y dibuja un cuatro invertido.",
      "Las manos no se ven: están a la espalda.",
      "Los dos troncos tienen ramas podadas, seis en cada uno.",
      "No hay ninguna expresión de dolor.",
    ],
    lecturas: [
      jc("Suspensión voluntaria: se deja de actuar para ver de otra manera."),
      iris("La pierna repite el cuatro del Emperador, pero al revés. Es la misma figura girada."),
    ],
    verify: false,
  },

  "arcano-13": {
    slug: "arcano-13",
    numeral: "XIII",
    figuras: 1,
    postura: "de pie",
    orientacion: "perfil",
    mirada: "izquierda",
    // Descubierto, y eso es la carta: sin capucha, sin hábito, sin manto. La
    // Parca encapuchada es iconografía del norte de Europa, no marsellesa.
    tocado: "ninguno: la figura va descubierta",
    manos: { derecha: "guadaña segando en horizontal, hacia un lado, no hacia abajo", izquierda: null },
    bajo_los_pies: "tierra negra de la que asoman cabezas, manos y pies",
    encima: null,
    detras: null,
    simbolos: [
      "un esqueleto descarnado y desnudo, sin ropa, sin manto y sin capucha, con las costillas y la pelvis a la vista",
      "guadaña",
      "hueso",
      "cabezas coronadas",
      "tierra",
    ],
    observaciones: [
      "Es la única carta de la serie que no lleva nombre escrito.",
      "La guadaña siega hacia un lado, no hacia abajo.",
      "De la tierra salen partes de cuerpos, y algunas llevan corona.",
      "Lo segado y lo que brota comparten el mismo suelo.",
    ],
    lecturas: [
      jc("Corte y limpieza: se retira lo que ya no sostiene, no se anuncia una muerte."),
      iris("Que no tenga nombre es un dato de la carta, no una omisión del impresor."),
    ],
    verify: false,
  },

  "arcano-14": {
    slug: "arcano-14",
    numeral: "XIIII",
    figuras: 1,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "izquierda",
    tocado: "flor o disco sobre la frente",
    manos: {
      derecha: "jarra, vertiendo",
      izquierda: "jarra, recibiendo",
    },
    bajo_los_pies: "suelo",
    encima: null,
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["dos jarras", "alas", "flor frontal"],
    observaciones: [
      "Tiene alas y está de pie, sin volar.",
      "El líquido pasa de una jarra a otra en horizontal.",
      "Ninguna de las dos jarras está más alta que la otra.",
      "Es un gesto continuo: no empieza ni termina en la carta.",
    ],
    lecturas: [
      jc("Circulación: algo pasa de un sitio a otro sin perderse."),
      iris("El trasvase horizontal es lo raro. Vertir cuesta menos hacia abajo."),
    ],
    verify: true,
    verify_note: "Confirmar en qué mano está la jarra que vierte.",
  },

  "arcano-15": {
    slug: "arcano-15",
    numeral: "XV",
    figuras: 3,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "astas",
    manos: {
      derecha: "espada corta o antorcha, en alto",
      izquierda: "apoyada, o alzada con la palma abierta",
    },
    bajo_los_pies: "pedestal al que están atadas dos figuras menores",
    encima: null,
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["astas", "alas", "pedestal", "dos figuras atadas", "cuerdas"],
    observaciones: [
      "Las dos figuras pequeñas llevan el cuello atado con una cuerda floja.",
      "La cuerda no está tensa y las manos de las dos figuras están libres.",
      "La figura central mira de frente, directamente a quien tiene la carta delante.",
      "Repite la composición del arcano V: uno arriba, dos abajo.",
    ],
    lecturas: [
      jc("Atadura y deseo: lo que sujeta con fuerza porque también atrae."),
      iris("La cuerda floja es la observación importante: podrían quitársela."),
    ],
    verify: true,
    verify_note: "Confirmar qué sostiene cada mano; varía bastante entre ediciones.",
  },

  "arcano-16": {
    slug: "arcano-16",
    numeral: "XVI",
    figuras: 2,
    postura: "sin figura",
    orientacion: "n/a",
    mirada: "n/a",
    tocado: null,
    manos: { derecha: null, izquierda: null },
    bajo_los_pies: "suelo, con dos figuras cayendo hacia él",
    encima: "corona de la torre, desprendida",
    detras: "nada al fondo: campo liso de la carta, sin arquitectura ni paisaje",
    simbolos: ["torre", "corona", "lluvia de puntos de color", "dos figuras cayendo"],
    observaciones: [
      "Lo que se desprende es la parte de arriba, no el edificio.",
      "La torre sigue en pie.",
      "Las dos figuras caen en direcciones opuestas.",
      "Caen puntos de colores alrededor, en cantidad, como una lluvia.",
    ],
    lecturas: [
      jc("Ruptura de la forma: cae lo que coronaba, y lo que había dentro sale."),
      iris("La torre no se derrumba. Eso cambia bastante lo que la carta está diciendo."),
    ],
    verify: false,
  },

  "arcano-17": {
    slug: "arcano-17",
    numeral: "XVII",
    figuras: 1,
    postura: "de pie",
    orientacion: "tres cuartos",
    mirada: "abajo",
    tocado: "ninguno: cabeza descubierta y pelo suelto",
    manos: {
      derecha: "jarra, vertiendo sobre el agua",
      izquierda: "jarra, vertiendo sobre la tierra",
    },
    bajo_los_pies: "una rodilla en tierra, junto a la orilla",
    encima: "una estrella grande y siete menores",
    detras: "la línea del horizonte, con el arbusto y el ave",
    simbolos: ["ocho estrellas", "dos jarras", "ave sobre un arbusto", "agua"],
    observaciones: [
      "Está desnuda y arrodillada, no de pie del todo.",
      "Vierte hacia abajo con las dos manos, cada una en un sitio distinto.",
      "Hay ocho estrellas: una mayor y siete alrededor.",
      "Un ave posada en un arbusto, al fondo.",
    ],
    lecturas: [
      jc("Entrega sin reserva: se da a la tierra y al agua sin guardar nada."),
      iris(
        "Es la contrafigura del XIIII: allí el trasvase era horizontal y cerrado; aquí es hacia abajo y se vacía.",
      ),
    ],
    verify: false,
  },

  "arcano-18": {
    slug: "arcano-18",
    numeral: "XVIII",
    figuras: 4,
    postura: "sin figura",
    orientacion: "n/a",
    mirada: "n/a",
    tocado: null,
    manos: { derecha: null, izquierda: null },
    bajo_los_pies: "estanque en el que hay un cangrejo",
    encima: "luna de perfil dentro de un disco, con gotas cayendo",
    detras: "dos torres, una a cada lado",
    simbolos: ["luna", "dos torres", "dos animales", "cangrejo", "gotas"],
    observaciones: [
      "No hay ninguna figura humana.",
      "Dos animales aúllan hacia arriba, uno a cada lado, entre dos torres.",
      "El cangrejo está debajo del agua y es lo único que no mira hacia arriba.",
      "Las gotas caen de la luna, pero también parece que suban.",
    ],
    lecturas: [
      jc("Lo que no se ve con claridad: territorio de lo nocturno y de lo que aún no tiene forma."),
      iris("El cangrejo es el único que está en el agua. Suele ser el detalle que la gente pasa por alto."),
    ],
    verify: false,
  },

  "arcano-19": {
    slug: "arcano-19",
    numeral: "XVIIII",
    figuras: 3,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "ninguno: las dos figuras van con la cabeza descubierta",
    manos: { derecha: "tocando al otro", izquierda: "tocando al otro" },
    bajo_los_pies: "suelo, delante de un muro bajo",
    encima: "sol con rostro, del que caen gotas",
    detras: "un muro bajo por el que se ve el fondo",
    simbolos: [
      "sol con rostro",
      "dos figuras juntas que se tocan",
      "muro",
      "gotas",
    ],
    observaciones: [
      "Dos figuras juntas, tocándose, delante de un muro.",
      "El sol tiene cara y mira hacia abajo, hacia ellas.",
      "El muro es bajo: se ve por encima.",
      "Caen gotas, igual que en la Luna, pero aquí a plena luz.",
    ],
    lecturas: [
      jc("Claridad compartida: lo que se ve entre dos, sin sombra."),
      iris("Repite las gotas del XVIII. Las mismas gotas, otra luz."),
    ],
    verify: true,
    verify_note: "Confirmar si las dos figuras son iguales o una es mayor.",
  },

  "arcano-20": {
    slug: "arcano-20",
    numeral: "XX",
    figuras: 4,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "arriba",
    tocado: "ninguno: las tres figuras humanas van con la cabeza descubierta",
    manos: { derecha: "alzadas", izquierda: "alzadas" },
    bajo_los_pies: "tierra abierta, de la que emerge una figura",
    encima: "figura alada tocando una trompeta, dentro de un halo",
    detras: "la línea del horizonte",
    simbolos: ["trompeta", "alas", "estandarte", "tres figuras humanas"],
    observaciones: [
      "Una figura sale de la tierra, entre otras dos que están de pie.",
      "La que emerge está de espaldas a quien mira la carta.",
      "Todos miran hacia arriba menos quien mira el naipe.",
      "La trompeta lleva un estandarte colgado.",
    ],
    lecturas: [
      jc("Llamada y salida: algo que estaba enterrado responde y sale."),
      iris("La figura central está de espaldas. Es la única de la serie que no nos deja verle la cara."),
    ],
    verify: false,
  },

  "arcano-21": {
    slug: "arcano-21",
    numeral: "XXI",
    figuras: 5,
    postura: "de pie",
    orientacion: "frontal",
    mirada: "al frente",
    tocado: "ninguno: va con la cabeza descubierta",
    manos: { derecha: "una varita", izquierda: "una varita" },
    bajo_los_pies: "nada: la figura está suspendida dentro de la corona vegetal",
    encima: null,
    detras: "nada: la figura flota dentro de la corona vegetal",
    simbolos: ["corona vegetal", "cuatro criaturas en las esquinas", "velo", "varitas"],
    observaciones: [
      "Una figura dentro de una corona vegetal ovalada.",
      "En cada esquina hay una criatura distinta: cuatro, una por esquina.",
      "La figura central está suspendida: no pisa nada.",
      "Las cuatro criaturas miran hacia dentro, hacia ella.",
    ],
    lecturas: [
      jc("Integración: los cuatro territorios reunidos alrededor de un centro."),
      iris("Las cuatro esquinas son los cuatro palos dicho de otra manera. Cierra lo que abrió el Mago."),
    ],
    verify: false,
  },
};

/* ---------------------------------------------------------------------------
 * Utilidades
 * ------------------------------------------------------------------------- */

export function attributesFor(slug: CardSlug): MajorAttributes | null {
  return MAJOR_ATTRIBUTES[slug] ?? null;
}

/** Cartas cuyos atributos hay que contrastar con una baraja física. */
export function needsVerification(): MajorAttributes[] {
  return Object.values(MAJOR_ATTRIBUTES).filter((a) => a.verify);
}
