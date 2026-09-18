# Plan de revisión de contenido: pedagogía + notación + traducción

Documento vivo. Define CÓMO se hacen (en qué orden, con qué reglas de
"no romper nada") dos procesos grandes y separados que hay que repetir
mundo por mundo. No es un reporte de que ya se hizo — es la guía para
hacerlo, sesión tras sesión, sin perder de vista qué falta.

## Los dos procesos

**Proceso 1 — Revisión pedagógica de Aprender** (lección por lección,
mundo por mundo): la enseñanza tiene que ser correcta, y **todas** las
lecciones necesitan su propio ejercicio de práctica al final (ahora
mismo casi ninguna lo tiene — ver estado real más abajo). Incluye
además mejorar cómo se VE la notación matemática (hoy es texto plano
con superíndices unicode sueltos tipo `x²`, fracciones escritas
`x/y`, nada de esto se ve realmente bien).

**Proceso 2 — Normalización y traducción de todo el texto generado**:
no solo Aprender — también los enunciados y opciones de TODAS las
preguntas de práctica de los 10 mundos, que hoy están 100% hardcodeadas
en español dentro de los generadores (`src/lib/practica/*.ts`), sin
ninguna traducción al inglés, y con notación inconsistente (mezcla de
`^`, `sqrt(`, unicode, texto plano).

