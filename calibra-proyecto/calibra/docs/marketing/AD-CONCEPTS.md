# AD-CONCEPTS — Inventario de conceptos publicitarios de Prodigia

> Documento principal de la línea de marketing. Cada concepto indica: gancho, ángulo emocional, evidencia REAL en código (VERIFICADO EN CÓDIGO) o HIPÓTESIS, y dónde se publicaría.
> Estado: 2026-09-07. Fuente: auditorías de subagents (ver agent-work/ACTIVE.md).

## Cómo leer la tabla de prioridad

- **P0** = listo para producir ya (la funcionalidad está verificada y es fotogénica).
- **P1** = muy bueno, falta un detalle visual/grabación.
- **P2** = interesante, necesita edición o es nicho.
- **P3** = en pausa (funcionalidad hipótesis o en riesgo).

---

## Conceptos P0 (producción urgente)

### AD-01 · "El fantasma" — duelos en vivo contra el fantasma de tu rival
- Concepto: mostrás el SprintRunner contra la barra rival avanzando SOLA (el rival ya terminó). El gancho: "Tu rival ya terminó. Igual lo ves jugar." El fantasma se delata: puntitos de progreso sueltos, luego "👻".
- Elektra emocional: sorpresa + competencia + misterio. Único pocas edtechs lo tienen.
- Evidencia: `0028_duelos_fantasma.sql`, `src/components/duelos/ProgresoRivalEnVivo.tsx`.
- Formato: video corto TikTok/Reels/Shorts + captura estática del VS.
- PRIORIDAD: P0.

### AD-02 · "Un pentagrama en una app de matemática" — Melodía
- Concepto: casi nadie sabe que existe un mundo de MÚSICA. Mostrar Pentagrama SVG con notas doradas, clave de sol dibujada a mano, y "¿Adivinás qué nota es?" con oído absoluto.
- Elektra emocional: asombro por lo "serio" de la app + curiosidad.
- Evidencia: `src/components/melodia/Pentagrama.tsx`, `src/lib/practica/melodia.ts`, migración `0096_oído_absoluto`.
- Formato: estático + video.
- PRIORIDAD: P0. Es el world card más fotogénico.

### AD-03 · "La misma lista hoy para todo el mundo" — Reto diario con ranking
- Concepto: screenshot del reto diario + tablero de ranking con "tu puesto". El gancho: "Hoy todos los de Prodigia tienen las mismas 5 preguntas. Hay un ranking del día."
- Elektra emocional: pertenencia + competencia ligera + FOMO.
- Evidencia: `0113`, `src/lib/retoDiario.ts:204-208`.
- Formato: estático antes/después de jugar → video con escala en ranking.
- PRIORIDAD: P0.

### AD-04 · "Dos mundos gratis, para siempre" — Onboarding honesto
- Concepto: grid de 8 ciudades con candados, elegís 2, quedan desbloqueados para siempre. Ángulo: freemium transparente, sin suscripción.
- Elektra emocional: confianza (vs apps que gordean).
- Evidencia: `0112_flujo_bienvenida.sql`, `OnboardingForm.tsx`. Precio hoy: 3.000 Chispas cada uno (`precios.ts`).
- Formato: estático con las 8 tarjetas.
- HAY QUE ACTUALIZAR con el copy literal de la app ("gratis para siempre... los demás se desbloquean después con Chispas").
- PRIORIDAD: P0.

### AD-05 · "2 + 2 que crece rápido" — Dificultad adaptativa
- Concepto: primera pregunta te la resuelven fácil... y a las 3 seguidas subís de nivel. El "dial/marcador de nivel" (`LevelDial`) subiendo mientras jugás.
- Elektra emocional: progreso visible + sensación de estar "en un videojuego real".
- Evidencia: `src/lib/practica/skillLevels.ts:9-32`, `sprintrunner` con LevelDial.
- Formato: video corto con overlay del nivel subiendo.
- PRIORIDAD: P0.

### PRIMEROS P0 pendientes de Aprobar
- AD-P1 · "Era un Bot 😄" — Clan de Bots (0866/0077): promesa social con bots que "se cazaban" al final.
- AD-P2 · "Nunca perdés lo que sumaste" — Chispas permanentes vs XP que se reinicia (economía doble).

---

## Conceptos P1

### AD-06 · "El mapa te pregunta / ¿Dónde está?" — Geografía
- Concepto: mapa real (topojson de world-atlas) con la pregunta. El mundo se pinta en azul marino. Un clic, verde/acierto.
- Evidencia: `src/components/GeografiMapa.tsx:40-88`.
- Formato: video corto + GIF.

### AD-07 · "El esqueleto te responde" — Anatomía
- Concepto: esqueleto SVG clickeable. "¿Cuál es el fémur? Tocalo." El hueso se ilumina verde/coral.
- Evidencia: `EsqueletoClickeable.tsx`, `public/data/esqueleto-oseo.svg`.
- Formato: video corto.

### AD-08 · "Rankings justos" — desde Platino jugás contra todos, sin smurfs
- Concepto: anti-smurf server-side ("Todas las ciudades") como destacado de fair play.
- Evidencia: `0078_platino_solo_todas_las_ciudades.sql:63-65`, `0042`.
- Formato: estático + post de feed.
- PRIORIDAD: P1.

### AD-09 · "La guerra de tu clan" — guerra semanal con chat moderado
- Concepto: estandarte + ciudad + "Tu clan vs el rival de la semana".
- Evidencia: `0070`, `ClanesClient.tsx:196-222`.
- Formato: video con tablero de guerra.

### AD-10 · "El boost de las Chispas" — economía/moneda
- Concepto: animación de Chispas sumando, boost x1.5, escudo, congelar racha → "Desayunaste, sumás Chispas".
- Evidencia: `src/lib/tienda/costos.ts`, `src/app/api/tienda/comprar/route.ts`.

---

## Conceptos P2/P3

- AD-11 (P2) · "Nivel que no es humo" — nivel de mundo = 50% dominio real de subtemas (`0080`).
- AD-12 (P2) · "La lección del atajo" — técnicas reales de cálculo mental ("×9 = ×10 meno el número", `0018:47-56`).
- AD-13 (P3) · "Pro — próximamente" — NO publicitar aún (`pro/page.tsx` sin pago).
- AD-14 (P3) · "Invitados fuera del ranking" (0342) — mensaje de "por qué crear cuenta", pero como claim de ranking correcto ya está en AD-08.

## Reglas anti-mentira (no publicar)

| Tentación | Riesgo |
|---|---|
| "Diagnóstico inicial mide tu nivel" | El onboarding NO mide nivel (`onboarding/page.tsx:30-33`) |
| "Pros / Pro" | No existe el pago |
| "En vivo / simultáneo" para retos | El reto es ranking de completados, no en vivo |
| "Contenido infinito" para Historia | Bancos curados finitos |
| "Casual ignora tu ranking" | Casual usa ELO oculto para dificultad |