"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";
import Boton from "@/components/Boton";

export default function ActualizarPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    // Esta página solo funciona si venís del enlace de recuperación: ese
    // enlace ya te deja con una sesión temporal (vía /auth/callback), así
    // que updateUser acá cambia la contraseña de esa misma cuenta.
    const { error: authError } = await supabase.auth.updateUser({ password });

    setEnviando(false);
    if (authError) {
      setError(mensajeErrorAuth(authError, "No pudimos actualizar la contraseña. Pedí un enlace nuevo desde /recuperar."));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nueva contraseña"
        autoComplete="new-password"
        autoFocus
        className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
      />
      <input
        type="password"
        required
        minLength={6}
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        placeholder="Repetí la nueva contraseña"
        autoComplete="new-password"
        className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? "Guardando..." : "Guardar contraseña"}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
