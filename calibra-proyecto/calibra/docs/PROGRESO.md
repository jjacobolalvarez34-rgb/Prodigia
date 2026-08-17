# Progreso — auditoría GRUPO 2 (feedback) + deduplicación de problemas

Última actualización: 2026-08-17 (cuarta tanda del día). Antes de esto: se encontraron y arreglaron 2 bugs reales en vivo (ProfileMenu con el mismo problema de gsap/autoAlpha que el tour, y un error de `permission denied for table profiles` post-migración 0035 — ver abajo). También se identificó que este entorno tiene problemas de caché de Turbopack cuando `next dev` y `next build` corren en simultáneo (un panic real en un momento, y un `ReferenceError` de una variable ya eliminada del código fuente sirviéndose desde caché vieja) — de acá en más, verificación con `tsc`/`eslint`/`vitest` mientras el dev server está corriendo, `next build` solo con el dev server apagado.

## Bugs en vivo arreglados en esta tanda (fuera de lo pedido, encontrados mientras el usuario probaba)

1. **Ícono de perfil no abría nada.** `AbanicoBurbuja.tsx` (N3) usaba gsap directo con el mismo patrón `autoAlpha:0 → autoAlpha:1` que ya había fallado en SplitText — mismo síntoma (contenido que nunca se vuelve visible). Reemplazado por framer-motion (mismo motor que el resto del dropdown, ya probado confiable).
2. **`permission denied for table profiles` al cerrar partidas.** Migración `0036_fix_permisos_xp_tienda.sql` — `registrar_xp_diario` y `comprar_item_tienda` (las funciones que efectivamente ganan Puntos y compran en la tienda) no tenían `security definer`, así que quedaron bloqueadas por el `GRANT` restrictivo de la migración 0035 de la tanda anterior. Se les agregó `security definer` (mismo cuerpo, sin cambios de lógica).
3. **Caché de Turbopack corrupta** dos veces en esta sesión — un panic real (`Restore of Meta ... failed`) y código viejo sirviéndose después de una edición. Se resolvió borrando `.next` y reiniciando; causa probable: correr `next dev` y `next build` al mismo tiempo, comparten el mismo directorio de caché.

## Auditoría GRUPO 2 — sistema de feedback compartido, runner por runner

Confirmado contra el código real qué importa cada uno de: PuntajeCorner, BonusTiempo (vía BarraTiempo/useBonusTiempo), TarjetaSprint (flashcard), PixelTransition en error (RevelarRespuesta), racha de fuego (RachaFuego), escudo rompiéndose (EscudoIcon).

| Runner | Antes de esta tanda | Ahora |
|---|---|---|
| Aritmética (`SprintRunner.tsx`) | Los 6, propios (no vía TarjetaSprint, pero equivalentes) | Sin cambios — ya estaba completo |
| Fracciones | 5 de 6 — **faltaba RachaFuego** | Completo |
| Enigmia (Memoria/Patrones/Deducción/Computacional — 1 solo runner) | 5 de 6 — **faltaba RachaFuego** | Completo |
| Geografía (todos los continentes — 1 solo runner) | 5 de 6 — **faltaba RachaFuego** | Completo |
| **Decimales, Potencias, Álgebra** (comparten `EnunciadoSprintRunner.tsx`) | **0 de 6** — motor propio sin ninguna pieza del sistema compartido, timing distinto (700/1400 en vez de 550/900) | Completo, reconstruido sobre el mismo patrón que Fracciones |

**Hallazgo más grande que lo reportado**: el usuario había confirmado el hueco en "Decimales" — pero Decimales, Potencias Y Álgebra comparten literalmente el mismo archivo (`EnunciadoSprintRunner.tsx`), así que el hueco real eran 3 temas, no 1. Además, Fracciones/Enigmia/Geografía tenían un hueco más chico y no reportado: a ninguno de los tres le llegó nunca `RachaFuego` — solo Aritmética la tenía.

**Arreglado**: se agregó `RachaFuego` (con el `racha_actual` que la API ya devolvía, solo no se leía) a Fracciones/Enigmia/Geografía; se reconstruyó `EnunciadoSprintRunner.tsx` con `TarjetaSprint`, `BarraTiempo`/`useBonusTiempo`, `RachaFuego`, y el mismo timing 550/900 — cubre Decimales, Potencias y Álgebra de una sola vez porque comparten el archivo.

## ¿Vale la pena unificar los 5 runners en uno solo parametrizado?

**No lo hice — quedó en evaluación, como pediste.** Mi recomendación:

- **Ya existe unificación real a nivel de piezas visuales** (TarjetaSprint, BarraTiempo, useBonusTiempo, RachaFuego, EscudoIcon, RevelarRespuesta, y ahora `generarSinRepetir`) — lo que se duplica NO es la UI de feedback, es el "esqueleto" alrededor: timer, manejo de la respuesta del POST a `/api/attempts`, cálculo de intensidad de puntaje, consumo de escudos, bonus de tiempo, y ahora dedup — ese esqueleto se repite casi idéntico en los 5 archivos (~150-200 líneas cada uno).
- **Invasividad: media.** No es un rewrite total (las piezas visuales ya están unificadas), pero sí tocar los 5 archivos a fondo, con 3 casos particulares reales que complican un `useSprintRunner` genérico: Aritmética tiene fantasma de duelo + nivel por operación (no un solo nivel) + nudge de ranking; Enigmia tiene la fase de memorización que retrasa el arranque del cronómetro; Geografía responde con click en el mapa, no con un formulario. Fracciones además tiene 3 sub-modos de input distintos dentro de sí misma.
- **Cuánto repara de raíz**: bastante — un hook o componente compartido para el esqueleto significa que la próxima vez que se agregue un tema nuevo (o se cambie el timing/sistema de feedback para todos), se cambia en un solo lugar. Ahora mismo, cualquier cambio al sistema compartido hay que acordarse de replicarlo a mano en 5 lugares — que es exactamente como se generó este hueco.
- **Recomendación**: vale la pena, pero es un refactor con riesgo real de regresión si se apura — mejor después de la primera ronda de prueba con tus amigos, no antes/durante. El estado actual (funcionalmente completo y consistente en los 5, aunque duplicado) es seguro para lanzar tal cual.

## Deduplicación de problemas dentro de una partida

`src/lib/practica/generarUnico.ts` (nuevo): `generarSinRepetir(generar, clave, usados, maxIntentos=20)` — reintenta hasta 20 veces, permite repetir recién si se agota (nunca un loop infinito). Aplicado en:

