# Pendientes generales — control

Lista única para llevar el control de todo lo que pediste. Se actualiza en cada sesión.
El detalle y la historia de cada punto siguen en `PENDIENTES_2026-10-13.md` (el número
entre paréntesis es su línea o su número allí).

Estados: **HECHO** · **EN CURSO** (lo estoy haciendo ahora) · **FALTA** (todavía no se
empezó) · **TE TOCA** (lo haces tú) · **IDEA** (hay que conversarlo antes de construir).

Última actualización: 2026-10-23.

---

## 1. Lo que te toca a ti

| Qué | Estado | Nota |
|---|---|---|
| Correr la migración **0302** en Supabase (y la 0303 si sale de las cápsulas) | TE TOCA | Hasta la 0301 ya están todas (verificado el 2026-10-23). |
| Cambiar el nombre que sale al entrar con Google («Acceder a yawsx…supabase.co») | TE TOCA | Ver la nota «Nombre en el acceso con Google» en la sección 2b. |
| Paddle: pasar del sandbox al real (productos, claves, webhook, Vercel) | TE TOCA (HOY, antes de la publicidad) | Guía paso a paso en la sección 2b: «Paddle: pasar del sandbox al real». |
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
| Temas de la app: comprarlos con Cometas o ganarlos en cápsulas fuertes | HECHO | 12 temas: comunes 200 Cometas, raros 350, épicos 500, legendarios 750 (Noche de Prodigia gratis). Salen en Pro, Supernova, Prisma y Alineación. En la web se aplican al instante; en la app al reiniciar (hay botón «Ponérmelo ahora»). Cambian los colores, no las letras ni las formas (eso sería otra fase). Conviene revisar en el teléfono Imprenta y Mesa de cartas (temas claros). |
| Temas de la app compatibles con los eventos | HECHO | Revisado capa por capa: cartel, escenas y constelaciones siguen oscuros; acentos de la fiesta se oscurecen en temas claros; partículas con contorno para verse sobre fondos claros. |
| Tabla «qué puedes obtener» de cada cápsula | HECHO | «¿Qué trae cada cápsula?» en Recompensas (web y app), con porcentajes, cantidades y cómo se consigue cada una; un test la compara con la base. |
| Fondos de los chats más bonitos | HECHO | 8 escenas ilustradas (cuaderno, noche estrellada, océano, bosque, atardecer, aurora, ciudad de neón, galaxia), el mismo dibujo en web y app. Commit fd0cbfa1. |
| Clanes como territorios orgánicos (no cuadrícula) que crecen con cada clan nuevo | HECHO | Cada clan es una región irregular, más grande según miembros y nivel; el mundo es una isla; un clan nuevo funda su territorio en la frontera y solo cambian sus vecinos. Tu clan con borde dorado, «NUEVO» los de menos de 7 días, botón «Ir a mi clan». Sin migración. |
| Invitar a duelo desde el chat; la invitación (enviada, aceptada, cancelada) como mensaje | HECHO | Botón «Retar a duelo» en el chat; el reto queda como tarjeta con su estado en vivo (enviado, aceptado, rechazado, cancelado, vencido) y botones para responder. Sin la 0298 el reto funciona pero no aparece la tarjeta. No probado con dos personas reales. |
| Compartir el resultado (o la repetición) de una partida; en el historial, tocar y ver sus estadísticas | HECHO | Tocar un duelo del historial abre su detalle: estadísticas tuyas y del rival, pregunta por pregunta y una repetición al ritmo real. Botón «Compartir» con tarjeta-imagen en los resultados y el detalle, y enlace público /partida/<id>. La repetición no muestra las preguntas (no se guardan; queda para el combate nuevo) ni el cambio de ELO por duelo. La imagen en la app necesita el APK nuevo. |
| ELO de rankeds como Brawlhalla: 500 inicial; Bronce 800, Plata 1100, Oro 1400, Platino 1700, Diamante 2000; top 100 = Prodigio | HECHO | Hierro 0–799 (se empieza en 500), Bronce 800, Plata 1100, Oro 1400, Platino 1700, Diamante 2000, Prodigio = top 100 con 2000 o más. Los jugadores actuales conservan su rango en la escala nueva; quien nunca jugó ranked queda en 500. Migración 0296. |
| Temporadas de ranked: cada cuánto acaban y un anuncio con las recompensas (Diamante v1, v2, v3…, título, cápsulas) | HECHO | Cada temporada termina en una Gran Alineación (28 días; la 1 termina el sábado 24). Al terminar sale un anuncio con el rango alcanzado y su tier v1, v2, v3…, título desde Oro y cápsulas (Hierro: liga; Bronce/Plata/Oro: liga de su color; Platino: oro + estelar; Diamante: oro + supernova; Prodigio: 2 supernova + prisma). En Rankeds se ve la temporada y cuánto le falta. |

