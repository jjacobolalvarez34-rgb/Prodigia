"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Grupo {
  id: string;
  nombre: string;
  codigo_invitacion: string;
}

interface Props {
  grupos: Grupo[];
}

export default function ProfesorClient({ grupos: gruposIniciales }: Props) {
  const router = useRouter();
  const [grupos, setGrupos] = useState(gruposIniciales);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [codigoUnirse, setCodigoUnirse] = useState("");
  const [creando, setCreando] = useState(false);
  const [uniendo, setUniendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crearGrupo(e: React.FormEvent) {
    e.preventDefault();
    if (nombreNuevo.trim().length < 2) return;
    setCreando(true);
    setError(null);
    const res = await fetch("/api/profesor/crear-grupo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevo.trim() }),
    });
    const data = await res.json();
    setCreando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el grupo.");
      return;
    }
    setGrupos((prev) => [{ id: data.id, nombre: nombreNuevo.trim(), codigo_invitacion: data.codigo }, ...prev]);
    setNombreNuevo("");
    router.refresh();
  }

  async function unirseGrupo(e: React.FormEvent) {
    e.preventDefault();
    if (codigoUnirse.trim().length < 4) return;
    setUniendo(true);
    setError(null);
    const res = await fetch("/api/profesor/unirse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigoUnirse.trim() }),
    });
    const data = await res.json();
    setUniendo(false);
    if (!res.ok) {
      setError(data.error ?? "Código inválido.");
      return;
    }
    setCodigoUnirse("");
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Grupos</h2>
        <p className="mt-1 text-sm text-texto-secundario">
          Creá un grupo para tu clase o unite a uno con el código que te pasó tu profesor.
        </p>
      </div>

      {grupos.length > 0 && (
        <div className="flex flex-col gap-2">
          {grupos.map((g) => (
            <Link
              key={g.id}
              href={`/profesor/${g.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primario/40"
            >
              <span className="font-medium text-foreground">{g.nombre}</span>
              <span className="font-mono text-xs text-texto-secundario">Código: {g.codigo_invitacion}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <form onSubmit={crearGrupo} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="font-display text-sm font-semibold text-foreground">Crear un grupo</p>
          <input
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Nombre del grupo o sección"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
          <button
            type="submit"
            disabled={creando || nombreNuevo.trim().length < 2}
            className="self-start rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creando ? "Creando..." : "Crear grupo"}
          </button>
        </form>

        <form onSubmit={unirseGrupo} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="font-display text-sm font-semibold text-foreground">Unirme con un código</p>
          <input
            value={codigoUnirse}
            onChange={(e) => setCodigoUnirse(e.target.value.toUpperCase())}
            placeholder="Código de 6 letras"
            maxLength={6}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono uppercase text-foreground outline-none focus:border-primario"
          />
          <button
            type="submit"
            disabled={uniendo || codigoUnirse.trim().length < 4}
            className="self-start rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {uniendo ? "Uniéndome..." : "Unirme"}
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
