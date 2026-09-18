"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ProgressDial from "@/components/ProgressDial";
import AprenderSidebar, { type UnidadResumenSidebar } from "@/components/AprenderSidebar";

const CLAVE_SIDEBAR = "prodigia:aprender-sidebar-abierto";

interface Props {
  titulo: string;
  subtitulo: string;
  progresoLabel: string;
  tecnicasTexto: string;
  colorHex: string;
  unidadesSidebar: UnidadResumenSidebar[];
  totalDominadas: number;
  totalTecnicas: number;
  children: React.ReactNode;
}

// Layout compartido de Aprender (Fase paridad-sidebar): dos columnas —
// panel de temas fijo (sticky, no scrollea con el camino) a la
// izquierda, camino continuo a la derecha, con un toggle para
// ocultar/mostrar el panel (útil en mobile, donde antes ocupaba medio
// scroll sin poder achicarse). El panel solo se muestra cuando hay más
// de una unidad — con una sola no hay nada real que "dividir por
// tema", mostrar un panel de 1 fila sería ruido. Extraído de
// AprenderShell.tsx (Numeria) para que los otros 9 mundos lo reutilicen
// sin duplicar la lógica de toggle/localStorage.
export default function AprenderLayout({
  titulo,
  subtitulo,
  progresoLabel,
  tecnicasTexto,
  colorHex,
  unidadesSidebar,
  totalDominadas,
  totalTecnicas,
  children,
}: Props) {
  const t = useTranslations("Aprender");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const mostrarPanel = unidadesSidebar.length > 1;

  useEffect(() => {
    // setTimeout evita el cascading-render que marca react-hooks/set-state-
    // in-effect (mismo patrón ya usado en DecryptedText.tsx/Shuffle.tsx).
    const id = setTimeout(() => {
      try {
        const guardado = localStorage.getItem(CLAVE_SIDEBAR);
        if (guardado !== null) setSidebarAbierto(guardado === "1");
      } catch {
        // localStorage puede no estar disponible (ventana privada, etc.) —
        // se ignora y queda el default abierto.
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function toggleSidebar() {
    setSidebarAbierto((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CLAVE_SIDEBAR, next ? "1" : "0");
      } catch {
        // ver comentario de arriba
      }
      return next;
    });
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8 md:flex-row md:items-start">
      {mostrarPanel && sidebarAbierto && (
        <aside className="flex w-full flex-col gap-4 md:w-[220px] md:flex-shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
            <ProgressDial value={totalDominadas} max={Math.max(1, totalTecnicas)} size={44} colorDesde={colorHex}>
              <span className="font-mono text-xs font-bold text-foreground">
                {totalTecnicas > 0 ? Math.round((totalDominadas / totalTecnicas) * 100) : 0}%
              </span>
            </ProgressDial>
            <div className="flex flex-1 items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{progresoLabel}</p>
                <p className="font-mono text-sm font-semibold text-foreground">{tecnicasTexto}</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="rounded-lg px-2 py-1 text-xs font-medium text-texto-secundario hover:bg-surface-2 hover:text-foreground"
                aria-label={t("ocultarTemas")}
              >
                {t("ocultarTemas")}
              </button>
            </div>
          </div>

          <AprenderSidebar colorHex={colorHex} unidades={unidadesSidebar} />
        </aside>
      )}

      {!mostrarPanel && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 md:hidden">
          <ProgressDial value={totalDominadas} max={Math.max(1, totalTecnicas)} size={44} colorDesde={colorHex}>
            <span className="font-mono text-xs font-bold text-foreground">
              {totalTecnicas > 0 ? Math.round((totalDominadas / totalTecnicas) * 100) : 0}%
            </span>
          </ProgressDial>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{progresoLabel}</p>
            <p className="font-mono text-sm font-semibold text-foreground">{tecnicasTexto}</p>
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            {!mostrarPanel && (
              <div className="mb-2 hidden items-center gap-3 md:flex">
                <ProgressDial value={totalDominadas} max={Math.max(1, totalTecnicas)} size={36} colorDesde={colorHex}>
                  <span className="font-mono text-[10px] font-bold text-foreground">
                    {totalTecnicas > 0 ? Math.round((totalDominadas / totalTecnicas) * 100) : 0}%
                  </span>
                </ProgressDial>
                <p className="font-mono text-xs font-semibold text-texto-secundario">{tecnicasTexto}</p>
              </div>
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
            <p className="mt-1 text-sm text-texto-secundario">{subtitulo}</p>
          </div>
          {mostrarPanel && !sidebarAbierto && (
            <button
              onClick={toggleSidebar}
              className="flex-shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-texto-secundario hover:bg-surface-2 hover:text-foreground"
            >
              {t("mostrarTemas")}
            </button>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
