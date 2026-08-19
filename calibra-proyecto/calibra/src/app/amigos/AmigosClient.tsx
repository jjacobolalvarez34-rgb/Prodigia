"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";
import Boton from "@/components/Boton";
import type { UseAmigosReturn } from "@/app/social/useAmigos";

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

// Fase 3 del rediseño de Social: ya no maneja su propio estado — recibe
// todo de useAmigos() (llamado una sola vez en SocialClient) para que la
// pestaña "Amigos" y la barra lateral del Feed compartan exactamente la
// misma fuente de verdad, nunca dos copias que puedan desincronizarse.
interface Props {
  amigosState: UseAmigosReturn;
}

export default function AmigosClient({ amigosState }: Props) {
  const {
    consulta,
    setConsulta,
    resultados,
    buscando,
    solicitudes,
    amigos,
    enviadas,
    error,
    buscar,
    enviarSolicitud,
    responder,
    retar,
  } = amigosState;
  const [retandoA, setRetandoA] = useState<string | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Amigos</h2>
        <p className="mt-1 text-sm text-texto-secundario">Buscá gente, aceptá solicitudes y retalos a duelo.</p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Invitar por link</h2>
        <InvitarPorLink />
      </section>

      <form onSubmit={(e) => { e.preventDefault(); buscar(consulta); }} className="flex gap-2">
        <input
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-primario"
        />
        <Boton type="submit" disabled={consulta.trim().length < 2} cargando={buscando} className="px-4 py-2.5 text-sm">
          Buscar
        </Boton>
      </form>

      {resultados.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Resultados</h2>
          {resultados.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <span className="font-medium text-foreground">{r.display_name ?? "Jugador"}</span>
              <Boton onClick={() => enviarSolicitud(r.id)} disabled={enviadas.has(r.id)} className="px-3 py-1.5 text-sm">
                {enviadas.has(r.id) ? "Enviada" : "Enviar solicitud"}
              </Boton>
            </div>
          ))}
        </section>
      )}

      {solicitudes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Solicitudes pendientes</h2>
          {solicitudes.map((s) => (
            <div key={s.user_id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <span className="font-medium text-foreground">{s.display_name ?? "Jugador"}</span>
              <div className="flex gap-2">
                <Boton onClick={() => responder(s.user_id, true)} className="px-3 py-1.5 text-sm">
                  Aceptar
                </Boton>
                <Boton variante="secundario" onClick={() => responder(s.user_id, false)} className="px-3 py-1.5 text-sm">
                  Rechazar
                </Boton>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Tus amigos</h2>
        {amigos.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
            Todavía no tenés amigos agregados — buscalos arriba.
          </p>
        ) : (
          amigos.map((a) => (
            <div key={a.friend_id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/perfil/${a.friend_id}`} className="font-medium text-foreground hover:underline">
                    {a.display_name ?? "Jugador"}
                  </Link>
                  <span className="ml-2 font-mono text-xs text-texto-secundario">{a.elo_rating} ELO</span>
                </div>
                <Boton onClick={() => setRetandoA(retandoA === a.friend_id ? null : a.friend_id)} className="px-3 py-1.5 text-sm">
                  Retar a duelo
                </Boton>
              </div>
              {retandoA === a.friend_id && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-2">
                  {ARITHMETIC_PROBLEM_TYPES.map((op) => (
                    <button
                      key={op}
                      onClick={() => retar(a.friend_id, op)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-primario/40"
                    >
                      {NOMBRES_OPERACION[op]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

// Fase de pulido: vivía en Rankeds, pero retar por link no tiene nada
// que ver con el competitivo (ELO/matchmaking) — es un duelo casual con
// quien sea, ni siquiera hace falta que sea tu amigo. Movido tal cual,
// sin reescribir su lógica interna.
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
