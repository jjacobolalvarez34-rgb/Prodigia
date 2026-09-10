# Prodigia — especificación del proyecto

Documento de referencia para retomar el trabajo (por ejemplo, en otra sesión, otra carpeta, o con otra persona). No reemplaza a `docs/PROGRESO.md` (el historial cronológico de auditorías y decisiones) — esto es una foto del estado actual: qué es la app, cómo está armada, y qué queda pendiente.

Última reconciliación: 2026-09-09 — fase F13. Ver también: `docs/audits/*.md` (auditorías F0–F12) y `docs/PROGRESO.md`.

## Estado verificado (F0-F13)

Lista de qué fue verificado contra el código real en las fases F0-F13, con link al audit correspondiente. "VERIFICADO" aquí = confirmado en código/auditorías, no en runtime (sin DB/browser en el entorno).

| Área | Estado verificada en | Evidencia/audit |
|---|---|---|
| Nivel de mundo: curva 34/45/21 (techo 25.000), anti-farm | Código + migraciones | `docs/audits/NIVELES-MUNDOS-2026-09-08.md`; `0117_curva_nivel_mundo.sql`; `worldLevel.ts:46-49`; `0125:184` |
| Nivel de cuenta: escalera 200/300/550/900/1400/1900/2400 | Código + migración | `docs/audits/NIVELES-PERSONALES-2026-09-08.md`; `0118_niveles_cuenta_recompensas.sql`; `src/lib/cuenta/niveles.ts` |
| Recompensa nivel cuenta: 50n+250 (invisible al cliente, sin grant) | Código + migración | `0118`; `0125` concilia con `greatest` |
| 8 mundos (MundoDuelo/colores alineados) | Código | `src/types/database.ts:38,328`; `0110`; alineados en F7 |
| Catálogo tienda real: 24 ítems / 47.900 Chispas, 6 marcos de rango | Código | `docs/audits/STORE-ECONOMY-AUDIT.md` (§2); `src/lib/tienda/costos.ts:21-70` |
| Trastienda: casino 0.88 (0127), sourceErrorTrastienda, M2 self-heal sin cron, M3 8/9 títulos (falta gniñardo), M5 3 minijuegos activos (Acertijos/Reloj eliminados 0126) | Código | `docs/audits/STORE-ECONOMY-AUDIT.md` (§3-§5); migraciones `0121`–`0127` |
| Minijuego único activo de 0124: "La Calcu" | Código | `0126` elimina Acertijos/El Reloj; `LaCalcu.tsx` |
| RLS/seguridad: S5 CRÍTICO documentado; S9 edge | Código | `docs/audits/AUDIT-RLS-SEGURIDAD-2026-09-07.md`; `0121:605-649` re-grant |
| Feed social DESACTIVADO | Código | `docs/audits/DUELOS-AUDIT.md` §2; `SocialClient.tsx:16-19` |
| Tour de onboarding desactivado | Código | `Header.tsx:27-31`; `PrimeraVezTip.tsx` sin uso |
| Pro informativo (no pago); PWA sin offline; solo Android | Código | `docs/audits/REQUIREMENTS-CHECKLIST.md` #51, #52, #64 |
| Rankeds: nivel mínimo 5, mejor-de-3, ELO TS≡SQL (0043), casual sin ELO (0050), bots casual BLOQUEADO-POR-DB, anti-aleatorio (0109) | Código | `docs/audits/RANKEDS-AUDIT.md`, `docs/audits/CASUAL-AUDIT-2026-09-08.md`, `docs/audits/DUELOS-AUDIT.md`; `guard.ts:184` |
| Clanes: costo 5000, roles, chat push, estandarte 2600px, mapa/ciudad tierCiudad, guerra, nivel clan sin cap | Código | `docs/audits/REQUIREMENTS-CHECKLIST.md` #24-28; migraciones `0068`, `0070`, `0076`, `0092` |
| Español neutro LA; migraciones hasta 0128 (9 RPCs neutros); NOTIFY en 0122/0123/0125/0126/0127 | Código | `docs/TERMINOLOGY.md`; `docs/audits/I18N-AUDIT.md`; `0128_espanol_neutro.sql` |
| Límites: racha, escudos, doble-o-nada (200), apostar (10/500), casino 20/día, apuestas amigos solo duels | Código | `docs/audits/STORE-ECONOMY-AUDIT.md` (§3.1) |
| Onboarding 2 mundos + fix 0116 (self-heal) | Código + en vivo | `0116_fix_elegir_dos_mundos.sql`; `docs/audits/REQUIREMENTS-CHECKLIST.md` #47 |

Método: todo lo de arriba fue verificado leyendo código/migraciones audits en F0-F12 (CONFIRMADO POR CÓDIGO). Tsc/eslint/vitest NO aplican a esta fase (cero cambios de código).

## Qué es Prodigia

App de práctica adaptativa con gamificación, en español neutro latinoamericano (ver `docs/TERMINOLOGY.md`), con ocho "mundos" de contenido independientes:

