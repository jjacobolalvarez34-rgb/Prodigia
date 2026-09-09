# AUDITORÍA · RETO DIRECTO A AMIGO — 2026-09-08

**Objetivo**: reproducir y corregir el bug del reto directo a un amigo (pantalla Amigos →
"Retar a duelo"): se ve la invitación/notificación, pero la partida no conecta y el duelo se
queda `pendiente`/trabado.

**Alcance**: e2e con 2 cuentas QA reales (login con password en browser, sin reload) contra el
dev server local (`localhost:3000/es`), trazas WebSocket del browser, suscriptores Realtime en
Node con tokens reales y lectura de migraciones/fuentes. Dev server local.

---

## REPRODUCCIÓN (evidencia browser)

### 1. Numeria SÍ conecta cuando ambos llegan a la sala
QA1 reta a QA2 (Numeria + Suma) → toast "Te retaron a un duelo de Suma" → click
`/es/practica?operacion=suma&duelo=<id>` → **ambos entran a la sala y arranca el sprint**
(se ven ambos niveles ELO y el problema; `duelo <id>` queda `pendiente` — el juego nunca
pasa a `en_curso` por diseño, la sincronización es por Presence/Broadcast en el canal
`duelo:<id>:sala`).

### 2. El toast NO llega en el flujo de login (bug A)
- Traza WS (browser): después de entrar por `/login` con navegación cliente, el canal
  `realtime:retos-a:<user>` **nunca se crea** (solo `realtime:presencia:global` del Header).
  Tras un **reload** estando logueado, sí aparece (`RETOS A` se suscribe). Orden de evidencia:
  `toast-reload-tmp.mjs` → ANTES de reload `["realtime:presencia:global"]`, DESPUÉS
  `["realtime:retos-a:ccbb09ac-…", "realtime:presencia:global"]`.
- Consecuencia: QA1 espera en la sala ("Esperando a QA Tester 2…") y el duelo queda
  `pendiente` para siempre (solo lo limpia `mis_duelos_pendientes`, modo `simple`, >60s).

### 3. El toast de mundos != numeria lleva a la URL equivocada (bug B)
- Toast de Geografía (con suscripción activa): href del enlace = **`/es/practica?operacion=null&duelo=<id>`**
  (hardcodeado como Numeria en `NotificacionesDuelo.tsx:84`). En `/practica` el gate
  `fila.estado === "pendiente" && fila.mundo === "numeria"` (`practica/page.tsx:65`) NO
  matchea `mundo=geografia` → `dueloInfo = null` → el retado juega práctica normal y el duelo
  nunca conecta → QA1 queda esperando en la sala.
- La etiqueta del toast para no-numeria mostraba texto roto (`operation_type` es null).

### 4. Realtime en sí NO es el problema
- Suscriptor Realtime en Node (tokens reales, `setSession`): INSERT de duelo `geografia`
  insertado por QA1 autenticado **sí llega** al suscriptor QA2. Lo mismo con numeria y con
  service_role. El evento sí llega al browser y el handler lo procesa; el fallo estaba en la
  suscripción (bug A) y en el render/URL (bug B).

---

## CAUSA RAÍZ (2 bugs independientes)

### CAUSA A — la suscripción al canal de avisos solo se crea al montar el layout raíz
`NotificacionesDuelo` (montado en `src/app/layout.tsx`) usaba un `useEffect` con deps `[]` que
llamaba `supabase.auth.getUser().then(...)`. Si la app arranca deslogueada en `/login` y el
usuario entra por navegación cliente, el layout raíz **no se remonta** y `getUser()` ya había
devuelto `null` → **el canal `retos-a:<id>` nunca se suscribe**. El retado no recibe ninguna
notificación del reto directo → el duelo queda `pendiente` indefinidamente.

### CAUSA B — el aviso hardcodeaba la ruta/etiqueta de Numeria
El link del aviso se construía a mano: `` `practica?operacion=${aviso.operacion}&duelo=${aviso.duelId}` ``.
Es válido para retos de Numeria (`operation_type` presente) pero inválido para cualquier otro
mundo (Geografía, Quimia, Enigmia, Anatomía, Melodía, Trigonometría, Historia), donde el reto
se crea con `operation_type=null` y `sub_tipo=...` (`api/amigos/retar/route.ts:63-64`).
Resultado: el retado clickea y termina en práctica normal, el duelo jamás conecta.

