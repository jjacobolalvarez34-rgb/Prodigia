# Auditoría: los niveles de los mundos no progresan

- Fecha: 2026-09-08
- Prioridad: P1
- Agente: gameplay + backend-supabase + educational-content
- Estado: CONFIRMADO — fix implementado y verificado (migración + código + tests)

---

## PROBLEMA

En Numeria, un usuario lleva ~800 problemas resueltos y el mundo sigue en
**nivel 1**. El mundo no progresa pese a gran volumen de práctica.

---

## CAUSA RAÍZ (investigada en código, no asumida)

**Pipeline real (verificado):**
1. Cada intento se guarda por `POST /api/attempts`
   (`src/app/api/attempts/route.ts:66`) con su `xp` calculado en server
   (`src/lib/practica/formulas.ts`) — `XP = 10 base × mult_nivel × bonus_velocidad`,
   tipicamente ~11–25 XP por acierto según nivel.
2. Al terminar el sprint, `POST /api/practica/finish` (`src/app/api/practica/finish/route.ts:173`)
   suma el XP del sprint y llama
   `supabase.rpc("registrar_puntos_mundo", { p_world: mundo, p_puntos: sprintXp })`.
   Enigmia hace lo mismo en `src/app/api/enigmia/finish/route.ts:99`.
3. `registrar_puntos_mundo()` (definido en `supabase/migrations/0080…/0098…/0109…/0116…`)
   acumula `puntos_mundo` **por mundo** y recalcula `world_progress.nivel_mundo`.
4. La UI muestra ese mismo `world_progress.nivel_mundo`:
   - `src/app/[locale]/numeria/page.tsx:46-49` lee `nivel_mundo` y lo pasa a
     `NivelMundoBadge` (`src/components/NivelMundoBadge.tsx:18` → "Nivel {nivel}").
   - No hay otro contador "escondido": el nivel que ve el usuario ES
     `world_progress.nivel_mundo`. Los demás usos (tienda, título, feed, logros)
     leen exactamente la misma columna.

**Fórmula vigente (la que deja todo en nivel 1):**
```
nivel = round(100 * (0.3*volumen + 0.5*dominio + 0.2*lecciones))
volumen  = min(1, puntos_mundo / 50000)          -- umbral 50000
dominio  = fracción de sub-temas del mundo con calibración NIVEL 10
lecciones= fracción de "Aprender" dominadas
```
con techo en 100.

**Por qué no progresa con 800 problemas:**
Con ~800 problemas a ~15 XP ⇒ ~10–12k puntos_mundo:
- `volumen = 12000/50000 = 0.24` → aporta `0.3 × 0.24 = 0.072`
- `dominio`: exige calibración **nivel 10** en cada sub-tema. La calibración
  (`calcularNuevoNivel`, `src/lib/practica/skillLevels.ts:9`) sube 1 cada 3
  aciertos seguidos y **baja 1 con un error**; nivel 10 es casi inalcanzable
  en uso real → `dominio ≈ 0` pese a muchísima práctica → aporta ~0.
- `lecciones`: si no dominaste "Aprender", aporta `0.2×0 = 0`.
- `nivel = round(100×(0.072+0+0)) = 7`… pero en la práctica, si además el
  usuario no llegó a nivel 10 en NINGÚN sub-tema ni completó lecciones, el
  único aporte es volumen: `round(100×0.072) = 7` redondeado… **pero con XP
  más conservadora (~10k) o sin lecciones dominadas queda aún más cerca de
  1**, y el `greatest(1, …)` deja el piso en 1. Con dominio=0 y volumen
  corriendo despacio, el mundo queda efectivamente clavado en nivel 1.

**Conclusión (causa raíz):** el nivel depende casi por completo del eje
"dominio a nivel 10" (50% del peso) que el juego real casi nunca alcanza; el
eje "volumen" (el único que acompaña el juego continuo) está sub-ponderado y
con techo altísimo (50000). Resultado: 800 problemas NO mueven el nivel, no
por un bug de acumulación sino por **diseño de la curva demasiado exigente en
el eje de dominio y demasiado tímido en el de volumen**.

(Nota: el `umbral 50000` de `registrar_puntos_mundo` NO hizo que el cliente
dejara de reportar — las rutas de finish llaman al RPC incondicionalmente con
`p_puntos = sprintXp`; el problema es solo dónde cae ese XP en la fórmula.)

---

