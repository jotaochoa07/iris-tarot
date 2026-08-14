import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IRIS — Entre las cartas y tú",
    short_name: "IRIS Tarot",
    description: "Mentor personal para aprender a leer el Tarot de Marsella. IRIS no predice: traduce.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0e13",
    theme_color: "#0f0e13",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/apple-icon.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
  };
}
