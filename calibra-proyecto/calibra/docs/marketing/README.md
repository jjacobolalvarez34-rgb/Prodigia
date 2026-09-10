# docs/marketing — Línea de publicidad y marketing de Prodigia

> Línea INDEPENDIENTE Y PARALELA a los P0 técnicos. URGENTE, pero nunca debe interrumpir ni retrasar los P0 técnicos.
> Última actualización: 2026-09-09.

## NUEVO (2026-09-09): auditoría de la línea + eje oscuro de piezas

- `docs/audits/MARKETING-AUDIT.md` — inventario completo (20 docs + assets), auditoría docs-vs-código con hallazgos y file:line, estado real del dark mode y plan del eje oscuro (BLOQUEADO-con-plan).
- **Eje oscuro**: 4 plantillas nuevas en `assets/piezas/` (`pieza-oscura-*`) con tokens dark REALES de la app (`globals.css:47-56`) + PNG de preview. Capturan primero de `assets/pantallas-oscuras/` (dark real, tunnel del usuario) y caen a la captura clara mientras no existan. Hallazgos a corregir: `PRODUCT-MESSAGING.md:52,55` y `AD-CONCEPTS.md:90` citan la fórmula vieja de nivel de mundo (50% dominio; vigente: 45/34/21 → `0117`+`worldLevel.ts`), y `AUDIENCE.md:31` publicita un feed social que el código tiene desactivado.

## NUEVO (2026-09-08): evidencia real en navegador

`REAL-APP-2026-09-08.md` — estudio de la app REAL con Playwright (sesión anónima completa): mapa pantalla→captura→qué vende, las 5 afirmaciones publicitarias más fuertes con evidencia, 3 conceptos de anuncio nuevos, y bloqueos de captura. Las 30 capturas reales están en `assets/pantallas-reales/`.

## Regla de oro

**No inventar funcionalidades.** Todo material publicitario debe basarse en la app REAL. Antes de afirmar que una funcionalidad existe, verificarla en código y etiquetarla:

- `VERIFICADO EN CÓDIGO` — se leyó la implementación que lo respalda.
- `VERIFICADO EN NAVEGADOR` — se vio en un navegador real.
- `HIPÓTESIS` — no verificado, posibilidad de marketing.

## Índice del material

| Archivo | Contenido |
|---|---|
| `BRAND.md` | Identidad de marca (voz, tono, reglas visuales) |
| `PRODUCT-MESSAGING.md` | Diferenciales reales verificados + mensajes de posicionamiento |
| `AUDIENCE.md` | Segmentos (dato observado vs hipótesis) |
| `COMPETITIVE-RESEARCH.md` | Análisis de competencia |
| `CONTENT-STRATEGY.md` | Estrategia de contenidos + calendario |
| `AD-CONCEPTS.md` | Inventario de conceptos publicitarios (el documento principal) |
| `SOCIAL-CONTENT.md` | Contenido para TikTok/IG/Shorts/Reels |
| `VIDEO-CONCEPTS.md` | Conceptos y prompts de video |
| `VISUAL-ASSETS.md` | Dirección visual publicitaria y assets |
| `SCREENSHOTS.md` | Capturas de pantalla con intención publicitaria |
| `PROMPTS-IMAGES.md` | Prompts de generación de imágenes |
| `PROMPTS-VIDEO.md` | Prompts de generación de video |
| `CAMPAIGNS.md` | Campañas hipotéticas |
| `COPY-LIBRARY.md` | Biblioteca de copy (hooks, headlines, CTAs, scripts) |
| `FUNNEL.md` | Embudo AD → LANDING → REGISTRO → ONBOARDING → RETENCIÓN |

## Estructura de carpetas

```
docs/marketing/
├── README.md
├── BRAND.md
├── PRODUCT-MESSAGING.md
├── AUDIENCE.md
├── COMPETITIVE-RESEARCH.md
├── CONTENT-STRATEGY.md
├── AD-CONCEPTS.md
├── SOCIAL-CONTENT.md
├── VIDEO-CONCEPTS.md
├── VISUAL-ASSETS.md
├── SCREENSHOTS.md
├── PROMPTS-IMAGES.md
├── PROMPTS-VIDEO.md
├── CAMPAIGNS.md
├── COPY-LIBRARY.md
├── FUNNEL.md
├── assets/
│   ├── images/
│   ├── videos/
│   └── screenshots/
├── campaigns/
├── research/
├── concepts/
└── agent-work/
    └── ACTIVE.md
```

## Proceso

1. Verificar funcionalidad real (código/browser) → 2. crear concepto → 3. priorizar (P0-P3) → 4. generar prompts/scripts → 5. registrar en `agent-work/ACTIVE.md`.

## Reglas de identidad visual (resumen — ver `BRAND.md` y `VISUAL-ASSETS.md`)

- La publicidad debe parecer **Prodigia**, no IA genérica.
- Evitar: estética corporativa, stock photos, personas con laptops al azar, gradientes genéricos, glassmorphism en exceso, estética "startup SaaS".
- La identidad visual se deriva de la app real: colores por mundo, tipografías, mecánicas del juego.