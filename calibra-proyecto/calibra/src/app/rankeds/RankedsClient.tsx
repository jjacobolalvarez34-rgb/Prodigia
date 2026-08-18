"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ARITHMETIC_PROBLEM_TYPES, tierDeElo, type ArithmeticProblemType } from "@/types/database";

type Tab = "competitivo" | "buscar" | "invitar";

interface FilaHistorial {
  duel_id: string;
  operation_type: ArithmeticProblemType;
  creado_at: string;
  rival_nombre: string | null;
  mi_puntaje: number;
  rival_puntaje: number;
  gane: boolean;
  empate: boolean;
}

interface FilaPendiente {
  duel_id: string;
  operation_type: ArithmeticProblemType;
  creado_at: string;
  retador_nombre: string | null;
  retador_elo: number;
}

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

const TABS: { id: Tab; nombre: string }[] = [
  { id: "competitivo", nombre: "Mi competitivo" },
  { id: "buscar", nombre: "Buscar partida" },
  { id: "invitar", nombre: "Invitar por link" },
];

interface Props {
  miElo: number;
  miUserId: string;
  historialInicial: FilaHistorial[];
  duelosPendientesIniciales: FilaPendiente[];
}

export default function RankedsClient({ miElo, miUserId, historialInicial, duelosPendientesIniciales }: Props) {
  const [tab, setTab] = useState<Tab>("competitivo");

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
        <MiCompetitivo miElo={miElo} historial={historialInicial} pendientes={duelosPendientesIniciales} />
      ) : tab === "buscar" ? (
        <BuscarPartida miElo={miElo} miUserId={miUserId} />
      ) : (
        <InvitarPorLink />
      )}
    </div>
  );
}

function DuelosPendientes({ pendientes }: { pendientes: FilaPendiente[] }) {
  if (pendientes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-primario/30 bg-primario/5 px-4 py-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-primario">
        {pendientes.length === 1 ? "Te retaron a un duelo" : `Te retaron a ${pendientes.length} duelos`}
      </h2>
      {pendientes.map((p) => (
        <Link
          key={p.duel_id}
          href={`/practica?operacion=${p.operation_type}&duelo=${p.duel_id}`}
          className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 transition-colors hover:border-primario/40"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {p.retador_nombre ?? "Alguien"} te retó a {NOMBRES_OPERACION[p.operation_type]}
            </span>
            <span className="text-xs text-texto-secundario">{tierDeElo(p.retador_elo)} · {p.retador_elo} ELO</span>
          </div>
          <span className="shrink-0 rounded-full bg-primario px-3 py-1.5 text-xs font-semibold text-white">Jugar</span>
        </Link>
      ))}
    </div>
  );
}