- **Aritmética** (`SprintRunner.tsx`) — clave `problemType:a+símbolo+b`. Cubre división entera (el generador actual no produce división no-entera, así que la clave ya cubre cualquier variante que exista).
- **Fracciones** — clave distinta por sub-tipo (simplificar/comparar/sumar).
- **Decimales/Potencias/Álgebra** (`EnunciadoSprintRunner.tsx`) — clave = `enunciado` (ya es texto único por la interfaz compartida `ProblemaGenerico`, no hizo falta una función de clave por tema).
- **Enigmia procedural** (Memoria/Patrones/Computacional) — clave = enunciado + secuencia. **Deducción** (banco de la base) ya deduplicaba de antes por id.
- **Geografía** — **ya deduplicaba correctamente de antes**, confirmado por código: `elegirPaisAleatorio` filtra por `usados` antes de elegir, con el mismo criterio de fallback (repetir solo si se agotó el continente entero).
- **Reto diario** — los 5 problemas ahora se generan con reintento sobre el MISMO stream determinístico sembrado por fecha (nunca `Math.random()`), así que sigue siendo exactamente igual para todos el mismo día, pero sin poder repetirse entre sí.

### Confirmación pedida: ¿dónde ya pasaba la dedup de antes, real o preventiva?

- **Geografía**: ya estaba, real y correcta — no hacía falta tocar nada.
- **Enigmia — Deducción** (banco de la base): ya estaba, real — filtra por id ya usado.
- **Enigmia — Memoria/Patrones/Computacional (procedurales)**: **NO** estaba — el `usadosRef` existente solo trackeaba ids falsos únicos por diseño (`idFalso` con timestamp+random), así que nunca detectaba contenido repetido. Con dificultad baja (pocos pasos/inicio chico) la colisión era genuinamente probable dentro de 10 preguntas — hueco real, ahora cerrado.
- **Aritmética, Fracciones, Decimales, Potencias, Álgebra, Reto diario**: ninguno deduplicaba antes — hueco real en los 6, ahora cerrado.

## Pendiente / decisiones para revisar

1. Ver hydration warning menor en `ProgressDial` (diferencia de precisión de punto flotante en un `cx` de SVG entre server/client, ej. `7.405333421475946` vs `...48`) — no afecta funcionalidad, no se tocó.
2. Refactor de unificación de runners — evaluado, no implementado (ver arriba).
3. Confirmar que la migración `0036` ya se corrió (se vio en el log del dev server que `/api/practica/finish` pasó de 400 a 200 después de un momento — parece que sí, pero confirmalo).

---

# Progreso — auditoría pre-lanzamiento

Última actualización: 2026-08-17 (tercera tanda del día). Auditoría de lanzamiento pedida antes de compartir el link con gente real. Cubre: 2 bugs visuales reales de la tanda G3-N3 (arreglados), y una auditoría de seguridad/UX de 7 puntos sobre TODO el proyecto (no solo lo de hoy).

## Bugs visuales encontrados y arreglados (de la tanda G3-N3)

1. **SplitText dejaba los tooltips del tour invisibles.** `PrimeraVezTip.tsx` usa un popover flotante siempre visible al montar — pero `SplitText` (I3) dependía de `ScrollTrigger` para decidir cuándo animar, pensado para contenido que hay que scrollear hasta ver. En la práctica el trigger no disparaba de forma confiable para un popover ya en pantalla, dejando el texto en `opacity:0` para siempre — la página se veía "trabada" con el overlay oscuro del tour encendido y sin forma de avanzar. Se agregó un prop `scrollTrigger` (default `true`, fiel al original) a `SplitText.tsx`; `PrimeraVezTip` ahora pasa `scrollTrigger={false}` y anima directo al montar. Mismo tipo de ajuste que ya se había hecho en `PageFade` (H3) por el mismo motivo — quedó documentado ahí pero no se replicó a tiempo acá.
2. **Scrollbar horizontal visible en el nav del header.** Pre-existente (no de esta sesión), pero el usuario lo señaló como algo que "ensucia el diseño" — el `<nav>` tiene `overflow-x-auto` para no romper en viewports angostos, pero eso también dibuja la scrollbar nativa del navegador en desktop cuando el nav no entra. Se agregó una utilidad `.sin-scrollbar` en `globals.css` (oculta la barra visual, mantiene el scroll funcional) aplicada al nav.

## Auditoría de 7 puntos

**1. Autenticación** — el flujo real NO es "magic link": es email+contraseña con confirmación por email (`signUp` → `/auth/callback` intercambia el code → sesión), más un modo invitado (`signInAnonymously`). El trigger `handle_new_user` crea la fila de `profiles` en el mismo insert de `auth.users`, así que `requireUsuario` nunca se rompe con un usuario 100% nuevo — redirige a `/onboarding` correctamente (display_name null). No pude probarlo de punta a punta con una cuenta real: Supabase exige confirmación por email y no tengo acceso a una casilla de correo real; tampoco tengo la service_role key para saltear eso. Verificado por código, no en vivo.

**2. Aislamiento de datos (RLS) — encontré y arreglé 2 vulnerabilidades reales de severidad alta, pre-existentes.** No pude probarlo con 2 cuentas reales en vivo (Supabase me rate-limiteó el signup de prueba al segundo intento, y no voy a seguir insistiendo contra el proyecto real) — la verificación fue código completo, migración por migración (34 archivos), con un sub-agente dedicado a catalogar cada policy. Migración nueva: `supabase/migrations/0035_auditoria_lanzamiento_rls.sql`.
   - **ALTO — `profiles`**: la policy de UPDATE no tenía `with check`, así que solo exigía ser dueño de la fila, sin restringir qué columnas. Cualquier usuario autenticado podía, con supabase-js desde la consola del navegador, escribirse directo `puntos_total`, `elo_rating`, `plan`, `escudos_extra_pendientes`, `congelamientos_disponibles`, `boost_multiplicador_pendiente`, `color_dial`/`marco_perfil` (sin comprarlos) o los datos de la apuesta — saltando por completo las funciones de negocio que existen para eso. Arreglado con `GRANT UPDATE` de columna (solo `display_name`, `meta_xp_diaria`, `es_profesor`, los 2 flags de onboarding e `interes_inicial` quedan escribibles directo). `elegir_color_dial`/`elegir_marco_perfil` pasaron a `security definer` (antes no lo eran, así que su propio chequeo de "¿está desbloqueado?" era saltable). Se agregaron 3 funciones chicas (`consumir_boost_pendiente`, `consumir_escudos_pendientes`, `aplicar_congelamiento_si_hace_falta`) para los 3 casos donde el cliente necesitaba "consumir" un valor — y se actualizaron los 10 call sites que hacían el update directo.
   - **ALTO — `duels`**: mismo problema (UPDATE sin with check) — un participante podía reescribir `semilla_problemas`, `estado` o `ganador_id` directo, saltando `registrar_resultado_duelo`. El cliente nunca necesita actualizar `duels` directo (todo pasa por funciones `security definer`), así que se eliminó la policy en vez de acotarla.
   - **MEDIO — `duel_results`**: el INSERT solo validaba `user_id = auth.uid()`, no que el usuario participe del `duel_id` — se agregó el `exists(...)` que falta.
   - **MEDIO — `friendships`**: UPDATE sin `with check` — se acotó a `auth.uid() = friend_id` (coincide con el único uso real: aceptar una solicitud).
   - Confirmado por el sub-agente: las 26 tablas del proyecto tienen RLS habilitado (ninguna quedó "abierta" por accidente), y las funciones `security definer` tienen su chequeo de `auth.uid() is null` de forma consistente, con 2 excepciones de diseño explícito (`ranking_semanal`/`ranking_semanal_por_mundo`, leaderboards agregados a propósito, no un bug).
   - **Esta migración (0035) es la más importante de todas las que quedan pendientes de aplicar — sin ella, el agujero de `profiles`/`duels` sigue abierto en la base real.**

