"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import { urlAbsoluta } from "@/lib/auth/urlAbsoluta";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";

// Un invitado (supabase.auth.signInAnonymously) ya tiene un user_id real y
// todo su progreso guardado bajo ese id — "guardar la cuenta" no migra
// nada, solo le agrega email+contraseña al mismo usuario (updateUser),
// así que el progreso queda intacto. Compartido entre /perfil (cartel
// permanente), /invitado-bloqueado (pantalla corta al chocar contra
// algo bloqueado) y el paso final del flujo de landing — un solo
// componente, no varias copias del formulario.
//
// Fase 3/2 del rediseño de onboarding: un invitado nunca elige nombre —
// tiene uno autogenerado ("Invitado83920", ver 0112_flujo_bienvenida.sql).
// "El nombre real solo se pide en el registro de una cuenta de
// verdad" — o sea, justo acá, después de que el email+contraseña ya se
// guardaron con éxito (nunca antes). Ese primer nombre real sigue
// siendo gratis (nombre_generado en la base lo garantiza), pero se deja
// saltear por si prefiere quedarse con el autogenerado.
interface Props {
  // El flujo de landing (FlujoElegirMundos.tsx) ya muestra su propia
  // explicación antes de esto — ahí conviene arrancar directo en el
  // formulario en vez de repetir la tarjeta "Estás como invitado".
  inicial?: "cerrado" | "form";
}

export default function ConvertirCuenta({ inicial = "cerrado" }: Props) {
  const t = useTranslations("Auth.convertirCuenta");
  const [paso, setPaso] = useState<"cerrado" | "form" | "nombre" | "directo" | "confirmar">(inicial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmado, setEmailConfirmado] = useState(false);
  const [nombre, setNombre] = useState("");
  const [enviandoNombre, setEnviandoNombre] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError(t("form.errorPasswordsNoCoinciden"));
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    // Antes esto no mandaba emailRedirectTo — la confirmación del email
    // nuevo dependía 100% del Site URL de fallback del dashboard (ver
    // urlAbsoluta.ts), en vez de construirse acá como en signUp/
    // resetPasswordForEmail.
    const { data, error: authError } = await supabase.auth.updateUser(
      { email, password },
      { emailRedirectTo: urlAbsoluta("/auth/callback") }
    );
    setEnviando(false);

    if (authError) {
      setError(mensajeErrorAuth(authError, t("form.errorGuardar")));
      return;
    }

    // Si el proyecto pide confirmar el email, el cambio queda pendiente
    // hasta que confirmes desde el link que te llega; si no, ya quedó —
    // en los dos casos, el paso de nombre real va antes del mensaje
    // final.
    setEmailConfirmado(Boolean(data.user?.email_confirmed_at));
    setPaso("nombre");
  }

  async function handleGuardarNombre(e: React.FormEvent) {
    e.preventDefault();
    setEnviandoNombre(true);
    setErrorNombre(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre.trim() });
    setEnviandoNombre(false);
    if (rpcError) {
      setErrorNombre(rpcError.message ?? t("pasoNombre.errorGenerico"));
      return;
    }
    setPaso(emailConfirmado ? "directo" : "confirmar");
  }

  if (paso === "nombre") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-primario/30 bg-primario/5 px-6 py-5 text-left">
        <p className="font-display font-semibold text-foreground">{t("pasoNombre.titulo")}</p>
        <p className="text-sm text-texto-secundario">
          {t("pasoNombre.subtitulo")}
        </p>
        <form onSubmit={handleGuardarNombre} className="flex flex-col gap-2">
          <input
            type="text"
            required
            minLength={2}
            maxLength={40}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={t("pasoNombre.placeholder")}
            autoFocus
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
          <div className="mt-1 flex items-center gap-3">
            <Boton type="submit" disabled={nombre.trim().length < 2} cargando={enviandoNombre} className="px-4 py-2 text-sm">
              {t("pasoNombre.botonGuardar")}
            </Boton>
            <button
              type="button"
              onClick={() => setPaso(emailConfirmado ? "directo" : "confirmar")}
              className="text-sm text-texto-secundario hover:underline"
            >
              {t("pasoNombre.seguirNombreActual")}
            </button>
          </div>
          {errorNombre && <p className="text-sm text-error">{errorNombre}</p>}
        </form>
      </div>
    );
  }

  if (paso === "directo") {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        {t("pasoDirecto")}
      </p>
    );
  }

  if (paso === "confirmar") {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        {t.rich("pasoConfirmar", {
          email,
          strong: (chunks) => <span className="font-medium">{chunks}</span>,
        })}
      </p>
    );
  }

  if (paso === "cerrado") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-primario/30 bg-primario/5 px-6 py-5">
        <p className="font-display font-semibold text-foreground">{t("pasoCerrado.titulo")}</p>
        <p className="text-sm text-texto-secundario">
          {t("pasoCerrado.subtitulo")}
        </p>
        <Boton onClick={() => setPaso("form")} className="mt-1 self-start px-4 py-2 text-sm">
          {t("pasoCerrado.boton")}
        </Boton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primario/30 bg-primario/5 px-6 py-5">
      <p className="font-display font-semibold text-foreground">{t("form.titulo")}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("form.emailPlaceholder")}
          autoComplete="email"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
        />
        <CampoPassword
          value={password}
          onChange={setPassword}
          placeholder={t("form.passwordPlaceholder")}
          autoComplete="new-password"
        />
        <CampoPassword
          value={confirmar}
          onChange={setConfirmar}
          placeholder={t("form.confirmarPlaceholder")}
          autoComplete="new-password"
        />
        <div className="mt-1 flex items-center gap-3">
          <Boton type="submit" cargando={enviando} className="px-4 py-2 text-sm">
            {t("form.botonConfirmar")}
          </Boton>
          <Boton type="button" variante="fantasma" onClick={() => setPaso("cerrado")}>
            {t("form.botonCancelar")}
          </Boton>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </form>
    </div>
  );
}
