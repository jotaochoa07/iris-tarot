"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CardFace } from "@/components/CardFace";
import { CardPicker } from "@/components/CardPicker";
import { Button, Display, Notice, Screen } from "@/components/ui";
import { getCard } from "@/lib/knowledge/cards";
import { createClient } from "@/lib/supabase/client";
import { resolvePerson, saveReading } from "@/lib/actions/readings";
import type { DrawnCard, SpreadPosition, SpreadType } from "@/lib/types";

/* ---------------------------------------------------------------------------
 * Cada paso responde UNA sola pregunta. Nada de mostrar toda la complejidad a
 * la vez (§38 del brief).
 * ------------------------------------------------------------------------- */

type Step =
  | "photo"
  | "whose"
  | "detecting"
  | "confirm"
  | "question"
  | "structure"
  | "reading";

const DEMO: DrawnCard[] = [
  { slug: "espadas-01", order: 1, orientation: "upright", confidence: null, alternative_slug: null, confirmed_by_user: true },
  { slug: "espadas-05", order: 2, orientation: "upright", confidence: null, alternative_slug: null, confirmed_by_user: true },
  { slug: "bastos-02", order: 3, orientation: "upright", confidence: null, alternative_slug: null, confirmed_by_user: true },
];

const SPREADS: { id: SpreadType; label: string; positions: string[] }[] = [
  { id: "open", label: "Sin posiciones predefinidas", positions: [] },
  { id: "past-present-future", label: "Pasado · Presente · Futuro", positions: ["Pasado", "Presente", "Futuro"] },
  { id: "situation-obstacle-advice", label: "Situación · Obstáculo · Consejo", positions: ["Situación", "Obstáculo", "Consejo"] },
  { id: "self-other-relationship", label: "Yo · El otro · La relación", positions: ["Yo", "El otro", "La relación"] },
  { id: "custom", label: "Personalizada", positions: [] },
];

