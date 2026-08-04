"use client";

import { useMemo, useState } from "react";
import { CARDS, searchCards } from "@/lib/knowledge/cards";
import { CardFace } from "./CardFace";

/**
 * Selector de las 78 cartas.
 *
 * Es la red de seguridad del reconocimiento visual: cuando IRIS duda, la
 * corrección debe costar dos toques. No es un modo degradado, es parte del
 * flujo normal.
 */
export function CardPicker({
  onPick,
  onClose,
  title = "Elige la carta",
}: {
  onPick: (slug: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q ? searchCards(q) : CARDS), [q]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col md:max-w-[720px]">
        <header className="flex items-center justify-between px-6 pb-4 pt-6">
          <p className="eyebrow">{title}</p>
          <button
            onClick={onClose}
            className="text-[0.8125rem] text-ink-500 underline underline-offset-4"
          >
            Cancelar
          </button>
        </header>

        <div className="px-6">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: espadas, V, ermitaño…"
            className="w-full border-b border-ink-200 bg-transparent pb-2.5 font-serif text-[1.0625rem] outline-none placeholder:text-ink-300 focus:border-ink-700"
          />
        </div>

        <div className="no-scrollbar mt-5 grid flex-1 grid-cols-4 gap-x-3 gap-y-5 overflow-y-auto px-6 pb-10">
          {results.map((c) => (
            <button
              key={c.slug}
              onClick={() => onPick(c.slug)}
              className="flex flex-col items-center gap-1.5 text-left"
            >
              <CardFace slug={c.slug} size="sm" className="w-full" />
              <span className="text-[0.625rem] leading-tight text-ink-500">
                {c.name}
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="col-span-4 pt-6 text-[0.875rem] text-ink-400">
              Ninguna carta coincide con esa búsqueda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
