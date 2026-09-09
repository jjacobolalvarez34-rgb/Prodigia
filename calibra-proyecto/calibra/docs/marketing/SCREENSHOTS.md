# SCREENSHOTS — Capturas de pantalla con intención publicitaria

> Cada captura debe seguir la identidad Prodigia (BRAND.md). Estado de cada una: VERIFICADO EN CÓDIGO (se sabe que la pantalla existe) / VERIFICADO EN NAVEGADOR (capturada con Playwright real) / HIPÓTESIS (falta confirmar visual).
>
> **2026-09-08: navegador disponible → 30 capturas REALES tomadas** en `assets/pantallas-reales/` (ruta canónica; los templates de este archivo ahora tienen su evidencia). Mapa completo pantalla→captura→qué vende en `REAL-APP-2026-09-08.md`.

## Qué capturar (prioridad)

### A. Ruegos / caja de venta
| Prioridad | Pantalla | Ruta real | Qué resaltar | Estado 2026-09-08 |
|---|---|---|---|---|
| P0 | Home con los 8 mundos | `src/app/[locale]/page.tsx` (grid de tarjetas por mundo) | El sistema de 8 colores, la fila violeta-esmeralda-azul-magenta-… | CAPTURADO → `10-home-principal.png` + hero `03-landing-hero-8-ciudades.png` |
| P0 | Landing visitante "Elegí una ciudad" | `src/components/landing/VisitanteLanding.tsx` (hero + grid) | Frase "Entrená tu cabeza como si fuera un músculo" (`es.json:287`) | CAPTURADO → `01-landing-cold-entry.png`, `02-landing-asi-es-prodigia.png`, `03-landing-hero-8-ciudades.png` |
| P0 | Sprint de práctica Numeria | `src/components/practica/SprintRunner.tsx` | Número gigante mono, LevelDial, barra de tiempo con punta de cometa, confeti | CAPTURADO → `23-demo-numeria-sprint.png` (sprint real en vivo) |
| P0 | Melodía Pentagrama | `src/components/melodia/Pentagrama.tsx` | Clave de sol, notas doradas, fondo crema | CAPTURADO parcial → `19-melodia-home-pentagrama.png`, `20-melodia-detalle-musical.png` (el director específico del Pentagrama requiere cuenta con Melodía calibrada — parcial) |
| P0 | Reto diario (con ranking) | `src/app/[locale]/reto-diario/page.tsx` + `RetoClient.tsx` | Lista de 5 + tablero top 100 | CAPTURADO → `12-reto-diario.png` + `11-ranking-semanal.png` (tablero con 🥇 real visible) |
| P0 | Reto semanal (con ranking) | `reto-semanal/page.tsx` | 45 preguntas + ranking semanal | CAPTURADO sóolo tarjeta home (`10-home-principal.png`); tablero propio BLOQUEADO (cuenta real con XP) |
| P0 | Onboarding "Elegí 2 mundos" | `FlujoElegirMundos.tsx` / `OnboardingForm.tsx` | Grid con candados + checks del color del mundo | CAPTURADO → `06-onboarding-elegir-2-mundos.png` (+ `17-mundo-bloqueado-3000-chispas.png`) |
| P0 | Pantalla VS de duelo | `src/components/duelos/PantallaVS.tsx` | Fondo partido por color de rango, insignia de rango PNG, countdown | BLOQUEADO — requiere 2 cuentas reales / invitación válida |

### B. "Wow" visuales
| Prioridad | Pantalla | Ruta real | Estado |
|---|---|---|---|
| P1 | Geografía con mapa topojson | `GeografiaMapa.tsx:40-88` | CAPTURADO → `29-demo-geografia-mapa.png` ("¿Dónde está Venezuela?") |
| P1 | Esqueleto clickeable de Anatomía | `EsqueletoClickeable.tsx` (SVG `public/data/esqueleto-oseo.svg`) | CAPTURADO → `28-demo-anatomia-huesos.png` (pregunta de huesos); esqueleto interactivo necesita cuenta con Anatomía |
| P1 | Podio/ranking (2-1-3 con medallas y destello) | `src/app/[locale]/leaderboard/Podio.tsx` | CAPTURADO → `11-ranking-semanal.png` |
| P1 | Molécula de benceno Quimia orgánica | `MoleculaSVG.tsx` | parcial — pregunta elemental capturada `26-demo-quimia-elementos.png` |
| P1 | Duelo con progreso rival en vivo (dots) | `ProgresoRivalEnVivo.tsx` | BLOQUEADO (duelo real) |
| P1 | Fantasma del rival (#1 del podio) | `PantallaVS.tsx` (rival ya terminó) | BLOQUEADO (duelo real) |
| P1 | Resultado demo (círculo degradé 4/5) | `FlujoResultado.tsx` | no capturado aún (flujo demo completo) |

### C. Fricción / funnel
| Prioridad | Pantalla | Ruta real | Qué mirar | Estado |
|---|---|---|---|---|
| P2 | Invitado-bloqueado | `invitado-bloqueado/page.tsx` | El copy "es gratis y no perdés nada" (buy-in honesto) | CAPTURADO → `15-invitado-bloqueado-rankeds.png`, `16-invitado-bloqueado-generico.png` |
| P2 | Mundo-bloqueado (3.000 Chispas) | `MundoBloqueadoClient.tsx` | Candado + "Te faltan Chispas" | CAPTURADO → `17-mundo-bloqueado-3000-chispas.png` |
| P2 | Rankeds bloqueado (nivel 5) | `rankeds-bloqueado/page.tsx` | Peldaño de progresión | CAPTURADO → `18-rankeds-bloqueado-nivel5.png` |
| P2 | Login | `login/page.tsx` | Sin mensaje de valor aún (a registrar) | CAPTURADO → `05-login.png` (copy: "Entrar como invitado. Practicá sin crear cuenta") |
| P2 | Landing pregunta "¿Ya conocés Prodigia?" | `VisitanteLanding.tsx:96-115` | Frío inicial del funnel | CAPTURADO → `01-landing-cold-entry.png` |

## Metadatos por captura (template)
```md
## SC-01 · Home 8 mundos
- Objetivo: mostrar "el juego completo" (8 mundos de colores).
- Ángulo publicitario: identidad de marca / surprise / "más que sumas".
- Paleta: 8 hex de `mundos.ts`.
- Formato: 1:1 feed + 16:9 banner (toma del grid a pantalla completa).
- Estado: VERIFICADO EN CÓDIGO (no capturado aún — falta navegador).
- Copy asociado: AD-04/HEADLINE "8 mundos. Una sola cabeza. Sin límite."
```

## Reglas de edición
- No recortar el grid de mundos; el sistema de 8 colores es la identidad.
- Los números siempre en JetBrains Mono; títulos en Space Grotesk.
- Sobre fondo crema/nocturno; no mezclar ambos ejes en una pieza.
- Lograr la "estela/chispa" en pieza dinámica; en estático, logo aro+chispa abajo.