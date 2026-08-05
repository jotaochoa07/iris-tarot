import type { DeckPalette } from "@/lib/deck/palettes";
import {
  CX,
  FIELD_BOT,
  FIELD_TOP,
  H,
  W,
  axisPath,
  batonPath,
  bladePath,
  crosses,
  grid,
  mandorlas,
  veinPath,
} from "@/lib/deck/layout";
import { getCard } from "@/lib/knowledge/cards";
import type { Suit } from "@/lib/types";

/**
 * IRIS Marseille Deck.
 *
 * Ilustración original inspirada en la estructura histórica del Tarot de
 * Marsella. No es un calco ni un retoque de ninguna edición viva: la geometría
 * se genera a partir de la regla de la baraja —tantos signos curvos, eje recto
 * si el número es impar— y el ornamento es propio.
 *
 * El componente no conoce colores. Recibe una paleta y dibuja.
 */

export function IrisCard({
  slug,
  palette: p,
  className = "",
}: {
  slug: string;
  palette: DeckPalette;
  className?: string;
}) {
  const card = getCard(slug);
  if (!card) return null;

  const isMinor = card.arcana === "minor";
  const suit = card.suit as Suit | null;
  const n = card.degree ?? 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={card.name}
    >
      <Field p={p} />
      <Border p={p} />
      <Foliage p={p} />

      {isMinor && suit && !card.is_court && <Pips p={p} suit={suit} n={n} />}
      {isMinor && suit && card.is_court && <Court p={p} suit={suit} n={n} />}
      {card.arcana === "major" && <Major p={p} roman={card.roman} />}

      {card.roman !== "—" && <Numerals p={p} roman={card.roman} />}
      <Cartouche p={p} name={card.name} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Naipe
 * ------------------------------------------------------------------------- */

function Field({ p }: { p: DeckPalette }) {
  return <rect width={W} height={H} fill={p.field} />;
}

/**
 * La orla.
 *
 * Copiada de la carta maestra —El Emperador— para que las 78 parezcan la misma
 * baraja: filete fino exterior, filete rojo interior, hoja dorada en cada
 * esquina, numeral arriba y repetido girado en los dos cantos, y al pie una
 * doble regla con la cartela del nombre.
 *
 * Cualquier cambio aquí hay que hacerlo también en `docs/iris-tarot-style-v1.md`,
 * que es lo que lee quien ilustra los Mayores.
 */
function Border({ p }: { p: DeckPalette }) {
  return (
    <g>
      <rect
        x="7"
        y="7"
        width={W - 14}
        height={H - 14}
        rx="4"
        fill="none"
        stroke={p.line}
        strokeWidth="1.6"
      />
      <rect
        x="15"
        y="15"
        width={W - 30}
        height={H - 30}
        rx="2"
        fill="none"
        stroke={p.ember}
        strokeWidth="1.1"
      />
      {/* Hojas doradas en las cuatro esquinas, inclinadas hacia dentro. */}
      <g fill={p.gold} stroke={p.line} strokeWidth="0.8">
        <Leaf x={30} y={30} rot={38} s={0.62} />
        <Leaf x={W - 30} y={30} rot={128} s={0.62} />
        <Leaf x={W - 30} y={H - 30} rot={218} s={0.62} />
        <Leaf x={30} y={H - 30} rot={308} s={0.62} />
      </g>
    </g>
  );
}

/** Doble regla y cartela al pie, como en la maestra. */
function Cartouche({ p, name }: { p: DeckPalette; name: string }) {
  return (
    <g>
      <line x1="74" y1="524" x2={W - 74} y2="524" stroke={p.line} strokeWidth="1.2" />
      <line x1="74" y1="528" x2={W - 74} y2="528" stroke={p.foliage} strokeWidth="1.4" />
      <text
        x={CX}
        y="562"
        textAnchor="middle"
        fill={p.line}
        fontSize="21"
        fontFamily="'EB Garamond', Georgia, serif"
        letterSpacing="3.4"
      >
        {name.toUpperCase()}
      </text>
    </g>
  );
}

/** Vegetación que trepa por los costados. Presente en todas las cartas. */
function Foliage({ p }: { p: DeckPalette }) {
  const L = 60;
  const R = W - 60;
  return (
    <g>
      <g fill="none" stroke={p.foliage} strokeWidth="1.6" opacity="0.85">
        <path d={`M${L} 132 C${L - 20} 220 ${L - 20} 380 ${L} 468`} />
        <path d={`M${R} 132 C${R + 20} 220 ${R + 20} 380 ${R} 468`} />
        <path
          d={`M${L} 192 C${L + 16} 188 ${L + 24} 176 ${L + 22} 164
              M${L} 292 C${L + 18} 290 ${L + 28} 280 ${L + 28} 268
              M${L} 392 C${L + 16} 396 ${L + 24} 406 ${L + 22} 418`}
        />
        <path
          d={`M${R} 192 C${R - 16} 188 ${R - 24} 176 ${R - 22} 164
              M${R} 292 C${R - 18} 290 ${R - 28} 280 ${R - 28} 268
              M${R} 392 C${R - 16} 396 ${R - 24} 406 ${R - 22} 418`}
        />
      </g>
      <g fill={p.foliageBody} stroke={p.foliage} strokeWidth="0.9">
        <Leaf x={L + 12} y={178} rot={-35} s={0.56} />
        <Leaf x={L + 12} y={404} rot={35} s={0.56} />
        <Leaf x={R - 12} y={178} rot={215} s={0.56} />
        <Leaf x={R - 12} y={404} rot={145} s={0.56} />
      </g>
    </g>
  );
}

function Leaf({
  x,
  y,
  rot,
  s,
}: {
  x: number;
  y: number;
  rot: number;
  s: number;
}) {
  return (
    <path
      d="M0,0 C14,-6 26,-2 32,10 C20,16 6,12 0,0 Z"
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
    />
  );
}

/** Roseta de ocho pétalos. Marca los vértices donde los signos se encuentran. */
function Rosette({
  x,
  y,
  s = 1,
  petals = 8,
  p,
  heart = true,
}: {
  x: number;
  y: number;
  s?: number;
  petals?: number;
  p: DeckPalette;
  heart?: boolean;
}) {
  const step = 360 / petals;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: petals }, (_, i) => (
        <path
          key={i}
          d="M0,0 Q8,-13 0,-27 Q-8,-13 0,0 Z"
          transform={`rotate(${i * step})`}
          fill={p.gold}
          stroke={p.line}
          strokeWidth="1.2"
        />
      ))}
      {heart && (
        <circle r="6.5" fill={p.ember} stroke={p.line} strokeWidth="1.1" />
      )}
    </g>
  );
}

