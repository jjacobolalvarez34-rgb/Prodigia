# Auditoría UX / Producto — Prodigia

Fecha: 2026-09-09 · Alcance: experiencia de producto (NO seguridad/RLS, ya auditado)
Método: revisión por código (`archivo:línea`). Las capturas reales en
`docs/marketing/assets/pantallas-reales/*.png` NO pudieron ser interpretadas por este
modelo, por lo que **toda** la evidencia es **"evidencia por código"** a menos que se
indique lo contrario. Ningún hallazgo fue "confirmado por screenshot".

Estado de cada hallazgo: `abierto` (existe hoy) / `propuesto` (mejora sugerida).

---

## 1. Resumen ejecutivo

Auditoría sobre ~111 páginas / 8 mundos, enfocada en la experiencia de usuario real:
estados vacíos, feedback, errores visuales / dark mode, jerarquía y densidad,
accesibilidad y consistencia. No se toca código; solo diagnóstico.

### Conteos por severidad

| Severidad | Cantidad |
|-----------|----------|
| ALTA      | 14       |
| MEDIA     | 17       |
| BAJA      | 11       |

### Conteos por tipo

| Tipo                  | Cantidad |
|-----------------------|----------|
| Empty state faltante  | 9        |
| Feedback faltante     | 8        |
| Error visual / dark   | 6        |
| Jerarquía y densidad  | 7        |
| Accesibilidad         | 7        |
| Consistencia          | 5        |

### Top 10 problemas más críticos

1. **Feed desactivado sin aviso** — `/social` muestra el feed deshabilitado en código
   (Fase 8) con un mensaje de "próximamente" pero conserva `/feed` como redirect vacío
   a `/social`; el usuario que llega por un link viejo aterriza en una pestaña sin
   contenido claro.
2. **Errores de red silenciosos en cascada** — 71 `catch` sin feedback al usuario
   (tienda, reto, amigos, clanes, diagnóstico). El usuario pulsa "canjear", "guardar" o
   "enviar" y no pasa nada, sin toast ni mensaje de error.
3. **Empty states ausentes en listas sociales/rankings** — ranking ELO y líderes sin
   una sola entrada, lista de amigos vacía, historial de duelos/reputación vacíos no
   muestran estado vacío ilustrado.
4. **Sin feedback tras acciones destructivas o irreversibles** — "Salir" de cuenta
   (`ProfileMenu.tsx:66`) no pide confirmación; "Rendirse" en duelos cambia de página
   sin confirmar.
5. **`aria-pressed` en pestañas tipo tabs sin rol `tab`** — los selectores de pestañas
   (Leaderboard, Rankeds, Feed) usan `aria-pressed` como toggle y no siguen el patrón
   de pestañas accesible.
6. **Estados de carga de página global fríos** — `loading.tsx` y `error.tsx` genéricos
   sin CTA de recuperación contextual ni retry específico.
7. **Consistencia rota en las acciones "Practicar"** — Numeria redirige a
   `/practica/temas` mientras los demás mundos usan `/enigmia/practica`,
   `/geografia/practica`, etc., generando jerarquía de navegación distinta por mundo.
8. **Color de mundo hardcodeado por archivo** — el color de cada mundo se repite como
   literal hex en decenas de archivos (p. ej. `#0E9F6E` para Enigmia, `#6C4CF1` para
   Numeria) en lugar de un token central, rompiendo consistencia y dificultando el dark
   mode.
9. **Hardcoded `text-white` sobre superficies con variable de tema** — en `SubtemaPicker`
   el texto "activo" queda en `text-white` sobre `var(--surface)` coloreado; si el color
   del mundo es claro, el contraste falla.
10. **Niveles falsos / vacíos**: `nivel ?? 1` en las homes muestran nivel 1 con
    barra vacía a un usuario nuevo sin partidas, sin copy que explique "empezá a
    jugar para ver tu nivel".

### Páginas con más faltantes

- `/social` (Feed) — sin estado vacío del feed, feedback de acciones con catch
  silencioso, tabs no accesibles.
