"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";

interface Props {
  next?: string;
}

export default function LoginForm({ next }: Props) {
  const router = useRouter();
  const t = useTranslations("Auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [entrandoInvitado, setEntrandoInvitado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvitado() {
    setEntrandoInvitado(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      setError(mensajeErrorAuth(authError, t("errorInvitado")));
      setEntrandoInvitado(false);
      return;
    }
    router.push(next ?? "/");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const supabase = createClient();
    const identificador = email.trim();

    // Acepta email O nombre de usuario: Supabase Auth solo sabe entrar
    // por email, así que si lo que tipeó no tiene "@" lo resolvemos acá
    // primero (profiles.display_name es único case-insensitive desde
    // 0037). Si el nombre no existe, mostramos el mismo error genérico
    // que una contraseña equivocada — no hay forma de distinguir desde
    // afuera "no existe esa cuenta" de "contraseña mal".
    let emailReal = identificador;
    if (!identificador.includes("@")) {
      const { data: resuelto } = await supabase.rpc("resolver_email_por_usuario", {
        p_identificador: identificador,
      });
      if (!resuelto) {
        setError(t("errorLogin"));
        setEnviando(false);
        return;
      }
      emailReal = resuelto;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email: emailReal, password });

    if (authError) {
      setError(mensajeErrorAuth(authError, t("errorLogin")));
      setEnviando(false);
      return;
    }

    router.push(next ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailOUsuarioPlaceholder")}
        autoComplete="username"
        autoFocus
        className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
      />
      <CampoPassword
        value={password}
        onChange={setPassword}
        placeholder={t("passwordPlaceholder")}
        autoComplete="current-password"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? t("entrando") : t("botonIniciarSesion")}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="my-1 flex items-center gap-3 text-xs text-texto-secundario">
        <span className="h-px flex-1 bg-border" />
        {t("separadorO")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <Boton type="button" variante="secundario" onClick={handleInvitado} cargando={entrandoInvitado} className="w-full">
        {entrandoInvitado ? t("entrando") : t("botonInvitado")}
      </Boton>
      <p className="text-center text-xs text-texto-secundario">
        {t("practicaSinCuenta")}
      </p>
    </form>
  );
}
