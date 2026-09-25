import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { ESTILO_MARCO_PERFIL, type Achievement, type TituloUsuario, type FondoPerfil } from "@/types/database";
import { calcularRachaMaxima, calcularMejorPrecisionDiaria } from "@/lib/perfil/records";
import Header from "@/components/Header";
import RangoBadge from "@/components/RangoBadge";
import BannerHabilidades from "@/components/BannerHabilidades";
import FondoPerfilCapa, { tieneFondoPerfil } from "@/components/FondoPerfilCapa";
import { MUNDOS_LANDING } from "@/lib/mundos";
import NombreEditable from "./NombreEditable";
import SubirAvatar from "./SubirAvatar";
import SubirFondoPerfil from "./SubirFondoPerfil";
import ColorNombrePicker from "./ColorNombrePicker";
import BorrarCuenta from "./BorrarCuenta";
import ConvertirCuenta from "@/components/ConvertirCuenta";
import LogroMedalla from "@/components/LogroMedalla";
import TitulosSection from "./TitulosSection";
import EstandarteClan from "@/components/clanes/EstandarteClan";
import { Link } from "@/i18n/navigation";

interface FilaAfinidad {
  mundo: string;
  duelos_jugados: number;
  victorias: number;
  derrotas: number;
  empates: number;
  precision_promedio: number | null;
}

