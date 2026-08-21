import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { ARITHMETIC_PROBLEM_TYPES, ESTILO_MARCO_PERFIL, type ArithmeticProblemType, type Achievement, type TituloUsuario } from "@/types/database";
import { calcularRachaMaxima, calcularMejorPrecisionDiaria } from "@/lib/perfil/records";
import Header from "@/components/Header";
import LevelDial from "@/app/practica/LevelDial";
import RangoBadge from "@/components/RangoBadge";
import NombreEditable from "./NombreEditable";
import SubirAvatar from "./SubirAvatar";
import BorrarCuenta from "./BorrarCuenta";
import ConvertirCuenta from "@/components/ConvertirCuenta";
import LogroMedalla from "@/components/LogroMedalla";
import TitulosSection from "./TitulosSection";
import EstandarteClan from "@/components/clanes/EstandarteClan";
import Link from "next/link";

const NOMBRE_MUNDO_AFINIDAD: Record<string, string> = {
  numeria: "Numeria",
  enigmia: "Enigmia",
  geografia: "Geografía",
  quimia: "Quimia",
};

interface FilaAfinidad {
  mundo: string;
  duelos_jugados: number;
  victorias: number;
  derrotas: number;
  empates: number;
  precision_promedio: number | null;
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/perfil");

  const [
    { data: profileFull },
    { data: skillRows },
    { data: dailyRows },
    { data: masRapida },
    { data: attemptsParaPrecision },
    { data: achievements },
    { data: userAchievements },
    { data: rankingRows },
    { count: numeriaTotal },
    { count: enigmiaTotal },
    { count: geografiaTotal },
    { count: quimiaTotal },
    { data: worldRows },
    { data: titulosRows },
    { data: afinidadRows },
    { data: leccionesRows },
    { data: miClanRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("created_at, elo_rating, marco_perfil, fuente_nombre, avatar_url, titulo_activo")
      .eq("id", user.id)
      .single(),
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id),
    supabase.from("daily_progress").select("fecha, meta_alcanzada, congelado").eq("user_id", user.id).limit(1000),
    supabase
      .from("attempts")
      .select("time_ms")
      .eq("user_id", user.id)
      .eq("correct", true)
      .order("time_ms", { ascending: true })
      .limit(1),
    supabase.from("attempts").select("created_at, correct").eq("user_id", user.id).limit(3000),
    supabase.from("achievements").select("id, slug, nombre, descripcion, categoria, criterio"),
    supabase.from("user_achievements").select("achievement_id, desbloqueado_at").eq("user_id", user.id),
    supabase.rpc("posicion_ranking_puntos"),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("problem_type", "geografia"),
    supabase.from("logic_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("problem_type", "geografia"),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["quimia_simbolos", "quimia_formulas", "quimia_tabla", "quimia_nomenclatura", "quimia_organica"]),
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", user.id),
    supabase.rpc("mis_titulos"),
    supabase.rpc("afinidad_por_mundo"),
    supabase.rpc("lecciones_completadas_por_mundo"),
    supabase.rpc("mi_clan"),
  ]);

  const miClan = (miClanRows as { clan_id: string; nombre: string; tag: string | null; color_estandarte: string; nivel_clan: number }[] | null)?.[0] ?? null;

  const nivelMundoDe = (world: string) => worldRows?.find((w) => w.world === world)?.nivel_mundo ?? 1;

  const rankingFila = (rankingRows as Array<{ posicion: number; total_jugadores: number }> | null)?.[0];
  const eloRating = profileFull?.elo_rating ?? 800;
  const marcoPerfil = profileFull?.marco_perfil ?? "ninguno";

  const nivelPorOperacion = Object.fromEntries(
    ARITHMETIC_PROBLEM_TYPES.map((tipo) => [
      tipo,
      skillRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1,
    ])
  ) as Record<ArithmeticProblemType, number>;

  const rachaMaxima = calcularRachaMaxima(dailyRows ?? []);
  const mejorTiempo = masRapida && masRapida.length > 0 ? masRapida[0].time_ms : null;
  const mejorPrecision = calcularMejorPrecisionDiaria(attemptsParaPrecision ?? []);

  const idsDesbloqueados = new Map((userAchievements ?? []).map((u) => [u.achievement_id, u.desbloqueado_at]));

