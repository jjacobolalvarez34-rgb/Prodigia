import { ciudadDe, tono } from "@/lib/recompensas/catalogo";
import { mulberry32 } from "@/lib/rng";

// Skyline nocturno de una ciudad (la "ciudad de la Placa" de la tienda, 0248): los
// edificios salen de una semilla con el nombre del mundo, así se ve siempre igual.
// En la app es Ciudad.tsx (con animación); acá es un SVG quieto y liviano.
function semillaDe(texto: string): number {
  let h = 2166136261;
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export default function CiudadSkyline({ ciudad, alto = 90, ancho = 320, redondeado = false }: { ciudad: string; alto?: number; ancho?: number; redondeado?: boolean }) {
  const c = ciudadDe(ciudad);
  if (!c) return null;
  const r = mulberry32(semillaDe(c.slug));
  const W = 320;
  const H = 90;
  const edificios: { x: number; w: number; h: number }[] = [];
  let x = 0;
  while (x < W) {
    const w = 14 + Math.floor(r() * 26);
    const h = 22 + Math.floor(r() * 58);
    edificios.push({ x, w, h });
    x += w + 2;
  }
  const ventanas: string[] = [];
  for (const e of edificios) {
    for (let vy = H - e.h + 6; vy < H - 6; vy += 8) {
      for (let vx = e.x + 3; vx < e.x + e.w - 4; vx += 6) {
        if (r() < 0.35) ventanas.push(`M${vx} ${vy}h2.4v3h-2.4z`);
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={ancho} height={alto} preserveAspectRatio="xMidYMax slice" aria-hidden="true" className={redondeado ? "rounded-lg" : undefined} style={{ display: "block" }}>
      {redondeado && <rect width={W} height={H} fill={tono(c.color, -0.82)} />}
      {edificios.map((e, i) => (
        <rect key={i} x={e.x} y={H - e.h} width={e.w} height={e.h} fill={tono(c.color, -0.72 + (i % 3) * 0.06)} />
      ))}
      <path d={ventanas.join("")} fill={tono(c.color, 0.25)} opacity={0.85} />
    </svg>
  );
}
