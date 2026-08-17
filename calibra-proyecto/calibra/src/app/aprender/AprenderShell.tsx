import type { TemaAprendible } from "@/lib/aprender/path";
import type { UnidadCamino } from "@/lib/aprender/path";
import ProgressDial from "@/components/ProgressDial";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderSidebar from "@/components/AprenderSidebar";

const COLOR = "#6C4CF1";

const DESCRIPCION_UNIDAD: Record<TemaAprendible, string> = {
  suma: "Sumá más rápido combinando números de formas más simples.",
  resta: "Restá con confianza, incluso cuando los números no cooperan.",
  multiplicacion: "Multiplicá de memoria con atajos que ahorran pasos.",
  division: "Dividí de cabeza reconociendo patrones antes de calcular.",
  fracciones: "Trabajá fracciones sin miedo: simplificar, comparar, sumar.",
  decimales: "Convertí, redondeá y calculá porcentajes sin perder pie.",
  potencias: "Potencias y raíces con atajos, sin fuerza bruta.",
  algebra: "Despejá x sin miedo: un paso a la vez, siempre verificable.",
};

interface Props {
  unidades: UnidadCamino[];
}

export default function AprenderShell({ unidades }: Props) {
  const totalDominadas = unidades.reduce(
    (acc, u) => acc + u.nodos.filter((n) => n.estado === "completado").length,
    0
  );
  const totalTecnicas = unidades.reduce((acc, u) => acc + u.nodos.length, 0);

  const unidadesGenericas: UnidadCaminoGenerico[] = unidades.map((u) => ({
    id: u.problemType,
    nombre: u.nombre,
    descripcion: DESCRIPCION_UNIDAD[u.problemType],
    nodos: u.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));

  return (
    <div className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4 md:h-fit">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <ProgressDial value={totalDominadas} max={Math.max(1, totalTecnicas)} size={44} colorDesde={COLOR}>
            <span className="font-mono text-xs font-bold text-foreground">
              {totalTecnicas > 0 ? Math.round((totalDominadas / totalTecnicas) * 100) : 0}%
            </span>
          </ProgressDial>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Progreso</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {totalDominadas}/{totalTecnicas} técnicas
            </p>
          </div>
        </div>

        <AprenderSidebar
          colorHex={COLOR}
          unidades={unidades.map((u) => ({
            id: u.problemType,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        />
      </aside>

      <main className="flex flex-col gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Aprender</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Un solo camino: andá desbloqueando técnicas en orden, o saltá a una unidad desde la izquierda.
          </p>
        </div>
        <CaminoContinuo unidades={unidadesGenericas} basePath="/aprender" colorHex={COLOR} />
      </main>
    </div>
  );
}
