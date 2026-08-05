import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter, Literata } from "next/font/google";
import "./globals.css";

/** Titulares y citas. */
const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  display: "swap",
});

/** Cuerpo y todo el texto largo. */
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
  axes: ["opsz"],
});

/** Etiquetas, cifras de interfaz, todo lo que no se lee sino que se consulta. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IRIS — Entre las cartas y tú",
  description:
    "Mentor personal para aprender a leer el Tarot de Marsella. IRIS no predice: traduce.",
};

export const viewport: Viewport = {
  themeColor: "#f3ede2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${garamond.variable} ${literata.variable} ${inter.variable}`}
    >
      <body className="grain min-h-dvh antialiased">
        <div className="relative z-10 mx-auto min-h-dvh w-full max-w-[430px] md:max-w-[720px]">
          {children}
        </div>
      </body>
    </html>
  );
}
