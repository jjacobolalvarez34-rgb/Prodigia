"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { cursoDemo, GRUPO_DEMO } from "@/lib/docentes/demo";
import PanelCursoClient from "../../profesor/[groupId]/PanelCursoClient";

export default function DemoPanelClient({ conSesion }: { conSesion: boolean }) {
  const t = useTranslations("Docentes.v2.demo");
  const [datos] = useState(() => cursoDemo(Date.now()));
  const hrefPanel = conSesion ? "/profesor" : "/login?next=/profesor";

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-logro/30 bg-logro/10 print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {!conSesion && (
              <Link href="/conoce" aria-label="Prodigia">
                <Logo size={24} colorAro="#6C4CF1" />
              </Link>
            )}
            <p className="text-sm text-foreground">{t("aviso")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={hrefPanel} className="rounded-full bg-primario px-4 py-2 text-sm font-semibold text-white">
              {t("crear")}
            </Link>
            <Link href="/docentes#contacto" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
              {t("piloto")}
            </Link>
          </div>
        </div>
      </div>
      <PanelCursoClient grupo={GRUPO_DEMO} filas={datos.filas} tareas={datos.tareas} actividad={datos.actividad} licencia={null} faltaMigracion={false} demo />
    </div>
  );
}