**3. Estados vacíos** — revisados ranking, feed, amigos, grupos, perfil (logros), grupo sin miembros. Todos manejan el caso cero explícitamente con texto ("Todavía nadie...", "Todavía no tenés amigos...", etc.), salvo `ProfesorClient.tsx` (lista de grupos) que no muestra la lista si está vacía pero tampoco un mensaje — no está roto (los formularios de crear/unirse siguen ahí, se lee como intencional), pero le falta una línea de texto para quedar prolijo como el resto. No lo toqué, es cosmético.

**4. Secretos** — confirmado en el bundle real (`.next/static`, no solo el código fuente) que la service_role key nunca aparece en el JS del cliente. Solo se usa en `src/lib/supabase/admin.ts`, importado únicamente por `api/perfil/eliminar-cuenta/route.ts` (server-only), y esa ruta borra exclusivamente al usuario autenticado (`user.id` de la sesión, nunca un id que mande el cliente) — segura. **Pero esa key no está en `.env.local` todavía** (confirmado, el comentario del propio archivo ya lo avisaba) — sin ella en Vercel, "Borrar mi cuenta" va a fallar en producción con un error controlado (no un crash), pero va a estar roto.

**5. Errores sin detalle técnico** — parcialmente bien, con un hueco real: casi todas las ~19 rutas de API devuelven `error.message` directo al cliente cuando falla una llamada a Supabase. En el camino feliz esto es seguro (son mensajes en español que las propias funciones `security definer` definen a propósito, ej. "no autenticado"), pero ninguna ruta tiene un `catch` genérico externo — un error inesperado (JSON malformado en el body, timeout de red, una constraint no anticipada) se propagaría como una excepción sin capturar en vez de una respuesta prolija. No lo arreglé (es un cambio de 19 archivos, no algo puntual como los de RLS) — lo dejo marcado para que decidas si lo encarás.

**6. Responsive a 375px** — revisado por código (clases de Tailwind), no con un navegador real a ese ancho — no tengo esa herramienta acá. No encontré anchos fijos en píxeles en ningún componente de `src/app`. Los grids sin breakpoint mobile (`grid-cols-3` en la home, `grid-cols-3` en el armador de desafío del feed) no tienen overflow: las tarjetas achican, las etiquetas largas envuelven en 2 líneas en vez de desbordar. Sin poder confirmarlo visualmente, recomiendo una pasada rápida tuya con las devtools en 375px antes de compartir.

**7. Variables de entorno / Vercel / Supabase Auth URL** — no tengo acceso a ninguno de los dos dashboards, así que esto lo tenés que confirmar vos: (a) Vercel → Settings → Environment Variables debe tener `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mismos valores que tu `.env.local`) y **`SUPABASE_SERVICE_ROLE_KEY`** (ver punto 4 — probablemente todavía no está en ningún lado); (b) Supabase → Authentication → URL Configuration debe tener la URL real de producción en "Site URL" y en "Redirect URLs" (si no, `/auth/callback` va a redirigir a `localhost` incluso en producción, y la confirmación de email/recuperar contraseña van a fallar).

## Pendiente

1. **Aplicar la migración `0035_auditoria_lanzamiento_rls.sql`** — máxima prioridad, cierra 2 vulnerabilidades reales.
2. Agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel (y confirmar el resto de env vars + Supabase Auth URLs — punto 7).
3. Punto 5 (errores sin detalle técnico) — 19 rutas, no se tocó, a definir si se encara.
4. Punto 3 — `ProfesorClient.tsx` sin mensaje de "sin grupos" (cosmético).
5. Puntos 1, 2 (parte del test en vivo) y 6 no se pudieron confirmar de punta a punta por falta de acceso (email real, 2 sesiones autenticadas en simultáneo, navegador a 375px) — quedaron verificados por código/API, no en vivo.

---

# Progreso — G3 (mitad 2) + L3 + M3 (react-bits, parte 2)

Última actualización: 2026-08-17 (segunda tanda del día). El usuario reenvió GhostCursor completo, SpecularButton, ClickSpark y BubbleMenu — los primeros tres llegaron completos, BubbleMenu se volvió a cortar (esta vez a mitad del CSS, en `.pill-li...`). Se implementaron los tres completos; BubbleMenu (N3) sigue pendiente.

**Dependencias nuevas**: `ogl` (SpecularButton), `three` + `@types/three` (GhostCursor).

**G3 (mitad 2) — SpecularButton en botones secundarios.** `Boton.tsx`: cuando `variante="secundario"`, en vez del borde+hover viejo renderiza `SpecularButton` (WebGL vía `ogl`), con `lineColor` = el `colorHex` que ya recibía el botón (acento del mundo, o violeta por defecto), `textColor="var(--foreground)"` (referencia CSS directa, se re-resuelve sola con el toggle de tema), `baseColor` fijo en un gris neutro (no se armó un puente para leer `--border` computado por tema — hubiera sido bastante más código para un trazo que se ve al 45% de opacidad como mucho). El padding/tamaño lo sigue poniendo `Boton.tsx` con las mismas clases de Tailwind que ya tenía — se le sacó el padding fijo al CSS original de SpecularButton para no pelear por especificidad. Aplicado en los 4 usos reales de `variante="secundario"` que hay en el proyecto (Tienda, Amigos, Lección, Login). **No se aplicó** a los botones "Volver"/"Aprender" que son `<Link>` (`BotonesFinPartida.tsx`, `AccionMundo.tsx`) — mismo motivo que BorderGlow: SpecularButton es literalmente un `<button>`, no un wrapper para cualquier children.

**L3 — GhostCursor como ambiente en las homes de mundo.** `FondoCursorMundo.tsx` (nuevo) envuelve `GhostCursor` con el mismo gate que `FondoMundo.tsx` (`efectosHabilitados()`, que ya cubre el toggle manual Y la detección de conexión lenta de la Fase P2 porque esa detección termina apagando el mismo flag). Wireado en las 3 home de mundo, nunca en un runner de práctica. **Ajuste de rendimiento deliberado**: el shader original corre ruido `fbm` de 5 octavas por cada punto del trail — con el `trailLength=50` del ejemplo de la librería eso es carísimo para un adorno de fondo que corre todo el tiempo. Se bajó a `trailLength=16` y se recortó bloom/grain. **No pude medir el impacto real en un dispositivo** (no tengo forma de perfilar FPS desde acá) — es una animación WebGL corriendo en loop permanente en pantallas que además ya tienen `FondoMundo` (framer-motion) corriendo en paralelo; recomiendo probarlo en un celular real de gama media antes de darlo por cerrado. Si se siente pesado, la salida más simple es bajar `trailLength` todavía más (8-10) antes de sacarlo del todo.

**M3 — Chispa de click con la forma del logo.** `ChispaClick.tsx` (nuevo, wireado en `layout.tsx` envolviendo toda la app): mismo sistema técnico que ClickSpark (canvas 2D + partículas por click), pero en vez de líneas radiales simétricas dibuja la chispa real de `Logo.tsx` (las mismas dos curvas bezier — punta larga tipo cometa + punta chica a 146° — reconstruidas para canvas 2D, mismo degradé `#A794FF → #FFC53D`) en el punto de click, una sola vez por click (no un estallido de copias en círculo como el ClickSpark original). Respeta `efectosHabilitados()`. Global a toda la app (el pedido no especificaba una pantalla — se interpretó como un gesto de marca transversal, igual que el resto del "gesto del logo").

