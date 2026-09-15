# ACTIVE — Marketing (sistema de claims)

> Línea paralela de marketing. Registrar cada tarea según docs/agent-work/README.md (formato CLAIM/CIERRE).
> AGENTE · TAREA · FECHA · ARCHIVOS · HALLAZGOS · MATERIAL GENERADO · VERIFICACIÓN · SIGUIENTE PASO

## Tareas abiertas

| Estado | Tarea | Agente | Última actualización |
|---|---|---|---|
| HECHO | Estudio app real: diferenciales educativos | subagent general (educativo) | 2026-09-07 |
| HECHO | Estudio app real: gameplay/competitivo/social | subagent general (gameplay) | 2026-09-07 |
| HECHO | Estudio app real: landing/UX/visual | subagent general (visual) | 2026-09-07 |
| HECHO | 16 archivos de docs/marketing/ creados | orchestrator | 2026-09-07 |
| HECHO | Primer paquete publicitario (conceptos+prompts+copy) | orchestrator | 2026-09-07 |
| EN CURSO | Piezas visuales reales de la app con Playwright (browser AHORA DISPONIBLE: Chromium headless funcionando) + avanzar docs/marketing | marketing + visual-design | 2026-09-14 |
| HECHO (capturas CIERRE) | 30 capturas reales + REAL-APP doc + claims navegador | marketing + visual-design | 2026-09-08 |
| HECHO | F4 marketing: inventario + auditoría docs-vs-código (`docs/audits/MARKETING-AUDIT.md`) + 4 plantillas eje OSCURO (tokens dark reales) + plan de capturas | marketing/orchestrator | 2026-09-09 |
| EN CURSO | Piezas eje OSCURO: 5/8 capturas dark REALES en `assets/pantallas-oscuras/` (06/10/11/12/20) + swap automático hecho; faltan 01-04, 08, 23-30 (demos + landing + diagnóstico) | marketing | 2026-09-14 |
| PENDIENTE | Live research de competencia (revalidar HIPÓTESIS) | marketing | — |
| PENDIENTE | Priorización tabla P0-P3 final de conceptos | marketing | — |

## Log

### CLAIM: Lote de piezas nuevas (fal-ai BLOQUEADO) + re-render total · marketing · 2026-09-14
Estado: CIERRE. Solo `docs/marketing/assets/piezas/**` (HTML+PNG+README) y este log; sin tocar código de la app.

ACTIVIDAD:
1. Intentado generación con MCP fal-ai (video MiniMax H3 `minimax/h3-max/text-to-video` y imagen `fal-ai/nano-banana-2`): **BLOQUEADO** — API devuelve `403 "User is locked. Reason: Exhausted balance"` (balance agotado en fal.ai/dashboard/billing). No se generó nada por AI.
2. Ruta alternativa: 10 piezas publicitarias NUEVAS (7 claras + 3 oscuras) con el pipeline local `scripts/piezas-reales.mjs` (HTML→PNG, Playwright headless) sobre capturas reales ya existentes:
   - Claras: `pieza-luz-hero-8-ciudades-banner` (03), `pieza-luz-mecanismo-60s-banner` (04), `pieza-luz-ranking-podio-square` (11), `pieza-luz-diagnostico-sin-presion-square` (08), `pieza-luz-geografia-mapa-square` (29), `pieza-luz-anatomia-huesos-square` (28), `pieza-luz-dos-ciudades-gratis-square` (06).
   - Oscuras (fallback a captura clara hasta tunnel dark): `pieza-oscura-ranking-podio-square`, `pieza-oscura-geografia-mapa-square`, `pieza-oscura-anatomia-huesos-square`.
3. Re-render total de las 18 piezas (8 existentes + 10 nuevas) → todas OK.
4. README de piezas actualizado (tablas claro/oscuro).

HALLAZGOS:
- Todo copy usado está verificado en capturas reales: "10 preguntas en 60 segundos", "sin presión no afecta tu racha", "2 ciudades gratis para siempre", mapa BANGLADÉS ✓, FÉMUR ✓, ranking semanal.
- Ninguna pieza simula features falsas (fantasma/duelo BLOQUEADOS siguen sin pieza, como corresponde).

SIGUIENTE PASO: tunnel del usuario → capturas dark → soltar PNG en `pantallas-oscuras/` → re-render → revisión visual de los 8 `pieza-oscura-*` con captura FINAL dark.

### CLAIM: Lote 2 — stories 9:16 + carruseles + plantillas + edits virales + dark real parcial · marketing · 2026-09-14
Estado: CIERRE. Solo `docs/marketing/assets/piezas/**` (HTML+PNG+README) y este log; sin tocar código de la app.

