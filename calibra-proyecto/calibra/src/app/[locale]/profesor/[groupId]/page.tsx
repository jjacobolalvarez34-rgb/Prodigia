import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";
import { MUNDOS_LANDING } from "@/lib/mundos";
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

// Fase D: nivel_mundo (1-100, world_progress) por alumno y por mundo —
// gratis para cualquier profesor, ver resumen_grupo_mundos en
// 0169_profesor_estadisticas_pro_grupo.sql.
interface FilaMundo {
  user_id: string;
  mundo: string;
  nivel_mundo: number;
}

const COLOR_NIVEL: Record<ArithmeticProblemType, string> = {
  suma: "bg-primario",
  resta: "bg-correcto",
  multiplicacion: "bg-racha",
  division: "bg-logro",
};

// nivel_mundo es 1-100 (curva RPG, worldLevel.ts), a diferencia del
// nivel 1-10 de skill_levels usado arriba para las 4 operaciones — la
// opacidad se calcula sobre esa escala propia, no reutiliza /10.
const NIVEL_MUNDO_MAX = 100;

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GrupoPage({ params }: Props) {
  const { groupId } = await params;
  const t = await getTranslations("Profesor");
  const tPerfil = await getTranslations("Perfil");
  const locale = await getLocale();
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/profesor/${groupId}`);
  bloquearInvitado(user, t("guardLabel"));

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

  const [{ data: resumen }, { data: dailyRows }, { data: mundoRows }] = await Promise.all([
    supabase.rpc("resumen_grupo", { p_group_id: groupId }),
    supabase.rpc("resumen_grupo_daily_progress", { p_group_id: groupId }),
    supabase.rpc("resumen_grupo_mundos", { p_group_id: groupId }),
  ]);

  const filas = (resumen ?? []) as FilaResumen[];
  const filasMundo = (mundoRows ?? []) as FilaMundo[];
  const hoyIso = new Date().toISOString().slice(0, 10);

  // Nivel por mundo (Fase D, gratis): mapa user_id -> mundo -> nivel_mundo.
  // Un alumno sin fila para un mundo puntual (nunca lo jugó) cae al 0 del
  // lookup de abajo, mismo criterio que `?? 0` sobre nivel_suma/etc.
  const nivelMundoPorAlumno = new Map<string, Map<string, number>>();
  for (const fm of filasMundo) {
    if (!nivelMundoPorAlumno.has(fm.user_id)) {
      nivelMundoPorAlumno.set(fm.user_id, new Map());
    }
    nivelMundoPorAlumno.get(fm.user_id)!.set(fm.mundo, fm.nivel_mundo);
  }

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
            <Link href="/profesor" className="text-xs text-texto-secundario hover:underline">
              {t("grupo.volverAGrupos")}
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">{grupo.nombre}</h1>
            <p className="font-mono text-xs text-texto-secundario">
              {t("codigoEtiqueta", { codigo: grupo.codigo_invitacion })}
            </p>
          </div>
          <BorrarGrupo groupId={grupo.id} nombreGrupo={grupo.nombre} />
        </div>

        {/* Fase D: primer beneficio de Prodigia Pro a nivel de grupo,
            mismo criterio de link condicional por profile.plan que
            /perfil (perfil/page.tsx) y /tienda. */}
        {profile.plan === "pro" ? (
          <Link
            href={`/profesor/${groupId}/estadisticas`}
            className="flex w-fit items-center gap-2 rounded-xl bg-primario px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] transition-transform hover:-translate-y-0.5"
          >
            📊 {t("grupo.verDetalleSubtema")}
          </Link>
        ) : (
          <Link
            href={`/pro?next=${encodeURIComponent(`/profesor/${groupId}/estadisticas`)}`}
            className="flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-texto-secundario transition-colors hover:border-primario/40"
          >
            🔒 {t("grupo.verDetalleSubtemaBloqueado")}
          </Link>
        )}

        {masFloja && (
          <div className="rounded-2xl bg-primario/10 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primario">{t("grupo.puntoDeAtencion")}</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">
              {t("grupo.operacionMasFloja", { operacion: t(`operaciones.${masFloja.tipo}`) })}
            </p>
            <p className="text-sm text-texto-secundario">
              {t("grupo.nivelPromedioNota", { promedio: masFloja.promedio?.toFixed(1) ?? "" })}
            </p>
          </div>
        )}

        {filas.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
            {t("grupo.vacioGrupo")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-texto-secundario">
                <tr>
                  <th className="px-4 py-3">{t("grupo.columnaAlumno")}</th>
                  <th className="px-4 py-3">{t("grupo.columnaRacha")}</th>
                  <th className="px-4 py-3">{t("precision")}</th>
                  <th className="px-4 py-3">{t("nivelPorOperacion")}</th>
                  <th className="px-4 py-3">{t("grupo.columnaUltimaActividad")}</th>
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
                        {f.display_name ?? t("jugador")}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {t("valorDias", { n: rachaPorAlumno.get(f.user_id) ?? 0 })}
                    </td>
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
                              title={t("grupo.nivelTooltip", { operacion: t(`operaciones.${tipo}`), nivel })}
                              className={`h-2.5 w-2.5 rounded-full ${COLOR_NIVEL[tipo]}`}
                              style={{ opacity: 0.3 + (nivel / 10) * 0.7 }}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-texto-secundario">
                      {f.ultima_actividad ? new Date(f.ultima_actividad).toLocaleDateString(locale) : t("nunca")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fase D: gratis para cualquier profesor, no solo Pro — nivel
            1-100 (world_progress) por alumno y por mundo, los 10 mundos
            reales vía MUNDOS_LANDING. Mismo patrón visual (dot +
            opacidad por nivel) que la tabla de arriba, extendido de 4
            columnas fijas a 10 columnas dinámicas. */}
        {filas.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-bold text-foreground">{t("grupo.nivelPorMundoTitulo")}</h2>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wide text-texto-secundario">
                  <tr>
                    <th className="px-4 py-3">{t("grupo.columnaAlumno")}</th>
                    {MUNDOS_LANDING.map((m) => (
                      <th key={m.slug} className="px-2 py-3 text-center" title={tPerfil(`publico.nombreMundo.${m.slug}`)}>
                        {tPerfil(`publico.nombreMundo.${m.slug}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => {
                    const nivelesDeAlumno = nivelMundoPorAlumno.get(f.user_id);
                    return (
                      <tr key={f.user_id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <Link
                            href={`/profesor/${groupId}/${f.user_id}`}
                            className="font-medium text-foreground hover:text-primario hover:underline"
                          >
                            {f.display_name ?? t("jugador")}
                          </Link>
                        </td>
                        {MUNDOS_LANDING.map((m) => {
                          const nivel = nivelesDeAlumno?.get(m.slug) ?? 0;
                          return (
                            <td key={m.slug} className="px-2 py-3 text-center">
                              <span
                                title={t("grupo.nivelMundoTooltip", {
                                  mundo: tPerfil(`publico.nombreMundo.${m.slug}`),
                                  nivel,
                                })}
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: m.colorHex,
                                  opacity: nivel > 0 ? 0.3 + (Math.min(nivel, NIVEL_MUNDO_MAX) / NIVEL_MUNDO_MAX) * 0.7 : 0.12,
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
