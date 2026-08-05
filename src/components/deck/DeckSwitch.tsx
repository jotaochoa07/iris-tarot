"use client";

import { DECK_STYLE_LIST } from "@/lib/deck/palettes";
import { setDeckStyle, useDeckStyle } from "@/lib/deck/style";

/**
 * Conmutador de tirada de imprenta.
 *
 * Deliberadamente pequeño y sin explicación: es una preferencia de mirada, no
 * una función. Quien no lo necesite, no lo verá.
 */
export function DeckSwitch({ className = "" }: { className?: string }) {
  const actual = useDeckStyle();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {DECK_STYLE_LIST.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setDeckStyle(s.id)}
          aria-pressed={actual === s.id}
          title={s.note}
          className={`eyebrow transition-colors ${
            actual === s.id
              ? "text-ink-800 underline decoration-marseille-red decoration-1 underline-offset-4"
              : "hover:text-ink-700"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