ACTIVIDAD:
1. 4 stories claras nuevas: `pieza-luz-musculo-story`, `pieza-luz-8-mundos-story`, `pieza-luz-mecanismo-60s-story`, `pieza-luz-mapa-mundo-story`.
2. Carrusel A "La dificultad se adapta" (3 slides, `pieza-luz-carrusel-adaptativa-{1,2,3}-story`) con LevelDial dibujado (NIVEL 3 → NIVEL 4 → "fallaste? no resta") — anclado al componente real `LevelDial`.
3. Carrusel B "¿Qué hay en el mundo?" (4 slides, `pieza-luz-carrusel-mundo-{1,2,3,4}-story`) por mundo: Numeria (23), Melodía (24), Anatomía+Geografía (28+29), Quimia (26).
4. 2 plantillas recurrentes (`plantilla-recurrente-ranking-story`, `plantilla-recurrente-reto-story`) con slots `[EDITAR]`.
5. 2 edits virales text-heavy (`pieza-luz-edit-viral-musculo-story`, `pieza-luz-edit-viral-pentagrama-story`) con destello de captura + glifos.
6. Eje oscuro: 2 piezas nuevas CON captura FINAL dark real de `pantallas-oscuras/` (swap automático ya activo): `pieza-oscura-dos-ciudades-gratis-square` (usa 06) y `pieza-oscura-reto-diario-story` (usa 12).
7. Re-render total: 35 piezas OK (18+ previas + 17 nuevas). README de piezas actualizado (tabla stories/carruseles/plantillas/edits + filas oscuras).

HALLAZGOS:
- El swap oscuro automático (dark PNG existente → usado; si no, fallback claro real) queda CONFIRMADO en render: `pieza-oscura-dos-ciudades-gratis-square` y `pieza-oscura-reto-diario-story` montan captura dark real. Las `pieza-oscura-*` que aún no tienen su dark (geografía 29, anatomía 28) mantienen fallback claro y se destraban solas al soltar el PNG.
- Todo copy anclado a pantallas reales; sin features simuladas.

SIGUIENTE PASO: capturas dark faltantes (01-04 landing, 08 diagnóstico, 23-30 demos) + revisión visual humana de los PNG nuevos (este modelo no puede leer imágenes).

### CLAIM: Lote 3 — plantillas semanales tipográficas "Problema de la Semana" · marketing · 2026-09-14
Estado: CIERRE. Solo `docs/marketing/assets/piezas/**` y este log; sin tocar código de la app.

ACTIVIDAD:
1. 6 plantillas NUEVAS sin capturas (tipografía + grilla, slots `[EDITAR]`):
   - Feed problema 1:1 `plantilla-semanal-problema-square` (4 opciones A-D, clase `correcta`).
   - Historia problema 9:16 `plantilla-semanal-problema-story` (opciones + hueco para sticker ENCUESTA).
   - Variantes nocturnas `plantilla-semanal-problema-oscura-{square,story}` (tokens dark reales).
   - Cierre `plantilla-semanal-respuesta-{square,story}` (respuesta correcta + "Por qué" + hueco de sticker).
2. Loop semanal documentado: Lun problema → Mar respuesta, feed + historia.
3. Re-render total: 41 piezas OK (35 + 6). README actualizado (sección nueva).

Nota: este modelo no puede leer imágenes → verificación visual humana pendiente de los PNG.

SIGUIENTE PASO: si se quiere, idear más plantillas (dato curioso semanal, "1 minuto cada mañana", receta de estudio, meme educativo) o completar capturas dark faltantes.

### CLAIM: Lote 4 — plantillas de contenido de marca (dato curioso + meme + motivación + hábito) · marketing · 2026-09-14
Estado: CIERRE. Solo `docs/marketing/assets/piezas/**` y este log; sin tocar código de la app.

