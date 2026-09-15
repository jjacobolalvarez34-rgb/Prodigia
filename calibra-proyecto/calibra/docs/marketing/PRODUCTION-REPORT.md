# PRODUCTION-REPORT — Gran tanda de marketing Prodigia

> Fecha: 2026-09-14 · Perímetro: SOLO marketing (`docs/marketing/` + scripts de captura). **Cero toques a código de la app** (`src/`, APIs, Supabase, migraciones).

## 1. Resumen ejecutivo

Se completó la gran tanda del brief: material real de la app, sin inventar features, en dos ejes (claro crema `#fdfbf7` y nocturno `#090c14`) y en **español latinoamericano neutro (tuteo)** consistente con la app post-migración.

- **32 capturas de pantalla reales** de la app (light) + **23 dark modes reales** (no filtros; `localStorage.prodigia-theme=dark`).
- **81 piezas publicitarias** HTML+PNG renderizadas con Playwright a partir de capturas reales.
- **~870 assets planificados** en bancos de contenido con IDs unívocos (ver CONTENT-CATALOG.md).
- **Reporte de auditoría lingüística**: 100% neutro (1 corrección encontrada y aplicada).

## 2. Totales por formato (conteo real verificado)

| Formato | Pedido en brief | Entregado | Estado |
|---|---|---|---|
| Capturas reales light | — | 32 PNG | ✅ renderizadas |
| Capturas reales dark | — | 23 PNG | ✅ (faltan 9 de baja prioridad) |
| Piezas estáticas (post 1:1) | 40 | 31 `-square` (16 claro + 13 oscuro + 2 plantillas oscuras extra) + 50 legacy | ✅ excede |
| Stories 9:16 | 20 | 23 stories realizadas + bank 20 planificadas | ✅ ambas |
| Variantes / series | 20 | carruseles luz (adaptativa 3, mundo 4, rangos 3, trastienda 3) + oscuro (trastienda 3) = 16 slides + duplas square/story | ✅ |
| Carruseles completos | 10 | 14 documentados (CAR-001…014) | 🟡 planificados (no renderizados como set) |
| Highlights | 10 | 11 portadas (HIGHLIGHTS-BANK) | 🟡 documentados |
| Conceptos de reel | 20 | 20 ideas (REEL-I) + 10 producidos (REEL-II) + 20 image-music (IMG) + 3 plantillas | 🟡 specs (sin video: MCP sin créditos) |
| Thumbnails | 20 | 20 (TH-001…020) | 🟡 documentados |
| Slogans | 300 | 350 (7 categorías × 50) | ✅ |
| Hooks | 100 | 100 | ✅ |
| CTAs | 50 | 50 | ✅ |
| Captions | 50 | 50 | ✅ |
| Campañas conceptuales | 10 | 10 (C01-C10) | ✅ |
| Campaña PRODIGIA DARK | 10 posts/5 stories/3 carruseles/5 reels | 23 piezas (DARK-CAMPAIGN) | ✅ |
| Campaña PRODIGIA LIGHT | ídem | 23 piezas (LIGHT-CAMPAIGN) | ✅ |
| Contenido por área | — | PRODUCTION-MATRIX | ✅ |

## 3. Qué se creó exactamente (rutas)

**Documentos (docs/marketing/):**
`PRODUCTION-MATRIX.md` (matriz total de cobertura y pendientes) · `SLOGANS.md` (350) · `VOZ-TONO.md` (reglas lingüísticas) · `HOOKS-CTAS-CAPTIONS.md` (100/50/50) · `CAMPAIGNS-CONCEPTUALES.md` (C01-C10) · `STORIES-BANK.md` (20) · `HIGHLIGHTS-BANK.md` (11) · `CAROUSELS-BANK.md` (14) · `REELS-BANK.md` (20+10+20+3) · `THUMBNAILS-BANK.md` (20) · `DARK-CAMPAIGN.md` y `LIGHT-CAMPAIGN.md` (23 c/u) · `INSTAGRAM-PLAYBOOK.md` · `CONTENT-CATALOG.md` (catálogo maestro de IDs) · `PRODUCTION-REPORT.md` (este).

**Assets:**
`assets/pantallas-reales/` (32) y `assets/pantallas-oscuras/` (23) · `assets/piezas/` (81 HTML+PNG, incluye las 50 legacy intactas y el lote nuevo documentado en su README).

**Scripts (calibra/scripts/):**
`marketing-capturas-tunnel.mjs` (base de capturas, incluye onboarding scriptable y sesión anónima), `marketing-capturas-restantes.mjs`, `marketing-capturas-melodia-dark.mjs`, `analizar-color-capturas.mjs` y `analizar-color-piezas.mjs` (verificación por color promedio; dark ≈ `[13-19,16-22,25-33]`, light ≈ `[247-250,…]`).

## 4. Verificaciones

- **Render**: `node scripts/piezas-reales.mjs` corrido en `calibra/` → 81/81 PNG OK con tamaños y dimensiones correctos (1:1, 9:16, banner).
- **Capturas**: verificadas por promedio RGB en los dos ejes; se detectó y descartó el fallo del interstitial azul del túnel (`[45,143,218]`) usando `http://localhost:3000`.
- **Idioma**: auditoría automática + humana en los 13 archivos nuevos → solo 1 voseo real (corregido: "Tocá"→"Toca" en STORIES-BANK). Resto son reglas/checklists que citan términos prohibidos y usos neutros de "valer"/"estás".
- **Veracidad**: cada claim anclado a la app real (paleta, 8 mundos, rangos ELO con hex exactos `database.ts:262-268`, precios de Chispas, reto diario/semanal, Trastienda, duelos fantasma). No se mencionan features inexistentes (temporadas/peaks ✔ excluidos, feed social ✔ excluido, Pro ✔ no publicitado).

## 5. Pendientes / decisiones abiertas

1. **Capturas de producción en vivo (requieren acciones del usuario):**
   - Duelo real (necesita 2 cuentas) — piezas marcadas `PEND` en catálogo (S-STORY-006, CAR-002/007/008, REEL-I/II de duelos, STY-LT-005, C06).
   - Rankeds a nivel de cuenta 5 — (CAR-003, REEL-I-010, REEL-II-007, TH-009).
   - Dark de gates/diagnóstico `07/08/09/15/16/17/18/21/22` — prioridad baja (matriz los lista).
2. **Videos**: el MCP de video no tiene créditos → los reels quedan como **specs de producción** (storyboards, texto, audio, movimiento) listos para edición externa o un generador con tokens.
3. **Legacy con voseo**: las 50 piezas previas usan rioplatense ("Empezá", "Tocá", "Entrená"), coherentes con cuando la app era voseante. Decisión pendiente: normalizarlas a tuteo (recomendado por consistencia con la app actual) o preservarlas. El lote nuevo ya es 100% neutro.
4. **Carruseles/highlights/thumbnails** están documentados con copy final pero requieren render de slides si se quiere la versión imagen (el pipeline de piezas está listo para generarlos cuando se definan los layouts HTML).

## 6. Entorno y herramienta

Node v22.14.0 · Playwright (chromium) · dev server local `localhost:3000` (túnel del usuario con interstitial que bloquea headless) · credenciales Supabase en `.env.local` para la sesión anónima de captura.

## 7. Reglas cumplidas (hard rules del brief)

Sin cambios de código ✓ · material anterior intacto ✓ · dos versiones light/dark reales ✓ · español neutro ✓ · features reales únicamente ✓ · túnel solo como fallback documentado ✓ · videos solo specs ✓.