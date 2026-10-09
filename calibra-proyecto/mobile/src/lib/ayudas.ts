import AsyncStorage from "@react-native-async-storage/async-storage";
import { mostrarAviso } from "~/ui/Aviso";

// Ayudas de una sola vez (PLAN_PRIMERA_VEZ_APP.md, pasos 8 y 10): las pistas de la
// primera partida y el globo que aparece la primera vez que entras a cada sección.
// Lo ya visto queda en el teléfono; «Ver el tutorial otra vez» (Ajustes) lo borra.
const PREFIJO = "prodigia:ayuda:";
let vistas: Set<string> | null = null;
let cargando: Promise<Set<string>> | null = null;

async function cargarVistas(): Promise<Set<string>> {
  if (vistas) return vistas;
  if (!cargando) {
    cargando = (async () => {
      try {
        const claves = await AsyncStorage.getAllKeys();
        vistas = new Set(claves.filter((k) => k.startsWith(PREFIJO)).map((k) => k.slice(PREFIJO.length)));
      } catch {
        vistas = new Set();
      }
      return vistas;
    })();
  }
  return cargando;
}

export async function yaVista(id: string): Promise<boolean> {
  return (await cargarVistas()).has(id);
}

export async function marcarVista(id: string) {
  (await cargarVistas()).add(id);
  AsyncStorage.setItem(PREFIJO + id, "1").catch(() => undefined);
}

// Borra todas las ayudas vistas (para ver el tutorial otra vez).
export async function olvidarAyudas() {
  try {
    const claves = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(claves.filter((k) => k.startsWith(PREFIJO)));
  } catch {
    // Nada que hacer.
  }
  vistas = new Set();
}

// ---------- Pistas de la primera partida ----------
export type EventoSprint = "inicio" | "acierto" | "tres_seguidas" | "error";

const PISTAS_SPRINT: Record<EventoSprint, string> = {
  inicio: "⏱️ Responde lo más rápido que puedas: cada acierto en racha te suma segundos.",
  acierto: "¡Bien! Cada acierto rápido te suma segundos al reloj.",
  tres_seguidas: "🔥 ¡3 seguidas! Subiste de nivel en este tema.",
  error: "Fallar no te quita nada: bajas un poquito para afianzar.",
};

// Se llama en cada evento de la partida (no en duelos); cada pista sale una sola vez.
export async function pistaSprint(evento: EventoSprint) {
  const id = `sprint:${evento}`;
  if (await yaVista(id)) return;
  await marcarVista(id);
  mostrarAviso(PISTAS_SPRINT[evento], "info");
}

// ---------- Globos de cada sección ----------
export const GLOBOS = {
  mundos: { titulo: "Las 15 ciudades", texto: "Cada una tiene su propio día y su propia noche. Toca una para practicar o aprender." },
  mundo: { titulo: "Practicar y Aprender", texto: "Practicar: partidas de 60 segundos que se adaptan a ti. Aprender: técnicas cortas para resolver más rápido." },
  competir: { titulo: "Competir", texto: "Rankeds contra gente de tu nivel: ganar sube tu ELO, de Bronce a Prodigio. También hay casuales y la liga de la semana." },
  social: { titulo: "Social", texto: "Agrega amigos para retarlos en vivo y únete a un clan para sumar puntos juntos." },
  tienda: { titulo: "La tienda", texto: "Gasta tus Chispas en marcos, fondos, fuentes y ayudas para las partidas. Se ganan jugando." },
  recompensas: { titulo: "Recompensas", texto: "Cada partida enciende estrellas en su ciudad. Con 7, la constelación se dibuja y te da su premio." },
  resultado: { titulo: "Tu resultado", texto: "Exp: sube tu nivel y el de la ciudad. Chispas: la moneda del juego. Racha 🔥: juega cada día para que crezca." },
  perfil: { titulo: "Tu perfil", texto: "Tu placa la ven todos: personalízala. Aquí también están tus logros y estadísticas." },
} as const;

export type IdGlobo = keyof typeof GLOBOS;

// ---------- Dónde están la racha y las Chispas (para el recorrido) ----------
export type Rect = { x: number; y: number; w: number; h: number };
export type IdHud = "racha" | "chispas";
const medidores = new Map<IdHud, Set<() => Promise<Rect | null>>>();

// Cada barra de arriba (una por pestaña) se anota; vale la que está en pantalla.
export function registrarMedidorHud(id: IdHud, medir: () => Promise<Rect | null>) {
  if (!medidores.has(id)) medidores.set(id, new Set());
  medidores.get(id)!.add(medir);
  return () => {
    medidores.get(id)?.delete(medir);
  };
}

export async function medirHud(id: IdHud, anchoPantalla: number): Promise<Rect | null> {
  for (const medir of medidores.get(id) ?? []) {
    const r = await medir();
    if (r && r.w > 0 && r.x >= 0 && r.x + r.w <= anchoPantalla + 1) return r;
  }
  return null;
}