ACTIVIDAD:
1. 8 plantillas NUEVAS (tipográficas, slots `[EDITAR]`, sin capturas):
   - Dato curioso: `plantilla-dato-curioso-{square,story}` + `plantilla-dato-curioso-oscura-square` (nocturna).
   - Meme educativo: `plantilla-meme-matematico-{square,story}`.
   - Motivación semanal: `plantilla-motivacion-semana-{square,story}` (claim real: "Entrená tu cabeza como si fuera un músculo").
   - Hábito 1 minuto: `plantilla-minuto-cada-manana-{square,story}` (1' + reto diario real).
2. Re-render total: 49 piezas OK. README actualizado (secciones nuevas).

ACLARACIÓN: todas las plantillas usan features y claims REALES verificados en el navegador (REAL-APP-2026-09-08): rachas, ranking del día, 5 preguntas, "entrená tu cabeza". Nada de duelo/fantasma u otras features BLOQUEADAS.

SIGUIENTE PASO: más plantillas nuevas (quiz carrusel "Regla de la semana", "Un problema, dos mundos", "Frase del día"), completar dark faltantes, o avanzar con otro material.

### CLAIM: Capturas reales con Playwright + avance docs/marketing · marketing + visual-design · 2026-09-08
Estado: CIERRE (sigue como línea ABBIERTA para generación de piezas).
Áreas tocadas: `docs/marketing/**` (solo docs), `docs/marketing/assets/pantallas-reales/`. Sin tocar código de la app.

ACTIVIDAD:
1. Playwright (Chromium headless, localhost:3000, sesión anónima REAL vía signInAnonymously) sobre los flujos reales: landing visitante (paso0→intro→grid hero→mecanismo→demo), onboarding (elegir 2 mundos), diagnóstico Numeria/Melodía (calibrar), home, leaderboard, reto diario/semanal, tienda, perfil, mundos bloqueados, rankeds bloqueado, invitado-bloqueado, y las 8 demos por mundo con pregunta real viva.
2. 30 capturas curadas en `docs/marketing/assets/pantallas-reales/` (nombres descriptivos; ver listado abajo).
3. Doc nuevo `docs/marketing/REAL-APP-2026-09-08.md`: mapa pantalla→captura→qué vende, 5 afirmaciones publicitarias REAL con evidencia, 3 conceptos de anuncio nuevos (El músculo / Mismo reto, mismas reglas / Sin presión), bloqueos de captura.
4. Actualizado: SCREENSHOTS.md (estados reales), PRODUCT-MESSAGING.md (claims revalidados EN NAVEGADOR + claim #1 nuevo), PROMPTS-IMAGES.md y PROMPTS-VIDEO.md (prompts anclados a capturas), README.md.

HALLAZGOS CLAVE (REAL, en navegador):
- Frase real de valor en la app: "Partidas cortas de práctica, un ranking en vivo y duelos contra otros jugadores" + "Entrená tu cabeza como si fuera un músculo".
- Regla real de partida vendida antes del registro: "10 preguntas en 60 segundos, racha da más segundos, velocidad da más Experiencia".
- Onboarding real = "2 mundos gratis para siempre; el resto con Chispas jugando" — claim publicitario #1 nuevo.
- Coordinación honesta: Chispas "no bajan nunca", ranking semanal "se reinicia solo", calibrar "sin presión", invitado "no perdés nada".
- Las 8 demos se juegan sin cuenta y cada una muestra UNA pregunta real de su mundo → 8 micro-videos auténticos listos.
- Ranking semanal visible sin cuenta: un anónimo ve el 🥇 real (782 Exp).
- Duelos/Rankeds/Feed/Amigos/Clanes = BLOQUEADO en captura (requieren cuentas reales/2 jugadores/nivel 5).

BLOQUEOS DE CAPTURA: ver sección 6 del doc REAL-APP. Duelos en vivo y fantasma quedan sin imagen (requiere 2 usuarios reales).

SIGUIENTE PASO: producir las piezas visuales derivadas (cropped posts/9:16) a partir de los 30 PNG, y en paralelo el reels "El músculo" con footage real de las demos.

### CLAIM: Marketing Fase 1 — estudio, estructura y primer paquete · orchestador · 2026-09-07
Estado: CIERRE
Áreas tocadas: `docs/marketing/**`.

ACTIVIDAD:
1. Tres subagents de SOLO LECTURA estudiaron la app real (código):
   - Educativo: dificultad adaptativa, 8 mundos, generadores procedurales, retos, lecciones, diagnóstico.
   - Gameplay/competitivo: duelos tiempo real, fantasma (0028), rangos/ELO, clanes, amigos/feed, Chispas/tienda, retos con ranking, progresión.
   - Visual/UX: identidad visual (paleta/tipografía/logo/glífos), pantallas fotogénicas, demo, fricciones de funnel, tono rioplatense.
2. Se crearon los 16 archivos:
   README (reglas+índice), BRAND, PRODUCT-MESSAGING, AUDIENCE, COMPETITIVE-RESEARCH, CONTENT-STRATEGY, AD-CONCEPTS, SOCIAL-CONTENT, VIDEO-CONCEPTS, VISUAL-ASSETS, SCREENSHOTS, PROMPTS-IMAGES, PROMPTS-VIDEO, CAMPAIGNS, COPY-LIBRARY, FUNNEL.
3. Primer paquete publicitario (conceptos+copy+prompts, listos en docs):
   - 5 anuncios visuales (Ad imagenes 1-5), 5 videos cortos (Video A-E), 10 hooks, 5 anuncios completos, 5 carruseles (A/B), 3 trailers (T1-T3).

HALLAZGOS:
- Fantasma del rival = diferencial único (0028, 0038) — piedra angular publicitaria.
- Pentagrama de Melodía = el mundo más fotogénico (Pentagrama.tsx).
- Pro a la venta: NO (pro/page.tsx sin pago) → no publicitar.
- Reto diario/semanal = mismo examen para todos + ranking público (0113) → fuerte para FOMO; no es en vivo.
- Casual usa ELO oculto de dificultad (0078/0090) → no prometer "casual ignora tu ranking".

CONFIRMADO:
- Todo claim publicitario listado en PRODUCT-MESSAGING y AD-CONCEPTS = VERIFICADO EN CÓDIGO.

PENDIENTE:
- Generar piezas visuales reales: BLOQUEADO (sin browser para capturas; prompts listos en PROMPTS-*).
- COMPETITIVE-RESEARCH revalidado con live research: PENDIENTE.
- Tabla de priorización P0-P3 final de conceptos publicitarios: PENDIENTE (borrador en AD-CONCEPTS).

### CLAIM: F4 marketing — inventario + auditoría + eje oscuro · marketing/orchestrator · 2026-09-09
Estado: CIERRE (ver abajo). Solo docs/assets; sin tocar código de la app ni migraciones.

ACTIVIDAD:
1. Inventario de la línea: `docs/marketing/` = **20 .md**, `assets/pantallas-reales/` = **30 capturas**, `assets/piezas/` = 4 piezas claro (HTML+PNG) + pipeline `scripts/piezas-reales.mjs`.
2. Auditoría docs-vs-código en `docs/audits/MARKETING-AUDIT.md` (12 hallazgos, tabla claim→estado, checklist).
3. Plantillas eje OSCURO (`pieza-oscura-*.html`) con tokens dark REALES (`globals.css:47-56`) + PNG de preview, carpeta `assets/pantallas-oscuras/` (destino de capturas, swap automático).

HALLAZGOS CLAVE (en código):
- Nivel de mundo: marketing cita fórmula vieja "50% dominio" (`PRODUCT-MESSAGING.md:52,55`, `AD-CONCEPTS.md:90` citando `0080`); vigente 34/45/21 (`0117`, `worldLevel.ts:46-49`) → docs a corregir.
- `docs/MARKETING.MD:8-9`: 6 mundos + "no número fijo" (obsoleto; código = 8 via `mundos.ts:19-28`/`0110`).
- Feed social: `AUDIENCE.md:31` lo vende, `SocialClient.tsx:16-19` lo deja desactivado → no publicitar.
- Dark mode real: tokens+toggle+init script (VERIFICADO EN CÓDIGO), captura real BLOQUEADA sin tunnel.

SIGUIENTE PASO: usuario con tunnel captura dark → `assets/pantallas-oscuras/` → `node scripts/piezas-reales.mjs` → revisión visual de los 8 PNG. Corregir los 3 docs desactualizados arriba.

### CLAIM: STORIES-BANK + HIGHLIGHTS-BANK (banco de 20 stories + 11 portadas de highlights) · marketing · 2026-09-14
Estado: CIERRE. Solo `docs/marketing/STORIES-BANK.md` y `docs/marketing/HIGHLIGHTS-BANK.md` + este log; sin tocar código de la app.

ACTIVIDAD:
- `STORIES-BANK.md`: 20 historias producción-ready en español neutro (tuteo LATAM), 13 tipos cubiertos (mínimo 1 cada uno), 8 historias de Mundo (una por mundo: Numeria, Melodía, Quimia, Anatomía, Geografía, Enigmia, Trigonometría, Historia) y 13 en eje oscuro con capturas dark reales de `pantallas-oscuras/` (mín 6 cumplido). Copy completo, sticker/encuesta y CTA ≤3 palabras por historia.
- `HIGHLIGHTS-BANK.md`: 11 portadas (Mundos, Ranked, Duelos, Amigos, Bazar, Trastienda, Retos, Progreso, FAQ, Novedades + extra "Chispas"), cada una con idea visual, esquema de color con tokens reales, formato 1080×1920/1080×1080 y grupos de stories + nota de consistencia de familia visual.

HALLAZGOS:
- Claims usados verificados: "10 preguntas en 60 segundos", "2 ciudades gratis. Para siempre", "El mismo examen, el mismo día, para todo el mundo", "El ranking es justo: ni bots que suman". Sin temporadas/peaks, sin feed social, sin duelo/ranked simulado como captura real (duelo queda anclado a captura pendiente según PRODUCTION-MATRIX).

SIGUIENTE PASO: si se aprueba, re-render de nuevas piezas story/portadas bajo `scripts/piezas-reales.mjs` y captura dark de duelo/ranked en vivo.