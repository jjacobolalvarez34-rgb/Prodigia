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
  // Pedido en vivo (2026-09-15): consumibles de PARTIDA (no utilidades
  // pasivas como las 3 de arriba) — "hielo para detener el reloj 10
  // segundos" y "+3s al tiempo de la partida", usables a mitad de una
  // partida, prohibidos en duelos (gate 100% client-side, ver
  // ConsumiblesPartida.tsx). Precio bajo a propósito: se consumen 1 a 1
  // por uso, no por partida — más baratos que escudo/congelamiento/
  // boost, que duran hasta usarse una vez pero cuestan más por cubrir
  // una partida entera de protección.
  hielo: 300,
  tiempo_extra: 250,
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
  // Pedido en vivo (2026-09-15): "más fuentes para los nombres" — mismo
  // escalón que impacto/script (ninguna licencia especial, ambas
  // Google Fonts vía next/font/google).
  fuente_urbana: 1200,
  fuente_elegante: 1800,
  marco_bronce: 1000,
  marco_plata: 1300,
  marco_oro: 1700,
  marco_platino: 2200,
  marco_diamante: 3200,
  marco_prodigio: 5000,
  // Grupo B, Fase 1: 6 marcos temáticos (uno por mundo, assets reales
  // en public/marcos/) — un escalón arriba de platino, abajo de
  // diamante: exclusivos, pero el tope de prestigio sigue siendo
  // prodigio. A diferencia de los de rango, también exigen haber
  // alcanzado nivel_mundo >= 40 en ESE mundo (validado server-side en
  // comprar_item_tienda, ver 0104_marcos_tematicos_mundo.sql) — la
  // vidriera los muestra bloqueados hasta entonces, no solo caros.
  marco_numeria: 2400,
  marco_enigmia: 2400,
  marco_geografia: 2400,
  marco_quimia: 2400,
  marco_anatomia: 2400,
  marco_melodia: 2400,
  // Trigonometría/Historia (mundos 7 y 8): mismo precio y mismo gate de
  // nivel_mundo >= 40 que los 6 marcos anteriores.
  marco_trigonometria: 2400,
  marco_historia: 2400,
  // Grupo B, Fase 7: "Colección de Mundos" — los marcos de mundo de una
  // sola vez, con descuento (comprados sueltos costarían más), pero SIN
  // saltarse el requisito de nivel de cada uno — exige nivel_mundo >= 40
  // en TODOS a la vez (validado server-side en comprar_item_tienda, ver
  // 0107_paquete_marcos_mundo.sql y 0110_ocho_mundos.sql). Es un ítem de
  // coleccionista para quien ya juega todos los mundos, no un atajo
  // para principiantes. Precio actualizado de 11000 a 14500 al pasar de
  // 6 a 8 mundos (8 × 2400 = 19200 sueltos, ~24% de descuento, mismo
  // criterio que el precio original).
  paquete_marcos_mundo: 14500,
  // Fase 10 ("Tienda: animaciones y fondos"): mismo escalonado que las
  // fuentes (todo CSS, sin costo de licencia) — ondulante/brillo cerca
  // del piso, arcoiris/neon un poco más caras por ser más vistosas.
  animacion_ondulante: 1200,
  animacion_brillo: 1400,
  animacion_arcoiris: 1800,
  animacion_neon: 2200,
  // Pedido en vivo (2026-09-15): "agregar más efectos, glitch o nombres
  // que se deconstruyen" — un escalón arriba de neon, las más vistosas
  // de las 6 normales (sin contar prisma, exclusiva de Pro).
  animacion_glitch: 2000,
  animacion_deconstruccion: 2400,
  // Pedido en vivo (2026-09-15): "empieza con shuffle y decripte" — dos
  // escalones arriba del resto (no CSS, GSAP/JS real por instancia,
  // solo se ven en tu perfil propio o público — ver ANIMACIONES_PESADAS
  // en types/database.ts), consistente con lo que ya cuesta más lo que
  // es más vistoso/costoso de construir.
  animacion_shuffle: 2800,
  animacion_decrypted: 2800,
  // Fondos de tarjeta de perfil: mismo escalón que las animaciones —
  // nebulosa/dorado un poco más caros (degradé de 3 tonos más vistoso).
  fondo_oceano: 1600,
  fondo_bosque: 1600,
  fondo_aurora: 1600,
  fondo_dorado: 1800,
  fondo_nebulosa: 2000,
  // Tope de prestigio de los fondos — tu propia imagen (Supabase
  // Storage), no un degradé fijo — mismo escalón que marco_diamante/
  // fuente_futurista. A diferencia de los otros 5 fondos, comprarlo no
  // deja nada visible hasta que subes una imagen desde /perfil (ver
  // SubirFondoPerfil.tsx + guardar_fondo_perfil_url).
  fondo_personalizado: 4000,
  // Fase 4 (pagos): exclusivos de Prodigia Pro — gateados server-side
  // por profiles.plan = 'pro' (0146_prodigia_pro_gates_y_estadisticas.sql),
  // no solo por precio. Siguen costando Chispas: Pro te deja COMPRARLOS,
  // no te los regala.
  animacion_prisma: 3000,
  fondo_prodigio: 3000,
} as const;

export type ItemComprable = keyof typeof COSTOS;