---

## PROPUESTA

1. **CAUSA A**: derivar la suscripción del **estado de auth** y no del montaje: re-suscribir en
   `supabase.auth.onAuthStateChange` (cubre el `INITIAL_SESSION` al montar con sesión y el
   `SIGNED_IN` del login por navegación), guardando/soltando el canal según cambie el usuario.
2. **CAUSA B**: construir el destino con `hrefDuelo(mundo, operation_type, duel_id, sub_tipo)`
   (`src/lib/duelos/rutas.ts`) — la única fuente que ya mapea cada mundo/modo a su ruta de
   práctica correcta — y generar la etiqueta con `useEtiquetasDuelo` (`SelectorMundoDuelo.tsx`),
   reutilizando la traducción existente `teRetaronADueloDe` (operación para Numeria, `"Mundo (opción)"`
   para el resto). Sin claves de traducción nuevas.

## IMPLEMENTACIÓN

- `src/components/NotificacionesDuelo.tsx`:
  - `Aviso` ahora lleva `mundo`, `operacion: ArithmeticProblemType | null`, `subTipo`.
  - Efecto: `onAuthStateChange` re-crea el canal `retos-a:<uid>` con cada sesión (`uid` dedupe),
    lo remueve al cambiar de usuario o al salir, y `data.subscription.unsubscribe()` en el cleanup.
  - Handler: toma `mundo`/`operation_type`/`sub_tipo` del `payload.new`.
  - Render: `Link href={hrefDuelo(aviso.mundo, aviso.operacion, aviso.duelId, aviso.subTipo)}` y
    etiqueta con `nombreMundo`/`etiquetaOpcion`.

## VERIFICACIÓN (todo con login SIN reload — el flujo que fallaba)

- `npx tsc --noEmit` → limpio. `npx eslint src/components/NotificacionesDuelo.tsx` → limpio.
- E2E browser (2 cuentas QA, password, sin reload):
  - **Numeria**: toast en QA2 en ~3 s; click → `/es/practica?operacion=suma&duelo=<id>`; ambos en sala (VS + niveles). **REAL**.
  - **Geografía**: toast "Te retaron a un duelo de Geografía (América)" en ~2 s; href
    `**/es/geografia/practica?duelo=<id>**`; click → QA2 cae en la sala de Geografía; ambos en
    sala (VS + niveles). **REAL** (antes: `/es/practica?operacion=null&duelo=<id>` → duelo pendiente).
- Pruebas de aislamiento descartadas:
  - Realtime Node con filtro `retado_id=eq` y duelo `geografia` (operation_type NULL) insertado
    por QA1 autenticado y por service_role → **el evento SÍ se entrega** (descartado como causa).
  - RLS `duels`: única policy select es "participantes ven sus duelos" (`0012:55-57`) — no filtra
    por mundo.
- `feed/retar` (numeria-only) y `Feed.tsx:217` (ruta hardcodeada a `/practica`) quedan fuera de
  alcance: el Feed no se renderiza hoy en Social.

## DOCUMENTACIÓN

- Auditoría y quema: procedimiento repetible arriba (repro, causa raíz, fix, verificación).
- No requiere migración (fix 100% cliente).

## ESTADO

| Ítem | Estado |
|---|---|
| CAUSA A: suscripción al mount (login flow sin notificación) | **REAL** — reproducido (traza WS) y corregido (toast llega sin reload) |
| CAUSA B: toast → URL numeria hardcodeada para mundos != numeria | **REAL** — reproducido (href `/es/practica?operacion=null&duelo=…`) y corregido |
| Numeria funcionaba al llegar ambos a la sala | **REAL** — no era parte del bug |
| Realtime delivery / RLS como causa | **DESCARTADO** — pruebas Node con tokens reales |

## ARCHIVOS MODIFICADOS

- `src/components/NotificacionesDuelo.tsx` (fix A + fix B).

## SIGUIENTE PASO (opcional, no bloquea)

- Armonizar `Feed.tsx:217` con `hrefDuelo` si el Feed vuelve a habilitarse.
- Evaluar mostrar los retos pendientes en la pestaña Amigos (`SocialClient` hoy ignora
  `retosIniciales`).
- El flujo "invitar por link" (`crear_invitacion_duelo`) no usa `NotificacionesDuelo`; no aplicar
  antes que se pida.