"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Display, Screen } from "@/components/ui";

export default function EntrarPage() {
  const [email, setEmail] = useState("");
  // El proxy redirige aquí con ?error=sin-acceso cuando la cuenta no está en la
  // lista blanca. Se lee del navegador para no convertir la página en dinámica.
  const [denegado, setDenegado] = useState(false);
  useEffect(() => {
    setDenegado(new URLSearchParams(window.location.search).get("error") === "sin-acceso");
  }, []);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
    }
  }

  return (
    <Screen className="flex min-h-dvh flex-col justify-center">
      <div className="rise">
        <p className="eyebrow mb-6">IRIS</p>
        <Display className="text-[2.25rem] leading-[1.08]">
          Entre las cartas
          <br />y tú.
        </Display>
        <p className="mt-5 max-w-[30ch] text-[0.9375rem] leading-relaxed text-ink-500">
          Un cuaderno de estudio del Tarot de Marsella. Escribe tu correo y te
          envío un enlace de acceso.
        </p>
      </div>

      {denegado && (
        <div className="rise d-1 mt-8 border-l-2 border-marseille-red pl-4">
          <p className="text-[0.9375rem] leading-relaxed text-ink-700">
            Esa cuenta no tiene acceso a esta instalación de IRIS.
          </p>
        </div>
      )}

      {state === "sent" ? (
        <div className="rise d-1 mt-10">
          <div className="rule-solid mb-5" />
          <p className="font-quote text-[1.125rem] text-ink-800">
            Revisa tu correo.
          </p>
          <p className="mt-2 text-[0.875rem] text-ink-500">
            He enviado un enlace a {email}. Se abre una sola vez.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="rise d-1 mt-10">
          <label className="eyebrow mb-2 block" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full border-b border-ink-200 bg-transparent pb-3 font-serif text-[1.125rem] text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-700"
          />
          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full"
            disabled={state === "sending"}
          >
            {state === "sending" ? "Enviando…" : "Enviar enlace"}
          </Button>
          {state === "error" && (
            <p className="mt-4 text-[0.8125rem] text-marseille-red">{message}</p>
          )}
        </form>
      )}

      <p className="fade d-4 mt-16 text-[0.6875rem] leading-relaxed text-ink-300">
        IRIS no predice. Traduce.
      </p>
    </Screen>
  );
}
