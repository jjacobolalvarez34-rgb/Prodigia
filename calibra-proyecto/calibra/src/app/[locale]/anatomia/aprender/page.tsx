import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoAnatomia } from "@/lib/anatomia/path";
import Header from "@/components/Header";
import ProgressDial from "@/components/ProgressDial";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { COLOR_ANATOMIA } from "../colores";

export const metadata: Metadata = {
  title: "Aprender Anatomía",
  description: "Técnicas de memorización para huesos, músculos, órganos y sistema nervioso.",
};

export default async function AnatomiaAprenderPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/anatomia/aprender");
  bloquearInvitado(user, "Aprender");
  const nodos = await obtenerCaminoAnatomia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "anatomia",
      nombre: "Anatomía",
      descripcion: "Técnicas para memorizar términos anatómicos — no son cómputo, son asociaciones y patrones.",
      nodos: nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <ProgressDial value={totalDominadas} max={Math.max(1, nodos.length)} size={44} colorDesde={COLOR_ANATOMIA}>
            <span className="font-mono text-xs font-bold text-foreground">
              {nodos.length > 0 ? Math.round((totalDominadas / nodos.length) * 100) : 0}%
            </span>
          </ProgressDial>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Progreso</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {totalDominadas}/{nodos.length} técnicas
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_ANATOMIA }}>
            Anatomía
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Aprender</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Trucos para memorizar términos — no son cuentas, son formas de mirar y agrupar.
          </p>
        </div>

        <CaminoContinuo unidades={unidadesGenericas} basePath="/anatomia/aprender" colorHex={COLOR_ANATOMIA} />
      </div>
    </>
  );
}
