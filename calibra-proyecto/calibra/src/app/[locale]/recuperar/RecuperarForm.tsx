"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import { urlAbsoluta } from "@/lib/auth/urlAbsoluta";
import Boton from "@/components/Boton";

export default function RecuperarForm() {
  const t = useTranslations("Auth.recuperar");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: urlAbsoluta(`/auth/callback?next=${encodeURIComponent("/auth/actualizar-password")}`),
    });

    setEnviando(false);
    if (authError) {
      setError(mensajeErrorAuth(authError, t("errorEnviar")));
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        {t("enviado")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        autoFocus
        className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? t("enviando") : t("botonEnviar")}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
