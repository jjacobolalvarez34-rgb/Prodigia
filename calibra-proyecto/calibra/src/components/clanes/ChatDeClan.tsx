"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import ReportarBoton from "@/app/[locale]/perfil/[userId]/ReportarBoton";

interface Mensaje {
  id: string;
  autor_id: string;
  autor_nombre: string | null;
  autor_avatar_url: string | null;
  texto: string;
  created_at: string;
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
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    }
    cargarInicial();

    const channel = supabase.channel(`clan-chat:${clanId}`);
    channelRef.current = channel;
    channel.on("broadcast", { event: "mensaje" }, ({ payload }) => {
      const m = payload as Mensaje;
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });
    channel.subscribe();

    return () => {
      cancelado = true;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [clanId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes.length]);

  async function enviar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("enviar_mensaje_clan", { p_texto: limpio });
    setEnviando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setTexto("");
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
    };
    setMensajes((prev) => [...prev, nuevo]);
    channelRef.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-4">
      <h3 className="text-sm font-semibold text-foreground">Chat del clan</h3>

      <div className="flex max-h-72 flex-col gap-2.5 overflow-y-auto rounded-xl bg-background px-3 py-3">
        {cargando ? (
          <p className="text-center text-xs text-texto-secundario">Cargando...</p>
        ) : mensajes.length === 0 ? (
          <p className="text-center text-xs text-texto-secundario">Todavía nadie escribió nada acá — arrancá vos.</p>
        ) : (
          mensajes.map((m) => (
            <div key={m.id} className="group flex items-start gap-2">
              <Avatar url={m.autor_avatar_url} nombre={m.autor_nombre} size={24} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {m.autor_id === miUserId ? "Vos" : (m.autor_nombre ?? "Jugador")}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-texto-secundario">
                    {new Date(m.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="break-words text-sm text-foreground">{m.texto}</p>
              </div>
              {m.autor_id !== miUserId && (
                <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <ReportarBoton mensajeId={m.id} />
                </span>
              )}
            </div>
          ))
        )}
        <div ref={finRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          placeholder="Escribí algo para tu clan..."
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario/50"
        />
        <button
          type="submit"
          disabled={enviando || texto.trim().length === 0}
          className="shrink-0 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
