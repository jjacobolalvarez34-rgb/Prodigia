"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { estadoTemasApp } from "@/lib/recompensas/api";
import { aplicarTemaAppWeb, CLAVE_TEMA_APP, temaAppPuestoWeb } from "@/lib/recompensas/temaAppWeb";
import { TEMA_CLASICO } from "@/lib/recompensas/temas";

// Pone en la web el tema de la app de la cuenta (0297). El script de arranque del
// layout ya lo dejó puesto desde localStorage; acá se vuelve a aplicar con la paleta
// de hoy (por si cambió) y se compara con el de la cuenta (pudo cambiarse desde la
// app). Si la base todavía no tiene 0297, no toca nada. Al cerrar sesión vuelve el de
// siempre. No dibuja nada.
export default function AplicarTemaApp() {
  useEffect(() => {
    let vivo = true;
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_TEMA_APP) ?? "null") as { slug?: string } | null;
      if (guardado?.slug) aplicarTemaAppWeb(guardado.slug);
    } catch {
      // Nada guardado.
    }
    const sb = createClient();
    const sincronizar = async () => {
      try {
        const { data } = await sb.auth.getUser();
        const u = data.user;
        if (!u || u.is_anonymous) return;
        const e = await estadoTemasApp(sb, u.id);
        if (!vivo || !e.disponible) return;
        const slug = e.puesto !== TEMA_CLASICO && e.mios.includes(e.puesto) ? e.puesto : TEMA_CLASICO;
        if (slug !== temaAppPuestoWeb()) aplicarTemaAppWeb(slug);
      } catch {
        // Sin red: queda el último puesto.
      }
    };
    sincronizar();
    const { data: sub } = sb.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN") sincronizar();
      if (evento === "SIGNED_OUT") aplicarTemaAppWeb(null);
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return null;
}
