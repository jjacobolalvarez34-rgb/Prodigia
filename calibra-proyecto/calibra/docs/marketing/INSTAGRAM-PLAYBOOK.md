# INSTAGRAM-PLAYBOOK — Playbook de arranque para las 2 primeras semanas

> Guía de producción y publicación para el lanzamiento en Instagram. Se apoya en las piezas de `DARK-CAMPAIGN.md`, `LIGHT-CAMPAIGN.md` y los thumbnails de `THUMBNAILS-BANK.md`.
> Copy siempre en español latinoamericano neutro (tuteo), sin voseo ni peninsular.

## 1 · Objetivo de las 2 semanas

Lanzar Prodigia con dos ejes diferenciados que enseñen la app completa sin abrumar:

- **Semana 1 · PRODIGIA DARK:** la noche como modo de juego (mecánica real, retos, trastienda).
- **Semana 2 · PRODIGIA LIGHT:** el ritual de la mañana (onboarding honesto, casual sin presión, progreso).

Meta: que cualquier persona que llegue al perfil entienda **qué es Prodigia en 15 segundos** (10 preguntas en 60 segundos, 2 ciudades gratis, ranking justo) y se descargue.

## 2 · Formatos y specs

| Formato | Tamaño | Otros specs | Uso |
|---|---|---|---|
| Post feed | 1080×1080 (cuadrado) | JPG/PNG, máx. 8 MB | contenido informativo: mecánica, mundo, reto |
| Post feed | 1080×1350 (4:5 vertical) | sin UI del sistema | contenido emocional y de embudo: rachas, desbloqueo |
| Stories | 1080×1920 | dejar 50 px arriba/abajo libres para la UI de IG | stickers (encuesta, votación, countdown, enlace) |
| Reels | 1080×1920 | 15-20 s, texto en pantalla 3-5 palabras | piezas de movimiento del juego |
| Portada de Highlights | 1080×1920 | diseño centrado, recorte visual ~300 px de alto | iconos de la colección de highlights |

## 3 · Jerarquía visual de cada pieza

De arriba abajo y en este orden de peso:

1. **Headline grande** — máximo 6 palabras, Space Grotesk bold, tracking-tight. Frase corta, imperativa o provocadora.
2. **Número-faro** — JetBrains Mono gigante (10, 60, 5, 350, 3000, ELO…). Es el elemento dominante de la pieza: nunca compite con otro número.
3. **CTA pill** — píldora `rounded-full` con texto en imperativo neutro de 3 palabras máx. ("Descarga y juega", "Rinde el reto hoy").
4. **Badge / sello** — 1 por pieza y solo si añade contexto (RANKED, RETO DIARIO, TRAS, sello de mundo).
5. **Logo aro + chispa** — siempre abajo, en el eje de la pieza (oscuro o claro).

Reglas de zona:
- **Zona segura 8%** en cada borde: nada de texto, badges ni logo dentro.
- **Tercio inferior libre**: en piezas que usan screenshot real, la parte inferior se reserva para UI del juego y el logo. No encojar capturas para "rellenar".
- Un solo color de mundo protagonista por pieza (glow, badge, número).

## 4 · Reglas de carrusel

La portada (slide 1) es la que corta el scroll: debe funcionar **como un post suelto** con headline + número-faro.

- Portada: idea completa en 1 mirada, sin depender de swipe.
- Slides 2..n: una sola idea por slide; números en JetBrains Mono.
- Máx. 5 slides en contenido informativo; excepción: showcase de 8 mundos (9 slides).
- Último slide siempre CTA pill + logo.
- Cada slide es recopilable: puede republicarse como post único o como capa de story.

## 5 · Frecuencia sugerida semanal

| Contenido | Cantidad mínima | Momento ideal |
|---|---|---|
| Posts feed (incluye carruseles) | 3 | Lun, jue, dom |
| Stories | 3 | Lun, mié, vie (flex hasta 5) |
| Reels | 2 | Mar, vie |

> Flex permitido: 1-2 stories extra en días de reto o eventos (liberación del reto diario, ruleta de la trastienda).

## 6 · Horarios sugeridos LATAM

Ventanas ideales (hora local de cada ciudad); apuntar a lunes-jueves y domingos.

| Ventana | Ciudades útiles | Para |
|---|---|---|
| 07:30–09:00 | CDMX · Bogotá · Lima · Quito | stories matutinas, reto diario recién liberado |
| 12:30–13:30 | CDMX · Bogotá · Lima | posts informativos (pausa de comida) |
| 19:00–21:00 | CDMX · Bogotá · Lima · Guayaquil | reels y stories de noche (pico móvil) |
| 21:00–22:30 | Buenos Aires · Santiago · Montevideo | refuerzo nocturno de stories |

Regla simple: **reels de 19:00 a 21:00, posts a mediodía, stories en las horas pico** (mañana y noche).

## 7 · Hashtags (sets pequeños, 5-8 por post)

Regla: 2 sets base + 1 set variable. Máximo 8, sin relleno genérico tipo #fyp.