- **Numeria** — cálculo mental y matemática: Aritmética (suma/resta/multiplicación/división), Fracciones, Decimales y porcentajes, Potencias y raíces, Álgebra básica, Geometría básica (Perímetro/Área/Ángulos/Ternas pitagóricas).
- **Enigmia** — lógica: 4 categorías (Memoria, Patrones, Deducción, Pensamiento computacional). Memoria/Patrones/Computacional se generan por código (infinitos); Deducción viene de un banco fijo sembrado en la base.
- **Geografía** — identificar países en el mapa: 4 continentes activos (América, Europa, África, Asia+Oceanía — estos dos últimos agrupados). 153 países jugables en total. "Departamentos/estados/ríos" queda como "Próximamente".
- **Quimia** — elementos, fórmulas, tabla periódica, nomenclatura y química orgánica: 5 modos, cada uno con su propia calibración.
- **Anatomía** — sistema óseo, muscular, órganos y sistema nervioso: 4 modos (cada uno con nivel bajo general y nivel alto más específico — huesos del cráneo, músculos de la cara, pares craneales), preguntas de clasificación (multiple choice, contenido de nombres verificado, sin trivia inventada).
- **Melodía** — reconocimiento auditivo (incluye oído absoluto, `0096`). Hub de selección en `/melodia/elegir`. Lecciones en `/melodia/aprender`.
- **Trigonometria** — funciones trigonométricas, identidades y aplicaciones. Hub de selección en `/trigonometria/elegir`. Lecciones en `/trigonometria/aprender`.
- **Historia** — contenido histórico-cultural. Hub de selección en `/historia/elegir`. Lecciones en `/historia/aprender`.
- (Detalle de modos/sub-temas específicos de Melodía/Trigonometria/Historia: NO PUEDO VERIFICAR sin DB — remitirse a `docs/audits/REQUIREMENTS-CHECKLIST.md` y `docs/PROGRESO.md`.)

Cada mundo tiene: una calibración de nivel por tema (1-10, sube/baja según aciertos), un **nivel de mundo** (eje de progreso separado, acumulado por puntos, curva RPG no lineal — ver más abajo), lecciones ("Aprender"), y práctica ("Practicar"). Los 8 mundos son: Numeria, Enigmia, Geografía, Quimia, Anatomía, Melodía, Trigonometria, Historia (verificados en código: `src/lib/mundos.ts:19-28`, `src/lib/mundos/precios.ts:13`).

Por fuera de los mundos: cuenta (perfil, ajustes, nivel personal con recompensas), social (amigos, grupos de profesor/alumnos; feed de actividad DESACTIVADO — ver Pendiente), competitivo (ranking semanal, rankeds con ELO y matchmaking, duelos mejor-de-3), economía (Chispas como moneda, tienda, Trastienda con ruleta casino/apuestas/predicciones/minijuegos, apuestas doble-o-nada), clanes (crear/unirse, guerra semanal, chat, estandarte), logros, reto diario, reto semanal.

## Stack técnico

- **Next.js 16.3.0** (App Router, Turbopack), **React 19.2.8** (con React Compiler activo — ver "Patrones de React" abajo)
- **Supabase**: Postgres + Auth + RLS. Sin CLI de Supabase instalado en este entorno — todas las migraciones son archivos SQL en `supabase/migrations/` que se aplican **a mano** desde el dashboard de Supabase, en orden.
- **Tailwind v4**
- **framer-motion** — motor de animación principal y confiable en todo el proyecto
- **gsap** + **@gsap/react** — usado en algunos componentes de react-bits (ver advertencia abajo)
- **three** + **ogl** — para GhostCursor (fondo ambiental) y SpecularButton (botones secundarios)
- **vitest** — suite unitaria de lógica pura (fórmulas, cálculo de nivel, retos, ruleta/casino, etc.). 147 tests en la última verificación (2026-09-09).

### ⚠️ Advertencia sobre gsap en este entorno

Durante esta sesión, **dos componentes que usaban gsap directo fallaron en producción de forma silenciosa** (sin error de consola): el texto del tour de onboarding (`SplitText`, gsap+ScrollTrigger) y la animación del desplegable de cuenta (`AbanicoBurbuja`, gsap plano con `autoAlpha`). Ambos quedaban con el contenido permanentemente invisible (`opacity:0`) porque el tween nunca terminaba de disparar. La causa exacta no se pudo confirmar sin acceso a la consola del navegador, pero el patrón se repitió dos veces con la misma forma (`gsap.set(...opacity:0) → gsap.to(...opacity:1)` dentro de un `useEffect`).

**Ambos se reemplazaron por framer-motion** (el motor ya probado en el resto del proyecto) y quedaron funcionando. **Recomendación**: si se agregan más componentes de react-bits que dependan de gsap para revelar contenido (no solo animaciones decorativas), probarlos en vivo con cuidado — no asumir que porque compila y no tira error de build, funciona en el navegador.

También: **no correr `next dev` y `next build` al mismo tiempo** — causó al menos un crash real de Turbopack (panic de caché) y compilaciones inconsistentes (código viejo sirviéndose después de guardar un archivo) en este entorno. Si hace falta verificar el build de producción, primero parar el dev server.

## Estructura del proyecto

```
src/
  app/                    — rutas (App Router). Cada carpeta con page.tsx es una ruta.
    api/                  — route handlers (API interna, todas server-only)
  components/             — componentes compartidos entre mundos
    practica/             — piezas del sistema de feedback de partida (ver abajo)
    reactbits/             — componentes portados de react-bits (ver sección aparte)
  lib/
    supabase/             — clientes de Supabase (client.ts, server.ts, admin.ts)
    practica/              — generadores de problemas + lógica de práctica
    enigmia/                — generadores de acertijos + skill level de Enigmia
    auth/guard.ts           — guards en capas (requireUsuario, requireMundoNumeria, requireMundoEnigmia)
supabase/migrations/       — SQL, 0001 a 0128, se aplican en orden a mano
docs/
  PROGRESO.md               — historial cronológico de auditorías/decisiones (fuente de verdad de "qué se hizo y por qué")
  ESPECIFICACION.md         — este archivo
```