| Organizar todas las carpetas de Prodigia en D: | TE TOCA DECIDIR | Inventario y propuesta en la sección 5 (abajo). No se movió ni borró nada. |
| APK 0.6.5 (versionCode 11) | EN CURSO | Compilando aparte desde `D:\Repositorios\Prodigia-build` (log `D:\android-build\compilar49.log`). Trae todo lo del 2026-10-23. Al terminar: release v0.6.5. |

| Sonido de marca de Prodigia en la intro | HECHO | Suena con la caída del logo en la pantalla de carga de la app: un roce de aire, un golpe suave al asentarse y la firma sol-do-mi-re-SOL en campana con acorde. Respeta el ajuste de sonido. Conviene escucharlo. |
| La Gran Alineación da 3000 Chispas para todos | HECHO | Regalo para cada jugador, sin meta ni partida; se reclama desde que empieza una Alineación hasta la siguiente. |

## 2b. Pedidos del 2026-10-23

| Pedido | Estado | Dónde quedó |
|---|---|---|
| Gran Alineación: ganar vale ×2 de ELO y perder ½; luego se reinicia la temporada | HECHO (falta correr 0302) | Durante las 3 horas de la Alineación. La temporada ahora termina al ACABAR la Alineación. Reinicio suave decidido: solo por encima de Oro (1400) se recorta un cuarto de lo que pasa de 1400 (Diamante 2000 → 1850; 2300 → 2075; Platino 1700 → 1625); nadie baja de Oro. Limitación: la pantalla de resultado del duelo todavía muestra el cambio normal (el ×2 se aplica al guardar). |
| Bots también en Platino y Diamante | HECHO (falta correr 0302) | El bot aparece a los 30 s en cualquier rango; los 6 bots más altos pasan a 1720–2240. |
| «Llegaste a Diamante» y «Prodigio» falsos al terminar Numeria | HECHO (falta correr 0302) | Eran los logros de rango con la escala vieja (1500/1700). Pasan a la nueva; Prodigio = top 100. La 0302 quita los dos que se dieron mal (solo a tu cuenta) y descuenta sus 80 Cometas. |
| Nombre en el acceso con Google | TE TOCA | Ver la nota de abajo. |
| Abrir una cápsula y salir antes de verla | HECHO | El premio ya no se pide al aparecer la cápsula sino al tocarla; si sales antes, sigue cerrada. Si sales a mitad del suspenso, al volver a Recompensas o a la tienda se te muestra lo que salió (en el mismo aparato). Nunca se pierde ni se abre dos veces. |
| Animación al comprar una cápsula queda detrás de los botones | HECHO | App: la escena va en un Modal de pantalla completa. Web: se monta por encima de todo (portal). |
| En la tienda de temas, mostrar Cometas (no Chispas) arriba a la derecha | HECHO | App y web. |
| Modo zen: estadísticas al final (promedio por respuesta, corrección de cada fallada) y personalización (dificultad, temas específicos) | HECHO | Final con precisión, primer intento, racha, promedio, más rápida/lenta, ritmo por pregunta y repaso de cada error con su solución. Antes: temas, un nivel o rango que sube, 10/15/20 preguntas, opciones de Numeria, Geografía y Codia; se recuerda la configuración. |
| Numeria, decimales «conversión» repite la misma pregunta; revisar variedad y dificultad de todos los modos de Numeria | HECHO | Causa: en nivel 1-2 el generador solo podía dar «1/2 a decimal». Ahora 41+ preguntas por nivel y la dificultad sube de verdad (periódicos en 7-10). También arreglados porcentaje, redondeo, multiplicación/división, fracciones, geometría y potencias. Un test vigila la variedad. |
| Auditoría de toda la base de preguntas de las 15 ciudades | FALTA (después) | Plan y primera medición en `docs/AUDITORIA_PREGUNTAS.md`. Graves: Vitalia (6-7 preguntas en nivel 1-2), Melodía (oído absoluto 4), Anatomía (niveles 7 y 9 iguales), Trigonometría (razones 8 en nivel 1). Siguiente: arreglar esos 4 en ese orden. |

**Nombre en el acceso con Google.** Google muestra el dominio de Supabase porque la app de Google no tiene la marca verificada. Dos caminos (los haces tú):
1. Gratis: en Google Cloud Console → Google Auth Platform → *Branding*, pon nombre «Prodigia», logo, página de inicio, política de privacidad y términos (las de la web), y en *Authorized domains* el dominio de la web; luego *Verify branding*. Google revisa en unos días y desde ahí sale «Prodigia».
2. De pago: dominio propio en Supabase (por ejemplo `auth.tudominio.com`, complemento del plan Pro); el acceso mostraría ese dominio en vez de `yawsx…supabase.co`.

