import AsyncStorage from "@react-native-async-storage/async-storage";
import { CLAVE_CAPSULAS_ABRIENDO, conMarca, leerMarcas, revisarMarcas, sinMarca, type CapsulaSinVer, type MarcaApertura } from "@/lib/recompensas/capsulasSinVer";
import { supabase } from "./supabase";

// Las marcas de @/lib/recompensas/capsulasSinVer.ts en la app (AsyncStorage), igual
// que la web: se anota la cápsula justo antes de pedir su premio y se borra al verlo;
// si el jugador se fue en medio, al volver a Recompensas se le muestra lo que salió.
// Se lleva una copia en memoria para que anotar y borrar sean al instante (lo de
// AsyncStorage es asíncrono y la revisión puede correr enseguida).

let marcas: MarcaApertura[] | null = null;

async function cargar(): Promise<MarcaApertura[]> {
  if (marcas) return marcas;
  try {
    const leidas = leerMarcas(await AsyncStorage.getItem(CLAVE_CAPSULAS_ABRIENDO));
    // Pudo anotarse algo mientras se leía.
    marcas = marcas ? [...leidas.filter((m) => !marcas!.some((x) => x.id === m.id)), ...marcas] : leidas;
  } catch {
    marcas = marcas ?? [];
  }
  return marcas;
}

function guardar(m: MarcaApertura[]) {
  marcas = m;
  const p = m.length === 0 ? AsyncStorage.removeItem(CLAVE_CAPSULAS_ABRIENDO) : AsyncStorage.setItem(CLAVE_CAPSULAS_ABRIENDO, JSON.stringify(m));
  p.catch(() => undefined);
}

export async function marcarAbriendo(id: string): Promise<void> {
  guardar(conMarca(await cargar(), id, Date.now()));
}

export function marcarVista(id: string) {
  // Si todavía no se leyó lo guardado, se borra igual al leerlo.
  if (marcas) guardar(sinMarca(marcas, id));
  else void cargar().then((m) => guardar(sinMarca(m, id)));
}

export async function capsulasSinVer(): Promise<CapsulaSinVer[]> {
  const antes = await cargar();
  if (antes.length === 0) return [];
  const { sinVer, quedan } = await revisarMarcas(supabase, antes, Date.now());
  // Mientras se consultaba pudo cambiar: se borran solo las resueltas.
  const siguen = new Set(quedan.map((m) => m.id));
  const resueltas = new Set(antes.filter((m) => !siguen.has(m.id)).map((m) => m.id));
  const actuales = (marcas ?? []).filter((m) => !resueltas.has(m.id));
  guardar(actuales);
  const ids = new Set(actuales.map((m) => m.id));
  return sinVer.filter((s) => ids.has(s.capsula.id));
}
