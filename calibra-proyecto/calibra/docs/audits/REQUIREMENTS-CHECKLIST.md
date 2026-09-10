# REQUIREMENTS-CHECKLIST — Calibra / Prodigia

Auditoría de requisitos que cruza las especificaciones y el marketing documentado contra el código real (frontend, funciones Supabase, migraciones y base de datos).

- Fecha de auditoría: 2026-09-09
- Alcance: `calibra/` (app Next.js + supabase)
- Método: verificación de código en repositorio, lectura de migraciones SQL y verificación funcional en navegador/web realizada en auditorías previas (`docs/audits/CASUAL-AUDIT-2026-09-08.md`, `docs/audits/INVITACION-LINK-AUDIT-2026-09-08.md`, `docs/audits/RETO-DIRECTO-AMIGO-2026-09-08.md`, `docs/audits/NIVELES`.md y `docs/audits/REAL-APP*.md`).
- Última migración analizada: `0128_espanol_neutro.sql`.

## Estados

| Estado | Significado |
|---|---|
| REAL | Implementado y verificado (navegador, E2E, test unitario o auditoría previa). Se indica el método. |
| IMPLEMENTADO | Presente en código, sin verificación funcional en vivo en esta auditoría. |
| PARCIAL | Implementado pero reducido, desactivado temporalmente o incompleto frente a la spec. |
| CONCEPTO FUTURO | Anunciado como "próximamente" o planificado, sin implementación. |
| FALTA | Debería existir según la spec/documento de diseño y no está en el código. |
| ELIMINADO POR DISEÑO | Existió y se removió a propósito por decisión de diseño documentada (ver PROGRESO/ACTIVE y el item). |

> Nota F7 (2026-09-09): filas numeradas 1-65; el "Total" del resumen fue re-computado al estado actual de la matriz.

## Resumen por estado

| Estado | Cantidad |
|---|---|
| REAL | 9 |
| IMPLEMENTADO | 50 |
| PARCIAL | 3 |
| CONCEPTO FUTURO | 2 |
| FALTA | 0 |
| ELIMINADO POR DISEÑO | 1 |
| **Total** | **65** |

## Matriz maestra

