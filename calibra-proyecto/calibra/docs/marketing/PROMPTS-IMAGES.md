# PROMPTS-IMAGES — Prompts de generación de imágenes publicitarias

> Para Midjourney/Flux/DALL-E/Ideogram. Reglas de identidad en BRAND.md y VISUAL-ASSETS.md. Nunca edtech genérico.

## Estilo base (prefijo común)

```
Stylized mobile game UI ad, Prodigia aesthetic, consistent brand system:
- colors #6C4CF1 violet primary, #FFC53D gold accent, creme background #fdfbf7
- typography Space Grotesk bold display, JetBrains Mono for numbers
- soft rounded corners (8-16px), soft shadows, subtle specular highlights
- floating math glyphs in background (+ − × ÷), spark design: circle ring + asymmetric 4-point sparkle
- warm creme vs deep navy #090c14 contrast, no corporate stock, no generic 3D glossy
```

## Ad imagen 1 · Los 8 mundos (grid)

```
[prefijo] Wide landing screenshot style. 2x4 grid of 8 "world cards" with gradient banners:
violet #6C4CF1 (Numeria), esmerald #0E9F6E (Enigmia), ocean #1E7A8C (Geografia), magenta #C026D3 (Quimia),
wine #8B2942 (Anatomia), old-gold #B8860B (Melodia), lime #84CC16 (Trigonometria), sepia #A0522D (Historia).
Each card: round icon in translucent white circle, white title font Space Grotesk. CTA pill button.
Overlay headline Space Grotesk bold: "ELEGÍ TUS 2 CIUDADES". Creme background. Android/iOS status bar omitted for clean look.
```

## Ad imagen 2 · Pentagrama

```
[prefijo] Close-up of a music staff UI on creme surface: golden treble clef (hand-drawn path), 
golden ellipse note heads, sharp/flat symbols, one note glowing with gold spark. 
Overlay Space Grotesk: "OÍDO ABSOLUTO". Palette amber #B8860B + gold #FFC53D.
No sheet-music illustration — must look like the actual in-app Pentagrama component.
```

## Ad imagen 3 · El fantasma 🧵

```
[prefijo] Sprint challenge UI: giant monospace multiplication problem in violet, time bar with "comet tip" glow, 
head-to-head progress dots — the rival's dots are semi-transparent holographic, moving alone, 
small ghost emoji + caption mono: "SU RIVAL YA TERMINÓ". Creme bg, violet/gold.
```

## Ad imagen 4 · Mapa / Geografía

```
[prefijo] World map UI (topojson style) in ocean blue #1E7A8C on creme, one country highlighted, 
green check marker #3FB88B "✓" in JetBrains Mono, question pill at top:
"¿DÓNDE ESTÁM BANGLADÉS?" (Space Grotesk). Soft vignette. High contrast, minimal.
```

## Ad imagen 5 · Esqueleto de Anatomía

```
[prefijo] Simple anatomical skeleton SVG UI (clean, thin lines, wine #8B2942 palette), 
bone highlighted with green "hueso-correcto" glow, mono label "FÉMUR ✓". 
Overlay headline Space Grotesk: "TO CALO Y TE RESPONDE". Creme bg. 
NOT photo-real anatomy — keep it the app's flat illustration style.
```

## Ad imagen 6 · Ranking / Reto diario

```
[prefijo] Leaderboard podio style 2-1-3 podium with medals gold/silver/bronze, 
the #1 card has a GlareHover light sweep crossing. Mono numbers. Overlay Space Grotesk: "EL RANKING DEL DÍA".
Palette #FFC53D / #C0C5CE / #CD7F32 medals.
```

## Ad imagen 7 · Dos mundos gratis (oferta)

```
[prefijo] Simple flat mock UI: 8 world cards in grid, 2 have violet "ELEGIDO" checkmarks and gradient glow,
others show small padlock icon muted grayscale. Headline Space Grotesk: "2 CIUDADES GRATIS PARA SIEMPRE".
Info pill mono: "3.000 CHISPAS c/u". Creme bg. Honest freemium visual.
```

## Ad imagen 8 · Clan / guerra

