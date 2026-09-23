import type { Continente } from "@/lib/practica/geografia";

// Centro y zoom por continente para react-simple-maps (mismo topojson real
// de siempre, /data/countries-110m.json) — cada uno necesita su propio
// encuadre para que el mapa se vea recortado a ese continente, no al
// mundo entero. Extraído de GeografiaMapa.tsx (retrofit Técnicas | Clases,
// ver docs/PARIDAD_MUNDOS.md fila 22/23) para que el visual animado nuevo
// de las lecciones (src/components/geografia/visuales/Mapa.tsx) use
// EXACTAMENTE el mismo recorte que ya usa la pantalla de práctica real, en
// vez de duplicar los números y arriesgar que se desalineen con el tiempo.
export const PROYECCION_POR_CONTINENTE: Record<Continente, { scale: number; center: [number, number] }> = {
  america: { scale: 220, center: [-75, 5] },
  europa: { scale: 480, center: [15, 55] },
  africa: { scale: 330, center: [18, 2] },
  // Asia + Oceanía es la región más ancha de las cuatro (de Turquía a
  // Nueva Zelanda) — el zoom queda más chico a propósito para que
  // entre todo el rango; algunos extremos (este de Rusia, NZ) quedan
  // más cerca del borde del mapa que en los otros continentes.
  asia_oceania: { scale: 155, center: [95, 15] },
};