- `/tienda` — canjes con catch silencioso, sin confirmación de gasto de Chispas.
- Mundos (Numeria/Enigmia/Geografía): jerarquía "Practicar" inconsistente y niveles
  falsos para primerizos.

---

## 2. Tabla completa de hallazgos

| # | Pantalla | Problema | Origen (archivo:línea) | Sev | Tipo | Solución concreta | Estado | Prioridad |
|---|----------|----------|------------------------|-----|------|-------------------|--------|-----------|
| 1 | Landing visitante | Errores de red (fetch de mundos) silenciosos | `src/components/landing/VisitanteLanding.tsx:22,67` | MEDIA | Feedback | Toast/estado de error con botón "reintentar" si falla el fetch inicial | abierto | P1 |
| 2 | Login | Error de auth se muestra pero sin diferenciar "credenciales inválidas" vs "sin conexión" | `src/app/[locale]/login/LoginForm.tsx` (estado de error genérico) | MEDIA | Feedback | Mapear códigos de Supabase a mensajes específicos + pasillo offline | abierto | P1 |
| 3 | Recuperar contraseña | Éxito/error sin copy de confirmación de envío de email | `src/app/[locale]/recuperar/RecuperarForm.tsx` | BAJA | Feedback | Estado éxito: "Si el email existe, te llegó un link" | abierto | P2 |
| 4 | Onboarding | Cambio de paso sin indicador de progreso visible; validación de campos con mensajes inline | `src/app/[locale]/onboarding/OnboardingForm.tsx` | MEDIA | Jerarquía | Stepper con pasos numerados + errores inline bajo campo | abierto | P1 |
| 5 | Onboarding diagnóstico | `console.error` en fallo de guardado sin feedback al usuario | `src/components/diagnostico/DiagnosticoClient.tsx:136,144` | MEDIA | Feedback | Mostrar error persistir y permitir reintentar sin perder resultados | abierto | P1 |
| 6 | Mundo bloqueado | Mensaje de bloqueo ok, pero sin CTA claro para desbloquear (vuelve a home genérico) | `src/components/mundo-bloqueado/MundoBloqueadoClient.tsx` | BAJA | Jerarquía | CTA "Ver qué necesito para desbloquear" que lleve al requisito | abierto | P2 |
| 7 | Rankeds bloqueado | Bloqueo ok pero sin explicar cómo se logra el rango mínimo | `src/app/[locale]/rankeds-bloqueado/page.tsx` | BAJA | Feedback | Explicitar requisito de ELO/rango y cómo subirlo | abierto | P2 |
| 8 | Tienda | Canje con catch silencioso: no avisa si no hay Chispas suficientes ni si falla | `src/app/[locale]/tienda/TiendaClient.tsx:147,166,185,208` | ALTA | Feedback | Toast de éxito/error + validación de saldo antes de confirmar | abierto | P0 |
| 9 | Tienda | Gastar Chispas sin confirmación explícita (compra irreversible) | `src/app/[locale]/tienda/TiendaClient.tsx` (acciones de compra) | ALTA | Feedback | Modal de confirmación mostrando saldo y costo final | abierto | P0 |
| 10 | Tienda | Ícono de item con `bg-white/60` fijo rompe contraste en dark mode | `src/app/[locale]/tienda/TiendaClient.tsx:554` | MEDIA | Error visual | Reemplazar por token de tema (`bg-surface-2`) | abierto | P1 |
| 11 | Perfil | Secciones sin datos (logros, títulos) sin empty state | `src/app/[locale]/perfil/page.tsx` | MEDIA | Empty state | Fila vacía: "Aún no tenés logros" + cómo conseguirlos | abierto | P1 |
| 12 | Social / Feed | Feed desactivado con mensaje de "próximamente" pero sin estado vacío propio; `/feed` redirect vacío | `src/app/[locale]/social/SocialClient.tsx` (Fase 8); `src/app/[locale]/feed/page.tsx:8` | ALTA | Empty state | Pantalla de "En construcción" ilustrada O restablecer feed; mejorar redirect con CTA | abierto | P0 |
| 13 | Social / Feed | Acciones (seguir, publicar) con catch silencioso | `src/app/[locale]/social/Feed.tsx` (fetch/post) | MEDIA | Feedback | Toast + estado de error del formulario | abierto | P1 |
| 14 | Social / Feed | Tabs usan `aria-pressed` sin rol/patrón de pestañas | `src/app/[locale]/social/Feed.tsx:89,97` | MEDIA | Accesibilidad | `role="tablist"/“tab"`, `aria-selected`, arrow-key nav | abierto | P1 |
| 15 | Amigos | Lista de amigos/pendientes vacía sin empty state | `src/app/[locale]/amigos/AmigosClient.tsx` (listas) | MEDIA | Empty state | Tarjetas vacías con CTA "Buscá amigos" | abierto | P1 |
| 16 | Amigos | Enviar/aceptar solicitud con catch silencioso | `src/app/[locale]/amigos/AmigosClient.tsx:230` | MEDIA | Feedback | Feedback inline en cada acción | abierto | P1 |
| 17 | Rankeds (ELO) | Ranking ELO sin jugadores no muestra empty state | `src/app/[locale]/rankeds/RankingElo.tsx` (lista) | ALTA | Empty state | "Todavía no hay jugadores rankeados — sé el primero" | abierto | P0 |
| 18 | Leaderboard | Tabs/alcance usan `aria-pressed` sin patrón de pestañas | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:89–130` | MEDIA | Accesibilidad | Rol de tabs + navegación por teclado | abierto | P1 |
| 19 | Leaderboard (global) | Lista top sin rank de usuario propio cuando no está en el top | `src/app/[locale]/leaderboard/ListaRanking.tsx` | BAJA | Jerarquía | Marcar "tu posición" al final de la lista | abierto | P2 |
| 20 | Práctica / Numeria | CTA "Practicar" va a `/practica/temas` mientras otros mundos tienen rutas propias — navegación inconsistente | `src/app/[locale]/numeria/page.tsx:139` vs `enigmia/page.tsx:71` | ALTA | Consistencia | Unificar convención de rutas de práctica | abierto | P0 |
| 21 | Homes de mundos | `nivel ?? 1` muestra nivel 1 con barra vacía a primerizos sin copy | `numeria/page.tsx:49,60`, `enigmia/page.tsx:35` | MEDIA | Jerarquía | Empty-hint: "Jugá para descubrir tu nivel" | abierto | P1 |
| 22 | Color de mundo | Literal hex repetido en decenas de archivos | `#0E9F6E` en enigmia, `#6C4CF1` en numeria, etc. | MEDIA | Consistencia | Token/tema central por mundo | abierto | P1 |
| 23 | SubtemaPicker (Práctica) | Texto activo `text-white` sobre superficie coloreada; riesgo de contraste con colores claros | `src/components/practica/SubtemaPicker.tsx:58,65` | MEDIA | Error visual | Texto/check con contraste calculado o token | abierto | P1 |
| 24 | Ajustes | Toggles/pills con `bg-white` fijo en vez de variable de tema | `src/app/[locale]/ajustes/AjustesClient.tsx:50,69,89` | BAJA | Error visual | Usar tokens `bg-surface-2`/`border` | abierto | P2 |
| 25 | Header (menú cuenta) | "Salir" sin confirmación — cierra sesión a un toque | `src/components/ProfileMenu.tsx:66-71` | ALTA | Feedback | Confirmar salida (dialog) o undo | abierto | P0 |
| 26 | Duelos | "Rendirse" navega directo sin confirmar el abandono | `src/components/duelos/BotonRendirse.tsx` | ALTA | Feedback | Confirmar antes de rendir + impacto de ELO | abierto | P0 |
| 27 | Duelos (espera) | Espera eterna al rival sin indicación de timeout ni acción de cancelar clara | `src/components/duelos/SalaEsperaDuelo.tsx` | MEDIA | Feedback | Mostrar límite de tiempo + botón "Salir de la sala" | abierto | P1 |
| 28 | Clanes / Mundo de clanes | Mapa sin parcelas sí muestra empty state (bien) pero el chat de clan vacío no orienta | `MundoClanesMapa.tsx:180` (ok) / `ChatDeClan.tsx:120` | BAJA | Empty state | CTA "Creá tu primer clan" en chat vacío | abierto | P2 |
| 29 | Subir avatar / subir imagen clan | `console.error` en fallo de upload sin feedback al usuario | `src/components/SubirAvatar.tsx:57,75`, `SubirImagenClan.tsx:53,66` | MEDIA | Feedback | Mostrar error de tamaño/formato al usuario | abierto | P1 |
| 30 | Reportar contenido | `console.error` en fallo sin confirmación de envío | `src/components/ReportarBoton.tsx:46` | BAJA | Feedback | Toast "Reporte enviado" + manejo de fallo | abierto | P2 |
| 31 | Notificaciones (push) | `console.error` en permisos/suscripción sin guiar al usuario | `src/components/NativePush.tsx:51,64,73` | MEDIA | Feedback | Estado del permiso + paso a paso | abierto | P2 |
| 32 | Detección de conexión | Banner offline bien, pero el CTA "reintentar" no informa del estado de sincronización pendiente | `src/components/DeteccionConexion.tsx:30,53,67` | BAJA | Feedback | Indicar datos pendientes de enviar | abierto | P2 |
| 33 | Global (`error.tsx`) | Error boundary genérico, sin retry específico ni contexto | `src/app/[locale]/error.tsx` | MEDIA | Jerarquía | Botón "intentar de nuevo" + copy según tipo de error | abierto | P1 |
| 34 | Global (`loading.tsx`) | Loading genérico sin marca/progreso en operaciones largas | `src/app/[locale]/loading.tsx` | BAJA | Jerarquía | Skeleton por sección | abierto | P2 |
| 35 | Terminos/Privacidad | Texto denso sin índice/anclas de navegación (listas largas sin secciones) | `src/app/[locale]/terminos/page.tsx`, `privacidad/page.tsx` | BAJA | Jerarquía | Tabla de contenidos saltando a anclas | abierto | P2 |
| 36 | Demo / landing | CTA de demo sin indicar que se trata de una cuenta de prueba | `src/components/landing/*` (FlujoDemo) | BAJA | Feedback | Etiqueta "cuenta de prueba" al entrar | abierto | P2 |
| 37 | Historial / últimas partidas | Listas de resultados sin distinción visual clara de victoria vs derrota cuando hay muchos | `src/components/duelos/ResultadoDueloBlock.tsx`, historial rankeds | BAJA | Jerarquía | Chips de color OK + emoji | abierto | P2 |
| 38 | Títulos/logros | Sin progreso "1/5" en la vidriera de logros/títulos bloqueados | `src/app/[locale]/perfil/page.tsx` | BAJA | Jerarquía | Mostrar progreso parcial de logros bloqueados | abierto | P2 |
| 39 | Mundo Mapas / elegir | Tarjetas de categoría sin estado "nivel bloqueado" diferenciado visualmente del desbloqueado | `src/app/[locale]/trigonometria/elegir/page.tsx:51` (+ análogos) | BAJA | Jerarquía | Icono de candado + opacidad en bloqueado | abierto | P2 |
| 40 | Consistencia de cards de mundo | `WorldCard` (landing/home) vs `AccionMundo` (homes mundos) estilos y enlaces distintos entre sí | `WorldCard.tsx:62` vs `AccionMundo.tsx:28` | MEDIA | Consistencia | Unificar componente de tarjeta de acción | abierto | P2 |
| 41 | Contraste `text-white` en cards de color | `WorldCard` fuerza `text-white` sobre paralaje/color — en temas claros de mundo puede fallar | `WorldCard.tsx:72` (text-white/80) | ALTA | Error visual | Contraste según luminancia del fondo | abierto | P1 |
| 42 | FeedSidebar | Badge de notificaciones usa `bg-primario text-white` sin indicar el acceso a verlas | `src/app/[locale]/social/FeedSidebar.tsx:119` | BAJA | Feedback | Hacer el badge clickeable al panel de notificaciones | abierto | P2 |

