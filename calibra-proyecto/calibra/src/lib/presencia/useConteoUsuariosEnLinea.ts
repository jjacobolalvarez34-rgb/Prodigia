"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Contraparte de lectura de useTrackearPresenciaGlobal.ts — se
// suscribe al mismo canal "presencia:global" pero JAMÁS llama a
// track(), así que no agrega ninguna entrada propia (nada de doble
// conteo entre esta suscripción y la de Header). Devuelve la cantidad
// de keys distintas en el presence state — cada key es un user_id
// (ver useTrackearPresenciaGlobal), así que ya viene deduplicado por
// persona, no por pestaña.
export function useConteoUsuariosEnLinea(): number | null {
  const [conteo, setConteo] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("presencia:global");

    channel.on("presence", { event: "sync" }, () => {
      setConteo(Object.keys(channel.presenceState()).length);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return conteo;
}
