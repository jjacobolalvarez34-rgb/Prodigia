// La tienda nueva, A + C (aprobada el 2026-10-14, docs/rediseno/tienda.html):
// arriba lo momentáneo (la rotación del día y la oferta del día) y abajo lo permanente
// (la calle con sus puestos). Lógica pura, compartida por la web y la app.

export type PuestoId = "herreria" | "estudio" | "pirotecnia" | "musica" | "arena" | "caligrafia" | "botica" | "mercado";

export interface Puesto {
  id: PuestoId;
  nombre: string;
  que: string;
  // Categorías de la tienda que vende (las mismas de mobile/src/lib/tienda.ts).
  categorias: string[];
  // Toldo: color del neón y el oscuro de las rayas.
  color: string;
  oscuro: string;
}

export const PUESTOS: Puesto[] = [
  { id: "herreria", nombre: "Herrería", que: "Marcos", categorias: ["marco", "marco_mundo"], color: "#FFB627", oscuro: "#5A3B00" },
  { id: "estudio", nombre: "Estudio", que: "Fondos y ciudad", categorias: ["fondo", "galeria", "ciudad_placa"], color: "#F48FB1", oscuro: "#4A1630" },
  { id: "pirotecnia", nombre: "Pirotecnia", que: "Estelas y efectos", categorias: ["estela", "efecto"], color: "#FF7A3D", oscuro: "#4A1A08" },
  { id: "musica", nombre: "Música", que: "Sonidos", categorias: ["sonido"], color: "#4FE0F5", oscuro: "#0B3A44" },
  { id: "arena", nombre: "Arena", que: "Emotes de duelo", categorias: ["emote"], color: "#B07CFF", oscuro: "#2C1A55" },
  { id: "caligrafia", nombre: "Caligrafía", que: "Tu nombre, tus puntos y títulos", categorias: ["fuente", "fuente_puntos", "animacion", "color", "titulo"], color: "#E8ECF8", oscuro: "#2A3152" },
  { id: "botica", nombre: "Botica", que: "Ayudas", categorias: ["utilidad"], color: "#3DDC97", oscuro: "#0D3A26" },
  { id: "mercado", nombre: "Mercado", que: "Paquetes", categorias: ["paquete"], color: "#5DE4FF", oscuro: "#0B2A3A" },
];

export function puestoDe(id: string | null | undefined): Puesto | null {
  return PUESTOS.find((p) => p.id === id) ?? null;
}

// ---------- Rotación del día ----------
export interface ItemRotable {
  item: string;
  categoria: string;
  rareza: "comun" | "raro" | "epico" | "legendario";
  vendible: boolean;
  temporada?: number;
}

function hash(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function azarDe(semilla: string) {
  let h = hash(semilla);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// La misma para todos el mismo día (UTC): 1 destacado (legendario o épico) y 3 más,
// de categorías distintas si se puede. `temporadaActual` deja afuera los marcos de
// otros meses.
export function rotacionDelDia(fechaIso: string, items: ItemRotable[], temporadaActual: number): { destacado: string | null; otros: string[] } {
  const azar = azarDe(`bazar:${fechaIso}`);
  const pool = items.filter((x) => x.vendible && (x.temporada == null || x.temporada === temporadaActual));
  const elegir = <T,>(xs: T[]) => xs[Math.floor(azar() * xs.length)];
  const top = pool.filter((x) => x.rareza === "legendario" || x.rareza === "epico");
  const destacado = top.length > 0 ? elegir(top) : null;
  const otros: string[] = [];
  const usadas = new Set<string>(destacado ? [destacado.categoria] : []);
  const resto = pool.filter((x) => x.item !== destacado?.item);
  for (let intento = 0; otros.length < 3 && intento < 60; intento++) {
    const x = elegir(resto);
    if (!x || otros.includes(x.item)) continue;
    if (usadas.has(x.categoria) && intento < 40) continue;
    usadas.add(x.categoria);
    otros.push(x.item);
  }
  return { destacado: destacado?.item ?? null, otros };
}

// Cuánto falta para que cambie la rotación (medianoche UTC).
export function msHastaCambioDiario(ahora: number = Date.now()): number {
  const d = new Date(ahora);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - ahora;
}

export function relojHasta(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
