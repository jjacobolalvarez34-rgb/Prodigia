"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { rangoDeElo, type ArithmeticProblemType } from "@/types/database";
import RangoBadge from "@/components/RangoBadge";
import GlareHover from "@/components/reactbits/GlareHover";
import BorderGlow from "@/components/reactbits/BorderGlow";
import Boton from "@/components/Boton";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";
import { useRetosPendientes, type RetoPendienteBase } from "@/app/[locale]/social/useRetosPendientes";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import RankingElo from "./RankingElo";

// Mismos hex que Header.tsx (colorDelMundo) y FondoCursorMundo.tsx — un
// solo lugar más al que sumar esta paleta si algún día cambia.
const COLOR_MUNDO: Record<MundoDuelo, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
  anatomia: "#8B2942",
  melodia: "#B8860B",
  quimia: "#C026D3",
};

type Tab = "competitivo" | "buscar" | "ranking";
type SeleccionMundo = MundoDuelo | "aleatorio";

interface FilaHistorial {
  duel_id: string;
  operation_type: ArithmeticProblemType | null;
  mundo: MundoDuelo;
  sub_tipo: string | null;
  modo: string;
  clasificatorio: boolean;
  creado_at: string;
  rival_nombre: string | null;
  rival_titulo_nombre: string | null;
  mi_puntaje: number;
  rival_puntaje: number;
  gane: boolean;
  empate: boolean;
  rival_es_bot: boolean;
}

interface StatsCasual {
  victorias: number;
  derrotas: number;
  empates: number;
}

type FilaPendiente = RetoPendienteBase;

const NOMBRE_MUNDO: Record<MundoDuelo, string> = {
  numeria: "Numeria",
  geografia: "Geografía",
  enigmia: "Enigmia",
  anatomia: "Anatomía",
  melodia: "Melodía",
  quimia: "Quimia",
};

interface Props {
  miElo: number;
  miTituloNombre: string | null;
  miUserId: string;
  historialInicial: FilaHistorial[];
  duelosPendientesIniciales: FilaPendiente[];
  statsCasualIniciales: StatsCasual;
  tabInicial?: Tab;
}

