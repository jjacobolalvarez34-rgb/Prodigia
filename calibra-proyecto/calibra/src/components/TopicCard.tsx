import Link from "next/link";
import type { ReactElement } from "react";

export type TopicBadge = { tipo: "nivel"; nivel: number } | { tipo: "proximamente" };

interface Props {
  nombre: string;
  Icono: (props: { className?: string }) => ReactElement;
  href: string;
  badge: TopicBadge;
  colorHex?: string;
}

// Jerarquía real (Fase HH): el nombre del tema es lo más grande de la
// tarjeta, no el ícono — alineado a la izquierda, no centrado, para que
// no se lea como el mismo componente reciclado que el resto de la app.
export default function TopicCard({ nombre, Icono, href, badge, colorHex = "#6C4CF1" }: Props) {
  const proximamente = badge.tipo === "proximamente";
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border px-5 py-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: proximamente ? "var(--border)" : `color-mix(in oklab, ${colorHex} 25%, var(--border))`,
        background: proximamente ? "var(--surface)" : `color-mix(in oklab, ${colorHex} 5%, var(--surface))`,
      }}
    >
      <span
        className="absolute -right-2 -top-2 opacity-[0.07] transition-opacity group-hover:opacity-[0.12]"
        style={proximamente ? undefined : { color: colorHex }}
      >
        <Icono className="h-16 w-16" />
      </span>
      <span
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg"
        style={{
          background: proximamente ? "var(--surface-2)" : colorHex,
          color: proximamente ? "var(--texto-secundario)" : "white",
        }}
      >
        <Icono className="h-4 w-4" />
      </span>
      <div className="relative z-10">
        <p className="font-display text-lg font-bold leading-tight text-foreground">{nombre}</p>
        {badge.tipo === "nivel" ? (
          <p className="mt-1 font-mono text-xs font-medium" style={{ color: colorHex }}>
            Nivel {badge.nivel}
          </p>
        ) : (
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-texto-secundario">Próximamente</p>
        )}
      </div>
    </Link>
  );
}
