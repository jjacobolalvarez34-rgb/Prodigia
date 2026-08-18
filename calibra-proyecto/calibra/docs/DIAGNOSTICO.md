# Diagnóstico — tanda de bugs (2026-08-17)

Investigación completa de los 5 bugs reportados, hecha ANTES de tocar código,
según lo pedido. Incluye causa raíz, archivos involucrados, y qué bugs
comparten origen. Al final, notas de arquitectura levantadas de paso que
van a servir para las features nuevas (O3–T3).

## Resumen ejecutivo: dos familias de causa raíz

**Familia A — configuración de Supabase Auth nunca adaptada a producción**
(bugs 2 y 3, y el problema de "me redirige a localhost" que ya se diagnosticó
antes en esta conversación). Nada de esto se arregla con código: son ajustes
en el dashboard de Supabase que **yo no puedo tocar** porque no tengo acceso
a él. Están marcados explícitamente abajo.

**Familia B — huecos de manejo de errores/estado, código real, sí se arregla
acá** (bugs 1, 4, 5).

No hay una única causa raíz para los 5 — son dos familias distintas — pero
vale la pena verlas juntas porque los síntomas de la Familia A ("da error",
"falla intermitentemente") se parecen mucho entre sí y conviene no
confundirlos con bugs de código.

---

## Bug 1 — Login de invitado no funciona

**Causa raíz — dos partes separadas:**

**1a. El botón "Entrar como invitado" probablemente falla porque el
proveedor "Anonymous Sign-ins" de Supabase Auth está desactivado.** Es una
opción que viene apagada por defecto en todo proyecto nuevo de Supabase
(Authentication → Sign In / Providers → Anonymous). El código cliente
(`login/LoginForm.tsx:20-32`) llama a `supabase.auth.signInAnonymously()`
correctamente — si el proveedor está apagado, esa llamada devuelve un
`authError` y el usuario ve "No pudimos crear una sesión de invitado."
**No puedo confirmar esto sin acceso al dashboard — hay que verificarlo ahí.**

**1b. La restricción de acceso para invitados NUNCA SE IMPLEMENTÓ.** Grep
completo de `is_anonymous` en `src/` da solo 3 resultados:
`login/LoginForm.tsx` (donde se crea la sesión), `perfil/page.tsx:107`
(para mostrar el cartel "Guardá tu cuenta") y un comentario en
`ConvertirCuenta.tsx`. `src/lib/auth/guard.ts` — que es el único lugar que
debería decidir qué puede ver cada usuario — no chequea `is_anonymous` en
ningún lado. Es decir: si 1a se arregla tal cual está el código hoy, un
invitado tendría acceso completo a Aprender, Rankeds y Amigos, que es
exactamente lo que no debería pasar.

**Archivos involucrados:** `src/app/login/LoginForm.tsx`,
`src/lib/auth/guard.ts`, y cualquier página bajo `/aprender`, `/rankeds`,
`/social`, `/amigos` (todas usan `requireUsuario`/`requireMundoNumeria` de
`guard.ts`, así que el fix se puede centralizar ahí).

**Decisión de diseño (pedían mi criterio):** uso la sesión anónima real que
ya eligió el código existente (`signInAnonymously`, con su propio `user_id`
persistente) en vez de agregar un modo "sin guardar nada" en paralelo — ya
hay UI construida alrededor de esa elección (`ConvertirCuenta.tsx` para
"guardar la cuenta" después). Así el invitado sí conserva su progreso de
práctica si vuelve en el mismo navegador, pero no accede a las secciones
sociales/curriculares, tal como se pidió.

---

## Bug 2 — Creación de cuenta falla intermitentemente

**Causa raíz probable: límite de envío de emails del proyecto de Supabase.**
Un proyecto de Supabase sin proveedor SMTP propio configurado usa el
servicio de email incluido, que tiene un tope muy bajo —
**históricamente ~2 a 4 emails por hora, para TODO el proyecto, no por
usuario.** Con gente probando la app y creando cuentas seguidas (que es
justo el escenario "gente probándolo" que describiste), las primeras
cuentas confirman bien y las siguientes, dentro de la misma hora, fallan.
Eso coincide exactamente con "falla intermitentemente" en vez de "siempre"
o "nunca".

