import { useId } from "react";
import { ilustracionPaquete, type Ilustracion } from "@/lib/tienda/ilustracionesPaquetes";

// Dibujo propio de cada paquete de la tienda (mismos datos que la app). Con
// `ilustracion` dibuja cualquier otra escena con el mismo formato (p. ej. los anuncios).
export default function IlustracionPaquete({ item, ilustracion, className = "h-16 w-16" }: { item?: string; ilustracion?: Ilustracion; className?: string }) {
  const il = ilustracion ?? ilustracionPaquete(item ?? "");
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={il.fondo[0]} />
          <stop offset="1" stopColor={il.fondo[1]} />
        </linearGradient>
        <radialGradient id={`h${id}`} cx="50%" cy="45%" r="50%">
          <stop offset="0" stopColor={il.halo} stopOpacity="0.55" />
          <stop offset="1" stopColor={il.halo} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`c${id}`}>
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <rect width="64" height="64" fill={`url(#f${id})`} />
        <circle cx="32" cy="29" r="30" fill={`url(#h${id})`} />
        {il.formas.map((f, i) => (
          <path
            key={i}
            d={f.d}
            fill={f.relleno ?? "none"}
            stroke={f.trazo}
            strokeWidth={f.ancho}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={f.opacidad}
          />
        ))}
      </g>
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5" />
    </svg>
  );
}
