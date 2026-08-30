import type { MetadataRoute } from "next";

// PWA (Fase U-PWA): convención nativa de Next 16 (app/manifest.ts) en vez
// de un public/manifest.json a mano — Next lo sirve y lo enlaza en el
// <head> solo. PNG 192/512 generados con sharp a partir de icon.svg
// (mismo dibujo que Logo.tsx) — ver docs/PROGRESO.md.
//
// Grupo B, Fase 6 (auditoría real, no solo releer el código): el "fix
// de hace tiempo" de ícono maskable/fondo sólido NO estaba vigente —
// icon-192.png/icon-512.png vienen de icon.svg, que dibuja un
// <rect rx="112" .../> (esquinas redondeadas con transparencia real
// alrededor, confirmado leyendo el canal alfa con sharp: alfa=0 en las
// esquinas). Para purpose:"any" eso está bien — pero purpose:"maskable"
// exige que el cuadrado ENTERO llegue opaco de punta a punta (el SO
// aplica su propio recorte — círculo, squircle, gota — sobre esas
// esquinas; si ya vienen transparentes, esas zonas se ven en negro o
// se rompen en el ícono final del home screen). icon-*-maskable.png
// son el mismo dibujo con rx=0 (mismo script que ya generaba los PNG,
// ver docs/PROGRESO.md) — los "any" siguen con esquinas redondeadas
// propias, sin tocar.
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
      { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
