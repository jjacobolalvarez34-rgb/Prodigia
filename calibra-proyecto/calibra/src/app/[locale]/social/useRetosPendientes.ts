"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import type { MundoDuelo } from "@/lib/duelos/rutas";

export interface RetoPendienteBase {
  duel_id: string;
  operation_type: ArithmeticProblemType | null;
  mundo: MundoDuelo;
  creado_at: string;
  retador_nombre: string | null;
  retador_elo: number;
  retador_titulo_nombre: string | null;
  // 0256: cuándo vence (los retos entre amigos duran 24 h; el resto, 60 s).
  expira_at?: string | null;
}

export interface RetoPendiente extends RetoPendienteBase {
  segundosRestantes: number | null;
}

const DURACION_INVITACION_S = 60;

function segundosRestantesDe(r: RetoPendienteBase): number {
  if (r.expira_at) return Math.max(0, Math.round((new Date(r.expira_at).getTime() - Date.now()) / 1000));
  const transcurrido = (Date.now() - new Date(r.creado_at).getTime()) / 1000;
  return Math.max(0, Math.round(DURACION_INVITACION_S - transcurrido));
}

// 45 → «45s», 720 → «12 min», 10800 → «3 h».
export function formatoRestante(seg: number): string {
  if (seg >= 3600) return `${Math.floor(seg / 3600)} h`;
  if (seg >= 60) return `${Math.floor(seg / 60)} min`;
  return `${seg}s`;
}

// Fase 4: cualquier invitación a duelo expira sola al minuto si nadie la
// acepta — este hook lleva la cuenta regresiva visible en el cliente
// (para que se sienta en tiempo real) y dispara rechazar_duelo apenas
// llega a 0. El cierre real y definitivo no depende de que este cliente
// siga abierto: mis_duelos_pendientes() (servidor) borra las
// invitaciones vencidas de oficio cada vez que se consulta, así que
// aunque nadie mire la barra lateral a tiempo, la invitación igual deja
// de estar jugable pasado el minuto.
export function useRetosPendientes(iniciales: RetoPendienteBase[]) {
  const [retos, setRetos] = useState<RetoPendiente[]>(() =>
    iniciales.map((r) => ({ ...r, segundosRestantes: segundosRestantesDe(r) }))
  );
  const rechazandoRef = useRef<Set<string>>(new Set());

  async function rechazar(duelId: string) {
    if (rechazandoRef.current.has(duelId)) return;
    rechazandoRef.current.add(duelId);
    setRetos((prev) => prev.filter((r) => r.duel_id !== duelId));
    const supabase = createClient();
    await supabase.rpc("rechazar_duelo", { p_duel_id: duelId });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRetos((prev) => {
        let huboVencido = false;
        const siguiente = prev.map((r) => {
          const seg = segundosRestantesDe(r);
          if (seg <= 0) huboVencido = true;
          return { ...r, segundosRestantes: seg };
        });
        if (huboVencido) {
          for (const r of siguiente) {
            if (r.segundosRestantes <= 0 && !rechazandoRef.current.has(r.duel_id)) {
              rechazandoRef.current.add(r.duel_id);
              const supabase = createClient();
              supabase.rpc("rechazar_duelo", { p_duel_id: r.duel_id });
            }
          }
          return siguiente.filter((r) => r.segundosRestantes > 0);
        }
        return siguiente;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { retos, rechazar };
}
