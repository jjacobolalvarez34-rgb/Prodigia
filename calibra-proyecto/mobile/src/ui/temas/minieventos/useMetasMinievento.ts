import { useCallback, useEffect, useState } from "react";
import type { IdTema } from "@/lib/temas/calendario";
import {
  diaUtc,
  mensajeErrorMinievento,
  metasPorCobrar,
  premiosMinievento,
  progresoMinievento,
  reclamarMetaMinievento,
  type PremioMinievento,
  type ProgresoMinievento,
} from "@/lib/temas/minieventos";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";

// Metas de aciertos de un minievento (0311, igual que la web): tu progreso, lo que ya
// cobraste y cobrar. `auto`: las metas alcanzadas se cobran solas al abrir.
export function useMetasMinievento(tema: IdTema, auto: boolean) {
  const hoy = diaUtc();
  const [progreso, setProgreso] = useState<ProgresoMinievento | null>(null);
  const [premios, setPremios] = useState<PremioMinievento[]>([]);
  const [cargado, setCargado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const p = await progresoMinievento(supabase, tema);
    let lista = p ? ((await premiosMinievento(supabase, p.evento)) ?? []) : [];
    if (p && auto) {
      const nuevas = metasPorCobrar(tema, p, lista, diaUtc());
      for (const m of nuevas) {
        try {
          await reclamarMetaMinievento(supabase, tema, m.clave);
        } catch {
          // Si ya estaba cobrada, la lista de abajo lo dice.
        }
      }
      if (nuevas.length) {
        sonar("logro");
        lista = (await premiosMinievento(supabase, p.evento)) ?? lista;
      }
    }
    setProgreso(p);
    setPremios(lista);
    setCargado(true);
  }, [tema, auto]);

  useEffect(() => {
    // Tus aciertos y premios (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const cobrar = useCallback(
    async (clave: string) => {
      vibrar.medio();
      setOcupado(true);
      setError(null);
      try {
        await reclamarMetaMinievento(supabase, tema, clave);
        sonar("recompensa");
        vibrar.exito();
        await cargar();
        return true;
      } catch (e) {
        setError(mensajeErrorMinievento(e));
        return false;
      } finally {
        setOcupado(false);
      }
    },
    [tema, cargar]
  );

  return { hoy, progreso, premios, cargado, ocupado, error, cobrar };
}
