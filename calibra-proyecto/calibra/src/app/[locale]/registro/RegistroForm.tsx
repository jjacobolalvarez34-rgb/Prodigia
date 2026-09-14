"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import { urlAbsoluta } from "@/lib/auth/urlAbsoluta";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";

interface Props {
  refId?: string;
}

// A veces el mail de confirmación se pierde (spam, proveedor lento, typo
// que el usuario ya corrigió mentalmente pero no en el campo) — el botón
// de reenvío usa supabase.auth.resend, que dispara el mismo mail de
// confirmación de nuevo para la misma cuenta pendiente. El cooldown de
// acá es puramente de UX (evitar que golpeen el botón 10 veces seguidas);
// Supabase igual aplica su propio rate-limit del lado del servidor pase
// lo que pase acá.
const COOLDOWN_REENVIO_SEGUNDOS = 45;

// Sección 10.2: link de invitación de amigo (?ref=<userId de quien
// invitó>) — mismo patrón que LoginForm.tsx (next?: string): lo lee el
// server component (page.tsx) de searchParams y lo pasa como prop
// normal, en vez de useSearchParams() acá adentro (que exigiría
// envolver esto en <Suspense>, innecesario cuando el padre ya lo tiene
// disponible sin eso). Se lleva a través de la confirmación de email
// vía emailRedirectTo (sobrevive el viaje de ida y vuelta al mail), y
// /auth/callback lo procesa server-side apenas hay sesión real. Para
// el caso sin confirmación de email (signUp devuelve sesión directo)
// se conecta acá mismo, sin esperar el viaje por mail.
export default function RegistroForm({ refId }: Props) {
  const router = useRouter();
  const t = useTranslations("Auth.registro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [errorReenvio, setErrorReenvio] = useState<string | null>(null);
  const [segundosCooldown, setSegundosCooldown] = useState(0);
  const refId_ = useRef(refId);
  refId_.current = refId;

  useEffect(() => {
    if (segundosCooldown <= 0) return;
    const id = window.setInterval(() => {
      setSegundosCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [segundosCooldown]);

  async function reenviarCodigo() {
    if (reenviando || segundosCooldown > 0) return;
    setReenviando(true);
    setErrorReenvio(null);
    setReenviado(false);
    const supabase = createClient();
    const redirectPath = refId_.current
      ? `/auth/callback?ref=${encodeURIComponent(refId_.current)}`
      : "/auth/callback";
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: urlAbsoluta(redirectPath) },
    });
    setReenviando(false);
    if (resendError) {
      setErrorReenvio(mensajeErrorAuth(resendError, t("errorReenviar")));
      return;
    }
    setReenviado(true);
    setSegundosCooldown(COOLDOWN_REENVIO_SEGUNDOS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError(t("errorPasswordsNoCoinciden"));
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const redirectPath = refId ? `/auth/callback?ref=${encodeURIComponent(refId)}` : "/auth/callback";
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: urlAbsoluta(redirectPath) },
    });

    if (authError) {
      const mensaje = mensajeErrorAuth(authError, t("errorCrearCuenta"));
      // Fallback por si el mensaje viejo de Supabase ("User already
      // registered") llega sin el código `email_exists` en alguna
      // versión — mensajeErrorAuth ya cubre el código; esto es un
      // segundo intento antes de resignarse al genérico.
      const msg = authError.message.toLowerCase();
      const yaRegistrado = msg.includes("already registered") || msg.includes("already been registered");
      setError(yaRegistrado ? t("errorYaRegistrado") : mensaje);
      setEnviando(false);
      return;
    }

    // Si el proyecto de Supabase tiene confirmación de email activada,
    // signUp no devuelve sesión todavía — hay que esperar a que confirme
    // por el link que le llega. Si no, ya queda logueado.
    if (!data.session) {
      setConfirmacionPendiente(true);
      setSegundosCooldown(COOLDOWN_REENVIO_SEGUNDOS);
      setEnviando(false);
      return;
    }

    // Sin confirmación de email de por medio, ya hay sesión acá mismo
    // — no hace falta esperar el viaje por /auth/callback para conectar
    // la amistad. Best-effort: si falla, no bloquea el registro en sí.
    if (refId) {
      await supabase.rpc("conectar_por_invitacion", { p_token: refId });
    }

    router.push("/");
    router.refresh();
  }

  if (confirmacionPendiente) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
          {t.rich("confirmacionPendiente", {
            email,
            strong: (chunks) => <span className="font-medium">{chunks}</span>,
          })}
        </p>
        <p className="text-xs text-texto-secundario">⚠️ {t("revisaSpam")}</p>
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={reenviarCodigo}
            disabled={reenviando || segundosCooldown > 0}
            className="text-sm font-medium text-primario underline decoration-primario/40 underline-offset-2 transition-opacity hover:decoration-primario disabled:cursor-not-allowed disabled:text-texto-secundario disabled:no-underline disabled:opacity-70"
          >
            {reenviando
              ? t("reenviando")
              : segundosCooldown > 0
                ? t("reenviarEn", { segundos: segundosCooldown })
                : t("reenviarCodigo")}
          </button>
          {reenviado && !errorReenvio && (
            <p className="text-xs text-correcto">{t("codigoReenviado")}</p>
          )}
          {errorReenvio && <p className="text-xs text-error">{errorReenvio}</p>}
        </div>
      </div>
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
      <CampoPassword
        value={password}
        onChange={setPassword}
        placeholder={t("passwordPlaceholder")}
        autoComplete="new-password"
      />
      <CampoPassword
        value={confirmar}
        onChange={setConfirmar}
        placeholder={t("confirmarPlaceholder")}
        autoComplete="new-password"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? t("creandoCuenta") : t("botonCrearCuenta")}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
