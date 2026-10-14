import { TRAZOS, type NombreTrazo } from "@/lib/iconosTrazo";

// Íconos de trazo compartidos con la app (src/lib/iconosTrazo.ts). Toman el color del texto.
export default function IconoTrazo({ nombre, className = "h-5 w-5", ancho = 2 }: { nombre: NombreTrazo; className?: string; ancho?: number }) {
  const t = TRAZOS[nombre] as { d?: string; circulos?: [number, number, number][] };
  return (
    <svg viewBox="0 0 24 24" className={`inline-block shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {t.d && <path d={t.d} />}
      {t.circulos?.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
    </svg>
  );
}
