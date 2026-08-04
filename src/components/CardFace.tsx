"use client";

import { useEffect, useRef, useState } from "react";
import type { Orientation } from "@/lib/types";
import { getCard } from "@/lib/knowledge/cards";

/**
 * Representación de una carta.
 *
 * Si existe un escaneo en /public/cards/<slug>.jpg se muestra ese escaneo
 * (recomendado: ediciones de dominio público, linaje Conver 1760 o Noblet).
 * Si no, IRIS dibuja una representación tipográfica y estructural que respeta
 * la regla de composición real de la baraja: número de signos, eje central en
 * los impares, ausencia de eje en los pares.
 *
 * La representación dibujada NO pretende sustituir a la carta. Es un marcador
 * honesto: el color de los pigmentos de Marsella es lo único saturado de toda
 * la interfaz, y aparece solo aquí.
 */

const PIGMENT = {
  red: "#b0392c",
  blue: "#2f5a86",
  yellow: "#d3a33c",
  green: "#557a4c",
  ink: "#1a1613",
  paper: "#f0e8d9",
  paperDeep: "#e4d9c4",
};

type Size = "sm" | "md" | "lg";

const WIDTH: Record<Size, string> = {
  sm: "w-[58px]",
  md: "w-[104px]",
  lg: "w-[150px]",
};

export function CardFace({
  slug,
  orientation = "upright",
  size = "md",
  dimmed = false,
  className = "",
}: {
  slug: string;
  orientation?: Orientation;
  size?: Size;
  dimmed?: boolean;
  className?: string;
}) {
  const [scanFailed, setScanFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // En una página renderizada en servidor, el escaneo puede fallar ANTES de que
  // React monte y enganche onError; ese evento se pierde y quedaría el icono de
  // imagen rota. Al montar comprobamos el estado real del elemento.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setScanFailed(true);
  }, []);

  const card = getCard(slug);
  if (!card) return null;

  return (
    <figure
      className={`${WIDTH[size]} shrink-0 ${className}`}
      style={{ opacity: dimmed ? 0.42 : 1 }}
    >
      <div
        className="relative overflow-hidden rounded-[3px]"
        style={{
          aspectRatio: "0.6",
          boxShadow:
            "0 1px 2px rgba(20,17,14,.10), 0 6px 18px -8px rgba(20,17,14,.35)",
          transform: orientation === "reversed" ? "rotate(180deg)" : undefined,
        }}
      >
        {!scanFailed && (
          <img
            ref={imgRef}
            src={`/cards/${slug}.jpg`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setScanFailed(true)}
          />
        )}
        {scanFailed && <DrawnCard slug={slug} />}
      </div>
    </figure>
  );
}

/* --------------------------------------------------------------------------
 * Dibujo
 * ------------------------------------------------------------------------ */

function DrawnCard({ slug }: { slug: string }) {
  const card = getCard(slug)!;
  const isMajor = card.arcana === "major";

  return (
    <svg
      viewBox="0 0 120 200"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label={card.name}
    >
      <rect width="120" height="200" fill={PIGMENT.paper} />
      <rect
        x="3.5"
        y="3.5"
        width="113"
        height="193"
        fill="none"
        stroke={PIGMENT.ink}
        strokeWidth="1.1"
      />
      <rect
        x="6.5"
        y="6.5"
        width="107"
        height="187"
        fill="none"
        stroke={PIGMENT.ink}
        strokeWidth="0.4"
        opacity="0.55"
      />

      {isMajor ? <MajorField card={card} /> : <MinorField card={card} />}

      <text
        x="60"
        y="188"
        textAnchor="middle"
        fill={PIGMENT.ink}
        fontSize="7"
        letterSpacing="0.6"
        fontFamily="Georgia, serif"
      >
        {card.name.toUpperCase()}
      </text>
    </svg>
  );
}

type CardShape = NonNullable<ReturnType<typeof getCard>>;

