import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { calcularRachaMaxima } from "@/lib/perfil/records";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";

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

interface Props {
  params: Promise<{ groupId: string; studentId: string }>;
}

export default async function AlumnoDetallePage({ params }: Props) {
  const { groupId, studentId } = await params;
  const t = await getTranslations("Profesor");
  const locale = await getLocale();
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/profesor/${groupId}/${studentId}`);
  bloquearInvitado(user, t("guardLabel"));

  const [{ data: resumen }, { data: dailyRows }] = await Promise.all([
    supabase.rpc("resumen_grupo", { p_group_id: groupId }),
    supabase.rpc("resumen_grupo_daily_progress", { p_group_id: groupId }),
  ]);

  const fila = ((resumen ?? []) as FilaResumen[]).find((f) => f.user_id === studentId);
  if (!fila) {
    notFound();
  }

  const rowsAlumno = (dailyRows ?? []).filter((d: { user_id: string }) => d.user_id === studentId);
  const hoyIso = new Date().toISOString().slice(0, 10);
  const racha = calcularRachaDiaria(rowsAlumno, hoyIso);
  const rachaMaxima = calcularRachaMaxima(rowsAlumno);

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <Link href={`/profesor/${groupId}`} className="text-xs text-texto-secundario hover:underline">
            {t("alumno.volverAlGrupo")}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            {fila.display_name ?? t("jugador")}
          </h1>
          <p className="font-mono text-sm text-texto-secundario">
            {t("alumno.chispasTotales", { n: fila.puntos_total })}
          </p>
        </div>

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-texto-secundario">{t("alumno.rachaActual")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{t("valorDias", { n: racha })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-texto-secundario">{t("alumno.rachaMaxima")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{t("valorDias", { n: rachaMaxima })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-texto-secundario">{t("precision")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">
              {fila.precision_promedio !== null ? `${Math.round(fila.precision_promedio * 100)}%` : "—"}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t("nivelPorOperacion")}</h2>
          <div className="grid grid-cols-4 gap-3">
            {ARITHMETIC_PROBLEM_TYPES.map((tipo) => {
              const key = `nivel_${tipo}` as keyof FilaResumen;
              return (
                <div key={tipo} className="flex flex-col items-center gap-2">
                  <LevelDial nivel={(fila[key] as number | null) ?? 1} size={64} mostrarEtiqueta={false} />
                  <span className="text-xs font-medium text-texto-secundario">{t(`operaciones.${tipo}`)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-xs text-texto-secundario">
          {t("alumno.ultimaActividadEtiqueta")}{" "}
          {fila.ultima_actividad ? new Date(fila.ultima_actividad).toLocaleString(locale) : t("nunca")}
        </p>
      </div>
    </>
  );
}
