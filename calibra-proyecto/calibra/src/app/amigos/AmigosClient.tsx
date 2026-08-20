"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import Boton from "@/components/Boton";
import type { UseAmigosReturn } from "@/app/social/useAmigos";
import RetarPicker, { nombreMundo, etiquetaOpcion } from "@/app/social/RetarPicker";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";

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
        <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
          Invitar a un amigo (sin cuenta todavía)
        </h2>
        <InvitarAmigoSinCuenta />
      </section>

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

      {!buscando && !error && consulta.trim().length >= 2 && resultados.length === 0 && (
        <p className="text-sm text-texto-secundario">No encontramos a nadie con ese nombre.</p>
      )}

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
                <div className="border-t border-border pt-2">
                  <RetarPicker onElegir={(mundo, opcion) => retar(a.friend_id, mundo, opcion)} />
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
// quien sea, ni siquiera hace falta que sea tu amigo.
//
// Generalizado a los 4 mundos (antes solo ofrecía las 4 operaciones de
// Numeria — "retar a un amigo" ya se había generalizado en una tanda
// anterior, pero este flujo de código es distinto, con su propia tabla
// duel_invites, y quedó afuera). Mismo RetarPicker que ya usa "retar a
// un amigo" más arriba en este archivo, para elegir ciudad primero y
// luego operación/continente/categoría/modo según corresponda.
function InvitarPorLink() {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<{ mundo: MundoDuelo; opcion: string } | null>(null);
  const [estado, setEstado] = useState<"idle" | "generando" | "esperando" | "error">("idle");
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const inviteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (estado !== "esperando" || !inviteIdRef.current || !seleccion) return;

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
            const operationType = seleccion.mundo === "numeria" ? (seleccion.opcion as ArithmeticProblemType) : null;
            router.push(hrefDuelo(seleccion.mundo, operationType, fila.duel_id, seleccion.opcion));
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
    if (!seleccion) return;
    setEstado("generando");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("crear_invitacion_duelo", {
      p_mundo: seleccion.mundo,
      p_operation_type: seleccion.mundo === "numeria" ? seleccion.opcion : null,
      p_sub_tipo: seleccion.mundo === "numeria" ? null : seleccion.opcion,
    });
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
          <p className="mt-1 text-xs text-texto-secundario">
            {seleccion ? `${nombreMundo(seleccion.mundo)} · ${etiquetaOpcion(seleccion.mundo, seleccion.opcion)}` : ""} · no hace falta que sea amigo
          </p>
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
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Elegí ciudad y modo</p>
        <RetarPicker onElegir={(mundo, opcion) => setSeleccion({ mundo, opcion })} />
        {seleccion && (
          <p className="text-xs text-texto-secundario">
            Elegido: <span className="font-medium text-foreground">{nombreMundo(seleccion.mundo)} · {etiquetaOpcion(seleccion.mundo, seleccion.opcion)}</span>
          </p>
        )}
      </div>
      <button
        onClick={generarLink}
        disabled={estado === "generando" || !seleccion}
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

// Sección 10.2: distinto de InvitarPorLink de arriba (que es para un
// duelo puntual, con o sin cuenta amiga) — esto es un link de
// referido personal para gente que TODAVÍA no tiene cuenta en
// Prodigia: si se registran entrando por acá, quedan conectados como
// amigos automáticamente (conectar_por_invitacion, disparada desde
// RegistroForm.tsx o /auth/callback según si hace falta confirmar el
// email). No usa una tabla de invitaciones aparte — el propio user_id
// (ya un uuid) es el código de referido, no hace falta generar nada.
function InvitarAmigoSinCuenta() {
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelado && user) setLink(`${window.location.origin}/registro?ref=${user.id}`);
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

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

  if (!link) return null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
      <p className="text-sm text-texto-secundario">
        Quien se registre entrando por este link queda agregado como tu amigo automáticamente, sin pedir
        ni aceptar solicitud.
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <span className="flex-1 truncate font-mono text-xs text-texto-secundario">{link}</span>
        <button onClick={copiar} className="shrink-0 rounded-lg bg-primario px-3 py-1.5 text-xs font-semibold text-white">
          {copiado ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
