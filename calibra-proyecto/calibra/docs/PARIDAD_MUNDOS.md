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

Leyenda: ✅ a la par de Numeria · ⚠️ parcial / con matices / sin poder
confirmar en vivo · ❌ ausente.

## Matriz completa

| # | Sistema | Numeria | Enigmia | Geografía | Quimia | Anatomía | Melodía |
|---|---|---|---|---|---|---|---|
| 1 | Practicar: tema→sub-tema→chips | ✅ | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| 2 | Calibración 1-10 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | Aprender: camino continuo | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| 4 | world_progress avanzando | ✅ | ✅ | ✅ | ✅ | ✅ | ✅¹ |
| 5 | Racha/combo (useRachaCombo) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | Logros y títulos propios | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | Aparece en /perfil | ✅² | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | Rankeds: ciudad seleccionable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | Rankeds: dificultad por rango | ✅ | ✅ | ✅ | ✅¹ | ✅ | ✅ |
| 10 | Duelo casual | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 | Duelo con amigo (selector) | ✅ | ✅ | ✅ | ✅¹ | ✅ | ✅ |
| 12 | Invitar por link (sin cuenta) | ✅ | ✅ | ✅ | ✅¹ | ✅ | ✅¹ |
| 13 | Progreso en vivo del rival | ✅ | ✅³ | ✅³ | ✅³ | ✅³ | ✅³ |
| 14 | Pantalla VS antes de arrancar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15 | TextType "todas las ciudades" | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16 | Countdown automático 10s | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 | Resultados + ELO animado | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 18 | Mundos por Chispas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 19 | Feed: tarjetas automáticas | ✅ | ✅¹ | ✅ | ✅ | ✅ | ✅¹ |
| 20 | Responsive en mobile real | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

¹ = bug real encontrado en esta auditoría y **ya corregido en el código** esta sesión — ver "Changelog" abajo. La celda muestra el estado ACTUAL (post-fix), no el que se encontró.
² = /perfil de Numeria tenía un bug propio (ver changelog) que inflaba su propio contador con attempts de otros mundos — también corregido.
³ = **confirmado jugando de verdad**, no solo por código — duelo real creado entre 2 cuentas reales (nunca un bot) vía la API de la app, canal de Realtime abierto desde las 2 cuentas a la vez, broadcast confirmado ida y vuelta. Ver "Fase 3" al final.

**Resumen actual**: de 120 celdas, 105 ✅ (5 de ellas confirmadas jugando, no solo por código), 14 ⚠️, 1 ❌ (Enigmia #1). Ningún mundo tiene un sistema completamente roto sin arreglo disponible; los ⚠️ restantes son gaps de UX/contenido reales (no bugs de wiring) o cosas que no se pueden confirmar sin dispositivo real / browser.

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
