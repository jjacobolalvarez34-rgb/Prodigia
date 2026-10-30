# Editor de la placa en la web (2026-10-30)

Pedido: /perfil/editar era una lista de formularios sueltos (foto, nombre, color,
fondo propio, títulos) sin vista previa y sin poder cambiar marcos, fondos, fuentes,
etc. Se rehace a la altura del editor de la app (mobile/src/app/editar-placa.tsx).

## Plan
- [x] Ubicar la ruta: `src/app/[locale]/perfil/editar/page.tsx` (Graphify + git grep).
- [x] Funciones de la base: todas existen (no hace falta migración 0312):
  `elegir_marco_perfil`, `elegir_fondo_perfil`, `elegir_fondo_galeria`,
  `elegir_animacion_nombre`, `equipar_cosmetico` (fuente, fuente_puntos,
  ciudad_placa, estela, efecto, sonido), `elegir_titulo_activo`,
  `guardar_color_nombre`, `cambiar_nombre_usuario`, y las subidas de siempre
  (SubirAvatar / SubirFondoPerfil).
- [x] Lógica pura de opciones: `src/lib/placa/editorPlaca.ts` (+ test).
- [x] Vista previa: `src/components/placa/PlacaVistaPrevia.tsx` (perfil, tarjeta y fila
  de amigos, mismas piezas que /perfil y PlacaAmigo).
- [x] Editor cliente: `src/app/[locale]/perfil/editar/EditorPlaca.tsx` (pestañas).
- [x] Textos es/en (`Perfil.editorPlaca`).
- [x] Verificación: tsc, eslint, vitest, capturas.

## Avance
- Página `/perfil/editar` reescrita: server carga perfil, desbloqueos, cosméticos nuevos (aparte,
  por si falta 0248/0294), títulos (`mis_titulos`), niveles de mundo y galería; abajo sigue BorrarCuenta.
- `EditorPlaca.tsx`: 8 pestañas (Fondo, Marco, Nombre, Título, Foto, Puntos, Ciudad, Partida),
  filtro «Solo lo mío», contador «Tienes N de M», grupos (rango y neón, mundos, colores, especiales…).
  Lo tuyo se pone con un clic (actualiza al instante y `router.refresh()`); lo bloqueado se ve
  atenuado con candado y precio (Chispas/Cometas, «Nv. 40» en marcos de mundo, «Pro»), y al tocarlo
  se prueba sobre la Placa con un panel «cómo conseguirlo» + enlace al puesto de la tienda
  (`/tienda?puesto=…&item=…`) o a `/pro`. Nombre: tipografía, animación, color (vista previa al
  mover el selector, guardar/quitar) y cambio de nombre. Fondo: galería y subida de imagen propia.
- Lo que no se vende (piezas de eventos, colección, marcos de otros meses, Pionero) solo aparece
  si ya es tuyo (regla de no mostrar eventos antes de su fecha).
- Escritorio: Placa grande fija a la izquierda + tarjeta y fila de amigos. Teléfono: la fila de la
  Placa queda pegada arriba mientras eliges, con «Ir a la tienda» cuando estás probando algo.
- Sin migración nueva (todas las funciones existían).
- Verificado: `tsc --noEmit` limpio, eslint limpio en lo tocado, vitest `src/lib/placa` (9 tests) y
  `PlacaAmigo.test.ts` en verde, paridad es/en de claves.
- Capturas (banco `zz-galeria/placa.html`, `vite.placa.config.mjs`, `placa-captura.mjs`,
  `placa-movil.mjs`): `zz-galeria/capturas-placa/` (escritorio claro/oscuro, teléfono, tema «cozy», inglés).
- Pendiente/observado: en el banco no cargan las fuentes de next/font (las muestras «Aa» se ven
  con la letra base; en la web real sí). En tema claro con fondo, la animación «brillo» del nombre
  se ve oscura, igual que ya pasaba en /perfil (no se tocó NombreConFuente).