  const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
    suma: "Suma",
    resta: "Resta",
    multiplicacion: "Multiplicación",
    division: "División",
  };

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <section
          className={`flex flex-col gap-4 rounded-2xl border-2 bg-surface px-6 py-6 shadow-sm transition-colors ${ESTILO_MARCO_PERFIL[marcoPerfil] ?? ESTILO_MARCO_PERFIL.ninguno}`}
        >
          <SubirAvatar userId={user.id} nombre={profile.display_name} avatarUrlInicial={profileFull?.avatar_url ?? null} />
          <NombreEditable nombreActual={profile.display_name} fuente={profileFull?.fuente_nombre ?? "default"} />
          {(titulosRows as TituloUsuario[] | null)?.find((t) => t.slug === profileFull?.titulo_activo) && (
            <span className="-mt-2 rounded-full bg-primario/10 px-3 py-1 text-xs font-semibold text-primario">
              {(titulosRows as TituloUsuario[]).find((t) => t.slug === profileFull?.titulo_activo)?.nombre}
            </span>
          )}
          <p className="text-sm text-texto-secundario">
            En Prodigia desde {formatearFecha(profileFull?.created_at ?? new Date().toISOString())}
          </p>
          <p className="font-mono text-lg font-bold text-foreground">
            {profile.puntos_total} <span className="text-sm font-normal text-texto-secundario">Chispas totales</span>
          </p>
          {rankingFila && (
            <p className="text-sm text-texto-secundario">
              Puesto <span className="font-mono font-semibold text-foreground">#{rankingFila.posicion}</span> de{" "}
              {rankingFila.total_jugadores} en el ranking general de Chispas
            </p>
          )}
          <Link
            href="/clanes"
            className="flex w-fit items-center gap-2 rounded-xl border border-border px-3 py-2 transition-colors hover:border-primario/40"
          >
            {miClan ? (
              <>
                <EstandarteClan color={miClan.color_estandarte} nivel={miClan.nivel_clan} size={28} />
                <span className="text-sm font-medium text-foreground">
                  {miClan.nombre} {miClan.tag && <span className="text-texto-secundario">[{miClan.tag}]</span>}
                </span>
              </>
            ) : (
              <span className="text-sm text-texto-secundario">Todavía no estás en ningún clan — buscá uno →</span>
            )}
          </Link>
        </section>

        {user.is_anonymous && <ConvertirCuenta />}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Rango de duelos</p>
            <p className="mt-1"><RangoBadge elo={eloRating} size="lg" /></p>
            <p className="text-xs text-texto-secundario">{eloRating} ELO</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Numeria</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{numeriaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">problemas resueltos · nivel de mundo {nivelMundoDe("numeria")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Enigmia</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{enigmiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">acertijos resueltos · nivel de mundo {nivelMundoDe("enigmia")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Geografía</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{geografiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">países acertados · nivel de mundo {nivelMundoDe("geografia")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Quimia</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{quimiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">problemas resueltos · nivel de mundo {nivelMundoDe("quimia")}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Nivel por operación</h2>
          <p className="-mt-2 mb-4 text-xs text-texto-secundario">
            Calibración específica por tema — distinta del nivel de mundo de arriba, que es un progreso más amplio.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {ARITHMETIC_PROBLEM_TYPES.map((tipo) => (
              <div key={tipo} className="flex flex-col items-center gap-2">
                <LevelDial nivel={nivelPorOperacion[tipo]} size={64} mostrarEtiqueta={false} />
                <span className="text-xs font-medium text-texto-secundario">{NOMBRES_OPERACION[tipo]}</span>
              </div>
            ))}
          </div>
        </section>

        {(leccionesRows as { mundo: string; completadas: number; total: number }[] | null) &&
          (leccionesRows as { mundo: string; completadas: number; total: number }[]).length > 0 && (
            <section>
              <h2 className="mb-1 font-display text-lg font-bold text-foreground">Aprender</h2>
              <p className="-mt-2 mb-4 text-xs text-texto-secundario">Lecciones completadas sobre el total de cada mundo.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(leccionesRows as { mundo: string; completadas: number; total: number }[]).map((fila) => (
                  <div key={fila.mundo} className="rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
                      {NOMBRE_MUNDO_AFINIDAD[fila.mundo] ?? fila.mundo}
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold text-foreground">
                      {fila.completadas}/{fila.total}
                    </p>
                    <p className="text-xs text-texto-secundario">lecciones</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Récords personales</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Respuesta más rápida</p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {mejorTiempo !== null ? `${(mejorTiempo / 1000).toFixed(2)}s` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Racha más larga</p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {rachaMaxima} {rachaMaxima === 1 ? "día" : "días"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Mejor precisión (un día)</p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {mejorPrecision !== null ? `${Math.round(mejorPrecision * 100)}%` : "—"}
              </p>
            </div>
          </div>
        </section>

        {(afinidadRows as FilaAfinidad[] | null) && (afinidadRows as FilaAfinidad[]).length > 0 && (
          <section>
            <h2 className="mb-1 font-display text-lg font-bold text-foreground">Afinidad por mundo</h2>
            <p className="-mt-2 mb-4 text-xs text-texto-secundario">
              Solo informativo — tu rango y el matchmaking son únicos y globales, esto no los afecta.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(afinidadRows as FilaAfinidad[]).map((fila) => (
                <div key={fila.mundo} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
                    {NOMBRE_MUNDO_AFINIDAD[fila.mundo] ?? fila.mundo}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-foreground">
                    {fila.victorias}-{fila.derrotas}
                    {fila.empates > 0 ? `-${fila.empates}` : ""}
                  </p>
                  <p className="text-xs text-texto-secundario">
                    {fila.duelos_jugados} {fila.duelos_jugados === 1 ? "duelo" : "duelos"}
                    {fila.precision_promedio !== null ? ` · ${fila.precision_promedio}% precisión` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <TitulosSection titulos={(titulosRows as TituloUsuario[]) ?? []} tituloActivo={profileFull?.titulo_activo ?? null} />

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Logros</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {((achievements ?? []) as Achievement[]).map((a) => (
              <LogroMedalla
                key={a.slug}
                nombre={a.nombre}
                descripcion={a.descripcion}
                desbloqueado={idsDesbloqueados.has(a.id)}
                displayName={profile.display_name}
              />
            ))}
          </div>
        </section>

        <BorrarCuenta />
      </div>
    </>
  );
}