- **Base Prodigia:** `#Prodigia` `#CálculoMental` `#EntrenaTuCabeza`
- **Gaming/quiz:** `#JuegoDeMente` `#AprendeJugando` `#RetoDiario`
- **Variable según pieza:**
  - Mundos: `#Numeria` `#Geografía` `#Quimia` … (el mundo protagonista de la pieza)
  - Ranked: `#Ranked` `#ELO` `#BúscateUnReto`
  - Trastienda/tienda: `#Trastienda` `#ChispasProdigia`
- Ejemplo cargado: `#Prodigia #CálculoMental #JuegoDeMente #Ranked #Quimia #AprendeJugando #EntrenaTuCabeza`

## 8 · Cómo reciclar contenido (un tema, tres formatos)

1. **Reel → Story:** sube el primer corte como story con sticker de encuesta ("¿Lo hiciste en 60 s?").
2. **Reel → Post:** usa el frame más fuerte como post estático + screenshot real de fondo.
3. **Post → Carrusel:** el post de una mecánica se desglosa en 3-5 slides (reglas del carrusel).
4. **Story → Highlight:** cada story de reto/ranking se guarda en un highlight con portada de número-faro.
5. **Captura real → cualquier pieza:** todos los fondos salen de `assets/pantallas-reales/*` y `assets/pantallas-oscuras/*`; nunca de stock.

## 9 · Calendario de las 2 semanas

### Semana 1 — PRODIGIA DARK

| Día | Contenido | Pieza | Formato | Story | Reel |
|---|---|---|---|---|---|
| Lunes | Post: "La noche es tu modo" | POST-DK-001 | 1080×1080 | STY-DK-001 (encuesta noche/día) | — |
| Martes | Reel: "5+6 a través de los mundos" | REEL-DK-001 / TH-002 | 1080×1920 | STY-DK-002 (votación de marca en 60 s) | REEL-DK-001 |
| Miércoles | Story: countdown del reto | — | 1080×1920 | STY-DK-003 | — |
| Jueves | Carrusel: "Los 60 segundos por dentro" | CAR-DK-002 | 1080×1080 ×5 | STY-DK-004 (giro de regalo) | — |
| Viernes | Reel: "Hoy todos rinden igual" | REEL-DK-002 / TH-006 | 1080×1920 | STY-DK-005 (tu racha no duerme) | REEL-DK-002 |
| Sábado | UGC: respuestas a encuestas, republicar mejores resultados | — | 1080×1920 | flex | — |
| Domingo | Post: "El ranking es justo" | POST-DK-004 | 1080×1080 | — | — |

**Totales semana 1:** 3 posts (1 carrusel) · 5 stories · 2 reels.

### Semana 2 — PRODIGIA LIGHT

| Día | Contenido | Pieza | Formato | Story | Reel |
|---|---|---|---|---|---|
| Lunes | Post: "Sin presión al empezar" | POST-LT-002 | 1080×1080 | STY-LT-001 (encuesta mañana/noche) | — |
| Martes | Reel: "POV: tu cerebro en 60 s" | REEL-LT-001 / TH-001 | 1080×1920 | STY-LT-002 (tu título de hoy) | REEL-LT-001 |
| Miércoles | Story: votación del primer mundo | — | 1080×1920 | STY-LT-003 | — |
| Jueves | Carrusel: "Tu mochila de ítems" | CAR-LT-001 | 1080×1080 ×5 | STY-LT-004 (countdown reto) | — |
| Viernes | Reel: "El mismo examen para todos" | REEL-LT-002 / TH-006 | 1080×1920 | STY-LT-005 (invita a un amigo) | REEL-LT-002 |
| Sábado | UGC: capturas de racha/precisión compartidas | — | 1080×1920 | flex | — |
| Domingo | Post: "2 ciudades gratis, para siempre" | POST-LT-003 | 1080×1350 | — | — |

**Totales semana 2:** 3 posts (1 carrusel) · 5 stories · 2 reels.

### Highlights a crear (portadas desde THUMBNAILS-BANK)

| Highlight | Portada sugerida | Contenido guardado |
|---|---|---|
| Cómo se juega | TH-001 (`60`) | CAR-DK-002, sprint |
| Retos | TH-006 (`5`) | stories de reto diario/semanal |
| Ranking | TH-008 (`1`) | podio y ranking |
| Trastienda | TH-011 (`20`) | ruleta y giros |
| Los 8 mundos | TH-003 (`8`) | CAR-DK-003, demos 24-30 |
| Progreso | TH-013 (`3000`) | desbloqueos y rachas |

## 10 · Checklist antes de publicar

- [ ] Copy neutro: sin "vos/tenés/podés/mirá/hacé"; sin "vale/vosotros".
- [ ] Tilde en "tú" solo cuando es pronombre; acentos correctos (cálculo, también, acierto).
- [ ] 1 número-faro por pieza, JetBrains Mono; títulos Space Grotesk.
- [ ] Logo aro + chispa abajo; zona segura 8%; tercio inferior libre.
- [ ] CTA pill de 3 palabras máx.
- [ ] Hashtags 5-8, sin #fyp ni relleno.
- [ ] La afirmación está en la lista de claims reales (no inventar funcionalidades).
- [ ] No mencionar feed social, temporadas ni peaks.
- [ ] Captura real: `assets/pantallas-reales/*` o `assets/pantallas-oscuras/*`.