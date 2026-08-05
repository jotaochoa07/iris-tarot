"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Campo de texto con dictado.
 *
 * Usa el reconocimiento de voz del propio navegador. No sube audio a ningún
 * servidor nuestro ni cuesta nada por minuto, y funciona mientras la pestaña
 * está abierta. A cambio depende del navegador: Chrome y Edge lo traen; Firefox
 * no. Cuando no está disponible el campo sigue siendo un textarea normal y el
 * botón simplemente no aparece.
 *
 * El texto reconocido se AÑADE a lo que ya hay escrito, nunca lo reemplaza:
 * dictar y teclear tienen que poder alternarse sin perder nada.
 */

/* El tipado de esta API no está en lib.dom. Declaramos lo que usamos. */
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORES: Record<string, string> = {
  "not-allowed":
    "El navegador no me deja usar el micrófono. Dale permiso en el candado de la barra de direcciones.",
  "service-not-allowed":
    "El navegador no me deja usar el micrófono. Dale permiso en el candado de la barra de direcciones.",
  "no-speech": "No he oído nada. Prueba otra vez.",
  network: "El reconocimiento de voz necesita conexión y no la ha encontrado.",
  "audio-capture": "No encuentro ningún micrófono conectado.",
};

export function DictationField({
  value,
  onChange,
  placeholder,
  rows = 3,
  lang = "es-CO",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  lang?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognition = useRef<SpeechRecognitionLike | null>(null);
  // El valor vive en una ref además de en el estado porque los callbacks del
  // reconocedor se registran una sola vez y capturarían un valor viejo.
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    setSupported(getRecognition() !== null);
    return () => recognition.current?.stop();
  }, []);

  function start() {
    const Ctor = getRecognition();
    if (!Ctor) return;

    setError(null);
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let firme = "";
      let provisional = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) firme += t;
        else provisional += t;
      }
      setInterim(provisional);
      if (firme) {
        const previo = latest.current;
        const separador = previo && !/\s$/.test(previo) ? " " : "";
        onChange((previo + separador + firme.trim()).trimStart());
        setInterim("");
      }
    };

    rec.onerror = (e) => {
      setError(ERRORES[e.error] ?? `No he podido escuchar (${e.error}).`);
      setListening(false);
      setInterim("");
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognition.current = rec;
    rec.start();
    setListening(true);
  }

  function stop() {
    recognition.current?.stop();
    setListening(false);
  }

  return (
    <div>
      <textarea
        rows={rows}
        value={interim ? `${value}${value ? " " : ""}${interim}` : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none border-b border-ink-200 bg-transparent pb-3 font-serif text-[1.0625rem] leading-relaxed outline-none placeholder:text-ink-300 focus:border-ink-700"
      />

      {supported && (
        <button
          type="button"
          onClick={listening ? stop : start}
          aria-pressed={listening}
          className={`mt-3 inline-flex items-center gap-2 text-[0.75rem] tracking-[0.08em] uppercase transition-colors ${
            listening ? "text-marseille-red" : "text-ink-400 hover:text-ink-700"
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-[7px] w-[7px] rounded-full ${
              listening ? "animate-pulse bg-marseille-red" : "bg-ink-300"
            }`}
          />
          {listening ? "Escuchando… tocar para parar" : "Dictar"}
        </button>
      )}

      {error && (
        <p className="mt-2 text-[0.75rem] leading-relaxed text-marseille-red">
          {error}
        </p>
      )}
    </div>
  );
}