### Mundos y contenidos

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 1 | Catálogo de 8 mundos (slug, nombre, color, ícono) | REAL | `src/lib/mundos.ts:19-28`; `src/lib/mundos/precios.ts:13`; verificado en navegador (onboarding con 8 mundos, REAL-APP) | Verificar: la spec `docs/ESPECIFICACION.md` aún dice "5 mundos" (desactualizada). |
| 2 | Una ruta de práctica por cada mundo | IMPLEMENTADO | Rutas `[locale]/numeria/practica`, `/enigmia/practica`, `/geografia/practica/…`, `/quimia/practica/…`, `/anatomia/practica/…`, `/melodia/practica/…`, `/trigonometria/practica/…`, `/historia/practica/…` (glob) | Hub de selección de sub-tema existe vía `/temas` y rutas `/elegir`. Enigmia no precisa hub (un único destino). |
| 3 | Lecciones "Aprender" por mundo | IMPLEMENTADO | Rutas `[locale]/<mundo>/aprender` (glob) + `src/lib/aprender/`; migraciones `0018`, `0027`, `0062`, `0101` | |
| 4 | Diagnóstico inicial por mundo | PARCIAL | Existen `/enigmia/diagnostico`, `/quimia/diagnostico`, `/anatomia/diagnostico`, `/melodia/diagnostico`, `/trigonometria/diagnostico`, `/historia/diagnostico`, `/onboarding/diagnostico` (glob) | Geografía no tiene diagnóstico propio: arranca directo (ver `guard.ts` mundo numeria en diagnostico). |
| 5 | Generación procedural de problemas con deduplicación | REAL | `src/lib/practica/generarUnico.ts`; test vitest `problems.test.ts` | Método: test unitario. |
| 6 | Dificultad adaptativa por sub-tema 1–10 (+1 tras 3 aciertos, −1 al errar, escudo) | REAL | `src/lib/practica/skillLevels.ts:9-32` + `skillLevels.test.ts` (vitest); migración `0002`; verificado en navegador (diagnóstico arranca en nivel 1, REAL-APP) | El server recalcula el nivel (ver #7). |
| 7 | El server (no el cliente) fija la dificultad | REAL | `src/app/api/attempts/route.ts:118-125` (RPC `registrar_intento_moderna`); migración `0120` | |
| 8 | Anti-apuro: intentos sospechosamente rápidos no calibran ni dan XP | IMPLEMENTADO | `src/app/api/attempts/route.ts:17-20,59-62`; migración `0120` | |
| 9 | Un error no resta XP | REAL | `src/lib/practica/formulas.ts:30-34` + `formulas.test.ts` (vitest) | |
| 10 | Nivel de mundo 1–100 (3 ejes: volumen / dominio / lecciones) | IMPLEMENTADO | `src/lib/practica/worldLevel.ts` (pesos 0.34/0.45/0.21, techo 25000); migraciones `0033`, `0080`, `0117` | Nota: SQL actual usa 0.34/0.45/0.21 (`0117`) mientras `0080` usa 0.3/0.5/0.2. Marketing "50% dominio" coincide con `0080`, no con la fórmula vigente. |
| 11 | Nivel de cuenta personal + curva de XP y recompensas | IMPLEMENTADO | `src/lib/cuenta/niveles.ts` (espejo TS); migración `0118_niveles_cuenta_recompensas.sql` (RPC `xp_requerido_nivel_cuenta`) | |
| 12 | Escudos de calibración comprables (proteger nivel) | IMPLEMENTADO | `src/app/[locale]/tienda/TiendaClient.tsx` (compra escudo); `src/lib/tienda/costos.ts`; migración `0011` | |

### Rankeds, ELO y duelos

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 13 | Rankeds clasificatorio con ELO | IMPLEMENTADO | `src/app/[locale]/rankeds/page.tsx` + `RankedsClient.tsx`; migración `0016` | |
| 14 | 6 rangos ELO (Bronce → Prodigio) | IMPLEMENTADO | `src/types/database.ts:262-268` (RANGOS_ELO); migración `0043` | |
| 15 | K-factor por rango y ELO simétrico en series | IMPLEMENTADO | Migraciones `0072` (K por rango) y `0073` (K en series) | |
| 16 | Matchmaking con ventana progresiva de ELO (±15 → ±120) | IMPLEMENTADO | Migraciones `0031`, `0038`, `0043`, `0066`; polling `RankedsClient.tsx` (buscar_rival_duelo) | |
| 17 | Anti-smurf: desde Platino el rival solo se busca en "todas las ciudades" | IMPLEMENTADO | Migración `0078` | |
| 18 | Duels casuales separados del ELO | REAL | Migración `0050` (mis_stats_casual, duels casual no toca elo_rating); verificado E2E en navegador: `docs/audits/CASUAL-AUDIT-2026-09-08.md` (ELO 800→800 con 2 jugadores) | |
| 19 | Duelo asincrónico con "fantasma" del rival | IMPLEMENTADO | Migración `0028` (duelos_fantasma); `src/components/duelos/SprintRunner.tsx` replay | |
| 20 | Progreso del rival en vivo (realtime) | IMPLEMENTADO | Migración `0038`; `src/lib/duelos/useProgresoEnVivo.ts` (canal `duelo:<id>:vivo`); `ProgresoRivalEnVivo` | |
| 21 | Invitación a duelo por link (sin ser amigo) | IMPLEMENTADO | Migraciones `0059`, `0096`, `0109`; `src/app/[locale]/duelo/invitacion/[inviteId]/page.tsx:24` (RPC `unirse_invitacion_duelo`); `AmigosClient.tsx:196-212` (`crear_invitacion_duelo`); verificado en `docs/audits/INVITACION-LINK-AUDIT-2026-09-08.md` | |
| 22 | Retar a un amigo directo | IMPLEMENTADO | `src/app/api/amigos/retar/`; `RetarPicker`; verificado en `docs/audits/RETO-DIRECTO-AMIGO-2026-09-08.md` | |
| 23 | Rechazar duelo, rendirse y reclamar abandono | IMPLEMENTADO | Migración `0047` (rechazar duelo), `0088` (rendirse); APIs `rendirse`, `reclamar-abandono` | |

### Clanes

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 24 | Clanes de jugadores (crear/unirse/salir, roles fundador/guía/miembro, tag y estandarte) | IMPLEMENTADO | Migraciones `0068`, `0070`; `src/app/[locale]/clanes/page.tsx` + `ClanesClient.tsx` | |
| 25 | Misiones semanales de clan con recompensa en Chispas | IMPLEMENTADO | Migración `0068` (tabla `clan_misiones`, `asegurar_mision_semanal`); `ClanesClient.tsx` | |
| 26 | Guerra de clanes semanal + cierre | IMPLEMENTADO | Migraciones `0076`, `0077` (`rival_de_clan`, `procesar_cierre_semana_clanes`); `clanes/page.tsx:20` | |
| 27 | Nivel de clan y XP aportado | IMPLEMENTADO | Migración `0070` + `0118` (`xp_aportado`, `xp_requerido_nivel_clan`) | |
| 28 | Chat de clan con rate-limit y push | IMPLEMENTADO | Migraciones `0092`, `0100`; Edge function `notify-clan-mensaje` | En `ReportarBoton.tsx` se reportan mensajes de clan (`reportar_mensaje_clan`). |

### Retos

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 29 | Reto diario: 5 preguntas iguales para todos (semilla por fecha) | REAL | `src/lib/retoDiario.ts` (generador deterministico por fecha) + `retoDiario.test.ts` (vitest); `src/app/[locale]/reto-diario/page.tsx`; migración `0024`; verificado en navegador (REAL-APP) | |
| 30 | Reto semanal: 45 preguntas iguales + ranking | IMPLEMENTADO | `src/app/[locale]/reto-semanal/page.tsx` (45 preguntas, lunesDeEstaSemanaIso); migraciones `0095`, `0113` (RPC `completar_reto_semanal` en `0113:84`, `ranking_reto_semanal` en `0113:151`); API `src/app/api/reto-semanal/completar/route.ts` | Falta verificación funcional en navegador del reto semanal (el generator está cubierto por el test unitario del diario). |
| 31 | Ranking público del reto (diario/semanal) | IMPLEMENTADO | Migración `0113` (`ranking_reto_diario`, `ranking_reto_semanal`); `RetoClient` | |
| 32 | Racha de retos y títulos de constancia | IMPLEMENTADO | `src/lib/titulos/catalogo.ts` (criterio `retos-consecutivos-7/30`); `src/lib/titulos/verificar.ts` | |

### Logros y títulos

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 33 | Sistema de logros (frecuencia, precisión, rachas) | IMPLEMENTADO | Migración `0010`; `src/lib/logros/verificar.ts`; verificación al cerrar duelos (`src/app/api/duelos/resultado/route.ts:50`) y al completar reto semanal (`src/app/api/reto-semanal/completar/route.ts:31-35`) | |
| 34 | Título junto al nombre + catálogo por mundo y por Trastienda | IMPLEMENTADO | Migración `0044` (título en duelo/perfil); `0113` (`titulos_trastienda_base`); `src/lib/titulos/catalogo.ts` + `verificar.ts` | Desde `0123` el premio "título" de la ruleta entrega un título real (ya no escudo placeholder). Son 8 títulos Trastienda (`catalogo.ts:107-116`); falta `gniñardo` (Mitológico, PENDIENTE-DECISIÓN). |

### Economía, tienda y Trastienda

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 35 | Chispas como moneda permanente (XP ≠ Chispas) | IMPLEMENTADO | Migración `0009` (`registrar_xp_diario` security definer, `profiles.puntos_total`) | |
| 36 | Tienda: escudos, congelamientos, boost ×1.5, fuentes, marcos de rango, marcos por mundo, paquete | IMPLEMENTADO | `src/app/[locale]/tienda/TiendaClient.tsx`; `src/lib/tienda/costos.ts`; migraciones `0011`, `0025`, `0036` (`comprar_item_tienda`), `0054`, `0061`, `0075`, `0104`, `0107` | |
| 37 | Racha diaria con congelamientos comprables | IMPLEMENTADO | `src/lib/racha/congelamientos.ts`; migración `0011`; home aplica `aplicarCongelamientoSiHaceFalta` | |
| 38 | Apuesta "doble o nada" en práctica | IMPLEMENTADO | `src/app/api/tienda/apostar/` (`apostar_monto`, `umbral`); sección en `TrastiendaClient.tsx` | |
| 39 | Trastienda: apostar a partida ajena con odds por ELO | IMPLEMENTADO | Migración `0123` (`fetch_apuestas_disponibles`, `apostar_partida`, `preview_apuesta_partida`); `ApostarPartida.tsx` | |
| 40 | Trastienda: predicción de ranking semanal | IMPLEMENTADO | Migraciones `0123`/`0126` (`apostar_prediccion_ranking`, `ventana_predicciones`, `cobrar_predicciones_pendientes`); `PrediccionRanking.tsx` | |
| 41 | Trastienda: ruleta con EV < 1 y sistema "pity" | IMPLEMENTADO | Migración `0121`/`0126` (`girar_ruleta`); `src/lib/trastienda/ruleta.ts` (segmento 42% "nada", costo 120/150, límite 5 giros, pity); `src/components/trastienda/Ruleta.tsx` | **Nota F5:** la rueda clásica quedó LEGACY sin uso en UI; la ruleta visible es la mesa casino `0127` (118 elementos). |
| 42 | Trastienda: mesa de casino con elementos de la tabla periódica | IMPLEMENTADO | Migración `0127` (`apostar_casino_elementos`, 118 elementos); `src/lib/trastienda/casino.ts`; `Ruleta.tsx` (casino) | |
| 43 | Trastienda: minijuegos La Calcu, Volado y La Pizarra | IMPLEMENTADO | Migración `0124`; `src/components/trastienda/{LaCalcu.tsx,Volado.tsx,Pizarra.tsx}`; APIs `trastienda/{la-calcu,volado,pizarra}` | |
| 44 | Trastienda: minijuegos "Acertijos de Enigmia" y "El Reloj" | ELIMINADO POR DISEÑO | Se implementaron en `0124` y se removieron a propósito en `0126` (limpieza). Activos: La Calcu (+ Volado y Pizarra de 0121). | No son un gap: es decisión de diseño documentada en PROGRESO/ACTIVE y F5. |
| 45 | Trastienda: 8 títulos exclusivos | IMPLEMENTADO | `src/lib/titulos/catalogo.ts` (criterios Trastienda: apuestas ganadas, racha, payout, neto positivo); `0113` (SQL `titulos_trastienda_base`); `src/lib/titulos/verificar.ts` | |
| 46 | Historial de Trastienda | IMPLEMENTADO | `src/app/api/trastienda/historial/`; `src/components/trastienda/HistorialTrastienda.tsx` | |

### Cuenta, onboarding y PWA

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 47 | Onboarding: nombre + elegir 2 mundos gratis | REAL | `src/app/[locale]/onboarding/OnboardingForm.tsx` (RPC `elegir_mundos_iniciales`); `src/components/landing/FlujoElegirMundos.tsx:33-59`; migraciones `0112` + fix `0116`; guard exige `mundos_desbloqueados.length >= 2` (`src/lib/auth/guard.ts:37-39`); verificado en navegador (REAL-APP) | |
| 48 | Desbloquear mundos por Chispas (3000) + pantalla mundo bloqueado | IMPLEMENTADO | `src/lib/mundos/precios.ts:11` (PRECIO_MUNDO_CHISPAS=3000); migración `0097` (`desbloquear_mundo`); `src/app/[locale]/mundo-bloqueado/page.tsx` | |
| 49 | Invitado con acceso reducido (sin cuenta) | IMPLEMENTADO | `src/lib/auth/guard.ts` (`bloquearInvitado`); `src/lib/auth/accesoInvitado.ts` (`operacionPermitidaInvitado`); `src/app/api/attempts/route.ts:49-57` | |
| 50 | Rankeds desbloqueado por nivel de cuenta (nivel 5) | IMPLEMENTADO | `src/lib/auth/guard.ts` (`requireNivelCuentaRankeds`); `src/app/[locale]/rankeds-bloqueado/page.tsx` | |
| 51 | PWA: manifest + service worker + íconos maskable | IMPLEMENTADO | `src/app/manifest.ts:21-38` (convención Next 16, íconos any+maskable); `public/sw.js` (cache de estáticos); `src/components/RegistrarServiceWorker.tsx:9-10` | `sw.js` no incluye caché offline total (a propósito en comentario inicial). |
| 52 | Push nativas (Capacitor + FCM) | IMPLEMENTADO | `src/components/NativePush.tsx` (solo Capacitor, inerte en web); migración `0114` (`device_push_tokens`); Edge functions `notify-duelo`, `racha-en-riesgo`, `notify-clan-mensaje` con `_shared/fcm.ts` | Push no aplican a la web/PWA (solo app nativa). |
| 53 | Anuncios de administración | IMPLEMENTADO | `src/app/[locale]/admin/anuncios/`; migración `0065` | |

### Social, comunidad y perfil

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 54 | Feed de actividad social | PARCIAL | Código completo: `Feed.tsx`, `FeedSidebar.tsx`, APIs `api/feed/*` (crear-desafio, crear-problema-personalizado, reaccionar, responder-personalizado, retar), migraciones `0013`, `0052`, `0053` | DESACTIVADO temporalmente: `SocialClient.tsx:16-19` (sin selector, no navegable); `/feed` redirige a `/social` (`feed/page.tsx:7-8`). `social/page.tsx` sigue cargando todos los datos del feed. Plan completo de activación (PROPUESTA): `docs/audits/DUELOS-AUDIT.md` §2.4. |
| 55 | Amigos: solicitudes, lista y ranking de amigos | IMPLEMENTADO | `src/app/[locale]/amigos/AmigosClient.tsx`; APIs `api/amigos/{solicitar,responder,retar}`; migraciones `0021`, `0049` | |
| 56 | Grupos profesor–alumnos con código de invitación | IMPLEMENTADO | `src/app/[locale]/profesor/page.tsx` + `ProfesorClient.tsx`; APIs `api/profesor/{crear,unirse,borrar-grupo}`; migraciones `0014`, `0023`, `0055` | |
| 57 | Perfil público con estadísticas por mundo | IMPLEMENTADO | `src/app/[locale]/perfil/page.tsx` (conteos/rachas/títulos por mundo); migración `0105` | |
| 58 | Avatar con Storage, marcos y fuentes | IMPLEMENTADO | `src/components/SubirAvatar.tsx`; migración `0039` (bucket "avatares"); `AvatarConMarco` | |
| 59 | Reportes de usuario, post y mensaje de clan | IMPLEMENTADO | `src/components/ReportarBoton.tsx` (motivos + RPC `reportar_usuario`/`reportar_post`/`reportar_mensaje_clan`); migración `0040` | |
| 60 | Ranking global semanal + por mundo + amigos | IMPLEMENTADO | `src/app/[locale]/leaderboard/page.tsx` + `LeaderboardClient.tsx` (filtro total/mundo y global/amigos); RPC `ranking_semanal_filtrado`; migraciones `0006`, `0017`, `0029`, `0041`, `0042` | |

### Landing, demo y Pro

| # | Requisito | Estado | Evidencia | Notas / qué falta |
|---|---|---|---|---|
| 61 | Demos de los 8 mundos sin cuenta (`/demo/<mundo>`) | REAL | 8 rutas `src/app/[locale]/demo/<slug>/page.tsx` (numeria, enigmia, geografia, quimia, anatomia, melodia, trigonometria, historia) + `src/lib/mundos.ts:19-28`; verificado en navegador (REAL-APP: demo de 6 de 8 mundos jugadas) | Todas juegan sin cuenta (pre-guards, signInAnonymously); no abren el mundo completo. |
| 62 | Landing con flujo anónimo hasta elegir mundos | IMPLEMENTADO | `src/components/landing/VisitanteLanding.tsx:75-85` (signInAnonymously en flujo educacional); `FlujoElegirMundos.tsx:59` | |
| 63 | Tour de onboarding y tooltips | PARCIAL | `PrimeraVezTip` en `src/components/`; doc `docs/ESPECIFICACION.md:194` (tour desactivado) | Desactivado a propósito (histórico de bugs). |
| 64 | Prodigia Pro (plan de pago) | CONCEPTO FUTURO | `src/app/[locale]/pro/page.tsx:46-55` — botón "Próximamente", pantalla solo informativa, sin método de pago | Sin pasarela: Docs de marketing establecen no prometer fecha de pago (Stripe no cubre Colombia). |
| 65 | Geografía: "departamentos/estados/ríos" | CONCEPTO FUTURO | `docs/ESPECIFICACION.md` (marca ítem "próximamente") | Geografía actual cubre ciudades/climas/países. |

## Promesas de marketing sin respaldo pleno en código

Claims de `docs/marketing/PRODUCT-MESSAGING.md` (verificados contra el código):

| Claim | Estado | Detalle |
|---|---|---|
| "8 mundos con contenido escolar real" | VERIFICADO | `src/lib/mundos.ts:19-28` — 8 mundos en catálogo y rutas. |
| "Contenido procedural infinito" | VERIFICADO (matiz) | Deduplicación real en `generarUnico.ts`; Historio y Química orgánica tienen bancos finitos y por diseño. |
| "Ranking y retos justos: mismas preguntas para todos (reto diario/semanal)" | VERIFICADO | Semilla por fecha determinística (`retoDiario.ts` + test). |
| "Anticheat y ranking justo (sin presión no calibra)" | VERIFICADO | Server fija dificultad y filtra tiempo sospechoso (`attempts/route.ts:17-20`). |
| "Duelos en tiempo real" | VERIFICADO (matiz) | Realtime real solo cuando ambos jugadores están en línea (`useProgresoEnVivo.ts`); el modo principal es asincrónico con "fantasma". |
| "50% del nivel de mundo es tu dominio real" | NO CONFIRMADO EN CÓDIGO VIGENTE | La migración `0080` usa 0.3/0.5/0.2 (dominio = 50%); la vigente `0117` y `worldLevel.ts` usan 0.34/0.45/0.21 (dominio = 45%). |

## Pendientes, deuda y ambigüedades

1. `docs/marketing/PRODUCT-MESSAGING.md` repite el claim "50% dominio" que ya no coincide con la fórmula vigente (`0117`/`worldLevel.ts`). Decidir si se ajusta el marketing o la constante.
2. `docs/ESPECIFICACION.md` está desactualizada: menciona "5 mundos", rutas `/practica` obsoletas y un tour de onboarding desactivado.
3. ~~`docs/audits/TRASTIENDA-ECONOMIA.md` está marcado "PENDIENTE DE IMPLEMENTACIÓN" pero la Trastienda ya está implementada (migraciones `0121`–`0127`)~~ → **RESUELTO en F5 (2026-09-09):** header actualizado a IMPLEMENTADO + nota de divergencias; la auditoría completa de Tienda/Trastienda vive en `docs/audits/STORE-ECONOMY-AUDIT.md` (reemplaza/augmenta, ver §7 de ese doc).
4. Feed social: código completo y desactivado temporalmente (`SocialClient.tsx:16-19`). Reactivarlo cuando se decida su alcance final.
5. ~~`src/types/database.ts` aún define `MundoDuelo` con 3 mundos (inconsistencia menor frente a `src/lib/duelos/rutas.ts`, que usa los 8)~~ → **RESUELTO en F7 (2026-09-09):** `Mundo` y `MundoDuelo` alineados a los 8 mundos (`database.ts:38`, `:328`); sin importadores, cambio riesgo-cero. Ver `docs/audits/RANKEDS-AUDIT.md` (D-01).
6. Diagnóstico: Geografía no tiene diagnóstico propio; la especificación no lo exige explícitamente, pero difiere del patrón del resto de mundos.