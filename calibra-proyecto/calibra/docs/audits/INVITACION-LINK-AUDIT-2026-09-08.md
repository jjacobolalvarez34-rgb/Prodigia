# AUDITORÍA T9 · INVITACIÓN POR LINK A DUELO — 2026-09-08

**Objetivo**: auditar por código el flujo completo de "Invitación por link a duelo"
(Social → Amigos → `InvitarPorLink`): generación del link, caso sin sesión, validaciones de
`unirse_invitacion_duelo`, misma sala (host + invitado), registro de resultado del invitado,
race cancel-vs-join, comportamiento móvil y limpieza. Corregir bugs mínimos y entregar
evidencia con archivo:línea.

**Método**: lectura de código real (cliente, route handlers, migraciones vigentes) contra las
reglas de `AGENTS.md`. La verificación E2E queda en `BLOQUEADO` (no corre dev server; ver
"VERIFICACIÓN"). Estados usados: `VERIFICADO POR CÓDIGO` / `BLOQUEADO` / `CONFIRMADO POR CÓDIGO`.

---

## 1. Generación del link

**VERIFICADO POR CÓDIGO.** El link se genera en `InvitarPorLink` (`AmigosClient.tsx:156-293`):

- `generarLink()` (`:196-212`) llama a la RPC `crear_invitacion_duelo` con `p_mundo`,
  `p_operation_type` (solo numeria) y `p_sub_tipo` (resto), y arma
  `` `${window.location.origin}/duelo/invitacion/${data}` `` (`:210`).
- El `data` devuelto por la RPC es el `uuid` de la fila de `duel_invites` (crudo, NO un hash y NO
  el `duel_id`): `crear_invitacion_duelo` hace `returning id into v_id` y retorna `v_id`
  (`0109_mundo_historia.sql:805-809`). Un `duels` recién se crea cuando B se une
  (`0059_invitar_por_link_multimundo.sql:125-127`).
- Estado esperando: `estado==="esperando"` (`:161`), link visible + botón copiar + cancelar
  (`:236-260`). Misma sala por Realtime (ver sección 4).
- `cancelar()` (`:214-222`) llama a `cancelar_invitacion_duelo` y vuelve a `idle`.

## 2. Caso sin sesión

**VERIFICADO POR CÓDIGO (parcial) + un hueco real para cuentas nuevas.**

- `page.tsx:21` llama `requireUsuarioOnboarded(supabase, "/duelo/invitacion/<id>")` →
  `requireUsuario` → sin sesión: `redirect("/login?next=/duelo/invitacion/<id>")`
  (`guard.ts:18-20`).
- El login real (email/password) respeta `next`: `LoginForm.tsx:50` → `router.push(next ?? "/")`.
  Tras eso, si la cuenta no está onboardeada (nombre + 2 mundos), `guard.ts:28-39` redirige a
  `/onboarding?next=...`, y `OnboardingForm` conserva y hace `router.push(next)` (`:96,104`). La
  invitación **sobrevive** el flujo login → onboarding para cuentas existentes.
- **BUG (cuentas nuevas):** el único camino "Creá una" del `/login` apunta a `/registro` SIN `next`
  (`login/page.tsx:44`), y `RegistroForm.tsx:81` hace `router.push("/")` — el link de invitación
  que traía el usuario **se pierde** para alguien que todavía no tiene cuenta. `/registro` solo
  maneja `?ref=` (referido de amigo), no un `next` de duelo (`registro/page.tsx:6,10`).
  `auth/callback/route.ts` procesa `ref` para `conectar_por_invitacion`, pero no hay ruta que
  reintroduzca la invitación de duelo.

  **Hallazgo** (no corregido — modificar el flujo de registro/email-callback excede el fix mínimo
  de esta auditoría y tocaría una ruta externa de Supabase). Recomendación: que `login/page.tsx:44`
  propague `next` a `/registro?next=...` y que `RegistroForm`/`auth/callback` lo reintroduzcan;
  documentado en "SIGUIENTES PASOS".

- **Invitado anónimo (`signInAnonymously`):** `LoginForm.tsx:26-33` crea la sesión y hace
  `router.push(next)` con la ruta de invitación, pero el proxy bloquea a los anónimos de
  `/duelo/invitacion` y lo manda a `/invitado-bloqueado?seccion=Amigos`
  (`rutasInvitado.ts:18`, `proxy.ts:123-133`). Es **intencional** (una cuenta real debe tener
  identidad persistente para participar en un duelo contra otro usuario). `bloquearInvitado` en
  `page.tsx:22` es la segunda línea de defensa (`guard.ts:171-175`). `requireUsuarioOnboarded`
  exige `mundos_desbloqueados.length >= 2` (`guard.ts:37`).