**N3 — Abanico de burbujas en el desplegable de cuenta.** El usuario reenvió BubbleMenu completo (JS + CSS entero esta vez). Se portó fiel en `src/components/reactbits/BubbleMenu.tsx` — pero **no se usa directo** en `ProfileMenu.tsx`: BubbleMenu es un widget de navegación a pantalla completa con su propio logo-bubble y botón toggle circulares, pensado para reemplazar la nav entera de un sitio. `ProfileMenu` (Fase S2) ya tiene su propio ícono disparador y es un dropdown anclado de 4 opciones, no una navegación. Se extrajo la TÉCNICA real de apertura (cada ítem escala de 0 a 1 con `back.out(1.5)`, escalonado, con el label entrando por separado) en `AbanicoBurbuja.tsx` (nuevo) y se aplicó a los 4 ítems reales (Perfil/Ajustes/tema/Salir) sin tocar su funcionalidad. `BubbleMenu.tsx` queda completo y sin usar por ahora, disponible si en algún momento se necesita una nav real a pantalla completa.

**Correcciones de lint post-integración (React Compiler)**: tanto GhostCursor como SpecularButton, tal como vienen de react-bits, están escritos para React "clásico" y violan reglas del compilador de este proyecto — se corrigieron 4 casos: `performance.now()`/`Date.now()` llamados directo en el valor inicial de un `useRef` (se movió a dentro del efecto de setup), un efecto reactivo redundante que mutaba `rendererRef.current.domElement.style.mixBlendMode` (se eliminó — nuestro uso real nunca cambia ese prop después de montar, y el efecto de setup ya lo aplica una vez), y una mutación de ref directa en el cuerpo del componente en `SpecularButton` (se movió a un `useEffect`).

## Pendiente

1. **Lanyard** — anotado por el usuario para más adelante, no se toca.
2. Ver nota de rendimiento de L3 arriba — no pude perfilarlo en un dispositivo real.
3. `BubbleMenu.tsx` quedó portado pero sin ningún punto de uso real todavía (ver N3 arriba).

---

# Progreso — DD2 (celebración) + G3-K3 (react-bits, parte 1)

Última actualización: 2026-08-17. Verificado con `tsc --noEmit` (limpio), `eslint` sobre todo `src` (0 problemas), `next build` de producción completo (67 rutas, sin errores) y `vitest run` (13/13).

## Cierre pendiente de DD2

**Celebración de nivel de mundo.** `NivelMundoSubio.tsx` (nuevo): mismo gesto del logo (anillo + chispa) que ya usan logro/nivel de operación/duelo ganado, más el sonido "nivel". Migración `0034_nivel_mundo_anterior.sql` (nueva, no se editó la 0033 porque el usuario la estaba corriendo a mano en ese momento) — agrega `nivel_anterior` a la salida de `registrar_puntos_mundo` para poder detectar el salto real. Wireado en las 7 pantallas de resumen de partida que pueden mover el nivel de mundo (Aritmética/duelos, Fracciones, Geografía, Decimales, Potencias, Álgebra, Enigmia).

## Verificación de las migraciones 0027-0034 contra la base real

Sin CLI ni service_role, pero sí con la anon key del proyecto contra la REST API de Supabase (existencia de tablas/columnas/funciones, no contenido — RLS exige `authenticated` para leer filas): confirmado que `world_progress`, `duel_queue`, `duel_results.respuestas` y las funciones `registrar_puntos_mundo`/`mi_historial_duelos`/`buscar_rival_duelo`/`registrar_resultado_duelo`/`obtener_duelo`/`ranking_semanal_por_mundo` existen y responden como se espera (`ranking_semanal_por_mundo` incluso devolvió datos reales sin necesitar auth). **No se pudo distinguir si `0034` específicamente ya se aplicó** — su función tiene el mismo nombre que la de `0033`, y el chequeo de auth se dispara antes de llegar al `return` en cualquiera de las dos versiones.

## G3-K3 — componentes de React Bits (primera mitad de la tanda)

El usuario adjuntó 10 componentes con código fuente completo, pero el mensaje se cortó a los 50.000 caracteres. Quedaron completos: BorderGlow, FadeContent, SplitText, GlareHover, PixelTransition. Quedaron incompletos o ausentes: GhostCursor (cortado a mitad del `useEffect`, sin CSS), SpecularButton, ClickSpark, BubbleMenu — pendientes de que el usuario los reenvíe.