export function NewReadingFlow({
  recurringGuests,
}: {
  recurringGuests: { id: string; display_name: string }[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("photo");
  const [error, setError] = useState<string | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoB64, setPhotoB64] = useState<string | null>(null);

  const [forGuest, setForGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPersonId, setGuestPersonId] = useState<string | undefined>();
  const [saveRecurring, setSaveRecurring] = useState(false);

  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [detectNote, setDetectNote] = useState<string | null>(null);
  const [picking, setPicking] = useState<number | "add" | null>(null);

  const [question, setQuestion] = useState("");
  const [noQuestion, setNoQuestion] = useState(false);

  const [spreadType, setSpreadType] = useState<SpreadType>("open");
  const [customLabels, setCustomLabels] = useState<string[]>([]);

  const personLabel = forGuest ? guestName.trim() || "Invitado" : "Yo";

  /* --- Paso 1: fotografía ------------------------------------------------- */

  async function onFile(file: File) {
    setError(null);
    const { blob, dataUrl, base64 } = await downscale(file);
    setPhotoBlob(blob);
    setPhotoPreview(dataUrl);
    setPhotoB64(base64);
    setStep("whose");
  }

  /* --- Paso 3: reconocimiento --------------------------------------------- */

  async function detect() {
    setStep("detecting");
    setError(null);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photoB64, mediaType: "image/jpeg" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No pude leer la fotografía.");

      setDetectNote(json.overall_note ?? null);
      setCards(
        (json.cards ?? []).map(
          (c: {
            slug: string;
            order: number;
            orientation: "upright" | "reversed";
            confidence: number;
            alternative_slug: string | null;
          }) => ({
            slug: c.slug,
            order: c.order,
            orientation: c.orientation,
            confidence: c.confidence,
            alternative_slug: c.alternative_slug,
            confirmed_by_user: false,
          }),
        ),
      );
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de reconocimiento.");
      setCards([]);
      setStep("confirm");
    }
  }

  /* --- Confirmación: edición --------------------------------------------- */

  function reorder(from: number, to: number) {
    if (to < 0 || to >= cards.length) return;
    const next = [...cards];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setCards(next.map((c, i) => ({ ...c, order: i + 1, confirmed_by_user: true })));
  }

  function flip(i: number) {
    setCards((cs) =>
      cs.map((c, idx) =>
        idx === i
          ? {
              ...c,
              orientation: c.orientation === "upright" ? "reversed" : "upright",
              confirmed_by_user: true,
            }
          : c,
      ),
    );
  }

  function remove(i: number) {
    setCards((cs) =>
      cs.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, order: idx + 1 })),
    );
  }

  function pick(slug: string) {
    if (picking === "add") {
      setCards((cs) => [
        ...cs,
        {
          slug,
          order: cs.length + 1,
          orientation: "upright",
          confidence: null,
          alternative_slug: null,
          confirmed_by_user: true,
        },
      ]);
    } else if (typeof picking === "number") {
      setCards((cs) =>
        cs.map((c, idx) =>
          idx === picking
            ? { ...c, slug, confidence: null, alternative_slug: null, confirmed_by_user: true }
            : c,
        ),
      );
    }
    setPicking(null);
  }

  /* --- Paso 6: lectura ---------------------------------------------------- */

  async function generate() {
    setStep("reading");
    setError(null);
    try {
      const positions: SpreadPosition[] =
        spreadType === "custom"
          ? cards.map((c, i) => ({ order: c.order, label: customLabels[i] || `Posición ${i + 1}` }))
          : (SPREADS.find((s) => s.id === spreadType)?.positions ?? [])
              .slice(0, cards.length)
              .map((label, i) => ({ order: i + 1, label }));

      const payload = {
        cards,
        question: noQuestion ? null : question.trim() || null,
        spreadType,
        positions,
        personLabel,
        isGuest: forGuest,
      };

      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const analysis = await res.json();
      if (!res.ok) throw new Error(analysis.error ?? "No pude generar la lectura.");

      const person = await resolvePerson({
        forGuest,
        guestName,
        guestPersonId,
        saveAsRecurring: saveRecurring,
      });

      let imageReference: string | null = null;
      if (photoBlob) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const path = `${user.id}/${crypto.randomUUID()}.jpg`;
          const { error: upErr } = await supabase.storage
            .from("spreads")
            .upload(path, photoBlob, { contentType: "image/jpeg" });
          if (!upErr) imageReference = path;
        }
      }

      const id = await saveReading({
        personId: person.id,
        question: payload.question,
        spreadType,
        positions,
        cards,
        imageReference,
        tarotAnalysis: {
          observes: analysis.observes,
          movement: analysis.movement,
          movement_rationale: analysis.movement_rationale,
          interprets: analysis.interprets,
          what_to_watch: analysis.what_to_watch,
          uncertainty: analysis.uncertainty ?? null,
        },
        reflectionQuestion: analysis.reflection_question,
      });

      router.push(`/tirada/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar la lectura.");
      setStep("structure");
    }
  }

  /* --- Render ------------------------------------------------------------- */

  return (
    <Screen>
      <StepHeader step={step} onBack={() => router.push("/")} />

      {error && (
        <div className="mb-6">
          <Notice tone="warn">{error}</Notice>
        </div>
      )}

      {step === "photo" && (
        <section className="rise">
          <Display className="text-[1.75rem] leading-tight">
            Coloca las cartas sobre
            <br />
            una superficie visible.
          </Display>
          <p className="mt-4 max-w-[34ch] text-[0.9375rem] leading-relaxed text-ink-500">
            Que se vean enteras y en el orden en que las pusiste. Podrás corregir
            lo que yo interprete mal.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />

          <Button size="lg" className="mt-9 w-full" onClick={() => fileRef.current?.click()}>
            Tomar o subir fotografía
          </Button>

          <button
            onClick={() => {
              setCards(DEMO);
              setForGuest(false);
              setStep("confirm");
            }}
            className="mt-6 block w-full text-center text-[0.8125rem] text-ink-400 underline underline-offset-4"
          >
            Usar la tirada de ejemplo
          </button>
        </section>
      )}

      {step === "whose" && (
        <section className="rise">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Tu tirada"
              className="mb-8 w-full rounded-[4px] object-cover"
              style={{ maxHeight: 220 }}
            />
          )}
          <Display className="text-[1.75rem] leading-tight">
            ¿Para quién es esta tirada?
          </Display>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              size="lg"
              variant={!forGuest ? "solid" : "outline"}
              onClick={() => setForGuest(false)}
            >
              Para mí
            </Button>
            <Button
              size="lg"
              variant={forGuest ? "solid" : "outline"}
              onClick={() => setForGuest(true)}
            >
              Para otra persona
            </Button>
          </div>

          {forGuest && (
            <div className="rise mt-8">
              <p className="mb-3 text-[0.9375rem] text-ink-600">
                ¿Cómo quieres identificar a esta persona?
              </p>

              {recurringGuests.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {recurringGuests.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGuestPersonId(g.id);
                        setGuestName(g.display_name);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] ${
                        guestPersonId === g.id
                          ? "border-ink-800 bg-ink-900 text-paper"
                          : "border-ink-200 text-ink-600"
                      }`}
                    >
                      {g.display_name}
                    </button>
                  ))}
                </div>
              )}

              <input
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  setGuestPersonId(undefined);
                }}
                placeholder="Laura · M. · mi hermano · Invitado"
                className="w-full border-b border-ink-200 bg-transparent pb-2.5 font-serif text-[1.0625rem] outline-none placeholder:text-ink-300 focus:border-ink-700"
              />

              {!guestPersonId && (
                <label className="mt-4 flex items-center gap-2.5 text-[0.8125rem] text-ink-500">
                  <input
                    type="checkbox"
                    checked={saveRecurring}
                    onChange={(e) => setSaveRecurring(e.target.checked)}
                    className="h-4 w-4 accent-[#14110e]"
                  />
                  Guardar como invitado frecuente
                </label>
              )}

              <Notice>
                Sus tiradas se guardan aparte. No entran en tus patrones
                personales, aunque sí cuentan como cartas que tú has estudiado.
              </Notice>
            </div>
          )}

          <Button
            size="lg"
            className="mt-9 w-full"
            onClick={() => (photoB64 ? void detect() : setStep("confirm"))}
          >
            Continuar
          </Button>
        </section>
      )}

      {step === "detecting" && (
        <section className="fade flex min-h-[50dvh] flex-col justify-center">
          <p className="font-quote text-[1.375rem] text-ink-700">
            Mirando la fotografía…
          </p>
          <p className="mt-3 text-[0.875rem] text-ink-400">
            Cuento los signos de cada palo antes de decidir.
          </p>
        </section>
      )}

      {step === "confirm" && (
        <section className="rise">
          <Display className="text-[1.75rem] leading-tight">
            {cards.length ? "Creo que tu tirada es:" : "No he reconocido ninguna carta."}
          </Display>

          {detectNote && (
            <div className="mt-5">
              <Notice>{detectNote}</Notice>
            </div>
          )}

          <ul className="mt-8 flex flex-col gap-4">
            {cards.map((c, i) => {
              const card = getCard(c.slug);
              const low = c.confidence !== null && c.confidence < 0.65;
              return (
                <li key={`${c.slug}-${i}`} className="flex items-center gap-4">
                  <span className="w-4 font-display text-[0.875rem] text-ink-300">
                    {i + 1}
                  </span>
                  <CardFace slug={c.slug} orientation={c.orientation} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[1.0625rem] leading-tight text-ink-900">
                      {card?.name}
                      {c.orientation === "reversed" && (
                        <span className="ml-2 text-[0.75rem] text-ink-400">invertida</span>
                      )}
                    </p>
                    {low && (
                      <p className="mt-1 text-[0.75rem] text-marseille-red">
                        No estoy suficientemente segura
                        {c.alternative_slug
                          ? `. ¿Podría ser ${getCard(c.alternative_slug)?.name}?`
                          : "."}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-ink-400">
                      <button onClick={() => setPicking(i)} className="underline underline-offset-4">
                        Cambiar
                      </button>
                      <button onClick={() => flip(i)} className="underline underline-offset-4">
                        Invertir
                      </button>
                      <button onClick={() => reorder(i, i - 1)} className="underline underline-offset-4">
                        Subir
                      </button>
                      <button onClick={() => reorder(i, i + 1)} className="underline underline-offset-4">
                        Bajar
                      </button>
                      <button onClick={() => remove(i)} className="underline underline-offset-4">
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => setPicking("add")}
            className="mt-7 text-[0.8125rem] text-ink-500 underline underline-offset-4"
          >
            Añadir una carta
          </button>

          <p className="mt-9 text-[0.9375rem] text-ink-600">
            ¿Este es el orden correcto?
          </p>
          <Button
            size="lg"
            className="mt-4 w-full"
            disabled={cards.length === 0}
            onClick={() => setStep("question")}
          >
            Sí, continuar
          </Button>
        </section>
      )}

      {step === "question" && (
        <section className="rise">
          <Display className="text-[1.75rem] leading-tight">
            ¿Qué preguntaste al Tarot?
          </Display>
          <textarea
            autoFocus
            rows={3}
            value={question}
            disabled={noQuestion}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="¿Cómo debería desarrollar una reunión profesional que tengo hoy?"
            className="mt-7 w-full resize-none border-b border-ink-200 bg-transparent pb-3 font-serif text-[1.125rem] leading-relaxed outline-none placeholder:text-ink-300 focus:border-ink-700 disabled:opacity-40"
          />
          <label className="mt-5 flex items-center gap-2.5 text-[0.875rem] text-ink-500">
            <input
              type="checkbox"
              checked={noQuestion}
              onChange={(e) => setNoQuestion(e.target.checked)}
              className="h-4 w-4 accent-[#14110e]"
            />
            No hice una pregunta específica
          </label>
          <Button
            size="lg"
            className="mt-9 w-full"
            disabled={!noQuestion && question.trim().length === 0}
            onClick={() => setStep("structure")}
          >
            Continuar
          </Button>
        </section>
      )}

      {step === "structure" && (
        <section className="rise">
          <Display className="text-[1.75rem] leading-tight">
            ¿Las posiciones tenían algún significado?
          </Display>
          <div className="mt-7 flex flex-col gap-2.5">
            {SPREADS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSpreadType(s.id)}
                className={`rounded-[4px] border px-4 py-3.5 text-left text-[0.9375rem] ${
                  spreadType === s.id
                    ? "border-ink-800 bg-ink-900 text-paper"
                    : "border-ink-200 text-ink-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {spreadType === "custom" && (
            <div className="rise mt-6 flex flex-col gap-3">
              {cards.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-4 font-display text-[0.875rem] text-ink-300">
                    {i + 1}
                  </span>
                  <input
                    value={customLabels[i] ?? ""}
                    onChange={(e) => {
                      const next = [...customLabels];
                      next[i] = e.target.value;
                      setCustomLabels(next);
                    }}
                    placeholder={`Significado de la posición ${i + 1}`}
                    className="flex-1 border-b border-ink-200 bg-transparent pb-2 font-serif text-[1rem] outline-none placeholder:text-ink-300 focus:border-ink-700"
                  />
                </div>
              ))}
            </div>
          )}

          <Button size="lg" className="mt-9 w-full" onClick={() => void generate()}>
            Leer la tirada
          </Button>
        </section>
      )}

      {step === "reading" && (
        <section className="fade flex min-h-[60dvh] flex-col justify-center">
          <div className="mb-9 flex gap-2">
            {cards.map((c, i) => (
              <CardFace key={i} slug={c.slug} orientation={c.orientation} size="sm" />
            ))}
          </div>
          <p className="font-quote text-[1.375rem] leading-snug text-ink-700">
            Miro el conjunto antes de mirar cada carta.
          </p>
          <p className="mt-3 text-[0.875rem] text-ink-400">
            Palos, números, progresión, ausencias.
          </p>
        </section>
      )}

      {picking !== null && (
        <CardPicker onPick={pick} onClose={() => setPicking(null)} />
      )}
    </Screen>
  );
}

/* --- Cabecera de progreso -------------------------------------------------- */

const STEP_INDEX: Record<Step, number> = {
  photo: 1,
  whose: 2,
  detecting: 3,
  confirm: 3,
  question: 4,
  structure: 5,
  reading: 6,
};

function StepHeader({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <header className="mb-10 flex items-center justify-between">
      <button onClick={onBack} className="eyebrow hover:text-ink-700">
        ← Salir
      </button>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span
            key={n}
            className={`h-[2px] w-4 ${
              n <= STEP_INDEX[step] ? "bg-ink-700" : "bg-ink-200"
            }`}
          />
        ))}
      </div>
    </header>
  );
}

/* --- Utilidad: reducir la fotografía antes de enviarla ---------------------- */

async function downscale(
  file: File,
): Promise<{ blob: Blob; dataUrl: string; base64: string }> {
  const bitmap = await createImageBitmap(file);
  // 2000 px: los numerales romanos van pequeños y girados en los bordes, y a
  // 1600 se perdían. Es el detalle que decide la identificación.
  const max = 2000;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const base64 = dataUrl.split(",")[1];
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9),
  );

  return { blob, dataUrl, base64 };
}
