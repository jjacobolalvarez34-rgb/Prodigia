"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { estadoLetraApp, estadoTemasApp } from "@/lib/recompensas/api";
import { aplicarLetraAppWeb, aplicarTemaAppWeb, CLAVE_TEMA_APP, letraAppPuestaWeb, temaAppPuestoWeb } from "@/lib/recompensas/temaAppWeb";
import { letraDe, TEMA_CLASICO } from "@/lib/recompensas/temas";

// Pone en la web el tema de la app de la cuenta (0297). El script de arranque del
// layout ya lo dejó puesto desde localStorage; acá se vuelve a aplicar con la paleta
// de hoy (por si cambió) y se compara con el de la cuenta (pudo cambiarse desde la
// app). Si la base todavía no tiene 0297, no toca nada. Al cerrar sesión vuelve el de
// siempre. No dibuja nada.
// Letra libre (0314): igual con la letra elegida (si la base todavía no tiene 0314, no
// toca nada).
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
        const [e, l] = await Promise.all([estadoTemasApp(sb, u.id), estadoLetraApp(sb, u.id)]);
        if (!vivo) return;
        if (e.disponible) {
          const slug = e.puesto !== TEMA_CLASICO && e.mios.includes(e.puesto) ? e.puesto : TEMA_CLASICO;
          if (slug !== temaAppPuestoWeb()) aplicarTemaAppWeb(slug);
        }
        if (l.disponible) {
          const letra = l.tiene ? (letraDe(l.elegida)?.id ?? null) : null;
          if (letra !== letraAppPuestaWeb()) aplicarLetraAppWeb(letra);
        }
      } catch {
        // Sin red: queda el último puesto.
      }
    };
    sincronizar();
    const { data: sub } = sb.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN") sincronizar();
      if (evento === "SIGNED_OUT") {
        aplicarLetraAppWeb(null);
        aplicarTemaAppWeb(null);
      }
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return null;
}