## Los mundos — contenido

### Numeria (`/numeria`)
Temas: Aritmética (`/practica`), Fracciones (`/practica/fracciones`), Decimales (`/practica/decimales`), Potencias (`/practica/potencias`), Álgebra (`/practica/algebra`), Geometría (`/practica/geometria` — Perímetro/Área/Ángulos/Ternas pitagóricas). Los 6 temas tienen sub-temas independientemente elegibles y calibrados (cada uno su propio `problem_type` en `skill_levels`, sufijo `_<subtema>` salvo Aritmética que usa suma/resta/multiplicacion/division sueltos). Lecciones en `/aprender`.

### Enigmia (`/enigmia`)
Una sola calibración de nivel (no por categoría todavía). Práctica en `/enigmia/practica`, mezcla las 4 categorías — las tarjetas de "Categorías" de la home son solo informativas (ver convención de Practicar abajo), no filtran. Lecciones en `/enigmia/aprender`. Diagnóstico inicial en `/enigmia/diagnostico`.

### Geografía (`/geografia`)
Un continente por ruta: `/geografia/practica/europa`, `/africa`, `/asia-oceania`, y la ruta base `/geografia/practica` (América). Hub de selección en `/geografia/elegir`. Lecciones en `/geografia/aprender`. Nivel único compartido entre continentes (no hay sub-tema por región todavía).

### Quimia (`/quimia`)
5 modos, cada uno con su propio `problem_type` (`quimia_simbolos`, `quimia_formulas`, `quimia_tabla`, `quimia_nomenclatura`, `quimia_organica`). Hub de selección en `/quimia/elegir`. Lecciones en `/quimia/aprender`.

### Anatomía (`/anatomia`)
4 modos, cada uno con su propio `problem_type` (`anatomia_oseo`, `anatomia_muscular`, `anatomia_organos`, `anatomia_nervioso`). Contenido de nombres verificado (ver `src/lib/practica/anatomia.ts`) — sin una segunda propiedad independiente por término (a diferencia de Quimia, símbolo↔nombre), así que las preguntas son de clasificación ("¿cuál de estas opciones es un hueso del cráneo?"), nunca trivia inventada. Cada modo (salvo Órganos) tiene nivel bajo (términos generales) y nivel alto (el escalón específico: huesos del cráneo, músculos de la cara, pares craneales). Hub de selección en `/anatomia/elegir`. Lecciones en `/anatomia/aprender`. Color de marca bordó `#8B2942` (deliberadamente distinto del coral de error `#FF6B6B`).

## Convención fija: flujo de "Practicar"

Regla permanente para cualquier mundo, presente o futuro — no es una preferencia de una tanda puntual:

1. **La home de un mundo nunca deja arrancar una partida con un solo click.** Las tarjetas de tema/categoría/modo de la home (`TopicCard`) son solo vidriera — muestran el nivel actual, pero **sin `href`** (no son links). El único acceso real a jugar es la tarjeta "Practicar".
2. **"Practicar" entra siempre a un hub de selección**, nunca directo a una partida. Ese hub lista los temas del mundo (Numeria: `/practica/temas`; Geografía: `/geografia/elegir`; Quimia: `/quimia/elegir`; Enigmia no necesita hub propio porque no tiene sub-rutas reales, `/enigmia/practica` ya es el único destino).
3. **Si un tema tiene sub-temas reales** (Numeria: sí, los 6; Quimia: sus 5 modos ya son sub-temas de nivel superior, no hace falta un tercer escalón), el hub del tema (no el del mundo) muestra cada sub-tema con **su propio nivel**, en chips multi-seleccionables (`SubtemaPicker.tsx`, mismo patrón que ya usaba `OperationPicker.tsx` de Aritmética) — se puede elegir uno, varios, o todos antes de arrancar.
4. Esto **no** implica que todo mundo necesite sub-temas per se — Geografía y Enigmia hoy no los tienen (nivel único compartido), y eso es una decisión de contenido válida, no una violación de la convención. La convención es sobre el FLUJO de navegación (home → Practicar → [sub-tema si corresponde] → partida), no sobre cuántos niveles de sub-división tiene cada mundo.

## Sistemas de gamificación

