import Link from "next/link";
import type { ReactElement } from "react";

interface Props {
  href: string;
  titulo: string;
  descripcion: string;
  Icono: (props: { className?: string }) => ReactElement;
  colorHex: string;
}

// Practicar y Aprender usan EXACTAMENTE el mismo componente (mismo
// tamaño, mismo peso tipográfico, misma estructura) para que ninguno se
// lea como "más disponible" que el otro — solo cambia el color de
// acento y el ícono (Fase NN). Aprender siempre usa el dorado de logro
// en cualquier mundo; Practicar usa el color propio de ese mundo.
export default function AccionMundo({ href, titulo, descripcion, Icono, colorHex }: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: `color-mix(in oklab, ${colorHex} 35%, transparent)`,
        background: `color-mix(in oklab, ${colorHex} 7%, var(--surface))`,
      }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full text-white"
        style={{ background: colorHex }}
      >
        <Icono className="h-5 w-5" />
      </span>
      <div>
        <span className="font-display text-xl font-bold text-foreground">{titulo}</span>
        <p className="mt-1 text-sm text-texto-secundario">{descripcion}</p>
      </div>
    </Link>
  );
}
