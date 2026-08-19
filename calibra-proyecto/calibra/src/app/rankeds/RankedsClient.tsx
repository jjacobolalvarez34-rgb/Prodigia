"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import RangoBadge from "@/components/RangoBadge";
import GlareHover from "@/components/reactbits/GlareHover";
import BorderGlow from "@/components/reactbits/BorderGlow";
import Boton from "@/components/Boton";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";
import { useRetosPendientes, type RetoPendienteBase } from "@/app/social/useRetosPendientes";

// Mismos hex que Header.tsx (colorDelMundo) y FondoCursorMundo.tsx — un
// solo lugar más al que sumar esta paleta si algún día cambia.
const COLOR_MUNDO: Record<MundoDuelo, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
};

type Tab = "competitivo" | "buscar";
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
}

interface StatsCasual {
  victorias: number;
  derrotas: number;
  empates: number;
}

type FilaPendiente = RetoPendienteBase;

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

const NOMBRE_MUNDO: Record<MundoDuelo, string> = {
  numeria: "Numeria",
  geografia: "Geografía",
  enigmia: "Enigmia",
};

const TABS: { id: Tab; nombre: string }[] = [
  { id: "competitivo", nombre: "Mi competitivo" },
  { id: "buscar", nombre: "Buscar partida" },
];

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
  const [tab, setTab] = useState<Tab>(tabInicial);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Rankeds</h1>
        <p className="mt-1 text-sm text-texto-secundario">Tu competitivo de duelos, con matchmaking real.</p>
        <div className="mt-4 flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
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
      </div>

      {tab === "competitivo" ? (
        <MiCompetitivo
          miElo={miElo}
          miTituloNombre={miTituloNombre}
          historial={historialInicial}
          pendientes={duelosPendientesIniciales}
          statsCasual={statsCasualIniciales}
        />
      ) : (
        <BuscarPartida miElo={miElo} miTituloNombre={miTituloNombre} miUserId={miUserId} />
      )}
    </div>
  );
}

