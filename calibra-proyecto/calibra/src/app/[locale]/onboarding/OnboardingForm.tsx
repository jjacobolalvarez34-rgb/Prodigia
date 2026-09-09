"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  IconSuma,
  IconGeometria,
  IconLogica,
  IconQuimica,
  IconAnatomia,
  IconMelodia,
  IconTrigonometria,
  IconHistoria,
  IconCandado,
} from "@/components/icons";
import Boton from "@/components/Boton";
import { MUNDOS_PAGOS, NOMBRE_MUNDO_PAGO, COLOR_MUNDO_PAGO, type MundoPago } from "@/lib/mundos/precios";

interface Props {
  next: string;
  // Fase 12 (ajuste): una cuenta que ya guardó el nombre pero cerró la
  // pestaña antes de elegir sus mundos gratis vuelve acá — no tiene
  // sentido pedirle el nombre de nuevo. En la práctica esto casi nunca
  // dispara para un invitado (el nombre ya le llega autogenerado desde
  // el trigger, ver 0112_flujo_bienvenida.sql) — queda como red de
  // seguridad si display_name llegara null por algún motivo.
  saltarPasoNombre: boolean;
}

// Fase 12 (ajuste) + rediseño de onboarding (Fase 5/6): ya no hay un
// mundo gratis fijo ni la pantalla de "¿Qué te gustaría mejorar?" (era
// un resabio de cuando solo existía Numeria, no influía en nada del
// diagnóstico real de cada mundo) — se eligen directamente 2 mundos
// gratis acá, mismos 8 mundos y colores que MundoSelector.tsx (nav).
const ICONO_MUNDO: Record<MundoPago, typeof IconSuma> = {
  numeria: IconSuma,
  geografia: IconGeometria,
  enigmia: IconLogica,
  quimia: IconQuimica,
  anatomia: IconAnatomia,
  melodia: IconMelodia,
  trigonometria: IconTrigonometria,
  historia: IconHistoria,
};

export default function OnboardingForm({ next, saltarPasoNombre }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState<"nombre" | "mundos">(saltarPasoNombre ? "mundos" : "nombre");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<MundoPago[]>([]);
  const [enviandoMundos, setEnviandoMundos] = useState(false);
  const [errorMundo, setErrorMundo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    // El primer nombre es gratis — cambiar_nombre_usuario (0054/0112)
    // solo cobra Chispas a partir del segundo cambio de un nombre que la
    // propia persona haya elegido.
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre.trim() });

    setEnviando(false);
    if (rpcError) {
      setError(rpcError.message ?? "No se pudo guardar. Probá de nuevo.");
      return;
    }
    setPaso("mundos");
  }

  function alternar(mundo: MundoPago) {
    setSeleccionados((actuales) => {
      if (actuales.includes(mundo)) return actuales.filter((m) => m !== mundo);
      if (actuales.length >= 2) return actuales;
      return [...actuales, mundo];
    });
  }

  async function confirmarMundos() {
    if (seleccionados.length !== 2) return;
    setEnviandoMundos(true);
    setErrorMundo(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("elegir_mundos_iniciales", { p_mundos: seleccionados });
    // 0116: si la cuenta YA tiene 2+ mundos la RPC lo rechaza con
    // "ya elegiste" — no tiene sentido quedar trabados acá: ya está
    // onboardeada, ir directo al destino.
    if (rpcError) {
      if (rpcError.message?.includes("ya elegiste")) {
        router.push(next);
        router.refresh();
        return;
      }
      setErrorMundo(rpcError.message ?? "No se pudo guardar. Probá de nuevo.");
      setEnviandoMundos(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <AnimatePresence mode="wait">
      {paso === "nombre" ? (
        <motion.div key="nombre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            ¿Cómo te llamamos?
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">
            Un nombre corto alcanza — lo vas a ver en tu perfil y en el ranking.
          </p>
          <form onSubmit={guardarNombre} className="flex flex-col gap-3">
            <input
              type="text"
              required
              minLength={2}
              maxLength={40}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
            />
            <Boton type="submit" disabled={nombre.trim().length < 2} cargando={enviando}>
              {enviando ? "Guardando..." : "Siguiente"}
            </Boton>
            {error && <p className="text-sm text-error">{error}</p>}
          </form>
        </motion.div>
      ) : (
        <motion.div key="mundos" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Elegí tus 2 mundos
          </h1>
          <p className="mt-2 mb-6 text-sm text-texto-secundario">
            Todos empiezan bloqueados — los 2 que elijas acá son gratis para siempre. Los demás se
            desbloquean después con Chispas, jugando.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MUNDOS_PAGOS.map((mundo) => {
              const Icono = ICONO_MUNDO[mundo];
              const color = COLOR_MUNDO_PAGO[mundo];
              const elegido = seleccionados.includes(mundo);
              const deshabilitado = !elegido && seleccionados.length >= 2;
              return (
                <button
                  key={mundo}
                  onClick={() => alternar(mundo)}
                  disabled={enviandoMundos || deshabilitado}
                  className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 px-4 py-5 text-center transition-colors disabled:opacity-50"
                  style={{
                    borderColor: elegido ? color : `color-mix(in oklab, ${color} 35%, transparent)`,
                    background: elegido ? `color-mix(in oklab, ${color} 12%, transparent)` : undefined,
                  }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ background: color }}
                  >
                    <Icono className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{NOMBRE_MUNDO_PAGO[mundo]}</span>
                  {elegido ? (
                    <span className="text-xs font-medium" style={{ color }}>
                      Elegido
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-texto-secundario">
                      <IconCandado className="h-3 w-3" /> Bloqueado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {errorMundo && <p className="mt-3 text-sm text-error">{errorMundo}</p>}
          <Boton
            type="button"
            onClick={confirmarMundos}
            disabled={seleccionados.length !== 2}
            cargando={enviandoMundos}
            className="mt-4 w-full"
          >
            {seleccionados.length === 2 ? "Empezar a jugar" : `Elegí ${2 - seleccionados.length} más`}
          </Boton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
