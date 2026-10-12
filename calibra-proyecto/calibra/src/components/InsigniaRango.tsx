import { rangoDeElo } from "@/types/database";
import { indiceDivision, piezasInsigniaTorres, type Pieza } from "@/lib/rangos/insigniaTorres";

// Insignia de rango «Torres» (2026-10-12): la ciudad que crece con tu rango y
// enciende pisos con cada división. Reemplaza a los estandartes PNG de
// public/rangos. La geometría es compartida con la app (lib/rangos/insigniaTorres).

function dibujar(p: Pieza, i: number) {
  switch (p.t) {
    case "path":
      return <path key={i} d={p.d} fill={p.fill ?? "none"} stroke={p.stroke} strokeWidth={p.ancho} opacity={p.opacidad} />;
    case "rect":
      return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill} />;
    case "circle":
      return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={p.opacidad} />;
    case "polygon":
      return <polygon key={i} points={p.puntos} fill={p.fill} />;
    case "line":
      return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.stroke} strokeWidth={p.ancho} />;
  }
}

export default function InsigniaRango({ elo, className = "h-16 w-16", titulo }: { elo: number; className?: string; titulo?: string }) {
  const rango = rangoDeElo(elo);
  return (
    <svg viewBox="0 0 100 100" className={`shrink-0 ${className}`} role={titulo ? "img" : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}>
      {piezasInsigniaTorres(rango.slug, indiceDivision(elo)).map(dibujar)}
    </svg>
  );
}
