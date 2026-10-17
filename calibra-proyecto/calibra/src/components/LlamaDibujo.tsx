import { useId } from "react";
import { dibujoLlama, LLAMA, type ColoresEstela, type EstadoLlama } from "@/lib/fx/llama";

// La llama de la racha en capas (src/lib/fx/llama.ts, igual que la app y los widgets).
// «titila»: respira y se mece desde la base (clase llama-titila de globals.css).
export default function LlamaDibujo({ className, estela, estado = "encendida", titila = false }: { className?: string; estela?: ColoresEstela | null; estado?: EstadoLlama; titila?: boolean }) {
  const id = useId().replace(/:/g, "");
  const d = dibujoLlama(estela, estado);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        {d.capas.map((c, i) => (
          <linearGradient key={i} id={`${id}c${i}`} x1="0" y1="1" x2="0" y2="0">
            {c.colores.map((col, j) => (
              <stop key={j} offset={j / (c.colores.length - 1)} stopColor={col} />
            ))}
          </linearGradient>
        ))}
        {d.halo && (
          <radialGradient id={`${id}h`}>
            <stop offset="0" stopColor={d.halo} stopOpacity={0.45} />
            <stop offset="1" stopColor={d.halo} stopOpacity={0} />
          </radialGradient>
        )}
      </defs>
      {d.halo && estado === "llamas" && <circle cx={12} cy={15} r={11} fill={`url(#${id}h)`} />}
      <g className={titila ? "llama-titila" : undefined} style={{ transformOrigin: `${LLAMA.origen.x}px ${LLAMA.origen.y}px` }}>
        {d.capas.map((c, i) => (
          <path key={i} d={c.d} fill={`url(#${id}c${i})`} />
        ))}
        <path d={d.brillo.d} stroke={d.brillo.color} strokeOpacity={d.brillo.opacidad} strokeWidth={1} strokeLinecap="round" fill="none" />
      </g>
      {d.brasas.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.color} className={titila ? "llama-brasa" : undefined} style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
    </svg>
  );
}
