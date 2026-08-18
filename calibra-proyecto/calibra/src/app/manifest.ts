import type { MetadataRoute } from "next";

// PWA (Fase U-PWA): convención nativa de Next 16 (app/manifest.ts) en vez
// de un public/manifest.json a mano — Next lo sirve y lo enlaza en el
// <head> solo. PNG 192/512 generados con sharp a partir de icon.svg
// (mismo dibujo que Logo.tsx) — ver docs/PROGRESO.md.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prodigia",
    short_name: "Prodigia",
    description: "Práctica adaptativa de cálculo mental y lógica: dificultad que se ajusta a tu nivel.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#6C4CF1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