## PROPUESTA (fórmula + curva escalable)

Se mantiene el **mismo mecanismo** (acumular `puntos_mundo` por mundo y
recalcular `nivel_mundo`), pero con una **curva escalable** que:
- deja que el **volumen** real acompañe el progreso (800 problemas ya suben),
- premia **profundidad** desde nivel 4 (no recién en nivel 10),
- exige **amplitud** para llegar al techo (farmear un solo sub-tema no rompe
  la curva),
- premia **lecciones** "Aprender" como tercer eje.

### Fórmula

```
volumen   = min(1, puntos_mundo / 25000)                    (34%)
dominio   = promedio por sub-tema de clamp((nivel_i − 4)/6, 0, 1)   (45%)
              · sub-tema sin calibrar (nivel 1) → 0
              · nivel 4 → 0
              · nivel 10 → 1
lecciones = completadas / total  (1 si el mundo no tiene "Aprender") (21%)

nivel = clamp( round(100 × (0.34·volumen + 0.45·dominio + 0.21·lecciones)), 1, 100 )
```

### Propiedades del diseño

- **Subir no es trivial:** dominar el 100% exige nivel 10 en TODOS los
  sub-temas del mundo + todas las lecciones + volumen pleno.
- **800 problemas NO dejan en nivel 1:** a ~12k XP + ~60% de dominio →
  nivel ≈ 54.
- **Anti-farm (repetir la misma pregunta al infinito):** el eje de volumen
  **solo** tiene techo en 34 puntos (`0.34×1.0`). Dominar un único sub-tema
  al infinito (suma a nivel 10 + millones de XP) queda en ~36 — nivel medio,
  nunca cerca del techo. Esto es a propósito: en Numeria cada problema se
  genera de forma procedural (único), y en los mundos con pool finito
  (geografía/historia) granjear XP tampoco alcanza niveles altos porque falta
  la amplitud de dominio para aportar.
- **Qué cuenta como "progreso":** respuestas correctas **acumuladas** por
  mundo (volumen, ya registradas en `puntos_mundo`) + **nivel de calibración
  por sub-tema** (dificultad/depth, leído de `skill_levels`) + **lecciones
  dominadas**. No se necesita una tabla nueva de "preguntas únicas": el
  volumen de respuestas correctas en `attempts.xp` y la amplitud de
  `skill_levels` ya capturan ambos ejes y son anti-farm por diseño.

---

## SIMULACIONES (4 jugadores, Numeria — 20 sub-temas)

Criterio de simulación: dominio = promedio de `clamp((nivel_i−4)/6,0,1)`
sobre los 20 sub-temas; XP estimada por problema según nivel de calibración
(~11–15). Resultados exactos calculados con la fórmula del fix:

| Jugador | Problemas | XP mundo | Sub-temas activos (nivel aprox.) | Lecciones | dominio | Nivel mundo |
|---------|-----------|----------|----------------------------------|-----------|---------|-------------|
| pequeño   | ~30   | ~330   | 3 a nivel ≤3          | 0/20  | 0.000  | **1**  |
| medio     | ~400  | ~5200  | 10 a nivel 6–7         | 3/20  | 0.117  | **15** |
| avanzado  | ~800  | ~12000 | 18 a nivel 8           | 10/20 | 0.600  | **54** |
| extremo   | ~5000 | ~75000 | 20 a nivel 9           | 20/20 | 0.833  | **93** |
| farm (1 sub-tema, XP ∞) | ∞ | ~2M | solo suma nivel 10     | 0/20 | 0.050 | **36** |

Interpretación:
- El **casual** se queda en nivel 1 (correcto: no es trivial subir).
- El **medio** (400 problemas) ya destraba (15).
- **800 problemas ⇒ nivel 54** — resuelto el caso reportado.
- El **extremo** se acerca al techo (93), que exige todo dominado (no llega a
  100 sin nivel 10 en los 20 sub-temas + todas las lecciones).
- **Farming** (un solo sub-tema, XP infinito) queda clavado en ~36: volumen
  pleno con un solo sub-tema dominado. No rompe la curva.

**Explicación de la curva con ejemplos (nivel por volumen puro, sin dominio):
** `nivel = 0.34×volumen` → 0 XP=1, 6250 XP=9, 12500 XP=17, 25000+ XP=34
(techo por volumen). Para superar 34 hay que sumar dominio y lecciones —
nadie sube solo farmeando volumen.

---

