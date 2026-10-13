import { useEffect, useState } from "react";
import { calcularVencimientoPro, type SuscripcionPro, type VencimientoPro } from "@/lib/pro/vencimiento";
import { useJugador } from "./jugador";
import { supabase } from "./supabase";

// Contador de Pro (2026-10-13), igual que /pro en la web: cuánto le queda a la
// suscripción. Pro dado a mano (sin fila en subscriptions) devuelve null.
export function useVencimientoPro(): VencimientoPro | null {
  const { plan } = useJugador();
  const [suscripcion, setSuscripcion] = useState<SuscripcionPro | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    if (plan !== "pro") return;
    let vivo = true;
    supabase
      .from("subscriptions")
      .select("current_period_end, cancel_at_period_end, status")
      .order("current_period_end", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (vivo) setSuscripcion((data as SuscripcionPro | null) ?? null);
      });
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [plan]);

  return plan === "pro" ? calcularVencimientoPro(suscripcion, ahora) : null;
}
