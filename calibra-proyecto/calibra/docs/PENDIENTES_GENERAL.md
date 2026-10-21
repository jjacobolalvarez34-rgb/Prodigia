# Pendientes generales — control

Lista única para llevar el control de todo lo que pediste. Se actualiza en cada sesión.
El detalle y la historia de cada punto siguen en `PENDIENTES_2026-10-13.md` (el número
entre paréntesis es su línea o su número allí).

Estados: **HECHO** · **EN CURSO** (lo estoy haciendo ahora) · **FALTA** (todavía no se
empezó) · **TE TOCA** (lo haces tú) · **IDEA** (hay que conversarlo antes de construir).

Última actualización: 2026-10-21.

---

## 1. Lo que te toca a ti

| Qué | Estado | Nota |
|---|---|---|
| Correr las migraciones **0292, 0293, 0294, 0295** en Supabase, en orden | TE TOCA | 0291 ya está (verificado el 2026-10-20). **0292 antes del sábado 24 a las 21:00 Colombia**: sin ella falla Halloween. |
| Release **v0.6.3** en GitHub con `D:\Prodigia-APK\Prodigia.apk` | TE TOCA | El APK ya está listo (2026-10-20, 21:44). Antes del sábado 24. |
| Productos de Cometas en Paddle (6) | TE TOCA | Cuando la app esté completa. |
| Google Play: cobros, publicación, ficha (49, 50, 54) | TE TOCA | Para después. |
| Prueba de duelo en vivo con dos teléfonos (53) | TE TOCA | |

## 2. Pedidos del 2026-10-20 y 2026-10-21

| Pedido | Estado | Dónde quedó |
|---|---|---|
| Que nadie pueda ver un evento antes de su fecha | HECHO | Fila de Ajustes quitada; `?tema=` solo en desarrollo. Commit 8c1b442. |
| Contadores hasta minutos y segundos (como la Gran Alineación) | HECHO | `faltaPara` en `src/lib/temas/eventos.ts`; reloj por segundo `RelojFalta` en web y app (cartel del evento y pantalla del evento). |
| Quitar la luna fija de las ciudades | HECHO | Era el adorno «luna llena» de Halloween; quitado. También la luna gris fija de los mundos bloqueados. |
| Corte feo de estrellas y cielo al terminar un sprint | HECHO | `mobile/src/ui/FondoCiudad.tsx`: un solo cielo de arriba abajo con la hora real de la ciudad; estrellas solo de noche; entrada más suave. |
| Pantalla de carga temática | HECHO | App (`PantallaCarga`): colores, partículas, accesorio en el logo y nombre de la fiesta. Web (`loading.tsx` + `CargaTemporada.tsx`). Carga del final del sprint: partículas de la fecha. |
| Líneas de las constelaciones completas más vistosas | HECHO | Rayo de luz en capas (halo, degradado, núcleo blanco) en web y app, y un pulso que recorre cada línea en la web. Revisado en imagen. Commit a930260. |
| Videos de Muertos, Diwali, Viernes Estelar y Año Nuevo | EN CURSO | 4 agentes trabajando en `prodigia-marketing\videos\<evento>\`. Al terminar: copiarlos al repo, `VIDEO_DE_TEMA` y `VIDEOS`, y recompilar el APK. |
| Bono de EXP: entender qué es, quizá mejorarlo, y explicarlo en tutorial y landing | FALTA | |
| Temas de la app: comprarlos con Cometas o ganarlos en cápsulas fuertes | FALTA | Hoy los 13 de `src/lib/recompensas/temas.ts` solo dicen «Próximamente». Necesita migración. |
| Temas de la app compatibles con los eventos | FALTA | Ir de a uno con cada capa de `src/lib/temas/temas.ts`. |
| Tabla «qué puedes obtener» de cada cápsula | FALTA | Ya te la mostré en el chat. Falta: sumar los temas y mostrarla dentro de la app y la web. |
| Fondos de los chats más bonitos | FALTA | |
| Clanes como territorios orgánicos (no cuadrícula) que crecen con cada clan nuevo | FALTA | |
| Invitar a duelo desde el chat; la invitación (enviada, aceptada, cancelada) como mensaje | FALTA | |
| Compartir el resultado (o la repetición) de una partida; en el historial, tocar y ver sus estadísticas | FALTA | Ojo: cambia cuando se rediseñen los combates. |
| ELO de rankeds como Brawlhalla: 500 inicial; Bronce 800, Plata 1100, Oro 1400, Platino 1700, Diamante 2000; top 100 = Prodigio | FALTA | Necesita migración (los umbrales viven en la base). |
| Temporadas de ranked: cada cuánto acaban y un anuncio con las recompensas (Diamante v1, v2, v3…, título, cápsulas) | FALTA | Propuesta: que la temporada cierre en cada Gran Alineación (cada 28 días). |

## 3. Pendientes de antes que siguen abiertos

| Qué | Estado | Nota |
|---|---|---|
| Colecciones propias para los demás eventos (como la de Halloween) | FALTA | Requiere diseño antes. |
| Minieventos propios de cada fiesta (los de `celebracion.ts`) | FALTA | Halloween y Día de π ya están. |
| Resto del plan de economía: pack de inicio, prueba gratis de Pro, etiqueta «NUEVO», panel de economía (52) | FALTA | La fusión de cápsulas ya está. |
| Duelo casual leído como reto (1) | EN CURSO | Ver detalle en el archivo viejo. |
| Tablero en vivo en las rankeds (98) | IDEA | |
| Clanes: planeación completa (99) | IDEA | Lo de los territorios (arriba) es parte de esto. |
| Feed social (100) | IDEA | |
| Docentes (101) | IDEA | Tienes una solución en mente: contármela. |

## 4. Al final de esta tanda

- Subir todo lo que está «HECHO (sin subir)».
- Integrar los 4 videos cuando terminen.
- Compilar el APK una sola vez, avisándote antes.
