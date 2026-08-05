"use client";

import { Rule } from "@/components/ui";

/**
 * Comparador tipográfico.
 *
 * Se queda en el proyecto como referencia: cuando dentro de seis meses alguien
 * —incluido tú— se pregunte por qué IRIS usa estas dos y no otras, esta página
 * lo responde con el texto real delante en lugar de con una opinión.
 *
 * Decisión tomada: EB Garamond en titulares, Literata en cuerpo. Ambas ya
 * instaladas con next/font; esta página carga las cinco por su cuenta.
 */
const CANDIDATAS = [
  {
    id: "eb-garamond",
    stack: "'EB Garamond', Georgia, serif",
    nombre: "EB Garamond",
    papel: "Instalada — titulares y citas",
    nota: "Garamond del siglo XVI, francesa, contemporánea del propio Tarot de Marsella. Tiene gesto y personalidad, y en tamaño grande eso es una virtud. En cuerpo pequeño su ojo bajo la vuelve más cansada, y por eso no sostiene los párrafos.",
    elegida: true,
  },
  {
    id: "literata",
    stack: "Literata, Georgia, serif",
    nombre: "Literata",
    papel: "Instalada — cuerpo y texto largo",
    nota: "Dibujada para lectura prolongada en pantalla. Ojo medio más alto, trazos más abiertos, menos contraste: es más ancha y más legible, que es exactamente lo que pedía el texto de las lecturas. Tiene eje óptico, así que engorda un poco el trazo en cuerpo pequeño.",
    elegida: true,
  },
  {
    id: "spectral",
    stack: "Spectral, Georgia, serif",
    nombre: "Spectral",
    papel: "Descartada",
    nota: "La más nítida en móvil de todas, pero también la más neutra. Habría funcionado; le falta el vínculo histórico que aquí sí significa algo.",
  },
  {
    id: "crimson-pro",
    stack: "'Crimson Pro', Georgia, serif",
    nombre: "Crimson Pro",
    papel: "Descartada",
    nota: "A medio camino entre la Garamond y la Literata. Muy buena, pero al usar dos familias es mejor que se distingan claramente: Crimson se parecía demasiado a Garamond para justificar el par.",
  },
  {
    id: "cormorant",
    stack: "'Cormorant Garamond', Georgia, serif",
    nombre: "Cormorant Garamond",
    papel: "Descartada",
    nota: "La más elegante y la más frágil: trazos finísimos que se rompen en pantallas normales y en fondos claros. Espectacular en un cartel, dura en una app que se lee.",
  },
  {
    id: "fraunces",
    stack: "var(--font-garamond), Georgia, serif",
    nombre: "Fraunces",
    papel: "Retirada",
    nota: "La que había. Sus ejes SOFT y WONK deforman letras a propósito, y en un texto largo eso se lee como una errata, no como carácter. (Aquí se muestra ya sustituida.)",
  },
] as const;

const TITULAR = "El intelecto se pone a prueba";
const CUERPO = `Jota, la pregunta es sobre una reunión profesional hoy, y lo primero que hay que decir es que esta tirada no habla de si va bien o mal en términos de resultado: habla de en qué registro se va a mover. La situación de partida —el As de Espadas— dice que llegas con un potencial mental intacto, sin ideas, sin posturas, sin argumentos que todavía no se ha desplegado del todo.`;
const CITA =
  "«Esta nueva mirada simboliza el ideal del Cinco.» — La vía del Tarot, Los Cinco";

export function TypeLab() {
  return (
    <div>
      {CANDIDATAS.map((c) => (
        <section key={c.id} className="mb-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              className="text-[1.5rem] leading-tight text-ink-900"
              style={{ fontFamily: c.stack }}
            >
              {c.nombre}
            </h2>
            <span
              className={`eyebrow shrink-0 ${
                "elegida" in c && c.elegida ? "text-marseille-red" : ""
              }`}
            >
              {c.papel}
            </span>
          </div>

          <p className="mt-2 max-w-[46ch] text-[0.8125rem] leading-relaxed text-ink-400">
            {c.nota}
          </p>

          <div className="mt-6" style={{ fontFamily: c.stack }}>
            <p className="text-[1.75rem] leading-[1.15] tracking-[-0.012em] text-ink-900">
              {TITULAR}
            </p>
            <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-800">
              {CUERPO}
            </p>
            <p className="mt-4 text-[0.9375rem] leading-relaxed italic text-ink-500">
              {CITA}
            </p>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-500">
              As de Espadas · V de Espadas · II de Bastos — 1234567890 — áéíóú ñ ¿? ¡!
            </p>
          </div>

          <Rule className="mt-12" />
        </section>
      ))}
    </div>
  );
}
