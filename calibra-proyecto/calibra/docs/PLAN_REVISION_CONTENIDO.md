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

## Progreso real (se actualiza a medida que se hace, no es la guía en sí)

- **2026-09-18 — Fundación**: `katex` instalado, `MathText.tsx` +
  `src/lib/texto/mathText.ts` construidos y probados en aislamiento (8
  tests). Nada de contenido real tocado todavía en este paso.
- **2026-09-18 — Geografía, Proceso 1 completo**: las 3 técnicas
  (`dividir-en-subregiones`, `anclar-por-vecinos`, `forma-caracteristica`)
  ya eran pedagógicamente correctas (son estrategias de memoria, no
  datos factuales) — no hicieron falta correcciones. Se les agregó un
  quiz de 3 preguntas cada una (migración `0172`), cada pregunta
  probando específicamente la técnica de esa lección (nunca trivia
  suelta) con datos reales verificados (Argentina al sur de Brasil;
  Italia con forma de bota; Chile como franja angosta — estos dos
  últimos son los mismos ejemplos que ya trae cada lección). Sin
  notación matemática que convertir (Geografía no usa ninguna).
  - **Bug real encontrado y corregido de paso**: `/api/aprender/completar`
    solo validaba el quiz en el servidor cuando `requiere_pro=true` —
    el quiz de una técnica rápida gratuita (como las de Geografía) se
    hubiera mostrado en la UI pero nunca se habría verificado en el
    servidor, un usuario podía pegarle directo al endpoint y saltárselo
    sin ninguna consecuencia. Corregido para que la validación aplique
    a cualquier técnica con `contenido.quiz`, sea Pro o gratuita.
  - **Componente extendido**: `LeccionGeografiaClient.tsx` no tenía
    ninguna fase de quiz (iba directo de los pasos a "marcar como
    aprendida") — se le agregó la misma fase "quiz" que ya tenía
    `LeccionCalculiaClient.tsx`. Este mismo hueco (falta la fase de
    quiz en el componente) muy probablemente existe en los otros 6
    mundos que todavía no pasaron por el Proceso 1 — revisar el
    componente de lección de cada mundo, no asumir que ya soporta quiz.
  - Verificado: `tsc`/`eslint`/`vitest` limpios (186/186), JSON de
    ambos locales válido, los 9 quiz de Geografía validados por script
    (JSON parseable, respuesta dentro de opciones, sin duplicados).

- **2026-09-18 — Anatomía, Proceso 1 completo**: las 5 técnicas
  (huesos del cráneo por zona, nombre del músculo, pares craneales por
  función, simple-a-compuesto, órganos por cavidad) ya eran correctas
  — se verificó cada dato usado en el quiz contra la clasificación
  anatómica estándar. Se les agregó quiz (migración `0173`, 15
  preguntas en total) y, exactamente como se anticipó al cerrar
  Geografía, `LeccionAnatomiaClient.tsx` tampoco tenía fase de quiz —
  se le agregó con el mismo patrón. Sin notación matemática, no aplica
  la conversión `$...$`. `tsc`/`eslint`/`vitest` limpios (186/186), los
  15 quiz validados por script.

- **2026-09-18 — Melodía, Proceso 1 completo**: las 5 técnicas (leer el
  pentagrama por posición, truco mnemotécnico, tríada fundamental-3ra-5ta,
  de tríada a séptima, sostenidos y bemoles) ya eran correctas — se
  verificó cada intervalo en semitonos contra teoría musical estándar
  (3ra mayor=4 semitonos/menor=3; 5ta normal=7/disminuida=6/aumentada=8;
  séptima mayor=11/dominante=10) antes de escribir el quiz (migración
  `0174`, 15 preguntas). `LeccionMelodiaClient.tsx` tampoco tenía fase de
  quiz — mismo patrón agregado. Sin notación LaTeX (los símbolos ♯/♭ ya
  son unicode nativo). `tsc`/`eslint`/`vitest` limpios (186/186).

- **2026-09-18 — Quimia, Proceso 1 completo**: las 4 técnicas (agrupar
  por familia, asociación por color/uso, la tabla como mapa, patrones
  en fórmulas) ya eran correctas — se verificó cada dato químico usado
  en el quiz contra `src/lib/practica/quimia.ts` (banco real de
  elementos/compuestos: Au=Oro, Fe=Hierro, Cu=Cobre; Li/Na/K son
  metales alcalinos, grupo 1; Na período 3 grupo 1, Mg período 3 grupo
  2, vecinos reales) y contra nomenclatura química estándar (oxiácidos
  terminados en "-ico" como sulfúrico H2SO4; hidrácidos con patrón
  "ácido ...hídrico" como clorhídrico HCl; sales binarias con patrón
  "[segundo elemento] de [primer elemento]" como cloruro de sodio).
  **No se encontró ningún error factual** en las 4 lecciones. Se les
  agregó quiz (migración `0175`, 12 preguntas) y, como en los mundos
  anteriores, `LeccionQuimiaClient.tsx` no tenía fase de quiz — se le
  agregó con el mismo patrón. Sin notación LaTeX (las fórmulas cortas
  tipo "H2SO4" ya son legibles como texto plano). `tsc`/`eslint`/
  `vitest` limpios (186/186), los 12 quiz validados por script.

- **2026-09-18 — Historia, Proceso 1 completo**: las 5 técnicas
  (anclaje cronológico, bloques por siglo, asociación memorable, línea
  de tiempo mental, siglas para secuencias) son estrategias de memoria,
  no trivia factual fija — se verificó la única cuenta numérica citada
  (2000 − 1969 = 31 años, el ejemplo de anclaje) y que el modo de
  práctica que menciona la lección de línea de tiempo mental
  ("Cronología") sigue existiendo con ese nombre en `Historia.modos`.
  **No se encontró ningún error** en las 5 lecciones. Se confirmó
  leyendo `src/lib/historia/path.ts` que Historia sigue siendo una
  lista plana (sin agrupar por modo, a diferencia de Anatomía/Quimia) —
  tal como anticipaba el rollout de AprenderLayout. Se le agregó quiz
  (migración `0176`, 15 preguntas) y `LeccionHistoriaClient.tsx`
  tampoco tenía fase de quiz — se le agregó con el mismo patrón. Sin
  notación matemática. `tsc`/`eslint`/`vitest` limpios (186/186), los
  15 quiz validados por script.

- **2026-09-18 — Trigonometría, Proceso 1 completo**: las 5 técnicas
  (SOHCAHTOA, truco de la mano para el círculo unitario, simetría por
  cuadrante, conversión grados-radianes, cuándo usar ley de senos vs.
  cosenos) se verificaron contra las fórmulas reales de
  `src/lib/practica/trigonometria.ts` (tabla de valores notables,
  ASTC, leyes). Se les agregó quiz (migración `0177`, 15 preguntas).
  `LeccionTrigonometriaClient.tsx` tampoco tenía fase de quiz — mismo
  patrón agregado (ahora con `t()` sobre el namespace
  `Trigonometria.leccion` directo en vez de `Trigonometria` +
  `t("leccion.xxx")`, que es como ya llamaba este componente en
  particular). Se agregaron las 7 claves de i18n de quiz
  (`continuarAlQuiz`, `quizTitulo`, etc.) a `Trigonometria.leccion` en
  `es.json`/`en.json`, que no las tenía (a diferencia de Calculia/
  Circuitia, que ya las tenían por el curso Pro).
  - **Bug real encontrado, NO corregido (solo flaggeado, por
    instrucción explícita de esta tarea)**: la lección
    `trigonometria-truco-mano-circulo` describe el método de conteo
    con la dirección invertida — dice "Para el seno de un dedo: contá
    los dedos DESDE ESE HASTA el meñique (incluyéndolo)" y "Para el
    coseno... contá los dedos DESDE EL PULGAR hasta ese
    (incluyéndolo)". Aplicado literalmente al pulgar (0°), el seno
    daría √5/2 ≈ 1.118 — imposible, el seno nunca supera 1. El método
    real (verificado a mano contra los 5 valores notables) es: sen(θ)
    = √(cantidad de dedos entre el pulgar y el dedo, SIN incluir el
    propio dedo)/2, cos(θ) = √(cantidad de dedos entre el dedo y el
    meñique, SIN incluirlo)/2 — la dirección de conteo está al revés
    en el texto, y además dice "incluyéndolo" cuando debería excluir
    el propio dedo. El ejemplo final que ya trae la lección (anular
    60°: sen=√3/2, cos=1/2) sí es matemáticamente correcto — solo la
    explicación general del método está mal redactada. El quiz nuevo
    de esta lección evita reproducir la regla rota: prueba los valores
    finales correctos (sen(90°)=1, cos(0°)=1, sen(60°)>cos(60°)) sin
    pedir aplicar el método de conteo tal como está descrito. Requiere
    una migración de corrección aparte, fuera del alcance de esta
    tarea (que era solo agregar quiz).
  - `tsc`/`eslint`/`vitest` limpios (186/186, mismo baseline).

- **2026-09-18 — Calculia y Circuitia: quiz para las técnicas rápidas
  gratuitas**: las 5 técnicas rápidas de cada mundo (`requiere_pro=false`,
  de `0165_mundo_calculia.sql`/`0167_mundo_circuitia.sql` — distintas de
  las 7 lecciones del Curso Pro de `0170`/`0171`, que ya tenían quiz) se
  verificaron contra los generadores reales
  (`src/lib/practica/calculia.ts`, `src/lib/practica/circuitia.ts` y el
  kernel `src/lib/circuitos/resolver.ts` para las de Circuitia) — no se
  encontró ningún error. Se les agregó quiz de reconocimiento/
  clasificación (2-3 preguntas cada una, más corto que el del Curso Pro
  porque estas técnicas son atajos de patrón, no lecciones completas):
  migraciones `0178` (Calculia, 15 preguntas) y `0179` (Circuitia, 15
  preguntas). Ninguno de los dos mundos necesitó agregar la fase de quiz
  al componente de lección (`LeccionCalculiaClient.tsx`/
  `LeccionCircuitiaClient.tsx` ya la soportaban, por las lecciones Pro) ni
  al tipo de `contenido` en `calculia/path.ts`/`circuitia/path.ts` (ya
  incluía `quiz?: TechniqueQuizPregunta[]`, verificado, no re-agregado).
  `tsc`/`eslint`/`vitest` limpios (186/186, mismo baseline).

- **2026-09-18 — Corrección real de Trigonometría + diagrama interactivo**:
  se rehizo `pasos` de `trigonometria-truco-mano-circulo` (migración
  `0180`, `jsonb_set` sobre la fila existente, `quiz` de `0177` queda
  intacto) con la fórmula correcta verificada de nuevo en código
  independiente del texto (sen(dedo_k)=√k/2, cos(dedo_k)=√(4-k)/2 con
  k=0..4 para pulgar..meñique — coincide con los 5 valores notables
  reales). Además, pedido explícito del usuario, se construyó
  `src/components/trigonometria/ManoCirculoSVG.tsx`: una mano
  interactiva donde tocar un dedo colorea en vivo cuáles cuentan para
  el seno (azul) y cuáles para el coseno (naranja), con los valores
  calculados en código (nunca hardcodeados por dedo) — reemplaza la
  necesidad de memorizar la dirección de conteo, ahora se ve. Wireada
  solo en esa lección puntual de `LeccionTrigonometriaClient.tsx`.

- **2026-09-18 — MathText conectado de verdad, primera conversión real
  a `$...$`**: hasta este punto `MathText.tsx` estaba construido y
  probado, pero NINGÚN contenido real lo usaba — por eso no se notaba
  ningún cambio visual pese a tener KaTeX instalado. Se conectó
  `<MathText texto={...} />` en el render de `pasos` y de cada
  pregunta/opción de quiz en los 10 componentes `Leccion*Client.tsx`
  (mecánico, retrocompatible — un texto sin `$` se ve exactamente
  igual que antes). Se convirtieron además las 5 técnicas rápidas de
  Calculia (migración `0181`) a la notación `$...$` real (ej. `x⁴` →
  `$x^4$`, `∫xⁿ dx = xⁿ⁺¹/(n+1) + C` → `$\int x^n\,dx =
  \dfrac{x^{n+1}}{n+1} + C$`) — cada fragmento LaTeX se renderizó de
  verdad contra KaTeX (`throwOnError:true`) antes de guardarlo, 24
  fragmentos validados sin error. Circuitia y el resto de Trigonometría
  quedan con la misma conversión pendiente — ya con la plomería lista,
  solo falta escribir el contenido mundo por mundo.

- **2026-09-18 — Numeria, Proceso 1 completo (el mundo más grande hasta
  ahora)**: a diferencia de todos los mundos anteriores, Numeria no
  tiene sus técnicas en una sola migración — están repartidas en 8
  migraciones distintas (`0005`, `0007`, `0018`, `0019`, `0026`,
  `0032`, `0079`, `0101`), sembradas a lo largo de toda la historia del
  proyecto. Se hizo el inventario completo de las 39 técnicas reales
  (9 sub-temas: suma 6, resta 4, multiplicación 8, división 4 —
  incluidas las 8 técnicas "avanzadas" de números grandes de `0101` —,
  fracciones 4, decimales 3, potencias 3, álgebra 3, geometría 4) y se
  verificó cada dato numérico citado contra el ejemplo real de su
  propia lección y contra los generadores reales de `/practica`
  (`src/lib/practica/{algebra,decimales,fracciones,potencias,
  geometria}.ts` para los sub-temas avanzados; `problems.ts` para
  aritmética básica). **No se encontró ningún error factual en ninguna
  de las 39 técnicas** — a diferencia de Trigonometría, este mundo
  estaba limpio.
  - Se agregó quiz a las 39 técnicas (2-3 preguntas cada una, 106 en
    total) en 3 migraciones agrupadas por sub-tema: `0182`
    (aritmética básica, 58 preguntas), `0183` (fracciones/decimales/
    potencias, 27 preguntas), `0184` (álgebra/geometría, 21
    preguntas) — separadas de la migración de notación, siguiendo la
    regla del plan de no mezclar una migración pura de notación con
    contenido nuevo.
  - `LeccionClient.tsx` (el componente de Numeria, distinto de los
    demás porque ya tenía una fase `"practica"` propia con problemas
    numéricos generados por `generarProblemaTecnica()`) no tenía fase
    de quiz — se le agregó con el mismo patrón que el resto de los
    mundos (`Fase` gana `"quiz"`, estado de respuestas/envío/resultado,
    `completarLeccion` acepta `respuestasEnviadas` opcional). Se decidió
    que el quiz, cuando existe, REEMPLAZA a la práctica numérica como
    paso final (en vez de sumarse a ella): las lecciones que menos
    calzaban en el motor de "a symbol b = ?" (las 4 de Geometría y las
    8 "avanzadas" de números grandes, que no tienen entrada en
    `generarProblemaTecnica()` y antes de este cambio caían al `default`
    silencioso de esa función — una suma de nivel 1 sin relación
    ninguna con la lección, bug preexistente que quedó neutralizado de
    hecho al darles quiz en vez de práctica numérica genérica) son
    justo las que más se benefician de un chequeo de comprensión real.
    Se agregaron las 7 claves de i18n de quiz a `Aprender.leccion` en
    `es.json`/`en.json` (no las tenía, a diferencia de Geografía/
    Calculia/Circuitia).
  - `src/lib/aprender/path.ts`: mismo cambio de tipo que en los demás
    mundos, `contenido: { pasos: string[] }` → `{ pasos: string[]; quiz?:
    TechniqueQuizPregunta[] }`.
  - Notación: Numeria es, con diferencia, el mundo con más matemática
    real de los revisados hasta ahora (fracciones, exponentes, raíces,
    ecuaciones, π). Migración `0185` convierte a `$...$` los `pasos`
    viejos de las 13 técnicas que tenían notación matemática real
    (`cuadrado-terminado-en-5`; las 4 de Fracciones;
    `convertir-fraccion-decimal`; las 3 de Potencias; las 3 de Álgebra;
    `geometria-pi-fraccion`) — el resto de aritmética básica es
    puramente textual/numérica sin exponentes, raíces ni fracciones, así
    que no necesitaba conversión. `porcentaje-como-decimal` se dejó
    deliberadamente sin convertir: su único símbolo matemático es "%",
    que dentro de `$...$` es el carácter de comentario de LaTeX (haría
    falta escaparlo como `\%` sin ganar legibilidad real). El contenido
    NUEVO de los quiz de `0183`/`0184` ya se escribió directamente con
    `$...$` desde el principio (no es una conversión de contenido
    viejo, así que no hacía falta una migración separada para eso).
  - Verificación: 106 preguntas de quiz validadas (cada `respuesta`
    presente en sus propias `opciones`, sin duplicados, `explicacion`
    no vacía) y 93 fragmentos LaTeX (`pasos` + quiz nuevo) renderizados
    de verdad contra KaTeX (`throwOnError:true`) sin ningún error, con
    un script temporal (`scripts/_verify_latex.js`, borrado después de
    usarlo, mismo criterio que en `0181`). `tsc`/`eslint`/`vitest`
    limpios (186/186, mismo baseline que al empezar).

## Siguiente paso concreto

Enigmia es el último mundo pendiente del Proceso 1 (Geografía,
Anatomía, Melodía, Quimia, Historia, Trigonometría, Calculia/Circuitia
—técnicas rápidas— y Numeria ya están). A diferencia de los otros 9
mundos, Enigmia usa su propia tabla `logic_techniques` en vez de
`techniques` — antes de aplicar el mismo procedimiento (revisar si su
componente de lección tiene fase de quiz, agregar quiz verificando cada
técnica contra el generador real de acertijos, convertir notación si
corresponde) hace falta investigar el shape real de esa tabla y su
componente de lección propios, que ningún mundo anterior comparte.

Para la notación (ya con MathText conectado): sigue pendiente convertir
a `$...$` las 5 técnicas rápidas de Circuitia y las 4 lecciones
restantes de Trigonometría (ya arreglada la de la mano), y — más
grande — todo el Proceso 2 (generadores de preguntas de los 10 mundos,
ver checklist más arriba), que todavía no arrancó.