function formatearFecha(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-AR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function PerfilPage() {
  const t = await getTranslations("Perfil");
  const tNumeriaTemas = await getTranslations("Numeria.temas");
  const tMundos = await getTranslations("Mundos.nombres");
  const locale = await getLocale();
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/perfil");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("perfil"));

  const NOMBRE_MUNDO_AFINIDAD: Record<string, string> = {
    numeria: tMundos("numeria"),
    enigmia: tMundos("enigmia"),
    geografia: tMundos("geografia"),
    quimia: tMundos("quimia"),
    anatomia: tMundos("anatomia"),
    melodia: tMundos("melodia"),
    trigonometria: tMundos("trigonometria"),
    historia: tMundos("historia"),
    calculia: tMundos("calculia"),
    circuitia: tMundos("circuitia"),
    estadistica: tMundos("estadistica"),
    naipia: tMundos("naipia"),
    codia: tMundos("codia"),
    geometria: tNumeriaTemas("geometria"),
    fracciones: tNumeriaTemas("fracciones"),
    decimales: tNumeriaTemas("decimales"),
    potencias: tNumeriaTemas("potencias"),
    algebra: tNumeriaTemas("algebra"),
  };

  const [
    { data: profileFull },
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
    { count: anatomiaTotal },
    { count: melodiaTotal },
    { count: trigonometriaTotal },
    { count: historiaTotal },
    { count: calculiaTotal },
    { count: circuitiaTotal },
    { count: estadisticaTotal },
    { count: naipiaTotal },
    { count: codiaTotal },
    { data: worldRows },
    { data: titulosRows },
    { data: afinidadRows },
    { data: leccionesRows },
    { data: miClanRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "created_at, elo_rating, marco_perfil, fuente_nombre, animacion_nombre, fondo_perfil, fondo_perfil_url, avatar_url, titulo_activo, nivel_cuenta, xp_historico_total, afinidad_banner, color_nombre, color_nombre_desbloqueado"
      )
      .eq("id", user.id)
      .single(),
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
    supabase.rpc("posicion_ranking_experiencia_historica"),
    // Bug de paridad (auditoría Fase 1, 2026-08-27): antes solo excluía
    // "geografia" — como "attempts" es una tabla compartida por varios
    // mundos con problem_type con prefijo (quimia_*, anatomia_*,
    // melodia_*), ese único .neq dejaba pasar esas filas y el contador
    // de Numeria quedaba inflado con intentos de otros mundos. Excluir
    // por prefijo (no por lista exacta) evita que vuelva a desalinearse
    // si se agrega un sub-tipo nuevo a algún mundo, como ya pasó con
    // Quimia (nomenclatura/organica quedaron afuera de otros 3 lugares).
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      // Geografía calibra por continente desde
      // 0207_geografia_niveles_por_continente.sql — el `.neq` exacto de
      // antes ya no alcanza (deja pasar "geografia_america" etc, igual
      // que le pasaba a Quimia con sus sub-tipos antes del fix de
      // 2026-08-27 documentado arriba); excluir por prefijo (sin guion
      // bajo, matchea el bare "geografia" histórico Y los 4 nuevos).
      .not("problem_type", "like", "geografia%")
      .not("problem_type", "like", "quimia_%")
      .not("problem_type", "like", "anatomia_%")
      .not("problem_type", "like", "melodia_%")
      .not("problem_type", "like", "trigonometria_%")
      .not("problem_type", "like", "historia_%")
      .not("problem_type", "like", "calculia_%")
      .not("problem_type", "like", "circuitia_%")
      .not("problem_type", "like", "estadistica_%")
      .not("problem_type", "like", "naipia_%")
      .not("problem_type", "like", "codia_%"),
    supabase.from("logic_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    // `like` (no `.in` con lista exacta) para sumar el histórico bare
    // "geografia" junto con los 4 sub-tipos nuevos por continente.
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).like("problem_type", "geografia%"),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["quimia_simbolos", "quimia_formulas", "quimia_tabla", "quimia_nomenclatura", "quimia_organica"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["anatomia_oseo", "anatomia_muscular", "anatomia_organos", "anatomia_nervioso"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["melodia_fundamentos", "melodia_lectura", "melodia_alteraciones", "melodia_escalas", "melodia_acordes", "melodia_oido_absoluto"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["trigonometria_razones", "trigonometria_circulo", "trigonometria_identidades", "trigonometria_leyes"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["historia_cronologia", "historia_personajes", "historia_causaefecto", "historia_fechas"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["calculia_derivadas", "calculia_integrales", "calculia_series", "calculia_multivariable"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["circuitia_serie", "circuitia_paralelo", "circuitia_mixto", "circuitia_cualitativo"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["estadistica_central", "estadistica_dispersion", "estadistica_probabilidad", "estadistica_datos", "estadistica_graficos"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["naipia_hilo", "naipia_ko", "naipia_hiopt2", "naipia_omega2", "naipia_verdadero"]),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("problem_type", ["codia_sintaxis", "codia_salida", "codia_error", "codia_estructuras"]),
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", user.id),
    supabase.rpc("mis_titulos"),
    supabase.rpc("afinidad_por_mundo"),
    supabase.rpc("lecciones_completadas_por_mundo"),
    supabase.rpc("mi_clan"),
  ]);

  const miClan = (miClanRows as { clan_id: string; nombre: string; tag: string | null; color_estandarte: string; nivel_clan: number }[] | null)?.[0] ?? null;

  // Fase 4 (nivel de cuenta): umbral del nivel actual y del siguiente,
  // para la barra de progreso — misma curva que acreditar_chispas usa
  // para decidir cuándo subes de nivel (xp_requerido_nivel_cuenta).
  const nivelCuenta = profileFull?.nivel_cuenta ?? 1;
  const xpHistorico = profileFull?.xp_historico_total ?? 0;
  const [{ data: xpNivelActual }, { data: xpNivelSiguiente }] = await Promise.all([
    supabase.rpc("xp_requerido_nivel_cuenta", { p_nivel: nivelCuenta }),
    supabase.rpc("xp_requerido_nivel_cuenta", { p_nivel: nivelCuenta + 1 }),
  ]);
  const umbralActual = (xpNivelActual as number | null) ?? 0;
  const umbralSiguiente = (xpNivelSiguiente as number | null) ?? umbralActual + 1;
  // Puede salir negativo (reportado en vivo, 2026-09-13: "Nivel 25,
  // -6475/1900 XP") y es correcto que se vea así, a pedido explícito:
  // la curva de niveles se recalibró en 0118_niveles_cuenta_recompensas.sql
  // (mucho más cara en niveles altos) SIN bajarle el nivel a nadie
  // (grandfathering, documentado ahí a propósito) — así que una cuenta
  // que llegó a nivel 25 con la curva VIEJA hoy puede tener menos
  // xp_historico_total que lo que xp_requerido_nivel_cuenta(25) exige
  // con la curva NUEVA. El número negativo es justamente cuánto XP de
  // esa "deuda" de recalibración falta cubrir todavía. La barra sí se
  // clampea a 0% (no puede tener ancho negativo).
  const xpEnNivelActual = xpHistorico - umbralActual;
  const progresoNivelPct = Math.min(
    100,
    Math.max(0, Math.round((xpEnNivelActual / Math.max(1, umbralSiguiente - umbralActual)) * 100))
  );

  const nivelMundoDe = (world: string) => worldRows?.find((w) => w.world === world)?.nivel_mundo ?? 1;

  const rankingFila = (rankingRows as Array<{ posicion: number; total_jugadores: number }> | null)?.[0];
  const eloRating = profileFull?.elo_rating ?? 800;
  const marcoPerfil = profileFull?.marco_perfil ?? "ninguno";
  const fondoPerfil = (profileFull?.fondo_perfil as FondoPerfil | undefined) ?? "ninguno";
  const fondoPerfilUrl = (profileFull?.fondo_perfil_url as string | null | undefined) ?? null;
  const claro = tieneFondoPerfil(fondoPerfil, fondoPerfilUrl);
  const claseTexto = claro ? "text-white" : "text-foreground";
  const claseTextoSec = claro ? "text-white/75" : "text-texto-secundario";
  const claseCaja = claro ? "border-white/30 bg-white/10" : "border-primario/30 bg-primario/5";

  // Rediseño del banner de afinidad (2026-09-13, a pedido del
  // propietario): antes dejaba escribir un "nivel" a mano sin sentido
  // (nadie valida que sea real) — ahora el nivel SIEMPRE se deriva de
  // world_progress (mismo helper nivelMundoDe que ya usan las tarjetas
  // de "Aprender" de abajo), nunca se guarda un número inventado.
  // También se acota a los 8 mundos reales (se sacan los "temas" de
  // Numeria — no tienen un nivel de 100 comparable, solo el nivel 1-10
  // de calibración, así que mostrarlos junto a un nivel_mundo real
  // habría sido engañoso).
  const nivelesMundoBanner = Object.fromEntries(MUNDOS_LANDING.map((m) => [m.slug, nivelMundoDe(m.slug)]));
  const refsBanner = ((profileFull?.afinidad_banner as { ref: string }[] | null) ?? []).map((i) => i.ref);

  // afinidad_por_mundo() (SQL) solo devuelve mundos con AL MENOS un duelo
  // completado — un mundo sin duelos simplemente no aparece en la fila.
  // Acá se completa con los 13 mundos de MUNDOS_LANDING que falten, en 0,
  // para que un mundo nuevo (o cualquiera sin duelos todavía) se vea
  // explícitamente "0 duelos" en vez de desaparecer de la lista, como si
  // no existiera. Orden: primero los que sí tienen duelos (más jugados
  // primero, ya vienen así de la RPC), después el resto en el orden de
  // MUNDOS_LANDING.
  const afinidadPorMundoMap = new Map(((afinidadRows as FilaAfinidad[] | null) ?? []).map((f) => [f.mundo, f]));
  const filasAfinidadCompletas: FilaAfinidad[] = [
    ...((afinidadRows as FilaAfinidad[] | null) ?? []),
    ...MUNDOS_LANDING.filter((m) => !afinidadPorMundoMap.has(m.slug)).map(
      (m): FilaAfinidad => ({ mundo: m.slug, duelos_jugados: 0, victorias: 0, derrotas: 0, empates: 0, precision_promedio: null })
    ),
  ];

  const rachaMaxima = calcularRachaMaxima(dailyRows ?? []);
  const mejorTiempo = masRapida && masRapida.length > 0 ? masRapida[0].time_ms : null;
  const mejorPrecision = calcularMejorPrecisionDiaria(attemptsParaPrecision ?? []);

  const idsDesbloqueados = new Map((userAchievements ?? []).map((u) => [u.achievement_id, u.desbloqueado_at]));

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <section
          className={`relative overflow-hidden rounded-2xl border-2 shadow-sm transition-colors ${claro ? "" : "bg-surface"} ${ESTILO_MARCO_PERFIL[marcoPerfil] ?? ESTILO_MARCO_PERFIL.ninguno}`}
        >
          <FondoPerfilCapa fondoPerfil={fondoPerfil} fondoPerfilUrl={fondoPerfilUrl} />
          {fondoPerfil === "personalizado" && !fondoPerfilUrl && (
            <div className="h-20 w-full border-b border-dashed border-border bg-surface-2" />
          )}
          <div className="relative flex flex-col gap-4 px-6 py-6">
          <SubirAvatar userId={user.id} nombre={profile.display_name} avatarUrlInicial={profileFull?.avatar_url ?? null} marco={marcoPerfil} />
          {fondoPerfil === "personalizado" && <SubirFondoPerfil userId={user.id} urlInicial={fondoPerfilUrl} />}
          <NombreEditable
            nombreActual={profile.display_name}
            fuente={profileFull?.fuente_nombre ?? "default"}
            animacion={profileFull?.animacion_nombre ?? "ninguna"}
            claro={claro}
            color={profileFull?.color_nombre ?? null}
          />
          {profileFull?.color_nombre_desbloqueado && (
            <ColorNombrePicker colorActual={profileFull?.color_nombre ?? null} claro={claro} />
          )}
          {(titulosRows as TituloUsuario[] | null)?.find((t) => t.slug === profileFull?.titulo_activo) && (
            <span className={`-mt-2 w-fit rounded-full px-3 py-1 text-xs font-semibold ${claro ? "bg-white/15 text-white" : "bg-primario/10 text-primario"}`}>
              {(titulosRows as TituloUsuario[]).find((t) => t.slug === profileFull?.titulo_activo)?.nombre}
            </span>
          )}
          <p className={`text-sm ${claseTextoSec}`}>
            {t("enProdigiaDesde", { fecha: formatearFecha(profileFull?.created_at ?? new Date().toISOString(), locale) })}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium uppercase tracking-wide ${claseTextoSec}`}>{t("rango")}</span>
            <RangoBadge elo={eloRating} size="md" mostrarElo />
          </div>
          <p className={`font-mono text-lg font-bold ${claseTexto}`}>
            {profile.puntos_total} <span className={`text-sm font-normal ${claseTextoSec}`}>{t("chispasTotales")}</span>
          </p>

          <div className={`rounded-xl border-2 px-4 py-3 ${claseCaja}`}>
            <div className="flex items-baseline justify-between gap-2">
              <p className={`font-display text-lg font-bold ${claseTexto}`}>{t("nivel", { n: nivelCuenta })}</p>
              <p className={`text-xs ${claseTextoSec}`}>
                {xpEnNivelActual}/{umbralSiguiente - umbralActual} XP
              </p>
            </div>
            <div className={`mt-2 h-2.5 w-full overflow-hidden rounded-full ${claro ? "bg-white/15" : "bg-primario/15"}`}>
              <div
                className={`h-full rounded-full transition-all ${claro ? "bg-white" : "bg-primario"}`}
                style={{ width: `${progresoNivelPct}%` }}
              />
            </div>
            <p className={`mt-1.5 text-xs ${claseTextoSec}`}>
              {t("xpHistoricaAcumulada", { xp: xpHistorico.toLocaleString(locale === "en" ? "en-US" : "es-AR") })}
            </p>
          </div>

          {rankingFila && (
            <p className={`text-sm ${claseTextoSec}`}>
              {t.rich("puestoDe", {
                posicion: rankingFila.posicion,
                total: rankingFila.total_jugadores,
                destacado: (chunks) => <span className={`font-mono font-semibold ${claseTexto}`}>{chunks}</span>,
              })}
            </p>
          )}
          {/* Antes era un link "fantasma" (borde + fondo casi transparente)
              que quedaba casi invisible, sobre todo con un fondo de perfil
              atrás — reportado en vivo (2026-09-15: "tiene un botón que
              casi no se ve"). Ahora es una píldora sólida, con el mismo
              contraste alto sin importar si hay fondo de perfil o no. */}
          <Link
            href={profile.plan === "pro" ? "/perfil/estadisticas" : "/pro"}
            className="flex w-fit items-center gap-2 rounded-xl bg-primario px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] transition-transform hover:-translate-y-0.5"
          >
            {profile.plan === "pro" ? `📊 ${t("verEstadisticasAvanzadas")}` : `✨ ${t("hazteProLink")}`}
          </Link>
          <Link
            href="/clanes"
            className={`flex w-fit items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${claro ? "border-white/25 hover:border-white/50" : "border-border hover:border-primario/40"}`}
          >
            {miClan ? (
              <>
                <EstandarteClan color={miClan.color_estandarte} nivel={miClan.nivel_clan} size={28} />
                <span className={`text-sm font-medium ${claseTexto}`}>
                  {miClan.nombre} {miClan.tag && <span className={claseTextoSec}>[{miClan.tag}]</span>}
                </span>
              </>
            ) : (
              <span className={`text-sm ${claseTextoSec}`}>{t("todaviaNoEstasEnClan")}</span>
            )}
          </Link>
          </div>
        </section>

        {user.is_anonymous && <ConvertirCuenta />}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("rangoDeDuelos")}</p>
            <p className="mt-1"><RangoBadge elo={eloRating} size="lg" /></p>
            <p className="text-xs text-texto-secundario">{eloRating} ELO</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("numeria")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{numeriaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("numeria") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("enigmia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{enigmiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("acertijosResueltosNivel", { n: nivelMundoDe("enigmia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("geografia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{geografiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("paisesAcertadosNivel", { n: nivelMundoDe("geografia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("quimia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{quimiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("quimia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("anatomia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{anatomiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("preguntasResueltasNivel", { n: nivelMundoDe("anatomia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("melodia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{melodiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("preguntasResueltasNivel", { n: nivelMundoDe("melodia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("trigonometria")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{trigonometriaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("trigonometria") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("historia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{historiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("historia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("calculia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{calculiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("calculia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("circuitia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{circuitiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("circuitia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("estadistica")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{estadisticaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("estadistica") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("naipia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{naipiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("naipia") })}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tMundos("codia")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{codiaTotal ?? 0}</p>
            <p className="text-xs text-texto-secundario">{t("problemasResueltosNivel", { n: nivelMundoDe("codia") })}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-1 font-display text-lg font-bold text-foreground">{t("banner.titulo")}</h2>
          <p className="-mt-2 mb-4 text-xs text-texto-secundario">{t("banner.descripcion")}</p>
          <BannerHabilidades refsIniciales={refsBanner} nivelesMundo={nivelesMundoBanner} />
        </section>

        {(leccionesRows as { mundo: string; completadas: number; total: number }[] | null) &&
          (leccionesRows as { mundo: string; completadas: number; total: number }[]).length > 0 && (
            <section>
              <h2 className="mb-1 font-display text-lg font-bold text-foreground">{t("aprender")}</h2>
              <p className="-mt-2 mb-4 text-xs text-texto-secundario">{t("leccionesCompletadasDescripcion")}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(leccionesRows as { mundo: string; completadas: number; total: number }[]).map((fila) => (
                  <div key={fila.mundo} className="rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
                      {NOMBRE_MUNDO_AFINIDAD[fila.mundo] ?? fila.mundo}
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold text-foreground">
                      {fila.completadas}/{fila.total}
                    </p>
                    <p className="text-xs text-texto-secundario">{t("lecciones")}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t("recordsPersonales")}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("respuestaMasRapida")}</p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {mejorTiempo !== null ? `${(mejorTiempo / 1000).toFixed(2)}s` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("rachaMasLarga")}</p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">{t("diasCantidad", { n: rachaMaxima })}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("mejorPrecisionUnDia")}</p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {mejorPrecision !== null ? `${Math.round(mejorPrecision * 100)}%` : "—"}
              </p>
            </div>
          </div>
        </section>

        {(afinidadRows as FilaAfinidad[] | null) && (afinidadRows as FilaAfinidad[]).length > 0 && (
          <section>
            <h2 className="mb-1 font-display text-lg font-bold text-foreground">{t("afinidadPorMundo")}</h2>
            <p className="-mt-2 mb-4 text-xs text-texto-secundario">{t("afinidadDescripcion")}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Bug real reportado por el usuario (2026-09-22): esta sección solo
                  listaba los mundos que YA tenían duelos jugados — un mundo nuevo
                  (o cualquiera sin duelos todavía) desaparecía en vez de mostrarse
                  en 0, dando la falsa impresión de que ni existía. Se completa acá
                  con los mundos de MUNDOS_LANDING que la RPC no devolvió, en 0. */}
              {filasAfinidadCompletas.map((fila) => (
                <div key={fila.mundo} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
                    {NOMBRE_MUNDO_AFINIDAD[fila.mundo] ?? fila.mundo}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-foreground">
                    {fila.victorias}-{fila.derrotas}
                    {fila.empates > 0 ? `-${fila.empates}` : ""}
                  </p>
                  <p className="text-xs text-texto-secundario">
                    {t("duelosCantidad", { n: fila.duelos_jugados })}
                    {fila.precision_promedio !== null ? ` · ${t("precisionPct", { n: fila.precision_promedio })}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <TitulosSection titulos={(titulosRows as TituloUsuario[]) ?? []} tituloActivo={profileFull?.titulo_activo ?? null} />

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t("logros")}</h2>
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
