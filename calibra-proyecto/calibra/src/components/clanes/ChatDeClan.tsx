"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import NombreConFuente from "@/components/NombreConFuente";
import ReportarBoton from "@/app/[locale]/perfil/[userId]/ReportarBoton";
import { IconResponder } from "@/components/icons";
import { useMensajesNoLeidos } from "@/lib/mensajes/MensajesNoLeidos";
import { recortar } from "@/lib/mensajes/util";
import type { FuenteNombre, AnimacionNombre } from "@/types/database";

interface Mensaje {
  id: string;
  autor_id: string;
  autor_nombre: string | null;
  autor_avatar_url: string | null;
  texto: string;
  created_at: string;
  autor_fuente_nombre?: FuenteNombre | null;
  autor_animacion_nombre?: AnimacionNombre | null;
  // Respuesta a otro mensaje del clan (migración 0224).
  responde_a?: string | null;
  responde_a_texto?: string | null;
  responde_a_autor_id?: string | null;
  responde_a_autor_nombre?: string | null;
}

interface Props {
  clanId: string;
  miUserId: string;
}

// Fase 4 ("Chat de clan"): único lugar de texto libre nuevo en la app
// además de problemas personalizados — mismas 3 redes de seguridad
// (ver 0092_chat_de_clan.sql): filtro de palabras server-side (rechazo
// ANTES de guardar, el mensaje mal escrito ni siquiera pisa la tabla),
// reportable por mensaje individual (ReportarBoton, mismo componente
// que ya usaba Feed/perfil), y límite de 20/minuto por usuario.
//
// Sin scroll infinito: mensajes_de_clan() siempre trae como mucho los
// últimos 100 — alcanza para esta primera versión, no hay paginación.
// Actualización en vivo por Broadcast (no Postgres Changes/CDC, mismo
// criterio que el resto del proyecto — useProgresoEnVivo.ts, etc.):
// quien manda un mensaje lo retransmite él mismo al canal del clan
// apenas el server confirma que pasó las 3 redes de seguridad. Quien
// no tiene el chat abierto en ese momento simplemente lo ve la
// próxima vez que entra (carga inicial, sin pérdida de datos).
export default function ChatDeClan({ clanId, miUserId }: Props) {
  const t = useTranslations("Clanes.chat");
  const locale = useLocale();
  const { marcarLeidoClan, avisarClan } = useMensajesNoLeidos();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respondiendoA, setRespondiendoA] = useState<Mensaje | null>(null);
  const [resaltado, setResaltado] = useState<string | null>(null);
  const cajaRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();

    async function cargarInicial() {
      setCargando(true);
      const { data } = await supabase.rpc("mensajes_de_clan", { p_clan_id: clanId, p_limite: 100 });
      if (cancelado) return;
      // La función devuelve más nuevo primero (para el "limit" real) —
      // acá se muestra en orden de lectura, más viejo arriba.
      setMensajes(((data as Mensaje[] | null) ?? []).slice().reverse());
      setCargando(false);
      marcarLeidoClan();
    }
    cargarInicial();

    const channel = supabase.channel(`clan-chat:${clanId}`);
    channelRef.current = channel;
    channel.on("broadcast", { event: "mensaje" }, ({ payload }) => {
      const m = payload as Mensaje;
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      // Está a la vista: no cuenta como no leído.
      marcarLeidoClan();
    });
    channel.subscribe();

    return () => {
      cancelado = true;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [clanId, marcarLeidoClan]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes.length]);

  async function enviar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const cita = respondiendoA;
    const { data, error: err } = await supabase.rpc("enviar_mensaje_clan", { p_texto: limpio, p_responde_a: cita?.id ?? null });
    setEnviando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setTexto("");
    setRespondiendoA(null);
    const fila = (data as { id: string; created_at: string }[] | null)?.[0];
    if (!fila) return;

    // Falta autor_nombre/avatar acá porque enviar_mensaje_clan() no los
    // devuelve (no hace falta pedirle a la función que resuelva el
    // propio perfil, ya lo tenemos localmente) — se completa con lo que
    // ya tiene esta pestaña de profiles, así que se ve bien de
    // inmediato en vez de esperar el próximo fetch.
    const nuevo: Mensaje = {
      id: fila.id,
      autor_id: miUserId,
      autor_nombre: null,
      autor_avatar_url: null,
      texto: limpio,
      created_at: fila.created_at,
      responde_a: cita?.id ?? null,
      responde_a_texto: cita ? cita.texto.slice(0, 140) : null,
      responde_a_autor_id: cita?.autor_id ?? null,
      responde_a_autor_nombre: cita?.autor_nombre ?? null,
    };
    setMensajes((prev) => [...prev, nuevo]);
    channelRef.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
    // Aviso a los demás miembros que no tienen el chat abierto.
    avisarClan(clanId, fila.id, limpio);
  }

  function irAlOriginal(id: string) {
    const el = document.getElementById(`clan-msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setResaltado(id);
    setTimeout(() => setResaltado((actual) => (actual === id ? null : actual)), 1600);
  }

  function nombreCita(m: Mensaje): string {
    if (m.responde_a_autor_id === miUserId) return t("tu");
    return m.responde_a_autor_nombre ?? t("jugador");
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-4">
      <h3 className="text-sm font-semibold text-foreground">{t("titulo")}</h3>

      <div className="flex max-h-72 flex-col gap-2.5 overflow-y-auto rounded-xl bg-background px-3 py-3">
        {cargando ? (
          <p className="text-center text-xs text-texto-secundario">{t("cargando")}</p>
        ) : mensajes.length === 0 ? (
          <p className="text-center text-xs text-texto-secundario">{t("vacio")}</p>
        ) : (
          mensajes.map((m) => (
            <div
              key={m.id}
              id={`clan-msg-${m.id}`}
              className={`group flex items-start gap-2 rounded-lg transition-colors ${resaltado === m.id ? "bg-primario/10" : ""}`}
            >
              <Avatar url={m.autor_avatar_url} nombre={m.autor_nombre} size={24} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {m.autor_id === miUserId ? (
                      t("tu")
                    ) : (
                      <NombreConFuente nombre={m.autor_nombre} fuente={m.autor_fuente_nombre} animacion={m.autor_animacion_nombre} />
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-texto-secundario">
                    {new Date(m.created_at).toLocaleTimeString(locale === "es" ? "es-AR" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {m.responde_a && (
                  <button
                    type="button"
                    onClick={() => irAlOriginal(m.responde_a as string)}
                    className="mb-1 block w-full rounded-lg border-l-4 border-primario bg-primario/10 px-2 py-1 text-left text-xs text-texto-secundario"
                  >
                    <span className="block truncate font-semibold text-foreground">{nombreCita(m)}</span>
                    <span className="line-clamp-2 break-words">
                      {m.responde_a_texto ? recortar(m.responde_a_texto, 90) : t("mensajeNoDisponible")}
                    </span>
                  </button>
                )}
                <p className="break-words text-sm text-foreground">{m.texto}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => {
                    setRespondiendoA(m);
                    cajaRef.current?.focus();
                  }}
                  aria-label={t("responder")}
                  title={t("responder")}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-texto-secundario hover:bg-surface-2 hover:text-foreground"
                >
                  <IconResponder className="h-3.5 w-3.5" />
                </button>
                {m.autor_id !== miUserId && <ReportarBoton mensajeId={m.id} />}
              </span>
            </div>
          ))
        )}
        <div ref={finRef} />
      </div>

      {respondiendoA && (
        <div className="flex items-start gap-2 rounded-xl border-l-4 border-primario bg-primario/10 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {t("respondiendoA", { nombre: respondiendoA.autor_id === miUserId ? t("tu") : respondiendoA.autor_nombre ?? t("jugador") })}
            </p>
            <p className="line-clamp-2 break-words text-texto-secundario">{recortar(respondiendoA.texto, 120)}</p>
          </div>
          <button
            type="button"
            onClick={() => setRespondiendoA(null)}
            aria-label={t("cancelarRespuesta")}
            className="shrink-0 text-base leading-none text-texto-secundario hover:text-foreground"
          >
            ×
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        className="flex items-center gap-2"
      >
        <input
          ref={cajaRef}
          value={texto}
          onKeyDown={(e) => {
            if (e.key === "Escape") setRespondiendoA(null);
          }}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario/50"
        />
        <button
          type="submit"
          disabled={enviando || texto.trim().length === 0}
          className="shrink-0 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {t("enviar")}
        </button>
      </form>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
