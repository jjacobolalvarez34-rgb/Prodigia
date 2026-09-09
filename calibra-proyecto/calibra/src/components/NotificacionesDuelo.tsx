"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";
import { useEtiquetasDuelo } from "@/components/duelos/SelectorMundoDuelo";
import { reproducirTono } from "@/lib/sonido";

interface Aviso {
  id: string;
  duelId: string;
  mundo: MundoDuelo;
  operacion: ArithmeticProblemType | null;
  subTipo: string | null;
}

// Fase T3: "cuando alguien te reta, debe llegarte un aviso visible en la
// app" — hasta esta fase esto no existía en absoluto (ni roto, nunca se
// construyó, confirmado al investigar). Se monta una sola vez en el
// layout raíz (no depende de estar en ninguna pantalla en particular) y
// escucha, vía Supabase Realtime (Postgres Changes), cualquier fila
// nueva de "duels" donde yo sea el retado — cubre retos de amigos, del
// feed, invitaciones por link, y el lado "pasivo" del matchmaking de
// Rankeds (ver nota en RankedsClient.tsx sobre el hueco de
// descubrimiento que este mismo canal también tapa).
export default function NotificacionesDuelo() {
  const t = useTranslations("Common.notificacionesDuelo");
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const { nombreMundo, etiquetaOpcion } = useEtiquetasDuelo();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let activo = true;
    let channel: RealtimeChannel | null = null;
    let userIdActual: string | null = null;
    const supabase = createClient();

    // La suscripción no puede vivir solo en el montaje: si la sesión se
    // inicia deslogueada (ej. entrada por /login con navegación cliente,
    // el layout raíz nunca se remonta) el canal quedaría sin crearse y el
    // aviso de un reto jamás llegaría. Se re-crea con cada cambio de
    // sesión — entre el INITIAL_SESSION al montar y el SIGNED_IN al
    // entrar, reparte los dos casos.
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!activo) return;
      const user = sesion?.user ?? null;
      const uid = user && !user.is_anonymous ? user.id : null;
      if (uid === userIdActual) return;
      userIdActual = uid;
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      if (!uid) return;

      channel = supabase
        .channel(`retos-a:${uid}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "duels", filter: `retado_id=eq.${uid}` },
          (payload) => {
            const fila = payload.new as { id: string; mundo: MundoDuelo; operation_type: ArithmeticProblemType | null; sub_tipo: string | null };
            reproducirTono("logro");
            const id = `${fila.id}-${idRef.current++}`;
            setAvisos((prev) => [...prev, { id, duelId: fila.id, mundo: fila.mundo, operacion: fila.operation_type, subTipo: fila.sub_tipo }]);
            setTimeout(() => setAvisos((prev) => prev.filter((a) => a.id !== id)), 12_000);
          }
        )
        .subscribe();
    });

    return () => {
      activo = false;
      data.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (avisos.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {avisos.map((aviso) => (
          <motion.div
            key={aviso.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-primario/30 bg-surface px-4 py-3 shadow-lg"
          >
            <span className="text-xl">⚔️</span>
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold text-foreground">
                {t("teRetaronADueloDe", {
                  operacion: aviso.operacion
                    ? tOperaciones(aviso.operacion)
                    : `${nombreMundo(aviso.mundo)} (${etiquetaOpcion(aviso.mundo, aviso.subTipo ?? "")})`,
                })}
              </span>
              <Link
                href={hrefDuelo(aviso.mundo, aviso.operacion, aviso.duelId, aviso.subTipo)}
                className="text-xs font-semibold text-primario hover:underline"
                onClick={() => setAvisos((prev) => prev.filter((a) => a.id !== aviso.id))}
              >
                {t("verDuelo")}
              </Link>
            </div>
            <button
              onClick={() => setAvisos((prev) => prev.filter((a) => a.id !== aviso.id))}
              aria-label={t("cerrarAviso")}
              className="ml-1 text-texto-secundario hover:text-foreground"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