function MiCompetitivo({
  miElo,
  historial,
  pendientes,
}: {
  miElo: number;
  historial: FilaHistorial[];
  pendientes: FilaPendiente[];
}) {
  const jugados = historial.filter((h) => !h.empate).length;
  const victorias = historial.filter((h) => h.gane).length;
  const derrotas = jugados - victorias;
  const tasaVictorias = jugados > 0 ? Math.round((victorias / jugados) * 100) : null;

  return (
    <div className="flex flex-col gap-5">
      <DuelosPendientes pendientes={pendientes} />

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-primario/30 bg-primario/5 px-6 py-7 text-center">
        <span className="font-mono text-4xl font-bold text-primario">{miElo}</span>
        <span className="text-sm font-semibold text-foreground">{tierDeElo(miElo)}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Victorias" valor={String(victorias)} />
        <Stat label="Derrotas" valor={String(derrotas)} />
        <Stat label="Tasa de victoria" valor={tasaVictorias === null ? "—" : `${tasaVictorias}%`} />
      </div>

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
                </span>
                <span className="text-xs text-texto-secundario">
                  {NOMBRES_OPERACION[h.operation_type]} · {new Date(h.creado_at).toLocaleDateString("es-AR")}
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

function BuscarPartida({ miElo, miUserId }: { miElo: number; miUserId: string }) {
  const router = useRouter();
  const [operacion, setOperacion] = useState<ArithmeticProblemType>("suma");
  const [estado, setEstado] = useState<"idle" | "buscando" | "sin-rivales">("idle");
  const [segundos, setSegundos] = useState(0);
  const [rango, setRango] = useState(30);
  const cancelarRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelarRef.current = true;
    };
  }, []);

  async function poll(op: ArithmeticProblemType, inicioIso: string) {
    const supabase = createClient();
    while (!cancelarRef.current) {
      const { data, error } = await supabase.rpc("buscar_rival_duelo", { p_operation_type: op });
      if (cancelarRef.current) return;
      if (error) {
        setEstado("sin-rivales");
        return;
      }
      const fila = (data as { duel_id: string | null; encontrado: boolean; rango_actual: number; segundos_esperando: number }[])?.[0];
      if (fila?.encontrado && fila.duel_id) {
        router.push(`/practica?operacion=${op}&duelo=${fila.duel_id}`);
        return;
      }

      // buscar_rival_duelo solo le devuelve el duel_id a quien hizo LA
      // llamada que encontró rival — si fue el rival quien nos encontró
      // a nosotros (nuestra fila de la cola ya fue borrada), nunca nos
      // enteramos por esta respuesta. Se chequea acá directo si ya
      // quedamos como "retado" de un duelo nuevo desde que arrancamos a
      // buscar — más confiable que depender solo de la notificación en
      // vivo (esa además ya existe, ver NotificacionesDuelo).
      const { data: yaMatcheado } = await supabase
        .from("duels")
        .select("id")
        .eq("retado_id", miUserId)
        .eq("estado", "pendiente")
        .gte("creado_at", inicioIso)
        .limit(1);
      if (cancelarRef.current) return;
      if (yaMatcheado && yaMatcheado[0]) {
        router.push(`/practica?operacion=${op}&duelo=${yaMatcheado[0].id}`);
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
    poll(operacion, new Date().toISOString());
  }

  async function cancelarBusqueda() {
    cancelarRef.current = true;
    setEstado("idle");
    const supabase = createClient();
    await supabase.rpc("cancelar_busqueda_duelo");
  }

  if (estado === "buscando") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primario/30 bg-primario/5 px-6 py-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primario/30 border-t-primario" />
        <div>
          <p className="font-display text-lg font-bold text-foreground">Buscando rival…</p>
          <p className="mt-1 text-xs text-texto-secundario">
            {NOMBRES_OPERACION[operacion]} · {segundos}s · buscando rivales entre {miElo - rango}-{miElo + rango} ELO
          </p>
        </div>
        <button
          onClick={cancelarBusqueda}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-error/40 hover:text-error"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {estado === "sin-rivales" && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-texto-secundario">
          No hay contrincantes disponibles ahora mismo — probá de nuevo en un rato.
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Elegí la operación</p>
        <div className="flex flex-wrap gap-2">
          {ARITHMETIC_PROBLEM_TYPES.map((op) => (
            <button
              key={op}
              onClick={() => setOperacion(op)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                operacion === op ? "border-primario bg-primario/10 text-primario" : "border-border text-texto-secundario"
              }`}
            >
              {NOMBRES_OPERACION[op]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={iniciarBusqueda}
        className="w-full rounded-2xl px-6 py-5 font-display text-lg font-semibold text-white shadow-lg"
        style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
      >
        Buscar partida
      </button>
      <p className="text-center text-xs text-texto-secundario">Tu ELO: {miElo} · {tierDeElo(miElo)}</p>
    </div>
  );
}

function InvitarPorLink() {
  const router = useRouter();
  const [operacion, setOperacion] = useState<ArithmeticProblemType>("suma");
  const [estado, setEstado] = useState<"idle" | "generando" | "esperando" | "error">("idle");
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const inviteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (estado !== "esperando" || !inviteIdRef.current) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`invitacion:${inviteIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "duel_invites",
          filter: `id=eq.${inviteIdRef.current}`,
        },
        (payload) => {
          const fila = payload.new as { estado: string; duel_id: string | null };
          if (fila.estado === "usada" && fila.duel_id) {
            router.push(`/practica?operacion=${operacion}&duelo=${fila.duel_id}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  async function generarLink() {
    setEstado("generando");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("crear_invitacion_duelo", { p_operation_type: operacion });
    if (error || !data) {
      setEstado("error");
      return;
    }
    inviteIdRef.current = data as string;
    setLink(`${window.location.origin}/duelo/invitacion/${data}`);
    setEstado("esperando");
  }

  async function cancelar() {
    if (inviteIdRef.current) {
      const supabase = createClient();
      await supabase.rpc("cancelar_invitacion_duelo", { p_invite_id: inviteIdRef.current });
    }
    inviteIdRef.current = null;
    setLink(null);
    setEstado("idle");
  }

  async function copiar() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard puede fallar por permisos del navegador — el link ya
      // está visible en pantalla para copiar a mano igual.
    }
  }

  if (estado === "esperando" && link) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primario/30 bg-primario/5 px-6 py-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primario/30 border-t-primario" />
        <div>
          <p className="font-display text-lg font-bold text-foreground">Esperando a que se unan…</p>
          <p className="mt-1 text-xs text-texto-secundario">{NOMBRES_OPERACION[operacion]} · no hace falta que sea amigo</p>
        </div>
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-texto-secundario">{link}</span>
          <button onClick={copiar} className="shrink-0 rounded-lg bg-primario px-3 py-1.5 text-xs font-semibold text-white">
            {copiado ? "Copiado ✓" : "Copiar"}
          </button>
        </div>
        <button
          onClick={cancelar}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-error/40 hover:text-error"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {estado === "error" && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-texto-secundario">
          No pudimos generar el link. Probá de nuevo.
        </div>
      )}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Elegí la operación</p>
        <div className="flex flex-wrap gap-2">
          {ARITHMETIC_PROBLEM_TYPES.map((op) => (
            <button
              key={op}
              onClick={() => setOperacion(op)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                operacion === op ? "border-primario bg-primario/10 text-primario" : "border-border text-texto-secundario"
              }`}
            >
              {NOMBRES_OPERACION[op]}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={generarLink}
        disabled={estado === "generando"}
        className="w-full rounded-2xl px-6 py-5 font-display text-lg font-semibold text-white shadow-lg disabled:opacity-60"
        style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
      >
        {estado === "generando" ? "Generando…" : "Generar link de invitación"}
      </button>
      <p className="text-center text-xs text-texto-secundario">
        Compartiselo a quien quieras — no hace falta que sea tu amigo dentro de la app.
      </p>
    </div>
  );
}
