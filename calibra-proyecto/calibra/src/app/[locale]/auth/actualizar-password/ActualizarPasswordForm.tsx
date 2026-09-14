"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";

export default function ActualizarPasswordForm() {
  const router = useRouter();
  const t = useTranslations("Auth.actualizarPassword");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError(t("errorPasswordsNoCoinciden"));
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    // Esta página solo funciona si vienes del enlace de recuperación: ese
    // enlace ya te deja con una sesión temporal (vía /auth/callback), así
    // que updateUser acá cambia la contraseña de esa misma cuenta.
    const { error: authError } = await supabase.auth.updateUser({ password });

    setEnviando(false);
    if (authError) {
      setError(mensajeErrorAuth(authError, t("errorActualizar")));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CampoPassword
        value={password}
        onChange={setPassword}
        placeholder={t("passwordPlaceholder")}
        autoComplete="new-password"
        autoFocus
      />
      <CampoPassword
        value={confirmar}
        onChange={setConfirmar}
        placeholder={t("confirmarPlaceholder")}
        autoComplete="new-password"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? t("guardando") : t("botonGuardar")}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
