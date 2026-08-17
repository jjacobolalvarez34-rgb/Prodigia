"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { IconSuma, IconMultiplicacion, IconDivision, IconLogica } from "@/components/icons";
import Boton from "@/components/Boton";

interface Props {
  userId: string;
  next: string;
}

type Interes = "suma" | "resta" | "multiplicacion" | "division" | "logica";

const OPCIONES: { valor: Interes; nombre: string; Icono: typeof IconSuma }[] = [
  { valor: "suma", nombre: "Suma y resta", Icono: IconSuma },
  { valor: "multiplicacion", nombre: "Multiplicación", Icono: IconMultiplicacion },
  { valor: "division", nombre: "División", Icono: IconDivision },
  { valor: "logica", nombre: "Lógica", Icono: IconLogica },
];

export default function OnboardingForm({ userId, next }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState<"nombre" | "interes">("nombre");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: nombre.trim() })
      .eq("id", userId);

    setEnviando(false);
    if (updateError) {
      setError("No se pudo guardar. Probá de nuevo.");
      return;
    }
    setPaso("interes");
  }

  async function elegirInteres(interes: Interes | null) {
    setEnviando(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ interes_inicial: interes }).eq("id", userId);
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
      )}
    </AnimatePresence>
  );
}
