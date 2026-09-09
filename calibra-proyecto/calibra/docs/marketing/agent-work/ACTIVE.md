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
| EN CURSO | Piezas visuales reales de la app con Playwright (browser AHORA DISPONIBLE: Chromium headless funcionando) + avanzar docs/marketing | marketing + visual-design | 2026-09-08 |
| HECHO (capturas CIERRE) | 30 capturas reales + REAL-APP doc + claims navegador | marketing + visual-design | 2026-09-08 |
| PENDIENTE | Live research de competencia (revalidar HIPÓTESIS) | marketing | — |
| PENDIENTE | Priorización tabla P0-P3 final de conceptos | marketing | — |

## Log

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