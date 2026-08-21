// Sección 6 (rebalanceo de economía): antes vivía duplicado en
// api/tienda/comprar/route.ts y en TiendaClient.tsx — mismos números,
// dos lugares para desincronizar. Ahora un solo origen de verdad para
// los dos.
//
// Una partida típica (nivel de calibración ~3-5, ~70% de aciertos) da
// ~100-130 Puntos (ver src/lib/practica/formulas.ts) — 120 como
// referencia. Objetivo explícito de esta tanda: la tienda tiene que
// sentirse como una meta a mediano plazo, no algo que se vacía en una
// tarde (un usuario compró TODO el catálogo con ~4 partidas cuando
// costaba ~1375 Puntos en total — ver 0054_tienda_rediseno.sql "Fase
// 2" para los precios viejos). Con estos números el catálogo completo
// suma ~23.200 Puntos, ~190 partidas.
//   - Utilidad (escudo/congelamiento/boost): 3-5 partidas (~350-600).
//   - Cosméticos de nivel bajo (fuentes básicas, marcos comunes):
//     8-15 partidas (~1000-2000).
//   - Escalón medio (marco platino/diamante): sube gradual hacia el
//     techo de prestigio, no hay un salto brusco de 2000 a 5000.
//   - Cosméticos de prestigio (marco Prodigio, fuente manuscrita):
//     30-50 partidas (~4000-6000) — un logro de semanas, no de un día.
export const COSTOS = {
  escudo: 350,
  congelamiento: 450,
  boost: 600,
  fuente_mono: 1000,
  fuente_serif: 1400,
  fuente_manuscrita: 5000,
  // Fase 8 ("Duelos..." tanda, ampliación de Tienda): 3 fuentes nuevas,
  // todas Google Fonts (next/font/google) — nunca dafont.com, por
  // licencias. Escalonadas entre las que ya había: impacto queda cerca
  // de mono/serif, script en un escalón medio, futurista un poco más
  // alto por lo distintiva que es (no llega al techo de prestigio de
  // manuscrita, que sigue siendo el tope del catálogo de fuentes).
  fuente_impacto: 1200,
  fuente_script: 1800,
  fuente_futurista: 2500,
  marco_bronce: 1000,
  marco_plata: 1300,
  marco_oro: 1700,
  marco_platino: 2200,
  marco_diamante: 3200,
  marco_prodigio: 5000,
} as const;

export type ItemComprable = keyof typeof COSTOS;
