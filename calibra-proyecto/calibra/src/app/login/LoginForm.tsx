"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";
import { IconOjo, IconOjoTachado } from "@/components/icons";
import { mensajeErrorAuth } from "@/lib/auth/mensajeError";

interface Props {
  next?: string;
}

export default function LoginForm({ next }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [entrandoInvitado, setEntrandoInvitado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvitado() {
    setEntrandoInvitado(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      setError(mensajeErrorAuth(authError, "No pudimos crear una sesión de invitado. Probá de nuevo."));
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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(mensajeErrorAuth(authError, "No pudimos iniciar sesión. Probá de nuevo."));
      setEnviando(false);
      return;
    }

    router.push(next ?? "/");
    router.refresh();
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
      <div className="relative">
        <input
          type={verPassword ? "text" : "password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 text-foreground outline-none focus:border-primario"
        />
        <button
          type="button"
          onClick={() => setVerPassword((v) => !v)}
          aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={verPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-secundario transition-colors hover:text-foreground"
        >
          {verPassword ? <IconOjoTachado className="h-4.5 w-4.5" /> : <IconOjo className="h-4.5 w-4.5" />}
        </button>
      </div>
      <Boton type="submit" cargando={enviando} className="w-full">
        {enviando ? "Entrando..." : "Iniciar sesión"}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="my-1 flex items-center gap-3 text-xs text-texto-secundario">
        <span className="h-px flex-1 bg-border" />
        o
        <span className="h-px flex-1 bg-border" />
      </div>

      <Boton type="button" variante="secundario" onClick={handleInvitado} cargando={entrandoInvitado} className="w-full">
        {entrandoInvitado ? "Entrando..." : "Entrar como invitado"}
      </Boton>
      <p className="text-center text-xs text-texto-secundario">
        Practicá sin crear cuenta. Podés guardar tu progreso después.
      </p>
    </form>
  );
}
