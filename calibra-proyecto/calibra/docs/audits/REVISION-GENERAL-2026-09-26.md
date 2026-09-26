# REVISIÓN GENERAL — Seguridad, diseño, docs y repo (2026-09-26)

> Sesión de **solo lectura + documentación**. Cero cambios de código o migraciones.
> Método: lectura de `docs/` (PROGRESO, PROJECT-STATE, TECH-DEBT, ARCHITECTURE, DECISIONS, audits,
> marketing, plan de negocio), de `.opencode/agents/`, de la raíz del repo y verificación puntual
> contra el código real (`src/`, `supabase/migrations/0001→0240`, `supabase/functions/`, `android/`).
> Estados según `docs/AGENT-RULES.md` §1.
> Complemento: el plan de la app Android nativa está en `docs/app-nativa/`.

## Resumen

El producto es grande y maduro para una fase cerrada: 13 mundos, 240 migraciones, ~525 `.tsx`,
~350 módulos de lógica en `src/lib` con 92 archivos de test, economía server-authoritative en casi
todo. Lo que más preocupa **no es la arquitectura**, sino cuatro cosas:

1. **Una API key de un tercero está versionada y subida a GitHub.**
2. **El crítico S5 ("doble o nada" farmeable) sigue abierto** 240 migraciones después.
3. **Casino/ruleta + Chispas compradas con dinero real + público de 8-15 años**: riesgo legal y de
   rechazo en Google Play, con un gate de edad que solo existe en la UI.
4. **Los docs de estado quedaron congelados en la migración ~0128 / 8 mundos**, y los agentes leen
   instrucciones contradictorias (rioplatense vs neutro, Capacitor, "no hay git").

---

## 1. Seguridad

