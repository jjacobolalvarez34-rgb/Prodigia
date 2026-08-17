"use client";

import { useState, useSyncExternalStore } from "react";
import { setEfectosHabilitados } from "@/lib/efectos";

const CLAVE_PREGUNTADO = "prodigia-conexion-preguntado";

interface NetworkInformation {
  effectiveType?: string;
  saveData?: boolean;
}

// Sin suscripción real: se lee una sola vez, del mismo modo que
// Greeting.tsx lee la hora — useSyncExternalStore se encarga de que la
// primera pasada en el cliente coincida con el server (getServerSnapshot)
// y recién después re-chequee el valor real, sin el desfasaje de
// hidratación que tendría hacer esto con setState en un efecto.
function subscribe() {
  return () => {};
}

function detectarConexionLenta(): boolean {
  try {
    if (localStorage.getItem(CLAVE_PREGUNTADO)) return false;
    const nav = navigator as Navigator & { connection?: NetworkInformation };
    const conexion = nav.connection;
    if (!conexion) return false;
    return !!(conexion.saveData || conexion.effectiveType === "slow-2g" || conexion.effectiveType === "2g");
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

// Fase P2: si el navegador expone la Network Information API (best
// effort, no todos lo hacen) y detecta conexión lenta o "ahorro de
// datos" en la primera visita, preguntamos una sola vez si prefiere
// menos efectos — nunca bloquea el uso si no se puede detectar.
export default function DeteccionConexion() {
  const detectado = useSyncExternalStore(subscribe, detectarConexionLenta, getServerSnapshot);
  const [descartado, setDescartado] = useState(false);
  const visible = detectado && !descartado;

  function responder(activar: boolean) {
    setEfectosHabilitados(activar);
    try {
      localStorage.setItem(CLAVE_PREGUNTADO, "1");
    } catch {
      // no crítico
    }
    setDescartado(true);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-lg sm:inset-x-auto sm:right-4">
      <p className="text-sm text-foreground">
        Notamos que tu conexión anda lenta — ¿querés desactivar los efectos visuales extra? Podés
        cambiarlo cuando quieras en Ajustes.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => responder(false)}
          className="rounded-lg bg-primario px-3 py-1.5 text-sm font-medium text-white"
        >
          Desactivar
        </button>
        <button onClick={() => responder(true)} className="text-sm text-texto-secundario hover:underline">
          Dejarlos activados
        </button>
      </div>
    </div>
  );
}