Revisé el código de `registro/RegistroForm.tsx:28-42`: el `signUp()` está
bien implementado, pero el manejo de error es demasiado genérico — solo
distingue "email ya registrado" de todo lo demás, así que un error de
rate-limit de Supabase (mensaje típico: `"email rate limit exceeded"`) cae
en el mensaje genérico "No pudimos crear la cuenta. Probá de nuevo.", que
no le da ninguna pista real al usuario ni queda registrado en ningún lado
para que vos lo veas después.

Descarté como causa: constraints de esquema. Revisé las 6 columnas
agregadas a `profiles` después de `0001_init.sql` (`xp_total`,
`meta_xp_diaria`, `es_profesor`, `onboarding_enigmia_completado`,
`interes_inicial`, `elo_rating`) — todas tienen `default`, así que el
trigger `handle_new_user` (que solo inserta `id` y `display_name`) nunca
debería fallar por eso, ni para el primer usuario ni para el último.

**No puedo confirmar el rate limit sin acceso al dashboard/logs de
Supabase — hay que verificarlo en Authentication → Rate Limits, y la
solución real (no es cosa de código) es configurar un proveedor SMTP propio
(Resend, Postmark, SendGrid, etc.) en Authentication → Settings → SMTP
Settings.** Lo único que sí es código: mejorar el manejo de error para que
si vuelve a pasar, el usuario vea un mensaje específico en vez de uno
genérico, y quede un log server-side.

**Comparte causa raíz con Bug 3** (ver abajo) y con el problema de
"redirige a localhost" ya resuelto antes en esta conversación: los tres son
síntomas de que la configuración de Auth del proyecto de Supabase nunca se
terminó de adaptar para producción.

**Archivos involucrados:** `src/app/registro/RegistroForm.tsx` (mejora de
mensaje de error).

---

## Bug 3 — Cambiar contraseña da error "no sirve por el momento"

**No existe una pantalla de "cambiar contraseña estando logueado".** Grep de
"contraseña"/"password" en `src/app/ajustes/` no encontró nada — `ajustes`
solo tiene meta de XP, sonido, efectos y tema
(`src/app/ajustes/AjustesClient.tsx`). La única vía para cambiar contraseña
hoy es el flujo de **recuperación**: `/recuperar` → email con link → 
`/auth/callback` → `/auth/actualizar-password`.

**Causa raíz — mismo origen que el problema de localhost ya resuelto antes
en esta conversación.** `RecuperarForm.tsx:20` arma el link con
`${window.location.origin}/auth/callback?next=...`, exactamente igual que
`RegistroForm.tsx`. Si la whitelist de "Redirect URLs" de Supabase Auth
todavía solo tiene `localhost` (que es lo que se diagnosticó antes en esta
misma conversación para el registro), el link de recuperación de contraseña
**también** cae en localhost en producción — el usuario hace clic, el link
no carga nada (o carga el dev server de otra persona), y la experiencia es
"no sirve por el momento". Es el mismo fix de dashboard que ya se te explicó
para el registro (Site URL + Redirect URLs en Supabase), no hace falta
repetirlo dos veces — con arreglarlo una vez en el dashboard alcanza para
ambos flujos porque comparten la misma ruta `/auth/callback`.

Aparte de eso, encontré un riesgo real de código en
`src/app/auth/callback/route.ts:13-21`: si `exchangeCodeForSession` falla
(por ejemplo porque el link de recuperación fue "pre-visitado" por un
escáner de seguridad de email — Outlook/Gmail hacen esto con links antes de
que el usuario haga clic, lo que quema el `code` de un solo uso de PKCE
antes de que el usuario llegue), la ruta redirige silenciosamente a
`/login?error=auth` sin decir que el problema fue justamente el enlace de
recuperación. Esto es plausible como causa adicional o alternativa a la de
localhost, y no se puede distinguir cuál de las dos es sin ver los logs de
Supabase — pero ambas comparten la misma naturaleza (configuración/fragilidad
del link de un solo uso), así que el fix de UI (mensaje más claro +
"pedí un enlace nuevo") cubre las dos.

**Archivos involucrados:** `src/app/auth/callback/route.ts`,
`src/app/login/page.tsx` (el error `?error=auth` hoy es genérico y no dice
si fue un signup o una recuperación).

---

## Bug 4 — Geografía se trabó a mitad de una práctica

**Causa raíz confirmada en código (no requiere el dashboard, esto sí se
arregla acá).** `GeografiaPracticaClient.tsx:56-72`:

```ts
async function handleFinish(erroresPartida: PaisAmerica[]) {
  setErrores(erroresPartida);
  const res = await fetch("/api/practica/finish", { ... });  // sin try/catch
  const data = await res.json();
  ...
}
```

