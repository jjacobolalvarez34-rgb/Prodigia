# Prodigia — especificación del proyecto

Documento de referencia para retomar el trabajo (por ejemplo, en otra sesión, otra carpeta, o con otra persona). No reemplaza a `docs/PROGRESO.md` (el historial cronológico de auditorías y decisiones) — esto es una foto del estado actual: qué es la app, cómo está armada, y qué queda pendiente.

Última actualización: 2026-08-17.

## Qué es Prodigia

App de práctica adaptativa con gamificación, en español (Argentina), con tres "mundos" de contenido independientes:

- **Numeria** — cálculo mental y matemática: Aritmética (suma/resta/multiplicación/división), Fracciones, Decimales y porcentajes, Potencias y raíces, Álgebra básica. Geometría básica queda como "Próximamente" (único tema sin implementar).
- **Enigmia** — lógica: 4 categorías (Memoria, Patrones, Deducción, Pensamiento computacional). Memoria/Patrones/Computacional se generan por código (infinitos); Deducción viene de un banco fijo sembrado en la base.
- **Geografía** — identificar países en el mapa: 4 continentes activos (América, Europa, África, Asia+Oceanía — estos dos últimos agrupados). 153 países jugables en total. "Departamentos/estados/ríos" queda como "Próximamente".

Cada mundo tiene: una calibración de nivel por tema (1-10, sube/baja según aciertos), un **nivel de mundo** (eje de progreso separado, acumulado por puntos, curva RPG no lineal — ver más abajo), lecciones ("Aprender"), y práctica ("Practicar").

Por fuera de los mundos: cuenta (perfil, ajustes), social (amigos, grupos de profesor/alumnos), competitivo (ranking semanal, rankeds con ELO y matchmaking, duelos), economía (Puntos, tienda, apuestas), logros, reto diario, feed de actividad.

## Stack técnico

- **Next.js 16.3.0** (App Router, Turbopack), **React 19.2.8** (con React Compiler activo — ver "Patrones de React" abajo)
- **Supabase**: Postgres + Auth + RLS. Sin CLI de Supabase instalado en este entorno — todas las migraciones son archivos SQL en `supabase/migrations/` que se aplican **a mano** desde el dashboard de Supabase, en orden.
- **Tailwind v4**
- **framer-motion** — motor de animación principal y confiable en todo el proyecto
- **gsap** + **@gsap/react** — usado en algunos componentes de react-bits (ver advertencia abajo)
- **three** + **ogl** — para GhostCursor (fondo ambiental) y SpecularButton (botones secundarios)
- **vitest** — 13 tests unitarios (lógica pura: fórmulas, cálculo de nivel, etc.)

### ⚠️ Advertencia sobre gsap en este entorno

Durante esta sesión, **dos componentes que usaban gsap directo fallaron en producción de forma silenciosa** (sin error de consola): el texto del tour de onboarding (`SplitText`, gsap+ScrollTrigger) y la animación del desplegable de cuenta (`AbanicoBurbuja`, gsap plano con `autoAlpha`). Ambos quedaban con el contenido permanentemente invisible (`opacity:0`) porque el tween nunca terminaba de disparar. La causa exacta no se pudo confirmar sin acceso a la consola del navegador, pero el patrón se repitió dos veces con la misma forma (`gsap.set(...opacity:0) → gsap.to(...opacity:1)` dentro de un `useEffect`).

**Ambos se reemplazaron por framer-motion** (el motor ya probado en el resto del proyecto) y quedaron funcionando. **Recomendación**: si se agregan más componentes de react-bits que dependan de gsap para revelar contenido (no solo animaciones decorativas), probarlos en vivo con cuidado — no asumir que porque compila y no tira error de build, funciona en el navegador.

También: **no correr `next dev` y `next build` al mismo tiempo** — causó al menos un crash real de Turbopack (panic de caché) y compilaciones inconsistentes (código viejo sirviéndose después de guardar un archivo) en este entorno. Si hace falta verificar el build de producción, primero parar el dev server.

## Estructura del proyecto

```
src/
  app/                    — rutas (App Router). Cada carpeta con page.tsx es una ruta.
    api/                  — route handlers (API interna, todas server-only)
  components/             — componentes compartidos entre mundos
    practica/             — piezas del sistema de feedback de partida (ver abajo)
    reactbits/             — componentes portados de react-bits (ver sección aparte)
  lib/
    supabase/             — clientes de Supabase (client.ts, server.ts, admin.ts)
    practica/              — generadores de problemas + lógica de práctica
    enigmia/                — generadores de acertijos + skill level de Enigmia
    auth/guard.ts           — guards en capas (requireUsuario, requireMundoNumeria, requireMundoEnigmia)
supabase/migrations/       — SQL, 0001 a 0036, se aplican en orden a mano
docs/
  PROGRESO.md               — historial cronológico de auditorías/decisiones (fuente de verdad de "qué se hizo y por qué")
  ESPECIFICACION.md         — este archivo
```

