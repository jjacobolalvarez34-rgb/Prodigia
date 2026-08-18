"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import { urlAbsoluta } from "@/lib/auth/urlAbsoluta";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";

export default function RegistroForm() {
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
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: urlAbsoluta("/auth/callback") },
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