```
[prefijo] War-of-clans board: two banners (clan tag, standard color), on city background, 
"TU CLAN vs RIVAL" score strip, weekly progress bars, small chat bubble icons. 
Palette deep navy #090c14 bg + violet + gold accents. Mono totals.
```

## Ad imagen 9-10 (carrusel serie): "Así funciona"

### Carrusel A · "La dificultad se adapta" (3 slides)
```
Slide1: easy problem + LevelDial low, mono "NIVEL 3".
Slide2: same problem harder, +1 pip, mono "3 SEGUIDAS →":
Slide3: error without damage, caption "FALLASTE? NO RESTA" + shield icon.
Consistent framing, problem always centered, LevelDial right.
```

### Carrusel B · "¿Qué hay en el mundo?" (4 slides)
```
Slide1: Numeria sum rest mult div icons violet.
Slide2: Melodía pentagrama.
Slide3: Anatomía esqueleto + Geografía mapa.
Slide4: Quimia molecula hexagon benceno magenta.
Headline per slide in Space Grotesk, brand rules everywhere.
```

## Reglas técnicas
- Siempre `flat UI`, nunca "3D glossy", nunca personas, nunca fotos de stock.
- Conservar proporción 9:16 para stories, 1:1 feed, 16:9 banners pull from same system.
- Texto en los prompts en inglés (los generadores rinden mejor) pero el asset final lleva el copy en español real de COPY-LIBRARY.md.
- Cualquier número del UI en JetBrains Mono.

## ANCLA REAL (2026-09-08) — prompts que reproducen capturas verídicas

> Referencia visual exacta: `docs/marketing/assets/pantallas-reales/` (30 PNG tomados con Playwright). Si la pieza debe "parecer la app real", el generador debe partir de la captura (composición/color). Prompts nuevos confirmados por pantallas reales:

### Ancla 1 · Poster del sprint (`23-demo-numeria-sprint.png`)
```
[prefijo] Sprint in progress: giant JetBrains Mono expression "5 + 6" centered on creme,
top bar with small live timer "30s" and mono caption "0 EXP", round progress ring on right.
Recreate EXACTLY like the real app screenshot assets/pantallas-reales/23-demo-numeria-sprint.png
(minimal changes only: none). Format 4:5.
```

### Ancla 2 · El muro de 8 colores (`03-landing-hero-8-ciudades.png`)
```
[prefijo] Mobile landing grid 2x4, 8 gradient city cards (violet #6C4CF1, emerald #0E9F6E,
ocean #1E7A8C, magenta #C026D3, wine #8B2942, old-gold #B8860B, lime #84CC16, sepia #A0522D),
rounded-2xl, icon in translucent white circle, white title. Headline Space Grotesk:
"EN-TRE-NA TU CABEZA" / mono sub "SIN CREAR CUENTA". Same layout as assets/pantallas-reales/03-landing-hero-8-ciudades.png
```

### Ancla 3 · El candado honesto (oferta "2 gratis") (`06-onboarding-elegir-2-mundos.png`)
```
[prefijo] 2x4 grid world cards: 2 selected with colored border + "ELEGIDO" tag,
6 muted with small padlock glyph. Headline Space Grotesk:
"2 CIUDADES GRATIS PARA SIEMPRE". Info pill mono "LAS DEMÁS CON CHISPAS".
Match assets/pantallas-reales/06-onboarding-elegir-2-mundos.png color system.
```

### Ancla 4 · El Bazar (`13-tienda-bazar.png`)
```
[prefijo] In-game shop "BAZAR" banner, offer card "-50% ESCUDO EXTRA" with gold price tag,
shelf of utility items (shield, time, life) flat icons. Palette creme + violet + gold.
Match assets/pantallas-reales/13-tienda-bazar.png.
```

### Ancla 5 · Sin presión (`08-diagnostico-numeria-sin-presion.png`)
```
[prefijo] Calibration screen: headline "VEAMOS DÓNDE ESTÁS" Space Grotesk,
sub "SIN PRESIÓN — NO AFECTA TU RACHA", 4 choice chips (SUMA, RESTA, MULTIPLICACIÓN, DIVISIÓN)
+ ghost button "PREFIERO ARRANCAR EN NIVEL 1" subtle. Match capture 08 + 09.
```