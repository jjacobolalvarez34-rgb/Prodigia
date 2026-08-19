"use client";

import { useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { sonidoHabilitado, sonidoHabilitadoServerSnapshot, setSonidoHabilitado, subscribeSonido } from "@/lib/sonido";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, setEfectosHabilitados, subscribeEfectos } from "@/lib/efectos";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  userId: string;
  metaXpDiariaInicial: number;
  ocultarDobleONadaInicial: boolean;
}

export default function AjustesClient({ userId, metaXpDiariaInicial, ocultarDobleONadaInicial }: Props) {
  const [meta, setMeta] = useState(metaXpDiariaInicial);
  const [guardandoMeta, setGuardandoMeta] = useState(false);
  const [metaGuardada, setMetaGuardada] = useState(false);
  const [ocultarDobleONada, setOcultarDobleONada] = useState(ocultarDobleONadaInicial);
  const [guardandoApuesta, setGuardandoApuesta] = useState(false);
  const sonido = useSyncExternalStore(subscribeSonido, sonidoHabilitado, sonidoHabilitadoServerSnapshot);
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);

  function toggleSonido() {
    setSonidoHabilitado(!sonido);
  }

  function toggleEfectos() {
    setEfectosHabilitados(!efectos);
  }

  async function toggleDobleONada() {
    const nuevo = !ocultarDobleONada;
    setOcultarDobleONada(nuevo);
    setGuardandoApuesta(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ ocultar_doble_o_nada: nuevo }).eq("id", userId);
    setGuardandoApuesta(false);
  }

  async function guardarMeta() {
    setGuardandoMeta(true);
    setMetaGuardada(false);
    const supabase = createClient();
    await supabase.from("profiles").update({ meta_xp_diaria: meta }).eq("id", userId);
    setGuardandoMeta(false);
    setMetaGuardada(true);
    setTimeout(() => setMetaGuardada(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
        <p className="font-display font-semibold text-foreground">Meta diaria de Experiencia</p>
        <p className="text-sm text-texto-secundario">Cuánta Experiencia querés juntar por día para mantener tu racha.</p>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            min={20}
            step={10}
            value={meta}
            onChange={(e) => setMeta(Number(e.target.value))}
            className="w-28 rounded-lg border border-border bg-background px-3 py-2 font-mono text-foreground outline-none focus:border-primario"
          />
          <button
            onClick={guardarMeta}
            disabled={guardandoMeta || meta < 20}
            className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {guardandoMeta ? "Guardando..." : metaGuardada ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="font-display font-semibold text-foreground">Sonido</p>
          <p className="text-sm text-texto-secundario">Tonos cortos al acertar o fallar en las partidas.</p>
        </div>
        <button
          onClick={toggleSonido}
          aria-pressed={sonido}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${sonido ? "bg-primario" : "bg-border"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${sonido ? "left-6" : "left-1"}`}
          />
        </button>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="font-display font-semibold text-foreground">Efectos visuales</p>
          <p className="text-sm text-texto-secundario">
            Fondos animados, partículas y el gesto del logo en celebraciones. Apagarlo no cambia nada
            de la funcionalidad.
          </p>
        </div>
        <button
          onClick={toggleEfectos}
          aria-pressed={efectos}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${efectos ? "bg-primario" : "bg-border"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${efectos ? "left-6" : "left-1"}`}
          />
        </button>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="font-display font-semibold text-foreground">Ocultar &quot;Doble o nada&quot;</p>
          <p className="text-sm text-texto-secundario">
            Saca la trastienda de apuestas de la Tienda. Siempre es solo con Chispas del juego, nunca dinero real —
            pero si preferís no verla, la apagás acá.
          </p>
        </div>
        <button
          onClick={toggleDobleONada}
          disabled={guardandoApuesta}
          aria-pressed={ocultarDobleONada}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${ocultarDobleONada ? "bg-primario" : "bg-border"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${ocultarDobleONada ? "left-6" : "left-1"}`}
          />
        </button>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="font-display font-semibold text-foreground">Tema</p>
          <p className="text-sm text-texto-secundario">Claro u oscuro.</p>
        </div>
        <ThemeToggle />
      </section>
    </div>
  );
}
