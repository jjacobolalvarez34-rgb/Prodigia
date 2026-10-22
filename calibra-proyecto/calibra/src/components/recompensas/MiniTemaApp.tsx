import type { TemaApp } from "@/lib/recompensas/temas";

// Miniatura de un tema de la app: una pantallita con su fondo, dos tarjetas con su
// texto y su detalle, y el botón principal. Se dibuja con la paleta que de verdad se
// aplica (lo que ves es lo que te pones) y la forma de sus tarjetas. Igual que
// MiniTema en la app (mobile/src/ui/temas/MiniTemaApp.tsx).
export const PALETA_CLASICA = { fondo: "#090C14", superficie: "#12172A", borde: "#232B47", texto: "#F4F6FB", primario: "#7C5CFF", logro: "#FFB627" };

export default function MiniTemaApp({ tema, ancho, className = "" }: { tema: TemaApp | null; ancho?: number; className?: string }) {
  const k = tema ? tema.paleta : PALETA_CLASICA;
  const radio = tema ? Math.min(tema.radio, 6) : 5;
  const grosor = tema ? Math.max(1, tema.borde) : 1;
  const dura = tema?.sombra === "dura";
  const tarjeta = (alto: string, ancho1: string) => (
    <span className="relative block" style={{ height: alto }}>
      {dura && <span className="absolute inset-0 translate-x-[2px] translate-y-[2px]" style={{ borderRadius: radio, background: k.borde }} />}
      <span className="relative flex h-full flex-col justify-center gap-[3px] p-1" style={{ borderRadius: radio, background: k.superficie, border: `${grosor}px solid ${k.borde}` }}>
        <span className="block h-[3px] rounded-sm opacity-90" style={{ width: ancho1, background: k.texto }} />
        <span className="block h-[3px] w-[40%] rounded-sm" style={{ background: k.logro }} />
      </span>
    </span>
  );
  return (
    <span
      className={`flex flex-col gap-1.5 overflow-hidden rounded-xl p-2 ${ancho ? "" : "aspect-[10/13] w-full"} ${className}`}
      style={{ background: k.fondo, ...(ancho ? { width: ancho, height: Math.round(ancho * 1.3) } : {}), boxShadow: `inset 0 0 0 1px ${k.borde}55` }}
      aria-hidden="true"
    >
      <span className="block h-[5px] w-[48%] rounded-sm" style={{ background: k.texto }} />
      {tarjeta("24%", "62%")}
      {tarjeta("17%", "50%")}
      <span className="flex-1" />
      <span className="block h-[12%]" style={{ borderRadius: radio, background: k.primario }} />
    </span>
  );
}
