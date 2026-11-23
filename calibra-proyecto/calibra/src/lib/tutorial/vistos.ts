// Qué recorridos del tutorial ya vio el jugador (web). Se guarda en la cuenta (0320:
// profiles.tutoriales_vistos) para no repetirlo en la app, y también en el navegador
// para que funcione al instante y aunque la 0320 no esté aplicada.
import { createClient } from "@/lib/supabase/client";

const CLAVE = "prodigia-tutoriales-vistos";

function leerLocal(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function guardarLocal(s: Set<string>) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...s]));
  } catch {
    // Sin almacenamiento (modo privado): se vuelve a mostrar, no rompe nada.
  }
}

export async function leerVistos(): Promise<Set<string>> {
  const vistos = leerLocal();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("tutoriales_vistos").eq("id", user.id).maybeSingle();
      for (const id of ((data as { tutoriales_vistos?: string[] } | null)?.tutoriales_vistos ?? [])) vistos.add(id);
    }
  } catch {
    // Sin red o sin la columna: queda lo del navegador.
  }
  return vistos;
}

export function marcarVisto(id: string) {
  const s = leerLocal();
  s.add(id);
  guardarLocal(s);
  createClient()
    .rpc("marcar_tutorial_visto", { p_id: id })
    .then(
      () => undefined,
      () => undefined,
    );
}

export async function olvidarVistos() {
  guardarLocal(new Set());
  try {
    await createClient().rpc("olvidar_tutoriales");
  } catch {
    // Nada.
  }
}

// El botón «?» de cada sección pide su recorrido con este evento.
export const EVENTO_TUTORIAL = "prodigia:tutorial";
export function pedirRecorrido(id: string) {
  window.dispatchEvent(new CustomEvent(EVENTO_TUTORIAL, { detail: id }));
}
