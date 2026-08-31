# Matriz de paridad de mundos

Documento vivo. Numeria es el mundo de referencia — el resto (y
cualquier mundo futuro) se audita contra esta tabla antes de darse por
terminado. Última auditoría completa: 2026-08-27, vía 5 sub-agentes de
solo-lectura (uno por mundo no-Numeria), cada uno auditando los 20
sistemas contra el código real, con evidencia archivo:línea.

**Estado de verificación**: la mayoría de esta tabla es **auditoría de
código**. La fila #13 (progreso en vivo) sí se **confirmó jugando de
verdad**: con la cuenta QA ya creada (`scripts/crear-usuario-qa.mjs`,
dos cuentas — QA1/QA2, ver `.env.test.local`), se creó un duelo real
entre ambas por cada uno de los 5 mundos con duelos (vía la API real
`/api/amigos/retar`, nunca contra un bot) y se abrió el mismo canal de
Realtime que abre el browser (`duelo:<id>`) desde las dos cuentas a la
vez — confirmando que un broadcast de progreso mandado por un lado
efectivamente le llega al otro, en los 5 mundos. Ver "Fase 3" al final
para el detalle exacto de qué se probó y qué sigue sin poder probarse
(la parte visual — pantallas VS/resultados — sigue sin verificar por no
haber browser disponible en este entorno).

**Repasada 2026-08-30 (sesión posterior a la de arriba)**: entre esta
auditoría (migración `0098`) y esta repasada se aplicaron 9 migraciones
más (`0099`-`0107`) y varias tandas de código sueltas, todas fechadas
el mismo 2026-08-30 — la típica "muchas sesiones de arreglos" que hace
que un documento así se desactualice rápido. Se releyó el código real
de cada sistema de la tabla contra ese estado actual (no contra lo que
decía este documento) — ver "Segunda pasada" más abajo para el detalle
completo. Resultado neto: **ningún símbolo de la matriz cambió** — los
bugs reales que se encontraron en esa ventana (Enigmia sin grabar
aciertos, la compra de cualquier mundo con Chispas rota, dos bugs en la
serie "todas las ciudades") ya estaban corregidos en el código para
cuando se hizo esta repasada, así que la tabla ya reflejaba el estado
post-fix sin saberlo. Quedan documentados igual (footnotes ⁴/⁵ +
sección nueva) porque existieron de verdad en el medio y es la clase de
regresión que vale la pena poder rastrear.

Leyenda: ✅ a la par de Numeria · ⚠️ parcial / con matices / sin poder
confirmar en vivo · ❌ ausente.

## Matriz completa

| # | Sistema | Numeria | Enigmia | Geografía | Quimia | Anatomía | Melodía | Trigonometría | Historia |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Practicar: tema→sub-tema→chips | ✅ | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| 2 | Calibración 1-10 | ✅ | ✅⁵ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 3 | Aprender: camino continuo | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 4 | world_progress avanzando | ✅ | ✅⁵ | ✅ | ✅ | ✅ | ✅¹ | ✅⁶ | ✅⁶ |
| 5 | Racha/combo (useRachaCombo) | ✅ | ✅⁵ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 6 | Logros y títulos propios | ✅ | ✅⁵ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 7 | Aparece en /perfil | ✅² | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 8 | Rankeds: ciudad seleccionable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 9 | Rankeds: dificultad por rango | ✅ | ✅⁵ | ✅ | ✅¹ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 10 | Duelo casual | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 11 | Duelo con amigo (selector) | ✅ | ✅ | ✅ | ✅¹ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 12 | Invitar por link (sin cuenta) | ✅ | ✅ | ✅ | ✅¹ | ✅ | ✅¹ | ✅⁶ | ✅⁶ |
| 13 | Progreso en vivo del rival | ✅ | ✅³ | ✅³ | ✅³ | ✅³ | ✅³ | ⚠️⁶ | ⚠️⁶ |
| 14 | Pantalla VS antes de arrancar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 15 | TextType "todas las ciudades" | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 16 | Countdown automático 10s | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 17 | Resultados + ELO animado | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁶ | ✅⁶ |
| 18 | Mundos por Chispas | ✅⁴ | ✅⁴ | ✅⁴ | ✅⁴ | ✅⁴ | ✅⁴ | ✅⁶ | ✅⁶ |
| 19 | Feed: tarjetas automáticas | ✅ | ✅¹,⁵ | ✅ | ✅ | ✅ | ✅¹ | ✅⁶ | ✅⁶ |
| 20 | Responsive en mobile real | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