function DuelosPendientes({ pendientes: pendientesIniciales }: { pendientes: FilaPendiente[] }) {
  // Fase 4: mismo hook que la barra lateral de Social — cuenta
  // regresiva de 60s visible y auto-rechazo al llegar a 0, una sola
  // implementación para las dos pantallas donde se ven retos pendientes.
  const { retos: pendientes, rechazar } = useRetosPendientes(pendientesIniciales);

  if (pendientes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-primario/30 bg-primario/5 px-4 py-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-primario">
        {pendientes.length === 1 ? "Te retaron a un duelo" : `Te retaron a ${pendientes.length} duelos`}
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
                {p.retador_nombre ?? "Alguien"} te retó a{" "}
                {p.mundo === "numeria" && p.operation_type ? NOMBRES_OPERACION[p.operation_type] : NOMBRE_MUNDO[p.mundo]}
              </span>
              <div className="flex items-center gap-1.5">
                <RangoBadge elo={p.retador_elo} tituloNombre={p.retador_titulo_nombre} size="sm" mostrarElo className="text-xs" />
                {p.segundosRestantes !== null && (
                  <span className="font-mono text-[10px] text-texto-secundario">· expira en {p.segundosRestantes}s</span>
                )}
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => rechazar(p.duel_id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-texto-secundario transition-colors hover:border-error/40 hover:text-error"
              >
                Rechazar
              </button>
              <Link
                href={hrefDuelo(p.mundo, p.operation_type, p.duel_id)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: COLOR_MUNDO[p.mundo] }}
              >
                Jugar
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
  const jugados = historial.filter((h) => !h.empate).length;
  const victorias = historial.filter((h) => h.gane).length;
  const derrotas = jugados - victorias;
  const tasaVictorias = jugados > 0 ? Math.round((victorias / jugados) * 100) : null;
  const jugadosCasual = statsCasual.victorias + statsCasual.derrotas + statsCasual.empates;

  return (
    <div className="flex flex-col gap-5">
      <DuelosPendientes pendientes={pendientes} />

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-primario/30 bg-primario/5 px-6 py-7 text-center">
        <span className="font-mono text-4xl font-bold text-primario">{miElo}</span>
        <RangoBadge elo={miElo} tituloNombre={miTituloNombre} size="md" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Victorias" valor={String(victorias)} />
        <Stat label="Derrotas" valor={String(derrotas)} />
        <Stat label="Tasa de victoria" valor={tasaVictorias === null ? "—" : `${tasaVictorias}%`} />
      </div>

      {/* Fase 2 (Casuales): separada a propósito del bloque de ELO/rango
          de arriba — es solo informativa, nunca genera rango propio. */}
      {jugadosCasual > 0 && (
        <p className="text-center text-xs text-texto-secundario">
          Casual: <span className="font-medium text-foreground">{statsCasual.victorias}V</span> -{" "}
          <span className="font-medium text-foreground">{statsCasual.derrotas}D</span>
          {statsCasual.empates > 0 && <> - {statsCasual.empates}E</>}
          {" · no afecta tu rango"}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Historial de duelos</h2>
        {historial.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
            Todavía no jugaste ningún duelo — probá &quot;Buscar partida&quot;.
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
                  {h.empate ? "Empate" : h.gane ? "Ganaste" : "Perdiste"} vs. {h.rival_nombre ?? "Jugador"}
                  {!h.clasificatorio && (
                    <span className="ml-2 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
                      Casual
                    </span>
                  )}
                </span>
                <span className="text-xs text-texto-secundario">
                  {h.mundo === "numeria" && h.operation_type ? NOMBRES_OPERACION[h.operation_type] : NOMBRE_MUNDO[h.mundo]}
                  {" · "}
                  {new Date(h.creado_at).toLocaleDateString("es-AR")}
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

const MUNDOS_SELECCIONABLES: { id: SeleccionMundo; nombre: string; descripcion: string }[] = [
  { id: "numeria", nombre: "Numeria", descripcion: "Operación según tu rango" },
  { id: "geografia", nombre: "Geografía", descripcion: "Continente según tu rango" },
  { id: "enigmia", nombre: "Enigmia", descripcion: "Categoría según tu rango" },
  { id: "aleatorio", nombre: "Todas las ciudades", descripcion: "Mejor de 3, una ciudad por ronda" },
];

function BuscarPartida({
  miElo,
  miTituloNombre,
  miUserId,
}: {
  miElo: number;
  miTituloNombre: string | null;
  miUserId: string;
}) {
  const router = useRouter();
  const [modoClasificacion, setModoClasificacion] = useState<"clasificatoria" | "casual">("clasificatoria");
  const [mundo, setMundo] = useState<SeleccionMundo>("numeria");
  const [estado, setEstado] = useState<"idle" | "buscando" | "sin-rivales">("idle");
  const [segundos, setSegundos] = useState(0);
  const [rango, setRango] = useState(30);
  const cancelarRef = useRef(false);

  // Fase 2 (Casuales): "todas las ciudades" es inherentemente mejor-de-3
  // — Casual es siempre duelo simple, así que esa opción ni se ofrece
  // (mismo criterio que el guard del lado del servidor en
  // buscar_rival_duelo). Si estaba elegida y se pasa a Casual, cae a
  // Numeria en vez de dejar seleccionada una opción que ya no se ve.
  function elegirModoClasificacion(v: "clasificatoria" | "casual") {
    setModoClasificacion(v);
    if (v === "casual" && mundo === "aleatorio") setMundo("numeria");
  }

  const mundosDisponibles =
    modoClasificacion === "casual" ? MUNDOS_SELECCIONABLES.filter((m) => m.id !== "aleatorio") : MUNDOS_SELECCIONABLES;

  // Fase de pulido: la ciudad elegida "transmuta" el acento de la
  // pantalla (mismo principio que ya se aplica en el resto de la app —
  // ver colorDelMundo en Header.tsx) — en "Todas las ciudades" se vuelve
  // al degradé genérico de marca.
  const colorMundo = mundo === "aleatorio" ? null : COLOR_MUNDO[mundo];

  useEffect(() => {
    return () => {
      cancelarRef.current = true;
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
            <p className="font-display text-lg font-bold text-foreground">Buscando rival…</p>
            <p className="mt-1 text-xs text-texto-secundario">
              {etiquetaBusqueda} · {segundos}s · buscando rivales entre {miElo - rango}-{miElo + rango} ELO
            </p>
          </div>
          <button
            onClick={cancelarBusqueda}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-error/40 hover:text-error"
          >
            Cancelar
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
          Clasificatoria
        </button>
        <button
          onClick={() => elegirModoClasificacion("casual")}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
            modoClasificacion === "casual" ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
          }`}
        >
          Casual
        </button>
      </div>
      {modoClasificacion === "casual" && (
        <p className="text-center text-xs text-texto-secundario">
          Mismo matchmaking y mismo contenido según tu rango — no cambia tu ELO.
        </p>
      )}

      {estado === "sin-rivales" && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-texto-secundario">
          No hay contrincantes disponibles ahora mismo — probá de nuevo en un rato.
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Elegí la ciudad</p>
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
        Buscar partida
      </Boton>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-texto-secundario">
        Tu ELO: {miElo} · <RangoBadge elo={miElo} tituloNombre={miTituloNombre} size="sm" />
      </p>
    </div>
  );
}

