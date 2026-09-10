# FUNCION-VS-MARKETING — Auditoría de promesa vs producto real (F12)

> Fecha: 2026-09-09 · Agente: orchestrator · Método: lectura de código fuente + docs marketing (sin navegador/DB/tunnel).
> Estados usados: VERIFICADO EN CÓDIGO · PROPUESTA · BLOQUEADO · PENDIENTE-USUARIO · NO PUEDO VERIFICAR.
> Nota: todo citado con file:line. La fórmula de nivel de mundo fue verificada como DESACTUALIZADA en 4 docs independientes.

## 1. Matriz PROMESA → REALIDAD

| # | CLAIM (lo que se promete) | FUENTE doc | REALIDAD en código | Veredicto | Recomendación |
|---|---|---|---|---|---|
| 1 | **8 mundos de contenido** | `docs/marketing/AD-CONCEPTS.md:39`, `AUDIENCE.md:8`, `REAL-APP-2026-09-08.md` | `src/lib/mundos.ts:19-28` (8 slugs) + `worldLevel.ts:3-12` (8 entries) + home `page.tsx:166-229` (8 WorldCards) | ✅ VERDADERO | Ninguna — la realidad supera la promesa (8 mundos reales). |
| 2 | **Dificultad adaptativa (sube/baja por aciertos)** | `PRODUCT-MESSAGING.md:15-21`, `AD-CONCEPTS.md:46-51` | `skillLevels.ts:9-32` (+1 tras 3 aciertos, −1 ante error); `attempts/route.ts:87-138` (server-only); `formulas.ts:1-34` (error no resta XP) | ✅ VERDADERO | Copy fiel al producto. |
| 3 | **Jugable sin cuenta / gratis sin registro** | `es.json:477` ("Empieza gratis, sin crear cuenta"); `es.json:486,496` | `VisitanteLanding.tsx:80-92` (signInAnonymously → `/demo/[mundo]`); `demo/*/page.tsx` (8 demos sin guards, solo requiere sesión anónima) | ✅ VERDADERO | Copy coherente. La app crea sesión anónima invisible — el usuario "juega gratis" sin darse cuenta de que técnicamente hay una sesión. Copy correcto. |
| 4 | **10 preguntas en 60 segundos** | `es.json:500`, `PRODUCT-MESSAGING.md:73` | `mecanismo.titulo` + SprintRunner con 60s countdown | ✅ VERDADERO | Ninguna. |
| 5 | **2 mundos gratis para siempre + resto con Chispas (3.000)** | `AD-CONCEPTS.md:38-44`, `es.json` | `guard.ts:37` (≥2 mundos para saltar onboarding) + `precios.ts:11` (PRECIO_MUNDO_CHISPAS=3000) + `elegir_mundos_iniciales` RPC | ✅ VERDADERO | Copy más fuerte que la realidad: "para siempre" es correcto (Chispas nunca bajan). |
| 6 | **Reto diario 5 preguntas / semanal 45** | `PRODUCT-MESSAGING.md:34-38`, `AD-CONCEPTS.md:31-36` | `reto-diario/page.tsx:11` (5) + `reto-semanal/page.tsx:11` (45) + `retoDiario.ts:204-208` (semilla por fecha) | ✅ VERDADERO | Copy exacto. |
| 7 | **Ranking semanal público** | `es.json:506` ("comparás tu progreso con el resto") | `leaderboard/page.tsx:22` (`ranking_semanal_filtrado` RPC) + `CountdownSemanal` | ✅ VERDADERO | Copy correcto. |
| 8 | **Rankeds competitivos con ELO y rango** | `es.json:4-21`, `AD-CONCEPTS.md:71-75` | `rankeds/page.tsx:21-22` (`bloquearInvitado` + `requireNivelCuentaRankeds`) + `guard.ts:184` (nivel_cuenta ≥ 5) + `RankingElo` | ✅ VERDADERO | Requiere nivel 5 de cuenta para acceder (gate real en `guard.ts:184-189`). Copy no menciona esto explícitamente — users de nivel bajo se sorprenden al no poder entrar. PROPUESTA: matizar copy con "Disponible a partir del nivel 5". |
| 9 | **Duelos en tiempo real con fantasma** | `PRODUCT-MESSAGING.md:45-49`, `AD-CONCEPTS.md:17-22` | `useProgresoEnVivo.ts` (Supabase broadcast), `ProgresoRivalEnVivo.tsx`, `0028_duelos_fantasma.sql`, `PantallaVS.tsx` | ✅ VERDADERO | El "en vivo" se refiere a broadcast de Supabase (progreso en tiempo real), no a una partida compartida en tiempo real — son asincrónicos (`ESPECIFICACION.md:98`). Copy de "en vivo" es correcto para el fantasma. |
| 10 | **Duelo amistoso (reto a amigo)** | Especificación implícita en `AUDIENCE.md:14` y `ESPECIFICACION.md:99` | `useRetosPendientes.ts` + `reto-directo-amigo` (T10 audit confirmado) + `RetoPendienteBase` en RankedsClient | ✅ VERDADERO | Mecánica existe vía retos pendientes (no un "duelo amistoso" separado con su propia UI — se integra en rankeds). Copy correcto. |
| 11 | **Clanes con guerra semanal** | `es.json:508`, `AD-CONCEPTS.md:77-81` | `clanes/page.tsx` + `ClanesClient.tsx:196-222` + `0070` (guerra) | ✅ VERDADERO | Existe. Nota: guerra semanal tiene 2 bugs conocidos (`0070:614`, `BROWSER-TESTING-PLAN`). |
| 12 | **Feed social de actividad** | `AUDIENCE.md:31` ("feed social" como diferencial), `ESPECIFICACION.md:101` | `SocialClient.tsx:16-19` (**desactivado**, Fase 8); `/feed` → redirect a `/social` (`feed/page.tsx:7-8`); posts se cargan pero no se renderizan | ❌ FALSO (desactivado) | **NO publicitar feed social como feature viva.** Recomendación: "Activar (PROPUESTA)" si se decide relanzar, o "quitar del marketing" hasta que se reactive. Ver §3. |
| 13 | **Tour guiado de onboarding** | `es.json:490` ("tutorial guiado de 2 minutos") | `Header.tsx:27-31` (tour **desactivado**, prop `mostrarTour` sin efecto); `PrimeraVezTip.tsx:TOUR_KEY` existe como tip ligero | ⚠️ PARCIAL | Hay tips de primera vez (`PrimeraVezTip`), pero NO un tour guiado interactivo. Copy de "tutorial guiado de 2 minutos" es impreciso: lo que hay es un tutorial de elección de mundo (VisitanteLanding paso "ciudad" → "mecanismo") que dura ~30 segundos, no un tour guiado. PROPUESTA: "Hacé un tutorial rápido de 30 segundos" o quitar "guiado". |
| 14 | **Pro (suscripción premium)** | `es.json:514` ("Prodigia Pro", landing); `AD-CONCEPTS.md:92` (P3, NO publicitar) | `pro/page.tsx:12-16` (solo informativa, button `disabled`); `beneficios.ts` (lista de beneficios sin pago) | ⚠️ PARCIAL | La pantalla existe y muestra beneficios futuros, pero NO hay flujo de pago. No publicitar "Comprá Pro". El copy "Y cuando quieras, Prodigia Pro" (`es.json:514`) es correcto (dice "cuando quieras", futuro). |
| 15 | **Nivel de mundo = 50% dominio real** | `PRODUCT-MESSAGING.md:52,55`, `AD-CONCEPTS.md:90`, `ESPECIFICACION.md:88` | `worldLevel.ts:46-49`: PESO_VOLUMEN=0.34, PESO_DOMINIO=0.45, PESO_LECCIONES=0.21; vigente desde `0117` + `0125` | ❌ FALSO (fórmula vieja) | Corregir copy: la realidad es **45% dominio / 34% volumen / 21% lecciones**. "50% dominio" es obsoleto. La realidad es MEJOR que lo prometido (dominio real sigue siendo el eje más pesado). PROPUESTA: corregir copy a "casi la mitad del nivel de mundo es tu dominio real de cada tema" (verdad matemática: 45%). |
| 16 | **Diagnóstico gratis que mide tu nivel** | `AD-CONCEPTS.md:99` (regla anti-mentira) + `PRODUCT-MESSAGING.md:62` | `onboarding/page.tsx:30-33` (onboarding es nombre + 2 mundos gratis, NO mide nivel); diagnóstico por mundo SÍ existe (7 pantallas, una por mundo) | ⚠️ PARCIAL | El diagnóstico por mundo sí mide nivel inicial (`diagnosticoClient`). El onboarding inicial NO. Si el marketing dice "diagnóstico que mide tu nivel" refiriéndose al onboarding → es falso. Si se refiere al diagnóstico por mundo → es verdadero. VERIFICAR qué dice el copy exacto del marketing. |
| 17 | **Casino / trastienda** | `es.json:237,253,286,398` ("ruleta casino", "duelos en vivo", "predicción") | `trastienda/page.tsx` (existe) + `TrastiendaClient.tsx` + APIs (`casino/route.ts`, `volado/route.ts`, `apuestas/route.ts`, `predicciones/route.ts`, `pizarra/route.ts`) | ✅ VERDADERO | La trastienda y el casino están conectados (M4 0127). La ruleta, el volado y las apuestas existen. Nota: la trastienda NO aparece en el nav principal del Header (solo `/tienda` sí). |
| 18 | **PWA instalable** | No hay claim explícito de "PWA" en docs marketing; es un feature técnico | `manifest.ts:21-38` (PWA manifest con iconos any+maskable); `sw.js` (service worker mínimo, cache-first solo estáticos); `RegistrarServiceWorker.tsx` | ⚠️ PARCIAL | La app ES instalable como PWA (manifest + service worker). Pero: (a) NO funciona offline (sw.js:6 explícito: "NADA de modo offline completo"); (b) la instalación no se publicita. Si se publicita "PWA instalable", matizar con "funciona online" o "instalable en tu celular". |
| 19 | **Multiplataforma (web + Android)** | No hay claim explícito de "multiplataforma" en docs marketing | `capacitor.config.ts:3-24` (Android vía Capacitor, webDir: 'out', carga URL de Vercel); `NativePush.tsx:4` (solo Capacitor) | ⚠️ PARCIAL | Existe APK nativa vía Capacitor (solo Android, no iOS). Si se publicita "multiplataforma", matizar con "Android" o "web + Android". |
| 20 | **Práctica de 21 min/día** | NO encontrado en ningún doc de marketing ni en `messages/` | No hay claim de "21 min/día" en el código ni docs | ❌ NO EXISTE como claim | No publicitar si no existe como claim. Verificar en piezas de anuncio (capturas) si hay un claim de este tipo. |
| 21 | **Chispas permanentes (nunca bajan)** | `PRODUCT-MESSAGING.md:77` | `profiles.puntos_total` (acumula con `registrar_xp_diario`, RPC security definer) | ✅ VERDADERO | Copy correcto. |
| 22 | **Escudos que protegen nivel** | `es.json`, `AD-CONCEPTS.md:83-84` | `skillLevels.ts:9-32` (escudo evita bajar nivel, resetea racha) + `tienda/costos.ts` (comprable) | ✅ VERDADERO | Copy correcto. |
| 23 | **Racha diaria / congelamientos** | `es.json`, `AD-CONCEPTS.md:83-84` | `daily_progress` + `streak_dias` + `congelamientos_disponibles` (comprable en tienda) | ✅ VERDADERO | Copy correcto. |
| 24 | **Ajuste de dificultad "sin presión" / "errores no restan"** | `PRODUCT-MESSAGING.md:19`, `es.json` | `formulas.ts:1-34` (error solo no suma, no resta) + copy "No pasa nada, así se aprende" | ✅ VERDADERO | Copy coherente con el producto. |