| # | Sev. | Hallazgo | Evidencia | Estado | Acción recomendada |
|---|---|---|---|---|---|
| SEG-01 | **CRÍTICO** | API key de **fal.ai** en texto plano dentro de `opencode.json`, **trackeado en git** y con remoto en GitHub (`jjacobolalvarez34-rgb/Prodigia`). Quien vea el repo puede generar imágenes/video a tu costo. | `calibra-proyecto/opencode.json:9` (header `Authorization: Bearer c3cb…`); `git ls-files` lo lista; entró en commit `0299457` | CONFIRMADO | 1) **Revocar/rotar la key hoy** en el panel de fal.ai (es lo único que realmente cierra el hueco). 2) Reemplazar por `"Authorization": "Bearer {env:FAL_KEY}"` (opencode soporta sustitución `{env:VAR}`). 3) Agregar `opencode.json` o su versión con secreto a `.gitignore`. 4) Opcional: purgar historia con `git filter-repo` (solo si el repo es público; si no, con rotar alcanza). |
| SEG-02 | **CRÍTICO** | **S5 sigue vigente**: `resolver_apuesta_si_activa(p_precision)` confía en la precisión que manda el cliente y está grantada a `authenticated` → apostar 200 y resolver con `p_precision = 2` gana siempre, sin tope diario. | Último `grant ... to authenticated`: `0129:1253`; recreada en `0136` (conserva el grant); ningún `revoke` en 0137→0240 | VERIFICADO POR CÓDIGO | Migración nueva: `revoke execute ... from authenticated`; resolver solo desde las rutas finish con precisión **derivada de `attempts` en la DB**; tope diario de ciclos. Detalle ya escrito en `SECURITY-BASIC-AUDIT.md` §Riesgos 1. |
| SEG-03 | **ALTO** | El gate de edad de la Trastienda (< 14) vive **solo en la página**. Ninguna RPC de casino/ruleta/volado/apuestas mira `edad_ingresada`. Además `edad_ingresada = null` (quien nunca respondió) **pasa como adulto**. Un menor puede llamar las RPC directo con su sesión. | `src/app/[locale]/trastienda/page.tsx:31`; `0157_edad_y_gate_trastienda.sql` solo agrega columna + `guardar_edad_usuario` | VERIFICADO POR CÓDIGO | Helper SQL `puede_usar_trastienda(auth.uid())` llamado al inicio de **cada** RPC de Trastienda; `null` = bloqueado. Revisar el umbral (ver PROD-01). |
| SEG-04 | MEDIO | **S9 sigue vigente**: las 3 Edge Functions (`notify-duelo`, `notify-clan-mensaje`, `racha-en-riesgo`) solo miran el header `x-supabase-event`, que cualquiera puede mandar. Permite disparar pushes arbitrarios (spam a usuarios). | `supabase/functions/notify-duelo/index.ts:33-39`; ninguna valida secreto | VERIFICADO POR CÓDIGO | Header secreto compartido (`x-webhook-secret`) configurado en el Database Webhook y comparado en tiempo constante; `racha-en-riesgo` solo invocable por el cron con ese secreto. |
| SEG-05 | MEDIO | `/api/leads-colegios` es público, sin rate limit, sin captcha y sin límite de largo en `mensaje`/`telefono`. Vector de spam/relleno de tabla. | `src/app/api/leads-colegios/route.ts` | VERIFICADO POR CÓDIGO | Cloudflare Turnstile (gratis) + honeypot + `char_length` en la tabla + límite por IP. |
| SEG-06 | MEDIO | No hay headers de seguridad propios (CSP, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). `next.config.ts` no define `headers()`. | `next.config.ts` | VERIFICADO POR CÓDIGO | Agregar `headers()` en `next.config.ts`. Empezar con CSP en modo `Report-Only` para no romper KaTeX/Paddle. |
| SEG-07 | MEDIO | Sin rate limiting en rutas API de economía/social (solo existe a nivel DB para mensajes: 20/min). | grep sin resultados de `ratelimit` en `src/` | VERIFICADO POR CÓDIGO | Límite por usuario en el `proxy.ts` o en las RPC (patrón ya usado en `enviar_mensaje_directo`). |
| SEG-08 | BAJO | T-01/T-02 (tablas de Trastienda sin RLS protegidas solo por falta de grants), T-03 (volado sin tope diario), T-04 (reset de límites diarios que arrastra el día anterior). Ninguno corregido. | `SECURITY-BASIC-AUDIT.md`; grep 0137→0240 sin `enable row level security` para esas tablas | VERIFICADO POR CÓDIGO | Una sola migración "higiene Trastienda". |
| SEG-09 | ALTO (proceso) | **No hay registro confiable de qué migraciones están aplicadas en producción.** Se pegan a mano en el SQL Editor; ya causó incidentes reales (0120 falló, 0129 re-ejecutada, 0 XP en producción). PROGRESO dice que 0163→0194 "siguen sin correrse". | `PROGRESO.md` entradas 2026-09-09 y 2026-09-21 | CONFIRMADO (por historial) | Pasar a **Supabase CLI** (`supabase link` + `supabase db push`): guarda historial en `supabase_migrations.schema_migrations` y no re-ejecuta lo aplicado. Hacer primero un `supabase db diff` para reconciliar. |

## 2. Producto, legal y políticas de tiendas

| # | Sev. | Hallazgo | Evidencia | Acción |
|---|---|---|---|---|
| PROD-01 | **ALTO** | **Juego de azar simulado + moneda comprable con dinero real + público infantil.** Las Chispas se compran vía Paddle (`chispas_1000…15000`) y se apuestan en casino/ruleta/volado. El público primario documentado es 8-15 años. Esto es exactamente lo que regulan las leyes de loot boxes (Bélgica, Países Bajos, etc.) y la **política de Familias de Google Play** (prohíbe azar simulado en apps dirigidas a niños). También sube la clasificación IARC/PEGI. | `src/lib/pagos/paddle.ts:29-32`; `0121`/`0127` (casino); `docs/marketing/AUDIENCE.md` Seg 1 | Decisión de PO. Recomendación: **(a)** la app Android v1 sale **sin Trastienda** (flag por plataforma), **(b)** en web, Trastienda solo 18+ con verificación server-side, **(c)** si se quiere conservar: moneda separada **no comprable** ("fichas") solo ganable jugando. |
| PROD-02 | ALTO | Mensajería directa y chat de clan entre usuarios que pueden ser menores. Hay filtro de palabras, reportes y rate limit (bien), pero no hay restricción por edad ni control parental, y el README todavía dice "sin chat, para no necesitar moderación". | `0092_chat_de_clan.sql`, `0198_mensajes_directos.sql` | Menores de 13: chat desactivado o solo frases predefinidas; bloqueo de usuario (no solo reporte); panel de moderación para reportes. |
| PROD-03 | MEDIO | Pagos: en la app de Android, los bienes digitales (Pro, Chispas) deben cobrarse con **Google Play Billing** (salvo programas de facturación alternativa por región). Paddle sirve para web, no para la app de Play. | `src/lib/pagos/` | Ver `docs/app-nativa/05-PUBLICACION-GOOGLE-PLAY.md`. |
| PROD-05 | MEDIO | Avatares y fondos de perfil son **imágenes y GIF subidos por usuarios**, públicos y visibles para menores. Buckets con límite de tamaño/tipo (bien) y reporte de usuario (0040), pero sin "reportar imagen", sin cola de revisión ni ocultado automático. Play exige moderación del contenido de usuarios. | `0039_avatares.sql:27`, `0143:268`, `0040` | "Reportar imagen" + ocultar tras N reportes hasta revisión + panel de moderación. Ver `docs/app-nativa/02-SISTEMA-VISUAL.md` §10.5. |
| PROD-04 | BAJO | La app Capacitor actual (`capacitor.config.ts`) es un contenedor que carga `prodigia-sandy.vercel.app` en vivo. Google Play suele rechazar "webviews de un sitio" por la política de funcionalidad mínima; y sin red no abre. | `capacitor.config.ts` | Se reemplaza por la app nativa (ver `docs/app-nativa/`). |

