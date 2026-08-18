import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";
import Header from "@/components/Header";
import BorrarGrupo from "./BorrarGrupo";

interface FilaResumen {
  user_id: string;
  display_name: string | null;
  puntos_total: number;
  precision_promedio: number | null;
  nivel_suma: number | null;
  nivel_resta: number | null;
  nivel_multiplicacion: number | null;
  nivel_division: number | null;
  ultima_actividad: string | null;
}

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

const COLOR_NIVEL: Record<ArithmeticProblemType, string> = {
  suma: "bg-primario",
  resta: "bg-correcto",
  multiplicacion: "bg-racha",
  division: "bg-logro",
};

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GrupoPage({ params }: Props) {
  const { groupId } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/profesor/${groupId}`);
  bloquearInvitado(user, "Grupos");

  const { data: grupo, error: grupoError } = await supabase
    .from("groups")
    .select("id, nombre, codigo_invitacion")
    .eq("id", groupId)
    .eq("profesor_id", user.id)
    .maybeSingle();

  // Antes esto trataba cualquier error de la consulta (RLS, red, etc.)
  // como "no existe" y mandaba un 404 silencioso — eso escondía el error
  // real. Ahora un error de verdad revienta (lo agarra error.tsx con el
  // mensaje), y el 404 queda solo para cuando el grupo genuinamente no
  // existe o no es tuyo.
  if (grupoError) {
    throw new Error(`No se pudo cargar el grupo: ${grupoError.message}`);
  }
  if (!grupo) {
    notFound();
  }

  const [{ data: resumen }, { data: dailyRows }] = await Promise.all([
    supabase.rpc("resumen_grupo", { p_group_id: groupId }),
    supabase.rpc("resumen_grupo_daily_progress", { p_group_id: groupId }),
  ]);

  const filas = (resumen ?? []) as FilaResumen[];
  const hoyIso = new Date().toISOString().slice(0, 10);

  const rachaPorAlumno = new Map<string, number>();
  for (const fila of filas) {
    const rowsAlumno = (dailyRows ?? []).filter((d: { user_id: string }) => d.user_id === fila.user_id);
    rachaPorAlumno.set(fila.user_id, calcularRachaDiaria(rowsAlumno, hoyIso));
  }

  // Operación más floja del grupo en promedio: la razón de ser de esta
  // vista, se destaca a propósito.
  const promedios = ARITHMETIC_PROBLEM_TYPES.map((tipo) => {
    const key = `nivel_${tipo}` as keyof FilaResumen;
    const valores = filas.map((f) => f[key] as number | null).filter((v): v is number => v !== null);
    const promedio = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    return { tipo, promedio };
  });
  const masFloja = promedios
    .filter((p) => p.promedio !== null)
    .sort((a, b) => (a.promedio ?? 0) - (b.promedio ?? 0))[0];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/social?tab=grupos" className="text-xs text-texto-secundario hover:underline">
              ← Grupos
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">{grupo.nombre}</h1>
            <p className="font-mono text-xs text-texto-secundario">Código: {grupo.codigo_invitacion}</p>
          </div>
          <BorrarGrupo groupId={grupo.id} nombreGrupo={grupo.nombre} />
        </div>

        {masFloja && (
          <div className="rounded-2xl bg-primario/10 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primario">Punto de atención</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">
              {NOMBRES_OPERACION[masFloja.tipo]} es la operación más floja del grupo
            </p>
            <p className="text-sm text-texto-secundario">
              Nivel promedio: {masFloja.promedio?.toFixed(1)} / 10 — vale la pena reforzarla en clase.
            </p>
          </div>
        )}

        {filas.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
            Todavía nadie se unió con el código de este grupo.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-texto-secundario">
                <tr>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">Racha</th>
                  <th className="px-4 py-3">Precisión</th>
                  <th className="px-4 py-3">Nivel por operación</th>
                  <th className="px-4 py-3">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.user_id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={`/profesor/${groupId}/${f.user_id}`}
                        className="font-medium text-foreground hover:text-primario hover:underline"
                      >
                        {f.display_name ?? "Jugador"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono">{rachaPorAlumno.get(f.user_id) ?? 0}d</td>
                    <td className="px-4 py-3 font-mono">
                      {f.precision_promedio !== null ? `${Math.round(f.precision_promedio * 100)}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {ARITHMETIC_PROBLEM_TYPES.map((tipo) => {
                          const key = `nivel_${tipo}` as keyof FilaResumen;
                          const nivel = (f[key] as number | null) ?? 0;
                          return (
                            <span
                              key={tipo}
                              title={`${NOMBRES_OPERACION[tipo]}: nivel ${nivel}`}
                              className={`h-2.5 w-2.5 rounded-full ${COLOR_NIVEL[tipo]}`}
                              style={{ opacity: 0.3 + (nivel / 10) * 0.7 }}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-texto-secundario">
                      {f.ultima_actividad ? new Date(f.ultima_actividad).toLocaleDateString("es-AR") : "Nunca"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
