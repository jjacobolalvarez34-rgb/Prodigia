import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, requirePro, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";

interface FilaResumen {
  user_id: string;
  display_name: string | null;
}

interface FilaSubtemaGrupo {
  user_id: string;
  mundo: string;
  problem_type: string;
  intentos: number;
  correctos: number;
  precision_pct: number;
  estancado: boolean | null;
}

interface Props {
  params: Promise<{ groupId: string }>;
}

// Mismo helper que perfil/estadisticas/page.tsx (no exportado desde ahí,
// se duplica acá a propósito — es una función pura chiquita, no vale la
// pena crear un módulo compartido para una sola función de 6 líneas):
// no hay traducción por sub-tema exacto para los ~50 problem_type que
// existen entre los mundos, así que se "humaniza" el string crudo en
// vez de traducirlo.
function nombreSubtema(problemType: string, mundo: string): string {
  const sinPrefijo = problemType.startsWith(`${mundo}_`) ? problemType.slice(mundo.length + 1) : problemType;
  return sinPrefijo
    .split("_")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profesor.estadisticas");
  return { title: t("metadata.title"), description: t("metadata.description") };
}

// Fase D: segundo beneficio de Prodigia Pro con gate real, esta vez a
// nivel de grupo — mismo patrón que /perfil/estadisticas (requireUsuario
// + requirePro), extendido con el chequeo de pertenencia del grupo que
// ya usa [groupId]/page.tsx (un profesor Pro no puede ver el detalle de
// un grupo que no es suyo solo por tener el plan).
export default async function GrupoEstadisticasPage({ params }: Props) {
  const { groupId } = await params;
  const t = await getTranslations("Profesor.estadisticas");
  const tProfesor = await getTranslations("Profesor");
  const tPerfil = await getTranslations("Perfil");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/profesor/${groupId}/estadisticas`);
  bloquearInvitado(user, tProfesor("guardLabel"));
  requirePro(profile, `/profesor/${groupId}/estadisticas`);

  const { data: grupo, error: grupoError } = await supabase
    .from("groups")
    .select("id, nombre")
    .eq("id", groupId)
    .eq("profesor_id", user.id)
    .maybeSingle();

  // Mismo criterio que [groupId]/page.tsx: un error de verdad revienta
  // (error.tsx), el 404 queda solo para "no existe o no es tuyo".
  if (grupoError) {
    throw new Error(`No se pudo cargar el grupo: ${grupoError.message}`);
  }
  if (!grupo) {
    notFound();
  }

  const [{ data: resumen }, { data: subtemas }] = await Promise.all([
    supabase.rpc("resumen_grupo", { p_group_id: groupId }),
    supabase.rpc("estadisticas_pro_subtemas_grupo", { p_group_id: groupId }),
  ]);

  const filas = (resumen ?? []) as FilaResumen[];
  const filasSubtemas = (subtemas ?? []) as FilaSubtemaGrupo[];
  const nombrePorAlumno = new Map(filas.map((f) => [f.user_id, f.display_name]));

  // estadisticas_pro_subtemas_grupo ya viene ordenada por
  // (user_id, precision_pct asc) — el primer sub-tema de cada alumno ya
  // es el más flojo, no hace falta reordenar acá.
  const subtemasPorAlumno = new Map<string, FilaSubtemaGrupo[]>();
  for (const s of filasSubtemas) {
    if (!subtemasPorAlumno.has(s.user_id)) {
      subtemasPorAlumno.set(s.user_id, []);
    }
    subtemasPorAlumno.get(s.user_id)!.push(s);
  }
  const idsConDatos = [...subtemasPorAlumno.keys()];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <Link href={`/profesor/${groupId}`} className="text-xs text-texto-secundario hover:underline">
            ← {grupo.nombre}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>

        {idsConDatos.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-texto-secundario">
            {t("vacio")}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {idsConDatos.map((userId) => {
              const nombre = nombrePorAlumno.get(userId) ?? tProfesor("jugador");
              const subtemasAlumno = subtemasPorAlumno.get(userId) ?? [];
              return (
                <section key={userId} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
                  <Link
                    href={`/profesor/${groupId}/${userId}`}
                    className="font-display text-sm font-bold text-foreground hover:text-primario hover:underline"
                  >
                    {nombre}
                  </Link>
                  <div className="flex flex-col gap-2">
                    {subtemasAlumno.map((s) => (
                      <div
                        key={`${s.mundo}-${s.problem_type}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {tPerfil(`publico.nombreMundo.${s.mundo}`)} — {nombreSubtema(s.problem_type, s.mundo)}
                          </span>
                          <span className="text-xs text-texto-secundario">{t("intentosCantidad", { n: s.intentos })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.estancado === true && (
                            <span className="whitespace-nowrap rounded-full bg-error/10 px-2 py-0.5 text-xs font-semibold text-error">
                              🔻 {t("estancado")}
                            </span>
                          )}
                          <span className="font-mono text-sm font-bold text-foreground">
                            {Math.round(s.precision_pct * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
