"use client";

import { useEffect, useRef, useState } from "react";
import type { Orientation } from "@/lib/types";
import { getCard } from "@/lib/knowledge/cards";
import { IrisCard } from "@/components/deck/IrisCard";
import { useDeckPalette } from "@/lib/deck/style";

/**
 * Representación de una carta.
 *
 * Dos capas, en este orden:
 *
 *  1. Si existe una imagen en /public/cards/<slug>.<ext>, se muestra esa. Es
 *     donde van las fotografías de la baraja física del lector. Esa carpeta
 *     está ignorada por git: lo que se deje ahí no sale del disco.
 *  2. Si no, se dibuja el IRIS Marseille Deck, que es ilustración propia y
 *     obedece a la paleta elegida.
 */


/** Orden de búsqueda del escaneo en /public/cards/<slug>.<ext>. */
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

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
  fluid = false,
  className = "",
}: {
  slug: string;
  orientation?: Orientation;
  size?: Size;
  dimmed?: boolean;
  /**
   * Ocupa el ancho que le den en lugar de uno fijo.
   *
   * Es lo que permite que una tirada de tres cartas se vea igual de grande en
   * un móvil de 360 que en uno de 430: reparte el espacio disponible en vez de
   * imponer píxeles que en la pantalla pequeña se salen.
   */
  fluid?: boolean;
  className?: string;
}) {
  // Se prueban las extensiones en orden y se cae al dibujo cuando se agotan.
  const [ext, setExt] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const scanFailed = ext >= EXTENSIONS.length;
  const palette = useDeckPalette();

  // En una página renderizada en servidor, el escaneo puede fallar ANTES de que
  // React monte y enganche onError; ese evento se pierde y quedaría el icono de
  // imagen rota. Al montar comprobamos el estado real del elemento.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setExt((e) => e + 1);
  }, []);

  const card = getCard(slug);
  if (!card) return null;

  return (
    <figure
      className={`${fluid ? "w-full min-w-0" : `${WIDTH[size]} shrink-0`} ${className}`}
      style={{ opacity: dimmed ? 0.42 : 1 }}
    >
      <div
        className="relative overflow-hidden rounded-[3px]"
        style={{
          // 2:3, la proporción a la que se generan los Arcanos Mayores.
          aspectRatio: "2 / 3",
          boxShadow:
            "0 1px 2px rgba(20,17,14,.10), 0 6px 18px -8px rgba(20,17,14,.35)",
          transform: orientation === "reversed" ? "rotate(180deg)" : undefined,
        }}
      >
        {!scanFailed && (
          <img
            ref={imgRef}
            key={EXTENSIONS[ext]}
            src={`/cards/${slug}${EXTENSIONS[ext]}`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setExt((e) => e + 1)}
          />
        )}
        {scanFailed && <IrisCard slug={slug} palette={palette} />}
      </div>
    </figure>
  );
}

/* El dibujo antiguo se ha retirado: ahora lo hace IrisCard, que es el mazo
   propio y responde a la paleta elegida. */
