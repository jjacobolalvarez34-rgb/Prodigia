# 04 — Bucle de enganche: por qué la gente vuelve

> Estado: PROPUESTA. La mayoría de las piezas **ya existen** en el backend; lo que falta es
> ordenarlas en bucles claros y presentarlas con peso visual. Lo marcado NUEVO requiere PO.

## 1. Principio

Prodigia ya tiene más sistemas de retención que muchas apps grandes (racha, meta diaria, retos
diario y semanal, niveles de mundo, nivel de cuenta, ELO, clanes con misión, logros, títulos,
cosméticos). El problema en la web no es que falten: es que **compiten entre sí por atención** y
casi ninguno tiene un momento visual fuerte. La app los ordena en cuatro bucles de distinto largo,
y cada uno tiene **una sola** pantalla o momento donde brilla.

## 2. Los cuatro bucles

### 2.1 Bucle de sesión (60-90 s) — "una más"
```
Abrir app → [1 toque] Continuar → Sprint (5-10 preguntas) → Cascada de recompensas → OTRA PARTIDA
     ↑                                                                                   │
     └───────────────────────────────────────────────────────────────────────────────────┘
```
- Llegar a jugar en **1 toque** desde Hoy (tarjeta Continuar). Hoy en la web son 3-4 toques.
- El combo dentro del sprint (NUEVO en lo visual; el cálculo de velocidad ya existe) da tensión.
- La cascada termina **siempre** con "Otra partida" como botón principal.
- Calibración adaptativa (EXISTE): la dificultad sube y baja sola, así el sprint casi nunca es
  aburrido ni frustrante. Es la mejor mecánica de retención del producto y hay que decirlo en la UI
  ("Subiste a nivel 7 en Fracciones").

### 2.2 Bucle diario — "no romper la racha"
| Pieza | Estado | Momento visual |
|---|---|---|
| Meta diaria (XP del día) | EXISTE `daily_progress` | Anillo en Hoy que se cierra con una animación dorada |
| Racha diaria | EXISTE | Llama en el HUD; +1 con animación de cuentakilómetros |
| Reto diario (mismo set para todos) | EXISTE (0113) | Tarjeta en Hoy; al terminar, comparar con amigos |
| Congelamiento / escudo de racha | EXISTE en tienda (450 Chispas) | Ícono de hielo sobre la llama cuando protege |
| Notificación "racha en riesgo" | EXISTE Edge Function `racha-en-riesgo` | Push a la hora habitual del usuario menos 2 h |

NUEVO propuesto: **1 congelamiento gratis por semana** para todos. La racha tiene que motivar, no
angustiar; perder una racha de 60 días por un día de enfermedad hace que la gente abandone.

### 2.3 Bucle semanal — "subir en la liga"
| Pieza | Estado | Momento visual |
|---|---|---|
| Ranking semanal por Exp | EXISTE (Exp semanal separada de Chispas, decisión de diseño) | Tarjeta de liga en Hoy con posición y tiempo restante |
| Ligas con ascenso/descenso (grupos de 30 por nivel: Bronce → Prodigio) | NUEVO | Cierre de semana: pantalla "Subiste a Liga Plata" |
| Reto semanal (45 preguntas) | EXISTE | Tarjeta en Hoy con progreso x/45 |
| Misión del clan (3000 Exp conjunta → 2000 Chispas, reclamar con botón) | EXISTE (0239/0240) | Barra del clan en Hoy; botón dorado RECLAMAR |

Las ligas son el cambio de mayor impacto de todo el documento: convierten el ranking global (donde
el 95 % nunca ve su nombre arriba) en una competencia de 30 personas de su nivel, donde subir es
posible cada semana. Requiere migración (asignar grupos cada lunes, reutilizando el cálculo de
Exp semanal que ya existe).

### 2.4 Bucle largo — "encender los 13 mundos"
| Pieza | Estado |
|---|---|
| Nivel de mundo 1-100 (curva 34/45/21) | EXISTE (0117, 0223) |
| Nivel de cuenta + recompensa `50·n+250` Chispas | EXISTE (0118, 0156) |
| Colección de 13 mundos (2 gratis, resto por Chispas o Pro) | EXISTE |
| Rangos Bronce → Prodigio (ELO) | EXISTE |
| Logros y títulos (~50) | EXISTE |
| Cosméticos (marcos, fuentes, animaciones, fondos) | EXISTE |
| Temporadas de 8-12 semanas con cosméticos que dicen "yo estuve aquí" | NUEVO (plan de negocio §14) |
| Pase de temporada gratis/premium | NUEVO, fase posterior (plan de negocio §15) |

Momento visual clave: la pestaña **Mundos**, donde cada ciudad apagada es una invitación y cada
ciudad encendida es orgullo.