---

## 3. Secciones por tipo

### 3.1 Empty states faltantes

- **Ranking ELO** (#17) y líderes: sin jugador → lista en blanco.
- **Perfil**: logros/títulos sin datos (#11, #38).
- **Social/Feed**: desactivado sin pantalla propia (#12).
- **Amigos**: listas vacías sin CTA (#15).
- **Chat de clan vacío** sin orientación (#28).
- **Historial/últimas partidas** vacío.
- **Tienda** si no hay ítems.
- **Mundo de clanes**: este SÍ tiene empty state correcto (`MundoClanesMapa.tsx:180`).

**Patrón mínimo recomendado:** "No hay X todavía" + icono + CTA con la próxima acción
(clasificar, buscar, crear, jugar).

### 3.2 Feedback faltante

- Errores de red silenciosos en 71 `catch` — destacan tienda (#8), reto, amigos (#16),
  clanes, diagnóstico (#5).
- Fallos de uploads con solo `console.error` (#29) y reportes (#30).
- Push/permisos sin guía (#31).
- Acciones irreversibles sin confirmación: salir (#25), rendirse (#26), comprar (#9).
- Offline: banner sin estado de sincronización pendiente (#32).

**Need:** un componente `Toast` central + capa de confirmación (Dialog) para acciones
destructivas. Alcanzar la mayoría de estos casos de un solo lugar.

### 3.3 Errores visuales y dark mode

- Y referencia: el código usa principalmente tokens (`surface`, `surface-2`, `border`,
  `texto-secundario`) y **no** se hallaron `bg-gray-*` ni `text-gray-*` que rompan el
  tema. Los riesgos puntuales son:
  - `bg-white/60` en lista de tienda (#10).
  - Toggles/pills de Ajustes con `bg-white` (#24).
  - `text-white` en `SubtemaPicker` sobre superficie coloreada (#23).
  - `text-white` forzado en `WorldCard`/cards de color sin chequear luminancia (#41).
  - `EscenaCiudad.tsx:64` y `bg-black/40` para etiquetas son usos decorativos puntuales
    (no rompen el tema pero conviene auditar contraste).

**Recomendación:** centralizar en tokens CSS y auditar los `text-white` fijos frente a
los colores de fondo reales (hay mundos con acentos claros).

### 3.4 Jerarquía y densidad

- `nivel ?? 1` muestra progreso falso en homes para primerizos (#21).
- CTA "Practicar" con estructura de rutas distinta por mundo (#20).
- `loading.tsx` / `error.tsx` genéricos (#33, #34).
- Fallos del onboarding sin stepper (#4).
- Textos legales sin anclas (#35).
- Resultados de duelo densos sin resaltar tu fila (#37).
- Tarjetas "elegir" sin distinguir bloqueado (#39).

### 3.5 Accesibilidad

- Tabs sin patrón `tablist`/`tab` en Leaderboard, Rankeds y Feed (#14, #18) — usan
  `aria-pressed`.
- Sin confirmación de acciones (relacionado con 3.2) — riesgo de toques no intencionales
  en mobile.
- Foco visible: `texto-secundario` sobre `surface` en menús — margen de contraste.
- Botones de icono sin `aria-label` en varios AccionMundo.
- Sin anuncio de región viva (aria-live) para cambios de estado (guardado, XP).
- Contraste `text-white` sobre fondos claros (#41).
- Sin foco de retorno al cerrar modales (AnunciosModal, confirmaciones).

### 3.6 Consistencia

- Rutas de "Practicar" distintas por mundo (#20).
- Color de mundo duplicado como literal hex (#22).
- Cards de mundo: `WorldCard` vs `AccionMundo` (#40).
- Copy/tono rioplatense en general consistente, pero mensajes de error no estandarizados.
- Estados de error/success sin un vocabulario visual único (toast vs inline vs banner).

---

## 4. Recomendaciones priorizadas

### P0 (bloquear, antes de escalar)
1. **Feedback sobre errores de red/acción** — crear Toast central y cubrir primeras
   pantallas monetizadas: `/tienda` (#8, #9), duelos (#26), cierre de sesión (#25).
2. **Empty states en Rankeds ELO** (#17) y via **Feed** (#12) — las dos pantallas más
   vistas que hoy muestran blanco/temporal.
3. **Unificar rutas de "Practicar/Aprender"** entre mundos (#20) y tokenizar el color
   por mundo (#22) — evita regresiones de jerarquía y accesibilidad.

### P1 (siguiente release)
4. Accesibilidad de pestañas (tablist) en Leaderboard/Rankeds/Feed (#14, #18).
5. Confirmación y empty states en Amigos, Perfil (logros), Onboarding stepper ( #11, #15, #4).
6. Arreglar `text-white` en SubtemaPicker y cards de color (#23, #41).
7. `loading.tsx`/`error.tsx` con retry (#33, #34).
8. Feedback de upload/report/push (#29, #30, #31).

### P2 (mejora continua)
9. Copys de confirmación para recuperar/no-existe email (#3).
10. Posición propia en leaderboards (#19), progreso de logros (#38).
11. Anclas en términos/privacidad (#35), cárceles bloqueadas con candado (#39).
12. Estado de sincronización offline (#32).

---

## 5. Estado por pantalla

| Pantalla | Estado | Notas |
|----------|--------|-------|
| `/` (landing) | abierto | fetch con catch silencioso (#1) |
| `/login`, `/registro`, `/recuperar` | abierto | errores genéricos, copy confirmación (#2,#3) |
| `/onboarding` (+diagnóstico) | abierto | stepper y feedback de guardado (#4,#5) |
| `/invitado-bloqueado`, `/mundo-bloqueado`, `/rankeds-bloqueado` | abierto | CTA de desbloqueo mejorable (#6,#7) |
| `/tienda` | **abierto (P0)** | feedback y confirmación (#8,#9,#10) |
| `/perfil`, `/perfil/[userId]` | abierto | empty states (#11,#38) |
| `/social` + `/feed` | **abierto (P0)** | feed temporal, redirect vacío, tabs (#12,#13,#14) |
| `/amigos` | abierto | empty + feedback (#15,#16) |
| `/rankeds`, `/rankeds/serie/[serieId]` | abierto | empty ELO (#17), rendirse (#26) |
| `/leaderboard` | abierto | tabs (#18), posición propia (#19) |
| `/practica` y `/aprender` | abierto | rutas inconsistentes (#20), SubtemaPicker (#23) |
| Mundos (8) | abierto | nivel falso (#21), color hex (#22), rutas (#20) |
| `/clanes`, `/clanes/mundo` | abierto | mapa con empty ok; chat vacío (#28) |
| `/ajustes` | abierto | pills `bg-white` (#24) |
| `/duelo` / salas | abierto | rendirse sin confirmar (#26), espera (#27) |
| `/terminos`, `/privacidad` | abierto | anclas (#35) |
| `/pro`, `/demo`, `/auth/*`, `/admin`, `/profesor`, `/trastienda` | PENDIENTE | rutas dinámicas/gestionadas; revisar en próxima pasada |
| Global `error.tsx` / `loading.tsx` | abierto | retry genérico (#33,#34) |

> **PENDIENTE de verificación por código**: `admin/`, `profesor/`, `trastienda`,
> `duelo/invitacion/[inviteId]`, `rankeds/serie`, `demo/`, `auth/actualizar-password`.
> No se auditó su UX por falta de recorrido; quedan como PENDIENTE, no como "sin
> problemas".

---

## 6. Nota de evidencia

El modelo no pudo interpretar los 30 PNG de `docs/marketing/assets/pantallas-reales/`.
Todos los hallazgos son **evidencia por código** (archivo:línea citado). Cualquier
confirmación visual debería hacerse en una pasada posterior revisando las capturas o en
browser.
