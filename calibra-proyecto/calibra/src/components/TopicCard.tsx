import Link from "next/link";
import type { ReactElement } from "react";

export type TopicBadge = { tipo: "nivel"; nivel: number } | { tipo: "proximamente" };

interface Props {
  nombre: string;
  Icono: (props: { className?: string }) => ReactElement;
  // Fase 2 ("Practicar" estandarizado): sin href, la tarjeta queda como
  // vidriera informativa (nivel actual) en vez de acceso directo a
  // arrancar una partida — la home de cada mundo ya no debe dejar
  // saltar directo a jugar desde acá, eso pasa solo adentro de
  // "Practicar". Se conserva la prop por si algún día hace falta un
  // link real a otro lado (perfil del tema, por ejemplo).
  href?: string;
  badge: TopicBadge;
  colorHex?: string;
}

// Jerarquía real (Fase HH): el nombre del tema es lo más grande de la
// tarjeta, no el ícono — alineado a la izquierda, no centrado, para que
// no se lea como el mismo componente reciclado que el resto de la app.
export default function TopicCard({ nombre, Icono, href, badge, colorHex = "#6C4CF1" }: Props) {
  const proximamente = badge.tipo === "proximamente";
  const className = `group relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border px-5 py-5 transition-all duration-200 ${
    href ? "hover:-translate-y-1 hover:shadow-lg" : ""
  }`;
  const style = {
    borderColor: proximamente ? "var(--border)" : `color-mix(in oklab, ${colorHex} 25%, var(--border))`,
    background: proximamente ? "var(--surface)" : `color-mix(in oklab, ${colorHex} 5%, var(--surface))`,
  };
  const contenido = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {contenido}
      </Link>
    );
  }
  return (
    <div className={className} style={style}>
      {contenido}
    </div>
  );
}
