# VISUAL-ASSETS — Dirección visual publicitaria y assets

> Define cómo se ven los anuncios de Prodigia. Derivado de la app real (verificado 2026-09-07). Reglas NO negociables: BRAND.md.

## Principio

La publicidad debe **parecer Prodigia**, no IA genérica. Todo asset arranca desde uno de los 8 degradés de mundo + fondo crema/nocturno + tipografía Space Grotesk/JetBrains Mono + chispa del logo.

## Reglas de ejecución visual

### Color
- Fondo: crema `#fdfbf7` (claro) o nocturno `#090c14` (oscuro). Un axis por pieza.
- Degradé de mundo: `linear-gradient(120deg, <hex mundo>, mix(<hex>, white 55%))` — es la firma de `WorldCard.tsx:64`. Elegir UN mundo protagonista por pieza, nunca todos.
- Resaltes: dorado `#FFC53D` para logros, XP, puestos, "nivel +1"; violeta `#6C4CF1` para CTAs.
- Feedback: verde `#3fb88b` acierto, coral `#ff6b6b` error. Usar con moderación (el error no debe leerse como drama).

### Tipografía
- Display (títulos/CTAs): **Space Grotesk bold, tracking-tight**.
- Números/tiempos/XP/Chispas/segundos: **JetBrains Mono**.
- Cuerpo: **Inter**.
- Los números SIEMPRE en mono; nunca serif, nunca script.

### Formas
- Píldoras `rounded-full` para CTAs; tarjetas `rounded-2xl`; cajas de problema `rounded-3xl`.
- Bordes suaves, sombras suaves `shadow-lg shadow-foreground/[0.03]`. Glassmorphism solo como overlay puntual (tour), no en piezas.

### Cinética (marca)
- Chispa del logo siempre presente (4 puntas, degradé `#A794FF→#E4CBA0→#FFC53D`).
- Glifos flotantes por mundo (`+ − × ÷`, `♪ 𝄞`, `⚗ ⚛`, `🦴`, `🗺️`) como fondo sutil.
- Destellos representan "premium" (SpecularButton/BorderGlow/GlareHover): usar sweep de luz en tarjetas de premio/ranking.

## Camera / fotografía
- Apegarse a la UI real; NO stock photos.
- Si se necesita "escena", recrear con la estética de la app: fondos de glifos + color de mundo + UI del componente real.
- Horizontes: mantener al menos 2 colores de mundo contrastantes en piezas de "8 mundos".

## Assets que viven reutilizables
| Asset | Fuente | Uso |
|---|---|---|
| Logo aro+chispa animado | `Logo.tsx` | Todos los anuncios |
| Íconos de 8 mundos (SVG stroke 2, punta redonda) | `components/icons.tsx` | Grid/tarjetas |
| Gradiente por mundo (degradé 120°) | `WorldCard.tsx` | Bases de tarjeta |
| LevelDial / ProgressDial | SprintRunner | "nivel", "dificultad" |
| Pentagrama dorado | `Pentagrama.tsx` | Mundo Melodía |
| Mapa topojson | `GeografiaMapa.tsx` | Geografía |
| Esqueleto SVG | `EsqueletoClickeable.tsx` | Anatomía |
| Benceno magenta | `MoleculaSVG.tsx` | Quimia |
| Insignias de rango PNG | `/rangos/{slug}.png` | Pantalla VS, rankeds |
| Podium 2-1-3 + medallas | `leaderboard/Podio.tsx` | ranking |
| Fondo glifos por mundo | `FondoMundo.tsx` | backgrounds |

## Anti-patrones visuales
- ❌ Teléfono en la mesa con fotos de usuarios al azar.
- ❌ "3D glossy" de productos de IA.
- ❌ Gradiente genérico púrpura→rosa (el de la marca es violeta→dorado).
- ❌ Fotos médicas reales para Anatomía (es la ilustración de la app).
- ❌ Fotos de instrumentos para Melodía (es el pentagrama UI).
- ❌ Textos en tipografías display "técnicas" — siempre Space Grotesk.

## Assets para delivery
1. Kit de marca 1-pager (resumen BRAND + VISUAL-ASSETS) → para diseño/referencias.
2. Carpeta `assets/images/` y `assets/videos/` para piezas finales (vacías aún — BLOQUEADO navegador).
3. En `docs/marketing/assets/screenshots/` se agregan capturas reales cuando el browser esté disponible.