### 2.5 Identidad — "mi Placa" (atraviesa los cuatro bucles)
La Placa de jugador (`02-SISTEMA-VISUAL.md` §10) es la razón para gastar Chispas y la forma de
mostrar lo logrado: el fondo animado, el nombre con efecto, el marco de ciudad (nivel 40) y el
título dicen quién eres antes de que juegues. Por eso aparece en los momentos de mayor atención:
pantalla VS, podio y liga, cuadrícula de amigos, clan. La cascada de recompensas termina mostrando
qué te falta para el próximo cosmético ("Te faltan 340 ✦ para el nombre en Neón").

## 3. Social como motor

- **Duelos con fantasma** (EXISTE): siempre hay rival, aunque nadie esté conectado. Es la ventaja
  competitiva más fuerte del producto; en la app merece la pantalla VS más cuidada.
- **Retar a un amigo** desde cualquier resultado ("Hice 9/10, ¿me superas?") con link que abre la
  app (App Links) o la web si no la tiene.
- **Clan**: la misión semanal hace que cada partida ayude a otros. Mostrar "Tu partida sumó 128 Exp
  al clan" en la cascada.
- **Compartir** logros como imagen (EXISTE `CompartirLogroBoton`) → en Android, hoja de compartir
  nativa con la imagen generada.

## 4. Recompensas: variedad sí, azar pagado no

- La sorpresa se logra con **presentación**, no con azar: el "cofre" de la meta diaria tiene un
  contenido fijo y conocido de antemano, pero se abre con una animación. Un cofre semanal por
  racha de 7 días puede traer un cosmético de la colección de la temporada, elegido por reglas
  claras (el siguiente que no tienes).
- Si algún día hubiera recompensas aleatorias: **nunca comprables** con dinero ni con Chispas
  compradas, y siempre con probabilidades visibles (Play lo exige para cajas de botín).

## 5. Notificaciones

| Tipo | Estado | Regla |
|---|---|---|
| Racha en riesgo | EXISTE | 1 por día como máximo, a la hora habitual de juego − 2 h |
| Te retaron a un duelo | EXISTE `notify-duelo` | Inmediata |
| Mensaje del clan / mensaje directo | EXISTE `notify-clan-mensaje` | Agrupadas; no más de 1 cada 30 min |
| Reto diario disponible | NUEVO | Solo si el usuario la activa |
| Tu liga termina en 3 h y estás en zona de ascenso/descenso | NUEVO | 1 por semana |
| Misión del clan completada: reclama tu recompensa | NUEVO | 1 por semana |

Reglas generales:
- Tope global: **2 notificaciones de retención por día** (las de duelos y mensajes no cuentan).
- Horario silencioso por defecto 21:00-08:00 para menores de 18 (NUEVO).
- El texto es concreto y útil ("Tu racha de 12 días termina a medianoche. 1 sprint la salva."),
  nunca culpa ni manipulación.
- Pedir el permiso después del primer sprint, con una pantalla propia que diga para qué.

## 6. Límites éticos (no negociables por el público)

El público primario es 8-15 años (`docs/marketing/AUDIENCE.md`). "Adictiva" aquí significa
**que dé ganas de volver**, no que atrape. Por eso:

1. **Nada de azar con dinero real** ni con moneda comprable. Trastienda fuera de la app (PROD-01).
2. **No hay compras dentro de una partida** ni ofertas en la cascada de recompensas.
3. **Nada que castigue no jugar** más allá de perder la racha (y hay congelamiento gratis semanal).
4. **Aviso de tiempo** para menores de 13: a los 45 minutos seguidos, "¡Buen trabajo! ¿Una pausa?"
   (NUEVO, configurable por el adulto a cargo en una versión futura).
5. **Sin contadores de urgencia falsos** en la tienda ("¡Solo quedan 2!").
6. **Ventaja competitiva nunca se vende** (ya es regla del plan de negocio §8): el ELO sigue limpio.

Esto además no es solo ética: Google Play revisa todo esto en apps con público infantil, y una
suspensión de la app cuesta mucho más que las ventas perdidas.

## 7. Métricas para saber si funciona

| Métrica | Qué mide | Meta inicial (a ajustar con datos) |
|---|---|---|
| Retención D1 / D7 / D30 | Si vuelven | 40 % / 20 % / 10 % |
| Sprints por sesión | Bucle de sesión | ≥ 2,5 |
| Sesiones por día (usuarios activos) | Bucle diario | ≥ 1,6 |
| % de usuarios con racha ≥ 7 | Hábito | ≥ 15 % |
| Aceptación de notificaciones | Confianza | ≥ 60 % |
| Sesiones sin fallos (crash-free) | Calidad | ≥ 99,5 % |
| Tiempo hasta el primer sprint (usuario nuevo) | Onboarding | < 60 s |

Herramienta: eventos propios en una tabla de Supabase (sin SDK de terceros al principio, para no
complicar el formulario de Data safety ni la política de Familias). Crashes: el reporte de Play
Console (Android vitals) al principio; si se suma un SDK como Sentry, verificar antes que esté
autocertificado para el programa de Familias.