## 3. Validaciones de `unirse_invitacion_duelo`

**VERIFICADO POR CÓDIGO.** Vigente en `0059:84-135` (no se redefine en 0090/0108/0109):

- `no autenticado` (`:96`).
- `invitacion no encontrada` (`:101`) — `select ... for update` serializa dobles joins/pestañas.
- `usada` → si el duelo existe y coinciden creador o participante, devuelve el *mismo* `duel_id`
  con `ya_unido=true` (`:104-113`); si no, `invitacion ya usada`.
- `estado <> 'esperando'` → `invitacion no disponible` (`:117-119`). Cubre `cancelada`.
- propio link → `no podes unirte a tu propia invitacion` (`:121-123`), mostrado con mensaje
  dedicado en `page.tsx:36-37`.
- **NO valida expiración**: no hay chequeo sobre `created_at` de `duel_invites` (la tabla ni
  siquiera tiene columna de expiración; `0038:90-97`). Ver sección 8.

## 4. Misma sala (host + invitado)

**VERIFICADO POR CÓDIGO.** Ambos caen en la misma URL de duelo (`hrefDuelo`):

- **Invitado:** `page.tsx:45` → `redirect(hrefDuelo(fila.mundo, fila.operation_type, fila.duel_id, fila.sub_tipo))`.
- **Host:** Realtime `postgres_changes UPDATE` en `duel_invites` (filter `id=eq.<inviteId>`) →
  cuando `estado==="usada"` y hay `duel_id`, `router.push(hrefDuelo(...))` (`AmigosClient.tsx:166-194`).
- Realtime está habilitado para `duel_invites` (`0038:267-272`); la RLS permite SELECT a cualquier
  `authenticated` (`0038:106-108`). Ambos llaman a la misma `hrefDuelo` (`rutas.ts:27-69`) con el
  mismo `duel_id` → misma sala. **Confirmado.**
- Nota: `NotificacionesDuelo` saltea anónimos (`NotificacionesDuelo.tsx:37`); irrelevante acá porque
  la invitación exige cuenta real.

## 5. Registro de resultado del invitado

**VERIFICADO POR CÓDIGO.** Funciona: el invitado queda como `retado_id` (`0059:125-127`), y
`registrar_resultado_duelo` valida participación por `retador_id`/`retado_id` (`0072:73-76`) y
`obtener_duelo` lo mismo (`0109:712-714`). El resultado del invitado se persiste y resuelve
normalmente. La práctica que consume `?duelo=` (`practica/page.tsx:57-63`) valida el guard de
participación server-side vía `obtener_duelo`.

**PERO hay una discrepancia producto/código importante:**
- **PROBLEMA**: `unirse_invitacion_duelo` inserta en `duels` SIN setear `clasificatorio`
  (`0059:125`); el default de esa columna es `true` (`0050:14`). Es decir, **el duelo generado por
  link es CLASIFICATORIO** y mueve ELO cuando ambos resuelven (`0072:143-158`) y cuenta en logros
  competitivos. El propio comentario de `AmigosClient.tsx:146-147` lo describe como "un duelo
  casual ... ni siquiera hace falta que sea tu amigo".
- **CAUSA**: la migración que hizo casuales a los duelos (0050) no tocó `unirse_invitacion_duelo`,
  que sigue insertando sin ese flag.
- **IMPACTO**: un duelo por link (que el código *pretende* casual) termina moviendo ELO de ambos
  cuando se juega — contradice la intención documentada en `AmigosClient.tsx`.
