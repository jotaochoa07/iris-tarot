import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

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
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="grain min-h-dvh antialiased">
        <div className="relative z-10 mx-auto min-h-dvh w-full max-w-[430px] md:max-w-[720px]">
          {children}
        </div>
      </body>
    </html>
  );
}
