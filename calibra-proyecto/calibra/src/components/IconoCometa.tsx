import { useId } from "react";
import { COMETA } from "@/lib/recompensas/iconoCometa";

// El Cometa (moneda premium, 0279): dibujo propio, misma geometría que la app.
export default function IconoCometa({ className = "h-5 w-5", titulo }: { className?: string; titulo?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" className={`inline-block shrink-0 ${className}`} role={titulo ? "img" : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}>
      <defs>
        <linearGradient id={`${id}c`} x1="26" y1="8" x2="4" y2="29" gradientUnits="userSpaceOnUse">
          {COMETA.cola.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacidad} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}n`} cx="0.4" cy="0.4" r="0.65">
          {COMETA.nucleo.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </radialGradient>
      </defs>
      <path d={COMETA.colaGrande} fill={`url(#${id}c)`} />
      <path d={COMETA.colaChica} fill={`url(#${id}c)`} opacity={0.7} />
      <circle cx={COMETA.halo.cx} cy={COMETA.halo.cy} r={COMETA.halo.r} fill="#5DE4FF" opacity={0.28} />
      <circle cx={COMETA.cabeza.cx} cy={COMETA.cabeza.cy} r={COMETA.cabeza.r} fill={`url(#${id}n)`} />
      <circle cx={COMETA.reflejo.cx} cy={COMETA.reflejo.cy} r={COMETA.reflejo.r} fill="#FFFFFF" opacity={0.9} />
      <path d={COMETA.destello} fill="#FFFFFF" opacity={0.85} />
    </svg>
  );
}
