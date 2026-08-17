"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { IconPerfil } from "@/components/icons";

type Theme = "light" | "dark";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
function getThemeServerSnapshot(): Theme {
  return "light";
}

// Fase S2: un solo desplegable de cuenta (Perfil / Ajustes / tema /
// Salir) en vez de esos 4 accesos sueltos repartidos por la navbar.
// Mismo patrón de apertura/cierre que MundoSelector (click afuera,
// Escape, se cierra solo al cambiar de ruta ajustando estado durante
// el render), con animación de entrada/salida vía AnimatePresence.
export default function ProfileMenu() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getThemeServerSnapshot);
  const [abierto, setAbierto] = useState(false);
  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);
  const ref = useRef<HTMLDivElement>(null);

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

  function alternarTema() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("prodigia-theme", next);
  }

  async function salir() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label="Cuenta"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground/70 transition-colors hover:border-primario/40 hover:text-foreground"
      >
        <IconPerfil className="h-4.5 w-4.5" />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
          >
            <Link
              href="/perfil"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Perfil
            </Link>
            <Link
              href="/ajustes"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Ajustes
            </Link>
            <button
              onClick={alternarTema}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Modo {theme === "dark" ? "claro" : "oscuro"}
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={salir}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Salir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