Son procesos relacionados (los dos tocan "cómo se ve/lee el
contenido") pero de alcance distinto: el Proceso 1 es sobre
`techniques` (la tabla de Aprender, ~60-90 filas en toda la app); el
Proceso 2 es sobre los generadores de preguntas (26 archivos en
`src/lib/practica/`, contenido infinito/procedural, no filas de DB).

## Estado real hoy (verificado en código, no supuesto)

- **Ninguna librería de renderizado matemático instalada** (`katex`,
  `mathjax`, `react-katex`, etc. — cero resultados en `package.json`).
- **Solo 2 de ~19 migraciones que insertan `techniques` tienen quiz**:
  `0170_calculia_curso_pro.sql` y `0171_circuitia_curso_pro.sql` (el
  curso Pro, hecho en esta misma sesión). Las ~17 migraciones
  anteriores (Numeria x8, Geografía, Quimia, Anatomía, Melodía,
  Trigonometría, Historia, más las 5 técnicas rápidas de Calculia y
  Circuitia) **no tienen ningún ejercicio** — son solo `pasos` de
  lectura, sin nada que pruebe si se entendió.
- **`techniques` no tiene columna de idioma** — el contenido es texto
  plano en español, uno solo, sin estructura para inglés.
- Ya existe una convención parcial de notación más linda: 32 archivos
  usan superíndices unicode (`²³⁴ⁿ`) en vez de `^2`/`^3`/`^n` — es un
  punto de partida, no hay que empezar de cero, pero no resuelve
  fracciones, raíces, ni expresiones compuestas.
- Los generadores de preguntas (Geografía, Quimia, Anatomía, Melodía,
  Trigonometría, Historia, Numeria) están **100% en español, sin
  traducir** — esto ya estaba documentado como decisión consciente en
  el barrido de traducción anterior (`I18N-AUDIT.md`), no es un bug
  nuevo, pero es exactamente lo que el Proceso 2 tiene que resolver.

## Reglas de "no romper nada" (aplican a los dos procesos, siempre)

1. **Nunca editar una migración ya escrita** — si `0170` ya existe y
   hay que agregarle un quiz a una lección que quedó ahí, se hace en
   una migración NUEVA (`insert`/`update` sobre esa fila por `slug`),
   nunca reabriendo el archivo viejo. Las migraciones son historia, no
   un documento editable.
2. **Nunca cambiar el `slug` de una técnica existente** — `slug` es la
   clave que usa `technique_progress` para saber qué dominó cada
   usuario. Cambiarlo huerfaniza el progreso real de gente que ya
   completó esa lección.
3. **El renderizado nuevo tiene que ser retrocompatible por
   construcción, no por disciplina**: la regla de sintaxis (ver
   "Convención de notación" abajo) tiene que hacer que el texto VIEJO
   (sin la sintaxis nueva) se siga viendo exactamente igual que hoy,
   automáticamente — nunca depender de "no romper nada mientras
   convierto todo a mano", porque en algún punto se olvida una fila.
4. **Un mundo a la vez, con commit propio por mundo** — nunca un commit
   gigante de "traduzco/normalizo todo" de una. Si algo se rompe en
   Anatomía, tiene que poder revertirse sin tocar Quimia.
5. **Verificación obligatoria después de cada mundo**: `tsc --noEmit`,
   `eslint` de los archivos tocados, `vitest run` completo (sin
   regresión), `JSON.parse` de `es.json`/`en.json` si se tocan, y —
   específicamente para todo lo que sea contenido matemático nuevo o
   re-traducido — el mismo método que ya se usó para Calculia/Circuitia:
   un test que recalcula cada respuesta por un método independiente
   (diferencia finita, Simpson, resolución real del circuito, etc.),
   nunca "se ve bien a ojo".
6. **Nunca tocar la lógica de los generadores al mismo tiempo que se
   traduce el texto** — separar en dos commits incluso dentro del mismo
   mundo: uno que solo cambia strings (texto/notación/traducción) sin
   tocar ninguna fórmula ni cálculo, y otro (si hace falta) que toca
   lógica. Mezclar los dos hace que un bug de redacción y un bug de
   matemática se vean idénticos en el diff.

## Convención de notación elegida: LaTeX inline con `$...$`, renderizado por KaTeX

Se evaluaron KaTeX y MathJax — **KaTeX** es la elección: renderizado
sincrónico (sin flash de texto sin formatear), bundle mucho más chico,
y es el estándar de facto para apps React modernas (mismo criterio de
"la librería más usada para esto en el ecosistema actual" que ya se
sigue en el resto del repo, ver `AGENTS.md`/convenciones de librerías).

**Convención de contenido**: cualquier campo de texto que hoy es texto
plano (`techniques.contenido.pasos[]`, `contenido.quiz[].pregunta`,
`enunciado` de un generador, etc.) puede opcionalmente contener
fragmentos entre `$...$` (inline) — por ejemplo `"Deriva $f(x) = 5x^4$
usando la regla de la potencia."`. Un componente nuevo y único,
`src/components/MathText.tsx`, es el ÚNICO lugar del código que sabe
renderizar esto: parte el string por `$...$`, renderiza esos tramos
con KaTeX (`katex.renderToString`, o `react-katex`'s `<InlineMath>`) y
deja todo lo demás como texto plano tal cual. **Un string sin ningún
`$` se renderiza exactamente igual que hoy, carácter por carácter** —
esto es lo que hace la migración retrocompatible por construcción
(regla #3 arriba): no hace falta tocar las ~150+ preguntas/lecciones
viejas para que sigan funcionando, se pueden ir upgradeando de a una
sin apuro y sin fecha límite.

**Antes de tocar contenido real**: construir `MathText.tsx` aislado,
con su propio test (`MathText.test.tsx` con casos: string sin `$`
→ igual al original; string con un `$...$` → renderiza LaTeX; string
con múltiples fragmentos; `$` sin cerrar → no explota, se muestra como
texto plano). Instalar `katex` (+ `@types/katex` si aplica) y su CSS
(import global una sola vez, en `globals.css` o el layout raíz).
Ningún mundo se toca hasta que este componente esté probado y
funcionando en un lugar de prueba (por ejemplo, una sola técnica de un
solo mundo, a mano, para confirmar que se ve bien de verdad en
claro/oscuro antes de escalar).

## Proceso 1 — Revisión pedagógica de Aprender (por mundo)

Checklist a repetir por cada uno de los 10 mundos. Marcar cada casillero
cuando esté hecho Y verificado (no cuando "parece que sí").

```
### <Nombre del mundo>
- [ ] Leer las ~5 (o más) técnicas actuales completas (contenido.pasos)
- [ ] Verificar cada paso/ejemplo resuelto contra la fórmula REAL usada
      por el generador de ese mundo (src/lib/practica/<mundo>.ts) —
      igual que se hizo a mano para las 7 lecciones Pro de Calculia y
      Circuitia. Si algo está mal, corregir con un migración NUEVA
      (update por slug), nunca editando la vieja.
- [ ] Confirmar que TODAS tienen contenido.quiz (2-3 preguntas, con
      explicacion). Las que no tengan: escribir el quiz y agregarlo
      con una migración nueva (update por slug, o insert si la técnica
      es nueva).
- [ ] Convertir la notación matemática de pasos/quiz a la sintaxis
      $...$ donde corresponda (fracciones, potencias, raíces,
      expresiones compuestas) — un mundo entero de una, no lección por
      lección salteada.
- [ ] Confirmar visualmente (screenshot o navegador real) que se ve
      bien en claro Y oscuro, mobile Y desktop.
- [ ] tsc / eslint / vitest / JSON.parse limpios.
- [ ] Commit propio de este mundo.
```

**Orden sugerido** (de menor a mayor riesgo/tamaño): Geografía (3
técnicas, sin matemática real) → Anatomía → Melodía → Quimia →
Historia → Trigonometría → Numeria (la más grande, ~8 sub-temas) →
Calculia/Circuitia (ya tienen quiz en el curso Pro — solo falta
notación + agregarle quiz a sus 5 técnicas rápidas cada uno) →
Enigmia (aparte: sus lecciones son `logic_techniques`, tabla
distinta, y su contenido es sobre razonamiento lógico, no fórmulas —
revisar si aplica la misma convención de notación o si no hace falta).

## Proceso 2 — Normalización y traducción de generadores (por mundo)

Este proceso es más invasivo porque toca funciones que YA se ejecutan
en producción para generar preguntas infinitas — un error acá no es
"una lección se ve fea", es "una pregunta real le sale mal a alguien
jugando". Por eso tiene su propia checklist, más estricta.

```
### <Nombre del mundo> — generador (src/lib/practica/<mundo>.ts)
- [ ] ANTES de tocar nada: si el mundo no tiene ya un test de
      verificación independiente (como calculia.test.ts/
      circuitia.test.ts), escribirlo primero — N generaciones al azar,
      respuesta comparada contra un método que NO sea la misma fórmula
      del generador. Este test se corre ANTES y DESPUÚES de cada
      cambio de este proceso, siempre.
- [ ] Separar SOLO los strings (enunciado, textos de opciones, nombres
      de distractores) de la lógica de cálculo — sin tocar ningún
      número ni fórmula todavía.
- [ ] Normalizar notación dentro de esos strings a la convención $...$
      (mismo criterio que Proceso 1).
- [ ] Traducir: decidir POR GENERADOR si conviene (a) mover las partes
      fijas del string a messages/es.json + en.json bajo un namespace
      nuevo Generadores.<mundo>.* e interpolar solo los números/
      variables, o (b) mantener un mapa bilingüe adentro del propio
      archivo .ts si el texto es demasiado dinámico para vivir en JSON
      (frases que cambian de estructura según la rama, no solo de
      número). Elegir (a) por default; usar (b) solo si (a) obliga a
      fragmentar una frase de forma que quede mal traducida.
- [ ] El generador pasa a recibir un parámetro de locale (o leerlo del
      contexto next-intl si ya se ejecuta en un componente) y devuelve
      el string en el idioma correcto — nunca hardcodeado a español.
- [ ] Re-correr el test de verificación independiente del primer punto
      — debe seguir pasando exactamente igual (la traducción no puede
      cambiar ni un número).
- [ ] tsc / eslint / vitest / JSON.parse limpios.
- [ ] Commit propio de este mundo, separado del commit de Proceso 1
      aunque sea el mismo mundo el mismo día.
```

**Mismo orden sugerido que el Proceso 1** — tiene sentido hacer los dos
procesos de un mundo en la misma sesión/racha, pero como commits
separados (regla #6).

## Lo que NO entra en este plan (para no perder el alcance)

- Rehacer el catálogo de logros/títulos (`src/lib/titulos/catalogo.ts`)
  — nunca se lee en el cliente, se resuelve en español server-side vía
  RPC, documentado como decisión aparte en el barrido de traducción
  anterior. Fuera de alcance acá.
- Contenido de Historia (trivia fija) más allá de sus lecciones de
  Aprender — ya documentado como contenido curado, no generado.
- Cualquier cambio de layout/UI que no sea el renderizado de fórmulas
  en sí (eso ya se resolvió aparte, ver `PARIDAD_MUNDOS.md` footnote ⁹).

## Siguiente paso concreto

Nada de este documento se ejecutó todavía — es la guía. El primer paso
real, cuando se dé la orden de arrancar, es: instalar `katex`, construir
y probar `MathText.tsx` en aislamiento, y recién después arrancar por
Geografía (el mundo más chico) con el Proceso 1 completo antes de tocar
ningún otro mundo.
