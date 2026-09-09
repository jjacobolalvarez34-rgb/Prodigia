"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import ConvertirCuenta from "@/components/ConvertirCuenta";
import { MUNDOS_PAGOS, NOMBRE_MUNDO_PAGO, COLOR_MUNDO_PAGO, type MundoPago } from "@/lib/mundos/precios";

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

// Último paso del flujo (Fase 6/7 del rediseño): 2 mundos gratis en vez
// de 1 — RPC elegir_mundos_iniciales(text[]) (0112_flujo_bienvenida.sql),
// llamada una sola vez con los 2 slugs elegidos (llamar 2 veces la RPC
// vieja de 1 mundo rompía en la segunda porque ya no encontraba
// mundos_desbloqueados vacío). "Crear cuenta real" es opcional y no
// bloquea seguir como invitado — Fase 3: el invitado ya tiene un nombre
// autogenerado, nunca se le pide acá.
export default function FlujoElegirMundos() {
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<MundoPago[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarCuenta, setMostrarCuenta] = useState(false);

  function alternar(mundo: MundoPago) {
    setSeleccionados((actuales) => {
      if (actuales.includes(mundo)) return actuales.filter((m) => m !== mundo);
      if (actuales.length >= 2) return actuales;
      return [...actuales, mundo];
    });
  }

  async function confirmar() {
    if (seleccionados.length !== 2) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("elegir_mundos_iniciales", { p_mundos: seleccionados });
    // 0116: si la cuenta YA tiene mundos (p.ej. estado heredado de 1
    // mundo, o alguien que ya pasó por el flujo), la RPC lo rechaza con
    // "ya elegiste". Antes esto dejaba la pantalla trabada sin salida —
    // acá se reconoce y se manda a la home, que ya muestra sus mundos.
    if (rpcError) {
      if (rpcError.message?.includes("ya elegiste")) {
        router.push("/");
        router.refresh();
        return;
      }
      setError(rpcError.message ?? "No se pudo guardar. Probá de nuevo.");
      setEnviando(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Elegí tus 2 mundos</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Todos empiezan bloqueados — los 2 que elijas acá son gratis para siempre. Los demás se
          desbloquean después con Chispas, jugando.
        </p>
      </div>

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
              disabled={enviando || deshabilitado}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 px-4 py-5 text-center transition-colors disabled:opacity-50"
              style={{
                borderColor: elegido ? color : `color-mix(in oklab, ${color} 35%, transparent)`,
                background: elegido ? `color-mix(in oklab, ${color} 12%, transparent)` : undefined,
              }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: color }}>
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
      {error && <p className="text-sm text-error">{error}</p>}

      <Boton type="button" onClick={confirmar} disabled={seleccionados.length !== 2} cargando={enviando} className="w-full">
        {seleccionados.length === 2 ? "Empezar a jugar" : `Elegí ${2 - seleccionados.length} más`}
      </Boton>

      <div className="border-t border-border pt-5">
        {mostrarCuenta ? (
          <ConvertirCuenta inicial="form" />
        ) : (
          <button
            onClick={() => setMostrarCuenta(true)}
            className="w-full text-center text-sm text-texto-secundario hover:underline"
          >
            ¿Preferís crear una cuenta para guardar tu progreso desde ya?
          </button>
        )}
      </div>
    </div>
  );
}
