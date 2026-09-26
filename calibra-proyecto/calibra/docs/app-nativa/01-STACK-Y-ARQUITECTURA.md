# 01 — Stack y arquitectura de la app nativa

> Estado: PROPUESTA · requiere aprobación del PO antes de la Fase 1 del roadmap.

## 1. Punto de partida (EXISTE, verificado)

| Pieza | Estado actual | Ruta |
|---|---|---|
| App Android | Capacitor 8, `server.url` apuntando a Vercel: es un WebView del sitio en vivo. Sin conexión no abre. | `capacitor.config.ts`, `android/` (`MainActivity.java` vacío) |
| Lógica de dominio | ~350 módulos TS en `src/lib` + 92 tests vitest. Solo 11 importan `next/*` o el cliente Supabase. | `src/lib/**` |
| Backend | Supabase (Postgres + RLS + ~240 migraciones + RPC `security definer`) + 21 grupos de rutas en `src/app/api/**` | `supabase/`, `src/app/api/` |
| Sesión en rutas API | Por **cookies** (`@supabase/ssr`); no aceptan `Authorization: Bearer`. | `src/lib/supabase/server.ts` |
| Push | FCM HTTP v1 desde Edge Functions, tokens en DB (0114) | `supabase/functions/_shared/fcm.ts` |
| Tiempo real | Supabase Realtime en duelos, invitaciones, chat de clan | `NotificacionesDuelo.tsx` y otros |
| Pagos | Paddle (web) con webhook firmado e idempotente | `src/lib/pagos/`, `src/app/api/webhooks/paddle` |
| i18n | `messages/es.json` y `en.json` (~2600 claves, paridad exacta) | `messages/` |
| Ícono y splash | Ya existen en `assets/` (icon-foreground/background, splash) | `assets/` |

## 2. Opciones evaluadas

| | **Expo / React Native** (recomendada) | Kotlin + Jetpack Compose | Flutter | TWA / PWA mejorada |
|---|---|---|---|---|
| UI nativa real | Sí (vistas nativas, sin WebView) | Sí, la más "nativa" | Sí (motor propio) | No (Chrome a pantalla completa) |
| Reutiliza `src/lib` (generadores 13 mundos, ELO, retos, validadores) | **Sí, tal cual, con sus tests** | No: reescribir ~350 módulos en Kotlin | No: reescribir en Dart | Sí |
| Riesgo de divergencia web/app | Bajo (un solo `core`) | **Alto** (dos implementaciones de cada generador) | Alto | Ninguno |
| Mismo lenguaje que el equipo/agentes actuales | Sí (TS/React) | No | No | Sí |
| Offline | Sí (generadores locales) | Sí | Sí | Parcial (service worker) |
| Animación "de juego" | Muy buena (Reanimated en hilo de UI, Skia para partículas) | Excelente | Excelente | Limitada |
| iOS a futuro | Gratis (mismo código) | No | Sí | Parcial |
| Aceptación en Play | Sin problema | Sin problema | Sin problema | Riesgo de "funcionalidad mínima" |

**Decisión propuesta: Expo (React Native) con expo-router.** El argumento que define es el de
paridad: el proyecto ya invierte mucho en mantener 13 mundos iguales entre sí
(`PARIDAD_MUNDOS.md`); duplicar cada generador en otro lenguaje multiplicaría ese costo por dos.
Kotlin/Compose quedaría como opción solo si en el futuro se necesitara algo que RN no pueda hacer
(no se identificó nada así).

Se descarta seguir con Capacitor por lo que pediste: la app tiene que funcionar como app, no como
sitio envuelto.

## 3. Librerías candidatas (verificar versiones al iniciar la Fase 1)