- **Calibración por tema** (`skill_levels` / `logic_skill_levels`): nivel 1-10, sube con 3 aciertos seguidos, baja con 1 error (salvo escudo activo). Lógica pura en `src/lib/practica/skillLevels.ts` / `src/lib/enigmia/skillLevels.ts`.
- **Nivel de mundo** (`world_progress`, tabla separada, 1-100): combinación de 3 ejes, no solo Puntos acumulados (fórmula rediseñada — `0117_curva_nivel_mundo.sql`, espejo TS en `src/lib/practica/worldLevel.ts:46-49`): 34% volumen de Puntos ganados en ese mundo (normalizado a techo 25.000), 45% fracción de sub-temas del mundo con calibración ≥ nivel 4 (clamp((n−4)/6)), 21% fracción de lecciones de Aprender de ese mundo ya dominadas. `nivel = round(100 * (0.34*volumen + 0.45*dominio + 0.21*lecciones))`, con techo real en 100. Anti-farm por diseño: el farm de un solo sub-tema queda clavado en ~36. Se muestra con `NivelMundoBadge.tsx` (persistente) y celebra con `NivelMundoSubio.tsx` (el "gesto del logo") al subir.
- **Puntos** (`profiles.puntos_total`): moneda permanente, nunca baja sola. Se gana con `insertar_intento` / `insertar_intento_logica` (RPCs `security definer` de `0120` — migran el cálculo de XP al servidor).
- **Racha diaria** (`daily_progress`, `profiles.streak_dias`): meta de XP diaria configurable, congelamientos comprables para no perderla.
- **Escudos de calibración**: protegen el nivel de un error (no la racha de partida). Se compran en la tienda.
- **Boost de XP** (`boost_multiplicador_pendiente`): ×1.5 temporal, comprable.
- **Apuesta "doble o nada"** (`apuesta_monto`/`apuesta_umbral`): jugarse una racha de precisión a cambio de duplicar Puntos.
- **Tienda** (`/tienda`): escudos (350), congelamientos (450), boost (600), 6 fuentes (1.000–5.000), 6 marcos de rango (1.000–5.000), 8 marcos de mundo (2.400 c/u), paquete marcos mundo (14.500). 24 ítems, total sin paquete 47.900 Chispas. Todo pasa por `comprar_item_tienda` (RPC `security definer`). Catálogo verificado: `src/lib/tienda/costos.ts:21-70`.
- **Trastienda** (`/trastienda`): ruleta casino con 118 elementos de tabla periódica (fichas 100/250/500/1.000, límite 20/día, factor 0.88 — `0127`), apuestas a partida ajena (10/día, 500 Chispas — `0123`), predicción de ranking semanal (self-heal — `0123`/`0126`), minijuegos (Volado, Pizarra, La Calcu — `0121`/`0124`), historial completo. Títulos exclusivos (8 de 9 — falta `gniñardo`). División visual: sub-pestañas ruleta/juegos.
- **Logros** (`achievements`/`user_achievements`): catálogo fijo, se muestran todos (bloqueados o no) en `/perfil`.
- **Ranking semanal** (`ranking_semanal`): por XP de la semana, se reinicia los lunes. Filtro "por mundo" también disponible (dentro de Social > Amigos).
- **Rankeds** (`/rankeds`): competitivo real con ELO (`profiles.elo_rating`) y matchmaking (`duel_queue`, `buscar_rival_duelo`). Nivel mínimo de cuenta para acceder: nivel 5 (`guard.ts:184`). Mejor-de-3 para "Todas las ciudades" (3 rondas, ELO K×20 una sola vez al finalizar la serie — `0043`–`0045`). Anti-aleatorio: desde Platino, solo "todas las ciudades" (`0109`).
- **Duelos**: en Numeria, sala de espera sincronizada por Realtime (`SalaDuelo.tsx`, `0038`). En Geografía/Enigmia, patrón asincrónico/fantasma (cada uno juega por separado, se compara puntaje al final). Casual sin ELO (`0050`). Rendirse/abandono (`0088`). "Fantasma" del rival (`duel_results.respuestas`) que muestra el ritmo exacto de las respuestas ya guardadas.
- **Social** (`/social`): pestañas Amigos / Grupos (antes "Profesor"). `/amigos` y `/profesor` son redirects. Feed de actividad DESACTIVADO (`SocialClient.tsx:16-19`): código completo sin uso en runtime; plan de activación propuesto en `docs/audits/DUELOS-AUDIT.md §2.4`.
- **Reto diario** (`/reto-diario`): 5 problemas iguales para todos los usuarios el mismo día (RNG sembrado por fecha, determinístico). Reto semanal (`/reto-semanal`): 45 preguntas + ranking semanal (`0113`).

## Patrones de arquitectura establecidos

### RLS + `security definer`
Toda escritura de datos sensibles (Puntos, ELO, nivel, items de la tienda) pasa por funciones Postgres `security definer` con su propio chequeo `if auth.uid() is null then raise exception`. **Las policies de RLS por sí solas NO alcanzan** para proteger columnas específicas de una fila que el usuario sí puede tocar (ver hallazgo de la auditoría de seguridad, migración `0035`) — si una tabla necesita que el usuario actualice su propia fila pero solo algunas columnas, se usa `GRANT UPDATE (col1, col2) ON tabla TO authenticated` en vez de confiar en que nadie va a hacer un `update()` directo desde el cliente con más columnas de las esperadas. La familia S0/S1/S2/S3/S4/S8 se cerró en `0120` (XP/calibración server-side); S5 (doble-o-nada, `resolver_apuesta_si_activa` re-granted en `0121:605-649`) y S9 (edge functions sin verificación) quedan pendientes — ver `docs/audits/AUDIT-RLS-SEGURIDAD-2026-09-07.md`.

**Antes de agregar una función nueva que escriba datos de otro usuario que no sea el propio, chequeo obligatorio**: ¿tiene `security definer`? ¿Valida `auth.uid()` al principio? ¿El `with check` de cualquier policy de INSERT/UPDATE relacionada restringe lo que hace falta?

### Sistema de feedback de partida (compartido)
Todos los runners de práctica (Aritmética, Fracciones, Decimales, Potencias, Álgebra, Enigmia, Geografía, Anatomía, Melodía, Trigonometria, Historia) comparten:
- `TarjetaSprint.tsx` — la tarjeta flashcard con transición de entrada/salida
- `PuntajeCorner.tsx` — el puntaje que aparece al acertar
- `BarraTiempo.tsx` / `useBonusTiempo.ts` — barra de tiempo + bonus por velocidad
- `RachaFuego.tsx` — el fuego que crece con la racha de aciertos seguidos
- `EscudoIcon.tsx` — animación de escudo rompiéndose al gastarse
- `RevelarRespuesta.tsx` (usa `PixelTransition`) — revela la respuesta correcta al errar

