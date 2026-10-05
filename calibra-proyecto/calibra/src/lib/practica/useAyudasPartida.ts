"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usarAyudaPartida } from "@/lib/recompensas/api";

// Pista y segunda oportunidad (tienda ampliada, 0248) en las partidas de la web,
// igual que en la app (useConsumibles de mobile/src/ui/Sprint.tsx):
//   - Pista: apaga 2 opciones incorrectas de la pregunta actual (solo donde hay opciones).
//   - Segunda oportunidad: queda "armada"; el próximo error no cuenta y se vuelve a
//     responder la misma pregunta (la opción errada queda apagada).
// No valen en duelos: con `activo` en false no se cargan ni se muestran. Si la base
// todavía no tiene 0248, quedan en 0 y no aparece nada.
export function useAyudasPartida(activo: boolean) {
  const [pistas, setPistas] = useState(0);
  const [segundas, setSegundas] = useState(0);
  const [armada, setArmada] = useState(false);
  const armadaRef = useRef(false);
  const [ocultas, setOcultas] = useState<Set<string>>(() => new Set());
  const [aviso, setAviso] = useState(false);
  const [usando, setUsando] = useState(false);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    (async () => {
      const sb = createClient();
      const { data: u } = await sb.auth.getUser();
      if (!u.user) return;
      const { data } = await sb.from("profiles").select("pistas_disponibles, segundas_oportunidades_disponibles").eq("id", u.user.id).maybeSingle();
      const f = data as { pistas_disponibles: number; segundas_oportunidades_disponibles: number } | null;
      if (vivo && f) {
        setPistas(f.pistas_disponibles ?? 0);
        setSegundas(f.segundas_oportunidades_disponibles ?? 0);
      }
    })().catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [activo]);

  // Pregunta nueva: vuelven todas las opciones.
  const nuevaPregunta = useCallback(() => setOcultas(new Set()), []);

  const usarPista = useCallback(
    async (opciones: string[], correcta: string) => {
      if (usando || pistas <= 0) return;
      setUsando(true);
      try {
        const r = await usarAyudaPartida(createClient(), "pista");
        if (!r) return;
        setPistas(r.pistas_disponibles);
        const malas = opciones.filter((o) => o !== correcta);
        for (let i = malas.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [malas[i], malas[j]] = [malas[j], malas[i]];
        }
        setOcultas(new Set(malas.slice(0, Math.min(2, Math.max(0, malas.length - 1)))));
      } finally {
        setUsando(false);
      }
    },
    [usando, pistas]
  );

  const armarSegunda = useCallback(async () => {
    if (usando || segundas <= 0 || armadaRef.current) return;
    setUsando(true);
    try {
      const r = await usarAyudaPartida(createClient(), "segunda_oportunidad");
      if (!r) return;
      setSegundas(r.segundas_oportunidades_disponibles);
      armadaRef.current = true;
      setArmada(true);
    } finally {
      setUsando(false);
    }
  }, [usando, segundas]);

  // Al fallar: si había una segunda oportunidad armada, la gasta y devuelve true
  // (el que llama no registra el error y deja responder otra vez).
  const consumirSegunda = useCallback((respuestaErrada?: string) => {
    if (!armadaRef.current) return false;
    armadaRef.current = false;
    setArmada(false);
    if (respuestaErrada) setOcultas((o) => new Set(o).add(respuestaErrada));
    setAviso(true);
    setTimeout(() => setAviso(false), 1500);
    return true;
  }, []);

  return { activo, pistas, segundas, armada, ocultas, aviso, usando, usarPista, armarSegunda, consumirSegunda, nuevaPregunta };
}

export type AyudasPartida = ReturnType<typeof useAyudasPartida>;