## Los 3 mundos — contenido

### Numeria (`/numeria`)
Temas: Aritmética (`/practica`), Fracciones (`/practica/fracciones`), Decimales (`/practica/decimales`), Potencias (`/practica/potencias`), Álgebra (`/practica/algebra`). Lecciones en `/aprender`.

### Enigmia (`/enigmia`)
Una sola calibración de nivel (no por categoría). Práctica en `/enigmia/practica`, mezcla las 4 categorías. Lecciones en `/enigmia/aprender`. Diagnóstico inicial en `/enigmia/diagnostico`.

### Geografía (`/geografia`)
Un continente por ruta: `/geografia/practica/europa`, `/africa`, `/asia-oceania`, y la ruta base `/geografia/practica` (América). Lecciones en `/geografia/aprender`.

## Sistemas de gamificación

- **Calibración por tema** (`skill_levels` / `logic_skill_levels`): nivel 1-10, sube con 3 aciertos seguidos, baja con 1 error (salvo escudo activo). Lógica pura en `src/lib/practica/skillLevels.ts` / `src/lib/enigmia/skillLevels.ts`.
- **Nivel de mundo** (`world_progress`, tabla separada): tercer eje de progreso, acumulado por puntos ganados en cualquier práctica de ese mundo, curva RPG no lineal (`nivel = floor((50 + sqrt(2500 + 200*puntos)) / 100)`). Se muestra con `NivelMundoBadge.tsx` (persistente) y celebra con `NivelMundoSubio.tsx` (el "gesto del logo") al subir.
- **Puntos** (`profiles.puntos_total`): moneda permanente, nunca baja sola. Se gana con `registrar_xp_diario` (RPC `security definer`).
- **Racha diaria** (`daily_progress`, `profiles.streak_dias`): meta de XP diaria configurable, congelamientos comprables para no perderla.
- **Escudos de calibración**: protegen el nivel de un error (no la racha de partida). Se compran en la tienda.
- **Boost de XP** (`boost_multiplicador_pendiente`): ×1.5 temporal, comprable.
- **Apuesta "doble o nada"** (`apuesta_monto`/`apuesta_umbral`): jugarse una racha de precisión a cambio de duplicar Puntos.
- **Tienda** (`/tienda`): escudos, congelamientos, boost, colores de dial, marcos de perfil. Todo pasa por `comprar_item_tienda` (RPC `security definer`).
- **Logros** (`achievements`/`user_achievements`): catálogo fijo, se muestran todos (bloqueados o no) en `/perfil`.
- **Ranking semanal** (`ranking_semanal`): por XP de la semana, se reinicia los lunes. Filtro "por mundo" también disponible (dentro de Social > Amigos).
- **Rankeds** (`/rankeds`): competitivo real con ELO (`profiles.elo_rating`) y matchmaking (`duel_queue`, `buscar_rival_duelo`).
- **Duelos**: asincrónicos (no hay sesión en vivo compartida — es un proyecto aparte, deliberadamente no encarado). Tienen "fantasma" del rival (`duel_results.respuestas`) que muestra el ritmo exacto de las respuestas ya guardadas.
- **Social** (`/social`): pestañas Amigos / Grupos (antes "Profesor"). `/amigos` y `/profesor` son redirects.
- **Reto diario** (`/reto-diario`): 5 problemas iguales para todos los usuarios el mismo día (RNG sembrado por fecha, determinístico).
- **Feed** (`/feed`): actividad de logros/desafíos de la gente que seguís.

## Patrones de arquitectura establecidos

### RLS + `security definer`
Toda escritura de datos sensibles (Puntos, ELO, nivel, items de la tienda) pasa por funciones Postgres `security definer` con su propio chequeo `if auth.uid() is null then raise exception`. **Las policies de RLS por sí solas NO alcanzan** para proteger columnas específicas de una fila que el usuario sí puede tocar (ver hallazgo de la auditoría de seguridad, migración `0035`) — si una tabla necesita que el usuario actualice su propia fila pero solo algunas columnas, se usa `GRANT UPDATE (col1, col2) ON tabla TO authenticated` en vez de confiar en que nadie va a hacer un `update()` directo desde el cliente con más columnas de las esperadas.

**Antes de agregar una función nueva que escriba datos de otro usuario que no sea el propio, chequeo obligatorio**: ¿tiene `security definer`? ¿Valida `auth.uid()` al principio? ¿El `with check` de cualquier policy de INSERT/UPDATE relacionada restringe lo que hace falta?