**G3 (mitad) — BorderGlow en CTAs primarios.** `Boton.tsx` gana un prop `destacado` — cuando `variante="primario"` y `destacado`, envuelve el botón en `BorderGlow` (paleta forzada a `#6C4CF1`/`#A794FF`/`#FFC53D`, `backgroundColor="transparent"` porque el degradé lo sigue poniendo `Boton`, no `BorderGlow`). Aplicado a los 6 botones "Iniciar partida" (Aritmética vía `OperationPicker`, Fracciones, Potencias, Decimales, Álgebra, y Geografía/Enigmia que tenían botones sueltos sin migrar — se migraron a `Boton` de paso). **Decisión**: no se aplicó a `AccionMundo.tsx` (las tarjetas "Practicar"/"Aprender" de cada mundo) porque ese componente tiene una regla de diseño explícita de una fase anterior (NN) de que ambas deben verse con el mismo peso visual — destacar solo "Practicar" ahí contradiría esa decisión ya tomada. SpecularButton (la otra mitad de G3, para botones secundarios) queda pendiente del reenvío.

**H3 — FadeContent como transición de página.** `PageFade.tsx` (nuevo, wireado en `layout.tsx` envolviendo `{children}`): adaptación de FadeContent, no una copia literal — el original dispara con `ScrollTrigger`/IntersectionObserver (pensado para revelar contenido al hacer scroll), pero acá el caso de uso es cambio de ruta, así que se dispara directo al montar (`usePathname()` como `key` para forzar remount en cada navegación) en vez de esperar a que algo entre en viewport. Mismo lenguaje visual (opacidad + blur, ~350ms). Respeta el toggle de efectos (sin animación si está apagado).

**I3 — SplitText en el tour de onboarding.** Integrado en `PrimeraVezTip.tsx`, reemplazando el `<p>{texto}</p>` de cada tooltip por `splitType="words"`. Fiel al original (usa el plugin real de GSAP, gratis desde la adquisición de GreenSock por Webflow).

**J3 — GlareHover sincronizado con el gesto del logo.** El componente original solo dispara con `:hover`; se le agregó un prop `trigger` (clase CSS equivalente a `:hover`, sin tocar el mecanismo de animación) porque un logro no se revela al pasar el mouse. En `LogroBanner.tsx`, el destello se dispara desde el `onDone` que ya expone `GestoLogo` — el anillo termina de abrirse y ahí mismo cruza el brillo, un solo momento coordinado.

**K3 — PixelTransition reemplaza las partículas de "desintegración".** Se agregó `activeControlled` a `PixelTransition.tsx` (disparo directo por prop, no por hover/click) y se creó `RevelarRespuesta.tsx` como envoltorio: `firstContent` = tu respuesta, `secondContent` = la respuesta correcta, gridSize 9, `#FF6B6B`. Reemplaza — no duplica — las partículas viejas en los 4 lugares donde existían: `TarjetaSprint.tsx` (compartido por Fracciones/Enigmia/Geografía, que ahora pasan `miRespuesta`/`respuestaCorrecta` en vez de renderizar su propio texto "Era X") y la copia inline de `SprintRunner.tsx` (Aritmética). Si el toggle de efectos está apagado, cae directo al texto sin animación. `EnunciadoSprintRunner.tsx` (Decimales/Potencias/Álgebra) no tenía este efecto para empezar (usa un shake en vez de partículas) — se dejó fuera, mismo criterio que el hueco 1 de la tanda anterior (no estaba en el pedido explícito).

**Ajuste técnico de paso**: se instaló `gsap` + `@gsap/react` (nuevas dependencias — SplitText, FadeContent y PixelTransition lo requieren). El `PixelTransition` original llamaba `setState` dentro de un efecto reaccionando a un cambio de prop controlado — se corrigió derivando el estado visible directo del prop en modo controlado, dejando el efecto solo con el trabajo imperativo de gsap, siguiendo el mismo criterio ya usado en `EscudoIcon`/`RankingRankeds` para el linter del compilador de React.

## Pendiente

1. SpecularButton, ClickSpark, BubbleMenu y el resto de GhostCursor — esperando que el usuario los reenvíe (se cortaron por el límite de caracteres del mensaje).
2. No se pudo confirmar si la migración `0034` específicamente ya está aplicada contra la base real (ver arriba).
3. `EnunciadoSprintRunner.tsx` queda fuera del reemplazo de K3 (no tenía el efecto de partículas para empezar).
4. `AccionMundo.tsx` queda fuera de BorderGlow por la regla de paridad visual Practicar/Aprender de una fase anterior.

---

# Progreso — tanda FF2/DD2/EE2

Última actualización: 2026-08-16. Verificado con `tsc --noEmit` (limpio), `eslint` sobre todo `src` (0 problemas), `next build` de producción completo (compila y genera las 67 rutas sin errores) y `vitest run` (13/13).

## Completo

**FF2 — Geografía: África y Asia+Oceanía.** `src/lib/practica/geografia.ts` ahora tiene 4 continentes: 49 países de África y 50 de Asia+Oceanía agrupados (153 países en total entre los 4). Mismo patrón técnico que América/Europa: `GeografiaMapa.tsx` con su propia proyección por continente, rutas nuevas `/geografia/practica/africa` y `/geografia/practica/asia-oceania`, tarjetas activadas en `/geografia` (ya no queda ninguna región en "Próximamente" — solo "Departamentos/estados/ríos" sigue así, como se pidió).
- **Verificación real hecha**: escribí un script que extrae todos los ids del topojson real (`countries-110m.json`) que usa el proyecto y confirmé que los 153 ids que usé existen ahí — cero inventados, cero que vayan a quedar sin geometría.
- **Lo que NO pude verificar**: no tengo una fuente id→nombre autoritativa para cruzar cada código ISO 3166-1 numérico contra el nombre del país — arme esa correspondencia de memoria. Los ids EXISTEN todos, pero hay un riesgo residual chico de que algún nombre esté mal asignado a su id (ej. si confundí dos códigos parecidos). Vale la pena que alguien juegue una partida de cada continente nuevo y confirme que los nombres coinciden con lo que se resalta en el mapa.
- **Decisiones de criterio**: Rusia quedó clasificada en Asia+Oceanía (no en Europa) porque la mayor parte de su territorio está ahí — es una decisión defendible pero discutible. Sahara Occidental se incluyó como país jugable porque tiene su propia geometría en el topojson (si no, quedaba un hueco gris sin nombre en el mapa de África). Países chicos/insulares que no están en la resolución de 110m del topojson (Cabo Verde, Comoras, Mauricio, Seychelles, Singapur, varios micro-estados del Pacífico) directamente no se pueden jugar — no es una selección parcial mía, es un límite real del archivo de datos.