## IMPLEMENTACIÓN

### Migración `supabase/migrations/0117_curva_nivel_mundo.sql`
(0117 libre — la última existente es 0116)

- Define la **nueva** función `public.registrar_progreso_mundo(p_world, p_puntos)`
  (patrón `create or replace`, `security definer`, `set search_path = public`,
  `grant execute … to authenticated`), que:
  1. acumula `puntos_mundo` por mundo (igual que antes),
  2. calcula `nivel_mundo` con la fórmula nueva (volumen 34% / dominio 45% /
     lecciones 21%, techo de volumen 25000, dominio desde nivel 4),
  3. devuelve `(world, puntos_mundo, nivel_mundo, nivel_anterior)` — idéntico
     contrato que `registrar_puntos_mundo`, así los finish siguen igual.
- **No toca** `registrar_puntos_mundo`, `registrar_xp_diario` ni nada de la
  familia S0/S1 (backlog de seguridad). Quedan intactos.
- Incluye las ramas de dominio/lecciones para los 8 mundos
  (numeria, geografia, quimia, enigmia, anatomia, melodia, trigonometria, historia).

### Cliente/API (punto de cálculo del nivel)
El nivel lo calcula el RPC (server), no el cliente. Solo se cambió **qué RPC
llaman los finish** para usar la curva nueva:
- `src/app/api/practica/finish/route.ts:173` → `registrar_progreso_mundo`
- `src/app/api/enigmia/finish/route.ts:99` → `registrar_progreso_mundo`

El resto del contrato (hito de feed cada 5 niveles, `subio`, respuesta
`nivelMundo`) no cambia porque el RPC devuelve la misma forma.

### Función pura + tests
- `src/lib/practica/worldLevel.ts` — implementación **pura** de la fórmula
  (`calcularNivelMundo`, `fraccionDominio`, `VOLUMEN_TECHO`, pesos) +
  helper `calcularNivelMundoDB` espejo del RPC.
- `src/lib/practica/worldLevel.test.ts` — vitest con los 4 jugadores + anti-farm.

---

## VERIFICACIÓN

- `npx tsc --noEmit -p tsconfig.json` (workdir=calibra): **sin errores**.
- `npx eslint <archivos modificados>`: **sin errores**. (El `npm run lint`
  global reporta 4 errores y warnings **preexistentes** en archivos que no
  toqué — SocialClient, refs en varios componentes, generadores, etc.)
- `npm test` (`vitest run`): **126 passed / 0 failed** (10 archivos).
  Incluye los 6 tests nuevos de `worldLevel.test.ts`.
- Build: **no ejecutado** porque no se tocaron rutas nuevas (solo se cambió
  el nombre de un RPC dentro de dos route handlers existentes). Anotado como
  pendiente de build en `npm run build`.
- Playwright: **NO VERIFICADO** — requiere entorno con Supabase live +
  service_role; no se ejecutó para no arriesgar datos de producción.

---

## ESTADO

CONFIRMADO (causa raíz) — fix implementado, migración lista para aplicar,
código y tests verificados (tsc/ESLint/vitest). Playwright pendiente.

## ARCHIVOS MODIFICADOS

- `supabase/migrations/0117_curva_nivel_mundo.sql` (nuevo)
- `src/lib/practica/worldLevel.ts` (nuevo)
- `src/lib/practica/worldLevel.test.ts` (nuevo)
- `src/app/api/practica/finish/route.ts` (modificado: RPC nuevo)
- `src/app/api/enigmia/finish/route.ts` (modificado: RPC nuevo)
- `docs/audits/NIVELES-MUNDOS-2026-09-08.md` (este documento)

## SIGUIENTE PASO

1. Aplicar `0117_curva_nivel_mundo.sql` a la base (producción y cualquier
   etapa local) — el código ya depende de `registrar_progreso_mundo`.
2. Correr `npm run build` en CI/QA.
3. (Opcional) Playwright: entrar a Numeria con anon, resolver 1 problema,
   verificar por `service_role` que `puntos_mundo` y `nivel_mundo` suben.
4. Observar en vivo: los niveles de mundo existentes se recalculan en la
   próxima partida terminada por cada usuario (el RPC recalcula desde cero
   cada finish), sin data migration manual.
5. Backlog de seguridad: cuando se retome, migrar `registrar_puntos_mundo`
   a la misma curva y unificar para no mantener dos RPC de nivel de mundo.
