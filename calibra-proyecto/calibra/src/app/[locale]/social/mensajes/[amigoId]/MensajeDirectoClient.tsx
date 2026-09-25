"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import ReportarBoton from "@/app/[locale]/perfil/[userId]/ReportarBoton";
import { IconResponder } from "@/components/icons";
import { useMensajesNoLeidos } from "@/lib/mensajes/MensajesNoLeidos";
import { recortar } from "@/lib/mensajes/util";

export interface MensajeDirecto {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  texto: string;
  leido: boolean;
  created_at: string;
  // Respuesta a otro mensaje de la conversación (migración 0224): el servidor
  // devuelve la cita ya resuelta; los mensajes que llegan en vivo la traen igual.
  responde_a?: string | null;
  responde_a_texto?: string | null;
  responde_a_remitente_id?: string | null;
}

interface Props {
  amigoId: string;
  miUserId: string;
  amigoNombre: string | null;
  amigoAvatarUrl: string | null;
  mensajesIniciales: MensajeDirecto[];
}

// Mensajería directa (0198_mensajes_directos.sql) — mismo patrón que
// ChatDeClan.tsx: mismas 3 redes de seguridad server-side (filtro de
// palabras, reportable por mensaje, límite de 20/minuto), mismo
// mecanismo de tiempo real (Broadcast, no Postgres Changes/CDC — quien
// manda retransmite él mismo al canal apenas el server confirma que
// pasó las redes de seguridad; quien no tiene el chat abierto lo ve la
// próxima vez que entra). Sin scroll infinito, mismo tope duro de 100
// mensajes que mi_conversacion() ya aplica del lado del servidor.
//
// El nombre del canal se arma ordenando los dos ids (en vez de usar
// "remitente:destinatario" tal cual) para que los dos participantes se
// suscriban SIEMPRE al mismo canal sin importar quién abrió el chat
// primero o quién le escribe a quién.
//
// Nuevo (2026-09-25): se puede RESPONDER a un mensaje concreto (botón de
// respuesta en cada burbuja; aparece la cita sobre el cuadro de texto y dentro
// de la respuesta enviada, y al tocar la cita se salta al mensaje original), y
// quien recibe sin tener el chat abierto recibe un aviso (MensajesNoLeidos).
function canalConversacion(a: string, b: string): string {
  return `dm:${[a, b].sort().join(":")}`;
}