**Paddle: pasar del sandbox al real (2026-10-23).** Hoy la web publicada cobra en SANDBOX (pruebas): tiene todas las variables de precios del sandbox, y le falta `PADDLE_PRODUCT_CONTENIDO` (sin él no se puede comprar un mundo suelto ni los paquetes de cosméticos). Los productos del sandbox NO se copian al real: hay que crearlos otra vez en la cuenta real (vendors.paddle.com, no sandbox-vendors).
1. Cuenta real aprobada: verificación de identidad/empresa y aprobación del dominio de la web (piden precios visibles, términos, privacidad y política de reembolso). Puede tardar días: hasta que esté aprobada, nadie puede pagar de verdad.
2. Crear en el Catalog real (precios en USD, como en `src/lib/pagos/productos.ts`):
   - Pro mensual 4,99 (suscripción mensual) y Pro anual 39,99 (suscripción anual).
   - Chispas: 1000 → 1,99 · 2500 → 3,99 · 6000 → 7,99 · 15000 → 14,99.
   - Cometas: 100 → 0,99 · 550 → 4,99 · 1200 → 9,99 · 2600 → 19,99 · 7000 → 49,99.
   - Un producto «Contenido de Prodigia» SIN precio fijo (el código arma el precio de cada mundo suelto, 2,99, y de cada paquete): su id va en `PADDLE_PRODUCT_CONTENIDO`.
3. En la cuenta real: API key (empieza con `pdl_live_`), client-side token (empieza con `live_`) y un webhook (Notification destination) a `https://<dominio de la web>/api/webhooks/paddle` con los eventos `transaction.completed`, `subscription.created` y `subscription.updated`; copiar su secreto.
4. En Vercel → Settings → Environment Variables (Production), reemplazar: `PADDLE_API_KEY`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_PRO_MENSUAL`, `PADDLE_PRICE_PRO_ANUAL`, los 4 `PADDLE_PRICE_CHISPAS_*`, los 5 `PADDLE_PRICE_COMETAS_*`, y agregar `PADDLE_PRODUCT_CONTENIDO`. Después, *Redeploy*. El código se pasa solo a real por el prefijo de las claves (no hay que tocar código).
5. Comprobar en `https://<dominio>/api/pagos/estado` que diga `"sandbox": false` y todas las variables en `true`, y hacer una compra real chica (Cometas 100 a 0,99) y reembolsarla.
Si mañana sale la publicidad y Paddle real aún no está aprobado: dejar `NEXT_PUBLIC_PAGOS_HABILITADOS` en `false` para que nadie intente pagar en sandbox.

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

- Los 4 videos ya están integrados. El APK 0.6.4 se compila con todo (ver arriba).

## 5. Carpetas de Prodigia en D: (inventario del 2026-10-22, para decidir)

Dónde está cada cosa hoy:

| Carpeta | Qué es |
|---|---|
| `D:\Repositorios\Prodigia` | El código (web y app): el repo principal |
| `D:\Repositorios\Prodigia-build` | Copia limpia para compilar el APK (git worktree con enlace a node_modules) |
| `D:\Repositorios\Prodigia-web` | Repo de una web anterior (último cambio 10/10). Decidido: se queda donde está |
| `D:\Repositorios\prodigia-marketing` | Marketing: videos de eventos, capturas, kit de marca, tandas de Instagram, diseño (no es repo) |
| `D:\Prodigia-APK` | 5 APK (unos 393 MB) |
| `D:\Prodigia-Documentos` | 2 PDF y una maqueta |
| `D:ndroid-build` | Herramientas para compilar (JDK, SDK, Gradle), scripts y 38 registros viejos |
| `D:	mp-claude`, `tmp-chrome`, `tmp-chrome2`, `tmp-pw`, `tmp-quimia2`, `npm-cache` + `.npm-cache` (repetidas), `D:\Temp` | Temporales de renders, capturas, pruebas y cachés |

Propuesta (pendiente de tu decisión):
1. Una sola carpeta `D:\Prodigia\` con `marketing\`, `apk\` (las viejas en `apknteriores\`), `documentos\` y `compilacion\` (herramientas y registros). El código se queda en `D:\Repositorios\Prodigia` (moverlo rompe VS Code, la memoria y los scripts). Al mover, actualizar las rutas de `compilar.ps1`, `compilar-limpio.ps1` y la memoria.
2. Temporales: borrarlos, moverlos a `D:\Prodigia	emporales` o dejarlos.
3. `Prodigia-build`: se puede quitar con `git worktree remove` cuando ya no haga falta compilar desde ahí.
