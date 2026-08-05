"use client";

import { useState } from "react";
import { CardFace } from "@/components/CardFace";
import { Button, Display, Screen } from "@/components/ui";
import { drawSpread } from "@/lib/deck/shuffle";
import type { DrawnCard } from "@/lib/types";

/**
 * Sacar cartas sin baraja.
 *
 * El producto no finge que esto sea lo mismo que echar las cartas, y lo dice en
 * la propia pantalla. Sirve para practicar la lectura de estructuras, que es la
 * mitad del oficio y la que sí se puede entrenar sin una baraja delante.
 *
 * El reparto se hace de golpe, pero se REVELA de una en una: en una baraja de
 * verdad el tiempo entre carta y carta es lo que permite mirar antes de
 * concluir, y esa pausa merece conservarse.
 */
export function SimulateStep({
  onDraw,
  onBack,
}: {
  onDraw: (cards: DrawnCard[]) => void;
  onBack: () => void;
}) {
  const [count, setCount] = useState(3);
  const [majorsOnly, setMajorsOnly] = useState(false);
  const [allowReversed, setAllowReversed] = useState(false);

  const [drawn, setDrawn] = useState<DrawnCard[] | null>(null);
  const [revealed, setRevealed] = useState(0);

  function barajar() {
    const cards = drawSpread({ count, majorsOnly, allowReversed });
    setDrawn(cards);
    setRevealed(0);
    cards.forEach((_, i) =>
      setTimeout(() => setRevealed(i + 1), 260 + i * 420),
    );
  }

  return (
    <Screen className="pt-0">
      {!drawn ? (
        <section className="rise">
          <Display className="text-[1.75rem] leading-tight">
            Sacar cartas
            <br />
            al azar.
          </Display>
          <p className="mt-4 max-w-[36ch] text-[0.9375rem] leading-relaxed text-ink-500">
            Para practicar cuando no tienes la baraja delante. No es lo mismo que
            echar las cartas: falta el gesto de barajar con la pregunta en la
            cabeza, que es donde ocurre casi todo. Queda guardado como tirada
            simulada.
          </p>

          <div className="mt-10">
            <p className="eyebrow mb-3">Cuántas cartas</p>
            <div className="flex gap-2">
              {[1, 3, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`h-11 flex-1 rounded-full border text-[0.9375rem] transition-colors ${
                    count === n
                      ? "border-ochre-800 bg-ochre-800 text-paper"
                      : "border-ochre-300 text-ink-600 hover:border-ochre-500"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <Check
              checked={majorsOnly}
              onChange={setMajorsOnly}
              label="Solo Arcanos Mayores"
              hint="Por donde se empieza a estudiar: veintidós cartas en vez de setenta y ocho."
            />
            <Check
              checked={allowReversed}
              onChange={setAllowReversed}
              label="Permitir cartas invertidas"
              hint="El Tarot de Marsella clásico no las usa. Actívalo solo si trabajas así."
            />
          </div>

          <Button size="lg" className="mt-10 w-full" onClick={barajar}>
            Barajar y sacar
          </Button>

          <button
            onClick={onBack}
            className="mt-6 block w-full text-center text-[0.8125rem] text-ink-400 underline underline-offset-4"
          >
            Volver a la fotografía
          </button>
        </section>
      ) : (
        <section className="rise">
          <Display className="text-[1.75rem] leading-tight">
            {revealed < drawn.length ? "Saliendo…" : "Ya están."}
          </Display>

          {/*
            Las cartas reparten el ancho disponible en vez de tener uno fijo.
            Una sola sale grande y centrada; tres llenan la pantalla; cinco se
            parten en dos filas antes que encogerse hasta no verse.
          */}
          <div
            className={`mx-auto mt-10 grid gap-3 ${
              drawn.length === 1
                ? "max-w-[240px] grid-cols-1"
                : drawn.length <= 3
                  ? "grid-cols-3"
                  : "max-w-[420px] grid-cols-3"
            }`}
          >
            {drawn.map((c, i) => (
              <div
                key={`${c.slug}-${i}`}
                className={i < revealed ? "deal" : "opacity-0"}
              >
                <CardFace slug={c.slug} orientation={c.orientation} fluid />
              </div>
            ))}
          </div>

          {revealed >= drawn.length && (
            <div className="rise d-1 mt-12">
              <Button size="lg" className="w-full" onClick={() => onDraw(drawn)}>
                Seguir con estas
              </Button>
              <button
                onClick={barajar}
                className="mt-6 block w-full text-center text-[0.8125rem] text-ink-400 underline underline-offset-4"
              >
                Volver a barajar
              </button>
            </div>
          )}
        </section>
      )}
    </Screen>
  );
}

function Check({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-[3px] h-4 w-4 shrink-0 accent-[#553d16]"
      />
      <span>
        <span className="block text-[0.9375rem] text-ink-700">{label}</span>
        <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-400">
          {hint}
        </span>
      </span>
    </label>
  );
}