export default function RankedsClient({
  miElo,
  miTituloNombre,
  miUserId,
  historialInicial,
  duelosPendientesIniciales,
  statsCasualIniciales,
  tabInicial = "competitivo",
}: Props) {
  const t = useTranslations("Rankeds");
  const TABS: { id: Tab; nombre: string }[] = [
    { id: "competitivo", nombre: t("tabs.competitivo") },
    { id: "buscar", nombre: t("tabs.buscar") },
    { id: "ranking", nombre: t("tabs.ranking") },
  ];
  const [tab, setTab] = useState<Tab>(tabInicial);
  const [historial, setHistorial] = useState(historialInicial);
  const [pendientes, setPendientes] = useState(duelosPendientesIniciales);
  const [statsCasual, setStatsCasual] = useState(statsCasualIniciales);

  // Bug reportado: "Mi competitivo" no mostraba el duelo recién jugado.
  // Causa real: esta pantalla nunca se refresca sola — historialInicial
  // es una prop que solo se recalcula si Next vuelve a correr
  // rankeds/page.tsx en el servidor, y eso NO pasa siempre: en
  // particular, volver acá con el botón atrás del navegador después de
  // un duelo restaura la página desde el back/forward cache del propio
  // navegador (bfcache) tal cual estaba ANTES de jugar — Next no puede
  // evitar eso, es un comportamiento del navegador (ver evento
  // `pageshow`/`persisted`, no es específico de este proyecto). Se
  // refresca de las dos formas que cubren todos los caminos reales:
  // una vez al montar (por si el server component sirvió algo cacheado)
  // y de nuevo cada vez que el navegador restaura la página desde
  // bfcache — sin esto último, el botón atrás siempre mostraría datos
  // viejos sin importar qué tan fresco esté el fetch inicial.
  useEffect(() => {
    let cancelado = false;
    async function refrescarCompetitivo() {
      const supabase = createClient();
      const [{ data: hist }, { data: pend }, { data: stats }] = await Promise.all([
        supabase.rpc("mi_historial_duelos", { p_limite: 20 }),
        supabase.rpc("mis_duelos_pendientes"),
        supabase.rpc("mis_stats_casual"),
      ]);
      if (cancelado) return;
      if (hist) setHistorial(hist as FilaHistorial[]);
      if (pend) setPendientes(pend as FilaPendiente[]);
      const filaStats = (stats as StatsCasual[] | null)?.[0];
      if (filaStats) setStatsCasual(filaStats);
    }

    refrescarCompetitivo();

    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) refrescarCompetitivo();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelado = true;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <AvisoPrimeraVez avisoKey="rankeds-intro" texto={t("intro")}>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Rankeds</h1>
          <p className="mt-1 text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>
      </AvisoPrimeraVez>
      <div className="flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
            }`}
          >
            {t.nombre}
          </button>
        ))}
      </div>

      {tab === "competitivo" ? (
        <MiCompetitivo
          miElo={miElo}
          miTituloNombre={miTituloNombre}
          historial={historial}
          pendientes={pendientes}
          statsCasual={statsCasual}
        />
      ) : tab === "buscar" ? (
        <BuscarPartida miElo={miElo} miTituloNombre={miTituloNombre} miUserId={miUserId} />
      ) : (
        <RankingElo miUserId={miUserId} />
      )}
    </div>
  );
}

function DuelosPendientes({ pendientes: pendientesIniciales }: { pendientes: FilaPendiente[] }) {
  const t = useTranslations("Rankeds");
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  // Fase 4: mismo hook que la barra lateral de Social — cuenta
  // regresiva de 60s visible y auto-rechazo al llegar a 0, una sola
  // implementación para las dos pantallas donde se ven retos pendientes.
  const { retos: pendientes, rechazar } = useRetosPendientes(pendientesIniciales);

  if (pendientes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-primario/30 bg-primario/5 px-4 py-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-primario">
        {pendientes.length === 1 ? t("teRetaronAUno") : t("teRetaronAVarios", { n: pendientes.length })}
      </h2>
      {pendientes.map((p) => (
        <GlareHover
          key={p.duel_id}
          width="100%"
          height="auto"
          background="transparent"
          borderColor="transparent"
          borderRadius="0.75rem"
          glareColor={COLOR_MUNDO[p.mundo]}
          glareOpacity={0.3}
          className="w-full"
        >
          <div
            className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3"
            style={{ borderLeft: `3px solid ${COLOR_MUNDO[p.mundo]}` }}
          >
            <Link href={hrefDuelo(p.mundo, p.operation_type, p.duel_id)} className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {t("teRetoA", {
                  nombre: p.retador_nombre ?? t("alguien"),
                  que: p.mundo === "numeria" && p.operation_type ? tOperaciones(p.operation_type) : NOMBRE_MUNDO[p.mundo],
                })}
              </span>
              <div className="flex items-center gap-1.5">
                <RangoBadge elo={p.retador_elo} tituloNombre={p.retador_titulo_nombre} size="sm" mostrarElo className="text-xs" />
                {p.segundosRestantes !== null && (
                  <span className="font-mono text-[10px] text-texto-secundario">· {t("expiraEn", { n: p.segundosRestantes })}</span>
                )}
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => rechazar(p.duel_id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-texto-secundario transition-colors hover:border-error/40 hover:text-error"
              >
                {t("rechazar")}
              </button>
              <Link
                href={hrefDuelo(p.mundo, p.operation_type, p.duel_id)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: COLOR_MUNDO[p.mundo] }}
              >
                {t("jugar")}
              </Link>
            </div>
          </div>
        </GlareHover>
      ))}
    </div>
  );
}

function MiCompetitivo({
  miElo,
  miTituloNombre,
  historial,
  pendientes,
  statsCasual,
}: {
  miElo: number;
  miTituloNombre: string | null;
  historial: FilaHistorial[];
  pendientes: FilaPendiente[];
  statsCasual: StatsCasual;
}) {
  const t = useTranslations("Rankeds");
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const locale = useLocale();
  const jugados = historial.filter((h) => !h.empate).length;
  const victorias = historial.filter((h) => h.gane).length;
  const derrotas = jugados - victorias;
  const tasaVictorias = jugados > 0 ? Math.round((victorias / jugados) * 100) : null;
  const jugadosCasual = statsCasual.victorias + statsCasual.derrotas + statsCasual.empates;

  return (
    <div className="flex flex-col gap-5">
      <DuelosPendientes pendientes={pendientes} />

      <AvisoPrimeraVez avisoKey="rangos-intro" texto={t("rangosIntro")}>
        <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-primario/30 bg-primario/5 px-6 py-6 text-center">
          {/* Sección 8: insignia real del rango (antes solo texto + color) —
              los 6 estandartes vienen de public/rangos/<slug>.png, recortados
              del collage que diste, con el fondo negro convertido a
              transparente. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- tamaño intrínseco variable por rango, no vale la pena declarar 6 width/height distintos para next/image acá */}
          <img src={`/rangos/${rangoDeElo(miElo).slug}.png`} alt="" className="h-24 w-auto drop-shadow-lg" />
          <span className="font-mono text-4xl font-bold text-primario">{miElo}</span>
          <RangoBadge elo={miElo} tituloNombre={miTituloNombre} size="md" />
        </div>
      </AvisoPrimeraVez>

      <div className="grid grid-cols-3 gap-3">
        <Stat label={t("victorias")} valor={String(victorias)} />
        <Stat label={t("derrotas")} valor={String(derrotas)} />
        <Stat label={t("tasaDeVictoria")} valor={tasaVictorias === null ? "—" : `${tasaVictorias}%`} />
      </div>

      {/* Fase 2 (Casuales): separada a propósito del bloque de ELO/rango
          de arriba — es solo informativa, nunca genera rango propio. */}
      {jugadosCasual > 0 && (
        <p className="text-center text-xs text-texto-secundario">
          {t("casualPrefijo")} <span className="font-medium text-foreground">{t("victoriasAbrev", { n: statsCasual.victorias })}</span> -{" "}
          <span className="font-medium text-foreground">{t("derrotasAbrev", { n: statsCasual.derrotas })}</span>
          {statsCasual.empates > 0 && <> - {t("empatesAbrev", { n: statsCasual.empates })}</>}
          {" · "}{t("noAfectaTuRango")}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("historialDeDuelos")}</h2>
        {historial.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
            {t("todaviaNoJugaste")}
          </p>
        ) : (
          historial.map((h) => (
            <div
              key={h.duel_id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                h.empate
                  ? "border-border bg-surface"
                  : h.gane
                    ? "border-correcto/30 bg-correcto/5"
                    : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {t("resultadoVs", {
                    resultado: h.empate ? t("empate") : h.gane ? t("ganaste") : t("perdiste"),
                    rival: h.rival_nombre ?? t("jugador"),
                  })}
                  {!h.clasificatorio && (
                    <span className="ml-2 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
                      {t("casual")}
                    </span>
                  )}
                  {h.rival_es_bot && (
                    <span className="ml-2 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
                      {t("clanDeBots")}
                    </span>
                  )}
                </span>
                <span className="text-xs text-texto-secundario">
                  {h.mundo === "numeria" && h.operation_type ? tOperaciones(h.operation_type) : NOMBRE_MUNDO[h.mundo]}
                  {" · "}
                  {new Date(h.creado_at).toLocaleDateString(locale === "en" ? "en-US" : "es-AR")}
                </span>
              </div>
              <span className="font-mono text-xs text-texto-secundario">
                {h.mi_puntaje} - {h.rival_puntaje}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-surface px-3 py-3 text-center">
      <span className="font-mono text-lg font-bold text-foreground">{valor}</span>
      <span className="text-[11px] text-texto-secundario">{label}</span>
    </div>
  );
}

const POLL_MS = 2200;
const MAX_SEGUNDOS_BUSQUEDA = 60;

function BuscarPartida({
  miElo,
  miTituloNombre,
  miUserId,
}: {
  miElo: number;
  miTituloNombre: string | null;
  miUserId: string;
}) {
  const t = useTranslations("Rankeds");
  const router = useRouter();
  const MUNDOS_SELECCIONABLES: { id: SeleccionMundo; nombre: string; descripcion: string }[] = [
    { id: "numeria", nombre: "Numeria", descripcion: t("ciudades.numeria") },
    { id: "geografia", nombre: "Geografía", descripcion: t("ciudades.geografia") },
    { id: "enigmia", nombre: "Enigmia", descripcion: t("ciudades.enigmia") },
    { id: "quimia", nombre: "Quimia", descripcion: t("ciudades.quimia") },
    { id: "anatomia", nombre: "Anatomía", descripcion: t("ciudades.anatomia") },
    { id: "melodia", nombre: "Melodía", descripcion: t("ciudades.melodia") },
    { id: "aleatorio", nombre: t("todasLasCiudades"), descripcion: t("ciudades.aleatorio") },
  ];
  // Fase 7 (Rankeds: Platino+ solo "todas las ciudades"): desde Platino
  // (ELO >= 1300, ver RANGOS_ELO en types/database.ts) hacia arriba, la
  // clasificatoria ya no deja elegir una ciudad puntual — arranca
  // directo en "aleatorio" en vez de "numeria". Validado también
  // server-side en buscar_rival_duelo (0078), esto es solo la UI.
  const rangoAlto = miElo >= 1300;
  const [modoClasificacion, setModoClasificacion] = useState<"clasificatoria" | "casual">("clasificatoria");
  const [mundo, setMundo] = useState<SeleccionMundo>(rangoAlto ? "aleatorio" : "numeria");
  const [estado, setEstado] = useState<"idle" | "buscando" | "sin-rivales">("idle");
  const [segundos, setSegundos] = useState(0);
  const [rango, setRango] = useState(30);
  const cancelarRef = useRef(false);

  // Fase 2 (Casuales): "todas las ciudades" es inherentemente mejor-de-3
  // — Casual es siempre duelo simple, así que esa opción ni se ofrece
  // (mismo criterio que el guard del lado del servidor en
  // buscar_rival_duelo). Si estaba elegida y se pasa a Casual, cae a
  // Numeria en vez de dejar seleccionada una opción que ya no se ve.
  // En sentido inverso, si se pasa a clasificatoria con rango alto, cae
  // a "aleatorio" — la única opción que le queda disponible.
  function elegirModoClasificacion(v: "clasificatoria" | "casual") {
    setModoClasificacion(v);
    if (v === "casual" && mundo === "aleatorio") setMundo("numeria");
    if (v === "clasificatoria" && rangoAlto) setMundo("aleatorio");
  }

  const mundosDisponibles =
    modoClasificacion === "casual"
      ? MUNDOS_SELECCIONABLES.filter((m) => m.id !== "aleatorio")
      : rangoAlto
        ? MUNDOS_SELECCIONABLES.filter((m) => m.id === "aleatorio")
        : MUNDOS_SELECCIONABLES;

  // Fase de pulido: la ciudad elegida "transmuta" el acento de la
  // pantalla (mismo principio que ya se aplica en el resto de la app —
  // ver colorDelMundo en Header.tsx) — en "Todas las ciudades" se vuelve
  // al degradé genérico de marca.
  const colorMundo = mundo === "aleatorio" ? null : COLOR_MUNDO[mundo];

  // La verificación real de "el rival sigue ahí" es del lado del
  // servidor (last_seen_at en duel_queue, ver 0058_matchmaking_fantasma.sql)
  // — esto es solo para no dejar la fila esperando innecesariamente si el
  // usuario navega DENTRO de la app a mitad de búsqueda (cambia de pestaña
  // de Rankeds, va al perfil, etc.), donde sí hay chance de correr un
  // cleanup. Si cierra la pestaña entera esto no llega a dispararse, por
  // eso el fix real no depende de esto.
  useEffect(() => {
    const supabase = createClient();
    // Sin condición: si no había búsqueda activa, esto borra una fila
    // que no existe — no-op inofensivo. pagehide es el único evento que
    // llega a dispararse cuando se cierra la pestaña entera (ahí no hay
    // unmount de React que valga, el contexto de JS muere de una).
    function limpiarCola() {
      supabase.rpc("cancelar_busqueda_duelo");
    }
    window.addEventListener("pagehide", limpiarCola);
    return () => {
      cancelarRef.current = true;
      limpiarCola();
      window.removeEventListener("pagehide", limpiarCola);
    };
  }, []);

  function irAlDuelo(mundoEncontrado: MundoDuelo, duelId: string) {
    // La operación de Numeria ya no se elige a mano — sale sorteada del
    // lado del servidor al crear el duelo (ver buscar_rival_duelo) y
    // /practica la lee de ahí, no de la URL.
    router.push(hrefDuelo(mundoEncontrado, null, duelId));
  }

  async function poll(m: SeleccionMundo, ranked: boolean, inicioIso: string) {
    const supabase = createClient();
    while (!cancelarRef.current) {
      const { data, error } = await supabase.rpc("buscar_rival_duelo", {
        p_mundo: m,
        p_operation_type: null,
        p_ranked: ranked,
      });
      if (cancelarRef.current) return;
      if (error) {
        setEstado("sin-rivales");
        return;
      }
      const fila = (
        data as {
          duel_id: string | null;
          encontrado: boolean;
          rango_actual: number;
          segundos_esperando: number;
          mundo_encontrado: MundoDuelo | null;
        }[]
      )?.[0];
      if (fila?.encontrado && fila.duel_id && fila.mundo_encontrado) {
        irAlDuelo(fila.mundo_encontrado, fila.duel_id);
        return;
      }

      // buscar_rival_duelo solo le devuelve el duel_id a quien hizo LA
      // llamada que encontró rival — si fue el rival quien nos encontró
      // a nosotros (nuestra fila de la cola ya fue borrada), nunca nos
      // enteramos por esta respuesta. Se chequea acá directo si ya
      // quedamos como "retado" de un duelo nuevo desde que arrancamos a
      // buscar — más confiable que depender solo de la notificación en
      // vivo (esa además ya existe, ver NotificacionesDuelo). Para el
      // modo "aleatorio" esto siempre encuentra la RONDA 1 (ronda_numero
      // = 1), que es por donde arranca cualquiera de los dos lados.
      const { data: yaMatcheado } = await supabase
        .from("duels")
        .select("id, mundo")
        .eq("retado_id", miUserId)
        .eq("estado", "pendiente")
        .eq("ronda_numero", 1)
        .gte("creado_at", inicioIso)
        .limit(1);
      if (cancelarRef.current) return;
      if (yaMatcheado && yaMatcheado[0]) {
        irAlDuelo(yaMatcheado[0].mundo as MundoDuelo, yaMatcheado[0].id);
        return;
      }

      setSegundos(fila?.segundos_esperando ?? 0);
      setRango(fila?.rango_actual ?? 30);
      if ((fila?.segundos_esperando ?? 0) >= MAX_SEGUNDOS_BUSQUEDA) {
        await supabase.rpc("cancelar_busqueda_duelo");
        if (!cancelarRef.current) setEstado("sin-rivales");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  }

  function iniciarBusqueda() {
    cancelarRef.current = false;
    setSegundos(0);
    setRango(30);
    setEstado("buscando");
    poll(mundo, modoClasificacion === "clasificatoria", new Date().toISOString());
  }

  async function cancelarBusqueda() {
    cancelarRef.current = true;
    setEstado("idle");
    const supabase = createClient();
    await supabase.rpc("cancelar_busqueda_duelo");
  }

  const etiquetaBusqueda = MUNDOS_SELECCIONABLES.find((m) => m.id === mundo)?.nombre;

  if (estado === "buscando") {
    return (
      <BorderGlow
        backgroundColor="transparent"
        borderRadius={16}
        glowRadius={24}
        colors={colorMundo ? [colorMundo, "#A794FF", "#FFC53D"] : ["#6C4CF1", "#A794FF", "#FFC53D"]}
        glowColor="255 65% 68%"
        animated
      >
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: colorMundo ?? "var(--primario)", borderTopColor: "transparent" }}
          />
          <div>
            <p className="font-display text-lg font-bold text-foreground">{t("buscandoRival")}</p>
            <p className="mt-1 text-xs text-texto-secundario">
              {t("buscandoDetalle", { etiqueta: etiquetaBusqueda ?? "", segundos, min: miElo - rango, max: miElo + rango })}
            </p>
          </div>
          <button
            onClick={cancelarBusqueda}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-error/40 hover:text-error"
          >
            {t("cancelar")}
          </button>
        </div>
      </BorderGlow>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 self-center rounded-full border border-border bg-surface p-1 text-sm">
        <button
          onClick={() => elegirModoClasificacion("clasificatoria")}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
            modoClasificacion === "clasificatoria" ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
          }`}
        >
          {t("clasificatoria")}
        </button>
        <button
          onClick={() => elegirModoClasificacion("casual")}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
            modoClasificacion === "casual" ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
          }`}
        >
          {t("casual")}
        </button>
      </div>
      {modoClasificacion === "casual" && (
        <p className="text-center text-xs text-texto-secundario">{t("mismoMatchmaking")}</p>
      )}

      {estado === "sin-rivales" && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-texto-secundario">
          {t("noHayContrincantes")}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("elegiLaCiudad")}</p>
        <div className="grid grid-cols-2 gap-2">
          {mundosDisponibles.map((m) => {
            const activo = mundo === m.id;
            const color = m.id === "aleatorio" ? null : COLOR_MUNDO[m.id as MundoDuelo];
            return (
              <GlareHover
                key={m.id}
                width="100%"
                height="auto"
                background="transparent"
                borderColor="transparent"
                borderRadius="0.75rem"
                glareColor={color ?? "#6C4CF1"}
                glareOpacity={activo ? 0.35 : 0.15}
                className="w-full"
              >
                <button
                  type="button"
                  onClick={() => setMundo(m.id)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors"
                  style={{
                    borderColor: activo ? (color ?? "var(--primario)") : "var(--border)",
                    background: activo
                      ? color
                        ? `${color}1A`
                        : "color-mix(in oklab, var(--primario) 10%, transparent)"
                      : "transparent",
                  }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: activo ? (color ?? "var(--primario)") : "var(--foreground)" }}
                  >
                    {m.nombre}
                  </span>
                  <span className="text-[11px] text-texto-secundario">{m.descripcion}</span>
                </button>
              </GlareHover>
            );
          })}
        </div>
      </div>

      <Boton onClick={iniciarBusqueda} colorHex={colorMundo ?? undefined} destacado className="w-full py-5 text-lg">
        {t("tabs.buscar")}
      </Boton>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-texto-secundario">
        {t("tuElo", { elo: miElo })} · <RangoBadge elo={miElo} tituloNombre={miTituloNombre} size="sm" />
      </p>
    </div>
  );
}