**Importante**: estos NO están unificados en un solo componente de runner — cada tema tiene su propio archivo (`SprintRunner.tsx`, `FraccionSprintRunner.tsx`, `EnigmiaSprintRunner.tsx`, `GeografiaSprintRunner.tsx`, y `EnunciadoSprintRunner.tsx` compartido por Decimales/Potencias/Álgebra, más runners para Anatomía/Melodía/Trigonometria/Historia) que importa estas piezas a mano. **Si se agrega un tema nuevo, hay que acordarse de importar las 6 piezas** — así se generó el hueco que se cerró en la auditoría de esta sesión (Decimales/Potencias/Álgebra no tenían ninguna, Fracciones/Enigmia/Geografía les faltaba solo RachaFuego). Evaluado un refactor de unificación (hook o shell compartido) — invasividad media, recomendado para después de la primera ronda de usuarios reales, no antes.

### Deduplicación de problemas dentro de una partida
`src/lib/practica/generarUnico.ts` → `generarSinRepetir(generar, clave, usados, maxIntentos=20)`. Todo generador de problemas nuevo debe usar esto (registrar una clave canónica por problema, reintentar si ya salió en la partida, permitir repetir recién si se agotan los intentos). Ya aplicado en los 7 generadores existentes.

### Patrones seguros para el compilador de React
Este proyecto tiene el compilador de React activo con reglas estrictas de `eslint-plugin-react-hooks`. Patrones ya establecidos y probados:
- **Nunca leer ni escribir un ref durante el render** (ni en el cuerpo del componente ni en un lazy initializer de `useState`) — hacerlo en un efecto o en un event handler.
- **Ajustar estado durante el render** (no en un efecto) cuando hace falta reaccionar a un cambio de prop — comparar contra un valor anterior guardado en estado, y hacer el `setState` directo en el cuerpo del componente (React lo trata como bail-out seguro).
- **`useSyncExternalStore`** para lecturas one-shot del cliente (tema, toggle de efectos) — nunca `useEffect` + `setState` para esto.
- Callbacks asíncronos (`.then()`, `setTimeout`, un `async function` disparada desde un handler) sí pueden hacer `setState` sin problema, incluso si están anidados dentro de algo llamado desde un efecto.

### El "gesto del logo"
Animación de marca reutilizada en TODOS los momentos grandes de celebración: subir de nivel de operación, logro desbloqueado, ganar un duelo, subir de nivel de mundo. Componente: `GestoLogo.tsx` (anillo que se abre + chispa asimétrica en degradé violeta→dorado). Nunca usar confetti genérico ni una animación nueva para un "momento grande" — reusar este gesto.

### `Boton.tsx`
Único componente de botón del proyecto. Variantes: `primario` (con `destacado` opcional → envuelve en `BorderGlow`), `secundario` (renderiza `SpecularButton`, WebGL), `fantasma`, `peligro`. **No crear botones sueltos con `<button>` + clases manuales** — los que quedan así (ej. algunos "Volver" de error, opciones en grillas de selección) son excepciones deliberadas ya documentadas en `PROGRESO.md`.

### Todo mundo/feature grande nuevo debe reflejarse en `/perfil` en la misma tarea
Quimia se agregó como mundo jugable completo (migración `0056`) pero quedó **sin ninguna presencia en `/perfil`** — sin tarjeta de estadística, sin nivel de mundo visible — durante varias tandas, hasta que se detectó recién en una auditoría posterior. `afinidad_por_mundo()` y `lecciones_completadas_por_mundo()` sí la traían bien (agrupan por `mundo`/`problem_type` de forma genérica), pero la grilla de tarjetas de arriba (`numeriaTotal`/`enigmiaTotal`/`geografiaTotal` en `src/app/perfil/page.tsx`) estaba escrita a mano por mundo y nadie sumó la cuarta. **Regla de acá en más**: agregar un mundo o cualquier feature grande nueva (con progreso/nivel/estadística propia) incluye, como parte de la MISMA tarea, sumar su tarjeta correspondiente en `/perfil` — no queda para "después". Antes de dar por terminada una tarea así, repasar `src/app/perfil/page.tsx` explícitamente.

Esta regla puntual sobre `/perfil` quedó chica: **Anatomía repitió el mismo patrón de Quimia, pero en más lugares a la vez** (auditoría 2026-08-23, ver `docs/PROGRESO.md`). La sección siguiente reemplaza a esta como la lista completa y permanente a chequear.

## Checklist de mundo nuevo (obligatoria, la misma tarea que agrega el mundo)

Cada mundo (`numeria`, `enigmia`, `geografia`, `quimia`, `anatomia`, `melodia`, `trigonometria`, `historia`, y cualquiera que se agregue después) tiene que aparecer en **todos** estos puntos. La causa raíz de que esto se rompa dos veces seguidas (Quimia, después Anatomía) es siempre la misma: son listas de TypeScript/SQL escritas a mano en varios archivos, no derivadas de una única fuente de verdad — agregar el mundo a la tabla `world_progress_world_check` o al `MundoSelector` no alcanza, hay que tocar cada ítem de acá por separado. Ninguno de estos falla con un error visible cuando falta un mundo — el mundo simplemente no aparece como opción, en silencio.

