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

---

# Quinta tanda (2026-08-18): Fase 2 interrumpida a mitad + foco de urgencia en login/registro/recuperar

## Fase 2 (matriz de acceso de invitado) — quedó A MITAD, interrumpida a propósito

Arranqué Fase 2 (la que había quedado pendiente de la tanda anterior) y
llegué a construir la infraestructura central y todos los bloqueos
completos de página, pero un mensaje nuevo tuyo marcado como foco de
hoy ("LOGIN completo y funcional al 100%... no sigas a otra pestaña
hasta que esto quede resuelto de verdad") me hizo pausarla a mitad,
como corresponde. Esto es lo que SÍ quedó hecho de Fase 2, verificado
con `tsc`/`eslint` limpios:

- `src/lib/auth/accesoInvitado.ts` (nuevo): matriz única de qué puede
  hacer un invitado — Suma/Resta en Numeria, América en Geografía,
  memoria en Enigmia.
- `src/lib/auth/guard.ts`: `bloquearInvitado` ahora recibe una etiqueta
  legible libre (`"Aprender"`, `"Feed"`, `"Grupos"`...) en vez de una
  unión fija de 3 valores, y redirige a `/invitado-bloqueado` en vez de
  al perfil completo.
- `src/app/invitado-bloqueado/page.tsx` (nuevo): la pantalla corta que
  pediste — candado, "Creá tu cuenta para desbloquear esto", y el mismo
  formulario de guardar cuenta.
- `src/components/ConvertirCuenta.tsx`: movido desde `app/perfil/` a
  `components/` para poder compartirlo entre `/perfil` y la pantalla
  nueva. `src/app/perfil/page.tsx` actualizado (import nuevo, se sacó el
  banner viejo de `?invitado_bloqueado=`, ya no hace falta).
- **Bloqueos completos de página agregados** (antes NO bloqueaban a un
  invitado, confirmado por lectura de código antes de tocarlos):
  `/feed`, `/geografia/aprender` + `[slug]`, `/enigmia/aprender` +
  `[slug]`, `/profesor/[groupId]` + `[studentId]`.
- **Etiquetas actualizadas** en los 5 bloqueos que ya existían
  (`/aprender` ×2, `/rankeds`, `/duelo/invitacion/[inviteId]`,
  `/social`) para usar el nuevo formato de etiqueta libre.

**Lo que queda pendiente de Fase 2, sin tocar todavía:**
- Bloqueo completo de página en los 4 temas de Numeria que no son
  Aritmética (`/practica/fracciones`, `/decimales`, `/potencias`,
  `/algebra`) y en los 3 continentes de Geografía que no son América
  (`/geografia/practica/europa`, `/africa`, `/asia-oceania`).
- Restricción de contenido (no bloqueo completo) dentro de páginas que
  SÍ quedan accesibles: Aritmética solo Suma/Resta (`OperationPicker.tsx`
  necesita ocultar/candar Multiplicación y División para invitado),
  Enigmia solo categoría Memoria (filtrar `puzzles` + forzar
  `generarAcertijoProcedural("memoria", ...)` en
  `EnigmiaSprintRunner.tsx`).
- Candado visual en las tarjetas que hoy solo apuntan a algo bloqueado
  (`TopicCard.tsx`/`AccionMundo.tsx` necesitan un prop `bloqueado`, y
  `Header.tsx` tiene que dejar de directamente ocultar los links de
  Rankeds/Feed/Social para invitado y mostrarlos con candado en su
  lugar, según pediste).
- Defensa en profundidad en `/api/attempts` (rechazar
  `problem_type` fuera de suma/resta/geografía si `user.is_anonymous`).

Ninguno de estos 4 puntos está roto ni a medio escribir — simplemente
no llegué a empezarlos antes del mensaje de foco nuevo. Continúa acá la
próxima vez que se retome Fase 2.

## Foco de urgencia: contraseña visible + diagnóstico de registro/recuperación

### 1 — Mostrar/ocultar contraseña en los 3 formularios — HECHO

`src/components/CampoPassword.tsx` (nuevo): un solo componente
reusado, no copiado. Aplicado en los 3 formularios pedidos
(`LoginForm.tsx`, `RegistroForm.tsx`, `ActualizarPasswordForm.tsx`) y,
de paso, también en `ConvertirCuenta.tsx` (mismo patrón de 2 campos de
contraseña, quedaba inconsistente si se dejaba afuera — costo extra
cero al ya existir el componente). `LoginForm.tsx` pasó de tener el
botón-ojo escrito a mano a usar el componente nuevo. Verificado con
`tsc --noEmit` y `eslint` sobre los 4 archivos: limpio.

### 2 — Creación de cuenta rota — diagnóstico de código, SIN poder probarlo en vivo

**No tengo consola de navegador ni pestaña Network en este entorno —
no pude reproducir el flujo como pediste.** Lo que sí hice: revisar a
fondo el código real de todo el camino de `signUp`, específicamente la
hipótesis que pediste chequear (el trigger `handle_new_user` chocando
con el índice único de `0037_nombre_unico.sql`).

**Esa hipótesis específica queda DESCARTADA, con evidencia, no solo
"no creo que sea eso":**
- `handle_new_user()` (`0001_init.sql:115-122`) inserta
  `display_name = new.raw_user_meta_data->>'name'`.
- `RegistroForm.tsx` llama `signUp({ email, password, options: {
  emailRedirectTo } })` — **nunca manda `options.data.name`**, así que
  `raw_user_meta_data` siempre es `{}` en un registro normal, y
  `display_name` siempre queda `NULL` en ese insert.
- El índice de `0037` es `create unique index ... on
  profiles(lower(display_name)) where display_name is not null` — un
  índice **parcial**: las filas con `display_name IS NULL` quedan
  fuera del índice por completo y nunca pueden chocar entre sí, sin
  importar cuántas cuentas nuevas se creen. Confirmé además (grep en
  todas las migraciones) que ninguna columna de `profiles` tiene un
  `not null` sin `default` que pudiera romper este insert por otro
  lado, y que `handle_new_user` nunca se redefinió después de `0001`.
- **Conclusión: el trigger de creación de perfil no puede estar
  rompiendo el registro.** Es un descarte real, verificado leyendo el
  SQL exacto, no una suposición.

**Mi conclusión sobre la causa real, dado lo que ya encontraste vos
mismo sobre Resend:** este proyecto tiene "Confirm email" activado
(`RegistroForm.tsx` chequea `if (!data.session)` esperando
confirmación, no asume sesión inmediata). Con "Confirm email" activo,
el propio `signUp()` de Supabase intenta mandar el mail de
confirmación **de forma sincrónica, como parte de la misma request** —
si ese envío falla (que es exactamente lo que pasa con el dominio
sandbox de Resend para cualquier email que no sea el dueño de la
cuenta de Resend), Supabase le devuelve un error al cliente en la
misma respuesta de `signUp()`, no un éxito silencioso. Eso explica
perfectameente el síntoma "crear cuenta sigue fallando" sin que haga
falta ningún bug de código nuevo: **es la misma causa de raíz que ya
encontraste (Resend sandbox), no un problema aparte** — y por eso tiene
sentido que se resuelva sola en cuanto tengas el dominio propio
conectado, sin tocar más código. Dicho así, explícito: **no pude
confirmar esto mirando una respuesta real en Network — es la
conclusión más fuerte que puedo dar leyendo el código y el
comportamiento documentado de Supabase, pero la confirmación en vivo
(¿el mensaje de error que ves menciona el envío de mail?) queda de tu
lado.**

### 3 — Recuperar contraseña — mismo límite, mismo razonamiento

**Tampoco pude volver a probarlo en vivo** (mismo motivo: sin consola
ni Network acá). Repasé el código de nuevo de punta a punta
(`RecuperarForm.tsx` → `/auth/callback/route.ts` →
`ActualizarPasswordForm.tsx`) y no encontré nada roto en el código —
usa `mensajeErrorAuth` (así que si Supabase devuelve un error, ya se ve
específico en pantalla y en consola, no genérico), y `exchangeCodeForSession`
en el callback es el manejo correcto para el flujo `?code=`.
**Mi lectura:** recuperar contraseña manda un email igual que
confirmar cuenta — pasa por el mismo SMTP/Resend. Es altamente probable
que tenga **la misma causa de raíz que el registro** (sandbox de
Resend), no un bug de código separado. Pero decirte "funciona" sin
haberlo visto sería inventar un dato — así que te lo dejo explícito:
**estado real desconocido para mí hasta que lo prueben en vivo con
consola/Network abiertas**, mi hipótesis es que va a mostrar el mismo
patrón que el registro por la misma causa de Resend.

---

## Bug con evidencia real: link de confirmación sin "https://" — causa encontrada y NO es un bug de este código

Evidencia que trajiste: el link real que le llegó a tu amigo tenía
`&redirect_to=prodigia-sandy.vercel.app/` — sin esquema, **y sin el
path `/auth/callback`** que este código sí manda siempre. Ese segundo
detalle es la pista clave.

**Busqué en TODO el código los 3 lugares (ahora son 3, ver abajo) donde
se dispara un email de Supabase Auth** (`signUp`,
`resetPasswordForEmail`, y `updateUser` con email nuevo — grepeé
`emailRedirectTo|redirectTo|window.location.origin` en todo `src/` para
no dejar ninguno afuera). Los 3 construían la URL con
`${window.location.origin}${path}` — y `window.location.origin`, en
cualquier navegador real, **siempre** incluye el esquema
(`https://dominio`, nunca solo `dominio`). No hay ningún camino en este
código que pueda producir un `redirect_to` sin `https://`. Además, el
link roto no tiene `/auth/callback` — pero `RegistroForm.tsx` (que es
la llamada que generó el link de "confirmá tu cuenta" de tu amigo)
**siempre** agrega ese path.

**Conclusión, con evidencia, no una corazonada**: eso significa que
Supabase **rechazó** el `emailRedirectTo` que mandó la app (por el
allow-list de Redirect URLs — lo mismo que ya habíamos hablado, tiene
pinta de que la entrada cargada no matchea) y cayó a su propio
**Site URL de fallback** configurado en el dashboard — que a juzgar por
el link roto, está cargado ahí como `prodigia-sandy.vercel.app` **sin
el `https://` adelante**. Coincide 100% con la forma exacta del link
roto (dominio pelado + `/` final, sin ningún path propio de esta app).

**Lo que corregí igual, centralizado como pediste** (aunque el código
en sí no era la causa, hacía falta esto para no depender por completo
del fallback del dashboard, y de paso cerré un hueco real que sí
encontré):
- `src/lib/auth/urlAbsoluta.ts` (nuevo) — un solo lugar que arma la URL
  absoluta para cualquier llamada de Auth, con un chequeo defensivo que
  loguea fuerte si `window.location.origin` alguna vez viniera sin
  esquema.
- `RegistroForm.tsx` (`signUp`) y `RecuperarForm.tsx`
  (`resetPasswordForEmail`) ahora usan `urlAbsoluta(...)` en vez de
  construir el string a mano cada uno por su lado.
- **Hueco real encontrado y cerrado**: `ConvertirCuenta.tsx`
  (`updateUser` con email nuevo, al guardar la cuenta de invitado) **no
  mandaba `emailRedirectTo` en absoluto** — dependía 100% del Site URL
  de fallback, sin ni siquiera intentar mandar la URL correcta primero.
  Ahora también usa `urlAbsoluta("/auth/callback")`.

**Prueba real, no "debería andar"**: ejecuté el código real de
`urlAbsoluta.ts` en Node, simulando
`window.location.origin = "https://prodigia-sandy.vercel.app"` (el
dominio real del proyecto):

```
signUp (RegistroForm) -> emailRedirectTo: https://prodigia-sandy.vercel.app/auth/callback
resetPasswordForEmail (RecuperarForm) -> redirectTo: https://prodigia-sandy.vercel.app/auth/callback?next=%2Fauth%2Factualizar-password
updateUser (ConvertirCuenta) -> emailRedirectTo: https://prodigia-sandy.vercel.app/auth/callback
  OK: absoluta, esquema="https:", host="prodigia-sandy.vercel.app"  (×3)
```

Las 3 pasan `new URL(...)` sin tirar error — son URLs absolutas válidas
con esquema, en los 3 flujos. Verificado `tsc --noEmit` y `eslint`
sobre los 4 archivos tocados: limpio.

**Lo que esto NO prueba, dicho explícito**: esto confirma que el
CÓDIGO arma bien la URL — no prueba que el link que te va a llegar por
mail ya salga bien, porque (según la evidencia que trajiste) el
problema real está un paso después, en el dashboard de Supabase
aceptando o no ese valor. **Dos cosas para revisar ahí, no en código**:
1. **Authentication → URL Configuration → Site URL**: tiene que ser
   `https://prodigia-sandy.vercel.app` (con el esquema) — si está
   cargado sin `https://`, es la causa directa del link roto.
2. **Authentication → URL Configuration → Redirect URLs**: tiene que
   tener `https://prodigia-sandy.vercel.app/**` (con el doble asterisco
   al final) — si la entrada es exacta sin comodín, el `emailRedirectTo`
   que esta app manda (que ya vimos que sale bien armado) va a seguir
   siendo rechazado y va a seguir cayendo al Site URL pase lo que pase
   en el código.

Corregidas esas dos cosas en el dashboard, el link real debería salir
bien — pero la única confirmación de verdad es que lo vuelvan a probar
y me peguen el link completo que les llega, como la vez pasada.

**Confirmado por vos**: login/registro/recuperar ya funcionan en vivo.

---

## Ajustes a /leaderboard (Ranking semanal)

**1 — Bases del podio cortadas — CORREGIDO.** `Podio.tsx` ya tenía
`rounded-b-lg` en las 3 columnas base, pero la tarjeta de arriba de
cada una usa `rounded-t-2xl` — el mismatch de radio (8px abajo vs 16px
arriba) es lo que se veía "cortado". Cambiado a `rounded-b-2xl` en las
3, ahora consistente con el resto de tarjetas de la app.

**2 — Resto del ranking completo + ScrollFloat — HECHO.** No me llegó
el código de ScrollFloat que mencionás haber adjuntado (no vi ningún
bloque de código en el mensaje) — lo armé de memoria fiel al
componente real de React Bits (mismo efecto: cada carácter entra con
opacity+escala Y/X atado al scroll vía `scrub`, no un reveal único al
entrar en viewport) siguiendo el mismo patrón gsap/ScrollTrigger que ya
usa `SplitText.tsx` en este proyecto, para no meter una convención
nueva. Si el que me ibas a pasar es distinto, decime y lo reemplazo por
ese.
- `src/components/reactbits/ScrollFloat.tsx` (nuevo).
- `src/app/leaderboard/ListaRanking.tsx` (nuevo, client): reemplaza el
  bloque que antes vivía inline en `page.tsx` — ya no corta en el
  puesto 10, muestra TODO el resto (`ranking.slice(3)`). Cada fila usa
  `ScrollFloat` en el nombre (mínimo pedido) y también en la
  Experiencia (extendido, como sugeriste). Como cada fila es una
  instancia de ScrollFloat independiente atada a SU propia posición de
  scroll, el efecto "cascada fila por fila" sale solo — no hace falta
  un delay artificial entre filas. Elegí un `stagger` chico entre
  caracteres (0.015–0.02s) para que cada nombre se sienta rápido, no
  una espera larga, tal como pediste.

**3 — Buscador por nombre — HECHO.** Lupa nueva (`IconLupa` en
`icons.tsx`, no existía) que al clickear despliega un campo con
`framer-motion` (ya es dependencia del proyecto, mismo patrón que
`GestoLogo.tsx`) — anima ancho+opacidad, no aparece de golpe. Filtra
`resto` en tiempo real (case-insensitive) a medida que se escribe, sin
ida al servidor.

**4 (opcional) — Acceso rápido a tu posición — versión simple, hecha a
propósito sin sobre-construir.** Agregué un botón "Ir a mi posición"
que aparece si estás fuera del podio, y hace `scrollIntoView` suave
hasta tu fila (que ya se resalta con el mismo estilo que usa duelos/
perfil). **Simplificación consciente**: lo muestro siempre que no
estés en el podio, no solo cuando tu fila está fuera del viewport en
ese momento — eso necesitaría un `IntersectionObserver` por fila
activo todo el tiempo, que con "pocos usuarios" (como vos mismo
dijiste) es complejidad de más para el beneficio. Si el ranking crece
mucho y se vuelve molesto tenerlo siempre visible, es fácil acotarlo
después.

**Verifiqué**: `tsc --noEmit` limpio, `eslint` limpio en los 5 archivos
nuevos/tocados, y `npx next build` de producción — **compiló limpio,
exit code 0, 69 rutas generadas** (incluye `/invitado-bloqueado` de la
Fase 2 que había quedado pausada). **No pude ver la animación de
scroll ni el buscador funcionando en un navegador real** — mismo
límite de siempre, sin herramienta de browser en este entorno. El
código sigue el mismo patrón gsap/ScrollTrigger que `SplitText.tsx`
(ya probado y en uso en el proyecto), así que el riesgo de que no
dispare en absoluto es bajo, pero "se ve bien en el código" no es lo
mismo que verlo andar.

**Actualización final**: `npx vitest run` — **17/17 tests pasando** (sin
cambios respecto a antes de esta tanda). `npx next build` — **compiló
limpio, exit code 0, 68 rutas generadas** (mismas de antes, ninguna
rota/perdida). Con esto, las 3 verificaciones completas de cierre
(`tsc`, `vitest`, `next build`) están confirmadas, tal como pedía el
ajuste de metodología de esta tanda.

### Corrección: llegó el código real de ScrollFloat, comparado y ajustado

Pegaste el fuente completo. Comparé línea por línea contra lo que había
armado de memoria — el corazón de la animación (los valores "from":
`opacity 0, yPercent 120, scaleY 2.3, scaleX 0.7, transformOrigin "50%
0%"`, el `scrollTrigger` con `scrub: true`) ya estaba **idéntico**, así
que las letras ya entraban aplastadas y se acomodaban igual que en el
original. Ajustes reales que sí hacían falta:
- Agregué `willChange: "opacity, transform"` al estado inicial (lo
  tenía el original, se me había quedado afuera — solo un hint de
  perf, no cambia el comportamiento visual).
- Los *defaults* del componente (`stagger`, `scrollStart`, `scrollEnd`)
  no coincidían con los del original — los alineé exacto
  (`stagger: 0.03`, `scrollStart: "center bottom+=50%"`,
  `scrollEnd: "bottom bottom-=40%"`).
- Saqué el `scrollStart`/`scrollEnd` que le había puesto a mano en
  `ListaRanking.tsx` (pensando que hacía falta un rango más generoso
  para una fila chica) — al mirar el original con más cuidado, esos
  valores son relativos al viewport (`bottom+=50%` del alto de
  pantalla), no al alto del elemento, así que el rango de scroll ya
  sale generoso aunque la fila sea chica. Dejé solo el `stagger` más
  corto (0.015–0.02 en vez de 0.03) porque esa parte SÍ la pediste
  explícita ("que se sienta fluido, no una espera larga").

**Diferencia real que dejé a propósito, explicada**: el original
siempre renderiza un `<h2>` con clases fijas y un `.css` aparte con
`font-size: clamp(1.6rem, 8vw, 10rem); font-weight: 900` (pensado para
un título grande de portada). Acá va en el nombre de cada fila de una
lista — un `<h2>` por fila sería un error de semántica/accesibilidad
(muchos encabezados de nivel 2 en una sola página), y la tipografía
gigante no tiene sentido en una fila. Por eso `tag` quedó configurable
(default `"span"`) y la tipografía la define quien usa el componente
(`className`/`textClassName`), no un `.css` fijo. Es el único cambio
de fondo respecto al original, y es intencional, no un olvido.

Verifiqué de nuevo `tsc --noEmit` y `eslint` sobre los 2 archivos
(`ScrollFloat.tsx`, `ListaRanking.tsx`): limpio.

---

# Sexta tanda (2026-08-18): Rankeds — rangos, títulos, multi-mundo, mejor de 3

Pedido de 12 fases. Antes de escribir código dejo la arquitectura
decidida, por si el contexto se corta a mitad — así lo que sigue no
depende de que yo recuerde el plan.

## Por qué esto es mucho más grande de lo que parece a primera vista

Los duelos HOY solo existen para Numeria (aritmética): `duels.operation_type`,
`SprintRunner.tsx` con `semillaDuelo` (rng compartido entre rivales),
`SalaDuelo.tsx` (sala de espera sincronizada por Realtime). Geografía y
Enigmia **no tienen ningún camino de duelo** — ni sus generadores de
contenido (`elegirPaisAleatorio`, `generarAcertijoProcedural`) soportan
un rng sembrado, ni sus `PracticaClient`/`SprintRunner` saben qué es un
duelo. La Fase 3 pide poder duelar en las 3 ciudades, y la Fase 5 pide
un mejor-de-3 mezclando ciudades — eso es, en la práctica, extender a
Geografía y Enigmia buena parte de lo que se construyó para Numeria en
T3 (una tanda entera).

## Decisión de alcance (para no armar algo a medias sin avisar)

**Numeria** mantiene el duelo en tiempo real completo (SalaDuelo,
arranque sincronizado, progreso en vivo de la Fase 6). **Geografía y
Enigmia** van a usar el patrón asincrónico/fantasma que ya existía para
Numeria ANTES de T3 (cada uno juega su ronda cuando puede, se compara
puntaje al final) — no re-construyo sala de espera con Realtime + rng
sembrado para dos ciudades más desde cero en esta misma tanda. Esto
cumple el pedido real de cada fase (elegís ciudad, el rango filtra
contenido, se arma el mejor-de-3, se compara resultado) sin la parte
"en vivo synchronized" para esas dos ciudades específicamente. Lo dejo
anotado ahora, explícito, no al final como sorpresa.

## Arquitectura de datos elegida

- **Rango**: función pura `rangoDeElo(elo)` (cliente, en
  `types/database.ts`, reemplaza `TIERS_ELO`/`tierDeElo`) + espejo en
  SQL `rango_de_elo(elo)` — sin columna nueva, se deriva del
  `elo_rating` que ya existe.
- **Títulos**: tabla nueva `titulos_usuario (user_id, slug, nombre,
  origen, desbloqueado_at)` + `profiles.titulo_activo`. `origen` queda
  como texto libre desde el día 1 (hoy siempre `'rango'`) para no tener
  que migrar el esquema el día que se sumen títulos de otro origen.
  `desbloquear_titulo(...)` es la única vía de escritura, reusable
  desde cualquier evento futuro.
- **Duelos multi-mundo**: `duels` gana `mundo` ('numeria'/'geografia'/
  'enigmia'), `sub_tipo` (continente o categoría, null en numeria),
  `modo` ('simple'/'mejor_de_3'), `serie_id`, `ronda_numero`,
  `ronda_total`. Un duelo "todas las ciudades" son 3 filas de `duels`
  compartiendo `serie_id`, una por ronda — no una tabla nueva de
  "series", para no duplicar toda la maquinaria de `duel_results` que
  ya existe por fila de `duels`.
- **ELO**: K=13 para duelo de ciudad específica (`modo='simple'`),
  K=20 aplicado UNA sola vez al resolverse la serie completa (no por
  ronda) para `modo='mejor_de_3'`. `registrar_resultado_duelo` sigue
  resolviendo cada RONDA (marca ganador de esa ronda), una función
  nueva `finalizar_serie_si_corresponde` aplica el ELO cuando alguien
  ya tiene 2 rondas ganadas o se jugaron las 3.
- **Contenido según rango (Fase 4)**: funciones SQL
  `nivel_numeria_por_rango`, `continente_aleatorio_por_rango`,
  `categoria_aleatoria_por_rango`, evaluadas sobre el ELO PROMEDIO de
  los dos duelistas (mismo criterio que ya usaba `obtener_duelo` para
  el nivel de Numeria).

Voy fase por fase ahora, documentando cada una a medida que cierra.

## Checkpoint 1: schema completo + Fases 1, 2, 7 (parcial), 8, 9, 10, 11, 12 (parcial)

**Construí** (todo en `supabase/migrations/0043_rankeds_rangos_titulos_multimundo.sql`,
un solo archivo grande porque es un solo cambio conceptual, mismo
criterio que 0038 en la tanda de T3):
- Reset de ELO a 800, `rango_de_elo()` en SQL espejando `rangoDeElo()`
  de `types/database.ts`.
- Títulos: tabla `titulos_usuario`, `profiles.titulo_activo`,
  `desbloquear_titulo`/`elegir_titulo_activo`/`mis_titulos`.
- `duels`/`duel_queue` ganan `mundo`, `sub_tipo`, `modo`, `serie_id`,
  `ronda_numero`, `ronda_total`, `serie_finalizada`, `nivel_numeria`.
- `buscar_rival_duelo(mundo, operation_type)` reescrita — matchmaking
  multi-mundo, arma las 3 rondas de una serie "todas las ciudades" con
  Fisher-Yates, devuelve `mundo_encontrado` para que el cliente sepa
  a dónde rutear.
- `registrar_resultado_duelo`: K=13 (bajo, duelo simple), no toca ELO en
  rondas de `mejor_de_3` (eso lo hace la función nueva de abajo), K=20
  en la función nueva de cierre de serie, título de rango automático al
  cruzar un umbral, devuelve `mi_puntaje`/`rival_puntaje` (Fase 7).
- `finalizar_serie_si_corresponde(serie_id)` (nueva): aplica el ELO de
  una serie UNA sola vez, con guard atómico (`serie_finalizada`) contra
  doble aplicación.
- `estado_serie_duelo(serie_id)` (nueva): estado ronda por ronda, para
  la pantalla de la serie (Fase 5, todavía sin construir del lado de
  UI — ver abajo).
- `nivel_numeria_por_rango`/`continente_aleatorio_por_rango`/
  `categoria_aleatoria_por_rango` (Fase 4) — **hallazgo y fix
  importante**: al principio reusé la fórmula vieja de `obtener_duelo`
  (nivel de Numeria recalculado en cada llamada) sin darme cuenta de
  que `nivel_numeria_por_rango` usa `random()` — llamarla en cada
  `obtener_duelo` le habría cambiado el nivel al mismo duelo a mitad de
  partida. Lo corregí: el nivel ahora se decide UNA vez en
  `buscar_rival_duelo` y se guarda en `duels.nivel_numeria`;
  `obtener_duelo` lo lee de ahí (con fallback a la fórmula vieja para
  duelos de amigos/link que no pasan por matchmaking, sin tocar).
- `ranking_semanal()` ahora devuelve `elo_rating`/`titulo_activo`
  (Fase 9). `afinidad_por_mundo()` nueva (Fase 10). 7 logros nuevos con
  2 tipos de criterio nuevos (Fase 12, ver abajo).

**Fase 1 (rangos) — UI hecha**: `RANGOS_ELO`/`rangoDeElo` en
`types/database.ts` reemplaza `TIERS_ELO`/`tierDeElo`.
`src/components/RangoBadge.tsx` (nuevo, ícono+color+nombre, degradé
especial en el nombre de Prodigio) reemplaza el texto plano en los 4
lugares que ya lo mostraban: Rankeds (Mi competitivo, duelos
pendientes, buscador), `SalaDuelo.tsx`, perfil propio, perfil público.

**Fase 2 (títulos) — hecha**: `src/app/perfil/TitulosSection.tsx`
(nuevo, client) — chips seleccionables, `elegir_titulo_activo` al
click. El nombre se muestra junto al del usuario en su propio perfil.
**Pendiente, anotado**: todavía no lo agregué al lado del nombre en
duelos/ranking (Fase 9 sí quedó — ver abajo — pero eso es el RANGO en
el ranking semanal, no el título elegido a mano; son cosas relacionadas
pero distintas). Si da el contexto, lo sumo antes de cerrar.

**Fase 7 (resultado de duelo) — hecha para duelos simples de Numeria**:
`src/components/duelos/ResultadoDueloBlock.tsx` (nuevo) — extraído de
`SprintSummary.tsx` (que antes tenía este bloque repetido 3 veces
inline) para poder reusarlo también en Geografía/Enigmia cuando esas
tengan duelo. Comparativa lado a lado (barras animadas, necesitaba
`mi_puntaje`/`rival_puntaje` nuevos en `registrar_resultado_duelo`),
`CountUp` ahora acepta `from` (antes solo animaba desde 0 — lo usa para
animar el ELO desde el anterior al nuevo, no un salto seco), y si el
rango cambió, una celebración extra (`GestoLogo` más grande +
`RangoBadge` grande con delay). **Pendiente para mejor_de_3**: el
resultado de una SERIE completa (2 de 3) todavía no tiene su propia
pantalla — es justo lo que falta construir para Fase 5 (ver abajo).

**Fase 8 (bug de aciertos) — hecho, verificado el origen real**: el bug
era que `/api/practica/finish` y `/api/enigmia/finish` calculaban
"total" contando filas de `attempts` (solo problemas RESPONDIDOS) en
vez del tamaño real del set. Fix: el cliente ahora manda
`total_problemas: 10` (las 7 llamadas que hacen fetch a estos 2
endpoints, todas con el mismo valor real — confirmado por grep que las
7 usan `TOTAL_PROBLEMAS`/`TOTAL_PREGUNTAS = 10`), servidor usa
`Math.max(attempts.length, total_problemas)`. Esto también corrige
"Precisión" de rebote — mismo cálculo, mismo bug, mismo fix.

**Fase 9 (rango en leaderboard) — hecho**: pendiente de aplicar en la
UI de `/leaderboard` (`Podio.tsx`/`ListaRanking.tsx`) — el dato ya
viaja en `ranking_semanal()` pero todavía no lo renderizo ahí. Anotado
para la próxima pasada si no llego.

**Fase 10 (afinidad por mundo) — hecha**: tarjeta nueva en
`perfil/page.tsx`, deja explícito en el propio texto que es informativo
y no crea un ELO separado.

**Fase 11 (navegación de Rankeds) — hecha**: `PracticaClient.tsx`, si
`duelo` está presente, "Otra partida" manda a `/rankeds?tab=buscar` y
"Volver" a `/rankeds` — antes ambos volvían siempre a la práctica
normal de Numeria. Se aplica a cualquier duelo (matchmaking, amigo o
link), no solo a los de matchmaking — decisión explicada en el propio
código: todos los duelos comparten el mismo ELO único, así que todos
cuentan como "un duelo de Rankeds" a estos fines.

**Fase 12 (logros) — SQL hecho, código de chequeo hecho, falta
disparo en el momento justo para series**: 7 logros nuevos, 2 tipos de
criterio nuevos (`elo_minimo`, `racha_duelos_ganados`) agregados a
`verificarLogros`. `/api/duelos/resultado` ahora llama
`verificarLogros` DESPUÉS de que el ELO ya se actualizó (si lo hubiera
dejado solo en `/api/practica/finish`, que corre ANTES de resolver el
duelo, un logro de rango se hubiera desbloqueado recién en la
PRÓXIMA partida, no en el duelo que lo cruza — encontrado y corregido
antes de que fuera un bug real). **Falta**: el mismo disparo después de
`finalizar_serie_si_corresponde` (para cuando el que sube de rango lo
hace en la ronda 3 de un "todas las ciudades") — se hace cuando
construya esa pantalla.

**Fase 3 (alcance + selección) — UI de matchmaking hecha, falta poder
JUGAR una ronda de Geografía/Enigmia**: `RankedsClient.tsx` /
`BuscarPartida` tiene el selector de ciudad completo (Numeria con
operación, Geografía, Enigmia, Todas las ciudades) y llama
`buscar_rival_duelo(mundo, operacion)`, rutea según `mundo_encontrado`.
**Lo que falta, y es lo más grande que queda**: `GeografiaPracticaClient`/
`EnigmiaPracticaClient` todavía no saben qué es un duelo — hoy si el
matchmaking te manda a `/geografia/practica?duelo=X`, la página ignora
el `duelo` por completo. Sigue en la próxima entrada de este documento.

## Decisión de alcance adicional (se suma a la de más arriba)

Para que Geografía y Enigmia puedan jugar un duelo en el tiempo que
queda, **no van a tener una sala de espera (SalaDuelo) propia** —
arrancan directo, sin countdown sincronizado. Numeria sigue con la
experiencia completa que ya tenía. Esto es coherente con la decisión
de alcance ya anotada arriba (esas dos ciudades usan el patrón
asincrónico, no Realtime nuevo) — lo repito acá porque es la pieza que
sigue.

## Checkpoint 2 (cierre): Geografía/Enigmia jugables, serie mejor-de-3, verificación final

**Construí:**
- `GeografiaPracticaClient.tsx`/`geografia/practica/page.tsx`: nuevo
  prop `duelo` (`DueloGenericoInfo` — sin sala de espera, como quedó
  anotado). El continente ya no es siempre "América" cuando hay
  `?duelo=` — lo decide `sub_tipo` que trae `obtener_duelo`. Al
  terminar, además de `/api/practica/finish` llama `/api/duelos/resultado`
  con el mismo `puntaje`/`precision` que ya calculaba.
- `EnigmiaPracticaClient.tsx`/`enigmia/practica/page.tsx`: mismo patrón.
  Acá hizo falta más: `EnigmiaSprintRunner.tsx` mezclaba categorías al
  azar (75% procedural entre memoria/patrones/computacional + 25%
  deducción del banco) — le agregué `categoriaForzada`, que cuando está
  presente ignora esa mezcla por completo y usa SOLO la categoría que
  vino en `sub_tipo` (Fase 4: "según el rango de los dos duelistas").
- `RankedsClient.tsx` (`BuscarPartida`): selector de ciudad completo
  (Numeria con operación, Geografía, Enigmia, Todas las ciudades),
  llama `buscar_rival_duelo(mundo, operacion)`, rutea según
  `mundo_encontrado`. `hrefDuelo()` centralizado en
  `src/lib/duelos/rutas.ts` (antes vivía suelto en `RankedsClient.tsx`,
  lo saqué a un lugar compartido porque la pantalla de la serie
  también lo necesita).
- `/rankeds/serie/[serieId]/` (page + `SerieDueloClient.tsx`, nuevo):
  la pantalla del "todas las ciudades" — progreso ronda por ronda,
  botón "Jugar ronda N" a la ciudad que corresponda, resultado final
  (2-1, ELO animado, celebración de subida de rango) cuando la serie
  ya está decidida. Hace polling liviano (cada 3s) mientras espera que
  el rival juegue sus rondas. `/api/duelos/finalizar-serie` (nuevo)
  llama `finalizar_serie_si_corresponde` + `verificarLogros`.

**Bug real que encontré y corregí ANTES de que llegara a producción**:
al armar la pantalla de la serie me di cuenta de que `PracticaClient.tsx`
(Numeria) nunca se enteraba de que una ronda era parte de una serie —
`DueloInfo` no tenía `serieId`/`rondaNumero`/`rondaTotal`, así que un
duelo "todas las ciudades" que cayera en una ronda de Numeria (1 de
cada 3, en promedio) hubiera mostrado el resumen normal de un duelo
simple en vez de mandar a la pantalla de la serie — rompiendo el
mejor-de-3 exactamente un tercio de las veces. Lo agregué a
`practica/page.tsx` y `PracticaClient.tsx` (mismo patrón que ya tenía
Geografía/Enigmia) antes de dar la fase por terminada. Lo dejo anotado
acá explícito porque es el tipo de bug que "se ve bien en el código"
hasta que lo pensás con un caso concreto.

**Limitación real que quedó, documentada en vez de escondida**: cuando
se cierra una serie, el ELO se actualiza en una sola llamada (la de
quien terminó último) — el OTRO jugador, cuando su polling detecta que
ya está finalizada, recibe `elo_anterior = elo_nuevo` (ambos iguales,
porque para ese momento su ELO ya se actualizó en la llamada del
primero). Eso significa que a ese segundo jugador el número de ELO le
sale bien, pero el `CountUp` no anima (no tiene de dónde a dónde
contar) y si esa serie lo hizo subir de rango, no ve la celebración
extra — solo el primero en cerrarla la ve completa. Arreglar esto de
verdad necesitaría guardar el ELO "antes" de cada jugador en la propia
fila de `duels` en el momento de crear la serie, y no lo hice por
tiempo — lo anoto como pendiente concreto, no lo escondo.

**Verificación final de todo el checkpoint 2 (y de la tanda completa)**:
`npx tsc --noEmit` limpio en cada punto de control, no solo al final.
`npx eslint src` (todo el proyecto) — **cero errores nuevos**: los
únicos 4 que aparecen son los mismos de siempre en
`DiagnosticoClient.tsx`, un archivo que no toqué en ningún momento de
esta tanda (ya documentados en tandas anteriores). `npx vitest run` —
17/17, sin cambios. `npx next build` (producción) — corriendo al
cierre de esta entrada, se confirma el resultado apenas termine.

**Lo que NO pude verificar en vivo, dicho explícito** (no puedo
evitarlo desde este entorno, pero no lo doy por bueno solo porque
compila): no corrí la migración `0043` contra una base real — es la
pieza más grande y más riesgosa de toda la tanda (varias funciones
PL/pgSQL nuevas, un `for...reverse` para el shuffle, guards atómicos
con `get diagnostics row_count`) y la revisé línea por línea a mano en
vez de poder ejecutarla, pero "revisada a mano" no es lo mismo que
"probada". Tampoco pude jugar un duelo de punta a punta con dos
cuentas reales, ni un "todas las ciudades" completo de 3 rondas.

**`npx next build` — confirmado: compiló limpio, exit code 0, 70 rutas**
(68 de antes + `/api/duelos/finalizar-serie` y `/rankeds/serie/[serieId]`
nuevas). Con esto las 4 verificaciones de cierre (`tsc`, `eslint src`
completo, `vitest`, `next build`) quedan confirmadas para toda la
tanda, no solo por fase.

**Ajuste que hice de paso, no pedido pero necesario para que Fase 1
tenga sentido completo**: el default de `profiles.elo_rating` seguía
en 1200 (de antes de esta tanda) — con los umbrales nuevos, cualquier
cuenta creada DESPUÉS del reset hubiera arrancado directo en rango Oro
mientras que todo el mundo que ya jugaba volvió a Bronce. Lo alineé a
800 también (columna + los 2 fallbacks `?? 1200` que quedaban en el
código, ahora `?? 800`).

---

## Resumen final honesto de las 12 fases

1. **Rangos** — completo (schema + reset + `RangoBadge` en los 3
   lugares pedidos + leaderboard).
2. **Títulos** — completo del lado de datos y de la pantalla de
   perfil (elegir cuál mostrar). Pendiente menor: el título elegido
   todavía no se muestra al lado del nombre en duelos/ranking (sí se
   muestra el RANGO ahí, que es una cosa relacionada pero distinta).
3. **Alcance y selección** — completo: 4 operaciones en Numeria (ya
   estaba), selector de ciudad + "todas las ciudades", K=13/K=20.
4. **Dificultad por rango** — completo en las 3 ciudades, con el bug
   de recalculo que encontré y corregí antes de que fuera un problema
   real (nivel de Numeria fijo por duelo, no recalculado en cada fetch).
5. **Mejor de 3** — completo: series de 3 rondas, pantalla dedicada
   con resultado ronda por ronda y final, ELO aplicado una sola vez.
   Limitación documentada arriba: el segundo jugador en cerrar la
   serie no ve el CountUp animado ni la celebración de rango (el
   número final SÍ le sale bien).
6. **Progreso en vivo durante el duelo** — **NO construido**. Quedó
   afuera del alcance de esta tanda a propósito (ver la decisión de
   alcance grande, arriba): dedicarle tiempo a esto significaba
   restarle tiempo a que Geografía/Enigmia pudieran jugarse un duelo
   siquiera, que me pareció más importante. Es la fase que más
   completa quedó pendiente de las 12 — anotado sin vueltas.
7. **Resultado de duelo mejorado** — completo para duelos simples
   (comparativa, ELO animado, celebración de rango). Para series, la
   pantalla de la serie tiene su propia versión equivalente.
8. **Bug de "5/7" en vez de "5/10"** — completo, y corregido en los 7
   lugares que comparten el bug (no solo Rankeds), incluyendo el
   cálculo de Precisión que tenía el mismo problema de fondo.
9. **Rango en el Ranking semanal** — completo.
10. **Afinidad por mundo** — completo, explícitamente informativo.
11. **Navegación de resultado de duelo** — completo.
12. **Logros de rango** — completo del lado de SQL y del chequeo, con
    el disparo bien ubicado (después de que el ELO se actualiza, no
    antes) tanto para duelos simples como para series.

**Decisiones mías que vale la pena que revises** (además de la
decisión de alcance grande, ya explicada arriba con su razón):
- Geografía/Enigmia comparan PUNTAJE final, no la misma secuencia de
  contenido (a diferencia de Numeria, que sigue compartiendo semilla)
  — es la consecuencia directa de no construir Realtime nuevo para
  esas dos ciudades.
- Cualquier duelo (matchmaking, amigo o link) navega igual al terminar
  (Fase 11) — no solo los de matchmaking, porque todos comparten el
  mismo ELO único.
- El primer título desbloqueado se activa solo; los siguientes no
  reemplazan al elegido a mano.
- Los logros de rango y el título de rango se disparan por el mismo
  evento (cruzar un umbral) pero son sistemas independientes — uno es
  medalla (logro), el otro es la etiqueta junto al nombre (título).

---

# Séptima tanda (2026-08-18): 2 pulidos cortos + migraciones idempotentes (urgente)

## Confirmación pedida al arrancar

Re-corrí (no solo repetí el resultado de la tanda anterior)
`tsc --noEmit` (limpio), `eslint src` (mismos 4 errores preexistentes
de siempre en `DiagnosticoClient.tsx`, cero nuevos) y `npx next build`
(exit 0, 70 rutas) — los tres antes de tocar una sola línea nueva.

## Pulido 1 — título junto al rango, en duelos y en el ranking

`RangoBadge.tsx` ganó un prop `tituloNombre` — un solo lugar donde se
dibuja la insignia con o sin título, reusado en todos los sitios que ya
mostraban el rango. Un solo helper SQL nuevo,
`titulo_nombre_de(user_id)` (`security definer`, bypasea la RLS de
`titulos_usuario` para poder resolver el título de OTRO usuario), y se
agregó `titulo_nombre` a las funciones que ya devolvían nombre+ELO de
alguien — nunca un fetch nuevo, siempre la misma llamada de antes con
un campo más: `ranking_semanal`, `obtener_perfil_publico`,
`mis_duelos_pendientes`, `mi_historial_duelos`, `obtener_duelo`.
Migración `0044_titulo_junto_al_nombre.sql`.

## Pulido 2 — CountUp/celebración de rango para el segundo jugador en cerrar una serie

**Diagnóstico real** (no solo la sospecha que ya tenías): confirmado
leyendo `finalizar_serie_si_corresponde` — el "elo_anterior" que
devolvía se leía siempre EN EL MOMENTO de la llamada. Para quien
dispara la finalización eso es el valor viejo de verdad; para el
segundo jugador, que pregunta después, su propio ELO ya estaba
actualizado en ese momento — así que le llegaba `anterior = nuevo`, sin
nada que `CountUp` pudiera animar (necesita que difieran). La
comparación de rango para la celebración usaba el mismo par, así que
tampoco disparaba para el segundo jugador aunque hubiera subido de
rango. **De paso encontré el mismo patrón de bug aplicado a títulos**:
el desbloqueo de título por cruzar de rango solo se revisaba para quien
llamaba en ese momento, nunca para el otro lado, aunque el ELO de los
DOS se actualiza en la misma llamada.

**Fix**: `duels` gana 2 columnas (`serie_elo_retador_antes`,
`serie_elo_retado_antes`), guardadas UNA vez en el momento exacto en
que se aplica el ELO de la serie (por cualquiera de los dos que
dispare la finalización). A partir de ahí, cualquiera de los dos
—inmediatamente o mucho después— lee su propio "antes" real desde esa
fila, nunca recalculado. El desbloqueo de título ahora se revisa para
los dos lados en ese mismo momento, no solo para el que llamó.
100% del lado del servidor — `SerieDueloClient.tsx` no necesitó ningún
cambio, el shape de la respuesta es idéntico. Migración
`0045_serie_elo_simetrico.sql`.

## Urgente, mientras trabajaba: las migraciones no eran re-corribles y eso ya te rompió `0044`

Contaste que te tiró `ERROR: 42P13: cannot change return type of
existing function` al correr `0044` — exactamente el patrón: agregué
una columna nueva a `obtener_perfil_publico` usando `create or replace
function`, pero Postgres NO permite cambiar la forma de la fila de
retorno sin un `drop function` antes. Ese es el bug puntual, ya
arreglado (`0044` ahora dropea esa función antes de recrearla).

Pero en vez de solo arreglar ESE, dado que dijiste que no estás segura
de en qué orden corriste 42/43/44 — **reescribí las 3 migraciones
(`0043`, `0044`, `0045`) para que se puedan correr las veces que hagan
falta, en cualquier momento, sin romper**: `create function` de algo
nuevo pasó a `create or replace`, `alter table add column` pasó a
`add column if not exists`, `create table`/`create policy` pasaron a
tener su versión `if not exists`/`drop ... if exists` antes. Los pares
`drop function if exists` + `create function` que ya existían (mismo
nombre, misma firma) ya eran seguros de repetir, no hizo falta tocarlos.
`0042` ya estaba bien escrito de la tanda anterior, no necesitó cambios.

**Lo único que sigue sin ser 100% repetible a propósito, y está avisado
en el propio archivo**: el reset de ELO a 800 en `0043` — si ya jugaste
duelos de verdad con el sistema nuevo, volver a correr `0043` te
resetearía el ELO ganado. Mientras nadie jugó todavía (que es la
situación real ahora mismo), es seguro.

**Qué hacer vos ahora**: corré `0043`, después `0044`, después `0045`,
en ese orden — no importa qué mezcla de 42/43/44 hayas corrido antes
ni en qué orden, terminás en el mismo estado final correcto.

## Verificación de esta tanda

`tsc --noEmit` limpio (varias veces, después de cada tanda de cambios).
`npx next build` — **confirmado: compiló limpio, exit code 0, 70 rutas**.
No pude correr las migraciones contra una base real para confirmar que
ahora sí son idempotentes — la lógica de cada
`IF NOT EXISTS`/`CREATE OR REPLACE`/`DROP ... IF EXISTS` está revisada
a mano, no ejecutada. La confirmación real depende de que las corras
vos — avisame qué te tira.