## 2. Conteo y TOP claims dañinos

| Veredicto | Cantidad |
|---|---|
| ✅ VERDADERO | 17 |
| ⚠️ PARCIAL | 5 (#13, #14, #16, #18, #19) |
| ❌ FALSO | 2 (#11 feed desactivado, #15 fórmula vieja) |
| ❌ NO EXISTE | 1 (#20 — "21 min/día" no es claim del proyecto) |

**TOP claims dañinos (riesgo de desconfianza del usuario):**

1. **#15 — "50% dominio"** (falso, fórmula vieja): aparece en 4 docs (`PRODUCT-MESSAGING.md:52,55`, `AD-CONCEPTS.md:90`, `ESPECIFICACION.md:88`). La realidad es 45%. Impacto bajo en el usuario final (no ve %), pero alto si se publica en anuncio.
2. **#11 — "Feed social"** (desactivado): `AUDIENCE.md:31` lo vende como diferencial. Si se publicita → el usuario busca algo que no existe.
3. **#13 — "Tutorial guiado de 2 minutos"** (impreciso): el tutorial real es ~30s de elección de mundo, no un tour guiado.
4. **#16 — "Diagnóstico que mide tu nivel"** (ambiguo): el onboarding NO mide; el diagnóstico por mundo SÍ. Riesgo de confusión si se refiere al onboarding.

## 3. Temas transversales

### (a) Feed social prometido vs desactivado
- **Promesa:** `AUDIENCE.md:31` vende "feed social" como diferencial del Seg 5.
- **Realidad:** `SocialClient.tsx:16-19` — desactivado (Fase 8). `/feed` → redirect a `/social` (`feed/page.tsx:7-8`). Los posts se cargan pero no se renderizan.
- **Recomendación clara:** Quitar "feed social" de TODOS los docs de marketing hasta su relanzamiento. No es un "propuesta" — es un feature desactivado que NO debe prometerse. Si se decide reactivar, activar primero el componente (`SocialClient.tsx` línea 16-19) y luego volver a publicitar.

### (b) "Niveles/mundo 50%" vs fórmula real
- **Promesa:** "50% dominio" en `PRODUCT-MESSAGING.md:52,55`, `AD-CONCEPTS.md:90`, `ESPECIFICACION.md:88`.
- **Realidad:** `worldLevel.ts:46-49` — 45% dominio / 34% volumen / 21% lecciones (vigente desde `0117`).
- **Recomendación:** La realidad es MEJOR que lo prometido (dominio sigue siendo el eje más pesado). Actualizar copy a "casi la mitad" o "45% del nivel de mundo es tu dominio real". NO es urgente porque el claim de "dominio real" sigue siendo correcto en espíritu.

### (c) Pro: qué hace vs qué promete
- **En la app:** `pro/page.tsx:12-16` — pantalla informativa, botón `disabled`, sin flujo de pago.
- **En docs:** `AD-CONCEPTS.md:92` — P3, NO publicitar. `es.json:514` — "Y cuando quieras, Prodigia Pro" (futuro, correcto).
- **Recomendación:** El copy actual es correcto ("cuando quieras" implica futuro). No cambiar. Verificar que ningún anuncio diga "Comprá Pro" o "Únete a Pro".

### (d) Tour/onboarding de gratuidad
- **En la app:** `VisitanteLanding.tsx` — tutorial de 3 pasos (intro → ciudad → mecanismo) que dura ~30s. `Header.tsx:27-31` — tour guiado desactivado.
- **En docs:** `es.json:490` — "tutorial guiado de 2 minutos".
- **Recomendación:** El tutorial real es ~30 segundos, no 2 minutos. El "guiado" es ambiguo (hay pasos, pero no hay un cursor引导). PROPUESTA: corregir a "tutorial rápido de 30 segundos" o "hacé un tutorial corto".

### (e) Casino/trastienda: prometido y conectado
- **En la app:** `trastienda/page.tsx` + `TrastiendaClient.tsx` + APIs completas (`casino/route.ts`, `volado/route.ts`, `apuestas/route.ts`, `predicciones/route.ts`).
- **En docs:** `es.json:237,253,286,398` — "ruleta casino", "duelos en vivo", "predicción".
- **Nota:** La trastienda NO aparece en el nav del Header. Solo se accede directamente por URL (`/trastienda`). Si se publicita, hay que agregar link al nav o matizar.

### (f) PWA instalable y offline
- **En la app:** `manifest.ts` (PWA manifest), `sw.js` (cache-first solo `_next/static/*` + ícono), `RegistrarServiceWorker.tsx`.
- **Realidad:** ES instalable pero NO funciona offline (`sw.js:6`: "NADA de modo offline completo").
- **Recomendación:** Si se publicita "PWA", matizar con "instalable en tu celular" (sin decir "offline"). La app depende de Supabase en vivo para todo.

## 4. Cierres riesgo-cero aplicados

| # | Archivo | Cambio | Justificación |
|---|---|---|---|
| — | — | **Ninguno** | Todos los candidatos a cierre requieren decisión PO (corregir copy de "50% dominio" en docs de marketing → es marketing del PO, NO se reescribe; activar/quitar feed social → decisión de producto; corregir "tutorial guiado" → decisión de copy). No hay copy falso flagrante en la APP (messages/ es copy del PO). |

**Nota:** Los claims falsos (#15 fórmula, #11 feed) están en docs de marketing (no en messages/ de la app). La regla dice: "si MARKETING.MD tiene frases obsoletas, DEJALO documentado — NO lo reescribas (es marketing del PO)". Se documentan como hallazgos para que el PO decida.

## 5. Fórmula de nivel de mundo — hallazgo transversal (4 archivos afectados)

La fórmula vieja ("50% dominio") aparece en **4 archivos** que deben actualizarse cuando el PO lo decida:

| Archivo | Línea | Dato viejo | Dato real |
|---|---|---|---|
| `docs/marketing/PRODUCT-MESSAGING.md` | 52, 55 | "50% dominio + 30% volumen + 20% lecciones" | 45% dominio / 34% volumen / 21% lecciones |
| `docs/marketing/AD-CONCEPTS.md` | 90 | "50% dominio real de subtemas" | 45% |
| `docs/ESPECIFICACION.md` | 88 | "30% volumen… 50% fracción de sub-temas… 20% fracción de lecciones" | 34% / 45% / 21% |
| `docs/MARKETING.MD` | 8-9 | Lista solo 6 mundos (Numeria, Enigmia, Geografía, Quimia, Anatomía, Melodía) | 8 mundos reales (+ Trigonometría, Historia) |

**Realidad vigente** (`worldLevel.ts:46-49`):
- PESO_VOLUMEN = 0.34 (techo 25.000)
- PESO_DOMINIO = 0.45 (nivel 4-10 por subtema)
- PESO_LECCIONES = 0.21

## 6. Resumen ejecutivo para el PO

**Lo que la app promete y CUMPLE (17 claims):** 8 mundos, dificultad adaptativa, gratis sin cuenta, 10 preguntas/60s, 2 mundos gratis, retos diario/semanal, ranking, rankeds, duelos con fantasma, clanes, trastienda/casino, Chispas permanentes, escudos, racha, calibración sin presión.

**Lo que hay que CORREGIR (2 claims falsos):**
1. **Feed social**: desactivado en código. Quitar de marketing o activar.
2. **Fórmula "50% dominio"**: la realidad es 45%. Actualizar 4 docs cuando el PO lo decida.

**Lo que hay que MATIZAR (5 claims parciales):**
1. **Tutorial "guiado de 2 minutos"**: real ~30s, no guiado.
2. **Pro**: pantalla informativa, sin pago. Copy "cuando quieras" es correcto.
3. **Diagnóstico "mide tu nivel"**: el onboarding NO mida; el diagnóstico por mundo SÍ.
4. **PWA**: instalable pero sin offline.
5. **Multiplataforma**: solo Android vía Capacitor (no iOS).

**Lo que NO EXISTE como claim:** "21 min/día" — no encontrado en ningún doc ni en messages/.

## 7. Verificación

- **tsc/eslint/vitest:** no aplican (fase solo documentación; cero cambios de código).
- **Archivos tocados:** 0 (entregable es solo documentación).
- **Estado:** F12 CERRADO.