**EE2 — Álgebra básica activada.** `src/lib/practica/algebra.ts` (nuevo): 3 tipos de problema escalados por nivel — evaluar una expresión (nivel 1-3), ecuación de un paso (4-6), ecuación de dos pasos tipo `2x + 3 = 11` (7-10). Ruta completa `/practica/algebra` (mismo patrón que Decimales/Potencias, con `EnunciadoSprintRunner`). Activada en `/numeria` y `/practica/temas` — Geometría básica quedó como el único tema todavía en "Próximamente", como se pidió. Migración `0032_algebra_basica.sql` amplía los 3 check constraints e inserta las 3 lecciones pedidas ("Qué es una variable", "Despejar paso a paso", "Verificar sustituyendo"), integradas a `/aprender` (mismo patrón de "salta la práctica numérica" que ya usan las lecciones de Fracciones, porque el formato de enunciado libre de álgebra no encaja en el motor de práctica de `a símbolo b`).

**DD2 — Nivel de mundo.** Migración `0033_nivel_de_mundo.sql`: tabla `world_progress` (user_id, world, puntos_mundo, nivel_mundo) + función `registrar_puntos_mundo(world, puntos)` con curva RPG no lineal (nivel 2 = 100 puntos, nivel 3 = 300, nivel 5 = 1000, nivel 10 = 4500 — cada nivel pide más que el anterior). Se llama automáticamente al cerrar cualquier partida: `/api/practica/finish` deriva el mundo real a partir del `problem_type` de los intentos (Numeria = suma/resta/multiplicación/división/fracciones/decimales/potencias/álgebra; Geografía = geografia — ambos comparten la tabla `attempts` y esta misma ruta), `/api/enigmia/finish` siempre registra "enigmia". Nunca baja — solo suma, tal cual se pidió. Se muestra con `NivelMundoBadge.tsx` (pastilla con degradé, deliberadamente distinta al `LevelDial` circular del nivel de calibración por operación) en las 3 homes de mundo y en el perfil, junto al desglose que ya existía ahí.
- **Bug de yapa encontrado y arreglado**: el contador "Numeria: N problemas resueltos" del perfil en realidad contaba TODOS los intentos de `attempts` sin filtrar por tema — como Geografía comparte esa misma tabla, sus intentos se contaban como si fueran de Numeria. Lo separé al agregar la tarjeta de Geografía que faltaba en ese desglose (antes ni aparecía ahí).
- **Decisión de alcance**: no armé un momento de celebración especial (sonido, GestoLogo) para cuando sube el nivel de mundo — el pedido decía "mostralo de forma prominente", lo interpreté como que el nivel tiene que verse siempre, no que necesita su propia animación de festejo. Se puede sumar después si se quiere ese tratamiento.

## Decisiones para revisar

1. Rusia en Asia+Oceanía en vez de Europa — criterio geográfico (mayoría del territorio), no político.
2. La correspondencia id→nombre de los 153 países de Geografía no tiene una segunda fuente que la valide — recomiendo jugar cada continente una vez para confirmar visualmente.
3. El nivel de mundo no tiene celebración propia al subir de nivel — solo se muestra como dato persistente.
4. Las migraciones `0027` a `0033` (siete en total, acumuladas de esta sesión) siguen sin aplicarse — sigo sin forma de correr SQL desde acá.

## Completo

**Q2 — Ícono de Inicio.** `IconCasa` nuevo en `icons.tsx`, coherente con el resto del set (mismo trazo/tamaño base). El link "Inicio" de la navbar ahora es el ícono solo, sin texto.

**S2 — Desplegable de cuenta.** `ProfileMenu.tsx` (nuevo): ícono de perfil en la navbar que despliega, con animación (`framer-motion`, mismo patrón de apertura/cierre que `MundoSelector`), Perfil / Ajustes / toggle de tema / Salir. Se sacaron esos 4 accesos sueltos que antes vivían repartidos por la navbar. Para usuarios NO logueados (login/registro) se mantuvo el `ThemeToggle` suelto, porque el menú de cuenta no tiene sentido sin sesión.

**T2 — Social (Amigos + Grupos).** `/social` nuevo, con pestañas "Amigos" / "Grupos" (Profesor renombrado). Reutiliza `AmigosClient` y `ProfesorClient` tal cual — ninguna lógica interna cambió, solo el punto de entrada. `/amigos` y `/profesor` ahora son redirects a `/social?tab=amigos` / `/social?tab=grupos` (no se rompen links viejos). Las sub-rutas `/profesor/[groupId]/...` siguen existiendo igual, solo se actualizaron sus enlaces "volver" para apuntar a `/social?tab=grupos` directo.

**V2 — Más tiempo en Enigmia.** `DURACION_MS` de `EnigmiaSprintRunner` pasó de 60s a 90s (+50%).

**W2 — Bug de memoria arreglado.** Antes el `enunciado` de los acertijos de memoria incluía la secuencia Y la pregunta juntas, mostradas con las opciones al mismo tiempo — nunca hacía falta memorizar nada. Ahora `LogicPuzzle.contenido` tiene un campo `secuencia` separado; el componente nuevo `AcertijoMemoria.tsx` la muestra sola (con animación de entrada y una barra de tiempo), la oculta, y RECIÉN AHÍ se revela la pregunta + opciones. El cronómetro de respuesta arranca cuando empieza a responder, no cuando empieza a memorizar. Aplicado en:
- `generarMemoria()` (los procedurales, la mayoría de lo que se juega en la práctica real).
- Los 6 acertijos de memoria sembrados en la base — migración `0030_fix_memoria_secuencia.sql` les separa la secuencia del enunciado.
- `DiagnosticoEnigmiaClient.tsx` (el diagnóstico inicial de Enigmia usa el mismo banco sembrado).
- **Gap real, sin arreglar**: el ejemplo de la lección "Agrupar para memorizar" (`logic_techniques`, slug `tecnicas-de-memoria`) tiene el mismo bug en su campo `ejemplo` — es una sola instancia (no "los acertijos" en plural que pedía el mensaje), con una forma de datos distinta (`LogicTechnique.contenido.ejemplo`, no `LogicPuzzle`), así que quedó fuera de esta pasada. Se puede arreglar con el mismo patrón si hace falta.

