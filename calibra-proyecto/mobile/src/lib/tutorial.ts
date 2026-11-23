// Qué recorridos del tutorial guiado ya vio el jugador (app). Igual que la web
// (calibra/src/lib/tutorial/vistos.ts): en la cuenta (0320, profiles.tutoriales_vistos)
// para no repetir lo que vio en la web, y en el teléfono para que funcione sin red.
import { marcarVista, yaVista } from "./ayudas";
import { supabase } from "./supabase";

let enCuenta: Set<string> | null = null;

async function vistosEnCuenta(): Promise<Set<string>> {
  if (enCuenta) return enCuenta;
  try {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    if (!uid) return new Set();
    const { data } = await supabase.from("profiles").select("tutoriales_vistos").eq("id", uid).maybeSingle();
    enCuenta = new Set(((data as { tutoriales_vistos?: string[] } | null)?.tutoriales_vistos ?? []) as string[]);
  } catch {
    enCuenta = new Set();
  }
  return enCuenta;
}

export async function recorridoVistoEn(id: string): Promise<boolean> {
  if (await yaVista(`tutorial:${id}`)) return true;
  return (await vistosEnCuenta()).has(id);
}

export function marcarRecorridoVistoEn(id: string) {
  marcarVista(`tutorial:${id}`);
  enCuenta?.add(id);
  supabase.rpc("marcar_tutorial_visto", { p_id: id }).then(
    () => undefined,
    () => undefined,
  );
}

// «Ver los tutoriales otra vez» (Ajustes): lo local lo borra olvidarAyudas().
export async function olvidarRecorridosEnCuenta() {
  enCuenta = new Set();
  try {
    await supabase.rpc("olvidar_tutoriales");
  } catch {
    // Nada.
  }
}