y en `GeografiaSprintRunner.tsx:73-77`:

```ts
function terminar() {
  if (finishedRef.current) return;
  finishedRef.current = true;
  onFinish(erroresRef.current);   // no se espera ni se atrapa la promesa
}
```

`onFinish` es en realidad una función async (`handleFinish`), pero se llama
como si fuera síncrona. Si el `fetch` a `/api/practica/finish` tarda mucho,
falla de red, o `res.json()` explota (por ejemplo con una respuesta no-JSON
en un error 500), la promesa rechaza **sin que nadie la atrape** — un
"unhandled rejection" silencioso. `fase` nunca pasa de `"sprint"` a
`"resumen"`: la pantalla queda congelada exactamente en el último frame del
sprint, sin ningún mensaje de error. Esto explica el síntoma con precisión
quirúrgica: no es que la app tire un error, es que deja de reaccionar — que
es literalmente "se trabó".

Como agravante encontré que `/api/practica/finish/route.ts:69-150` encadena
6 llamadas a Supabase **en serie** (dos consultas a `attempts`, una a
`daily_progress`, y tres RPCs: `registrar_xp_diario`,
`consumir_boost_pendiente`, `registrar_puntos_mundo`, más
`verificarLogros` que hace sus propias consultas adentro) sin `Promise.all`
y sin timeout. Con una conexión mala (típico en el caso real que
mencionaste, "a mitad de una práctica" sugiere el usuario en movimiento/con
mal wifi), esta cadena puede demorar mucho — y como el cliente no tiene
timeout ni manejo de error, la espera se vuelve indefinida en vez de fallar
con un mensaje.

**El mismo patrón (fetch sin try/catch en el `onFinish`) existe también en**
`DecimalPracticaClient.tsx:48-62` **y** `EnigmiaPracticaClient.tsx` — no es
exclusivo de Geografía, es el mismo componente adaptado tres veces sin
llevarse el manejo de errores. Lo marco para arreglar en los tres lugares
ya que es el mismo bug con el mismo fix, y dejar dos sin arreglar sería
dejar la misma trampa activa.

**Archivos a tocar:** `GeografiaPracticaClient.tsx`,
`DecimalPracticaClient.tsx`, `EnigmiaPracticaClient.tsx` (agregar
try/catch + estado de error visible), y opcionalmente paralelizar las
consultas independientes en `api/practica/finish/route.ts` para reducir la
ventana de espera real.

---

## Bug 5 — Cuenta nueva no pudo hacer lecciones

**No encontré una causa de código que rompa Aprender específicamente para
cuentas nuevas** — revisé el trigger de creación de perfil, todas las
tablas que toca el flujo de lección (`technique_progress`, `techniques`,
`technique_modifiers`, `unlocked_modifiers`, `user_achievements`,
`feed_posts`) y sus políticas RLS: ninguna depende de que existan filas
previas, todas usan `upsert`/`insert` con `on conflict`, y ninguna fue
tocada por el `GRANT` restrictivo de `0035` (ese solo afecta `profiles`,
`duels` y `friendships` — ver Bug 2/3 más abajo para el detalle de qué SÍ
tocó). El flujo de código de `LeccionClient.tsx` →
`POST /api/aprender/completar` está bien: incluso si el guardado de
progreso falla server-side, el cliente igual muestra la pantalla de
celebración (`LeccionClient.tsx:67-81`, el `catch` está vacío a propósito),
así que un fallo ahí no se vería como "no pudo hacer lecciones" sino como
progreso silenciosamente no guardado — un bug distinto y más difícil de
notar, no el que reportaste.

**Hipótesis más probable: es el mismo Bug 2, no un bug nuevo.** El acceso a
Aprender pasa por `requireMundoNumeria` (`guard.ts:34-42`), que exige
`profile.onboarding_completado`. Para llegar ahí, la cuenta tiene que haber
pasado por `/onboarding` (poner nombre) y `/onboarding/diagnostico` (o
saltearlo). Si la cuenta se creó durante una ventana de rate-limit de email
(Bug 2) y quedó en un estado raro — por ejemplo, la persona seguía
probando con la sesión de otra cuenta a medio confirmar, o recargó a mitad
del flujo de onboarding — es fácil terminar en una cuenta que técnicamente
existe pero nunca completó `onboarding_completado`, y por lo tanto
`requireMundoNumeria` la manda en loop a `/onboarding/diagnostico` en vez de
dejarla entrar a la lección. Desde afuera, eso se percibe como "no pudo
hacer lecciones."

