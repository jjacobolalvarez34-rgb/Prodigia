"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import CampoPassword from "@/components/CampoPassword";

// Contraseña de respaldo para cuentas creadas con Google (pedido 2026-10-13): si algo
// pasa con Google, igual pueden entrar con su correo y esta contraseña. Se muestra
// solo a quien entró con Google y todavía no la creó (lib/auth/respaldo.ts; el servidor
// importa esa función de ahí, no de este archivo de cliente).

export default function ContrasenaRespaldo() {
  const t = useTranslations("Auth.respaldo");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setMensaje({ texto: t("corta"), ok: false });
    if (password !== confirmar) return setMensaje({ texto: t("noCoinciden"), ok: false });
    setEnviando(true);
    const { error } = await createClient().auth.updateUser({ password, data: { password_respaldo: true } });
    setEnviando(false);
    setMensaje(error ? { texto: mensajeErrorAuth(error, t("error")), ok: false } : { texto: t("lista"), ok: true });
  }

  if (mensaje?.ok) return <p className="rounded-2xl border border-correcto/40 bg-correcto/10 px-4 py-3 text-sm font-medium text-foreground">{mensaje.texto}</p>;

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
        <p className="text-sm text-texto-secundario">{t("texto")}</p>
      </div>
      <CampoPassword value={password} onChange={setPassword} placeholder={t("nueva")} autoComplete="new-password" />
      <CampoPassword value={confirmar} onChange={setConfirmar} placeholder={t("repetir")} autoComplete="new-password" />
      <button type="submit" disabled={enviando} className="rounded-xl bg-primario px-4 py-3 font-display font-semibold text-white disabled:opacity-60">
        {enviando ? t("guardando") : t("guardar")}
      </button>
      {mensaje && <p className="text-sm text-error">{mensaje.texto}</p>}
    </form>
  );
}
