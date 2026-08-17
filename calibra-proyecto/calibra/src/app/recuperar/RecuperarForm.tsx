"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

export default function RecuperarForm() {
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
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/actualizar-password")}`,
    });

    setEnviando(false);
    if (authError) {
      setError("No pudimos enviar el enlace. Probá de nuevo.");
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        Si hay una cuenta con ese email, te llegó un enlace para elegir una nueva contraseña.
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
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? "Enviando..." : "Enviarme el enlace"}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