**R2 — Rankeds, pantalla propia con matchmaking real.** `/rankeds` nuevo (agregado a la navbar), con dos pestañas:
- **Mi competitivo**: ELO + rango (reutiliza `tierDeElo`), victorias/derrotas/tasa de victoria (derivadas del historial), lista de duelos pasados con rival, marcador y resultado. RPC nueva `mi_historial_duelos()`.
- **Buscar partida**: matchmaking de verdad, no un botón de adorno. Migración `0031_matchmaking_duelos.sql` agrega una tabla `duel_queue` y dos RPCs: `buscar_rival_duelo(operation_type)` (te anota en la cola, busca un rival con ELO cercano usando `for update skip locked` para que dos búsquedas concurrentes no se pisen, y ensancha el rango ±15→±120 cada 8s de espera) y `cancelar_busqueda_duelo()`. El cliente hace polling cada ~2.2s mientras muestra "Buscando rival… Xs · rango ±N ELO" con botón cancelar; si no hay match en 60s, corta solo y avisa "no hay contrincantes disponibles ahora" en vez de buscar para siempre en silencio. Al encontrar rival, navega directo a `/practica?operacion=X&duelo=Y` — mismo flujo de duelo que ya existía.
- **Aclaración importante**: esto es DISTINTO del filtro de ranking semanal (Experiencia total / Por mundo) que se agregó en la tanda anterior dentro de Amigos — ese sigue ahí (ahora en Social > Amigos), y cubre otra cosa (XP semanal, no ELO competitivo). Los dos conviven.
- El matchmaking es por polling, no instantáneo — el tiempo real hasta emparejar tiene hasta ~2.2s de latencia por el intervalo de sondeo, no es en el mismo segundo exacto en que dos personas entran a buscar.

## Decisiones para revisar

1. El menú de perfil (S2) usa un botón redondo simple con el ícono de perfil, sin el nombre ni la foto del usuario al lado — se puede sumar si se quiere más identificable de un vistazo.
2. `/amigos` y `/profesor` quedaron como redirects en vez de borrarse — decisión deliberada para no romper links guardados, pero son código que ya no se usa como pantalla propia.
3. El bug de memoria (W2) no se tocó en la lección "Agrupar para memorizar" — ver el gap documentado arriba.
4. Las migraciones `0027` a `0031` (esta tanda + la anterior) todavía no están aplicadas — siguen necesitando correrse a mano, no hay forma de ejecutar SQL desde acá.
5. Sin poder correr las migraciones, no pude probar `/rankeds`, `/social` ni el resto contra la base real — sí verifiqué que compilan y que el build de producción completo (`next build`, las 64 rutas) no tira errores, pero el comportamiento en vivo (matchmaking real, RLS, etc.) recién se puede confirmar después de aplicar `0027`-`0031`.

---

# Progreso — cierre de los 4 huecos + tanda Y2-CC2

Última actualización: 2026-08-16. Continúa desde la auditoría anterior (sección "tanda GRUPO 1-6" más abajo). Esta sección documenta: (1) el cierre de los 4 huecos reales que la auditoría encontró, y (2) la tanda nueva Y2/Z2/AA2/BB2/CC2. Verificado con `tsc --noEmit` (limpio), `eslint` sobre todo `src` (0 problemas) y `vitest run` (13/13) al final de todo.

## Los 4 huecos — cerrados

**1. Feedback unificado en los 4 runners.** Se extrajo el sistema completo de VV/C2 a piezas compartidas:
- `src/lib/practica/useBonusTiempo.ts` — hook con la lógica de bonus de tiempo (antes solo vivía en Aritmética).
- `src/components/practica/BarraTiempo.tsx` — barra de tiempo con cabeza cometa + destello dorado (antes Fracciones/Enigmia/Geografía no tenían barra de tiempo visual, solo un número).
- `src/components/practica/TarjetaSprint.tsx` — tarjeta flashcard con `PuntajeCorner` y partículas de desintegración en error.
Aplicado a `FraccionSprintRunner.tsx`, `EnigmiaSprintRunner.tsx` y `GeografiaSprintRunner.tsx` — mismos tiempos de feedback (550ms/900ms), mismo puntaje combinado, misma transición de tarjeta. Los 4 runners de práctica ahora se comportan igual. **Nota**: `EnunciadoSprintRunner.tsx` (Decimales/Potencias) no se tocó — no estaba en el pedido explícito ("Fracciones, Enigmia y Geografía") y es un quinto motor separado; queda con el feedback viejo.

**2. Lecciones de Geografía.** Migración `0027_geografia_lecciones.sql` amplía `techniques_problem_type_check` con `'geografia'` e inserta las 3 lecciones pedidas (Divide y vencerás / Ancla por vecinos / Forma característica), tal cual el contenido dado. Se construyó `/geografia/aprender` completo (`src/lib/geografia/path.ts`, página índice, página de lección, `LeccionGeografiaClient.tsx`) — reutiliza `technique_progress` y `/api/aprender/completar` tal cual existen, sin tabla nueva. La tarjeta "Aprender" en `/geografia` ya no dice "Próximamente".
- **Bug de yapa encontrado y arreglado**: las lecciones de Decimales/Potencias (de la tanda anterior) nunca aparecían en `/aprender` porque `TemaAprendible` en `src/lib/aprender/path.ts` no las incluía — quedaban en la base pero inalcanzables desde la UI (404 si se entraba por URL directa). Se agregaron a `TemaAprendible`, `TEMAS_ORDEN`, `NOMBRE_TEMA` y `DESCRIPCION_UNIDAD`.

**3. Fantasma del rival en duelos.** Migración `0028_duelos_fantasma.sql`: `duel_results` ahora guarda `respuestas jsonb` (secuencia de `{correct, timeMs}` por problema); `registrar_resultado_duelo` y `obtener_duelo` se recrearon (drop+create, cambia el shape de salida) para grabar y devolver esa secuencia. `SprintRunner.tsx` graba su propia secuencia de respuestas y, si el rival ya jugó antes, muestra una fila de puntos "👻 fantasma" que avanza al ritmo EXACTO de los tiempos ya guardados del rival, con un texto de "vas adelante/atrás/parejo". Los duelos siguen siendo asincrónicos — no hay sesión en vivo compartida, eso sigue anotado como proyecto aparte.

