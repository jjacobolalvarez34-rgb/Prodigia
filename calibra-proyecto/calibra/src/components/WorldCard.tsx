import Link from "next/link";
import type { ReactElement } from "react";

interface Props {
  nombre: string;
  descripcion: string;
  Icono: (props: { className?: string }) => ReactElement;
  href: string;
  colorHex: string;
  proximamente?: boolean;
}

export default function WorldCard({ nombre, descripcion, Icono, href, colorHex, proximamente }: Props) {
  if (proximamente) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5 text-foreground/40">
          <Icono className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-semibold text-foreground/70">{nombre}</p>
          <p className="mt-0.5 text-xs text-texto-secundario">{descripcion}</p>
        </div>
        <span className="self-start rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/40">
          Próximamente
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl px-6 py-7 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-xl"
      style={{
        background: `linear-gradient(120deg, ${colorHex}, color-mix(in oklab, ${colorHex} 55%, white))`,
      }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
        <Icono className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-lg font-bold">{nombre}</p>
        <p className="mt-0.5 text-sm text-white/80">{descripcion}</p>
      </div>
    </Link>
  );
}
