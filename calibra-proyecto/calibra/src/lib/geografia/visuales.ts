import type { VisualBase } from "@/lib/aprender/visuales";
import type { Continente } from "@/lib/practica/geografia";

// Visual propio de Geografía (prefijo "geografia."), pedido explícito del
// usuario: un mapa REAL animado (react-simple-maps + topojson, mismo que
// ya usa /geografia — GeografiaMapa.tsx) que resalta 1-4 países de un
// continente/sub-región, con el NOMBRE del país superpuesto — a
// diferencia de Enigmia/Numeria/Naipia, este es el primer visual del
// proyecto que envuelve un mapa real en vez de un primitivo dibujado a
// mano (cartas, casilleros, diagramas SVG por código).
//
// El componente (src/components/geografia/visuales/Mapa.tsx) SOLO dibuja:
// recorta el mapa al continente vía PROYECCION_POR_CONTINENTE (mismo
// recorte que la práctica real) y va revelando, uno a la vez, los países
// de `paisesIds` — sus coordenadas y nombre salen de
// resolverPaisesResaltados() en src/lib/geografia/visualesDatos.ts, nunca
// hardcodeados en el componente.
export interface VisualGeografiaMapa extends VisualBase {
  tipo: "geografia.mapa";
  continente: Continente;
  // 1 a 4 ids ISO numéricos (mismo formato que PAISES_POR_CONTINENTE),
  // en el orden en que se van revelando.
  paisesIds: string[];
}

export type VisualGeografia = VisualGeografiaMapa;