function MajorField({ card }: { card: CardShape }) {
  return (
    <g>
      <path
        d="M28 46 Q60 26 92 46 L92 150 L28 150 Z"
        fill={PIGMENT.paperDeep}
        stroke={PIGMENT.ink}
        strokeWidth="0.7"
      />
      <path
        d="M34 50 Q60 33 86 50"
        fill="none"
        stroke={PIGMENT.red}
        strokeWidth="1.4"
      />
      <circle cx="60" cy="86" r="15" fill="none" stroke={PIGMENT.blue} strokeWidth="1.2" />
      <circle cx="60" cy="86" r="9" fill={PIGMENT.yellow} opacity="0.55" />
      <text
        x="60"
        y="128"
        textAnchor="middle"
        fill={PIGMENT.ink}
        fontSize="26"
        fontFamily="Georgia, serif"
        letterSpacing="1"
      >
        {card.roman === "—" ? "" : card.roman}
      </text>
      <line x1="34" y1="140" x2="86" y2="140" stroke={PIGMENT.ink} strokeWidth="0.5" />
      {card.roman === "—" && (
        <text
          x="60"
          y="126"
          textAnchor="middle"
          fill={PIGMENT.ink}
          fontSize="9"
          fontFamily="Georgia, serif"
          opacity="0.7"
        >
          sin número
        </text>
      )}
    </g>
  );
}

function MinorField({ card }: { card: CardShape }) {
  if (card.is_court) return <CourtField card={card} />;
  const n = card.degree ?? 1;
  const suit = card.suit!;
  const odd = n % 2 === 1;
  const pairs = Math.floor(n / 2);

  const top = 40;
  const bottom = 158;
  const rows = Math.max(pairs, 1);
  const step = pairs > 0 ? (bottom - top) / Math.max(rows, 1) : 0;

  const nodes: { x: number; y: number; center: boolean }[] = [];
  for (let i = 0; i < pairs; i++) {
    const y = top + step * i + step / 2;
    nodes.push({ x: 40, y, center: false });
    nodes.push({ x: 80, y, center: false });
  }
  if (odd) nodes.push({ x: 60, y: (top + bottom) / 2, center: true });
  if (n === 1) {
    nodes.length = 0;
    nodes.push({ x: 60, y: 99, center: true });
  }

  return (
    <g>
      <Vegetation />
      {nodes.map((p, i) => (
        <Glyph
          key={i}
          suit={suit}
          x={p.x}
          y={p.y}
          scale={n === 1 ? 2.1 : p.center ? 1.15 : 1}
          index={i}
          axis={p.center && (suit === "espadas" || suit === "bastos")}
          tall={p.center && odd && (suit === "espadas" || suit === "bastos")}
        />
      ))}
      <text
        x="60"
        y="30"
        textAnchor="middle"
        fill={PIGMENT.ink}
        fontSize="13"
        fontFamily="Georgia, serif"
        letterSpacing="1"
      >
        {card.roman}
      </text>
    </g>
  );
}

function CourtField({ card }: { card: CardShape }) {
  const suit = card.suit!;
  const seated = (card.degree ?? 11) >= 13;
  return (
    <g>
      <Vegetation />
      <circle cx="60" cy="62" r="11" fill={PIGMENT.paperDeep} stroke={PIGMENT.ink} strokeWidth="0.8" />
      <path
        d="M49 55 L52 47 L56 53 L60 45 L64 53 L68 47 L71 55 Z"
        fill={PIGMENT.yellow}
        stroke={PIGMENT.ink}
        strokeWidth="0.6"
        opacity={card.degree === 11 ? 0 : 1}
      />
      <path
        d={
          seated
            ? "M38 150 L44 82 Q60 70 76 82 L82 150 Z"
            : "M42 150 L46 84 Q60 72 74 84 L78 150 Z"
        }
        fill={PIGMENT.paperDeep}
        stroke={PIGMENT.ink}
        strokeWidth="0.8"
      />
      <path
        d="M46 96 Q60 90 74 96"
        fill="none"
        stroke={PIGMENT.red}
        strokeWidth="1.2"
      />
      <Glyph suit={suit} x={88} y={110} scale={1.15} index={0} axis={false} tall={false} />
      <line x1="30" y1="152" x2="90" y2="152" stroke={PIGMENT.ink} strokeWidth="0.5" />
    </g>
  );
}

