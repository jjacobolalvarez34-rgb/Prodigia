"use client";

import { CLAVE_CAPSULAS_ABRIENDO, conMarca, leerMarcas, revisarMarcas, sinMarca, type CapsulaSinVer, type MarcaApertura } from "./capsulasSinVer";

// Las marcas de capsulasSinVer.ts en este navegador (localStorage).

function leer(): MarcaApertura[] {
  try {
    return leerMarcas(localStorage.getItem(CLAVE_CAPSULAS_ABRIENDO));
  } catch {
    return [];
  }
}

function guardar(m: MarcaApertura[]) {
  try {
    if (m.length === 0) localStorage.removeItem(CLAVE_CAPSULAS_ABRIENDO);
    else localStorage.setItem(CLAVE_CAPSULAS_ABRIENDO, JSON.stringify(m));
  } catch {
    // Sin almacenamiento: el premio igual quedó en la cuenta; solo no se re-muestra.
  }
}

export function marcarAbriendoWeb(id: string) {
  guardar(conMarca(leer(), id, Date.now()));
}

export function marcarVistaWeb(id: string) {
  guardar(sinMarca(leer(), id));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function capsulasSinVerWeb(sb: { from: (tabla: string) => any }): Promise<CapsulaSinVer[]> {
  const marcas = leer();
  if (marcas.length === 0) return [];
  const { sinVer, quedan } = await revisarMarcas(sb, marcas, Date.now());
  // Mientras se consultaba pudo cambiar (otra pestaña): se borran solo las resueltas.
  const siguen = new Set(quedan.map((m) => m.id));
  const resueltas = new Set(marcas.filter((m) => !siguen.has(m.id)).map((m) => m.id));
  const actuales = leer().filter((m) => !resueltas.has(m.id));
  guardar(actuales);
  const ids = new Set(actuales.map((m) => m.id));
  return sinVer.filter((s) => ids.has(s.capsula.id));
}