### Sistema de feedback de partida (compartido)
Todos los runners de práctica (Aritmética, Fracciones, Decimales, Potencias, Álgebra, Enigmia, Geografía) comparten:
- `TarjetaSprint.tsx` — la tarjeta flashcard con transición de entrada/salida
- `PuntajeCorner.tsx` — el puntaje que aparece al acertar
- `BarraTiempo.tsx` / `useBonusTiempo.ts` — barra de tiempo + bonus por velocidad
- `RachaFuego.tsx` — el fuego que crece con la racha de aciertos seguidos
- `EscudoIcon.tsx` — animación de escudo rompiéndose al gastarse
- `RevelarRespuesta.tsx` (usa `PixelTransition`) — revela la respuesta correcta al errar

**Importante**: estos NO están unificados en un solo componente de runner — cada tema tiene su propio archivo (`SprintRunner.tsx`, `FraccionSprintRunner.tsx`, `EnigmiaSprintRunner.tsx`, `GeografiaSprintRunner.tsx`, y `EnunciadoSprintRunner.tsx` compartido por Decimales/Potencias/Álgebra) que importa estas piezas a mano. **Si se agrega un tema nuevo, hay que acordarse de importar las 6 piezas** — así se generó el hueco que se cerró en la auditoría de esta sesión (Decimales/Potencias/Álgebra no tenían ninguna, Fracciones/Enigmia/Geografía les faltaba solo RachaFuego). Evaluado un refactor de unificación (hook o shell compartido) — invasividad media, recomendado para después de la primera ronda de usuarios reales, no antes.

### Deduplicación de problemas dentro de una partida
`src/lib/practica/generarUnico.ts` → `generarSinRepetir(generar, clave, usados, maxIntentos=20)`. Todo generador de problemas nuevo debe usar esto (registrar una clave canónica por problema, reintentar si ya salió en la partida, permitir repetir recién si se agotan los intentos). Ya aplicado en los 7 generadores existentes.

### Patrones seguros para el compilador de React
Este proyecto tiene el compilador de React activo con reglas estrictas de `eslint-plugin-react-hooks`. Patrones ya establecidos y probados:
- **Nunca leer ni escribir un ref durante el render** (ni en el cuerpo del componente ni en un lazy initializer de `useState`) — hacerlo en un efecto o en un event handler.
- **Ajustar estado durante el render** (no en un efecto) cuando hace falta reaccionar a un cambio de prop — comparar contra un valor anterior guardado en estado, y hacer el `setState` directo en el cuerpo del componente (React lo trata como bail-out seguro).
- **`useSyncExternalStore`** para lecturas one-shot del cliente (tema, toggle de efectos) — nunca `useEffect` + `setState` para esto.
- Callbacks asíncronos (`.then()`, `setTimeout`, un `async function` disparada desde un handler) sí pueden hacer `setState` sin problema, incluso si están anidados dentro de algo llamado desde un efecto.

### El "gesto del logo"
Animación de marca reutilizada en TODOS los momentos grandes de celebración: subir de nivel de operación, logro desbloqueado, ganar un duelo, subir de nivel de mundo. Componente: `GestoLogo.tsx` (anillo que se abre + chispa asimétrica en degradé violeta→dorado). Nunca usar confetti genérico ni una animación nueva para un "momento grande" — reusar este gesto.

### `Boton.tsx`
Único componente de botón del proyecto. Variantes: `primario` (con `destacado` opcional → envuelve en `BorderGlow`), `secundario` (renderiza `SpecularButton`, WebGL), `fantasma`, `peligro`. **No crear botones sueltos con `<button>` + clases manuales** — los que quedan así (ej. algunos "Volver" de error, opciones en grillas de selección) son excepciones deliberadas ya documentadas en `PROGRESO.md`.

## Componentes de react-bits portados (`src/components/reactbits/`)