| # | Punto de integración | Dónde vive (patrón a repetir) |
|---|---|---|
| 1 | Header / navegación | `src/components/Header.tsx` (`colorDelMundo`), `src/components/MundoSelector.tsx`, `src/lib/mundos.ts` (`MUNDOS_LANDING`, íconos en `src/components/icons.tsx`) — **y también** `src/app/[locale]/page.tsx` (home autenticada, sección "Tus mundos"): tiene su propia lista de `<WorldCard>` escrita a mano, ninguna de las otras 3 fuentes la alimenta. Causa real de que Melodía no apareciera en el catálogo (auditoría 2026-08-24) — confirmado antes de arreglar, no asumido |
| 2 | Guard de onboarding propio | `src/lib/auth/guard.ts` → `requireMundo<Nombre>` (además: constraint `boolean onboarding_<mundo>_completado` en `profiles`, **y su columna sumada al `GRANT UPDATE (...)` de `profiles`** — este paso puntual ya causó 2 incidentes reales, Quimia en `0057` y Anatomía en `0086`; nunca asumir que sumar la columna alcanza) |
| 3 | Calibración de dificultad (`skill_levels`) | `src/lib/practica/skillLevels.ts` (union type `ProblemTypeCalibrable`) **y** `src/app/api/attempts/route.ts` (array `tiposCalibrables`) — sin los DOS, `/api/attempts` nunca escribe `skill_levels` para ese mundo y la dificultad no calibra nunca, aunque la UI no muestre ningún error |
| 4 | `world_progress` (nivel de mundo) | constraint `world_progress_world_check` (SQL) + rama propia dentro de `registrar_puntos_mundo()` (SQL) **y** `mundoDeProblemType()` en `src/app/api/practica/finish/route.ts` — el RPC de SQL puede estar listo y aun así el nivel de mundo no subir nunca si esta función de TypeScript no reconoce los `problem_type` del mundo |
| 5 | Tarjeta de estadística en `/perfil` | `src/app/[locale]/perfil/page.tsx` (conteo de `attempts` + tarjeta) — ver nota arriba, ya documentada, sigue vigente |
| 6 | Lecciones ("Aprender") | `lecciones_completadas_por_mundo()` (SQL) — normalmente genérica por `problem_type`, confirmar igual |
| 7 | Ranking global "por mundo" y ranking de amigos | `src/app/[locale]/leaderboard/LeaderboardClient.tsx` (`type Mundo`, array `MUNDOS`) **y** el RPC `ranking_semanal_filtrado` (SQL, guard `if p_mundo not in (...)`) — ambos lados tienen que sumar el mundo, uno solo no alcanza |
| 8 | Rankeds — ciudad seleccionable para duelos (matchmaking clasificatorio y casual) | `src/lib/duelos/rutas.ts` (`type MundoDuelo`, de acá cuelga `RankedsClient.tsx` y `RetarPicker.tsx`) **y**, en SQL: `duels_mundo_check`, `duel_queue` (su check de mundo), `buscar_rival_duelo()` (guard + el array `v_mundos` de la serie "todas las ciudades") |
| 9 | Retar a un amigo | `src/app/[locale]/social/RetarPicker.tsx` **y** `src/app/api/amigos/retar/route.ts` (`MUNDOS_VALIDOS`) |
| 10 | Invitar por link | `duel_invites_mundo_check` (SQL) **y** `crear_invitacion_duelo()` (SQL, guard propio) |
| 11 | Matriz de acceso reducido para invitados | `src/lib/auth/accesoInvitado.ts` — decisión de producto explícita por mundo (¿qué puede hacer un invitado ahí sin restricción?), no asumir que "no tener entrada" significa "sin restricción a propósito" |
| 12 | Logros con criterio propio | `src/lib/logros/verificar.ts` (rama de criterios) **y** el achievement insertado en una migración **y** `'<mundo>'` sumado a `achievements_categoria_check` (SQL) — las 3 partes, no solo el insert |
| 13 | Títulos "maestro-X" / "estudioso-X" | `src/lib/titulos/catalogo.ts` (`CriterioTitulo`, entradas del catálogo) **y** `src/lib/titulos/verificar.ts` (switch de `mundoCompletado`) |
| 14 | Feed social (nombre de mundo en los posts) | `src/app/[locale]/social/Feed.tsx` y `FeedSidebar.tsx` (`NOMBRE_MUNDO`) |
| 15 | Título "Explorador Total" / logros de "todos los mundos" | `src/lib/titulos/catalogo.ts` — cualquier criterio tipo `mundos_explorados: N` tiene que actualizar `N` al sumar un mundo, si no el logro deja de significar "todos" |

**Cómo usar esta lista**: al cerrar la tarea de un mundo nuevo (o de cualquier feature que dependa de "cuáles son los mundos"), repasarla ítem por ítem y confirmar cada uno con evidencia (archivo + línea), no de memoria — así se armó originalmente, auditando Numeria/Geografía/Enigmia (mundos maduros) contra Quimia y Anatomía (los que quedaron con huecos) el 2026-08-23. Ver `docs/PROGRESO.md` para el detalle punto por punto de qué le faltaba a Anatomía específicamente y qué se corrigió en esa auditoría.

## Componentes de react-bits portados (`src/components/reactbits/`)

