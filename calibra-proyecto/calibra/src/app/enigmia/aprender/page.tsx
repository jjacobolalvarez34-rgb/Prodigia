import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import { obtenerCaminoEnigmia } from "@/lib/enigmia/path";
import Header from "@/components/Header";
import ProgressDial from "@/components/ProgressDial";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderSidebar from "@/components/AprenderSidebar";

const COLOR = "#0E9F6E";

export default async function EnigmiaAprenderPage() {
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, "/enigmia/aprender");
  const unidades = await obtenerCaminoEnigmia(supabase, user.id);

  const totalDominadas = unidades.reduce((acc, u) => acc + u.nodos.filter((n) => n.estado === "completado").length, 0);
  const totalTecnicas = unidades.reduce((acc, u) => acc + u.nodos.length, 0);

  const unidadesGenericas: UnidadCaminoGenerico[] = unidades.map((u) => ({
    id: u.categoria,
    nombre: u.nombre,
    nodos: u.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-4 md:h-fit">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
            <ProgressDial value={totalDominadas} max={Math.max(1, totalTecnicas)} size={44} colorDesde={COLOR} colorHasta="#3FB88B">
              <span className="font-mono text-xs font-bold text-foreground">
                {totalTecnicas > 0 ? Math.round((totalDominadas / totalTecnicas) * 100) : 0}%
              </span>
            </ProgressDial>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Progreso</p>
              <p className="font-mono text-sm font-semibold text-foreground">{totalDominadas}/{totalTecnicas} técnicas</p>
            </div>
          </div>

          <AprenderSidebar
            colorHex={COLOR}
            unidades={unidades.map((u) => ({
              id: u.categoria,
              nombre: u.nombre,
              dominadas: u.nodos.filter((n) => n.estado === "completado").length,
              total: u.nodos.length,
            }))}
          />
        </aside>

        <main className="flex flex-col gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR }}>Enigmia</span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Aprender</h1>
          </div>
          <CaminoContinuo unidades={unidadesGenericas} basePath="/enigmia/aprender" colorHex={COLOR} />
        </main>
      </div>
    </>
  );
}