| Necesidad | Candidata | Notas |
|---|---|---|
| Navegación | `expo-router` | Rutas por archivos, parecido al App Router de Next: curva baja para los agentes |
| Animación | `react-native-reanimated` + `react-native-gesture-handler` | Todo el movimiento del juego corre en el hilo de UI |
| Partículas, brillos, confeti, anillos | `@shopify/react-native-skia` | Reemplaza a GSAP/ogl/three de la web (en la app no hacen falta los efectos de cursor) |
| Animaciones de celebración ilustradas | `lottie-react-native` | Para level-up, cofres, racha; assets .json/.lottie |
| Háptica | `expo-haptics` | Ver tabla de háptica en `02-SISTEMA-VISUAL.md` |
| Sonido | `expo-audio` | Los sonidos de la web (`src/lib/sonido.ts`) se sintetizan con WebAudio, no son archivos: hay que producir un set de samples (ver `02-SISTEMA-VISUAL.md` §8) |
| Datos del servidor | `@supabase/supabase-js` + `@tanstack/react-query` | Caché, reintentos y persistencia offline de consultas |
| Almacenamiento | `react-native-mmkv` (caché) + `expo-secure-store` (sesión) | La sesión nunca en almacenamiento plano |
| Fórmulas (KaTeX en web) | **Spike necesario**: `react-native-math-view` o pre-render a SVG con MathJax | Riesgo técnico #1: Calculia, Circuitia, Trigonometría, Estadística dependen de fórmulas |
| Mapas (Geografía) | `react-native-svg` + `d3-geo` + `topojson-client` | Reutiliza `world-atlas` y los datos de `public/data` |
| Push | `expo-notifications` (token FCM nativo con `getDevicePushTokenAsync`) | Compatible con las Edge Functions actuales que ya hablan FCM v1 |
| Pagos | `react-native-iap` o RevenueCat | Play Billing obligatorio para bienes digitales (ver `05-PUBLICACION-GOOGLE-PLAY.md`) |
| Login Google | `@react-native-google-signin/google-signin` + `supabase.auth.signInWithIdToken` | Evita el ida y vuelta por navegador |
| Build y publicación | EAS Build + EAS Submit | Genera AAB firmado para Play y APK para testers |
| Actualizaciones de JS sin pasar por Play | EAS Update | Solo para fixes; los cambios de permisos/nativos sí pasan por Play |

Regla del proyecto: cada librería nueva se anota en `docs/EXTERNAL-RESOURCES.md` con su motivo.

## 4. Monorepo propuesto

```
Prodigia/                         ← raíz del repo (se aplana calibra-proyecto/calibra)
├─ apps/
│  ├─ web/                        ← el Next.js actual, movido sin cambios de comportamiento
│  └─ mobile/                     ← Expo (expo-router)
│     ├─ app/                     ← rutas: (tabs)/hoy, (tabs)/mundos, (tabs)/competir, ...
│     ├─ src/ui/                  ← design system nativo (tokens, Boton3D, HUD, Tarjeta, ...)
│     ├─ src/juego/               ← runners: Sprint, Duelo, Leccion (UI nativa sobre core)
│     └─ assets/                  ← íconos, lottie, sonidos, fuentes
├─ packages/
│  ├─ core/                       ← lógica pura movida de src/lib (sin React, sin Next, sin Supabase)
│  │   generadores/<mundo>, elo, retoDiario, worldLevel, racha, mundos (catálogo), validadores,
│  │   trastienda/probabilidades (solo lectura), texto, rng + sus tests vitest
│  ├─ api/                        ← cliente tipado: llamadas a RPC y rutas /api compartidas web+app
│  ├─ i18n/                       ← messages/es.json y en.json (una sola copia)
│  └─ tokens/                     ← colores, radios, tipografía, colores de mundo (JSON → CSS y RN)
├─ supabase/                      ← migraciones y functions (sin cambios de ubicación lógica)
└─ docs/
```

- Herramienta: **npm workspaces** (ya usan npm) — no hace falta Turborepo al principio.
- `packages/core` tiene una regla de lint: **prohibido importar** `react`, `next`, `@supabase/*`,
  `window`, `document`. Así sigue siendo reutilizable.
- `packages/tokens` resuelve de paso el hallazgo P-01 de `VISUAL-CONSISTENCY-AUDIT.md`
  (colores de mundo duplicados en ~20 archivos y en `page.tsx`).
- La mudanza de la web a `apps/web` se hace en un commit aislado, verificado con
  `tsc` + `vitest` + `next build`, antes de escribir código de la app.

## 5. Comunicación con el backend

### 5.1 Autenticación
- Supabase Auth en la app con sesión en `expo-secure-store`.
- Login: Google nativo (`signInWithIdToken`) + email/contraseña. Los links de correo (confirmar,
  recuperar) abren la app vía **Android App Links**: publicar
  `https://<dominio>/.well-known/assetlinks.json` en la web y usar la ruta existente
  `/auth/confirm` (flujo `token_hash`, que no depende de cookies — ya se eligió así en
  `PROGRESO.md` 2026-09-15, y es justo lo que necesita la app).
- Invitados (cuentas anónimas, EXISTE en web): mantener el mismo flujo `ConvertirCuenta`.

