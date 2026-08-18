# Progreso — sesión autónoma (2026-08-17, continuada 2026-08-18)

Registro en vivo de la tanda O3 → T3 (con S3 adentro) → PWA, más U3
(plantillas de email) y un pedido suelto (mostrar/ocultar contraseña en
login). Se actualiza a medida que se cierra cada fase, no solo al final,
según lo pedido. Cada entrada sigue el ciclo: **construí → verifiqué →
resultado**.

## ⚠️ Aviso importante: no pude hacer commits

No hay `git` instalado como CLI en este entorno (busqué en PATH, Program
Files, y dentro de la carpeta de GitKraken — no hay binario accesible).
Como pediste commits por fase para no perder progreso si algo se corta:
**no fue posible cumplir esa parte**. Todo el trabajo queda en el working
tree, sin commitear, en un solo bloque acumulado. Cuando vuelvas:
1. Revisá el diff completo antes de commitear (es grande — varias fases).
2. Idealmente separalo en commits por fase usando este mismo documento
   como guía de dónde cortar cada uno.

Esto no bloqueó el resto del trabajo — seguí sin parar, como pediste — pero
es la desviación más importante respecto a lo que pediste y quería que la
vieras primero, no enterrada al final.

## ⚠️ Aviso: aparecieron `docs/ESPECIFICACION.md` y `docs/EMAIL-PENDIENTE.md` a mitad de la sesión

En algún punto de esta sesión (lo noté recién cerca del final, haciendo
un repaso de `docs/`) aparecieron estos dos archivos, que **no los creé
yo** y no estaban ahí cuando arranqué a trabajar hoy (al principio de
esta conversación busqué específicamente `docs/especificacion.md` para
la primera pregunta y no existía en todo el repo). No tengo forma de
saber con certeza quién/qué los generó — el contenido de
`ESPECIFICACION.md` es preciso contra el código real (lo crucé contra
comentarios que ya había leído en `Header.tsx` antes en esta misma
sesión y coincide), así que lo traté como información confiable, no lo
ignoré. Un dato de ahí me sirvió de verdad: confirma que
`npm install --legacy-peer-deps` es la forma ya establecida de instalar
en este proyecto (por el conflicto de peer-deps de `react-simple-maps`
con React 19) — lo usé más tarde para poder generar los íconos PNG
reales de la PWA (ver esa sección). Si vos no generaste estos dos
archivos y no sabés de dónde salieron, vale la pena que lo revises —
podría ser otra sesión de Claude Code corriendo en paralelo sobre el
mismo repo, lo cual explicaría por qué no lo noté antes: dos sesiones
escribiendo archivos al mismo tiempo sin coordinarse es justo el tipo de
cosa que puede pisar trabajo de la otra sin que ninguna de las dos se
entere. Yo no piso nada de lo que describen esos archivos (no toqué
gsap, `AbanicoBurbuja`, `PrimeraVezTip`, ni el fix de `overflow-x`), así
que no debería haber conflicto real con mi trabajo de hoy — pero
mencionalo si armás los commits, por las dudas.

---

## Hecho antes de esta tanda (ya reportado en el chat)

- Diagnóstico completo de los 5 bugs → `docs/DIAGNOSTICO.md`.
- Fix de los 5 bugs (invitado sin restricción, manejo de errores en los 7
  motores de práctica, guard de onboarding con reintento).
- Redirect de email a localhost (dashboard de Supabase, ya explicado en el
  chat, no requiere código).

## Pedidos sueltos, hechos al arrancar esta tanda

- **Mostrar/ocultar contraseña en login**: `IconOjo`/`IconOjoTachado`
  nuevos en `src/components/icons.tsx`, toggle en
  `src/app/login/LoginForm.tsx`. Verificado con `tsc --noEmit` (limpio).
- **U3 — plantillas de email**: `docs/email-confirmar-cuenta.html` y
  `docs/email-recuperar-password.html`. **Nota**: `docs/email-template-
  magic-link.html` no existe en el repo (busqué en todo el working tree,
  no solo en `calibra/docs`) — no había nada para "adaptar", así que los
  armé desde cero con la paleta/tipografía/logo reales del proyecto
  (`globals.css`, `Logo.tsx`). Si ese archivo existe en otro lado y
  querías que partiera de ahí, decime y lo rehago sobre esa base.
  Verificación: revisión manual de la estructura HTML (tablas, estilos
  inline, sin JS/CSS externo — reglas de compatibilidad de email) y de
  que `{{ .ConfirmationURL }}` sea la variable correcta de Supabase para
  ambas plantillas (Confirm signup / Reset Password). No los pude
  renderizar en un cliente de correo real desde acá — falta esa prueba
  visual final de tu lado antes de pegarlos en el dashboard.

---

## O3 — Nombre de usuario y email únicos

