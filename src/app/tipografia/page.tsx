import { Rule, Screen, SectionTitle } from "@/components/ui";
import Link from "next/link";
import { TypeLab } from "./TypeLab";

export const metadata = { title: "Tipografía — IRIS" };

/**
 * Banco de pruebas tipográfico.
 *
 * Existe para decidir con el texto real de una lectura y no con un pangrama:
 * una serif puede ser preciosa en tres palabras y agotadora en tres párrafos.
 * Cuando la decisión esté tomada, esta página y sus fuentes salen del proyecto
 * y la elegida se carga con next/font como las demás.
 */
export default function TipografiaPage() {
  return (
    <>
      {/* Solo esta página carga las candidatas. Al resto de la app no le pesa. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href={
          "https://fonts.googleapis.com/css2" +
          "?family=EB+Garamond:ital,wght@0,400..700;1,400..600" +
          "&family=Spectral:ital,wght@0,300;0,400;0,600;1,400" +
          "&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400" +
          "&family=Crimson+Pro:ital,wght@0,300..700;1,400" +
          "&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400" +
          "&display=swap"
        }
      />

      <Screen>
        <header className="flex items-baseline justify-between">
          <p className="eyebrow">IRIS · tipografía</p>
          <Link href="/" className="eyebrow hover:text-ink-700">
            ← Salir
          </Link>
        </header>

        <div className="mt-10">
          <SectionTitle>Por qué estas dos</SectionTitle>
          <p className="mt-3 max-w-[46ch] text-[0.875rem] leading-relaxed text-ink-500">
            EB Garamond en titulares, Literata en cuerpo. Todas las que se
            compararon tienen licencia SIL Open Font License: libres de usar,
            modificar y distribuir, también comercialmente. El mismo fragmento
            de una lectura real en cada una, que es la única prueba que vale.
          </p>
        </div>

        <Rule />

        <TypeLab />
      </Screen>
    </>
  );
}
