"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";

const NOMBRES_OPERACION: Record<string, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

interface Aviso {
  id: string;
  duelId: string;
  operacion: ArithmeticProblemType;
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
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let activo = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!activo || !user || user.is_anonymous) return;

      const channel = supabase
        .channel(`retos-a:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "duels", filter: `retado_id=eq.${user.id}` },
          (payload) => {
            const fila = payload.new as { id: string; operation_type: ArithmeticProblemType };
            reproducirTono("logro");
            const id = `${fila.id}-${idRef.current++}`;
            setAvisos((prev) => [...prev, { id, duelId: fila.id, operacion: fila.operation_type }]);
            setTimeout(() => setAvisos((prev) => prev.filter((a) => a.id !== id)), 12_000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });

    return () => {
      activo = false;
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
                Te retaron a un duelo de {NOMBRES_OPERACION[aviso.operacion] ?? aviso.operacion}
              </span>
              <Link
                href={`/practica?operacion=${aviso.operacion}&duelo=${aviso.duelId}`}
                className="text-xs font-semibold text-primario hover:underline"
                onClick={() => setAvisos((prev) => prev.filter((a) => a.id !== aviso.id))}
              >
                Ver duelo →
              </Link>
            </div>
            <button
              onClick={() => setAvisos((prev) => prev.filter((a) => a.id !== aviso.id))}
              aria-label="Cerrar aviso"
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
