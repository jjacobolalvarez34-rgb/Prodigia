# BRAND — Identidad de marca para publicidad

> Sintetizado de la app REAL (globals.css, Logo.tsx, mundos.ts, icons.tsx) — verificado en código 2026-09-07.

## Regla de oro visual

**SI no parece Prodigia, no es Prodigia.** Toda pieza arranca desde la identidad real de la app, nunca de estética genérica:

- ❌ No: corporativo, stock photos, personas con laptops al azar, gradientes genéricos, glassmorphism excesivo, "startup SaaS".
- ✅ Sí: degradé 120° de color de mundo + mezcla con blanco, fondo crema `#fdfbf7` o nocturno `#090c14`, tipografía Space Grotesk, números en JetBrains Mono, resaltes en dorado `#FFC53D`.

## Paleta

| Token | Claro | Oscuro |
|---|---|---|
| Fondo | `#fdfbf7` (crema cálido) | `#090c14` |
| Superficie | `#ffffff` | `#12172a` |
| Texto | `#1f2430` | (light) |
| Primario | `#6c4cf1` (violeta) | `#7c5cff` |
| Logro/dorado | `#ffc53d` | `#ffb627` |
| Correcto | `#3fb88b` (verde) | — |
| Error | `#ff6b6b` (coral) | — |
| Racha | `#ff8a3d` (mandarina) | — |

## Colores por mundo (fuente única: `src/lib/mundos.ts`, `precios.ts`)

| Mundo | Hex | Ícono |
|---|---|---|
| Numeria | `#6C4CF1` | IconSuma |
| Enigmia | `#0E9F6E` | IconLogica |
| Geografía | `#1E7A8C` | IconGeometria |
| Quimia | `#C026D3` | IconQuimica |
| Anatomía | `#8B2942` | IconAnatomia |
| Melodía | `#B8860B` | IconMelodia |
| Trigonometría | `#84CC16` | IconTrigonometria |
| Historia | `#A0522D` | IconHistoria |

## Tipografía

- **Display / títulos y CTAs**: Space Grotesk, bold, tracking-tight.
- **Mono / números, XP, Chispas, segundos**: JetBrains Mono.
- **Cuerpo**: Inter.

## Radiografía de marca

| Elemento | Fuente |
|---|---|
| Logo: aro violeta + chispa asimétrica de 4 puntas degradé `#A794FF→#E4CBA0→#FFC53D` | `Logo.tsx:18-70` |
| Gradiente primario: `linear-gradient(120deg, var(--primario), var(--logro))` violeta→dorado | `Boton.tsx:50` |
| Tarjetas de mundo: degradé 120° del color + textura | `WorldCard.tsx:64` |
| Fondos con glifos flotantes por mundo (`+ − × ÷`, `♪ ♫ 𝄞`, `⚗ ⚛ ⬡`...) | `FondoMundo.tsx:23-91` |
| Estela de cursor tintada por mundo | `FondoCursorMundo.tsx` |
| Píldoras `rounded-full`, tarjetas `rounded-2xl`, problema `rounded-3xl` | SprintRunner.tsx:546 |
| Cinética: brillos/destellos en tarjetas y CTAs | reactbits (SpecularButton, BorderGlow, GlareHover, GhostCursor, PixelTransition) |

## Voz

- Rioplatense, "vos", motivacional realista: "Elegí", "Probá", "Ahí quedó.", "Ninguna fallada — así se hace 🎯", "Superaste tu techo".
- Metáfora propia: **Chispas** (moneda), mundos = **ciudades**, **Rankeds**, **Clan de Bots**, **fantasma del rival**, **racha**.
- Emojis funcionales: 🔥 racha, 🛡️ escudo, 👻 fantasma, ⚡ boost, 🎯.
- NUNCA copy vacío tipo "La nueva forma de aprender". Todo nace de una funcionalidad real.