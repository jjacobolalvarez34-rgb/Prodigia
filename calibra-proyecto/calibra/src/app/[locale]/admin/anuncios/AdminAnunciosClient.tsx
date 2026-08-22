"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

export interface AnuncioAdmin {
  id: string;
  tipo: "actualizacion" | "arreglo" | "evento";
  titulo: string;
  descripcion: string;
  fecha: string;
  activo: boolean;
  creado_at: string;
}

const ETIQUETA_TIPO: Record<AnuncioAdmin["tipo"], string> = {
  actualizacion: "Actualización",
  arreglo: "Arreglo",
  evento: "Evento",
};

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAnunciosClient({ anunciosIniciales }: { anunciosIniciales: AnuncioAdmin[] }) {
  const [anuncios, setAnuncios] = useState(anunciosIniciales);
  const [tipo, setTipo] = useState<AnuncioAdmin["tipo"]>("actualizacion");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear() {
    if (!titulo.trim() || !descripcion.trim()) {
      setError("Completá título y descripción.");
      return;
    }
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { data: id, error: err } = await supabase.rpc("crear_anuncio", {
      p_tipo: tipo,
      p_titulo: titulo.trim(),
      p_descripcion: descripcion.trim(),
      p_fecha: fecha,
    });
    setEnviando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setAnuncios((prev) => [
      { id: id as string, tipo, titulo: titulo.trim(), descripcion: descripcion.trim(), fecha, activo: true, creado_at: new Date().toISOString() },
      ...prev,
    ]);
    setTitulo("");
    setDescripcion("");
  }

  async function alternar(id: string) {
    const supabase = createClient();
    await supabase.rpc("alternar_anuncio_activo", { p_id: id });
    setAnuncios((prev) => prev.map((a) => (a.id === id ? { ...a, activo: !a.activo } : a)));
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-5">
        <h2 className="font-display text-lg font-bold text-foreground">Nuevo anuncio</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ETIQUETA_TIPO) as AnuncioAdmin["tipo"][]).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tipo === t ? "bg-primario text-white" : "bg-surface-2 text-texto-secundario hover:text-foreground"
              }`}
            >
              {ETIQUETA_TIPO[t]}
            </button>
          ))}
        </div>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
        />
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
          rows={3}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-fit rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Boton onClick={crear} cargando={enviando} className="w-fit">
          Publicar
        </Boton>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">Todos los anuncios</h2>
        {anuncios.length === 0 && <p className="text-sm text-texto-secundario">Todavía no creaste ninguno.</p>}
        {anuncios.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                {ETIQUETA_TIPO[a.tipo]} · {a.fecha}
                {!a.activo && <span className="ml-2 text-error">inactivo</span>}
              </p>
              <p className="font-medium text-foreground">{a.titulo}</p>
              <p className="text-sm text-texto-secundario">{a.descripcion}</p>
            </div>
            <button
              onClick={() => alternar(a.id)}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-texto-secundario hover:text-foreground"
            >
              {a.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
