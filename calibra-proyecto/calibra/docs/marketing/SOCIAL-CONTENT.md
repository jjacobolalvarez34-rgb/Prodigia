# SOCIAL-CONTENT — Contenido social (TikTok/IG/Shorts/Reels/X)

> Con perfil indispensable: cada pieza termina en el canal de Prodigia y refuerza la identidad de marca. Usar hooks de COPY-LIBRARY.md y prompts de PROMPTS-VIDEO/IMAGES.

## Librería de piezas priorizadas (P0)

| # | Plataforma | Formato | Concepto | Hook |
|---|---|---|---|---|
| S1 | TikTok/Reels | 9:16 10s | Fantasma del rival (Video A) | "Tu rival ya terminó." |
| S2 | TikTok/Reels | 9:16 10s | Pentagrama (Video B) | "Una app de matemática con pentagrama de verdad." |
| S3 | Reels/Feed | 9:16 12s | Ranking del día (Video C) | "Hoy las mismas 5 preguntas para todo el mundo." |
| S4 | TikTok/Reels | 9:16 10s | Mapa (Video D) | "¿Dónde está Bangladés?" |
| S5 | TikTok/Reels | 9:16 10s | Adaptativa (Video E) | "Fallaste? La app te la rebota." |
| S6 | IG Feed | 1:1 | Grid 8 mundos (Ad imagen 1) | "8 mundos. Una sola cabeza." |
| S7 | IG Feed | 1:1 | 2 ciudades gratis (Ad imagen 7) | "2 ciudades gratis para siempre." |
| S8 | X/Threads | texto | Hilo fair play | "Cómo evitamos los bots y el smurf en el ranking" |
| S9 | X/Threads | texto | Detrás de escena | "El fantasma del rival: cómo funciona" |

## Tono por canal
- TikTok/IG: punch cómico, loops, chiste con las mecánicas; emojis sí (🔥👻🦴🎵).
- X: serio/gamer/tech: hilos técnicos sobre ELO, anti-trampa, oído absoluto.
- Comunidad (Discord/Telegram si existe): preguntas de batalla del día, "¿qué puesto sos hoy?"

## Prácticas
- Las piezas de texto en pantalla en español rioplatense SIEMPRE; CTA al final "Entrá → Prodigia".
- Loop obligatorio: los últimos 0,5s del video deben pegar con el inicio (vídeos de mecánicas).
- Estética: usar sistema de color de BRAND.md; nunca separarse del degradé mundo.
- Cron: 3 publicaciones/semana como mínimo propuesto (ver CONTENT-STRATEGY calendario).

## MENSAJES REDONDADOS (listos para postear)

### Post S8 (X): "Cómo evitamos los bots"
```
Thread:
1/ Nuestro ranking es justo: los invitados no puntúan (migración 0042), respuestas sospechosas 
   en menos del 12% del tiempo esperado no cuentan.
2/ Y desde Platino (>1300 ELO), clasificatoria se juega siempre con TODAS las ciudades activas.
   Nada de "juego solo la ciudad fácil" para subir. #fairplay #prodigia
```
(VERIFICADO: `0042`, `attempts/route.ts:14-17`, `0078:63-65`)

### Post S9 (X): "El fantasma del rival"
```
Cuando tu rival ya terminó, su partida se reproduce a su ritmo exacto: ves avanzar sus puntos 
como si siguiera jugando. Es un duelo contra un fantasma real. Y es justo: nada se inventa.
```
(VERIFICADO: `0028_duelos_fantasma.sql`)