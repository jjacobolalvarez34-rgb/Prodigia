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
| Correr las migraciones **0292, 0293, 0294, 0295, 0296** (y las que salgan: 0297–0300) en Supabase, en orden | TE TOCA | 0291 ya está (verificado el 2026-10-20). **0292 antes del sábado 24 a las 21:00 Colombia**: sin ella falla Halloween. |
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
| Videos de Muertos, Diwali, Viernes Estelar y Año Nuevo | HECHO | Los 6 videos de evento (Halloween, Navidad, Muertos, Diwali, Viernes Estelar, Año Nuevo) están en la web y la app. Para el teléfono falta el APK nuevo. Conviene escuchar el audio (los agentes solo midieron niveles). |
| Bono de EXP: entender qué es, quizá mejorarlo, y explicarlo en tutorial y landing | HECHO | Son dos bonos: la ciudad del paquete en paracaídas da doble Exp ese día, y una constelación completada de noche da 20 % más Chispas (el doble en la Gran Alineación). Explicados en la landing y en el tutorial de la app (la web ya lo tenía en las constelaciones). Si quieres cambiar el bono por otra cosa, lo conversamos. |
| Temas de la app: comprarlos con Cometas o ganarlos en cápsulas fuertes | EN CURSO | Hoy los 13 de `src/lib/recompensas/temas.ts` solo dicen «Próximamente». Necesita migración. |
| Temas de la app compatibles con los eventos | EN CURSO | Ir de a uno con cada capa de `src/lib/temas/temas.ts`. |
| Tabla «qué puedes obtener» de cada cápsula | EN CURSO | Ya te la mostré en el chat. Falta: sumar los temas y mostrarla dentro de la app y la web. |
| Fondos de los chats más bonitos | HECHO | 8 escenas ilustradas (cuaderno, noche estrellada, océano, bosque, atardecer, aurora, ciudad de neón, galaxia), el mismo dibujo en web y app. Commit fd0cbfa1. |
| Clanes como territorios orgánicos (no cuadrícula) que crecen con cada clan nuevo | HECHO | Cada clan es una región irregular, más grande según miembros y nivel; el mundo es una isla; un clan nuevo funda su territorio en la frontera y solo cambian sus vecinos. Tu clan con borde dorado, «NUEVO» los de menos de 7 días, botón «Ir a mi clan». Sin migración. |
| Invitar a duelo desde el chat; la invitación (enviada, aceptada, cancelada) como mensaje | HECHO (falta correr 0298) | Botón «Retar a duelo» en el chat; el reto queda como tarjeta con su estado en vivo (enviado, aceptado, rechazado, cancelado, vencido) y botones para responder. Sin la 0298 el reto funciona pero no aparece la tarjeta. No probado con dos personas reales. |
| Compartir el resultado (o la repetición) de una partida; en el historial, tocar y ver sus estadísticas | HECHO (falta correr 0300 y el APK) | Tocar un duelo del historial abre su detalle: estadísticas tuyas y del rival, pregunta por pregunta y una repetición al ritmo real. Botón «Compartir» con tarjeta-imagen en los resultados y el detalle, y enlace público /partida/<id>. La repetición no muestra las preguntas (no se guardan; queda para el combate nuevo) ni el cambio de ELO por duelo. La imagen en la app necesita el APK nuevo. |
| ELO de rankeds como Brawlhalla: 500 inicial; Bronce 800, Plata 1100, Oro 1400, Platino 1700, Diamante 2000; top 100 = Prodigio | HECHO (falta correr 0296) | Hierro 0–799 (se empieza en 500), Bronce 800, Plata 1100, Oro 1400, Platino 1700, Diamante 2000, Prodigio = top 100 con 2000 o más. Los jugadores actuales conservan su rango en la escala nueva; quien nunca jugó ranked queda en 500. Migración 0296. |
| Temporadas de ranked: cada cuánto acaban y un anuncio con las recompensas (Diamante v1, v2, v3…, título, cápsulas) | HECHO (falta correr 0296) | Cada temporada termina en una Gran Alineación (28 días; la 1 termina el sábado 24). Al terminar sale un anuncio con el rango alcanzado y su tier v1, v2, v3…, título desde Oro y cápsulas (Hierro: liga; Bronce/Plata/Oro: liga de su color; Platino: oro + estelar; Diamante: oro + supernova; Prodigio: 2 supernova + prisma). En Rankeds se ve la temporada y cuánto le falta. |

| Organizar todas las carpetas de Prodigia en D: (marketing, videos, renders, builds, capturas regadas) | FALTA | Pedido 2026-10-21. Antes de mover nada, hacer un inventario y proponerte la estructura. Ojo: `D:\Repositorios\Prodigia-build` es una copia limpia del repo solo para compilar el APK (se puede borrar después con `git worktree remove`). |
| APK 0.6.4 (versionCode 10) | EN CURSO | Compilando aparte desde la copia limpia `D:\Repositorios\Prodigia-build` (log `D:ndroid-build\compilar46.log`); sale en `D:\Prodigia-APK\Prodigia.apk`. Incluye los 6 videos, ELO y temporadas, chat, clanes, compartir partidas e historial. NO incluye los temas de la app (siguen en curso). Al terminar: release v0.6.4. |

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


PORFA MIRAME, deje a opencode hacienod unas imagenes sjsjs. TU porfa termina las cosas todo todiyto, excepto ps lo que toca conmigo si? si puedes copilar copila, te quiero gracias, cuando termines quitaesta linea pa no ensuciar este archivo, te quiero. 