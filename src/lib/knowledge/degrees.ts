/**
 * Grados numerológicos del 1 al 10 y las cuatro figuras.
 *
 * Capa 1 del corpus: redacción original de IRIS sobre el sistema estructural de
 * Jodorowsky/Costa. El principio pedagógico del producto es que el grado se
 * comprende ANTES de combinarlo con el palo: primero qué es un V, después qué
 * ocurre cuando ese V se expresa en Espadas.
 */

export interface DegreeEntry {
  /** 1–10 para los números; 11–14 para Sota, Caballo, Reina, Rey. */
  value: number;
  roman: string;
  label: string;
  /** Qué hace el grado, con independencia del palo. */
  gesture: string;
  /** Cómo enseñarlo en una frase. */
  in_one_line: string;
  /** Qué observar cuando aparece. */
  observe: string;
}

export const DEGREES: Record<number, DegreeEntry> = {
  1: {
    value: 1,
    roman: "I",
    label: "As",
    gesture:
      "Potencial puro, todavía sin desarrollar. El As no es el comienzo de una historia: es la semilla que contiene la posibilidad entera del palo, ofrecida y aún intacta.",
    in_one_line: "Todo está disponible y nada ha ocurrido todavía.",
    observe:
      "Un As abre un territorio. Fíjate en si la tirada lo desarrolla o lo deja sin usar.",
  },
  2: {
    value: 2,
    roman: "II",
    label: "Dos",
    gesture:
      "Acumulación y espera. El dos recoge, guarda, sostiene. Es pasivo en el mejor sentido: aún no gasta lo que tiene. También introduce la dualidad, y con ella la posibilidad de elegir.",
    in_one_line: "Se reúne energía que todavía no se gasta.",
    observe:
      "Después de un dos suele haber una pregunta implícita: ¿esto se guarda o se pone en marcha?",
  },
  3: {
    value: 3,
    roman: "III",
    label: "Tres",
    gesture:
      "Primera salida hacia fuera. Lo que se acumuló en el dos estalla y produce algo. Es el grado de la creación, de la fecundidad, de la energía que se derrama.",
    in_one_line: "Lo acumulado se convierte en obra.",
    observe:
      "El tres produce, pero no ordena. Mira qué carta viene después a darle forma.",
  },
  4: {
    value: 4,
    roman: "IIII",
    label: "Cuatro",
    gesture:
      "Estabilidad, estructura, marco. El cuatro pone límites y construye un suelo. Da seguridad; también puede quedarse quieto más tiempo del necesario.",
    in_one_line: "Se levanta una estructura estable.",
    observe:
      "Un cuatro puede ser base o puede ser estancamiento. La diferencia suele estar en la carta siguiente.",
  },
  5: {
    value: 5,
    roman: "V",
    label: "Cinco",
    gesture:
      "Crisis y apertura. El cinco rompe la estabilidad del cuatro para permitir que algo avance. Es tentación, prueba, contacto con lo que no se domina. No es un grado negativo: es el punto donde el sistema se abre.",
    in_one_line: "Se rompe la estructura para que algo pueda pasar.",
    observe:
      "El cinco es el centro del recorrido. Pregúntate qué se está poniendo a prueba, no qué va a salir mal.",
  },
  6: {
    value: 6,
    roman: "VI",
    label: "Seis",
    gesture:
      "Belleza, placer, receptividad. Después de la crisis aparece un momento de gozo y de armonía, pero es un estado que se recibe más que se conquista, y por eso también puede volverse dependencia.",
    in_one_line: "Algo se disfruta y se acepta.",
    observe:
      "Fíjate en si el seis es descanso merecido o comodidad que impide moverse.",
  },
  7: {
    value: 7,
    roman: "VII",
    label: "Siete",
    gesture:
      "Acción y partida. El siete abandona el lugar del seis y se pone en marcha. Es el grado del que sale, del que actúa aun sin garantías.",
    in_one_line: "Se sale del sitio y se actúa.",
    observe: "Un siete implica dejar algo atrás. Mira qué queda sin resolver.",
  },
  8: {
    value: 8,
    roman: "VIII",
    label: "Ocho",
    gesture:
      "Perfección estable dentro de su plano. El ocho consolida lo conseguido y lo sostiene. Es equilibrio duradero; puede volverse rigidez si se le pide que dure para siempre.",
    in_one_line: "Lo conseguido se sostiene con equilibrio.",
    observe: "El ocho no busca más. Pregúntate si eso es plenitud o cierre.",
  },
  9: {
    value: 9,
    roman: "VIIII",
    label: "Nueve",
    gesture:
      "Crisis final del ciclo. El nueve cuestiona lo que el ocho consolidó, prepara el desprendimiento y mira hacia lo que viene. Es lucidez y también soledad.",
    in_one_line: "Se revisa el ciclo antes de cerrarlo.",
    observe:
      "El nueve suele traer una pregunta honesta sobre lo que ya no sirve.",
  },
  10: {
    value: 10,
    roman: "X",
    label: "Diez",
    gesture:
      "Final y tránsito. El diez lleva el palo a su máximo: es plenitud y también exceso. Contiene la semilla de un ciclo nuevo en otro nivel.",
    in_one_line: "El ciclo se completa y empuja hacia otro plano.",
    observe:
      "Un diez es un umbral. Fíjate en si la tirada lo trata como llegada o como salida.",
  },
  11: {
    value: 11,
    roman: "—",
    label: "Sota",
    gesture:
      "La figura que aprende. La Sota está de pie, sin poder aún, en contacto directo con el signo de su palo. Representa la fase de estudio, de preparación, de lo que empieza a manifestarse en una persona.",
    in_one_line: "Alguien —o algo en ti— está aprendiendo este territorio.",
    observe: "Mira hacia dónde mira la Sota y cómo sostiene el signo del palo.",
  },
  12: {
    value: 12,
    roman: "—",
    label: "Caballero",
    gesture:
      "La figura que se desplaza. El Caballero introduce movimiento: traslada la energía del palo de un lugar a otro. Llega o se va, pero no permanece.",
    in_one_line: "Algo entra o sale de la situación.",
    observe:
      "La dirección del caballo importa: hacia dónde avanza dentro de la tirada.",
  },
  13: {
    value: 13,
    roman: "—",
    label: "Reina",
    gesture:
      "La figura sentada que recibe. La Reina contiene el palo hacia dentro: lo comprende, lo sostiene, lo elabora en su interior antes de que se manifieste.",
    in_one_line: "El territorio se vive por dentro.",
    observe:
      "Fíjate en si la Reina sostiene el signo del palo con firmeza o apenas lo roza.",
  },
  14: {
    value: 14,
    roman: "—",
    label: "Rey",
    gesture:
      "La figura sentada que realiza hacia fuera. El Rey representa el dominio exterior del palo: la autoridad, la capacidad de sostener el territorio en el mundo.",
    in_one_line: "El territorio se ejerce hacia fuera.",
    observe: "La mirada del Rey suele indicar hacia dónde dirige su autoridad.",
  },
};

export const COURT_VALUES = [11, 12, 13, 14] as const;

export function isCourt(value: number): boolean {
  return value >= 11;
}
