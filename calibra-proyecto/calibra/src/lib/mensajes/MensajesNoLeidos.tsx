"use client";

// Avisos de mensajes nuevos (pedido 2026-09-25: "notificaciones cuando alguien
// manda un mensaje, sea en privado o en el clan").
//
// Un solo proveedor en el layout raíz (mismo criterio que NotificacionesDuelo):
//  - lleva la cuenta de no leídos (directos por conversación + chat de clan), que
//    leen la campanita de Social y las insignias del Header;
//  - se suscribe por Broadcast a un canal personal (mensajes directos) y al canal
//    del clan; quien manda retransmite el aviso apenas el servidor aceptó el
//    mensaje (ver `avisarDirecto` / `avisarClan`);
//  - muestra un aviso emergente con vista previa y un enlace, salvo que ya estés
//    mirando esa conversación (o el chat de tu clan): ahí el mensaje aparece en
//    el propio chat y solo se marca como leído.
//
// Los no leídos salen SIEMPRE del servidor (mis_conversaciones, clan_chat_resumen,
// migración 0224), así que sobreviven a recargar la página y a los mensajes que
// llegaron con la app cerrada; el Broadcast solo los hace aparecer al instante.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import {
  canalAvisosClan,
  canalAvisosDirectos,
  chatDeClanVisible,
  conversacionAbierta,
  recortar,
  type AvisoClan,
  type AvisoDirecto,
} from "./util";

export interface ConversacionNoLeida {
  amigoId: string;
  nombre: string | null;
  avatarUrl: string | null;
  ultimoTexto: string;
  noLeidos: number;
}

interface ClanNoLeido {
  id: string;
  nombre: string;
  noLeidos: number;
}

interface Aviso {
  id: string;
  href: string;
  titulo: string;
  cuerpo: string;
}

interface Valor {
  noLeidosDirectos: number;
  noLeidosClan: number;
  conversaciones: ConversacionNoLeida[];
  clanId: string | null;
  clanNombre: string | null;
  marcarLeidoDirecto: (amigoId: string) => void;
  marcarLeidoClan: () => void;
  // Tras enviar con éxito: avisa a la otra persona / a tu clan (el nombre y el avatar
  // salen del perfil propio que el proveedor ya cargó).
  avisarDirecto: (destinatarioId: string, mensajeId: string, texto: string) => void;
  avisarClan: (clanId: string, mensajeId: string, texto: string) => void;
}

// Sin proveedor (tests, páginas públicas) todo queda en cero y sin efectos.
const VALOR_VACIO: Valor = {
  noLeidosDirectos: 0,
  noLeidosClan: 0,
  conversaciones: [],
  clanId: null,
  clanNombre: null,
  marcarLeidoDirecto: () => {},
  marcarLeidoClan: () => {},
  avisarDirecto: () => {},
  avisarClan: () => {},
};

const Contexto = createContext<Valor>(VALOR_VACIO);

export function useMensajesNoLeidos(): Valor {
  return useContext(Contexto);
}

interface FilaConversacion {
  amigo_id: string;
  amigo_nombre: string | null;
  amigo_avatar_url: string | null;
  ultimo_texto: string;
  no_leidos: number | string;
}

interface FilaResumenClan {
  out_clan_id: string;
  out_clan_nombre: string;
  out_no_leidos: number | string;
}

const DURACION_AVISO_MS = 7_000;

