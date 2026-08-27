"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  IconSuma,
  IconMultiplicacion,
  IconDivision,
  IconLogica,
  IconGeometria,
  IconQuimica,
  IconAnatomia,
  IconMelodia,
  IconCandado,
} from "@/components/icons";
import Boton from "@/components/Boton";
import { MUNDOS_PAGOS, NOMBRE_MUNDO_PAGO, COLOR_MUNDO_PAGO, type MundoPago } from "@/lib/mundos/precios";

interface Props {
  userId: string;
  next: string;
  // Fase 12 (ajuste): una cuenta que ya guardó el nombre pero cerró la
  // pestaña antes de elegir su mundo gratis vuelve acá — no tiene
  // sentido pedirle el nombre de nuevo.
  saltarPasoNombre: boolean;
}

type Interes = "suma" | "resta" | "multiplicacion" | "division" | "logica";

const OPCIONES: { valor: Interes; nombre: string; Icono: typeof IconSuma }[] = [
  { valor: "suma", nombre: "Suma y resta", Icono: IconSuma },
  { valor: "multiplicacion", nombre: "Multiplicación", Icono: IconMultiplicacion },
  { valor: "division", nombre: "División", Icono: IconDivision },
  { valor: "logica", nombre: "Lógica", Icono: IconLogica },
];

// Fase 12 (ajuste): ya no hay un mundo gratis fijo — se elige acá,
// mismos 6 mundos y colores que MundoSelector.tsx (nav), un ícono por
// mundo ya usado en cada home respectiva.
const ICONO_MUNDO: Record<MundoPago, typeof IconSuma> = {
  numeria: IconSuma,
  geografia: IconGeometria,
  enigmia: IconLogica,
  quimia: IconQuimica,
  anatomia: IconAnatomia,
  melodia: IconMelodia,
};

export default function OnboardingForm({ userId, next, saltarPasoNombre }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState<"nombre" | "interes" | "mundo">(saltarPasoNombre ? "interes" : "nombre");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviandoMundo, setEnviandoMundo] = useState<MundoPago | null>(null);
  const [errorMundo, setErrorMundo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    // El primer nombre es gratis — cambiar_nombre_usuario (0054) solo
    // cobra Chispas a partir del segundo cambio (display_name ya no null).
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre.trim() });

    setEnviando(false);
    if (rpcError) {
      setError(rpcError.message ?? "No se pudo guardar. Probá de nuevo.");
      return;
    }
    setPaso("interes");
  }

  async function elegirInteres(interes: Interes | null) {
    setEnviando(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ interes_inicial: interes }).eq("id", userId);
    setEnviando(false);
    setPaso("mundo");
  }

  async function elegirMundo(mundo: MundoPago) {
    setEnviandoMundo(mundo);
    setErrorMundo(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("elegir_mundo_inicial", { p_mundo: mundo });
    if (rpcError) {
      setErrorMundo(rpcError.message ?? "No se pudo guardar. Probá de nuevo.");
      setEnviandoMundo(null);
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
      ) : paso === "interes" ? (
        <motion.div key="interes" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            ¿Qué te gustaría mejorar?
          </h1>
          <p className="mt-2 mb-6 text-sm text-texto-secundario">
            Sin presión — es solo para orientarte, no mide nada todavía.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {OPCIONES.map(({ valor, nombre: nombreOpcion, Icono }) => (
              <button
                key={valor}
                onClick={() => elegirInteres(valor)}
                disabled={enviando}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background px-4 py-5 transition-colors hover:border-primario/40 disabled:opacity-60"
              >
                <Icono className="h-5 w-5 text-primario" />
                <span className="text-sm font-medium text-foreground">{nombreOpcion}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => elegirInteres(null)}
            disabled={enviando}
            className="mt-4 w-full text-center text-sm text-texto-secundario hover:underline"
          >
            Prefiero explorar solo
          </button>
        </motion.div>
      ) : (
        <motion.div key="mundo" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Elegí tu primer mundo
          </h1>
          <p className="mt-2 mb-6 text-sm text-texto-secundario">
            Todos empiezan bloqueados — el que elijas acá es gratis para siempre. Los demás se
            desbloquean después con Chispas, jugando.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MUNDOS_PAGOS.map((mundo) => {
              const Icono = ICONO_MUNDO[mundo];
              const color = COLOR_MUNDO_PAGO[mundo];
              return (
                <button
                  key={mundo}
                  onClick={() => elegirMundo(mundo)}
                  disabled={enviandoMundo !== null}
                  className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 px-4 py-5 text-center transition-colors disabled:opacity-60"
                  style={{ borderColor: `color-mix(in oklab, ${color} 35%, transparent)` }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ background: color }}
                  >
                    <Icono className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{NOMBRE_MUNDO_PAGO[mundo]}</span>
                  {enviandoMundo === mundo ? (
                    <span className="text-xs text-texto-secundario">Guardando...</span>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