**Construí:**
- Email: ya estaba cubierto de antes (Supabase rechaza `signUp` con email
  repetido, `RegistroForm.tsx` ya mostraba "Ya existe una cuenta con ese
  email."). No hizo falta tocar nada ahí.
- Nombre: `supabase/migrations/0037_nombre_unico.sql` — índice único
  case-insensitive sobre `profiles.display_name`. **Riesgo documentado en
  la propia migración**: si ya existen cuentas reales con nombres
  duplicados, la creación del índice va a fallar — dejé la query para
  encontrarlas y el paso a paso para resolverlas a mano antes de
  reintentar. No lo puedo saber de antemano sin acceso a los datos de
  producción.
- Manejo del error `23505` (unique_violation) con mensaje claro en
  `OnboardingForm.tsx` (primer nombre) y `NombreEditable.tsx` (editar
  después).

**Verifiqué:** `tsc --noEmit` limpio, `eslint` limpio sobre los 2 archivos
tocados. No pude probar el índice contra datos reales de producción (no
tengo acceso a la base) — la migración en sí no se corrió, solo quedó
escrita y documentada.

**Resultado:** completo del lado de código. Pendiente de tu lado: correr
`0037_nombre_unico.sql` en producción (revisando primero el query de
duplicados de la propia migración).

---

## T3 (con S3 adentro) — en construcción

Documentando en vivo, sub-fase por sub-fase, no solo al cierre.

### T3 / sub-fase 1 — Problemas compartidos entre los dos rivales (base de "tiempo real")

**Por qué esto primero:** sin esto, aunque el countdown se sincronice
perfecto, cada rival vería números distintos — "ven el mismo problema al
mismo tiempo" es un requisito explícito de la fase, y **no estaba
implementado en absoluto**: `duels.semilla_problemas` ya se generaba y
guardaba desde hace rato (`api/amigos/retar`, `api/feed/retar`) pero
nunca se leía ni se usaba para nada — confirmé con grep que no hay ningún
otro punto del código que consuma esa columna. Los problemas siempre
salían de `Math.random()`.

**Construí:**
- `src/lib/rng.ts`: extraje el `mulberry32` que ya existía duplicado
  adentro de `retoDiario.ts` a un módulo compartido (evita una segunda
  copia de la misma implementación bit a bit).
- `src/lib/retoDiario.ts`: ahora importa `mulberry32` de ahí en vez de
  tener su propia copia — mismo comportamiento, verificable porque sus
  tests (si los tuviera) seguirían pasando; no hay test de retoDiario en
  el repo, así que la verificación acá fue lectura cuidadosa del diff
  (el algoritmo es idéntico carácter por carácter).
- `src/lib/practica/problems.ts`: `randomInt` y las 4 funciones
  `generarSuma/Resta/Multiplicacion/Division` ahora aceptan un `rng`
  opcional (default `Math.random`, cero cambio de comportamiento fuera de
  duelos). `generarProblema` expone ese `rng` como 4to parámetro opcional.

**Verifiqué (con test real, no a ojo):** agregué
`src/lib/practica/problems.test.ts` — dos secuencias de 20 problemas con
la misma semilla dan exactamente iguales (`toEqual`), semillas distintas
dan secuencias distintas, y sin `rng` explícito `generarProblema` sigue
funcionando como práctica normal. Corrí `npx vitest run`: **17/17 tests
pasan** (13 preexistentes + 4 nuevos). También `tsc --noEmit` limpio.

**Resultado:** completo y verificado con test automatizado, no solo
lectura de código. Falta todavía: que `SprintRunner.tsx` reciba la
semilla del duelo y arme el `rng` sembrado en el momento correcto — eso
es la sub-fase 2, sigue ahora.

*(Bug encontrado de paso, no reportado en la tanda original: en
`SprintSummary.tsx`, cuando un duelo asincrónico todavía no está resuelto
(`resuelto: false` porque el rival no jugó su parte todavía), la UI cae
igual en la rama de "perdiste" — nunca chequea `duelo.resuelto`. Queda
para arreglar en la sub-fase de UI del duelo, ya que toca el mismo
archivo.)*

### T3 / sub-fase 2 — Sala de duelo sincronizada (Realtime real) + fix del bug de "perdiste antes de tiempo"

**Construí:**
- `src/app/practica/page.tsx`: `DueloInfo` ahora incluye `rivalId` (se
  deriva de `retador_id`/`retado_id` que `obtener_duelo` ya devolvía,
  antes sin usar) y `semilla` (leída directo de `duels.semilla_problemas`
  — `obtener_duelo` no la expone, así que se hace un segundo select en
  paralelo, permitido por la policy de SELECT de `duels`). Se pasa
  `miUserId={user.id}` a `PracticaClient`.
- `src/app/practica/SprintRunner.tsx`: nuevo prop `semillaDuelo?: number`
  — si viene, arma un `mulberry32(semillaDuelo)` guardado en un
  `useRef` y lo usa para TODOS los problemas del sprint en vez de
  `Math.random`. Cuidado especial con el lazy initializer del primer
  problema (no puede leer `ref.current` durante el render — el linter de
  React Compiler ya lo había marcado antes en otro archivo de esta misma
  tanda) — arma un generador temporal a partir del prop directo en vez
  del ref; matemáticamente da lo mismo para los dos rivales (ver
  comentario en el código, es determinístico de punta a punta).
- `src/app/practica/SalaDuelo.tsx` (nuevo): la "sala de espera"
  sincronizada. Canal de Supabase Realtime `duelo:<id>` con **Presence**
  (cada rival se marca presente al entrar) y **Broadcast** (evento
  `start` con el instante exacto de arranque). Quién dispara el
  broadcast es determinístico (compara `miUserId < rivalId`) para que
  nunca compitan dos cuentas regresivas con horarios distintos. Cuenta
  regresiva visual sincronizada contra ese instante de reloj compartido
  (no contra un timer local de cada uno). Si el rival nunca aparece en
  `TIMEOUT_ESPERA_MS` (45s), cae a un botón manual "Jugar mi parte
  ahora" — el fallback fantasma/asincrónico de siempre, tal como pedía
  la fase.
- `src/app/practica/PracticaClient.tsx`: la fase `duelo-intro` (antes un
  bloque estático con un botón "Empezar duelo") ahora renderiza
  `SalaDuelo`. Pasa `semillaDuelo` a `SprintRunner`.
- **Fix del bug encontrado en la sub-fase anterior**: `SprintSummary.tsx`
  ahora chequea `duelo.resuelto` antes de mostrar cualquiera de las 3
  ramas (empate/gané/perdí) — si todavía no está resuelto, muestra un
  mensaje neutral ("ya jugaste tu parte, en cuanto tu rival termine vas a
  ver quién ganó") en vez de la rama de derrota por default.

**Verifiqué:**
- `tsc --noEmit`: limpio.
- `eslint` sobre los 5 archivos tocados: limpio — pero no de una. El
  primer intento de `SalaDuelo.tsx` disparó
  `react-hooks/set-state-in-effect` (llamar `setState` sincrónicamente
  adentro de un `useEffect` sin pasar por una suscripción/callback). Lo
  arreglé difiriendo esa llamada con `queueMicrotask` y volví a lintear
  — ahí sí limpio. Esto es exactamente el ciclo "construí → verificá →
  si falla, arreglá antes de seguir" que pediste, documentado como pasó
  de verdad, no en teoría.
- **Lo que NO pude verificar**: el comportamiento real de dos sesiones
  simultáneas contra Supabase Realtime (dos pestañas de navegador, dos
  usuarios reales, latencia real de red). No tengo un browser tool en
  este entorno para abrir dos sesiones autenticadas y comprobar que la
  cuenta regresiva realmente sincroniza y que ambos ven los mismos
  problemas. La lógica está razonada con cuidado (el comentario en
  `SalaDuelo.tsx` y en el lazy initializer de `SprintRunner.tsx` explica
  por qué debería ser determinística) y cubierta por el test de
  `problems.test.ts` en la parte que SÍ es testeable sin red (el
  determinismo del generador). La parte de Realtime en sí —conexión,
  presence, broadcast— queda **sin probar en vivo**. Lo digo acá explícito
  como pediste, no lo doy por bueno solo porque el código "se ve bien".

**Resultado:** sub-fase completa del lado de código, con la salvedad de
arriba sin probar en vivo. Sigue: matchmaking (S3) enrutando hacia esta
misma sala, el gap de descubrimiento de matchmaking que encontré (ver
abajo), invitación por link, notificaciones, y la migración SQL que junta
todo esto (falta correrla, obviamente, para que cualquiera de esto
funcione en producción).

*(Otro hallazgo de paso: `buscar_rival_duelo` (0031) solo le devuelve el
`duel_id` a quien hizo la llamada RPC que encontró al rival — el OTRO
jugador (el que ya estaba esperando en la cola) nunca se entera por ese
camino, porque su fila de `duel_queue` ya fue borrada y su próximo poll
simplemente vuelve a encolarse de cero. Esto es un bug real preexistente
en el matchmaking, no algo que yo haya introducido — lo cierro en la
sub-fase de matchmaking, ya que se soluciona con la misma infraestructura
de notificaciones que necesito construir para T3 igual.)*

### T3 / sub-fase 3 — Matchmaking (S3), invitación por link, notificaciones, migración

**Construí:**
- `supabase/migrations/0038_duelos_tiempo_real.sql` — todo el schema
  nuevo en un solo archivo:
  1. **S3**: `buscar_rival_duelo` redefinida (`create or replace`, mismo
     shape de salida) con ventana ±30 / +30 cada 10s / tope ±300 (antes
     ±15 / +15 cada 8s / tope ±120).
  2. **Tabla `duel_invites`** (invitación por link, no requiere
     amistad) + `crear_invitacion_duelo`, `unirse_invitacion_duelo`,
     `cancelar_invitacion_duelo` (las 3 security definer, mismo patrón
     que el resto del proyecto).
  3. **`mis_duelos_pendientes()`** — nueva, security definer. Hallazgo
     al construir esto: la policy de SELECT de `profiles` (0001) solo
     deja ver la fila propia — cualquier intento de traer el nombre de
     OTRO usuario con un select directo del cliente vuelve vacío bajo
     RLS. Confirmé esto es cierto también para el "sugeridos" del feed
     (`feed/page.tsx` hace `supabase.from("profiles")...neq("id", user.id)`
     sin RPC — bajo esta RLS eso da lista vacía siempre). **No lo
     arreglé** (no es parte de esta tanda, lo anoto para que lo sepas:
     "gente sugerida para seguir" en Feed probablemente está silenciosamente
     rota en producción, no relacionado con esta sesión).
  4. **Realtime**: agrega `duels` y `duel_invites` a la publicación
     `supabase_realtime`, envuelto en un chequeo idempotente. Documenté
     en el propio archivo qué hacer a mano en el dashboard si la
     publicación no existiera (caso raro).
- `src/components/NotificacionesDuelo.tsx` (nuevo) — toast global,
  montado una vez en `src/app/layout.tsx`, se suscribe a
  `postgres_changes` INSERT de `duels` filtrando `retado_id=eq.<mi id>`.
  No hacía NADA de esto antes (confirmado, no roto — nunca construido).
- `src/app/rankeds/RankedsClient.tsx`: tercera pestaña "Invitar por
  link" (genera invitación, muestra el link con copiar-al-portapapeles,
  se suscribe por Realtime a la propia invitación para saber cuándo se
  usó y redirigir), sección "Duelos pendientes" en "Mi competitivo"
  (usa `mis_duelos_pendientes`), texto de búsqueda cambiado de "±X ELO"
  a "entre A-B ELO" (pedido explícito de la fase), y el fix del hueco de
  descubrimiento de matchmaking: cada vez que un poll no encuentra rival
  por la vía normal, también chequea directo si YA quedé como `retado_id`
  de un duelo nuevo desde que empecé a buscar.
- `src/app/rankeds/page.tsx`: pasa `miUserId` y
  `duelosPendientesIniciales` (via `mis_duelos_pendientes`) al cliente.
- `src/app/duelo/invitacion/[inviteId]/page.tsx` (nuevo) — a donde lleva
  el link compartido: valida sesión (bloquea invitados, igual que
  Rankeds), llama `unirse_invitacion_duelo`, redirige a la sala de duelo
  sincronizada (la misma `SalaDuelo` de la sub-fase 2 — no hay un
  camino separado para duelos por link vs. duelos de amigos/Rankeds,
  todos terminan en el mismo `/practica?duelo=X`).

**Verifiqué:**
- `tsc --noEmit`: limpio.
- `eslint` sobre los 5 archivos nuevos/tocados de esta sub-fase: limpio
  a la primera.
- Corrí `npx vitest run` (toda la suite) y `npx eslint src` (todo el
  proyecto, no solo los archivos tocados) para confirmar que nada de
  esta sub-fase rompió algo en otro lado: **17/17 tests siguen pasando**,
  y `eslint` solo muestra los mismos 4 errores preexistentes de
  `DiagnosticoClient.tsx` (líneas que no toqué en esta sub-fase,
  reportados y explicados desde antes) — cero errores nuevos en todo
  `src/`.
- **Lo que NO pude verificar** (mismo límite que en la sub-fase 2, ahora
  aplicado a más superficie): el join real de dos sesiones por link, la
  notificación en vivo llegándole de verdad a un segundo usuario
  conectado, y que `alter publication supabase_realtime add table ...`
  corra sin fricción en el proyecto real de Supabase (asumí que la
  publicación default existe, que es lo normal, pero no lo puedo
  confirmar sin acceso al proyecto). La migración en sí **no se corrió**
  — nada de esto puede funcionar en producción hasta que la corras vos.

**Resultado:** T3 funcionalmente completo del lado de código (incluye S3
adentro, como pediste). Tres piezas explícitamente sin probar en vivo por
límites de este entorno (nunca las voy a poder marcar como "confirmado
funcionando" sin que vos las pruebes): sincronización real de Realtime
entre dos navegadores, la migración corriendo contra Supabase de
verdad, y el flujo de invitación de punta a punta con dos cuentas
reales.

---

## PWA — instalable, sin modo offline completo

**Construí** (siguiendo `node_modules/next/dist/docs` como exige
AGENTS.md — Next 16 tiene convenciones nativas distintas a las que
pedías literalmente, expliqué por qué las usé en vez de lo pedido
textual):
- `src/app/manifest.ts` — convención nativa de Next 16 (`app/manifest.ts`
  con `MetadataRoute.Manifest`) en vez de `public/manifest.json` a mano:
  Next lo sirve en `/manifest.webmanifest` y lo enlaza en el `<head>`
  solo, sin tocar `layout.tsx` a mano para eso. Nombre, colores de marca
  (`#6C4CF1` / `#FDFBF7`), `display: "standalone"`.
- **Íconos: PNG reales, resuelto.** `public/icon.svg` (calcado de
  `Logo.tsx`, fondo `#FDFBF7`, esquinas redondeadas tipo ícono de app) es
  la fuente. Al principio no pude rasterizarlo a PNG (sin browser/canvas
  en este entorno, y el primer intento de instalar `sharp` chocó con el
  conflicto de peer-dependency de `react-simple-maps` — no lo forcé sin
  saber si era seguro). **Encontré `docs/ESPECIFICACION.md` más tarde en
  la sesión** (ver nota grande más abajo sobre este archivo) que
  documenta explícitamente que `npm install --legacy-peer-deps` es la
  forma ya establecida de instalar en este proyecto — con esa
  confirmación, reinstalé `sharp` (`npm install --no-save --legacy-peer-deps
  sharp`, nunca tocó `package.json`/el lockfile) y generé
  `public/icon-192.png`, `public/icon-512.png` y
  `public/apple-touch-icon.png` de verdad con un script Node de un solo
  uso (borrado después). **Los vi renderizados** (leí el PNG resultante)
  para confirmar que el dibujo salió bien, no asumí que "compiló, debe
  estar bien". `manifest.ts` y `layout.tsx` (`metadata.icons.apple`) ya
  apuntan a los PNG reales, no al SVG solo.
- `src/app/layout.tsx`: `viewport.themeColor` (claro/oscuro, reemplaza al
  `themeColor` de `metadata` que Next deprecó en la v14) y
  `metadata.appleWebApp` (`capable: true`, título "Prodigia") — esto es
  lo que saca la barra de direcciones al abrir desde el ícono instalado.
- `public/sw.js` — service worker escrito a mano (no `next-pwa`: no está
  en `package.json` y tiene problemas de compatibilidad conocidos con
  Turbopack/App Router; no `Serwist`, que es lo que la propia guía de
  Next recomienda para offline completo, porque explícitamente NO
  pedías offline completo). Cachea, cache-first, únicamente
  `/_next/static/*` (nombres con hash — cachear fuerte ahí es 100%
  seguro, nunca cambia el contenido de una misma URL) y el ícono.
  **No intercepta absolutamente nada más** — ni HTML de páginas, ni
  `/api/*`, ni las llamadas a Supabase — a propósito, para que nunca se
  corra el riesgo de mostrarle a alguien una sesión vieja o un resultado
  de duelo desactualizado después de un deploy.
- `src/components/RegistrarServiceWorker.tsx` — lo registra al montar
  la app, `try/catch` silencioso si el navegador no soporta service
  workers (no rompe nada, solo no cachea).

**Verifiqué:**
- `tsc --noEmit` y `eslint` sobre los 4 archivos nuevos/tocados: limpio.
- **Corrí `npx next build` completo** (no solo tsc suelto) — compiló
  sin errores, generó las 68 rutas de la app incluyendo
  `/manifest.webmanifest` y `/icon.svg` como rutas estáticas nuevas.
  Esta es la verificación más fuerte de toda la sesión: confirma que
  TODO lo de hoy (los 5 bugs, O3, T3 completo, y la PWA) compila y
  buildea junto, de punta a punta, no solo archivo por archivo.
- **No pude verificar** la instalación real "agregar a pantalla de
  inicio" en un dispositivo — no tengo un teléfono ni un navegador para
  probarlo. La estructura sigue la documentación oficial de Next 16 al
  pie de la letra, pero "se ve bien en el código" no es lo mismo que
  "se instala de verdad", y lo digo explícito.

**Nota aparte, no de esta fase pero la vi en el build**: el build tira
un warning de que `middleware.ts` está deprecado en Next 16 a favor de
`proxy.ts` (`npx @next/codemod@canary middleware-to-proxy .` lo
migraría solo). No lo toqué — no estaba en la lista de nada de lo que
pediste y toca el archivo que maneja el refresh de sesión de auth en
cada request, no quería tocar eso al final de una sesión ya enorme sin
que lo decidas vos. Lo dejo anotado para la próxima.

---

## Verificación final de conjunto

Como pediste, esto no es fase por fase — es todo junto, tratando de
simular lo más posible a un usuario real. Reporto lo que SÍ pude probar
de verdad y lo que no, sin dar nada por bueno solo porque el código "se
ve bien".

**Lo que sí verifiqué de verdad (con herramienta, no a ojo):**
- `npx vitest run` — 17/17 tests pasan (13 preexistentes + 4 nuevos de
  `problems.test.ts`, que prueban el determinismo real del rng
  compartido de los duelos).
- `npx tsc --noEmit` — limpio en cada punto de control de la sesión, no
  solo al final.
- `npx eslint src` (todo el proyecto) — limpio salvo los 4 errores
  preexistentes de `DiagnosticoClient.tsx` que ya estaban documentados
  antes de que yo tocara ese archivo.
- `npx next build` — build de producción completo, compila y genera las
  68 rutas de la app sin errores. Esto es la prueba más fuerte de que
  todo lo de hoy encaja junto (los 5 bugs, O3, T3 entero, PWA) sin
  romper nada de lo existente a nivel de compilación.
- Levanté el dev server un momento y confirmé que `/manifest.webmanifest`
  responde 200 con el JSON exacto esperado.

**Lo que NO pude verificar en vivo, y por qué (dicho explícito, como
pediste, no lo doy por bueno sin más):**
- **No creé una cuenta nueva de punta a punta contra Supabase real.**
  Decisión deliberada, no una omisión: el propio Bug 2 que diagnostiqué
  hoy es que el proyecto tiene un tope muy bajo de emails/hora — crear
  una cuenta de prueba mía habría consumido parte de esa cuota limitada
  y potencialmente bloqueado a gente real probando la app mientras tanto.
  No me pareció razonable hacerlo sin que lo decidas vos.
- **No probé duelos en tiempo real con dos sesiones reales** (dos
  pestañas, dos cuentas, latencia de red real) — no tengo un browser
  tool en este entorno para abrir dos sesiones autenticadas a la vez.
  La lógica de `SalaDuelo.tsx` está razonada con cuidado y documentada,
  pero "razonada con cuidado" no es lo mismo que "confirmada
  funcionando" — falta que la pruebes vos.
- **No corrí ninguna migración nueva** (`0037`, `0038`) contra el
  Supabase real — ver la lista de migraciones pendientes más abajo, en
  orden. Nada de O3/T3 puede funcionar en producción hasta que corran.
- **No probé una partida completa en cada mundo** (Numeria, Enigmia,
  Geografía, Fracciones, Decimales, Potencias, Álgebra) de punta a
  punta en el navegador — sí verifiqué con lectura cuidadosa de código
  que los 7 motores de práctica comparten el mismo fix del Bug 4 y que
  ninguno quedó con el patrón viejo (`grep` confirmó los 7 antes y
  después del fix), pero eso es revisión de código, no una partida
  jugada de verdad.
- El dev server que levanté para el smoke test de arriba se cayó solo
  entre un chequeo y el siguiente (el proceso en segundo plano no
  sobrevivió) — no alcancé a probar `/login` ni `/registro` cargando de
  verdad en el navegador, solo confirmé que el build las genera como
  rutas válidas.

**Conclusión honesta:** el código compila, tipa, lintea y buildea limpio
de punta a punta, y las partes verificables sin un navegador real (el
determinismo del generador de problemas compartido) están probadas con
un test automatizado de verdad. Todo lo que necesita un navegador con
sesión real o dos usuarios simultáneos —que es una parte grande de lo
que se construyó hoy, sobre todo T3— queda sin confirmar hasta que lo
pruebes vos. No estoy dando por terminado algo que no pude ver funcionar.

---

## Qué hacer vos cuando vuelvas — en orden

1. **Revisar el diff y commitear** (no pude hacer los commits por fase
   que pediste — ver el aviso al principio de este documento). Si querés
   separarlo en varios commits, este documento tiene las fases en orden
   cronológico para guiarte dónde cortar cada uno.
2. **Dashboard de Supabase** (nada de esto es código, no lo pude hacer
   yo):
   - Authentication → URL Configuration: Site URL + Redirect URLs al
     dominio de Vercel (ya explicado antes en esta conversación).
   - Authentication → Providers: confirmar "Anonymous Sign-ins" habilitado
     (Bug 1).
   - Authentication → SMTP Settings: proveedor propio (Resend/Postmark/
     SendGrid) para sacar el tope de emails/hora (Bugs 2 y 3).
   - Authentication → Emails → Templates: pegar
     `docs/email-confirmar-cuenta.html` en "Confirm signup" y
     `docs/email-recuperar-password.html` en "Reset Password" (Fase U3).
3. **Correr las migraciones nuevas, en este orden exacto:**
   - `supabase/migrations/0037_nombre_unico.sql` — **leé el comentario
     de arriba del archivo antes de correrla**, puede fallar si ya hay
     nombres duplicados en producción (trae la query para encontrarlos).
   - `supabase/migrations/0038_duelos_tiempo_real.sql` — si el bloque de
     Realtime al final falla, el mismo archivo explica el paso manual de
     respaldo en Database → Replication.
4. ~~Generar un ícono PNG real~~ — resuelto en esta misma sesión más
   tarde (ver nota en la sección de PWA), no hace falta nada de tu
   lado acá.
5. **Probar en vivo** lo que yo no pude: crear una cuenta nueva de
   punta a punta, un duelo con dos sesiones (dos navegadores o
   modo incógnito + normal), la invitación por link, y que las
   notificaciones de reto lleguen de verdad.

## Decisiones que tomé por mi cuenta — vale la pena que las revises

- **Invitado**: usé la sesión anónima real que ya elegía el código
  existente (progreso persistente, no una sesión "de mentira" que se
  pierde) — no había una segunda opción construida, así que no fue una
  elección entre dos caminos igual de válidos.
- **ELO en duelos por invitación de link**: decidí que también actualizan
  ELO, igual que los retos de amigos/feed ya lo hacían antes de hoy
  (`registrar_resultado_duelo` no distingue el origen del duelo). No lo
  hice "no competitivo" a propósito — la fase no lo pedía explícito y
  mantener el mismo comportamiento en todos los duelos me pareció más
  consistente que inventar una excepción nueva.
- **Quién dispara el countdown sincronizado** en `SalaDuelo.tsx`: el
  `user_id` menor en orden alfabético, no el retador — así nunca compiten
  dos "start" con horarios distintos sin necesitar coordinación extra.
- **Progreso en vivo del rival durante el sprint** (una barra tipo
  "tu rival va en la pregunta 6"): lo dejé afuera a propósito para no
  seguir estirando el alcance — la fase pedía "mismo problema, mismo
  momento de arranque, timer propio en paralelo", los tres están. Un
  indicador de progreso en vivo es una mejora posible, no algo que falte
  para cumplir lo pedido.
- **`public/manifest.json` → `app/manifest.ts`**: usé la convención
  nativa de Next 16 en vez del archivo estático que pedías literalmente
  — hace lo mismo (mismo JSON final, en `/manifest.webmanifest`) pero
  sin tener que enlazarlo a mano en el `<head>`. Está explicado en el
  propio archivo por qué.
- **No usé `next-pwa`** (lo mencionabas como opción): no está en
  `package.json` y tiene compatibilidad floja con Turbopack/App Router
  en general — escribí `public/sw.js` a mano, deliberadamente angosto
  (solo assets estáticos con hash, nada de páginas ni API) para que
  fuera imposible que cachee algo sensible por accidente.

---

# Segunda tanda (2026-08-18): V3 → W3 → X3

Continúa el mismo documento, mismo formato: construí → verifiqué →
resultado.

## ⚠️ V3 — Diagnóstico de auth roto (recuperar contraseña, y ahora también login/invitado)

**No pude confirmar la causa exacta con datos reales — no tengo acceso a
la consola del navegador ni a Authentication → Logs del dashboard de
Supabase.** Lo que sigue es diagnóstico razonado a partir de:
(a) leer el código real de los 5 formularios de auth, (b) investigar la
documentación oficial de Supabase (no de memoria — usé WebSearch/WebFetch
contra `supabase.com/docs` para no adivinar), y (c) el dato nuevo que
diste mientras trabajaba: **ahora también fallan login normal y entrar
como invitado**, no solo recuperar contraseña.

### Lo que SÍ hice (código, verificado):

1. **`src/lib/auth/mensajeError.ts` (nuevo)** — helper centralizado que
   mapea los códigos reales de error de Supabase Auth
   ([lista oficial](https://supabase.com/docs/guides/auth/debugging/error-codes))
   a mensajes en español, y **siempre** deja el código real en la consola
   del navegador (antes, varios de los 5 formularios silenciaban el
   error real y mostraban un genérico sin loguear nada — así fue como
   este bug quedó sin poder diagnosticarse durante toda la sesión
   anterior). Aplicado en los 5 formularios: `RegistroForm`,
   `LoginForm` (login e invitado), `RecuperarForm`,
   `ActualizarPasswordForm`, `ConvertirCuenta`.
2. Confirmé contra la documentación oficial de Supabase que
   `{{ .ConfirmationURL }}` **es la variable correcta** para la
   plantilla de "Reset Password" — Supabase arma ese link ya
   resuelto (apuntando a su propio endpoint de verificación, que
   redirige después a tu app) para las 5 plantillas estándar por igual,
   incluyendo recuperación. **No es un problema de la plantilla.**
   ([fuente](https://supabase.com/docs/guides/auth/auth-email-templates))

**Verifiqué**: `tsc --noEmit` limpio, `eslint` limpio en los 6 archivos
tocados (`mensajeError.ts` + los 5 formularios).

### Lo que corrijo de mi propio diagnóstico anterior — esto puede ser LA causa

En el mensaje de hace dos días te dije que agregaras
`https://tu-dominio.vercel.app/auth/callback` **tal cual, sin
comodín**, a la lista de Redirect URLs de Supabase. Investigando ahora
encontré que el allow-list de Supabase hace **glob matching**, no
substring: una entrada sin `*`/`**` tiene que matchear el string
completo, **incluyendo cualquier query string**. Y las URLs que arma
este código SIEMPRE terminan con un query string agregado por el propio
Supabase (`?code=...` como mínimo, más `?next=...` que agrega el código
de recuperación). Si cargaste la entrada exacta sin comodín como te dije,
**ninguna de las dos URLs (registro NI recuperación) matchea nunca**, y
Supabase debería estar cayendo al comportamiento por default en vez de
mandar al redirect pedido — dependiendo de la versión esto se traduce en
"usa el Site URL" (lo que ya vimos, redirige a localhost) o, en
proyectos más nuevos, puede ser tratado como un pedido inválido.
**Corrección: cambiá esa entrada a `https://tu-dominio.vercel.app/**`
(con el doble asterisco al final) — así matchea cualquier ruta y
cualquier query string bajo tu dominio.**
([fuente sobre el glob matching](https://supabase.com/docs/guides/auth/redirect-urls))

### Hipótesis nueva, más fuerte, para el dato de "ahora también falla login e invitado"

Que **recuperar Y login normal Y entrar como invitado** fallen los tres
al mismo tiempo es un patrón distinto al de antes (antes solo fallaba lo
que mandaba email). Login y invitado **no mandan ningún email** — así
que la causa ya no puede ser el tope de emails/hora. Tres hipótesis, en
orden de probabilidad:

1. **CAPTCHA ("Bot and Abuse Protection") quedó habilitado en el
   dashboard**, posiblemente sin querer mientras se tocaban otras
   cosas de Authentication → Settings. Ninguna llamada de este código
   manda nunca un `captchaToken` — si Supabase lo exige del lado del
   servidor, **toda** llamada de auth (login, signup, invitado,
   recuperar) empieza a fallar por igual, que es exactamente el patrón
   que describís. Ya agregué el código `captcha_failed` al helper de
   arriba para que, si es esto, el mensaje en pantalla lo diga
   explícito la próxima vez. **Revisá Authentication → Settings → Bot
   and Abuse Protection y confirmá que esté desactivado** (o, si lo
   necesitás activo por otra razón, avisame — hay que integrar
   hCaptcha/Turnstile en los 5 formularios, no es trivial).
2. **Rate limit por IP** (`over_request_rate_limit`) — con tanto
   testing seguido desde la misma conexión, Supabase puede empezar a
   frenar temporalmente TODOS los pedidos de auth de esa IP, no solo
   los de email. Se resuelve solo, esperando unos minutos — si volvés a
   probar en un rato y anda, era esto.
3. **El proveedor "Email" en Authentication → Providers se desactivó
   por accidente** — sin él, ni login ni signup con contraseña
   funcionan (invitado no debería depender de este, así que si SOLO
   esto estuviera desactivado, invitado seguiría andando — como no es
   el caso, esta hipótesis es la menos probable de las 3, pero es la
   más rápida de descartar: es un toggle, revisalo de paso).

**Lo que necesito de vos para confirmar cuál es**: con el helper nuevo ya
aplicado, la próxima vez que falle cualquiera de los 3 flujos, la
consola del navegador (F12 → Console) va a mostrar una línea
`[auth] code=... status=...` con el código real. Ese código solo
(`captcha_failed`, `over_request_rate_limit`, algo distinto) me
resuelve esto sin más vueltas — hoy es el único dato que me falta y no
puedo conseguir yo mismo.

---

## W3 — Confirmación fase por fase

1. **P3 (foto de perfil, Supabase Storage)** — era NO, ahora SÍ. Construido
   esta tanda: `0039_avatares.sql` (bucket público `avatares` con
   policies por carpeta de user_id, columna `profiles.avatar_url`,
   agregada al GRANT de columnas editables igual que `display_name`),
   `src/components/Avatar.tsx` (foto o iniciales sobre fondo violeta),
   `src/app/perfil/SubirAvatar.tsx` (subida con validación de
   tipo/tamaño, cache-busting por querystring). Se muestra en: perfil
   propio, perfil público de otros, podio y filas del ranking.
2. **Q3 (ver perfil de otros + reportar)** — era NO, ahora SÍ. Construido:
   `0040_perfil_publico_y_reportes.sql` (tabla `reportes_usuario` sin
   ninguna policy de SELECT — a propósito, revisión manual tuya vía
   Table Editor —, función `reportar_usuario`, función
   `obtener_perfil_publico` porque la RLS de `profiles` de 0001 no deja
   leer la fila de otro usuario con un select directo — mismo hallazgo
   que ya había encontrado con `mis_duelos_pendientes` en la tanda
   anterior), ruta `src/app/perfil/[userId]/page.tsx` + `ReportarBoton.tsx`.
   Enlazado desde los 4 lugares que pedía la fase: Feed (autor de logro
   y de desafío), Ranking/podio, lista de Amigos, y pantalla de
   resultado de duelo (esto último necesitó agregar `oponente_id` al
   resultado de `registrar_resultado_duelo`, que antes solo devolvía el
   nombre — se redefinió, mismo cuerpo, en el mismo archivo de
   migración).
3. **R3 (podio épico)** — era NO, ahora SÍ. `src/app/leaderboard/Podio.tsx`
   (nuevo): alturas de podio real (2-1-3), oro/plata/bronce como acento
   de color y borde, avatar de cada uno, y `GlareHover` (ya integrado en
   el proyecto, `src/components/reactbits/GlareHover.tsx`) disparado
   sobre la tarjeta del 1° puesto medio segundo después de cargar la
   página — elegí GlareHover en vez de GestoLogo porque GestoLogo es una
   animación que se dispara y termina (pensada para el instante de un
   logro/nivel), y acá hacía falta algo que quedara bien como parte
   permanente de la tarjeta, no algo que aparece y desaparece.
   `ranking_semanal()` redefinida para devolver también `avatar_url`
   (`0041_ranking_con_avatar.sql`).
4. **Deduplicación de problemas, incluyendo los 3 procedurales de
   Enigmia** — confirmado SÍ, ya estaba. Verifiqué leyendo
   `EnigmiaSprintRunner.tsx:42-58`: `elegirSiguiente` ya envuelve
   `generarAcertijoProcedural` (memoria/patrones/computacional) en
   `generarSinRepetir`, con una clave canónica pensada específicamente
   para acertijos procedurales (`enunciado + secuencia`, porque el `id`
   de estos siempre es único por diseño y no serviría para detectar
   contenido repetido). No hizo falta tocar nada.
5. **Continentes de Geografía + 3 lecciones mnemotécnicas** — confirmado
   SÍ, ya estaba. Verifiqué contando: `PAISES_AFRICA` tiene 46 países,
   `PAISES_ASIA_OCEANIA` tiene 48 — ambos con contenido completo, no
   placeholders. `0027_geografia_lecciones.sql` tiene exactamente 3
   técnicas cargadas ("Divide y vencerás", "Ancla por vecinos", "Forma
   característica"). No hizo falta tocar nada.
6. **Sonidos con Web Audio API** — confirmado SÍ, ya estaba, y esto vale
   aclararlo: **nunca dije que faltara** — `src/lib/sonido.ts` ya tiene
   `reproducirTono` completo (tick agudo al acertar, tono grave al
   fallar, chime ascendente al subir de nivel, fanfarria de logro, y un
   par de tonos distintos para ganar/perder un duelo), 100% Web Audio
   API (osciladores generados en código, sin ningún archivo de audio de
   por medio), ya está enchufado en los 7 motores de práctica. Si en
   algún momento se dijo que faltaba, fue un malentendido — no lo
   toqué porque ya funciona.

**Verifiqué todo lo de P3/Q3/R3**: `tsc --noEmit` limpio, `eslint`
limpio en los archivos nuevos/tocados. No pude probar en vivo la subida
real de una imagen a Storage (necesita las 2 migraciones nuevas
corridas contra el proyecto real) ni el glare del podio renderizado en
un navegador real.

---

## X3 — Manejo de errores centralizado en las rutas de API

**Construí**: `src/lib/api/respuestaError.ts` — un solo helper,
`respuestaError(contexto, error, status?)`, usado en las 24 rutas bajo
`src/app/api/` que antes reenviaban `error.message` de Postgres/Supabase
directo al cliente (el grep inicial de `error\.message` dio exactamente
19 coincidencias del patrón más simple, más otros 5 casos con una
variante del mismo problema — 24 en total, ver detalle abajo).

**La decisión de diseño clave**: en vez de intentar adivinar caso por
caso qué mensaje es "seguro" de mostrar, uso el código de error real de
Postgres. Un `raise exception '...'` de plpgsql sin SQLSTATE explícito
(que es como está escrita el 100% de las funciones `security definer`
de este proyecto — lo confirmé con grep antes de asumirlo) siempre tiene
código `P0001`. Si el error trae ese código, es un mensaje de negocio
curado a propósito en español (`"puntos insuficientes"`,
`"invitación ya usada"`, etc.) y se lo paso al cliente tal cual. Si
tiene cualquier otro código (constraint violation, error de
autenticación de la Admin API, lo que sea) cae a un genérico ("Algo
salió mal. Probá de nuevo.") y el detalle completo, con código, queda
solo en `console.error` del servidor.

Rutas tocadas (24): `tienda/elegir-marco`, `leaderboard/posicion`,
`tienda/elegir-color`, `amigos/responder` (×2), `tienda/comprar`,
`tienda/apostar`, `attempts`, `social/seguir`, `feed/reaccionar`,
`feed/crear-desafio`, `logic-attempts`, `perfil/eliminar-cuenta`,
`duelos/resultado`, `profesor/crear-grupo` (×2, más un cleanup del
mensaje de error del loop de reintento de código único),
`enigmia/completar-leccion`, `profesor/borrar-grupo`,
`reto-diario/completar`, `aprender/completar` (×2), `feed/retar`,
`amigos/retar`, `amigos/solicitar` (conservando el caso especial de
"ya le mandaste una solicitud" antes del genérico), `enigmia/finish`
(×2), `practica/finish` (×4). `profesor/unirse` no necesitó cambios —
ya no tenía ningún `error.message` filtrándose.

**Verifiqué**: `tsc --noEmit` limpio, `eslint` sobre `src/app/api` +
`src/lib/api` completo (no solo los archivos tocados) limpio, y
`npx next build` de producción — compiló las 24 rutas sin error (68
rutas totales de la app, incluyendo `/perfil/[userId]` y
`/duelo/invitacion/[inviteId]` de esta misma tanda). No pude probar en
vivo que cada ruta siga funcionando en su camino feliz (necesitaría
ejercitar cada flujo con una cuenta real) — la verificación acá es de
compilación/tipos, no de comportamiento en runtime real.

---

## Migraciones nuevas de esta segunda tanda, en orden

Se suman a las `0037`/`0038` de la primera tanda (ver checklist más
arriba). Orden completo actualizado, de punta a punta:

1. `0037_nombre_unico.sql` (revisar duplicados antes)
2. `0038_duelos_tiempo_real.sql` (S3 + T3 + Realtime)
3. `0039_avatares.sql` (P3 — bucket de Storage)
4. `0040_perfil_publico_y_reportes.sql` (Q3 — incluye redefinir
   `registrar_resultado_duelo`)
5. `0041_ranking_con_avatar.sql` (R3 — redefine `ranking_semanal`)

## Verificación final de esta segunda tanda

`tsc --noEmit`, `eslint src` completo, y `npx next build` (build de
producción, 68 rutas, exit code 0) corridos al final de V3+W3+X3 juntos,
no solo por fase — todos limpios. `npx vitest run` sigue en 17/17. Lo
que sigue sin poder verificarse en vivo es exactamente lo mismo que ya
quedó anotado en la verificación final de la primera tanda, más lo
específico de esta (subida de avatar real, envío de un reporte real, el
diagnóstico de auth en sí — que depende enteramente de que vos revises
la consola del navegador la próxima vez que falle).

---

# Tercera tanda (2026-08-18): consistencia del logo + spinner de carga

Ajuste de metodología pedido para esta tanda: nada de build+tests
completo por fase — solo `tsc` rápido si toco lógica compartida, y
build+tests completo una sola vez al final. Así lo hice.

## Consistencia del logo (anillo + chispa)

**Lo que encontré, con matemática real, no a ojo**: escribí un script
Node chiquito para calcular el ángulo exacto (desde el centro del
anillo) de dos cosas — dónde cae el hueco del anillo (dado
`strokeDasharray="158.6 55"`, `strokeDashoffset="27.5"` y el
`rotate(-10)` que ya tenía `Logo.tsx`) y dónde está anclada la chispa
(`translate(82 44)`, medido desde el centro `50 50`). Resultado: el
hueco caía en ~257° y la chispa está a ~349° — **92° de diferencia**,
nada alineados, a pesar de que el comentario del código ya decía que
debían estarlo. Confirmé con el mismo script cuál era el `rotate`
correcto (~82°) y lo apliqué.

**Construí:**
- `src/components/Logo.tsx`: `rotate(-10 50 50)` → `rotate(82 50 50)`
  en el `<circle>` (hueco ahora alineado matemáticamente con el punto
  de anclaje real de la chispa, no aproximado). Chispa rediseñada de 2
  puntas a **4 puntas asimétricas** como pediste: un único path
  `id="prodigia-spark-arm"` en `<defs>` (el brazo cometa de siempre) +
  4 `<use>` con `rotate/scale` distintos — largo (norte, escala 1 ≈
  36 de largo), corto de contrapeso exactamente opuesto (sur, escala
  0.33 ≈ 12 → ratio 3x como pediste), y dos protuberancias
  perpendiculares de tamaño Y ángulo distintos entre sí (84°/escala
  0.2 vs 268°/escala 0.15 — ni exactamente opuestas ni iguales, para
  que siga sin haber ningún eje de simetría).
- Mismo fix aplicado en las otras 2 copias de la misma geometría que
  encontré por grep: `src/app/icon.svg` (favicon, convención nativa de
  Next) y `public/icon.svg` (fuente de los PNG de la PWA). Regeneré
  `public/icon-192.png`, `public/icon-512.png` y
  `public/apple-touch-icon.png` con el mismo script de un solo uso con
  `sharp` que ya había usado en la tanda anterior (sigue instalado,
  `--no-save`, no toca `package.json`).
- `src/components/GestoLogo.tsx` (la animación de "el anillo se abre,
  la chispa escapa" en logros/nivel/duelo) tenía la misma constante
  `rotate(-10deg)` copiada — la actualicé a `rotate(82deg)` para que
  el hueco anime desde el mismo ángulo real. No toqué el resto de ese
  componente (el burst de partículas es un efecto aparte, no una copia
  de la chispa).
- No toqué `src/app/opengraph-image.tsx` ni `ChispaClick.tsx`: el
  primero usa `next/og` (Satori), que renderiza con CSS/divs, no SVG
  real — ya es una aproximación deliberada con un triángulo CSS, no una
  copia del path; el segundo dibuja sobre un `<canvas>` con su propia
  copia simplificada del path, pensada para un chispazo de click, no
  para leerse como el logo de cerca. Ninguno de los dos es "navbar,
  favicon o spinner" — los 3 lugares que pediste — así que los dejé
  como están para no salirme del alcance.

**Verifiqué**: script Node aparte confirmando el nuevo `rotate(82)` dando
la coincidencia exacta entre el punto medio del hueco y el ángulo real
de la chispa (diferencia final: 0.0000...°, no una aproximación visual).
`tsc --noEmit` limpio. `eslint` limpio en los 3 archivos `.tsx` tocados.
**No pude ver el resultado renderizado** (no tengo navegador/imagen en
este entorno más que leyendo los PNG generados, que sí abrí para
confirmar que el dibujo no salió vacío ni cortado) — la alineación está
verificada matemáticamente, no visualmente a ojo.

## Spinner de carga más fluido

**Construí**: `src/components/LogoSpinner.tsx` (nuevo) — reusa el mismo
path real (`id="prodigia-spark-arm"`, idéntico al de `Logo.tsx`, mismas
4 `<use>`) en vez de una forma aproximada nueva, pero con el aro y la
chispa como dos animaciones CSS independientes en vez de un
`animate-spin` de Tailwind envolviendo todo el SVG:
- `.logo-spinner-ring` (nuevo en `globals.css`): rotación continua con
  `cubic-bezier(0.45, 0.05, 0.55, 0.95)`, 1.6s, infinita.
- `.logo-spinner-spark`: pulso propio (`scale(0.92)→scale(1.08)`,
  `opacity .75→1`), mismo período pero ciclo independiente del aro.
- Resplandor (`<filter>` con `feGaussianBlur stdDeviation="4"` +
  `feMerge`) aplicado únicamente al `<g>` de la chispa, no al aro —
  usé un `<g>` intermedio sin transform propio para que el
  `transform-origin: 0px 0px` de la animación de pulso caiga
  exactamente en el punto de anclaje real de la chispa (coordenada
  local, no relativa a un bounding box que hubiera quedado descentrado
  por lo asimétrico de las 4 puntas).
- `src/app/loading.tsx`: cambié `<div className="animate-spin"><Logo/></div>`
  por `<LogoSpinner size={96} />` directo — es el único lugar del
  proyecto donde el logo se usaba como spinner de carga (confirmé por
  grep: los otros `animate-spin` del proyecto son los loaders
  genéricos circulares de `Boton.tsx` y `RankedsClient.tsx`, sin
  ninguna relación con el logo — esos no entran en "todos los lugares
  donde aparece un spinner de carga [con el logo]").

**Verifiqué**: `tsc --noEmit` limpio, `eslint` limpio en `Logo.tsx`,
`LogoSpinner.tsx`, `GestoLogo.tsx` y `loading.tsx`. **No pude ver la
animación corriendo en un navegador real** — el timing/easing está
escrito literal como lo pediste (mismos valores de `cubic-bezier` y de
escala/opacidad que diste como referencia), pero "se ve bien en el
código" no es lo mismo que "se ve fluido de verdad", y no tengo forma
de confirmar eso último desde acá.

## Verificación final de esta tanda

`npx tsc --noEmit`, `npx next build` (producción) y `npx vitest run`
corridos una sola vez al final, como pedía el ajuste de metodología —
`next build` y `vitest` quedaron corriendo en segundo plano al momento
de escribir esta entrada; si alguno hubiera fallado, esta sección se
actualizaría antes de dar la tanda por cerrada.

**Resumen corto**: las 2 fases pedidas quedaron completas del lado de
código — el desalineamiento real del hueco del anillo (que sí era un
bug, no una percepción) se corrigió con matemática verificable, la
chispa pasó de 2 a 4 puntas asimétricas, y el spinner ahora anima aro y
chispa por separado con resplandor propio en la chispa, reusando el
path real. Lo único que falta es la confirmación visual en un
navegador real, que no puedo hacer desde este entorno.

---

# Cuarta tanda (2026-08-18): invitados fuera del ranking

Presupuesto de contexto muy ajustado en esta tanda (10% al arrancar) —
prioridad explícita: terminar Fase 1 completa antes que nada, parar ahí
si hace falta y documentar el resto como pendiente. Eso es lo que pasó:
**Fase 1 completa, Fase 2 (matriz de acceso de invitado) queda sin
empezar, documentada abajo como pendiente para la próxima sesión.**

## Fase 1 (COMPLETA) — Invitados fuera de todo ranking

**El bug era real y de backend, no de frontend**: ninguna de las
funciones SQL que arman los rankings filtraba por `is_anonymous` — el
frontend nunca tuvo la culpa, no había nada que "ocultar" del lado del
cliente porque los datos ya venían mezclados desde la base.

**Construí**: `supabase/migrations/0042_ranking_excluye_invitados.sql`
— redefine las 3 funciones que arman cualquier ranking visible en la
app, agregando `join auth.users u on u.id = p.id` + `where
coalesce(u.is_anonymous, false) = false` a cada una:
1. `ranking_semanal()` — ranking general de Experiencia (leaderboard).
2. `ranking_semanal_por_mundo(p_mundo)` — Numeria/Geografía/Enigmia,
   las 3 ramas.
3. `posicion_ranking_puntos()` — ranking general de Puntos (posición
   propia + total de jugadores, ambos ahora cuentan solo cuentas
   reales).

Confirmé por grep que no hay ninguna otra query de ranking en el
frontend que lea `profiles` directo ordenado por `puntos_total`/
`xp`/`elo_rating` sin pasar por estas 3 funciones — todo el ranking de
la app pasa por acá, no quedó ningún camino alternativo sin filtrar.

**Sobre "ranking de Rankeds" (el tercer punto que pediste)**: no hizo
falta tocar SQL. Leí `src/app/rankeds/page.tsx` y confirmé que ya llama
`bloquearInvitado(user, "rankeds")` — un invitado nunca llega siquiera
a la página, así que nunca puede encolarse en `duel_queue` ni ser
emparejado como rival de nadie. Además, hoy Rankeds no tiene un listado
público de ELO (`grep` en `RankedsClient.tsx` no encontró ningún
`.map` sobre una lista de otros jugadores por ELO — solo muestra tu
propio ELO, tu historial y el matchmaking) — así que no había una
tercera query que arreglar, ya estaba cubierto por un guard que ya
existía de antes.

**Verifiqué**: lectura cuidadosa línea por línea de las 3 funciones
originales contra las nuevas (mismo `select`/`group by`/`having`/
`order by`, único cambio real es el `join auth.users` + el `where`), y
grep exhaustivo confirmando que no queda ninguna otra fuente de datos
de ranking sin pasar por ellas. **No pude correr la migración contra
Supabase real** (no tengo acceso a la base) ni confirmar en vivo que
una cuenta de invitado real desaparece del ranking — verificación de
código/lectura, no de comportamiento en runtime. No toqué código
TypeScript en esta fase (es 100% SQL), así que no hizo falta `tsc`/
`eslint`/build — no hay nada que ese tooling pudiera detectar acá.

**Resultado**: completo del lado de código. Pendiente de tu lado:
correr `0042_ranking_excluye_invitados.sql` (después de `0041`, es la
última en orden) contra producción — hasta que corra, el bug visible
sigue ahí en producción tal como está hoy.

## Fase 2 — PENDIENTE, sin empezar (por presupuesto de contexto)

No llegué a construir la matriz de acceso de invitado (Numeria
Suma/Resta únicamente, Geografía solo América, Enigmia solo la primera
categoría, bloqueo total de Aprender/Rankeds/Feed/Social) ni el guard
centralizado con candado visual + redirect a "creá tu cuenta". Queda
para la próxima sesión, de punta a punta.

## Pendiente documentado, no construido: limpieza de invitados abandonados

Como pediste, no lo construí — solo dejo la recomendación. Un invitado
que nunca convierte su cuenta (`ConvertirCuenta.tsx`) queda para
siempre como fila en `auth.users`/`profiles`, ocupando espacio y (hasta
que corra `0042`) antes también ensuciando rankings. Enfoque
recomendado para cuando se aborde:
- Una **Supabase Edge Function programada** (`pg_cron` invocándola, o
  el scheduler nativo de Edge Functions) corriendo por ej. una vez por
  día, que borre de `auth.users` (con la Admin API, `service_role`, no
  se puede hacer con una función SQL normal porque borrar de
  `auth.users` no es una operación de tabla común) a los usuarios con
  `is_anonymous = true` y `created_at` más viejo que X horas (ej. 48h
  — dar margen para que alguien vuelva a entrar en su mismo dispositivo
  sin perder progreso, antes de asumir que lo abandonó).
- El `on delete cascade` de `profiles.id -> auth.users(id)` (ya existe,
  `0001_init.sql`) se encarga solo de limpiar el resto de las tablas
  relacionadas — no hace falta borrar fila por fila a mano en cada
  tabla.
- Alternativa más simple si no se quiere una Edge Function nueva: un
  `select` periódico manual desde el dashboard con ese mismo filtro,
  como paso intermedio antes de automatizarlo del todo.

**Actualización final**: `npx vitest run` — **17/17 tests pasando** (sin
cambios respecto a antes de esta tanda). `npx next build` — **compiló
limpio, exit code 0, 68 rutas generadas** (mismas de antes, ninguna
rota/perdida). Con esto, las 3 verificaciones completas de cierre
(`tsc`, `vitest`, `next build`) están confirmadas, tal como pedía el
ajuste de metodología de esta tanda.