- **FIX**: NO aplicado (requiere migración: `insert ... select ...`.

## 6. Races

**VERIFICADO POR CÓDIGO.**

- **Doble join / doble pestaña**: `select ... for update` en `unirse_invitacion_duelo:99` →
  el segundo llama sobre la fila ya actualizada ve `estado='usada'` y entra en la rama de
  re-entrada (devuelve el mismo duelo) o en `invitacion ya usada`. Sin duplicado de `duels`.
- **Cancel-vs-join**: `cancelar_invitacion_duelo` (SQL) solo cancela si `estado='esperando'`
  (`0038:202-203`), y `unirse_invitacion_duelo` usa `for update` → el row lock serializa; si el
  cancel gana el lock, el join ve `cancelada` → `invitacion no disponible`; si el join gana, el
  cancel no afecta la fila `usada`. **Resuelta correctamente.**

## 7. Comportamiento móvil

**VERIFICADO POR CÓDIGO.** El layout raíz declara `appleWebApp` y viewport `themeColor`
(`layout.tsx:95-99, 111-116`) — la app es responsive (Tailwind, contenedores `max-w-md`/`max-w-lg`
con `px-4` en `page.tsx`, `AmigosClient.tsx:40`). No hay nada específico de la invitación que
dependa del ancho de viewport; el selector y el panel de espera son `flex-col` y caben en móvil.
**No hay bloqueo de móvil detectable por código.** (No se pudo confirmar en E2E real — `BLOQUEADO`.)

## 8. Limpieza / expiración

**VERIFICADO POR CÓDIGO.**

- `crear_invitacion_duelo` cancela cualquier invitación propia previa en `esperando` antes de
  insertar (`0109:802-803`). `cancelar_invitacion_duelo` permite cancelar manualmente.
- Las filas `usada`/`cancelada` **nunca se borran** de `duel_invites`. No hay expiración temporal
  (sin columna de expiración, ver sección 3). La limpieza de 60 s de `0051` aplica a `duels`
  `estado='pendiente'` `modo='simple'` (vía `mis_duelos_pendientes`), **NO** a `duel_invites`.
- **Hallazgo**: acumulación indefinida de links emitidos (aunque cada nuevo link cancela el previo
  en `esperando`, las `usada`/`cancelada` quedan para siempre). No rompe funcionalidad, es deuda
  de datos. No corregido (requeriría migración de cleanup).

## 9. BUG CONFIRMADO · Quimia: selector ofrece modos que la RPC rechaza

**PROBLEMA**: `SelectorMundoDuelo` ofrece 5 modos de Quimia, pero `crear_invitacion_duelo` (RPC)
solo acepta 3 → invitar por link con Nomenclatura/Orgánica falla con `opcion invalida`.

**CAUSA RAÍZ**:
- `SelectorMundoDuelo.tsx:132`: `quimia: (Object.keys(NOMBRE_MODO_QUIMIA) as ModoQuimia[]).map(...)`
  expone los **5** modos (`quimia.ts:198-206`: `simbolos|formulas|tabla|nomenclatura|organica`).
- RPC `crear_invitacion_duelo` valida solo `simbolos|formulas|tabla`
  (`0109_mundo_historia.sql:780-783`). El bug está **documentado como preexistente dentro del
  alcance**: `0108_mundo_trigonometria.sql:742-747` y `0109_mundo_historia.sql:747-749` lo dejan
  "exactamente como está ... es un bug preexistente ... corregirlo acá sería scope creep".
- `api/amigos/retar` Sí acepta los 5 (`retar/route.ts:10`) y `hrefDuelo` sabe rutear a
  `nomenclatura`/`organica` (`rutas.ts:33-34`) — el motor de práctica también los soporta. Es solo
  la RPC de invitación la desactualizada.

**PROPUESTA** (fix mínima, sin tocar migraciones): restr**pasar** las opciones de Quimia que la RPC
acepta, con una prop aditiva y no invasiva en `SelectorMundoDuelo` usada solo por `InvitarPorLink`.
Así no se rompe "retar a un amigo" (que sí soporta los 5) y se alinea la UI con lo que el server
acepta. **DECISIÓN**: tras revisar, la opción (a) es preferible por no requerir migración y ser la
menos invasiva, pero requiere agregar un `subopcionesPorMundo?: Record<Exclude<MundoDuelo,"numeria">, string[]>` que en `InvitarPorLink` filtre `quimia` a `['simbolos','formulas','tabla']`.

**IMPLEMENTACIÓN** (fix aplicada, mínima y aditiva):

- `src/components/duelos/SelectorMundoDuelo.tsx`: export nueva constante
  `QUIMIA_MODOS_INVITACION = ["simbolos","formulas","tabla"]` (los 3 que acepta la RPC); prop
  opcional `subopcionesPorMundo?: Partial<Record<Exclude<MundoDuelo,"numeria">, string[]>>` que
  filtra las pills de subopción (`:84,95,208-210`). Sin el prop, comportamiento idéntico → cero
  impacto en "retar a un amigo" ni en Rankeds.
- `src/app/[locale]/amigos/AmigosClient.tsx`: `InvitarPorLink` pasa
  `subopcionesPorMundo={{ quimia: QUIMIA_MODOS_INVITACION }}` (`:271-275`) → al elegir Quimia solo
  se ofrecen Símbolos/Fórmulas/Tabla; ya no se puede generar un link que la RPC rechace.
- NO se tocaron migraciones (fiel a la regla "no toques migraciones", y el propio 0108/0109 declara
  el fix de server como scope creep de tandas previas). El fix de server queda documentado en
  "SIGUIENTES PASOS" por si se quiere ampliar la RPC a los 5 modos en vez de recortar la UI.

**VERIFICACIÓN**:
- `npx tsc --noEmit` ✅ 0 errores.
- `npx eslint src/components/duelos/SelectorMundoDuelo.tsx src/app/[locale]/amigos/AmigosClient.tsx` ✅ 0 issues.
- `npm test` ✅ 126/126 (10 archivos).
- Confirmación por la RPC: con `nomenclatura`/`organica` la invitación se rechaza en el server
  (`0109:781`); tras el fix la UI ya no permite elegirlos.

## ESTADOS POR ÍTEM

| Ítem | Estado |
|---|---|
| 1 Generación del link | VERIFICADO POR CÓDIGO |
| 2 Caso sin sesión | VERIFICADO POR CÓDIGO (con bola de cuentas nuevas en `BLOQUEADO`) |
| 3 Validaciones `unirse_invitacion_duelo` | VERIFICADO POR CÓDIGO (sin expiración) |
| 4 Misma sala | VERIFICADO POR CÓDIGO |
| 5 Resultado del invitado | VERIFICADO POR CÓDIGO (discrepancia `clasificatorio=true`) |
| 6 Races | VERIFICADO POR CÓDIGO |
| 7 Móvil | VERIFICADO POR CÓDIGO (sin bloqueo visible; sin E2E) |
| 8 Limpieza | VERIFICADO POR CÓDIGO |
| 9 Bug Quimia | CONFIRMADO POR CÓDIGO → fix aplicado (cliente, aditivo) |

## ARCHIVOS MODIFICADOS

- `src/components/duelos/SelectorMundoDuelo.tsx` — Fix BUG Quimia (const `QUIMIA_MODOS_INVITACION`
  + prop opcional `subopcionesPorMundo` con filtro en las subopciones; aditiva, sin cambio de
  comportamiento cuando el prop se omite).
- `src/app/[locale]/amigos/AmigosClient.tsx` — `InvitarPorLink` pasa
  `subopcionesPorMundo={{ quimia: QUIMIA_MODOS_INVITACION }}` para no ofrecer modos Quimia que la
  RPC `crear_invitacion_duelo` rechaza.

## ARCHIVOS NO MODIFICADOS (pendiente de decisión)

- Migraciones `0059` (unirse_invitacion_duelo; no setea `clasificatorio`), `0038` (tabla sin
  expiración), `0109` (validación Quimia 3 modos), `0050` (default `clasificatorio=true`):
  hallazgos 3/5/8/9-segundo requerirían SQL; documentados, NO aplicados.
- Flujo registro/email-callback (hueco de `next` para cuentas nuevas): toca ruta externa de
  Supabase, fuera del fix mínimo.

## VERIFICACIÓN

- Dev server `localhost:3000` NO corriendo → **E2E Playwright BLOQUEADO** (no se pudo
  reproducir el flujo en vivo ni confirmar móvil en browser real).
- `npx tsc --noEmit` ✅ 0 errores.
- `npx eslint` (ambos archivos tocados) ✅ 0 issues.
- `npm test` ✅ 126/126 (10 archivos).
- `npm run build` ✅ build limpia (234 rutas, `duelo/invitacion/[inviteId]` incluida).

## SIGUIENTES PASOS

1. ~~Aplicar el fix de Quimia (sección 9)~~ ✅ Aplicado (ver ARCHIVOS MODIFICADOS).
2. ~~Correr `npm run build`~~ ✅ Build limpia en las rutas tocadas.
3. Migración para que unirse_invitacion_duelo cree el duelo con `clasificatorio=false`
   (alinear con el comentario "duelo casual" de `AmigosClient.tsx`).
4. Migración de expiración de `duel_invites` (`created_at` + guard en `unirse_invitacion_duelo`)
   y/o cleanup de filas `usada`/`cancelada`.
5. Decidir el fix de server de Quimia (ampliar la RPC a los 5 modos) en lugar del recorte de UI
   si el producto quiere invitaciones de Nomenclatura/Orgánica.
6. Propagar `next` al flujo `/registro` + email-callback para que una cuenta nueva no pierda el
   link de invitación.
7. Levantar dev server y correr E2E Playwright (patrón `CASUAL-AUDIT` con `signInAnonymously`) para
   los ítems 2 (sin sesión/clase anónimo), 4 (misma sala), 5 (racha de resultado del invitado) y 7 (móvil).