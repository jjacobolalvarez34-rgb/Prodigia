import { CENTROIDES } from "./centroides";
import { PAISES_POR_CONTINENTE, type Continente } from "@/lib/practica/geografia";

// «Cómo se resuelve» de Geografía (pedido 2026-10-18). En el mapa no hay cuenta que
// mostrar, pero sí cómo ubicarse: hacia dónde y a cuántos km está el país correcto
// desde el que tocaste, y un vecino de referencia. Los centros salen del mismo mapa
// que se dibuja (centroides.ts, generado con d3-geo).

const R_TIERRA = 6371;
const rad = (g: number) => (g * Math.PI) / 180;

function distanciaKm(a: [number, number], b: [number, number]): number {
  const [lon1, lat1] = a.map(rad);
  const [lon2, lat2] = b.map(rad);
  const h = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  return 2 * R_TIERRA * Math.asin(Math.sqrt(h));
}

// Rumbo de a hacia b, en 8 direcciones.
function direccion(a: [number, number], b: [number, number]): string {
  const [lon1, lat1] = a.map(rad);
  const [lon2, lat2] = b.map(rad);
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const grados = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return ["norte", "noreste", "este", "sureste", "sur", "suroeste", "oeste", "noroeste"][Math.round(grados / 45) % 8];
}

const NOMBRE_CONTINENTE: Record<Continente, string> = { america: "América", europa: "Europa", africa: "África", asia_oceania: "Asia y Oceanía" };

function continenteDe(id: string): Continente | null {
  for (const [c, lista] of Object.entries(PAISES_POR_CONTINENTE) as [Continente, { id: string }[]][]) if (lista.some((p) => p.id === id)) return c;
  return null;
}

// El vecino más cercano (por su centro) dentro del mismo continente del juego.
function vecino(id: string): string | null {
  const c = continenteDe(id);
  const centro = CENTROIDES[id];
  if (!c || !centro) return null;
  let mejor: { nombre: string; d: number } | null = null;
  for (const p of PAISES_POR_CONTINENTE[c]) {
    if (p.id === id || !CENTROIDES[p.id]) continue;
    const d = distanciaKm(centro, CENTROIDES[p.id]);
    if (!mejor || d < mejor.d) mejor = { nombre: p.nombre, d };
  }
  return mejor?.nombre ?? null;
}

const redondearKm = (km: number) => (km < 1000 ? Math.round(km / 50) * 50 : Math.round(km / 100) * 100).toLocaleString("es");

export function pasosMapa(correcto: { id: string; nombre: string }, tocado: { id: string; nombre: string } | null): string[] {
  const pasos: string[] = [];
  const c = continenteDe(correcto.id);
  const a = tocado ? CENTROIDES[tocado.id] : undefined;
  const b = CENTROIDES[correcto.id];
  if (tocado && a && b) {
    pasos.push(`Tocaste ${tocado.nombre}. ${correcto.nombre} queda hacia el ${direccion(a, b)}, a unos ${redondearKm(distanciaKm(a, b))} km`);
  } else if (c) {
    pasos.push(`${correcto.nombre} está en ${NOMBRE_CONTINENTE[c]}`);
  }
  const v = vecino(correcto.id);
  if (v) pasos.push(`Para ubicarlo la próxima vez: está junto a ${v}`);
  pasos.push(`Respuesta: ${correcto.nombre}`);
  return pasos;
}

export function pasosAvanzada(pregunta: string, respuesta: string): string[] {
  return [`${pregunta.replace(/^¿/, "").replace(/\?$/, "")}: ${respuesta}`];
}