**Para confirmar esto con certeza faltaría reproducirlo paso a paso con una
cuenta 100% nueva en el entorno de producción real** (no lo puedo hacer yo
mismo porque no tengo credenciales de prueba ni acceso al Supabase de
producción) — si podés reproducirlo vos una vez más prestando atención a en
qué URL exacta quedó trabada la cuenta (¿`/onboarding`? ¿`/onboarding/diagnostico`?
¿un error 500 real?), eso confirma o descarta esta hipótesis en un minuto.
Mientras tanto, el fix de código que sí puedo hacer con confianza es
defensivo: si `guardarNiveles()` en `DiagnosticoClient.tsx:111-128` falla a
mitad de camino (algún `upsert` de `skill_levels` funciona y el `update` de
`onboarding_completado` no, o viceversa, porque hoy son 5 escrituras
separadas sin atomicidad ni manejo de error — ninguna comprueba
`error`), la cuenta puede quedar en un estado intermedio inconsistente sin
que el usuario se entere. Igual que en el Bug 4, acá también falta
try/catch + mensaje de error visible en vez de asumir que todo salió bien.

**Archivos involucrados:** `src/app/onboarding/diagnostico/DiagnosticoClient.tsx`,
`src/lib/auth/guard.ts`.

---

## Migraciones nuevas necesarias para los bugs (Familia B, código)

Ninguno de los 5 bugs de código (1b, 4, 5) requiere una migración SQL nueva
— son todos fixes de manejo de errores/estado en el cliente y en
`guard.ts`. La única pieza de infraestructura que toca base de datos es la
restricción de rutas para invitados, y esa se resuelve leyendo
`user.is_anonymous` (ya viene en la sesión de Supabase Auth, no hay que
guardar nada nuevo).

**Los bugs 2 y 3 (Familia A) no tienen fix de código real — son
configuración del dashboard de Supabase que tenés que hacer vos:**
1. Authentication → URL Configuration: Site URL = tu dominio de Vercel,
   agregar `https://tu-dominio.vercel.app/auth/callback` a Redirect URLs
   (ya cubierto en el mensaje anterior de esta conversación).
2. Authentication → Rate Limits / Settings → SMTP Settings: configurar un
   proveedor SMTP propio para sacar el límite de ~2-4 emails/hora del
   servicio incluido.

---

## Notas de arquitectura levantadas de paso (para las features nuevas)

No pedías diagnóstico de esto, pero lo levanté investigando y sirve para no
reinventar lo que ya existe:

- **Duelos son 100% asincrónicos hoy ("fantasma"), confirmado en código**:
  cada jugador juega su sprint por separado; si el rival ya jugó, se le
  muestra una animación "replay" de sus respuestas guardadas
  (`SprintRunner.tsx:93-100,402-424`), no hay conexión en vivo entre
  ambos. `registrar_resultado_duelo` (definida en
  `0028_duelos_fantasma.sql:16-99`) resuelve el duelo recién cuando el
  segundo jugador termina.
- **Cero uso de Supabase Realtime en todo el proyecto** — confirmado por
  grep de `.channel(`/`realtime` sobre todo `src/`. T3 va a ser una
  integración desde cero, sin patrones previos que conservar.
- **El matchmaking de ELO progresivo (S3) ya existe**, en
  `buscar_rival_duelo` (`0031_matchmaking_duelos.sql:62-63`): arranca en
  ±15 y crece +15 cada 8 segundos hasta ±120, por polling del cliente cada
  2.2s (`RankedsClient.tsx:135,152-175`). Ya muestra el rango en pantalla
  (`RankedsClient.tsx:199`, formato "±60 ELO"). Lo que pide S3 es ajustar
  los números (±30 / +30 cada 10s) y cambiar el formato del texto a
  "entre 1200-1260 ELO" — no construir el sistema de cero.
- **No hay ninguna notificación de reto, ni tabla de "invitación
  pendiente" separada de `duels`** — un reto se guarda como fila en
  `duels` con `estado='pendiente'` y el retado no tiene ninguna forma de
  enterarse salvo entrar por su cuenta a la URL exacta del duelo. No está
  roto — nunca se construyó.

Estas notas no cambian nada de lo que hay que arreglar en los 5 bugs; las
dejo acá para no tener que re-investigar esto cuando llegue el momento de
S3/T3.
