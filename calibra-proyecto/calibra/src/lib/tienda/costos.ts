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
// Economía nueva (0280, PLAN_ECONOMIA.md §4.2): una partida da ~12–20 Chispas, así
// que los precios bajaron y los cosméticos cuestan según su rareza (común 400,
// raro 1200, épico 3000). Lo legendario se compra solo con Cometas (600): su
// número acá (6000) es solo la referencia que usa la base para convertir un
// repetido de cápsula en Chispas. Los comentarios de abajo cuentan la historia
// de cada precio; los números vigentes son estos.
export const PRECIO_RAREZA_CHISPAS = { comun: 400, raro: 1200, epico: 3000, legendario: 6000 } as const;
export const PRECIO_LEGENDARIO_COMETAS = 600;
// Cosméticos de antes de 0248 que son legendarios: solo con Cometas.
export const SOLO_COMETAS = ["fuente_manuscrita", "marco_prodigio", "marco_neon_violeta", "marco_neon_cian", "marco_neon_magenta"] as const;

export const COSTOS = {
  escudo: 120,
  congelamiento: 150,
  boost: 150,
  // Pedido en vivo (2026-09-15): consumibles de PARTIDA (no utilidades
  // pasivas como las 3 de arriba) — "hielo para detener el reloj 10
  // segundos" y "+3s al tiempo de la partida", usables a mitad de una
  // partida, prohibidos en duelos (gate 100% client-side, ver
  // ConsumiblesPartida.tsx). Precio bajo a propósito: se consumen 1 a 1
  // por uso, no por partida — más baratos que escudo/congelamiento/
  // boost, que duran hasta usarse una vez pero cuestan más por cubrir
  // una partida entera de protección.
  hielo: 60,
  tiempo_extra: 50,
  fuente_mono: 400,
  fuente_serif: 1200,
  fuente_manuscrita: 6000,
  // Fase 8 ("Duelos..." tanda, ampliación de Tienda): 3 fuentes nuevas,
  // todas Google Fonts (next/font/google) — nunca dafont.com, por
  // licencias. Escalonadas entre las que ya había: impacto queda cerca
  // de mono/serif, script en un escalón medio, futurista un poco más
  // alto por lo distintiva que es (no llega al techo de prestigio de
  // manuscrita, que sigue siendo el tope del catálogo de fuentes).
  fuente_impacto: 400,
  fuente_script: 1200,
  fuente_futurista: 3000,
  // Pedido en vivo (2026-09-15): "más fuentes para los nombres" — mismo
  // escalón que impacto/script (ninguna licencia especial, ambas
  // Google Fonts vía next/font/google).
  fuente_urbana: 400,
  fuente_elegante: 1200,
  marco_bronce: 400,
  marco_plata: 400,
  marco_oro: 1200,
  marco_platino: 1200,
  marco_diamante: 3000,
  marco_prodigio: 6000,
  // Pedido 2026-09-22 (video de referencia del usuario, "efecto neón" —
  // ver el comentario largo en src/types/database.ts): un escalón por
  // encima de prodigio, mismo precio los 3 (son variantes de color de
  // la misma rareza, no una progresión entre ellos) — solo Chispas,
  // sin requisito de nivel_mundo, mismo criterio que bronce..prodigio.
  marco_neon_violeta: 6000,
  marco_neon_cian: 6000,
  marco_neon_magenta: 6000,
  // Grupo B, Fase 1: 6 marcos temáticos (uno por mundo, assets reales
  // en public/marcos/) — un escalón arriba de platino, abajo de
  // diamante: exclusivos, pero el tope de prestigio sigue siendo
  // prodigio. A diferencia de los de rango, también exigen haber
  // alcanzado nivel_mundo >= 40 en ESE mundo (validado server-side en
  // comprar_item_tienda, ver 0104_marcos_tematicos_mundo.sql) — la
  // vidriera los muestra bloqueados hasta entonces, no solo caros.
  marco_numeria: 3000,
  marco_enigmia: 3000,
  marco_geografia: 3000,
  marco_quimia: 3000,
  marco_anatomia: 3000,
  marco_melodia: 3000,
  // Trigonometría/Historia (mundos 7 y 8): mismo precio y mismo gate de
  // nivel_mundo >= 40 que los 6 marcos anteriores.
  marco_trigonometria: 3000,
  marco_historia: 3000,
  // Calculia (mundo 9): mismo precio y mismo gate de nivel_mundo >= 40
  // que los 8 marcos anteriores.
  marco_calculia: 3000,
  // Circuitia (mundo 10): mismo precio y mismo gate de nivel_mundo >= 40
  // que los 9 marcos anteriores.
  marco_circuitia: 3000,
  // Estadística/Naipia/Codia (mundos 11-13): mismo precio y mismo gate de
  // nivel_mundo >= 40 que los 10 marcos anteriores.
  marco_estadistica: 3000,
  marco_naipia: 3000,
  marco_codia: 3000,
  // Dinamia y Vitalia (mundos 14-15, 0263): igual que los anteriores.
  marco_dinamia: 3000,
  marco_vitalia: 3000,
  // Grupo B, Fase 7: "Colección de Mundos" — los marcos de mundo de una
  // sola vez, con descuento (comprados sueltos costarían más), pero SIN
  // saltarse el requisito de nivel de cada uno — exige nivel_mundo >= 40
  // en TODOS a la vez (validado server-side en comprar_item_tienda, ver
  // 0107_paquete_marcos_mundo.sql, 0110_ocho_mundos.sql y
  // 0166_nueve_mundos.sql). Es un ítem de coleccionista para quien ya
  // juega todos los mundos, no un atajo para principiantes. Precio
  // actualizado de 14500 a 16200 al pasar de 8 a 9 mundos (9 × 2400 =
  // 21600 sueltos, ~25% de descuento, mismo criterio que el precio
  // original). Ahora de 16200 a 18000 al pasar de 9 a 10 mundos (10 ×
  // 2400 = 24000 sueltos, mismo ~25% de descuento). Ahora de 18000 a
  // 27000 con 15 mundos (0263: 15 × 2400 − 25 %); antes 23400 al pasar de 10 a 13 mundos (13 × 2400 = 31200 sueltos, mismo
  // ~25% de descuento) — DEBE coincidir con el precio dentro de
  // comprar_item_tienda (0190_trece_mundos.sql).
  paquete_marcos_mundo: 33750,
  // Fase 10 ("Tienda: animaciones y fondos"): mismo escalonado que las
  // fuentes (todo CSS, sin costo de licencia) — ondulante/brillo cerca
  // del piso, arcoiris/neon un poco más caras por ser más vistosas.
  animacion_ondulante: 400,
  animacion_brillo: 1200,
  animacion_arcoiris: 1200,
  animacion_neon: 1200,
  // Pedido en vivo (2026-09-15): "agregar más efectos, glitch o nombres
  // que se deconstruyen" — un escalón arriba de neon, las más vistosas
  // de las 6 normales (sin contar prisma, exclusiva de Pro).
  animacion_glitch: 1200,
  animacion_deconstruccion: 3000,
  // Pedido en vivo (2026-09-15): "el de glitch, me gustó cómo se ve" —
  // versión más intensa/vistosa del glitch de arriba (más cortes de
  // clip-path, ráfagas más frecuentes, inspirada en el GlitchText de
  // React Bits pero recreada a mano en CSS para este proyecto, sin
  // depender de JS por instancia). Un escalón arriba de deconstruccion,
  // la más vistosa de las CSS-only (shuffle/decrypted siguen siendo las
  // únicas con JS real, por eso cuestan más).
  animacion_glitch_intenso: 3000,
  // Pedido en vivo (2026-09-15): "empieza con shuffle y decripte" — dos
  // escalones arriba del resto (no CSS, GSAP/JS real por instancia,
  // solo se ven en tu perfil propio o público — ver ANIMACIONES_PESADAS
  // en types/database.ts), consistente con lo que ya cuesta más lo que
  // es más vistoso/costoso de construir.
  animacion_shuffle: 3000,
  animacion_decrypted: 3000,
  // Fondos de tarjeta de perfil: mismo escalón que las animaciones —
  // nebulosa/dorado un poco más caros (degradé de 3 tonos más vistoso).
  fondo_oceano: 1200,
  fondo_bosque: 1200,
  fondo_aurora: 1200,
  fondo_dorado: 1200,
  fondo_nebulosa: 1200,
  // Tope de prestigio de los fondos — tu propia imagen (Supabase
  // Storage), no un degradé fijo — mismo escalón que marco_diamante/
  // fuente_futurista. A diferencia de los otros 5 fondos, comprarlo no
  // deja nada visible hasta que subes una imagen desde /perfil (ver
  // SubirFondoPerfil.tsx + guardar_fondo_perfil_url).
  fondo_personalizado: 3000,
  // Pedido en vivo (2026-09-15): "¿podrías permitir cambiar el color del
  // nombre?" — un solo desbloqueo (no un catálogo de swatches), mismo
  // escalón que fuente_script/fondo_aurora.
  color_nombre_personalizado: 1200,
  // Fase 4 (pagos): exclusivos de Prodigia Pro — gateados server-side
  // por profiles.plan = 'pro' (0146_prodigia_pro_gates_y_estadisticas.sql),
  // no solo por precio. Siguen costando Chispas: Pro te deja COMPRARLOS,
  // no te los regala.
  animacion_prisma: 3000,
  fondo_prodigio: 3000,
} as const;

export type ItemComprable = keyof typeof COSTOS;