/* ---------------------------------------------------------------------------
 * Arcanos Menores numerales
 * ------------------------------------------------------------------------- */

function Pips({ p, suit, n }: { p: DeckPalette; suit: Suit; n: number }) {
  if (suit === "espadas" || suit === "bastos") {
    return <Interlaced p={p} suit={suit} n={n} />;
  }
  return <Ordered p={p} suit={suit} n={n} />;
}

/** Espadas y Bastos: se entrelazan, y el impar añade eje. */
function Interlaced({
  p,
  suit,
  n,
}: {
  p: DeckPalette;
  suit: "espadas" | "bastos";
  n: number;
}) {
  const odd = n % 2 === 1;
  const pairs = Math.floor(n / 2);
  const col = p.suits[suit];

  if (n === 1) return <Ace p={p} suit={suit} />;

  return (
    <g>
      {suit === "espadas" &&
        mandorlas(pairs).map((m, i) => (
          <g key={i}>
            <path
              d={bladePath(m, -1)}
              fill={col.body}
              stroke={p.line}
              strokeWidth="1.6"
            />
            <path
              d={bladePath(m, 1)}
              fill={col.body}
              stroke={p.line}
              strokeWidth="1.6"
            />
            <path
              d={veinPath(m, -1)}
              fill="none"
              stroke={col.vein}
              strokeWidth="1.4"
            />
            <path
              d={veinPath(m, 1)}
              fill="none"
              stroke={col.vein}
              strokeWidth="1.4"
            />
          </g>
        ))}

      {suit === "bastos" &&
        crosses(pairs).map((c, i) => (
          <g key={i}>
            <path
              d={batonPath(c, 1)}
              fill={col.body}
              stroke={p.line}
              strokeWidth="1.4"
            />
            <path
              d={batonPath(c, -1)}
              fill={col.body}
              stroke={p.line}
              strokeWidth="1.4"
            />
            {/* Nudos del bastón. */}
            <g stroke={col.vein} strokeWidth="1.2">
              <line
                x1={CX - c.half * 0.45}
                y1={c.top + (c.bot - c.top) * 0.28}
                x2={CX - c.half * 0.3}
                y2={c.top + (c.bot - c.top) * 0.31}
              />
              <line
                x1={CX + c.half * 0.45}
                y1={c.top + (c.bot - c.top) * 0.28}
                x2={CX + c.half * 0.3}
                y2={c.top + (c.bot - c.top) * 0.31}
              />
            </g>
          </g>
        ))}

      {/* Vértices donde los signos se encuentran. */}
      <Rosette p={p} x={CX} y={FIELD_TOP} s={0.9} />
      <Rosette p={p} x={CX} y={FIELD_BOT} s={0.9} />

      {odd && <Axis p={p} suit={suit} />}
    </g>
  );
}

