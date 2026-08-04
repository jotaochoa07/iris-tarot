/**
 * Los 22 Arcanos Mayores.
 *
 * `visual` describe únicamente elementos que están efectivamente impresos en las
 * ediciones clásicas del Tarot de Marsella (linaje Conver / Noblet / Dodal). Es
 * descripción iconográfica, no interpretación, y por eso puede afirmarse.
 *
 * `axis` es la tensión estructural que la carta pone en juego. Redacción
 * original de IRIS sobre el sistema de Jodorowsky/Costa.
 */

export interface MajorEntry {
  slug: string;
  number: number | null; // El Loco no lleva número
  roman: string;
  name: string;
  name_fr: string;
  visual: string;
  axis: string;
  observe: string;
}

export const MAJORS: MajorEntry[] = [
  {
    slug: "arcano-00",
    number: null,
    roman: "—",
    name: "El Loco",
    name_fr: "Le Mat",
    visual:
      "Camina hacia la derecha con un hatillo al hombro sostenido por un bastón. Un animal le tira de la ropa por detrás. No lleva número ni marco que lo detenga.",
    axis: "Energía sin forma ni destino asignado. Libertad y también desamparo.",
    observe:
      "Es la única carta sin número. Fíjate en qué dirección camina respecto a las cartas vecinas.",
  },
  {
    slug: "arcano-01",
    number: 1,
    roman: "I",
    name: "El Mago",
    name_fr: "Le Bateleur",
    visual:
      "De pie tras una mesa con objetos dispersos: copa, monedas, cuchillos, cubiletes. Sostiene una varita en una mano y un objeto pequeño en la otra. El ala de su sombrero dibuja una figura tumbada de ocho.",
    axis: "Todos los recursos disponibles y ninguno todavía elegido.",
    observe:
      "Sobre su mesa aparecen los cuatro palos. Es el arcano que resume el material del Tarot.",
  },
  {
    slug: "arcano-02",
    number: 2,
    roman: "II",
    name: "La Papisa",
    name_fr: "La Papesse",
    visual:
      "Sentada, con un libro abierto sobre el regazo y un velo desplegado tras ella. Lleva tiara. La postura es contenida y frontal.",
    axis: "Conocimiento que se guarda antes de compartirse. Interioridad y estudio.",
    observe: "El libro está abierto pero ella no lo señala. Nada sale todavía.",
  },
  {
    slug: "arcano-03",
    number: 3,
    roman: "III",
    name: "La Emperatriz",
    name_fr: "L'Impératrice",
    visual:
      "Sentada de frente, corona, cetro rematado en globo y escudo con águila apoyado a su lado. El cuerpo se abre hacia el espectador.",
    axis: "Creatividad que se manifiesta y se expresa hacia fuera.",
    observe: "Compárala con la Papisa: mismo asiento, apertura opuesta.",
  },
  {
    slug: "arcano-04",
    number: 4,
    roman: "IIII",
    name: "El Emperador",
    name_fr: "L'Empereur",
    visual:
      "Sentado de perfil, con las piernas cruzadas formando un cuatro. Cetro con globo y escudo con águila. Postura firme y cerrada.",
    axis: "Estructura, límite, autoridad que sostiene un orden.",
    observe: "Sus piernas dibujan el propio número de la carta.",
  },
  {
    slug: "arcano-05",
    number: 5,
    roman: "V",
    name: "El Papa",
    name_fr: "Le Pape",
    visual:
      "Sentado entre dos columnas, con tiara de tres pisos y la mano alzada en gesto de bendición. Dos figuras tonsuradas aparecen de espaldas ante él.",
    axis: "Puente y transmisión: alguien enseña, alguien recibe.",
    observe:
      "Es un cinco: introduce apertura y crisis en la estructura del cuatro anterior.",
  },
  {
    slug: "arcano-06",
    number: 6,
    roman: "VI",
    name: "El Enamorado",
    name_fr: "L'Amoureux",
    visual:
      "Una figura central entre otras dos. Arriba, dentro de un sol radiante, un pequeño ser alado tensa un arco.",
    axis: "Elección y vínculo. Estar entre dos cosas y tener que decidir.",
    observe: "Mira hacia dónde inclina la cabeza la figura del centro.",
  },
  {
    slug: "arcano-07",
    number: 7,
    roman: "VII",
    name: "El Carro",
    name_fr: "Le Chariot",
    visual:
      "Figura coronada dentro de un carro con dosel sostenido por cuatro columnas. Dos caballos tiran en direcciones divergentes.",
    axis: "Partida y avance. Movimiento que necesita ser conducido.",
    observe:
      "Los caballos no miran al mismo lado. Fíjate en cómo eso afecta al movimiento de la tirada.",
  },
  {
    slug: "arcano-08",
    number: 8,
    roman: "VIII",
    name: "La Justicia",
    name_fr: "La Justice",
    visual:
      "Sentada y frontal, coronada. Sostiene una espada vertical en una mano y una balanza en la otra.",
    axis: "Equilibrio, medida, decisión que corta.",
    observe: "Es la única figura mayor que sostiene a la vez espada y balanza.",
  },
  {
    slug: "arcano-09",
    number: 9,
    roman: "VIIII",
    name: "El Ermitaño",
    name_fr: "L'Hermite",
    visual:
      "Anciano de pie, envuelto en una capa larga. Lleva un farol en una mano y un bastón en la otra. Avanza despacio.",
    axis: "Búsqueda, retirada, lucidez que necesita soledad.",
    observe: "El farol ilumina poco espacio. Solo el paso siguiente.",
  },
  {
    slug: "arcano-10",
    number: 10,
    roman: "X",
    name: "La Rueda de la Fortuna",
    name_fr: "La Roue de Fortune",
    visual:
      "Una rueda con manivela. Una criatura asciende por un lado, otra desciende por el otro y una tercera, coronada y con espada, se sostiene arriba sobre una plataforma.",
    axis: "Ciclo, giro, aquello que no depende enteramente de uno.",
    observe: "Nadie sujeta la manivela. Pregúntate quién mueve la rueda.",
  },
  {
    slug: "arcano-11",
    number: 11,
    roman: "XI",
    name: "La Fuerza",
    name_fr: "La Force",
    visual:
      "Una mujer con sombrero de ala en forma de ocho tumbado abre con las manos las fauces de un león.",
    axis: "Trato con la propia energía animal. Dominio sin violencia.",
    observe:
      "Comparte el sombrero con El Mago. Fíjate en qué comparten esas dos cartas.",
  },
  {
    slug: "arcano-12",
    number: 12,
    roman: "XII",
    name: "El Colgado",
    name_fr: "Le Pendu",
    visual:
      "Un hombre suspendido por un pie de una viga apoyada entre dos árboles podados. La pierna libre cruza formando un cuatro. Las manos quedan detrás.",
    axis: "Suspensión voluntaria. Ver desde otra posición y no actuar.",
    observe: "Su rostro está sereno. No es una carta de castigo.",
  },
  {
    slug: "arcano-13",
    number: 13,
    roman: "XIII",
    name: "Arcano sin nombre",
    name_fr: "—",
    visual:
      "Un esqueleto siega con una guadaña un terreno del que emergen manos, pies y cabezas. En la mayoría de ediciones clásicas la carta no lleva título impreso.",
    axis: "Corte limpio, fin de un ciclo, limpieza necesaria.",
    observe:
      "Que no tenga nombre es un dato de la carta, no un olvido de imprenta.",
  },
  {
    slug: "arcano-14",
    number: 14,
    roman: "XIIII",
    name: "Templanza",
    name_fr: "Tempérance",
    visual:
      "Figura alada que vierte un líquido de un jarro a otro sin derramarlo. Los pies quedan asentados.",
    axis: "Circulación, mezcla, tiempo que hace su trabajo.",
    observe: "El líquido pasa entre dos recipientes: nada se pierde ni se fuerza.",
  },
  {
    slug: "arcano-15",
    number: 15,
    roman: "XV",
    name: "El Diablo",
    name_fr: "Le Diable",
    visual:
      "Figura andrógina con cuernos y alas, de pie sobre un pedestal, con una antorcha en alto. Dos seres menores, también con cuernos, están atados al pedestal por el cuello.",
    axis: "Deseo, atadura, la energía que fascina y captura.",
    observe:
      "Las cuerdas de los dos seres están flojas. Fíjate en eso antes de interpretar.",
  },
  {
    slug: "arcano-16",
    number: 16,
    roman: "XVI",
    name: "La Casa Dios",
    name_fr: "La Maison Dieu",
    visual:
      "Una torre cuya coronación se desprende por el impacto de un rayo. Dos figuras caen. Alrededor se dispersan pequeñas esferas de colores.",
    axis: "Ruptura súbita de una estructura. Liberación por fuerza.",
    observe:
      "La torre no se destruye: pierde la tapa. Lo que estaba cerrado se abre.",
  },
  {
    slug: "arcano-17",
    number: 17,
    roman: "XVII",
    name: "La Estrella",
    name_fr: "L'Étoile",
    visual:
      "Una mujer desnuda, arrodillada junto al agua, vierte dos jarras. Sobre ella una estrella grande y varias menores. En un arbusto se posa un ave.",
    axis: "Entrega sin cálculo. Confianza y renovación.",
    observe: "Una jarra vierte en el agua y otra en la tierra.",
  },
  {
    slug: "arcano-18",
    number: 18,
    roman: "XVIII",
    name: "La Luna",
    name_fr: "La Lune",
    visual:
      "Una luna de perfil con rostro, entre dos torres. Dos canes alzan la cabeza hacia ella. Abajo, un crustáceo en el agua. Caen gotas.",
    axis: "Zona de sombra, imaginación, lo que aún no se ve con claridad.",
    observe: "Las gotas suben o bajan según la edición. Míralo antes de decidir.",
  },
  {
    slug: "arcano-19",
    number: 19,
    roman: "XVIIII",
    name: "El Sol",
    name_fr: "Le Soleil",
    visual:
      "Un sol con rostro y rayos alternos. Caen gotas. Debajo, dos figuras jóvenes junto a un muro bajo.",
    axis: "Claridad compartida. Lo que se ve y se puede sostener con otro.",
    observe: "Son dos figuras, no una. El sol aquí ilumina un vínculo.",
  },
  {
    slug: "arcano-20",
    number: 20,
    roman: "XX",
    name: "El Juicio",
    name_fr: "Le Jugement",
    visual:
      "Un ángel entre nubes toca una trompeta de la que pende un estandarte. Debajo, tres figuras desnudas; la central aparece de espaldas y emergiendo.",
    axis: "Llamada, renacimiento, algo que convoca desde fuera.",
    observe: "La figura del centro está saliendo. No ha salido todavía.",
  },
  {
    slug: "arcano-21",
    number: 21,
    roman: "XXI",
    name: "El Mundo",
    name_fr: "Le Monde",
    visual:
      "Una figura dentro de una guirnalda ovalada. En las cuatro esquinas, un ángel, un águila, un león y un toro.",
    axis: "Integración. Un ciclo que se cierra conteniendo sus partes.",
    observe: "Las cuatro esquinas remiten a los cuatro palos.",
  },
];

export const MAJORS_BY_SLUG: Record<string, MajorEntry> = Object.fromEntries(
  MAJORS.map((m) => [m.slug, m]),
);