¹ = bug real encontrado en esta auditoría y **ya corregido en el código** esta sesión — ver "Changelog" abajo. La celda muestra el estado ACTUAL (post-fix), no el que se encontró.
² = /perfil de Numeria tenía un bug propio (ver changelog) que inflaba su propio contador con attempts de otros mundos — también corregido.
³ = **confirmado jugando de verdad**, no solo por código — duelo real creado entre 2 cuentas reales (nunca un bot) vía la API de la app, canal de Realtime abierto desde las 2 cuentas a la vez, broadcast confirmado ida y vuelta. Ver "Fase 3" al final.
⁴ = bug real que rompía la compra de CUALQUIER mundo con Chispas (columna ambigua en `desbloquear_mundo()` — mismo patrón de Postgres que ya había roto `enviar_mensaje_clan`: la función confundía la columna `puntos_total` de `profiles` con su propia variable de salida homónima). Encontrado y corregido en una sesión posterior a esta auditoría (2026-08-30, migración `0106_fix_desbloquear_mundo_ambiguo.sql`) — ya estaba resuelto para cuando se hizo la repasada de esta fecha. Ver "Segunda pasada" más abajo.
⁵ = Enigmia no grababa NINGÚN acierto de contenido procedural (memoria/patrones/computacional — ~75% de las preguntas de Practicar/Rankeds, 100% de Reto diario) por un choque de tipos: `logic_attempts.puzzle_id` era `uuid`, pero los generadores procedurales mandan ids sintéticos en texto — el insert fallaba en silencio y la partida se cerraba con 0 aciertos. Encontrado y corregido en la misma sesión posterior (2026-08-30, migración `0099_fix_logic_attempts_puzzle_id.sql`) — ya estaba resuelto para cuando se hizo la repasada de esta fecha. Ver "Segunda pasada" más abajo.
⁶ = Trigonometría e Historia son mundos nuevos (2026-08-30, migraciones `0108`-`0110`, todavía sin correr en la base real al momento de escribir esto). El símbolo ✅ acá significa "código completo, typecheck y `next build` limpios, mismo patrón verificado que los 6 mundos anteriores" — **a diferencia del resto de esta tabla, nada de esto se pudo confirmar jugando de verdad todavía**, porque no existe forma de probarlo sin que las migraciones estén aplicadas primero. La fila 13 (progreso en vivo) queda en ⚠️ en vez de ✅ a propósito, porque esa fila específica es la única que el resto de la tabla marca como "confirmada jugando" (ver Fase 3 más abajo) — acá todavía no se hizo esa verificación. Apenas se corran las migraciones, esto se puede probar con las cuentas QA con el mismo método de Fase 3 y actualizar el símbolo si corresponde.

