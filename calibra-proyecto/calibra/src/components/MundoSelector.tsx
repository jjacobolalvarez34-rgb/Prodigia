"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const MUNDOS = [
  { href: "/numeria", slug: "numeria", colorHex: "#6C4CF1" },
  { href: "/enigmia", slug: "enigmia", colorHex: "#0E9F6E" },
  { href: "/geografia", slug: "geografia", colorHex: "#1E7A8C" },
  { href: "/quimia", slug: "quimia", colorHex: "#C026D3" },
  { href: "/anatomia", slug: "anatomia", colorHex: "#8B2942" },
  { href: "/melodia", slug: "melodia", colorHex: "#B8860B" },
  { href: "/trigonometria", slug: "trigonometria", colorHex: "#84CC16" },
  { href: "/historia", slug: "historia", colorHex: "#A0522D" },
  { href: "/calculia", slug: "calculia", colorHex: "#4338CA" },
  { href: "/circuitia", slug: "circuitia", colorHex: "#F59E0B" },
] as const;

function mundoActual(pathname: string) {
  return MUNDOS.find((m) => pathname.startsWith(m.href)) ?? null;
}

// Fase WW: cambiar de mundo no debería obligar a volver a Inicio —
// este dropdown vive en la navbar y está disponible en cualquier
// pantalla, no solo en la home de Prodigia.
export default function MundoSelector() {
  const t = useTranslations("Nav.mundoSelector");
  const tMundos = useTranslations("Mundos.nombres");
  const pathname = usePathname() ?? "/";
  const actual = mundoActual(pathname);
  const [abierto, setAbierto] = useState(false);
  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al cambiar de ruta sin un efecto: "ajustar estado durante el
  // render" quede documentado por React para este caso exacto (resetear
  // estado cuando cambia una prop), converge en un solo re-render extra.
  if (pathname !== pathnameAnterior) {
    setPathnameAnterior(pathname);
    setAbierto(false);
  }

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primario/40"
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: actual?.colorHex ?? "var(--texto-secundario)" }}
        />
        {actual ? tMundos(actual.slug) : t("mundos")}
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${abierto ? "rotate-180" : ""}`}>
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <Link
            href="/"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-texto-secundario transition-colors hover:bg-surface-2"
          >
            ← {t("inicioDeProdigia")}
          </Link>
          <div className="h-px bg-border" />
          {MUNDOS.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              role="menuitem"
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2 ${
                actual?.href === m.href ? "text-foreground" : "text-texto-secundario"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: m.colorHex }} />
              {tMundos(m.slug)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