export function MensajesNoLeidosProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Common.avisoMensaje");
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const userIdRef = useRef<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [conversaciones, setConversaciones] = useState<ConversacionNoLeida[]>([]);
  const [clan, setClan] = useState<ClanNoLeido | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [miPerfil, setMiPerfil] = useState<{ nombre: string | null; avatarUrl: string | null } | null>(null);
  const idAviso = useRef(0);
  const canalesSalida = useRef(new Map<string, RealtimeChannel>());
  // Canales por los que ESTA persona recibe avisos. El del clan también sirve para
  // mandar (mismo tema): abrir un segundo canal con el mismo nombre en el mismo
  // cliente choca con el primero.
  const canalesEntrada = useRef(new Map<string, RealtimeChannel>());

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // ---- sesión: solo cuentas reales (un invitado no tiene mensajes) ----
  useEffect(() => {
    let activo = true;
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!activo) return;
      const u = sesion?.user ?? null;
      const uid = u && !u.is_anonymous ? u.id : null;
      setUserId(uid);
      if (!uid) {
        // Cerró sesión (o es invitado): nada de la cuenta anterior debe quedar a la vista.
        setConversaciones([]);
        setClan(null);
        setMiPerfil(null);
      }
    });
    return () => {
      activo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // ---- carga desde el servidor ----
  const cargar = useCallback(async () => {
    const supabase = createClient();
    const [{ data: filas }, { data: resumen }] = await Promise.all([
      supabase.rpc("mis_conversaciones"),
      supabase.rpc("clan_chat_resumen"),
    ]);
    if (userIdRef.current) {
      const { data: perfil } = await supabase.rpc("obtener_perfil_publico", { p_user_id: userIdRef.current });
      const fila = (perfil as { display_name: string | null; avatar_url: string | null }[] | null)?.[0];
      if (fila) setMiPerfil({ nombre: fila.display_name, avatarUrl: fila.avatar_url });
    }
    setConversaciones(
      ((filas as FilaConversacion[] | null) ?? [])
        .filter((f) => Number(f.no_leidos) > 0)
        .map((f) => ({
          amigoId: f.amigo_id,
          nombre: f.amigo_nombre,
          avatarUrl: f.amigo_avatar_url,
          ultimoTexto: f.ultimo_texto,
          noLeidos: Number(f.no_leidos),
        }))
    );
    const r = (resumen as FilaResumenClan[] | null)?.[0];
    setClan(r ? { id: r.out_clan_id, nombre: r.out_clan_nombre, noLeidos: Number(r.out_no_leidos) } : null);
  }, []);

  useEffect(() => {
    userIdRef.current = userId;
    if (!userId) return;
    cargar();
    // Al volver a la pestaña se refresca (mensajes que llegaron mientras estaba
    // en segundo plano o con otra pestaña).
    function alVolver() {
      if (document.visibilityState === "visible") cargar();
    }
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("focus", alVolver);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("focus", alVolver);
    };
  }, [userId, cargar]);

  // ---- aviso emergente ----
  const mostrarAviso = useCallback((aviso: Omit<Aviso, "id">) => {
    const id = `av-${idAviso.current++}`;
    reproducirTono("notificacion");
    setAvisos((prev) => [...prev.slice(-2), { ...aviso, id }]);
    setTimeout(() => setAvisos((prev) => prev.filter((a) => a.id !== id)), DURACION_AVISO_MS);
  }, []);

  // ---- entrada: directos ----
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const entrada = canalesEntrada.current;
    const nombreCanal = canalAvisosDirectos(userId);
    const canal = supabase.channel(nombreCanal);
    entrada.set(nombreCanal, canal);
    canal.on("broadcast", { event: "dm" }, ({ payload }) => {
      const a = payload as AvisoDirecto;
      if (!a || a.deId === userId) return;
      if (conversacionAbierta(pathnameRef.current, a.deId)) {
        // Ya la estás mirando: el mensaje llega por el propio chat; solo se marca leída.
        supabase.rpc("marcar_conversacion_leida", { p_amigo_id: a.deId });
        return;
      }
      setConversaciones((prev) => {
        const existente = prev.find((c) => c.amigoId === a.deId);
        const nueva: ConversacionNoLeida = {
          amigoId: a.deId,
          nombre: a.deNombre ?? existente?.nombre ?? null,
          avatarUrl: a.deAvatarUrl ?? existente?.avatarUrl ?? null,
          ultimoTexto: a.texto,
          noLeidos: (existente?.noLeidos ?? 0) + 1,
        };
        return [nueva, ...prev.filter((c) => c.amigoId !== a.deId)];
      });
      mostrarAviso({
        href: `/social/mensajes/${a.deId}`,
        titulo: t("directo", { nombre: a.deNombre ?? t("alguien") }),
        cuerpo: recortar(a.texto),
      });
    });
    canal.subscribe();
    return () => {
      entrada.delete(nombreCanal);
      supabase.removeChannel(canal);
    };
  }, [userId, mostrarAviso, t]);

  // ---- entrada: clan ----
  const clanId = clan?.id ?? null;
  const clanNombre = clan?.nombre ?? null;
  useEffect(() => {
    if (!userId || !clanId) return;
    const supabase = createClient();
    const entrada = canalesEntrada.current;
    const nombreCanal = canalAvisosClan(clanId);
    const canal = supabase.channel(nombreCanal);
    entrada.set(nombreCanal, canal);
    canal.on("broadcast", { event: "clan" }, ({ payload }) => {
      const a = payload as AvisoClan;
      if (!a || a.autorId === userId) return;
      if (chatDeClanVisible(pathnameRef.current)) {
        supabase.rpc("marcar_chat_clan_leido");
        return;
      }
      setClan((prev) => (prev && prev.id === clanId ? { ...prev, noLeidos: prev.noLeidos + 1 } : prev));
      mostrarAviso({
        href: "/clanes",
        titulo: t("clan", { nombre: a.autorNombre ?? t("alguien"), clan: clanNombre ?? "" }),
        cuerpo: recortar(a.texto),
      });
    });
    canal.subscribe();
    return () => {
      entrada.delete(nombreCanal);
      supabase.removeChannel(canal);
    };
  }, [userId, clanId, clanNombre, mostrarAviso, t]);

  // ---- acciones ----
  const marcarLeidoDirecto = useCallback((amigoId: string) => {
    // El servidor ya marca como leído al abrir la conversación (mi_conversacion).
    setConversaciones((prev) => prev.filter((c) => c.amigoId !== amigoId));
  }, []);

  const marcarLeidoClan = useCallback(() => {
    setClan((prev) => (prev ? { ...prev, noLeidos: 0 } : prev));
    createClient().rpc("marcar_chat_clan_leido");
  }, []);

  // Envío de avisos: se abre el canal del destino, se manda y se cierra. Los
  // canales de salida se reutilizan para no abrir uno por mensaje.
  const enviarAviso = useCallback((nombreCanal: string, evento: string, payload: unknown) => {
    const supabase = createClient();
    let canal = canalesEntrada.current.get(nombreCanal) ?? canalesSalida.current.get(nombreCanal);
    if (!canal) {
      canal = supabase.channel(nombreCanal);
      canalesSalida.current.set(nombreCanal, canal);
      canal.subscribe((estado) => {
        if (estado === "SUBSCRIBED") canal?.send({ type: "broadcast", event: evento, payload });
      });
      // Se libera pasado un rato para no acumular canales de conversaciones viejas.
      setTimeout(() => {
        const c = canalesSalida.current.get(nombreCanal);
        if (c) {
          supabase.removeChannel(c);
          canalesSalida.current.delete(nombreCanal);
        }
      }, 60_000);
      return;
    }
    canal.send({ type: "broadcast", event: evento, payload });
  }, []);

  const avisarDirecto = useCallback(
    (destinatarioId: string, mensajeId: string, texto: string) => {
      const uid = userIdRef.current;
      if (!uid) return;
      const aviso: AvisoDirecto = { mensajeId, deId: uid, deNombre: miPerfil?.nombre ?? null, deAvatarUrl: miPerfil?.avatarUrl ?? null, texto };
      enviarAviso(canalAvisosDirectos(destinatarioId), "dm", aviso);
    },
    [enviarAviso, miPerfil]
  );
  const avisarClan = useCallback(
    (idClan: string, mensajeId: string, texto: string) => {
      const uid = userIdRef.current;
      if (!uid) return;
      const aviso: AvisoClan = { mensajeId, autorId: uid, autorNombre: miPerfil?.nombre ?? null, texto };
      enviarAviso(canalAvisosClan(idClan), "clan", aviso);
    },
    [enviarAviso, miPerfil]
  );

  // Al desmontar (cierre de sesión) se cierran los canales de salida.
  useEffect(() => {
    const salida = canalesSalida.current;
    return () => {
      const supabase = createClient();
      for (const c of salida.values()) supabase.removeChannel(c);
      salida.clear();
    };
  }, []);

  const valor = useMemo<Valor>(
    () => ({
      noLeidosDirectos: conversaciones.reduce((s, c) => s + c.noLeidos, 0),
      noLeidosClan: clan?.noLeidos ?? 0,
      conversaciones,
      clanId,
      clanNombre,
      marcarLeidoDirecto,
      marcarLeidoClan,
      avisarDirecto,
      avisarClan,
    }),
    [conversaciones, clan, clanId, clanNombre, marcarLeidoDirecto, marcarLeidoClan, avisarDirecto, avisarClan]
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {avisos.length > 0 && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
          <AnimatePresence>
            {avisos.map((aviso) => (
              <motion.div
                key={aviso.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                role="status"
                className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-primario/30 bg-surface px-4 py-3 shadow-lg"
              >
                <span aria-hidden className="mt-0.5 text-lg">
                  💬
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-foreground">{aviso.titulo}</p>
                  <p className="mt-0.5 line-clamp-2 break-words text-xs text-texto-secundario">{aviso.cuerpo}</p>
                  <Link
                    href={aviso.href}
                    onClick={() => setAvisos((prev) => prev.filter((a) => a.id !== aviso.id))}
                    className="mt-1 inline-block text-xs font-semibold text-primario hover:underline"
                  >
                    {t("ver")}
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setAvisos((prev) => prev.filter((a) => a.id !== aviso.id))}
                  aria-label={t("cerrar")}
                  className="text-texto-secundario hover:text-foreground"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Contexto.Provider>
  );
}
