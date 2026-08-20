"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import { urlAbsoluta } from "@/lib/auth/urlAbsoluta";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";

interface Props {
  refId?: string;
}

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
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
      const mensaje = mensajeErrorAuth(authError, "No pudimos crear la cuenta. Probá de nuevo.");
      // Fallback por si el mensaje viejo de Supabase ("User already
      // registered") llega sin el código `email_exists` en alguna
      // versión — mensajeErrorAuth ya cubre el código; esto es un
      // segundo intento antes de resignarse al genérico.
      const msg = authError.message.toLowerCase();
      const yaRegistrado = msg.includes("already registered") || msg.includes("already been registered");
      setError(yaRegistrado ? "Ya existe una cuenta con ese email." : mensaje);
      setEnviando(false);
      return;
    }

    // Si el proyecto de Supabase tiene confirmación de email activada,
    // signUp no devuelve sesión todavía — hay que esperar a que confirme
    // por el link que le llega. Si no, ya queda logueado.
    if (!data.session) {
      setConfirmacionPendiente(true);
      setEnviando(false);
      return;
    }

    // Sin confirmación de email de por medio, ya hay sesión acá mismo
    // — no hace falta esperar el viaje por /auth/callback para conectar
    // la amistad. Best-effort: si falla, no bloquea el registro en sí.
    if (refId) {
      await supabase.rpc("conectar_por_invitacion", { p_inviter_id: refId });
    }

    router.push("/");
    router.refresh();
  }

  if (confirmacionPendiente) {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        Te mandamos un email a <span className="font-medium">{email}</span> — confirmá tu cuenta desde
        ahí para poder entrar.
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
        placeholder="tu@email.com"
        autoComplete="email"
        autoFocus
        className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
      />
      <CampoPassword
        value={password}
        onChange={setPassword}
        placeholder="Contraseña (mínimo 6 caracteres)"
        autoComplete="new-password"
      />
      <CampoPassword
        value={confirmar}
        onChange={setConfirmar}
        placeholder="Repetí la contraseña"
        autoComplete="new-password"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? "Creando cuenta..." : "Crear cuenta"}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