Se integraron 9 (de 10 pedidos): BorderGlow, FadeContent (adaptado como `PageFade.tsx`), SplitText (queda sin usar tras el problema de gsap — la técnica real de I3 ahora vive en framer-motion dentro de `PrimeraVezTip`... que a su vez también se desactivó, ver Pendiente), GlareHover, PixelTransition, GhostCursor, SpecularButton, ClickSpark (adaptado como `ChispaClick.tsx`, con la forma del logo en vez de líneas genéricas), BubbleMenu (portado fiel pero sin punto de uso real — la técnica se extrajo a `AbanicoBurbuja.tsx`, que también se dio de baja, ver Pendiente). **Lanyard** quedó explícitamente anotado para más adelante, no se tocó.

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # falta agregarla — ver Pendiente
```
La service_role key solo la usa `src/lib/supabase/admin.ts`, importado únicamente por `api/perfil/eliminar-cuenta/route.ts` (server-only, nunca se expone al cliente — confirmado inspeccionando el bundle real). **Nunca** importar `admin.ts` desde un Client Component.

## Migraciones (`supabase/migrations/`, 0001-0036)

Se aplican en orden, a mano, desde el SQL Editor de Supabase (no hay CLI en este entorno). Resumen por bloques:
- **0001-0011**: esquema base (perfiles, intentos, técnicas, calibración, progreso diario, modificadores, ranking, onboarding, logros, tienda inicial)
- **0012-0017**: amigos, duelos, feed, plan académico (profesor/grupos), Enigmia, ELO, economía
- **0018-0026**: lecciones de Numeria, fracciones, categorías de Enigmia, amigos v2, geografía, fix de recursión en grupos, reto diario, tienda ampliada, decimales/potencias
- **0027-0034**: lecciones de geografía, fantasma de duelos, ranking por mundo, fix de memoria en Enigmia, matchmaking de rankeds, álgebra básica, nivel de mundo, fix de nivel anterior
- **0035-0036**: **auditoría de seguridad pre-lanzamiento** — cierra 2 vulnerabilidades altas (policies de UPDATE sin `with check` en `profiles` y `duels`, explotables desde la consola del navegador) y 2 medias (`duel_results`, `friendships`); 0036 es un hotfix urgente porque 0035 rompió `registrar_xp_diario`/`comprar_item_tienda` al no haberles agregado `security definer` también.

**Antes de compartir la app con gente real, confirmar que 0035 y 0036 estén aplicadas** — sin ellas, cualquier usuario logueado puede escribirse Puntos/ELO/items de la tienda directo desde la consola del navegador.

## Pendiente / decisiones para revisar

1. **`SUPABASE_SERVICE_ROLE_KEY`** no está en `.env.local` ni (probablemente) en Vercel — sin ella, "Borrar mi cuenta" falla en producción (con error controlado, no un crash).
2. **Confirmar en Vercel**: variables de entorno coinciden con `.env.local`, y en Supabase → Authentication → URL Configuration está cargada la URL real de producción (si no, el login funciona en localhost pero falla en producción).
3. **Tour de onboarding desactivado** (`PrimeraVezTip.tsx` ya no se usa desde `Header.tsx`) — se sacó por un bug de renderizado nunca resuelto del todo (ver advertencia de gsap arriba, aunque el causante final terminó siendo un problema de `overflow-x-auto` recortando el eje Y, no gsap en sí — quedó desactivado igual porque no se re-intentó reactivarlo tras el fix). Si se quiere reactivar, revisar `Header.tsx` (buscar el comentario sobre `mostrarTour`).
4. **`AbanicoBurbuja.tsx`** (animación en abanico del menú de cuenta) también desactivada — `ProfileMenu.tsx` volvió al fundido simple original. El archivo queda sin usar.
5. **Refactor de unificación de runners de práctica** — evaluado, no implementado (ver sección de arquitectura arriba).
6. **Manejo de errores sin detalle técnico** — ~19 rutas de API reenvían `error.message` directo al cliente sin un `catch` genérico externo. Seguro en el camino feliz (son mensajes en español definidos a propósito), pero un error verdaderamente inesperado se propagaría sin capturar. No se tocó (cambio grande, 19 archivos).
7. **`ProfesorClient.tsx`** (lista de grupos) no muestra un mensaje explícito de "sin grupos todavía" cuando está vacío — no está roto, pero es inconsistente con el resto de las pantallas que sí lo hacen.
8. **Hydration warning menor** en `ProgressDial` (diferencia de precisión de punto flotante en un atributo `cx` de SVG entre servidor y cliente) — no afecta funcionalidad.
9. **`overflow-x: auto` en un contenedor recorta también el eje Y** aunque no se pida — causó dos bugs reales esta sesión (tooltip del tour, desplegable de cuenta, ambos clippeados por el `<nav>` del header). Si se necesita que algo escape hacia abajo de un contenedor con scroll horizontal, no usar `overflow-x-auto` — usar `flex-wrap` (la solución que se terminó aplicando en el header) u otro contenedor.

## Cómo levantar el proyecto

```
npm install --legacy-peer-deps   # hace falta el flag por conflicto de peer deps de react-simple-maps con React 19
npm run dev
```
Requiere `.env.local` con las variables de arriba. Sin `SUPABASE_SERVICE_ROLE_KEY`, todo funciona salvo "Borrar mi cuenta".