### 5.2 Rutas API compartidas
Las rutas `src/app/api/**` hoy leen la sesión de cookies. Para que la app las use:
- **NUEVO**: `createClientDesdeRequest(request)` en `packages/api` o en la web: si llega
  `Authorization: Bearer <jwt>`, crea el cliente Supabase con ese token; si no, usa cookies como hoy.
- Migrar ruta por ruta (empezando por `practica/finish`, `attempts`, `reto-diario/completar`).
- Todo lo que ya es RPC pura se llama directo desde la app con `supabase.rpc(...)`: las RPC ya
  validan `auth.uid()`, no hace falta pasar por Next.
- CORS no aplica a la app nativa, pero sí revisar que ninguna ruta dependa de `Origin`.

### 5.3 Offline (NUEVO, requiere decisión de PO)
Como los generadores viven en `core`, **se puede practicar sin conexión**. El problema es que el XP
lo calcula el servidor (`insertar_intento`, 0120) con anti-apuro por tiempos.
Propuesta:
- Sin red: modo "Práctica libre" — se juega, se guarda la cola de intentos en MMKV.
- Al volver la red: se envía la cola; el servidor la acepta con un tope (ej. máx. 1 sesión offline
  por día cuenta para XP; más allá, cuenta para racha pero no para ranking). Esto requiere un RPC
  nuevo `insertar_intentos_offline` con validaciones de plausibilidad.
- Duelos, rankeds, retos y tienda: **siempre online** (ya tienen estado compartido).

### 5.4 Tiempo real
- Mismo Supabase Realtime (funciona en RN). Reconectar al volver del segundo plano
  (`AppState`) — en web hubo un bug real por no re-suscribirse (`RETO-DIRECTO-AMIGO-2026-09-08.md`),
  aplicar la lección desde el inicio.

### 5.5 Push
- Las Edge Functions actuales ya envían por FCM v1 a tokens guardados. La app registra el token FCM
  nativo con la misma RPC que usa hoy `NativePush.tsx` (`registrar_push_token(p_token, p_platform)`).
- Android 13+: pedir `POST_NOTIFICATIONS` **después** de que el usuario termine su primera sesión
  y con una pantalla propia explicando para qué (racha en riesgo, te retaron a un duelo).
- Cerrar SEG-04 (secreto en webhooks) antes de publicar.

### 5.6 Pagos
- Android: Play Billing para Pro (suscripción) y paquetes de Chispas (consumibles).
- Verificación **en el servidor**: Google Real-time Developer Notifications (Pub/Sub) → endpoint
  nuevo `/api/webhooks/google-play` → mismas RPC que ya usa Paddle (`aplicar_suscripcion`,
  `acreditar_chispas_compradas`, 0145). El proveedor `'google_play'` se agrega al `check` de
  `payment_events.provider`.
- Una suscripción comprada en web debe verse Pro en la app y viceversa: la fuente de verdad sigue
  siendo la tabla `subscriptions`.

## 6. Qué NO se porta a la app (v1)

| Módulo | Motivo |
|---|---|
| Trastienda (casino, ruleta, volado, apuestas) | Política de Familias de Play + loot boxes + menores (PROD-01). Flag `plataforma === 'android'` la oculta. |
| Panel de profesor (`/profesor`) y `/admin` | Se usan en computadora; quedan en web. La app muestra "Abrir en la web". |
| Landing, demo pública, `/docentes` | Son marketing web. La app tiene su propio onboarding. |
| Efectos de cursor (GhostCursor, FondoCursorMundo, SpecularButton con three/ogl) | No hay cursor en el celular. Se reemplazan por respuestas al toque. |

## 7. Riesgos técnicos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Fórmulas matemáticas (KaTeX) sin equivalente directo en RN | Spike de 2 días en Fase 1 con 3 opciones; criterio: renderiza las 50 fórmulas más largas de Calculia en < 16 ms c/u |
| R2 | Los generadores dependen de algo del navegador sin que se note | Lint de `core` + correr los 92 tests en Node puro durante la mudanza |
| R3 | Visuales animados de Aprender (motor `visuales` en SVG/DOM) | Portarlos a `react-native-svg` + Reanimated mundo por mundo; en v1 se puede mostrar la versión estática |
| R4 | Rutas API con lógica que solo funciona con cookies | Adaptador Bearer (§5.2) + test por ruta |
| R5 | Rendimiento en gama baja (público escolar) | Presupuesto: arranque en frío < 2,5 s en un equipo de gama baja, 60 fps en el sprint; perfilar desde Fase 2 |
| R6 | Tamaño de la descarga | Objetivo < 40 MB de AAB; mapas y lottie comprimidos; fuentes solo con los pesos usados |
