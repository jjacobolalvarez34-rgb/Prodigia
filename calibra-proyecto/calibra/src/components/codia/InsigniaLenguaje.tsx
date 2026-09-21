import type { Lenguaje } from "@/lib/codia/tipos";
import { NOMBRE_LENGUAJE } from "@/lib/codia/tipos";

// Cada lenguaje lleva un tono propio (además del nombre en texto: el color
// nunca es la única señal).
const TONO: Record<Lenguaje, string> = {
  python: "#3B82F6",
  java: "#F97316",
  javascript: "#EAB308",
  typescript: "#2563EB",
};

interface Props {
  lenguaje: Lenguaje;
  className?: string;
}

// Badge visible con el lenguaje de la pregunta.
export default function InsigniaLenguaje({ lenguaje, className = "" }: Props) {
  const tono = TONO[lenguaje];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground ${className}`}
      style={{ borderColor: `color-mix(in oklab, ${tono} 55%, transparent)`, background: `color-mix(in oklab, ${tono} 14%, transparent)` }}
      data-lenguaje={lenguaje}
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: tono }} />
      {NOMBRE_LENGUAJE[lenguaje]}
    </span>
  );
}
