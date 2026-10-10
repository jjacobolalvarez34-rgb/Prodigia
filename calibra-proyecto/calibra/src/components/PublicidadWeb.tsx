"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { activarPublicidadWeb } from "@/lib/publicidad/web";

// Vive una sola vez en el layout raíz (como AnunciosModal): si la cuenta es
// gratis, carga AdSense (lib/publicidad/web.ts). Pro, colegio, invitados y la
// app nativa no cargan nada.
export default function PublicidadWeb() {
  useEffect(() => {
    const cliente = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    if (!cliente || Capacitor.isNativePlatform()) return;
    let activo = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!activo || !user || user.is_anonymous) return;
      const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();
      if (activo && (data as { plan?: string } | null)?.plan === "free") activarPublicidadWeb(cliente);
    });
    return () => {
      activo = false;
    };
  }, []);

  return null;
}
