"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { urlAbsoluta } from "@/lib/auth/urlAbsoluta";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";

// «Continuar con Google» en la web (pedido 2026-10-13: solo estaba en la app). Igual
// que la app (mobile/src/lib/bienvenida.ts): si entraste como invitado, se le suma
// Google a ESA cuenta (no pierdes lo jugado); si no, se entra o se crea la cuenta.
// Vuelve por /auth/callback, que cambia el code por la sesión.
export default function BotonGoogle({ siguiente = "/" }: { siguiente?: string }) {
  const t = useTranslations("Auth.google");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continuar() {
    setCargando(true);
    setError(null);
    const sb = createClient();
    const redirectTo = urlAbsoluta(`/auth/callback?next=${encodeURIComponent(siguiente)}`);
    const { data: s } = await sb.auth.getSession();
    if (s.session?.user.is_anonymous) {
      const v = await sb.auth.linkIdentity({ provider: "google", options: { redirectTo } });
      if (!v.error) return; // el navegador ya se va a Google
    }
    const { error: e } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (e) {
      setCargando(false);
      setError(mensajeErrorAuth(e, t("error")));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={continuar}
        disabled={cargando}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {cargando ? t("abriendo") : t("continuar")}
      </button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
