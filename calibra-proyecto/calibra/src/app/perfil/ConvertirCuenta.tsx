"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

// Un invitado (supabase.auth.signInAnonymously) ya tiene un user_id real y
// todo su progreso guardado bajo ese id — "guardar la cuenta" no migra
// nada, solo le agrega email+contraseña al mismo usuario (updateUser),
// así que el progreso queda intacto.
export default function ConvertirCuenta() {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<"directo" | "confirmar" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.updateUser({ email, password });
    setEnviando(false);

    if (authError) {
      setError(
        authError.message.includes("already registered") || authError.message.includes("already been registered")
          ? "Ya existe una cuenta con ese email."
          : "No pudimos guardar la cuenta. Probá de nuevo."
      );
      return;
    }

    // Si el proyecto pide confirmar el email, el cambio queda pendiente
    // hasta que confirmes desde el link que te llega; si no, ya quedó.
    setListo(data.user?.email_confirmed_at ? "directo" : "confirmar");
  }

  if (listo === "directo") {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        Listo, tu cuenta ya tiene email y contraseña — la próxima vez entrá con eso.
      </p>
    );
  }

  if (listo === "confirmar") {
    return (
      <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">
        Te mandamos un email a <span className="font-medium">{email}</span> — confirmalo para
        terminar de guardar tu cuenta. Mientras tanto seguí jugando normal, no perdés nada.
      </p>
    );
  }

  if (!abierto) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-primario/30 bg-primario/5 px-6 py-5">
        <p className="font-display font-semibold text-foreground">Estás como invitado</p>
        <p className="text-sm text-texto-secundario">
          Tu progreso ya se está guardando, pero si borrás el navegador lo perdés. Agregá un email y
          contraseña para no perderlo nunca.
        </p>
        <Boton onClick={() => setAbierto(true)} className="mt-1 self-start px-4 py-2 text-sm">
          Guardar mi cuenta
        </Boton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primario/30 bg-primario/5 px-6 py-5">
      <p className="font-display font-semibold text-foreground">Guardar mi cuenta</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mínimo 6 caracteres)"
          autoComplete="new-password"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
        />
        <input
          type="password"
          required
          minLength={6}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
        />
        <div className="mt-1 flex items-center gap-3">
          <Boton type="submit" cargando={enviando} className="px-4 py-2 text-sm">
            Confirmar
          </Boton>
          <Boton type="button" variante="fantasma" onClick={() => setAbierto(false)}>
            Cancelar
          </Boton>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </form>
    </div>
  );
}