export default function MensajeDirectoClient({ amigoId, miUserId, amigoNombre, amigoAvatarUrl, mensajesIniciales }: Props) {
  const t = useTranslations("Social.mensajes");
  const tSocial = useTranslations("Social");
  const locale = useLocale();
  const { marcarLeidoDirecto, avisarDirecto } = useMensajesNoLeidos();
  const [mensajes, setMensajes] = useState<MensajeDirecto[]>(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respondiendoA, setRespondiendoA] = useState<MensajeDirecto | null>(null);
  const [resaltado, setResaltado] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const cajaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  // Abrir la conversación ya la marcó como leída en el servidor (mi_conversacion).
  useEffect(() => {
    marcarLeidoDirecto(amigoId);
  }, [amigoId, marcarLeidoDirecto]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(canalConversacion(miUserId, amigoId));
    channelRef.current = channel;
    channel.on("broadcast", { event: "mensaje" }, ({ payload }) => {
      const m = payload as MensajeDirecto;
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });
    channel.subscribe();

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [amigoId, miUserId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes.length]);

  function nombreDe(remitenteId: string | null | undefined): string {
    if (remitenteId === miUserId) return t("tu");
    return amigoNombre ?? tSocial("jugador");
  }

  function irAlOriginal(id: string) {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setResaltado(id);
    setTimeout(() => setResaltado((actual) => (actual === id ? null : actual)), 1600);
  }

  function responder(m: MensajeDirecto) {
    setRespondiendoA(m);
    cajaRef.current?.focus();
  }

  async function enviar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const cita = respondiendoA;
    const { data, error: err } = await supabase.rpc("enviar_mensaje_directo", {
      p_destinatario_id: amigoId,
      p_texto: limpio,
      p_responde_a: cita?.id ?? null,
    });
    setEnviando(false);
    if (err) {
      // El RPC devuelve un mensaje de Postgres en español (ver
      // 0198_mensajes_directos.sql) — se mapea a texto i18n genérico
      // para los dos casos esperables (rate-limit y filtro de
      // palabras); cualquier otro error se muestra tal cual, mismo
      // criterio que ChatDeClan.tsx.
      if (err.message.includes("muy rápido")) {
        setError(t("errorRateLimit"));
      } else if (err.message.includes("término no permitido")) {
        setError(t("errorFiltro"));
      } else {
        setError(err.message || t("errorGenerico"));
      }
      return;
    }
    setTexto("");
    setRespondiendoA(null);
    const fila = (data as { id: string; created_at: string }[] | null)?.[0];
    if (!fila) return;

    const nuevo: MensajeDirecto = {
      id: fila.id,
      remitente_id: miUserId,
      destinatario_id: amigoId,
      texto: limpio,
      leido: false,
      created_at: fila.created_at,
      responde_a: cita?.id ?? null,
      responde_a_texto: cita ? cita.texto.slice(0, 140) : null,
      responde_a_remitente_id: cita?.remitente_id ?? null,
    };
    setMensajes((prev) => [...prev, nuevo]);
    channelRef.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
    // Aviso para quien no tiene este chat abierto (toast + contador de no leídos).
    avisarDirecto(amigoId, fila.id, limpio);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Avatar url={amigoAvatarUrl} nombre={amigoNombre} size={32} />
        <h1 className="truncate font-display text-base font-bold text-foreground">{amigoNombre ?? tSocial("jugador")}</h1>
      </div>

      <div className="flex min-h-[24rem] flex-1 flex-col gap-2.5 overflow-y-auto px-1 py-2">
        {mensajes.length === 0 ? (
          <p className="text-center text-xs text-texto-secundario">{t("vacio")}</p>
        ) : (
          mensajes.map((m) => {
            const esMio = m.remitente_id === miUserId;
            const acciones = (
              <span className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => responder(m)}
                  aria-label={t("responder")}
                  title={t("responder")}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-texto-secundario hover:bg-surface-2 hover:text-foreground"
                >
                  <IconResponder className="h-3.5 w-3.5" />
                </button>
                {!esMio && <ReportarBoton mensajeDirectoId={m.id} />}
              </span>
            );
            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                className={`group flex items-end gap-2 rounded-2xl transition-colors ${esMio ? "flex-row-reverse" : ""} ${
                  resaltado === m.id ? "bg-primario/10" : ""
                }`}
              >
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${esMio ? "bg-primario text-white" : "border border-border bg-background text-foreground"}`}>
                  {m.responde_a && (
                    <button
                      type="button"
                      onClick={() => irAlOriginal(m.responde_a as string)}
                      className={`mb-1.5 block w-full rounded-lg border-l-4 px-2 py-1 text-left text-xs ${
                        esMio ? "border-white/70 bg-white/15 text-white/90" : "border-primario bg-primario/10 text-texto-secundario"
                      }`}
                    >
                      <span className="block truncate font-semibold">{nombreDe(m.responde_a_remitente_id)}</span>
                      <span className="line-clamp-2 break-words">
                        {m.responde_a_texto ? recortar(m.responde_a_texto, 90) : t("mensajeNoDisponible")}
                      </span>
                    </button>
                  )}
                  <p className="break-words text-sm">{m.texto}</p>
                  <span className={`mt-0.5 block text-right font-mono text-[10px] ${esMio ? "text-white/70" : "text-texto-secundario"}`}>
                    {new Date(m.created_at).toLocaleTimeString(locale === "es" ? "es-AR" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {acciones}
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>

      {respondiendoA && (
        <div className="flex items-start gap-2 rounded-xl border-l-4 border-primario bg-primario/10 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{t("respondiendoA", { nombre: nombreDe(respondiendoA.remitente_id) })}</p>
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
        className="flex items-end gap-2"
      >
        <textarea
          ref={cajaRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
            if (e.key === "Escape") setRespondiendoA(null);
          }}
          maxLength={500}
          rows={1}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario/50"
        />
        <button
          type="submit"
          disabled={enviando || texto.trim().length === 0}
          className="shrink-0 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {t("enviar")}
        </button>
      </form>
      <p className="text-right text-[10px] text-texto-secundario">{texto.length}/500</p>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