## 3. Diseño y UX (web actual)

Verificado en código y en las capturas de `docs/marketing/assets/pantallas-*`.

| # | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|
| UX-01 | **Navegación de escritorio en móvil**: header con 6 links (Ranking, Rankeds, Social, Clanes, Tienda, Pro) que en pantallas angostas se desplaza horizontalmente con la barra oculta. No hay barra inferior. | `src/components/Header.tsx:120-125`; `globals.css` `.sin-scrollbar` | Barra inferior de 5 pestañas en móvil (misma IA propuesta para la app nativa, ver `03-PANTALLAS-Y-NAVEGACION.md`). |
| UX-02 | **Home = lista de 13 tarjetas de mundo en una columna** en móvil, sin jerarquía ("continuar donde quedaste", meta del día). Los colores están hardcodeados en `page.tsx` aunque existe el catálogo `src/lib/mundos.ts`. | `src/app/[locale]/page.tsx:160-270` | Home orientado a "hoy" + mundos como carrusel/mapa; iterar `MUNDOS` en vez de 13 bloques a mano. |
| UX-03 | El sprint usa `<input type="number">` con flechitas del navegador; en el celular abre el teclado del sistema y tapa la mitad de la pantalla. | captura `23-demo-numeria-sprint.png` | Teclado numérico propio, grande, con feedback háptico (web y nativa). |
| UX-04 | Sigue sin toast global (errores silenciosos), "Salir" sin confirmación y Ajustes sin sección Cuenta (P0/P1 de `UX-AUDIT.md`, todos abiertos). | `ProfileMenu.tsx:66-71`; `AjustesClient.tsx` (103 líneas); ningún `Toast` fuera de mensajes | Resolver antes de portar pantallas a nativo (si no, se portan los mismos huecos). |
| UX-05 | Los anuncios de novedades se apilan como modal bloqueante al entrar ("Siguiente (3 más)"). Fricción en el momento de mayor intención (abrir la app para jugar). | captura `10-home-principal.png` | Bandeja de "Novedades" con badge; como máximo 1 modal por semana. |
| UX-06 | Estética actual: limpia y calma (crema `#fdfbf7` por defecto, poco movimiento dentro del juego). Se siente "app de estudio", no "juego". | capturas | Para la app nativa: dark-first, botones con volumen, celebraciones en cascada (ver `02-SISTEMA-VISUAL.md`). |
| UX-07 | Mezcla de ~80 emojis decorativos con 28 íconos SVG propios; en Android los emojis se ven distintos según fabricante. | `VISUAL-CONSISTENCY-AUDIT.md` | En nativo: set de íconos propio (SVG) para todo lo funcional; emoji solo en texto de usuario. |
| UX-09 | En la Placa de perfil, sobre fondos GIF con mucho detalle se pierden textos ("1304 ELO", "Color de tu nombre"), y los controles de edición ("Cambiar foto", "Editar", selector de color) están mezclados con lo que ven los demás. **La personalización se mantiene completa** (decisión PO); solo se propone velo de legibilidad y separar ver de editar. | captura del perfil del PO (2026-09-26); `perfil/page.tsx` | `docs/app-nativa/02-SISTEMA-VISUAL.md` §10.3 |
| UX-08 | Faltan assets de rango `platino` y `prodigio` (existen `bronce/plata/oro/diamante`). | `public/rangos/` | Encargar los 2 faltantes junto con los assets de la app. |

