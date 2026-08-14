import { redirect } from "next/navigation";
import { getOwnerIdentity, saveOwnerName } from "@/lib/actions/identity";
import { Button, Display, Screen } from "@/components/ui";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  vacio: "Escribe algo. Aunque sea una inicial.",
  guardado: "No he podido guardarlo. Vuelve a intentarlo.",
};

export default async function BienvenidaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cambiar?: string }>;
}) {
  const { error, cambiar } = await searchParams;
  const identity = await getOwnerIdentity();

  // Si ya se presentó, esta página no tiene nada que hacer, salvo que venga a
  // cambiar el nombre a propósito.
  if (identity.onboarded && !cambiar) redirect("/");

  return (
    <Screen className="flex min-h-dvh flex-col justify-center">
      <div className="rise">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <img
            src="/icon.jpg"
            alt="IRIS Logo"
            className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover shadow-lg ring-2 ring-ochre-800/35"
          />
          <p className="eyebrow mt-3 tracking-[0.25em]">IRIS</p>
        </div>
        <Display className="text-[2.25rem] leading-[1.08]">
          Antes de las
          <br />
          cartas.
        </Display>
        <p className="mt-5 max-w-[32ch] text-[0.9375rem] leading-relaxed text-ink-500">
          Voy a leer contigo durante bastante tiempo. Prefiero hablarte por tu
          nombre y no como «usuario».
        </p>
      </div>

      <form action={saveOwnerName} className="rise d-1 mt-10">
        <label className="eyebrow mb-2 block" htmlFor="name">
          ¿Cómo quieres que te llame?
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={40}
          autoComplete="given-name"
          autoFocus
          defaultValue={identity.name ?? ""}
          placeholder="Jota"
          className="w-full border-b border-ink-200 bg-transparent pb-3 font-serif text-[1.125rem] text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-700"
        />
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-400">
          El nombre con el que te llamarías a ti mismo. Puedes cambiarlo cuando
          quieras.
        </p>

        <Button type="submit" size="lg" className="mt-8 w-full">
          {cambiar ? "Guardar" : "Empezar"}
        </Button>

        {error && (
          <p className="mt-4 text-[0.8125rem] text-marseille-red">
            {ERRORS[error] ?? "Algo ha fallado."}
          </p>
        )}
      </form>

      <p className="fade d-4 mt-16 text-[0.6875rem] leading-relaxed text-ink-300">
        Se guarda en tu cuenta. Nada más.
      </p>
    </Screen>
  );
}
