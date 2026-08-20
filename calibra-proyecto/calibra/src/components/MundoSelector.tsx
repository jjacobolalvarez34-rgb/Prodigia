"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MUNDOS = [
  { href: "/numeria", nombre: "Numeria", colorHex: "#6C4CF1" },
  { href: "/enigmia", nombre: "Enigmia", colorHex: "#0E9F6E" },
  { href: "/geografia", nombre: "Geografía", colorHex: "#1E7A8C" },
  { href: "/quimia", nombre: "Quimia", colorHex: "#C026D3" },
];

function mundoActual(pathname: string) {
  return MUNDOS.find((m) => pathname.startsWith(m.href)) ?? null;
}

// Fase WW: cambiar de mundo no debería obligar a volver a Inicio —
// este dropdown vive en la navbar y está disponible en cualquier
// pantalla, no solo en la home de Prodigia.
export default function MundoSelector() {
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
        {actual?.nombre ?? "Mundos"}
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
            ← Inicio de Prodigia
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
              {m.nombre}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
