"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import ReportarBoton from "@/app/[locale]/perfil/[userId]/ReportarBoton";

export interface MensajeDirecto {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  texto: string;
  leido: boolean;
  created_at: string;
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
function canalConversacion(a: string, b: string): string {
  return `dm:${[a, b].sort().join(":")}`;
}

export default function MensajeDirectoClient({ amigoId, miUserId, amigoNombre, amigoAvatarUrl, mensajesIniciales }: Props) {
  const t = useTranslations("Social.mensajes");
  const tSocial = useTranslations("Social");
  const locale = useLocale();
  const [mensajes, setMensajes] = useState<MensajeDirecto[]>(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

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

  async function enviar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("enviar_mensaje_directo", {
      p_destinatario_id: amigoId,
      p_texto: limpio,
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
    const fila = (data as { id: string; created_at: string }[] | null)?.[0];
    if (!fila) return;

    const nuevo: MensajeDirecto = {
      id: fila.id,
      remitente_id: miUserId,
      destinatario_id: amigoId,
      texto: limpio,
      leido: false,
      created_at: fila.created_at,
    };
    setMensajes((prev) => [...prev, nuevo]);
    channelRef.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
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
            return (
              <div key={m.id} className={`group flex items-end gap-2 ${esMio ? "flex-row-reverse" : ""}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${esMio ? "bg-primario text-white" : "border border-border bg-background text-foreground"}`}>
                  <p className="break-words text-sm">{m.texto}</p>
                  <span className={`mt-0.5 block text-right font-mono text-[10px] ${esMio ? "text-white/70" : "text-texto-secundario"}`}>
                    {new Date(m.created_at).toLocaleTimeString(locale === "es" ? "es-AR" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {!esMio && (
                  <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <ReportarBoton mensajeDirectoId={m.id} />
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
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