function Vegetation() {
  return (
    <g opacity="0.35" stroke={PIGMENT.green} strokeWidth="0.7" fill="none">
      <path d="M14 40 Q22 100 14 160" />
      <path d="M106 40 Q98 100 106 160" />
      <path d="M14 70 Q26 74 30 66" />
      <path d="M106 70 Q94 74 90 66" />
      <path d="M14 130 Q26 126 30 134" />
      <path d="M106 130 Q94 126 90 134" />
    </g>
  );
}

function Glyph({
  suit,
  x,
  y,
  scale,
  index,
  axis,
  tall,
}: {
  suit: string;
  x: number;
  y: number;
  scale: number;
  index: number;
  axis: boolean;
  tall: boolean;
}) {
  const color =
    index % 3 === 0 ? PIGMENT.red : index % 3 === 1 ? PIGMENT.blue : PIGMENT.yellow;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {suit === "espadas" &&
        (tall || axis ? (
          <g stroke={PIGMENT.ink} strokeWidth="0.9" fill="none">
            <line x1="0" y1="-52" x2="0" y2="46" stroke={PIGMENT.blue} strokeWidth="1.6" />
            <path d="M-4 -46 L0 -56 L4 -46 Z" fill={PIGMENT.blue} stroke="none" />
            <line x1="-6" y1="40" x2="6" y2="40" stroke={PIGMENT.yellow} strokeWidth="1.6" />
          </g>
        ) : (
          <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
            <path d="M-11 8 Q-2 -10 11 -9" />
            <path d="M-11 8 Q-4 -4 9 -5" strokeWidth="0.7" opacity="0.6" />
            <circle cx="-11" cy="8" r="1.8" fill={color} stroke="none" />
          </g>
        ))}

      {suit === "bastos" &&
        (tall || axis ? (
          <g>
            <line x1="0" y1="-52" x2="0" y2="46" stroke={PIGMENT.red} strokeWidth="2.4" />
            <line x1="-3" y1="-46" x2="3" y2="-46" stroke={PIGMENT.ink} strokeWidth="0.8" />
            <line x1="-3" y1="40" x2="3" y2="40" stroke={PIGMENT.ink} strokeWidth="0.8" />
          </g>
        ) : (
          <g stroke={color} strokeWidth="2.2" strokeLinecap="round">
            <line x1="-10" y1="7" x2="10" y2="-7" />
            <line
              x1="-10"
              y1="-7"
              x2="10"
              y2="7"
              stroke={PIGMENT.ink}
              strokeWidth="0.8"
              opacity="0.5"
            />
          </g>
        ))}

      {suit === "copas" && (
        <g stroke={PIGMENT.ink} strokeWidth="0.8" fill="none">
          <path d="M-7 -8 L7 -8 L4 2 L-4 2 Z" fill={color} opacity="0.85" />
          <line x1="0" y1="2" x2="0" y2="7" />
          <path d="M-5 9 L5 9" strokeWidth="1.4" />
          <path d="M-7 -8 Q0 -12 7 -8" strokeWidth="0.6" />
        </g>
      )}

      {suit === "oros" && (
        <g>
          <circle cx="0" cy="0" r="9" fill={PIGMENT.yellow} opacity="0.75" />
          <circle cx="0" cy="0" r="9" fill="none" stroke={PIGMENT.ink} strokeWidth="0.8" />
          <circle cx="0" cy="0" r="4" fill="none" stroke={color} strokeWidth="0.9" />
          <circle cx="0" cy="0" r="1.3" fill={PIGMENT.ink} />
        </g>
      )}
    </g>
  );
}
