# COMPETITIVE-RESEARCH — Análisis de competencia

> Estado: HIPÓTESIS de mercado (sin live research — todo lo de Prodigia es VERIFICADO EN CÓDIGO; los datos de competencia son conocimiento general, NO medido). Marcar cada claim.

## Posicionamiento relativo

Prodigia se posiciona en el cruce de: **práctica seria + juego competitivo + 8 materias**.

| Competidor | Foco | Cómo lo hace | Brecha para Prodigia |
|---|---|---|---|
| Khan Academy | Lecciones+práctica | Video cursos, sin ranking competitivo (HIPÓTESIS) | No tiene duelo/ranking que enganche; Prodigia tiene juego |
| Math games clásicos (Math Blaster, Prodigy) | Matemática | Ambientado, sin 8 materias reales (HIPÓTESIS) | Prodigia tiene 8 mundos (música, anatomía, historia...) |
| Kahoot/trivios | Quiz con salas | Multiplayer sincrónico, contenido en masa | Prodigia es práctica adaptativa, no quiz |
| Duolingo | Idiomas | Racha, leagues, XP — el abuelo de la gamificación (HIPÓTESIS) | Prodigia aplica el mismo CASCO (racha+leagues) a materias escolares; sin cursos de video |
| Photomath/GeoGebra | Resolver | Herramientas de respuesta, no entrenamiento (HIPÓTESIS) | Prodigia entrena la cabeza, no te da la respuesta |

## Diferenciales defendibles vs competencia (VERIFICADO en código)
1. **Duelos en tiempo real con fantasma del rival** — pocas apps lo hacen; ninguna edtech (HIPÓTESIS de mercado, VERIFICADO el feature: 0028, 0038).
2. **8 mundos con contenido REAL** (no solo sumar): pentagrama con oído absoluto, tabla periódica, esqueleto, mapa real, trigonometría con SVG (`mundo precios`, `melodia.ts`, `MoleculaSVG`, `GeografiaMapa`).
3. **Ranking justo** (anti-bot 0042, anti-smurf 0078, tiempos sospechosos no cuentan) contra el problema de "cualquiera infla el ranking".
4. **Reto diario como evento comunitario** (misma lista para todos; Nov).

## Riesgos competitivos
- Si Kahoot/Prodigy agrega 8 materias + ranking, el juego se vuelve alas demasiado parecidas (HIPÓTESIS).
- Sin "cursos de video" Prodigia pierde al público que quiere teoría (pero el mensaje "es práctica, no curso" evita confusión).
- El precio de mundos (3.000 Chispas) lo posiciona como "gacha de desbloqueo"; la promesa de "2 gratis para siempre" lo diferencia del "todo cerrado" (VERIFICADO `0112`, `precios.ts`).

## Qué NUNCA comparar en público
- No comparar 1:1 con un competidor (reglamentación/redes) → mostrar el propio producto y su feature "raro".
- No decir "el Duolingo de las matemáticas" sin verificar que la app quiera esa asociación (HIPÓTESIS de dirección de marca, requiere decisión del usuario).

## Fuentes
- Este análisis NO fue ejecutado contra internet (sin acceso); los datos de competidores son HIPÓTESIS/contexto general. Rehacer con live research antes de pautar (task futura en ACTIVE.md).