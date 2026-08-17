# Mecánica del producto — v1 (solo aritmética)

## Filosofía
No competimos contra otros usuarios ni contra ThatQuiz. El eje es "mejorá
rápido, contra vos mismo". Cero fricción punitiva (sin vidas/corazones que
se acaban). El error nunca resta, solo no suma.

## Tres sistemas separados — no confundirlos

### 1. Calibración (momentánea, por operación)
Nivel 1-10, uno por cada `problem_type` (suma, resta, multiplicacion,
division). Sube con 3 aciertos seguidos, baja con un error. Vive en
`skill_levels`, se actualiza en cada `attempt`. Es lo que decide qué
problema te toca *ahora mismo*.

### 2. XP (acumulativo, para siempre)
`XP = 10 base × multiplicador_de_nivel × bonus_de_velocidad`
Nunca baja. Alimenta el progreso visible y la racha diaria. No hay
penalización de XP por error, solo ausencia de ganancia.

### 3. Racha diaria (hábito)
Días consecutivos donde el usuario alcanzó su meta diaria de XP (default:
20 XP, configurable). Se guarda en `daily_progress`. Distinta de los
aciertos seguidos dentro de un sprint — esa es la calibración, no la racha.

## Estructura de una sesión (sprint)
- El usuario elige tipo de operación (o "mixto").
- Sprint corto por defecto: 10 problemas o 60 segundos, lo que llegue primero.
- Sin límite de intentos fallidos.
- Cierre de sprint: XP ganado, precisión, comparación con el propio
  promedio histórico del usuario (nunca con otros usuarios).

## Alcance del MVP
Solo aritmética: suma, resta, multiplicación, división. Nada de
fracciones, geometría, lógica ni técnicas todavía — eso es v2 en adelante.

## Fuera de alcance por ahora (decisión deliberada)
- Ligas / leaderboards
- Vidas o corazones
- Racha con "congelador" (streak freeze) — se puede sumar después