## 4. Documentación

| # | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|
| DOC-01 | Docs de estado **congelados**: `PROJECT-STATE.md` (2026-09-08, migración 0120, 8 mundos), `TECH-DEBT.md` y `ARCHITECTURE.md` (rango 0001→0128). El código tiene **13 mundos y 240 migraciones**. | encabezados de esos archivos; `ls supabase/migrations` | Reescribir `PROJECT-STATE.md` como foto actual (1 página) y marcar el resto como histórico. |
| DOC-02 | **Instrucciones contradictorias para agentes**: `AGENTS.md` dice "Español rioplatense (vos)", "siguiente migración tras 0114" y "Capacitor (Android)"; `TERMINOLOGY.md` manda español neutro (tú). `BRAND.md` §Voz también dice rioplatense y lista 8 mundos. `PROJECT-STATE.md` dice "no hay git". | `AGENTS.md` §1; `docs/marketing/BRAND.md` §Voz | Corregir `AGENTS.md` y `BRAND.md` primero: son lo que lee cada agente al arrancar. |
| DOC-03 | READMEs desactualizados: el de la raíz habla de 3 mundos y magic link; `calibra/README.md` dice Next 15 y "correr solo `0001_init.sql`". | `README.md`, `calibra-proyecto/calibra/README.md` | Un solo README real con cómo levantar + `supabase db push`. |
| DOC-04 | `PROGRESO.md` (4025 líneas, 269 KB) y `PARIDAD_MUNDOS.md` (278 KB) ya no entran cómodos en el contexto de un agente; se leen parciales y se pierden decisiones. | `wc` | Archivar por mes (`docs/historial/2026-09.md`) y dejar en PROGRESO solo índice + últimas 2 semanas. |
| DOC-05 | `ECONOMY.md` tiene 1 KB para una economía con tienda, Pro, Chispas compradas, casino, clanes y misiones. | `docs/economy/ECONOMY.md` | Consolidar fuentes y sumideros de Chispas en un solo doc (hace falta para balancear la app nativa). |

## 5. Higiene del repositorio

| # | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|
| REPO-01 | `calibra-proyecto/node_modules/` versionado (195 archivos de Playwright) y `__pycache__/`. | `git ls-files` | `.gitignore` en la raíz del repo + `git rm -r --cached`. |
| REPO-02 | Logs y volcados versionados: `dev-server.log` (62 KB), `dev.log`, `dev-err.log`, `page.html` (65 KB). | `git ls-files` | Ignorar `*.log` y borrar del índice. |
| REPO-03 | `calibra-proyecto/.claude/settings.local.json` versionado (es config local por máquina). | `git ls-files` | Ignorar `.claude/settings.local.json`. |
| REPO-04 | Estructura anidada `Prodigia/calibra-proyecto/calibra/` con un `package.json` suelto en el medio y la carpeta vacía `Prodigia-github/`. | árbol | Aprovechar el monorepo de la app nativa para aplanar (ver `01-STACK-Y-ARQUITECTURA.md` §4). |
| REPO-05 | 92 archivos de test pero **sin CI**: nada corre `tsc`/`lint`/`vitest` en cada push. | sin `.github/workflows` | GitHub Actions mínimo (tsc + vitest + lint); es barato y ataja regresiones de los agentes. |

---

## Orden sugerido (antes de empezar la app nativa)

1. **SEG-01** rotar key de fal.ai (minutos).
2. **SEG-09** Supabase CLI + reconciliar qué migraciones hay en prod (sin esto, todo lo demás es incierto).
3. **SEG-02, SEG-03, SEG-04, SEG-08** en 1-2 migraciones.
4. **PROD-01** decisión de PO sobre Trastienda (bloquea el diseño de la tienda en la app).
5. **DOC-01, DOC-02** para que los agentes trabajen con información correcta.
6. **REPO-01..05** junto con la creación del monorepo.
7. **UX-04** (toast, confirmación de salida, Ajustes > Cuenta) antes de portar pantallas.