/** El eje recto. Es lo único que distingue a un impar de un par. */
function Axis({ p, suit }: { p: DeckPalette; suit: "espadas" | "bastos" }) {
  const top = FIELD_TOP - 44;
  const bot = FIELD_BOT;
  return (
    <g>
      <path
        d={axisPath(top, bot, suit === "bastos" ? 13 : 10)}
        fill={p.axis}
        stroke={p.line}
        strokeWidth="1.5"
      />
      <line
        x1={CX}
        y1={top + 18}
        x2={CX}
        y2={bot - 8}
        stroke={p.axisVein}
        strokeWidth="1.3"
        opacity="0.75"
      />
      <Hilt p={p} y={bot} />
    </g>
  );
}

/** Guarda, puño y pomo. */
function Hilt({ p, y }: { p: DeckPalette; y: number }) {
  return (
    <g>
      <path
        d={`M${CX - 44},${y} C${CX - 28},${y - 6} ${CX + 28},${y - 6} ${CX + 44},${y}
            L${CX + 44},${y + 14} C${CX + 28},${y + 8} ${CX - 28},${y + 8} ${CX - 44},${y + 14} Z`}
        fill={p.gold}
        stroke={p.line}
        strokeWidth="1.4"
      />
      <rect
        x={CX - 8}
        y={y + 14}
        width="16"
        height="44"
        fill={p.goldDeep}
        stroke={p.line}
        strokeWidth="1.2"
      />
      <g stroke={p.line} strokeWidth="0.8">
        <line x1={CX - 7} y1={y + 24} x2={CX + 7} y2={y + 24} />
        <line x1={CX - 7} y1={y + 34} x2={CX + 7} y2={y + 34} />
        <line x1={CX - 7} y1={y + 44} x2={CX + 7} y2={y + 44} />
      </g>
      <circle
        cx={CX}
        cy={y + 68}
        r="13"
        fill={p.gold}
        stroke={p.line}
        strokeWidth="1.4"
      />
      <circle cx={CX} cy={y + 68} r="5" fill={p.ember} />
    </g>
  );
}

