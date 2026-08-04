import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Provenance } from "@/lib/types";

/* --- Botones --------------------------------------------------------------- */

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-[0.9375rem] font-medium tracking-[-0.01em] disabled:opacity-40 disabled:pointer-events-none select-none";

const SIZES = {
  lg: "min-h-[52px] px-7",
  md: "min-h-[44px] px-5",
  sm: "min-h-[36px] px-4 text-[0.8125rem]",
} as const;

type Variant = "solid" | "outline" | "ghost";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-ink-900 text-paper active:bg-ink-700",
  outline:
    "border border-ink-200 text-ink-800 active:bg-paper-soft",
  ghost: "text-ink-500 active:bg-paper-soft",
};

export function Button({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return (
    <button
      {...props}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: keyof typeof SIZES;
}) {
  return (
    <Link
      {...props}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    />
  );
}

/* --- Estructura ------------------------------------------------------------ */

export function Screen({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`px-6 pb-28 pt-8 ${className}`}>{children}</main>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>;
}

export function Rule({ className = "" }: { className?: string }) {
  return <div className={`rule my-8 ${className}`} />;
}

export function Display({
  children,
  className = "",
  as: Tag = "h1",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag className={`font-display text-ink-900 ${className}`}>
      {children}
    </Tag>
  );
}

/* --- Procedencia -----------------------------------------------------------
 * El elemento de interfaz más importante del producto: hace visible de dónde
 * viene cada afirmación.
 * ------------------------------------------------------------------------- */

const PROVENANCE_META: Record<
  Provenance,
  { mark: string; label: string; tone: string }
> = {
  source: {
    mark: "◆",
    label: "Basado en fuente",
    tone: "text-marseille-blue",
  },
  structural: {
    mark: "▚",
    label: "Estructura de la tirada",
    tone: "text-ink-500",
  },
  interpretation: {
    mark: "◇",
    label: "Interpretación de IRIS",
    tone: "text-ink-400",
  },
  archetypal: {
    mark: "◈",
    label: "Lente psicológica",
    tone: "text-marseille-green",
  },
};

export function ProvenanceMark({ provenance }: { provenance: Provenance }) {
  const meta = PROVENANCE_META[provenance];
  return (
    <span
      className={`mr-1.5 align-[0.08em] text-[0.6em] ${meta.tone}`}
      title={meta.label}
      aria-label={meta.label}
    >
      {meta.mark}
    </span>
  );
}

export function ProvenanceLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {(Object.keys(PROVENANCE_META) as Provenance[]).map((p) => (
        <span
          key={p}
          className="text-[0.6875rem] tracking-wide text-ink-400"
        >
          <ProvenanceMark provenance={p} />
          {PROVENANCE_META[p].label}
        </span>
      ))}
    </div>
  );
}

/* --- Aviso ----------------------------------------------------------------- */

export function Notice({
  children,
  tone = "quiet",
}: {
  children: ReactNode;
  tone?: "quiet" | "warn";
}) {
  return (
    <div
      className={`rounded-[4px] border-l-2 py-3 pl-4 pr-3 text-[0.8125rem] leading-relaxed ${
        tone === "warn"
          ? "border-marseille-red bg-paper-soft text-ink-700"
          : "border-ink-200 text-ink-500"
      }`}
    >
      {children}
    </div>
  );
}