Se integraron 9 (de 10 pedidos): BorderGlow, FadeContent (adaptado como `PageFade.tsx`), SplitText (queda sin usar tras el problema de gsap — la técnica real de I3 ahora vive en framer-motion dentro de `PrimeraVezTip`... que a su vez también se desactivó, ver Pendiente), GlareHover, PixelTransition, GhostCursor, SpecularButton, ClickSpark (adaptado como `ChispaClick.tsx`, con la forma del logo en vez de líneas genéricas), BubbleMenu (portado fiel pero sin punto de uso real — la técnica se extrajo a `AbanicoBurbuja.tsx`, que también se dio de baja, ver Pendiente). **Lanyard** quedó explícitamente anotado para más adelante, no se tocó.

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # falta agregarla — ver Pendiente
```
La service_role key solo la usa `src/lib/supabase/admin.ts`, importado únicamente por `api/perfil/eliminar-cuenta/route.ts` (server-only, nunca se expone al cliente — confirmado inspeccionando el bundle real). **Nunca** importar `admin.ts` desde un Client Component.

## Migraciones (`supabase/migrations/`, 0001-0128)

Se aplican en orden, a mano, desde el SQL Editor de Supabase (no hay CLI en este entorno). Resumen por bloques:
- **0001-0011**: esquema base (perfiles, intentos, técnicas, calibración, progreso diario, modificadores, ranking, onboarding, logros, tienda inicial)
- **0012-0017**: amigos, duelos, feed, plan académico (profesor/grupos), Enigmia, ELO, economía
- **0018-0026**: lecciones de Numeria, fracciones, categorías de Enigmia, amigos v2, geografía, fix de recursión en grupos, reto diario, tienda ampliada, decimales/potencias
- **0027-0034**: lecciones de geografía, fantasma de duelos, ranking por mundo, fix de memoria en Enigmia, matchmaking de rankeds, álgebra básica, nivel de mundo, fix de nivel anterior
- **0035-0036**: **auditoría de seguridad pre-lanzamiento** — cierra 2 vulnerabilidades altas (policies de UPDATE sin `with check` en `profiles` y `duels`, explotables desde la consola del navegador) y 2 medias (`duel_results`, `friendships`); 0036 es un hotfix urgente porque 0035 rompió `registrar_xp_diario`/`comprar_item_tienda` al no haberles agregado `security definer` también.
- **0037-0041**: nombre único, duelos tiempo real (Realtime), avatares, perfil público y reportes, ranking con avatar
- **0042-0047**: ranking excluye invitados, rankeds rangos/títulos/multi-mundo, título junto al nombre, serie ELO simétrico, numeria operación aleatoria, rechazar duelo
- **0048-0055**: Enigmia complejidad por rango, ranking amigos, duelos casuales, invitaciones temporales, feed diversificado, problemas personalizados, tienda rediseno, grupos delete policy
- **0056-0062**: mundo Quimia, fix grant onboarding Quimia, matchmaking fantasma, invitar por link multi-mundo, auditoría RLS 2, tienda precios piso, lecciones por mundo y mundo completado
- **0063-0070**: invitar amigo sin cuenta, racha en riesgo, anuncios, clan de bots, Quimia nomenclatura orgánica, clanes reales, clanes fixes, clanes niveles y roles
- **0071-0078**: duelo mi puntaje en espera, ELO K factor por rango, ELO K factor serie, serie duelos rival puntaje, tienda fuentes nuevas, mundo clanes, clan de bots más rivales, Platino solo todas las ciudades
- **0079-0086**: practicar sub-temas, nivel mundo dominio real, mundo Anatomía, lecciones geometría/anatomía, ranking ELO global, imagen clan, perfil idioma, fix grant onboarding Anatomía
- **0087-0094**: anatomía checklist mundo, rendirse duelo, mundo Melodía, lecciones Melodía, duelos anatomía/melodia, FK borrado cuenta, chat de clan, serie duelos rival puntaje
- **0095-0114**: reto diario 45 multi-mundo, melodia oído absoluto, desbloquear mundo, lecciones historia, mundo Trigonometria, duelo trigonometria/historia, purge/anonymize, edge functions (notify-duelo, racha-en-riesgo, notify-clan-mensaje), levels mundo, mismatch fix, tienda marcos mundo, ranking elo global fix
- **0115**: auditoría seguridad (S6/S7/S10 — handle_new_user search_path, friendships INSERT check, acreditar_chispas guard)
- **0116**: fix elegir dos mundos (self-heal cardinalidad 1→2)
- **0117**: curva nivel mundo (34/45/21, techo 25000)
- **0118**: niveles cuenta escalera (200/300/550/900/1400/1900/2400) + recompensa 50n+250
- **0119**: filtro ranking usuarios permanentes
- **0120**: cerrar familia S0/S1/S2/S3/S4/S8 (XP/calibración server-side, `insertar_intento`/`insertar_intento_logica`)
- **0121**: trastienda economía (ruleta, volado, pizarra, historial, doble-o nada resiliente)
- **0122**: arreglo pizarra (PGRST202)
- **0123**: trastienda mecánicas 1/2/3 (apuestas, predicciones, títulos)
- **0124**: trastienda minijuegos (La Calcu, Acertijos, El Reloj)
- **0125**: recálculo niveles mundo + saneo
- **0126**: trastienda limpieza (QA oculto, oráculo, mesa paginada, eliminación Acertijos/El Reloj, español normalizado en RPCs)
- **0127**: trastienda ruleta casino (118 elementos, factor 0.88, 20/día)
- **0128**: español neutro latinoamericano (9 RPCs con mensajes neutros)

**Antes de compartir la app con gente real, confirmar que 0035 y 0036 estén aplicadas** — sin ellas, cualquier usuario logueado puede escribirse Puntos/ELO/items de la tienda directo desde la consola del navegador.

## Pendiente / decisiones para revisar

1. **`SUPABASE_SERVICE_ROLE_KEY`** — en `.env.local` para desarrollo; confirmar en Vercel para producción. Sin ella, "Borrar mi cuenta" falla en producción (con error controlado, no un crash).
2. **Confirmar en Vercel**: variables de entorno coinciden con `.env.local`, y en Supabase → Authentication → URL Configuration está cargada la URL real de producción (si no, el login funciona en localhost pero falla en producción). Redirect URLs: `https://tu-dominio.vercel.app/**` (con comodín, ver `docs/PROGRESO.md` V3).
3. **Tour de onboarding desactivado** (`PrimeraVezTip.tsx` ya no se usa desde `Header.tsx:27-31`) — se sacó por un bug de renderizado nunca resuelto del todo (ver advertencia de gsap arriba, aunque el causante final terminó siendo un problema de `overflow-x-auto` recortando el eje Y, no gsap en sí — quedó desactivado igual porque no se re-intentó reactivarlo tras el fix). Si se quiere reactivar, revisar `Header.tsx` (buscar el comentario sobre `mostrarTour`).
4. **`AbanicoBurbuja.tsx`** (animación en abanico del menú de cuenta) también desactivada — `ProfileMenu.tsx` volvió al fundido simple original. El archivo queda sin usar.
5. **Refactor de unificación de runners de práctica** — evaluado, no implementado (ver sección de arquitectura arriba).
6. **Manejo de errores sin detalle técnico** — ~19 rutas de API reenvían `error.message` directo al cliente sin un `catch` genérico externo. Seguro en el camino feliz (son mensajes en español definidos a propósito), pero un error verdaderamente inesperado se propagaría sin capturar. No se tocó (cambio grande, 19 archivos). Nota: `respuestaError` (`src/lib/api/respuestaError.ts`) centraliza el manejo en las 24 rutas desde la tanda X3.
7. **`ProfesorClient.tsx`** (lista de grupos) no muestra un mensaje explícito de "sin grupos todavía" cuando está vacío — no está roto, pero es inconsistente con el resto de las pantallas que sí lo hacen.
8. **Hydration warning menor** en `ProgressDial` (diferencia de precisión de punto flotante en un atributo `cx` de SVG entre servidor y cliente) — no afecta funcionalidad.
9. **`overflow-x: auto` en un contenedor recorta también el eje Y** aunque no se pida — causó dos bugs reales esta sesión (tooltip del tour, desplegable de cuenta, ambos clippeados por el `<nav>` del header). Si se necesita que algo escape hacia abajo de un contenedor con scroll horizontal, no usar `overflow-x-auto` — usar `flex-wrap` (la solución que se terminó aplicando en el header) u otro contenedor.
10. **Feed social DESACTIVADO** — código completo (`Feed.tsx`, `FeedSidebar.tsx`, APIs `api/feed/*`), sin uso en runtime (`SocialClient.tsx:16-19`). Plan de activación propuesto en `docs/audits/DUELOS-AUDIT.md §2.4`. Pendiente decisión del PO.
11. **Doble-o-nada: S5 CRÍTICO** — `resolver_apuesta_si_activa(p_precision)` re-granted con `security definer` en `0121:605-649`, pero `p_precision` viene del cliente → apuesta siempre ganada. Requiere migración para derivar `p_precision` server-side. Ver `docs/audits/AUDIT-RLS-SEGURIDAD-2026-09-07.md`.
12. **Edge functions (S9)** — `notify-duelo`, `notify-clan-mensaje`, `racha-en-riesgo` sin verificación de llamada. BAJO, documentado.
13. **Clanes**: costo 5000 Chispas, roles (fundador/guía/miembro), chat con push (`0092`, edge function), estandarte 2.600px, mapa/ciudad tierCiudad, guerra semanal (`0076`/`0077`), nivel clan sin cap.
14. **Límites verificados**: racha diaria, escudos de calibración, doble-o-nada (200 Chispas), apostar a partida (10/día, 500 Chispas), casino (20/día), apuestas amigos solo duels.
15. **PWA sin offline** — `public/sw.js` cachea solo `/_next/static/*` e íconos (a propósito, sin caché de páginas ni API). Multiplataforma: solo Android (Capacitor). Push nativas solo para app nativa (`NativePush.tsx`).
16. **Pro informativo** — `pro/page.tsx:12-16` es solo pantalla informativa, sin pasarela de pago. Sin fecha de implementación.
17. **Migraciones pendientes de aplicar a producción**: `0116` → `0117` → `0118` → `0119` → `0120` → `0121` → `0122` → `0123` → `0124` → `0125` → `0126` → `0127` → `0128` + `NOTIFY pgrst, 'reload schema';`. Aplicar en orden.

## Cómo levantar el proyecto

```
npm install --legacy-peer-deps   # hace falta el flag por conflicto de peer deps de react-simple-maps con React 19
npm run dev
```
Requiere `.env.local` con las variables de arriba. Sin `SUPABASE_SERVICE_ROLE_KEY`, todo funciona salvo "Borrar mi cuenta".