/** Copas y Oros: se ordenan en retícula. */
function Ordered({
  p,
  suit,
  n,
}: {
  p: DeckPalette;
  suit: "copas" | "oros";
  n: number;
}) {
  if (n === 1) return <Ace p={p} suit={suit} />;
  return (
    <g>
      {grid(n).map((node, i) =>
        suit === "copas" ? (
          <Cup key={i} p={p} {...node} />
        ) : (
          <Coin key={i} p={p} {...node} />
        ),
      )}
    </g>
  );
}

function Cup({
  p,
  x,
  y,
  scale,
}: {
  p: DeckPalette;
  x: number;
  y: number;
  scale: number;
}) {
  const c = p.suits.copas;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M-26,-26 L26,-26 L18,4 L-18,4 Z"
        fill={c.body}
        stroke={p.line}
        strokeWidth="1.5"
      />
      <path d="M-26,-26 Q0,-34 26,-26" fill={p.gold} stroke={p.line} strokeWidth="1.3" />
      <path d="M-19,-20 Q0,-14 19,-20" fill="none" stroke={c.vein} strokeWidth="1.2" />
      <rect x="-4" y="4" width="8" height="14" fill={p.goldDeep} stroke={p.line} strokeWidth="1.1" />
      <path d="M-18,18 L18,18 L14,26 L-14,26 Z" fill={p.gold} stroke={p.line} strokeWidth="1.3" />
      <circle cy="-11" r="4.5" fill={p.ember} stroke={p.line} strokeWidth="1" />
    </g>
  );
}

function Coin({
  p,
  x,
  y,
  scale,
}: {
  p: DeckPalette;
  x: number;
  y: number;
  scale: number;
}) {
  const c = p.suits.oros;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="27" fill={c.body} stroke={p.line} strokeWidth="1.6" />
      <circle r="21" fill="none" stroke={c.vein} strokeWidth="1.2" />
      <Rosette p={p} x={0} y={0} s={0.52} petals={6} heart={false} />
      <circle r="5.5" fill={p.ember} stroke={p.line} strokeWidth="1.1" />
    </g>
  );
}

/** El As: un solo signo, grande, sostenido por el ornamento. */
function Ace({ p, suit }: { p: DeckPalette; suit: Suit }) {
  const cy = (FIELD_TOP + FIELD_BOT) / 2;

  if (suit === "copas") return <Cup p={p} x={CX} y={cy} scale={2.3} />;
  if (suit === "oros") return <Coin p={p} x={CX} y={cy} scale={2.4} />;

  const col = p.suits[suit];
  const top = FIELD_TOP - 34;
  const bot = FIELD_BOT;

  return (
    <g>
      {/* Corona atravesada: el As de Espadas del canon, redibujado. */}
      {suit === "espadas" && (
        <g>
          <path
            d={`M${CX - 62},${cy + 6} Q${CX},${cy - 30} ${CX + 62},${cy + 6}
                Q${CX},${cy + 26} ${CX - 62},${cy + 6} Z`}
            fill={p.gold}
            stroke={p.line}
            strokeWidth="1.7"
          />
          <g stroke={p.line} strokeWidth="1.4" fill="none">
            <path d={`M${CX - 48},${cy + 4} L${CX - 48},${cy - 14}`} />
            <path d={`M${CX - 24},${cy - 2} L${CX - 24},${cy - 24}`} />
            <path d={`M${CX + 24},${cy - 2} L${CX + 24},${cy - 24}`} />
            <path d={`M${CX + 48},${cy + 4} L${CX + 48},${cy - 14}`} />
          </g>
          <circle cx={CX - 48} cy={cy - 16} r="4" fill={p.ember} stroke={p.line} strokeWidth="1" />
          <circle cx={CX + 48} cy={cy - 16} r="4" fill={p.ember} stroke={p.line} strokeWidth="1" />
        </g>
      )}

      <path
        d={axisPath(top, bot, suit === "bastos" ? 20 : 15)}
        fill={suit === "bastos" ? col.body : p.axis}
        stroke={p.line}
        strokeWidth="1.8"
      />
      <line
        x1={CX}
        y1={top + 24}
        x2={CX}
        y2={bot - 10}
        stroke={suit === "bastos" ? col.vein : p.axisVein}
        strokeWidth="1.6"
        opacity="0.8"
      />
      <Hilt p={p} y={bot} />
      <Rosette p={p} x={CX} y={top - 14} s={0.75} />
    </g>
  );
}