**Resumen actual**: de 160 celdas (20 sistemas × 8 mundos), 141 ✅ (5 de ellas confirmadas jugando, no solo por código; 18 de las nuevas de Trigonometría/Historia son ✅ solo por código+build, ver footnote ⁶), 17 ⚠️, 1 ❌ (Enigmia #1). Ningún mundo tiene un sistema completamente roto sin arreglo disponible; los ⚠️ restantes son gaps de UX/contenido reales (no bugs de wiring), cosas que no se pueden confirmar sin dispositivo real/browser, o (para los 2 mundos nuevos) sistemas pendientes de la primera verificación en vivo post-migración.

---

## Changelog de esta auditoría (bugs encontrados y corregidos)

1. **Melodía — `melodia_oido_absoluto` no contaba para `world_progress` ni feed** (sistema #4 y #19). `TIPOS_MELODIA` en `src/app/api/practica/finish/route.ts` y las ramas `melodia` de `registrar_puntos_mundo`/`ranking_semanal_filtrado` (SQL) nunca se actualizaron cuando se agregó el 6º modo (Fase 7, migración 0096). Una partida entera de Oído Absoluto no subía nivel de mundo, no disparaba el hito de feed, y no sumaba al ranking semanal por mundo. **Corregido**: `src/app/api/practica/finish/route.ts` + migración `0098_paridad_mundos_fixes.sql`.
2. **Quimia — `nomenclatura`/`organica` nunca se propagaron al subsistema de duelos** (sistemas #9, #11, #12). Tres lugares distintos seguían con la lista original de 3 sub-tipos: `modo_quimia_aleatorio_por_rango` (matchmaking ranked), `SUB_TIPOS_VALIDOS.quimia` (retar a un amigo), y `hrefDuelo` (ruteo de invitación por link). Ningún duelo podía caer en esos 2 modos pese a existir desde la migración 0067. **Corregido**: `src/app/api/amigos/retar/route.ts`, `src/lib/duelos/rutas.ts`, migración `0098`.
3. **Quimia — mismo problema en el ranking semanal por mundo** (encontrado al revisar el punto anterior, no estaba en el reporte de ningún agente): `ranking_semanal_filtrado` también sumaba XP semanal de Quimia solo sobre los 3 sub-tipos viejos. **Corregido en la misma migración `0098`**.
4. **Melodía — mismo problema de ruteo con `oido_absoluto`** (sistema #12, latente/inofensivo porque `cargarDatosPracticaMelodia` ya corregía el modo server-side, pero rompía el título/metadata de la página y era la misma clase de bug): `hrefDuelo` no tenía rama para `oido_absoluto`. **Corregido**: `src/lib/duelos/rutas.ts`.
5. **Enigmia — nunca publicaba el hito de "subiste de nivel de mundo" en el feed** (sistema #19). `src/app/api/enigmia/finish/route.ts` llamaba a `registrar_puntos_mundo` pero nunca insertaba en `feed_posts` al cruzar un múltiplo de 5, a diferencia de `/api/practica/finish`. **Corregido**: mismo archivo, mismo criterio (cruce de múltiplo de 5) que Numeria.
6. **Numeria (¡el propio mundo de referencia!) — `/perfil` contaba mal su propio total** (sistema #7). `numeriaTotal` solo excluía `problem_type = 'geografia'` con un `.neq`, así que attempts de Quimia/Anatomía/Melodía (que comparten la misma tabla `attempts` con prefijo `quimia_`/`anatomia_`/`melodia_`) se colaban e inflaban el contador de Numeria. **Corregido**: `src/app/[locale]/perfil/page.tsx`, ahora excluye por prefijo (`.not("problem_type","like","quimia_%")` etc.), no por lista exacta — para no repetir la misma clase de bug la próxima vez que se agregue un sub-tipo.

Todos los fixes de código pasaron typecheck + lint + build limpio. La migración `0098_paridad_mundos_fixes.sql` todavía necesita correrse a mano en el SQL Editor de Supabase (como toda migración de este proyecto), en orden después de `0097`.

---

## Segunda pasada (2026-08-30) — re-verificación de código contra el estado actual

Repasada pedida específicamente para chequear si el código real se
había movido desde la auditoría de arriba (migración `0098`,
2026-08-27) — sí se había movido, bastante: 9 migraciones más
(`0099`-`0107`) y varias tandas de cambios en `src/`, todas fechadas el
mismo 2026-08-30 pero en una sesión de trabajo posterior a la de este
documento. Se releyeron los sistemas de la matriz contra ese código
actual, no contra lo que ya decía este documento. Hallazgos:

- **Confirmado, sin cambios**: `SelectorMundoDuelo.tsx` sigue siendo el
  selector único de ciudad usado por Rankeds/`AmigosClient`/
  `FeedSidebar` (filas #8, #9, #11, #12); `hrefDuelo` y
  `SUB_TIPOS_VALIDOS.quimia` en el código actual siguen incluyendo
  `nomenclatura`/`organica`/`oido_absoluto` (el fix de la auditoría
  original sigue en pie); Enigmia sigue sin ningún selector de tema/
  sub-tema en `/enigmia/practica` (fila #1, ❌ confirmado de nuevo
  leyendo `EnigmiaPracticaClient.tsx` — va directo a "¿Listo?").
- **Bug real encontrado, ya corregido para cuando se hizo esta
  repasada** (fila #18, los 6 mundos): `desbloquear_mundo()` y
  `elegir_mundo_inicial()` tenían el mismo bug de columna ambigua que
  ya había roto el chat de clan — "no se pudo comprar" al intentar
  desbloquear cualquier mundo con Chispas, con saldo de sobra. Peor
  todavía, `elegir_mundo_inicial` (el paso de onboarding "elegí tu
  mundo gratis") ni siquiera existía contra la base real. Ambos
  reproducidos con las cuentas QA antes de arreglarse. Corregido en
  `0106_fix_desbloquear_mundo_ambiguo.sql`. Ver footnote ⁴.
- **Bug real encontrado, ya corregido** (filas #2, #4, #5, #6, #9, #19
  de Enigmia): `logic_attempts.puzzle_id` era `uuid`, pero los
  generadores procedurales (memoria/patrones/computacional, ~75% de
  las preguntas de Practicar/Rankeds y el 100% de Reto diario) mandan
  ids sintéticos en texto — el insert fallaba en silencio (el jugador
  veía "correcto" en cada pregunta, pero el servidor nunca grababa
  nada), así que **ninguna partida de esos modos sumaba XP, nivel de
  mundo, ni disparaba logros/feed**. Corregido en
  `0099_fix_logic_attempts_puzzle_id.sql` (`puzzle_id` pasa a `text`,
  sin FK). Ver footnote ⁵.
- **Bug real encontrado y corregido, sin fila propia en la matriz**
  (afecta la serie "todas las ciudades"/mejor-de-3, compartida por los
  5 mundos con duelos — subyace a las filas #14-#17): dos bugs en
  `SerieDueloClient.tsx` — el overlay de transición TextType tapaba las
  estadísticas antes de poder leerse, y la serie forzaba jugar la 3ª
  ronda aunque ya estuviera decidida 2-0 (las 3 rondas se crean de
  entrada como filas reales de `duels`, y el componente no miraba
  `serie_finalizada` antes de mandar a la ronda "pendiente"). No se le
  puso footnote a esas filas porque el sistema en sí (VS/TextType/
  resultados) funciona — era un caso de borde de la variante
  mejor-de-3 específicamente, ya corregido.
- **Hallazgos adyacentes, sin impacto en ninguna fila de la matriz**
  (mencionados por transparencia, no por relevancia de paridad): mismo
  bug de columna ambigua en el chat de clan (`0100`); 3 huecos de RLS
  cerrados — `desbloquear_titulo` con `p_user_id` ajeno,
  `feed_posts`/`duel_results`/`duel_queue` sin validar contenido
  (`0102`, `0103`); acceso de invitado ahora bloqueado de verdad (antes
  solo visualmente) en Multiplicación/División y en los 5 temas
  no-aritmética de Numeria / 3 regiones no-América de Geografía; 8
  lecciones nuevas de Aprender-Numeria para números grandes (`0101`,
  Numeria-only, no cambia el gap de contenido de Geografía en fila #3);
  6 marcos de perfil temáticos por mundo + perfil público expandido
  (`0104`, `0105`, `0107`) — comprables desde nivel de mundo 40 o
  gratis al completar el mundo, simétricos en los 6 mundos, sin fila
  propia en esta matriz; banco de la tabla periódica de Quimia
  ampliado (dataset chico repetía siempre los mismos ~15 elementos).
- **Verificado pero inconcluso, no se tocó nada** (no se marca como
  regresión): `TIPOS_QUIMIA` en `src/lib/titulos/verificar.ts` (fila
  #6, criterio del título "Maestro de Quimia") todavía solo exige nivel
  10 en los 3 sub-tipos originales, sin `nomenclatura`/`organica`. A
  primera vista parece el mismo bug que ya se corrigió en otros 3
  lugares para Quimia (changelog #2/#3) — pero `TIPOS_NUMERIA`, en el
  mismo archivo, tiene el mismo patrón (excluye `geometria` del título
  "Maestro de Numeria", el propio mundo de referencia), así que podría
  ser una decisión consistente ("el título no exige el sub-tipo más
  nuevo") en vez de un bug. No se cambió nada de código en esta pasada
  (tarea de solo lectura) ni se bajó ningún ✅ por esto — queda anotado
  acá para que alguien con el contexto de producto decida si el título
  debería exigir los 5 sub-tipos.

**Resultado**: 0 símbolos de la matriz cambiaron. Se agregaron las
footnotes ⁴ y ⁵ a las celdas que esos dos bugs afectaban, ya en su
estado post-fix.

---

## Gaps reales que quedan abiertos (no son bugs de wiring — son huecos genuinos)

- **Enigmia — no existe selector de tema/sub-tema (sistema #1, ❌ real)**: la práctica libre de Enigmia es 100% automática (mezcla fija 75% procedural / 25% deducción), sin ninguna pantalla equivalente a `/practica/temas`. Es la brecha más grande de las 120 celdas — una feature nueva, no un fix de una línea. No se construyó esta sesión por alcance (una UI nueva completa, no un bug puntual); queda documentado para una tanda futura.
- **Geografía — Aprender tiene solo 3 lecciones totales** (sistema #3, ⚠️): el mecanismo (camino continuo, technique_progress) funciona igual que Numeria, pero el contenido es mucho más flaco — 3 lecciones genéricas para 4 regiones, ninguna por continente. Gap de contenido, no de código.
- **Chips multi-select fuera de Numeria (sistema #1, ⚠️ en Geografía/Quimia/Anatomía/Melodía)**: los 5 coinciden en que "chips modificadores" (`numeros_grandes`/`negativos`/`inverso`) son una feature exclusiva de la aritmética base de Numeria — ni siquiera Fracciones/Decimales/Potencias/Álgebra/Geometría de Numeria los tienen. No está claro que sea un gap real de paridad tanto como una feature que nunca se pensó como estándar transversal — queda marcado ⚠️ en vez de ❌ por eso, y vale la pena que el usuario decida si esto debe generalizarse o si el criterio de "chips" de esta matriz debería reformularse a "algo equivalente si aplica".
- **Responsive en mobile real (sistema #20, ⚠️ en los 6 mundos)**: ningún mundo se probó en un dispositivo/viewport real — esto sigue sin poder verificarse porque el entorno no tiene browser/dispositivo disponible, ni con la cuenta QA (ver Fase 3). Por análisis estático: Anatomía tiene un `minHeight:460px` en modo "click" que deja poco margen en 375px de alto; Quimia's `MoleculaSVG` puede necesitar scroll horizontal en compuestos con muchos grupos (mitigado con `overflow-x-auto`, no roto pero no fluido). El resto no mostró señales de problema, pero "sin evidencia" no es lo mismo que "confirmado".

## Fase 3 — verificación jugando (2026-08-30)

`SUPABASE_SERVICE_ROLE_KEY` llegó a `.env.local` — se creó la cuenta QA principal (`scripts/crear-usuario-qa.mjs`) y una segunda (`QA_SLOT=2`), las dos con todos los mundos desbloqueados y diagnósticos salteados. Verificación real hecha:

1. **Login real de punta a punta**: `scripts/login-qa.mjs` inicia sesión contra Supabase Auth de verdad y arma la cookie `sb-<ref>-auth-token` que espera `@supabase/ssr`. Con esa cookie, `GET /es/perfil` contra el dev server real devolvió 200 con "QA Tester" renderizado desde datos reales — no un mock.
2. **Progreso en vivo — el bug reportado por el usuario, resuelto**: por cada uno de los 5 mundos con duelos (Geografía/Enigmia/Quimia/Anatomía/Melodía) se creó un duelo REAL entre QA1 y QA2 vía `POST /api/amigos/retar` (la misma ruta que usa "Retar" en `/social` — nunca un bot), se confirmó que `obtener_duelo` lo resuelve igual desde ambos lados, y se abrieron los DOS canales de Realtime (`duelo:<id>`) simultáneamente, uno por cuenta — exactamente el mismo canal que abre `useProgresoEnVivo` en el browser. Un broadcast de progreso mandado desde QA1 llegó a QA2 y viceversa, en **los 5 mundos, incluida Melodía**. Esto confirma la hipótesis del código: el wiring de Melodía nunca estuvo roto — el bug que viste jugando fue casi con certeza un duelo contra un bot (Melodía tiene menos población simultánea, así que `buscar_rival_duelo` cae más seguido en el fallback de bot tras 30s sin rival humano, y un bot nunca emite progreso en vivo por diseño). Si te vuelve a pasar, fijate si el rival tenía nombre de un jugador real o si venía del "Clan de Bots".
3. **Lo que todavía NO se pudo confirmar, ni con la cuenta QA**: este entorno no tiene browser — no puedo ver ni verificar visualmente la pantalla VS, la transición TextType, el countdown de 10s, la pantalla de resultados con ELO animado, ni el responsive en mobile (sistema #20). Lo que sí se probó es la capa de datos/transporte real (creación del duelo, resolución server-side, canal de Realtime) para los 5 mundos — la parte puramente visual de esas pantallas sigue siendo "verificado por código" (React/CSS ya auditado, componentes compartidos), no "confirmado viéndolo".

Quedaron 5 duelos de prueba en estado `pendiente` entre QA1/QA2 (uno por mundo, inofensivos, aislados a las cuentas de test) — no hace falta limpiarlos para seguir usando las cuentas.

---

## Mundos 7 y 8 — Trigonometría e Historia (2026-08-30)

Dos mundos nuevos, pedidos en dos mensajes separados, construidos con la checklist completa de esta matriz aplicada desde el día uno (no en fases sucesivas como Melodía/Anatomía originalmente) — ver el patrón exacto en `0108_mundo_trigonometria.sql` y `0109_mundo_historia.sql`, más la migración cross-cutting `0110_ocho_mundos.sql` (expande `elegir_mundo_inicial`/`desbloquear_mundo`/`comprar_item_tienda`/el paquete de marcos de 6 a 8 mundos).

**Trigonometría** (#84CC16): 4 modos — razones básicas (SOHCAHTOA, entrada numérica con tolerancia, triángulos rectángulos de lados enteros vía ternas pitagóricas), círculo unitario (valores exactos, nunca decimales, opción múltiple), identidades (pitagórica/ángulo doble/complementarios, resueltas por sustitución con ángulos notables — nunca un parser simbólico libre, que no existe en ningún lado del código), leyes de seno/coseno (triángulos oblicuos reales, entrada numérica). Único mundo con un runner que mezcla dos estilos de entrada (numérico + opción múltiple) dentro del mismo componente — mismo patrón ya en producción de `FraccionSprintRunner.tsx`, no una invención nueva. Diagrama propio (`TrianguloSVG.tsx`) para los modos 1 y 4, en el espíritu de `Pentagrama.tsx` de Melodía.

**Historia** (#A0522D, sepia/terracota): 4 modos, los 4 de opción múltiple — cronología (ordenar 3 eventos, o identificar el siglo), personajes (identificar la figura desde pistas), causa y efecto, fechas exactas. Contenido curado a mano (patrón `armar()` de `geografiaAvanzada.ts`, no procedural). **Curación de contenido** (pedido explícito: solo hechos de consenso histórico amplio, nada de historia política del siglo XX-XXI ni de interpretación disputada) — hechos usados: fundación legendaria de Roma (753 a.C.), primeros Juegos Olímpicos (776 a.C.), reforma democrática de Clístenes en Atenas (508 a.C.), pirámides de Guiza (~2560 a.C.), asesinato de Julio César (44 a.C.), caída del Imperio Romano de Occidente (476 d.C.), viajes de Marco Polo (s. XIII), imprenta de Gutenberg (~1440), Mona Lisa y Capilla Sixtina (Renacimiento), piedra de Rosetta descifrada (1822), máquina de vapor de Watt (1769), teléfono de Bell (1876), bombilla de Edison (1879), primer vuelo motorizado (1903), penicilina de Fleming (1928), llegada del Apolo 11 a la Luna (1969), invención del papel en China (~105 d.C.), invención de la imprenta y su efecto en la difusión del conocimiento. Evitados a propósito: cualquier guerra mundial, colonización/Colón, fundación de religiones, política del siglo XX-XXI, descolonización — ante la duda sobre si un hecho era "seguro", se descartó en vez de incluirlo. Lista completa para revisión humana, tal como se pidió.

**Estado real de verificación**: código completo, `npx tsc --noEmit` limpio, `npx eslint` limpio (0 errores nuevos en todo el proyecto), `next build` exitoso con las 12 rutas nuevas de cada mundo compilando igual que sus 6 hermanos. **Lo que NO se pudo hacer, a diferencia de auditorías anteriores de este documento**: jugar de verdad con las cuentas QA — las migraciones `0108`-`0110` (más las `0104`-`0107` de la tanda anterior, que siguen pendientes) todavía no se corrieron contra la base real, así que no existe ninguna fila de `skill_levels`/`achievements`/`world_progress` para estos 2 mundos hasta que eso pase. Los símbolos ✅ de la matriz de arriba para estas 2 columnas están marcados con footnote ⁶ precisamente por esto — significan "wiring correcto por código", no "confirmado jugando". Próximo paso natural: correr las migraciones en orden (`0104` → ... → `0110`) y repetir el mismo método de Fase 3 (duelo real QA1↔QA2, doble canal de Realtime) para las filas 9-13 de estos 2 mundos.

**⚠️ Regla para el próximo mundo (9no en adelante) — NO copiar `elegir_mundo_inicial`/`desbloquear_mundo` de una migración vieja al agregarlo**: este mismo bug de columna ambigua (`42702`) se rompió DOS veces seguidas en esta sesión — primero en `0097` (arreglado en `0106`), y de nuevo en `0110` al reescribir esas 2 funciones para sumar Trigonometría/Historia, porque se copió por error la forma pre-`0106` en vez de la ya arreglada (arreglado otra vez en `0111`). La causa de fondo: `returns table (puntos_total integer, mundos_desbloqueados text[])` crea variables de salida con esos nombres, y cualquier `select puntos_total, mundos_desbloqueados into ... from public.profiles where id = v_user` (sin alias) es ambiguo entre esa variable y la columna real de la tabla — Postgres no tira error en `create`, solo al ejecutarse. **Antes de reescribir estas 2 funciones para un mundo 9**: copiar el cuerpo completo de la migración `0111` (la versión correcta) como base, no `0097`/`0110`, y confirmar que TODAS las referencias a columnas de `profiles` dentro de la función usan un alias (`pr.puntos_total`, `pr.mundos_desbloqueados`) — incluido el primer `SELECT ... INTO`, que es el que se olvida siempre.

Precio del "Colección de Mundos" actualizado de 11000 a 14500 Chispas al pasar de 6 a 8 marcos temáticos (mismo ~24% de descuento que antes). Marcos temáticos de Trigonometría/Historia generados programáticamente (anillo + motivo simple: triángulos en verde lima / hojas de laurel en sepia) en vez de assets de diseño provistos por el usuario como los 6 anteriores — notablemente más simples, aviso explícito de esa diferencia.

---

## Rediseño del flujo de landing/onboarding (2026-08-31)

Reestructuración completa del flujo pre-cuenta (landing pública → demo → tutorial guiado → alta), 8 fases pedidas en un solo prompt. Cambios de fondo, no solo bugs sueltos:

- **⚠️ Punto permanente de checklist — el picker de la demo del landing es un lugar más donde un mundo nuevo debe conectarse.** `MUNDOS_LANDING` (`src/lib/mundos.ts`) ya venía listando los 8 mundos correctamente, pero **faltaban las carpetas de ruta `src/app/[locale]/demo/<mundo>/`** para Melodía, Trigonometría e Historia — el picker los ofrecía, pero el link daba 404 porque nadie había creado esas 3 páginas cuando esos mundos se agregaron. Ese es el bug real que reportó el usuario ("Historia y Melodía dan 404 en la demo del landing"): no fue un olvido en una lista compartida esta vez, sino una carpeta de ruta entera que ningún checklist anterior mencionaba explícitamente. **Regla para el mundo 9**: el día que se agregue, crear también `src/app/[locale]/demo/<mundo>/{page.tsx,Demo<Mundo>Client.tsx}` (calcar cualquiera de los 8 existentes — todos siguen el mismo patrón: `<HeaderFlujo />` + un client component con máquina de estados `"sprint" → "resultado" → "tour" → "promo" → "mundos"`, modo/nivel fijo en el más básico del mundo, sin query especial salvo que el mundo tenga contenido pre-cargado en DB como Enigmia). Sin esa carpeta, `MUNDOS_LANDING` sigue ofreciendo el mundo en el grid y el 404 vuelve a pasar.
- **Scoring real de la demo**: los 8 `*SprintRunner` ya llevaban un contador interno de aciertos reales (`correctosRef.current`, usado solo para el broadcast de progreso en vivo de duelos) que nunca se exponía — el resultado de la demo se inferí­a como `TOTAL_DEMO - errores.length`, falso en cuanto el sprint terminaba por timeout sin responder las 5. Fix: `onFinish` ahora manda `correctos` real como parámetro extra en los 7 runners no-Numeria (Numeria ya mandaba `respuestas: RespuestaDuelo[]`, de ahí se deriva). **Regla para el mundo 9**: su `*SprintRunner` va a tener el mismo `correctosRef.current` por el patrón compartido — si se le arma una demo, exponerlo en `onFinish` desde el día uno, no re-derivarlo por resta.
- **Invitado nunca elige/guarda nombre**: `handle_new_user()` ahora autogenera `"Invitado" + 6 caracteres del uuid` cuando `new.is_anonymous`, con una columna nueva `profiles.nombre_generado` para que ese nombre no le queme el "primer cambio gratis" de `cambiar_nombre_usuario` el día que ponga su nombre real (antes esa gratuidad dependía 100% de `display_name is null`, que se hubiera roto en cuanto se autogeneraba algo). Ver `0112_flujo_bienvenida.sql`.
- **2 mundos gratis en vez de 1**: nueva función `elegir_mundos_iniciales(p_mundos text[])` (no reusar `elegir_mundo_inicial` 2 veces — la validación `cardinality(v_actuales) = 0` rompe en la segunda llamada). Mismo cuidado de alias de columna (`pr.mundos_desbloqueados`) que ya documenta la regla de arriba.
- **Header sin nav durante todo el flujo guiado**: nuevo `HeaderFlujo.tsx` (solo logo estático + ThemeToggle, cero links) reemplaza a `Header` en `/` (visitante) y en las 8 rutas `/demo/<mundo>`, mientras dura el flujo — el `Header` normal deja `/leaderboard`/`/tienda`/`/pro` visibles incluso para invitados, y esas rutas redirigen a `/onboarding` en cuanto ven `mundos_desbloqueados` vacío (que es siempre, durante el flujo). Antes de este cambio, cualquier click ahí adentro reproducía justo ese bug.
- **Tour del paso 6 (Ranking/Rankeds/Amigos-Clanes/Perfil) es un overlay liviano, no navegación real** — a propósito: esas 4 rutas están todas protegidas por `requireUsuario`/bloqueadas para invitado, así que "mostrarlas" navegando de verdad hubiera vuelto a disparar el mismo bug que el punto anterior vino a sacar. `FlujoTour.tsx` es la evolución del viejo `DemoTour.tsx` (mismo mecanismo de overlay de a un paso, sin cola compartida), con las 4 paradas nuevas en vez de sprint/social/tienda/clanes.
- Pantalla "¿Qué te gustaría mejorar?" (resabio de cuando solo existía Numeria, `interes_inicial` sin ningún uso real) sacada del todo — confirmado por grep que ninguna otra parte del código ni ninguna función SQL la leía.
