"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { IdTema } from "@/lib/temas/calendario";
import { createClient } from "@/lib/supabase/client";
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

// Metas de aciertos de un minievento (0311): tu progreso, lo que ya cobraste y cobrar.
// `auto`: las metas alcanzadas se cobran solas al abrir (las que no piden un toque).
export function useMetasMinievento(tema: IdTema, auto: boolean) {
  const en = useLocale() === "en";
  const hoy = diaUtc();
  const [progreso, setProgreso] = useState<ProgresoMinievento | null>(null);
  const [premios, setPremios] = useState<PremioMinievento[]>([]);
  const [cargado, setCargado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const sb = createClient();
    const p = await progresoMinievento(sb, tema);
    let lista = p ? ((await premiosMinievento(sb, p.evento)) ?? []) : [];
    if (p && auto) {
      for (const m of metasPorCobrar(tema, p, lista, diaUtc())) {
        try {
          await reclamarMetaMinievento(sb, tema, m.clave);
        } catch {
          // Si ya estaba cobrada, la lista de abajo lo dice.
        }
      }
      lista = (await premiosMinievento(sb, p.evento)) ?? lista;
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
      setOcupado(true);
      setError(null);
      try {
        await reclamarMetaMinievento(createClient(), tema, clave);
        await cargar();
        return true;
      } catch (e) {
        setError(mensajeErrorMinievento(e, en));
        return false;
      } finally {
        setOcupado(false);
      }
    },
    [tema, cargar, en]
  );

  return { hoy, progreso, premios, cargado, ocupado, error, cobrar };
}
