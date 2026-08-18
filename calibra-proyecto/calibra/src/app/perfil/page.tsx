import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType, type Achievement, tierDeElo } from "@/types/database";
import { calcularRachaMaxima, calcularMejorPrecisionDiaria } from "@/lib/perfil/records";
import Header from "@/components/Header";
import LevelDial from "@/app/practica/LevelDial";
import NombreEditable from "./NombreEditable";
import SubirAvatar from "./SubirAvatar";
import BorrarCuenta from "./BorrarCuenta";
import ConvertirCuenta from "@/components/ConvertirCuenta";
import LogroMedalla from "@/components/LogroMedalla";

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
    { data: worldRows },
  ] = await Promise.all([
    supabase.from("profiles").select("created_at, elo_rating, marco_perfil, avatar_url").eq("id", user.id).single(),
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
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", user.id),
  ]);

  const nivelMundoDe = (world: string) => worldRows?.find((w) => w.world === world)?.nivel_mundo ?? 1;

  const rankingFila = (rankingRows as Array<{ posicion: number; total_jugadores: number }> | null)?.[0];
  const eloRating = profileFull?.elo_rating ?? 1200;
  const marcoPerfil = profileFull?.marco_perfil ?? "ninguno";
  const ESTILO_MARCO: Record<string, string> = {
    ninguno: "border-border",
    plata: "border-[#C0C5CE] shadow-[0_0_0_3px_rgba(192,197,206,0.25)]",
    oro: "border-[#FFC53D] shadow-[0_0_0_3px_rgba(255,197,61,0.25)]",
  };

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
          className={`flex flex-col gap-4 rounded-2xl border-2 bg-surface px-6 py-6 shadow-sm transition-colors ${ESTILO_MARCO[marcoPerfil] ?? ESTILO_MARCO.ninguno}`}
        >
          <SubirAvatar userId={user.id} nombre={profile.display_name} avatarUrlInicial={profileFull?.avatar_url ?? null} />
          <NombreEditable userId={user.id} nombreActual={profile.display_name} />
          <p className="text-sm text-texto-secundario">
            En Prodigia desde {formatearFecha(profileFull?.created_at ?? new Date().toISOString())}
          </p>
          <p className="font-mono text-lg font-bold text-foreground">
            {profile.puntos_total} <span className="text-sm font-normal text-texto-secundario">Puntos totales</span>
          </p>
          {rankingFila && (
            <p className="text-sm text-texto-secundario">
              Puesto <span className="font-mono font-semibold text-foreground">#{rankingFila.posicion}</span> de{" "}
              {rankingFila.total_jugadores} en el ranking general de Puntos
            </p>
          )}
        </section>

        {user.is_anonymous && <ConvertirCuenta />}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Rango de duelos</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{tierDeElo(eloRating)}</p>
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

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Logros</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {((achievements ?? []) as Achievement[]).map((a) => (
              <LogroMedalla
                key={a.slug}
                nombre={a.nombre}
                descripcion={a.descripcion}
                desbloqueado={idsDesbloqueados.has(a.id)}
              />
            ))}
          </div>
        </section>

        <BorrarCuenta />
      </div>
    </>
  );
}
