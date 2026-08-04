"use client";

import Link from "next/link";
import { useState } from "react";
import { CardFace } from "@/components/CardFace";
import {
  Button,
  Display,
  Notice,
  ProvenanceLegend,
  ProvenanceMark,
  Rule,
  Screen,
  SectionTitle,
} from "@/components/ui";
import { getCard } from "@/lib/knowledge/cards";
import {
  attachArchetypalAnalysis,
  attachLearnAnalysis,
  saveNotes,
  saveOutcome,
} from "@/lib/actions/readings";
import type {
  ArchetypalAnalysis,
  Claim,
  LearnAnalysis,
  Reading,
} from "@/lib/types";

/**
 * La lectura.
 *
 * Se revela por secciones: observar, movimiento, interpretar, qué mirar,
 * pregunta. Solo después aparece la puerta a APRENDER. La profundidad está
 * disponible sin imponerse.
 */
export function ReadingView({ reading }: { reading: Reading }) {
  const t = reading.tarot_analysis;
  const isGuest = reading.person_type === "guest";

  const [learn, setLearn] = useState<LearnAnalysis | null>(
    reading.learn_analysis,
  );
  const [arch, setArch] = useState<ArchetypalAnalysis | null>(
    reading.archetypal_analysis,
  );
  const [busy, setBusy] = useState<"learn" | "arch" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState(reading.user_notes ?? "");
  const [outcome, setOutcome] = useState(reading.outcome ?? "");
  const [savedFlag, setSavedFlag] = useState<string | null>(null);

  const payload = {
    cards: reading.cards,
    question: reading.question,
    spreadType: reading.spread_type,
    positions: reading.positions,
    personLabel: reading.person_display_name,
    isGuest,
  };

  async function run(kind: "learn" | "arch") {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(kind === "learn" ? "/api/learn" : "/api/archetypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No pude generarlo.");

      if (kind === "learn") {
        setLearn(json);
        await attachLearnAnalysis(reading.id, json);
      } else {
        const a: ArchetypalAnalysis = {
          concepts: json.concepts ?? [],
          body: json.applicable ? json.body : [],
          disclaimer: json.disclaimer,
        };
        setArch(a);
        await attachArchetypalAnalysis(reading.id, a);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setBusy(null);
    }
  }

  if (!t) {
    return (
      <Screen>
        <Notice tone="warn">Esta tirada no tiene lectura guardada.</Notice>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="mb-9 flex items-center justify-between">
        <Link href="/" className="eyebrow hover:text-ink-700">
          ← IRIS
        </Link>
        {isGuest && (
          <span className="text-[0.6875rem] tracking-wide text-ink-400">
            Tirada para {reading.person_display_name}
          </span>
        )}
      </header>

      {/* --- TU TIRADA --------------------------------------------------- */}
      <section className="rise">
        <SectionTitle>Tu tirada</SectionTitle>
        <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6">
          {reading.cards
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((c, i) => {
              const position = reading.positions.find((p) => p.order === c.order);
              return (
                <div key={i} className="flex flex-col gap-2">
                  <CardFace slug={c.slug} orientation={c.orientation} size="md" />
                  <p className="w-[104px] text-[0.6875rem] leading-tight text-ink-500">
                    {getCard(c.slug)?.name}
                    {position && (
                      <span className="block text-ink-300">{position.label}</span>
                    )}
                  </p>
                </div>
              );
            })}
        </div>
        {reading.question && (
          <p className="mt-6 font-quote text-[1.1875rem] leading-snug text-ink-700">
            «{reading.question}»
          </p>
        )}
      </section>

      <Rule />

      {/* --- IRIS OBSERVA ------------------------------------------------ */}
      <section className="rise d-1">
        <SectionTitle>Iris observa</SectionTitle>
        <div className="prose-iris">
          {t.observes.map((c, i) => (
            <ClaimParagraph key={i} claim={c} />
          ))}
        </div>
      </section>

      <Rule />

      {/* --- EL MOVIMIENTO ----------------------------------------------- */}
      <section className="rise d-2">
        <SectionTitle>El movimiento</SectionTitle>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {t.movement.map((m, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="font-display text-[1.0625rem] uppercase tracking-[0.04em] text-ink-900">
                {m.concept}
              </span>
              {i < t.movement.length - 1 && (
                <span className="text-ink-300">→</span>
              )}
            </span>
          ))}
        </div>
        <div className="prose-iris mt-5">
          <ClaimParagraph claim={t.movement_rationale} />
        </div>
      </section>

      <Rule />

      {/* --- IRIS INTERPRETA --------------------------------------------- */}
      <section className="rise d-3">
        <SectionTitle>Iris interpreta</SectionTitle>
        <div className="prose-iris">
          {t.interprets.map((c, i) => (
            <ClaimParagraph key={i} claim={c} />
          ))}
        </div>
      </section>

      <Rule />

      {/* --- QUÉ OBSERVAR ------------------------------------------------ */}
      <section className="rise d-4">
        <SectionTitle>Qué observar</SectionTitle>
        <ul className="flex flex-col gap-3.5">
          {t.what_to_watch.map((w, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.45rem] h-[3px] w-[3px] shrink-0 rounded-full bg-ink-400" />
              <span className="font-serif text-[1.0625rem] leading-relaxed text-ink-700">
                {w}
              </span>
            </li>
          ))}
        </ul>
        {t.uncertainty && (
          <div className="mt-6">
            <Notice>{t.uncertainty}</Notice>
          </div>
        )}
      </section>

      <Rule />

      {/* --- IRIS PREGUNTA ----------------------------------------------- */}
      <section className="rise d-5">
        <SectionTitle>Iris pregunta</SectionTitle>
        <p className="font-quote text-[1.375rem] leading-snug text-ink-900">
          {reading.reflection_question}
        </p>
      </section>

      <Rule />

      {/* --- APRENDER ---------------------------------------------------- */}
      <section className="fade d-6">
        {!learn ? (
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            disabled={busy !== null}
            onClick={() => void run("learn")}
          >
            {busy === "learn" ? "Preparando la clase…" : "Aprender con esta tirada"}
          </Button>
        ) : (
          <LearnPanel learn={learn} cards={reading.cards.map((c) => c.slug)} />
        )}
      </section>

      {/* --- ARQUETIPOS -------------------------------------------------- */}
      <section className="mt-6">
        {!arch ? (
          <Button
            size="md"
            variant="ghost"
            className="w-full"
            disabled={busy !== null}
            onClick={() => void run("arch")}
          >
            {busy === "arch" ? "Pensando…" : "Explorar arquetipos"}
          </Button>
        ) : (
          <div className="rise">
            <Rule />
            <SectionTitle>Lente psicológica</SectionTitle>
            {arch.body.length === 0 ? (
              <p className="text-[0.9375rem] leading-relaxed text-ink-500">
                No encuentro aquí una conexión junguiana que aporte algo. Prefiero
                no forzarla.
              </p>
            ) : (
              <>
                {arch.concepts.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {arch.concepts.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-ink-200 px-3 py-1 text-[0.75rem] text-ink-500"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <div className="prose-iris">
                  {arch.body.map((c, i) => (
                    <ClaimParagraph key={i} claim={c} />
                  ))}
                </div>
              </>
            )}
            <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-400">
              {arch.disclaimer}
            </p>
          </div>
        )}
      </section>

      {error && (
        <div className="mt-6">
          <Notice tone="warn">{error}</Notice>
        </div>
      )}

      <Rule />

      {/* --- DIARIO ------------------------------------------------------ */}
      <section>
        <SectionTitle>Mis notas</SectionTitle>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Lo que pensaste al mirar la tirada."
          className="w-full resize-none border-b border-ink-200 bg-transparent pb-3 font-serif text-[1.0625rem] leading-relaxed outline-none placeholder:text-ink-300 focus:border-ink-700"
        />
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={async () => {
            await saveNotes(reading.id, notes);
            setSavedFlag("notas");
          }}
        >
          Guardar notas
        </Button>
      </section>

      <Rule />

      <section>
        <SectionTitle>¿Qué ocurrió?</SectionTitle>
        <p className="mb-4 max-w-[40ch] text-[0.8125rem] leading-relaxed text-ink-400">
          Cierra el ciclo cuando haya pasado. Qué sucedió de verdad, qué partes de
          la lectura resultaron útiles y cuáles no. Las coincidencias no prueban
          nada; lo que enseña es la revisión.
        </p>
        <textarea
          rows={3}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Lo que ocurrió después."
          className="w-full resize-none border-b border-ink-200 bg-transparent pb-3 font-serif text-[1.0625rem] leading-relaxed outline-none placeholder:text-ink-300 focus:border-ink-700"
        />
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={async () => {
            await saveOutcome(reading.id, outcome);
            setSavedFlag("desenlace");
          }}
        >
          Guardar
        </Button>
        {savedFlag && (
          <p className="mt-3 text-[0.75rem] text-ink-400">
            Guardado en el Diario ({savedFlag}).
          </p>
        )}
      </section>

      <Rule />

      <footer className="pb-4">
        <ProvenanceLegend />
      </footer>
    </Screen>
  );
}

/* --- Párrafo con procedencia ---------------------------------------------- */

function ClaimParagraph({ claim }: { claim: Claim }) {
  const [open, setOpen] = useState(false);
  const hasSource = claim.provenance === "source" && claim.sources.length > 0;

  return (
    <div>
      <p>
        <ProvenanceMark provenance={claim.provenance} />
        {claim.text}
      </p>
      {hasSource && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-1.5 text-[0.6875rem] tracking-wide text-ink-400 underline underline-offset-4"
          >
            {open ? "Ocultar fuente" : "Ver fuente"}
          </button>
          {open && (
            <div className="mt-2 border-l border-ink-200 pl-3 text-[0.75rem] leading-relaxed text-ink-500">
              {claim.sources.map((s, i) => (
                <p key={i}>
                  {s.author}
                  {s.work ? `, ${s.work}` : ""}.{" "}
                  {s.locator ?? "Página no disponible."}
                  {s.note ? ` ${s.note}` : ""}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* --- Modo Aprender --------------------------------------------------------- */

function LearnPanel({
  learn,
  cards,
}: {
  learn: LearnAnalysis;
  cards: string[];
}) {
  const [openCard, setOpenCard] = useState<number | null>(0);

  return (
    <div className="rise">
      <Rule className="mt-0" />
      <SectionTitle>Lo que esta tirada enseña</SectionTitle>
      <Display as="h2" className="text-[1.375rem] leading-snug">
        {learn.key_lesson.title}
      </Display>
      <div className="prose-iris mt-3">
        <p>{learn.key_lesson.body}</p>
      </div>
      {learn.key_lesson.concept_tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {learn.key_lesson.concept_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink-200 px-3 py-1 text-[0.75rem] text-ink-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {learn.look_at_this.map((l, i) => (
        <div
          key={i}
          className="mt-8 border-l-2 border-marseille-yellow bg-paper-soft py-4 pl-4 pr-3"
        >
          <p className="eyebrow mb-2">Mira esto</p>
          <p className="font-display text-[1.0625rem] leading-snug text-ink-900">
            {l.title}
          </p>
          <p className="mt-2 font-serif text-[0.9375rem] leading-relaxed text-ink-700">
            {l.body}
          </p>
          {l.prompt && (
            <p className="mt-3 font-quote text-[1rem] text-ink-800">{l.prompt}</p>
          )}
        </div>
      ))}

      <Rule />
      <SectionTitle>Carta por carta</SectionTitle>
      <ul className="flex flex-col">
        {learn.cards.map((c, i) => {
          const card = getCard(c.card_slug);
          const open = openCard === i;
          return (
            <li key={i} className="border-b border-ink-100 last:border-0">
              <button
                onClick={() => setOpenCard(open ? null : i)}
                className="flex w-full items-center gap-4 py-4 text-left"
              >
                <CardFace slug={c.card_slug} size="sm" />
                <span className="flex-1">
                  <span className="block font-display text-[1.0625rem] text-ink-900">
                    {card?.name}
                  </span>
                  <span className="block text-[0.75rem] text-ink-400">
                    {c.family}
                    {cards[i + 1] ? " · continúa" : ""}
                  </span>
                </span>
                <span className="text-ink-300">{open ? "−" : "+"}</span>
              </button>

              {open && (
                <div className="rise pb-6">
                  <LearnBlock label="Palo" claim={c.suit_territory} />
                  <LearnBlock label="Grado" claim={c.degree} />
                  <LearnBlock label="Composición" claim={c.visual_composition} />
                  <LearnBlock label="En esta tirada" claim={c.in_this_spread} />
                  <LearnBlock
                    label="Relación con la siguiente"
                    claim={c.relation_to_next}
                    emphasis
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LearnBlock({
  label,
  claim,
  emphasis = false,
}: {
  label: string;
  claim: Claim | null;
  emphasis?: boolean;
}) {
  if (!claim) return null;
  return (
    <div className={`mt-4 ${emphasis ? "border-l border-ink-200 pl-4" : ""}`}>
      <p className="eyebrow mb-1.5">{label}</p>
      <p className="font-serif text-[0.9375rem] leading-relaxed text-ink-700">
        <ProvenanceMark provenance={claim.provenance} />
        {claim.text}
      </p>
    </div>
  );
}
