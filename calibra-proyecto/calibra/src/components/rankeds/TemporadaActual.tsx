"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import RelojFalta from "@/components/temas/RelojFalta";
import { createClient } from "@/lib/supabase/client";
import { finTemporadaMs, mejorTemporadaRanked, nombreRango, temporadaRankedDe, tierTemporada } from "@/lib/rankeds/temporadas";

// La temporada de rankeds en curso (0296): número, cuenta regresiva hasta la próxima
// Gran Alineación (cuando se entregan las recompensas) y tu mejor temporada.
export default function TemporadaActual() {
  const t = useTranslations("Rankeds.temporada");
  const [ahora, setAhora] = useState<number | null>(null);
  const [mejor, setMejor] = useState<{ rango: string; veces: number } | null>(null);
  useEffect(() => {
    // La hora del navegador (en el servidor no hay reloj): un solo cálculo al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAhora(Date.now());
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) setMejor(await mejorTemporadaRanked(supabase, user.id));
    });
  }, []);
  if (ahora == null) return null;
  const n = temporadaRankedDe(ahora);
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#E8A317]/40 bg-[#E8A317]/[0.07] px-4 py-3">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#E8A317]">{t("actual", { numero: n })}</span>
      <span className="font-mono text-sm tabular-nums text-foreground">
        <RelojFalta hasta={finTemporadaMs(n)} texto={(tiempo) => t("terminaEn", { tiempo })} />
      </span>
      {mejor && <span className="text-sm text-texto-secundario">{t("mejor", { rango: nombreRango(mejor.rango), tier: tierTemporada(mejor.veces) })}</span>}
    </div>
  );
}