/* ---------------------------------------------------------------------------
 * Figuras y Arcanos Mayores
 *
 * Todavía sin dibujar. En lugar de una silueta genérica que mentiría sobre lo
 * que hay, el naipe muestra su emblema y lo dice. Es un marcador honesto y
 * respeta la orla, el follaje y el pigmento, así que la baraja se ve entera.
 * ------------------------------------------------------------------------- */

function Plaque({
  p,
  lines,
  roman,
}: {
  p: DeckPalette;
  lines: string[];
  roman?: string;
}) {
  const cy = (FIELD_TOP + FIELD_BOT) / 2;
  return (
    <g>
      <rect
        x={CX - 108}
        y={cy - 132}
        width="216"
        height="264"
        fill={p.fieldAlt}
        stroke={p.line}
        strokeWidth="1.6"
      />
      <rect
        x={CX - 100}
        y={cy - 124}
        width="200"
        height="248"
        fill="none"
        stroke={p.lineSoft}
        strokeWidth="0.9"
      />
      {roman && (
        <text
          x={CX}
          y={cy - 46}
          textAnchor="middle"
          fill={p.line}
          fontSize="58"
          fontFamily="Georgia, serif"
          letterSpacing="3"
        >
          {roman}
        </text>
      )}
      {lines.map((t, i) => (
        <text
          key={i}
          x={CX}
          y={cy + 24 + i * 22}
          textAnchor="middle"
          fill={p.lineSoft}
          fontSize="16"
          fontFamily="Georgia, serif"
        >
          {t}
        </text>
      ))}
      <Rosette p={p} x={CX} y={cy + 104} s={0.6} petals={6} />
    </g>
  );
}

function Court({ p, suit, n }: { p: DeckPalette; suit: Suit; n: number }) {
  const nombre =
    n === 11 ? "Sota" : n === 12 ? "Caballero" : n === 13 ? "Reina" : "Rey";
  const palo =
    suit === "espadas"
      ? "Espadas"
      : suit === "bastos"
        ? "Bastos"
        : suit === "copas"
          ? "Copas"
          : "Oros";
  return <Plaque p={p} lines={[nombre, `de ${palo}`]} />;
}

function Major({ p, roman }: { p: DeckPalette; roman: string }) {
  return <Plaque p={p} roman={roman === "—" ? undefined : roman} lines={[]} />;
}

/**
 * El numeral, tres veces: arriba al centro y girado en los dos cantos.
 *
 * Se repite porque el grado es la mitad de la lectura y tiene que poder leerse
 * con la carta en cualquier posición sobre la mesa.
 */
function Numerals({ p, roman }: { p: DeckPalette; roman: string }) {
  const cy = 300;
  const font = "'EB Garamond', Georgia, serif";
  return (
    <g fill={p.line} fontFamily={font} letterSpacing="4">
      <text x={CX} y="56" textAnchor="middle" fontSize="22">
        {roman}
      </text>
      <text
        x="38"
        y={cy}
        textAnchor="middle"
        fontSize="18"
        transform={`rotate(-90 38 ${cy})`}
      >
        {roman}
      </text>
      <text
        x={W - 38}
        y={cy}
        textAnchor="middle"
        fontSize="18"
        transform={`rotate(90 ${W - 38} ${cy})`}
      >
        {roman}
      </text>
    </g>
  );
}