**4. Auditoría total de botones.** Los 6 archivos señalados se migraron a `Boton`: `PotenciaPracticaClient`, `DecimalPracticaClient`, `FraccionPracticaClient`, `ConvertirCuenta`, y los botones de error de `PracticaClient`. **Corrección sobre la auditoría anterior**: `profesor/[groupId]/page.tsx` en realidad NO tiene ningún `<button>` — el grep anterior había matcheado una tarjeta decorativa ("Punto de atención"), no un botón real; era un falso positivo. Al hacer el barrido completo del proyecto (no solo esos 6) aparecieron más botones CTA sueltos con el mismo patrón viejo de gradiente/`bg-primario` sólido, también migrados: `aprender/[slug]/LeccionClient.tsx` (5 botones), `reto-diario/RetoDiarioClient.tsx`, `onboarding/OnboardingForm.tsx`, `onboarding/diagnostico/DiagnosticoClient.tsx` (2 botones), `error.tsx` (boundary global), y `amigos/AmigosClient.tsx` (5 botones, de paso que se tocó ese archivo para Y2). Quedan sin migrar a propósito: los botones "Ok" pegados a un input (patrón ya establecido en todo el proyecto), los botones de opción en grillas de selección (operaciones, comparación `<`/`=`/`>`, opciones de acertijos), y los links con pinta de botón (`<Link>` no puede ser un `<Boton>`, que es estrictamente un `<button>`).

## Y2-CC2

**Y2 — Ranking dentro de "Rankeds".** No existe ninguna pantalla llamada literalmente "Rankeds" ni una pestaña "Buscar partida" en el código — es terminología nueva del pedido. Se interpretó "Rankeds" como `/amigos` (la única pantalla existente de duelos + social + ELO), siguiendo la salida que el propio pedido dejaba abierta ("o como un tercer acceso visible arriba de esa sección"). Se agregó `RankingRankeds.tsx`: caja con borde y degradé propio (no tabla plana), filtro "Experiencia total" / "Por mundo" (con selector de Numeria/Enigmia/Geografía), montada arriba de todo en `/amigos`. Migración `0029_ranking_por_mundo.sql` agrega `ranking_semanal_por_mundo(p_mundo)` — combina `attempts` (Numeria/Geografía) y `logic_attempts` (Enigmia, tabla separada) porque no hay una sola tabla con XP por mundo.

**Z2 — Decoración ambiental en los bordes.** Ya existía `FondoMundo.tsx` (de la fase N2 anterior) haciendo básicamente esto: símbolos propios por mundo, solo en márgenes/bordes, nunca en el centro, muy tenue, respeta el toggle de efectos y `prefers-reduced-motion`. Construir un segundo sistema de decoración en paralelo hubiera contradicho la propia advertencia de Z2 de no saturar. **Decisión**: se reforzó `FondoMundo.tsx` en vez de duplicarlo — ahora cada símbolo aparece y se desvanece en un ciclo propio (antes solo flotaba a opacidad fija), que es la parte de Z2 que N2 no cubría todavía. No se integró la librería react-bits como tal (mismo motivo que en la fase D2 de la tanda anterior: no es instalable/auditable como dependencia en el tiempo disponible).

**AA2 — Racha de fuego reforzada.** `RachaFuego.tsx` (nuevo) reemplaza el `🔥 {racha}` de texto chico en `SprintRunner.tsx`. Tamaño base ya grande de entrada (antes era un emoji inline), y cada racha nueva pega un salto de escala exagerado (`scale: [0.4, 1.55, 1]` con `backOut`) remontando por `key={racha}` — un "PAM" real en cada paso, no una transición sutil. El tamaño de reposo también crece por tramos con la racha. Solo se tocó Aritmética porque es el único lugar donde existía el indicador de racha en partida.

**BB2 — Bonus de tiempo reforzado.** `BonusTiempo.tsx` tenía texto `text-lg` sin partículas — se lo llevó a `text-2xl`, golpe de escala más grande (`scale: [0.3, 1.7, 1.25, 1.1]`), y un estallido de partículas doradas igual que las que usa `PuntajeCorner`, gateado por el toggle de efectos.

**CC2 — Escudo rompiéndose.** `EscudoIcon.tsx` (nuevo): cuando un escudo pasa de activo a gastado, dispara 4 fragmentos que se separan y desvanecen (detecta el cambio ajustando estado durante el render, sin efecto; el propio callback `onAnimationComplete` de framer-motion apaga la animación al terminar — no hay ningún `setState` síncrono en un efecto). Reemplaza el `IconEscudo` suelto en los 4 runners de práctica MÁS `EnunciadoSprintRunner.tsx` (Decimales/Potencias) — a diferencia del hueco 1, acá sí se incluyó ese quinto motor porque el cambio es chico y mecánico, y CC2 no venía acotado a runners específicos.

## Decisiones para revisar

1. "Rankeds" se mapeó a `/amigos` — si el usuario tenía en mente una pantalla distinta que todavía no existe, esto habría que migrarlo.
2. Z2 se resolvió reforzando `FondoMundo.tsx` en vez de construir un sistema nuevo — mismo criterio de "no duplicar decoración" en todo el proyecto.
3. El fantasma de duelos requirió ampliar el schema (`duel_results.respuestas`) — los duelos jugados ANTES de correr la migración 0028 no van a tener secuencia guardada, así que el primer duelo de cada par de rivales después de la migración no mostrará fantasma (recién el próximo).
4. Las migraciones 0027, 0028 y 0029 son archivos nuevos — no hay forma de correr SQL directo desde acá (no hay CLI de Supabase instalado ni credenciales de service_role en el proyecto), así que hay que aplicarlas a mano como las anteriores.

---

# Progreso — tanda GRUPO 1-6 (auditoría anterior, para contexto)

## Bug de fuente (Space Grotesk 900)
Arreglado con limitación documentada: Google Fonts no ofrece un corte 900 real para esta familia, `font-black` depende de síntesis del navegador.

## GRUPO 1 — completo
UU (botones fin de partida), WW (selector de mundo), H2 (anillo de carga grande).

## GRUPO 2 — completo, exclusivo de Aritmética hasta esta tanda
VV/C2 ahora replicado a los 4 runners de práctica (ver arriba, hueco 1).

## GRUPO 3
XX/ZZ/YY/A2/O2 completos. B2 (Geografía) ahora completo: Europa jugable + lecciones (ver arriba, hueco 2).

## GRUPO 4 — completo
K2/E2/M2/N2 completos. L2 limitado a los 3 ejemplos dados. D2 resuelto con componentes propios, no la librería react-bits en sí. F2 ahora con cobertura total de botones CTA (ver arriba, hueco 4).

## GRUPO 5 — completo
G2/I2/J2 completos. J2 ahora incluye el fantasma del rival (ver arriba, hueco 3); el duelo 100% en vivo sigue siendo proyecto aparte.

## GRUPO 6 — completo
P2 completo: toggle de efectos, detección de conexión lenta, respeta `prefers-reduced-motion`.
