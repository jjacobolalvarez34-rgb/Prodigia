# Plan: Prodigia completa en inglés, sin que se escape nada

Pedido del 2026-10-09: «la traducción completa, así sea planeada para que nada se escape,
incluyendo lecciones, clases, preguntas y todo eso».

Este plan parte de un **inventario medido con scripts**, no a ojo. Cada fase termina con
una prueba automática que falla si algo queda en español, así lo traducido no se
deshace después.

---

## 1. Inventario (al 2026-10-09)

| Parte | Tamaño | Estado |
|---|---|---|
| Textos de la web (`messages/es.json` ↔ `en.json`) | 3706 claves | **Completo.** 0 claves faltantes y 0 textos en español sin traducir. |
| Textos escritos directo en componentes de la web (sin `t()`) | ~14 textos en 12 archivos | Pendiente |
| Lecciones: 13 mundos (Numeria base, Enigmia, Geografía, Quimia, Anatomía, Melodía 0213, Trigonometría, Historia, Calculia base, Circuitia, Estadística, Naipia, Codia) | 432 lecciones | **Hecho** (0226–0242) |
| Lecciones de **Dinamia** (46) y **Vitalia** (60) | 106 lecciones | **Hecho el 2026-10-09** (0268, 0269) |
| Lecciones que se habían quedado afuera: ampliación de Melodía (10), lenguajes de Codia (17), curso de Numeria (36), curso de Calculia (28) y una suelta de Trigonometría (1) | 92 lecciones | **Hecho el 2026-10-09** (0270–0274) |
| **Preguntas** (generadores de `lib/practica` y bancos de cada mundo) | 49 archivos, ~1360 textos; más Historia ~540, Quimia ~440, Codia ~150 y los bancos de Geografía y Enigmia | **Todo en español, también en la web** |
| Bancos de preguntas en la base (`logic_puzzles` de Enigmia, acertijos de la Trastienda) | cientos de filas | Pendiente |
| Contenido de la base que se ve: anuncios, logros, títulos, nombres de cosméticos, misiones de clan | 6 tablas | Pendiente (no tienen columnas `_en`) |
| Avisos push y correos (confirmar cuenta, recuperar contraseña) | ~30 textos y 2 plantillas | Pendiente |
| **App**: no tiene sistema de idiomas | ~1050 textos en 114 archivos (pantallas 578, componentes 320, lógica 140) | Pendiente |

---

## 2. Decisiones previas (te tocan a ti)

1. **Inglés de EE. UU.** (*color*, *practice*) o británico. Recomiendo EE. UU.
2. **Notas musicales en inglés**: C D E F G A B en vez de Do Re Mi. Recomiendo letras,
   que es lo que usa cualquier curso de música en inglés.
3. **Separador decimal según el idioma**: 3,6 en español y 3.6 en inglés. Al responder se
   aceptan los dos siempre.
4. **Idioma de la app**: el del teléfono, con un selector en Ajustes para cambiarlo.

---

## 3. Fases

### Fase 1: lecciones y clases — HECHA (2026-10-09)

- Las **630 lecciones** que crean las migraciones tienen inglés: 0226–0242, 0268–0274.
- Prueba nueva en `src/lib/i18n-lecciones/traducciones.test.ts`: lee **todas** las
  migraciones y falla si una lección insertada en `techniques` o `logic_techniques` no
  tiene su `nombre_en`. Con ella aparecieron 18 que no estaban en ninguna lista (Codia
  lenguajes y la suelta de Trigonometría).
- Pendiente menor: dentro de las fórmulas `$…$` queda la coma decimal del español
  (`$3{,}6$`), porque el validador exige fórmulas idénticas. Se resuelve en la Fase 2 con
  un formateo por idioma al mostrar la lección.

### Fase 2: las preguntas (lo más grande)

Hoy cada generador arma el enunciado en español: `` `¿Cuál de estas opciones es ${x}?` ``.

1. Cada generador recibe el idioma: `generar(modo, nivel, usados, rng, idioma)`. El
   **azar no depende del idioma**: con la misma semilla, los dos jugadores de un duelo
   ven la misma pregunta, con las opciones en el mismo orden, cada uno en su idioma.
2. Los textos de cada mundo pasan a un diccionario `textos.ts` con `{ es, en }` por
   plantilla. Los datos (países, huesos, elementos, personajes, notas) llevan su nombre
   en los dos idiomas.
3. Números con el separador de cada idioma (la función `f()` de Dinamia, `formatoMiles`,
   etc. reciben el idioma).
4. Respuestas escritas a mano (Geografía, Quimia): se aceptan los nombres en los dos
   idiomas.
5. Orden por mundo, de menos a más texto: Numeria → Trigonometría → Calculia → Circuitia
   → Estadística → Dinamia → Naipia → Codia → Anatomía → Vitalia → Melodía → Enigmia →
   Quimia → Geografía → Historia.
6. **Prueba que impide que se escape algo:** para cada mundo, modo y nivel, generar 300
   preguntas en inglés y fallar si aparece una palabra que solo existe en español (la
   misma lista que ya usa la prueba de lecciones: «los, las, del, para, una, con, por,
   que…») o un acento español. Además: la respuesta está entre las opciones y es la
   misma posición en los dos idiomas.
7. Bancos de la base (`logic_puzzles`, acertijos): columnas `contenido_en` y una
   migración generada con el mismo validador que las lecciones.

### Fase 3: contenido de la base, avisos y correos

- Columnas `_en` en `anuncios`, `achievements`, títulos, `catalogo_cosmeticos` y misiones
  de clan, con migración y prueba de que ninguna fila nueva sale sin inglés (la prueba lee
  las migraciones de contenido).
- Avisos push: guardar el idioma en `device_push_tokens` y armar el texto en ese idioma.
- Correos de Supabase: segunda plantilla en inglés, elegida por el idioma del perfil.

### Fase 4: la app

1. Sistema de idiomas: la app ya lee `messages/es.json` de la web (`lib/textosWeb.ts`).
   Se generaliza a `t(clave)` con `es.json` o `en.json` según el idioma, para que web y
   app compartan un solo lugar de textos.
2. Los textos propios de la app van a un espacio `App` dentro de los mismos
   `messages/*.json`.
3. Pantalla por pantalla, los ~1050 textos pasan a `t()` (Inicio, Mundos, Competir,
   Social, Perfil, sprint, resultado, recompensas, tienda, ajustes…).
4. Fechas y números con el idioma (`toLocaleString("es")` está escrito fijo en varios
   lugares).
5. **Prueba que impide que se escape algo:** `npm run paridad` suma una regla que falla
   si una pantalla tiene texto con letras escrito directo en el JSX, fuera de `t()`, y
   que cada clave usada existe en `es.json` y en `en.json`.

### Fase 5: revisión final

- Recorrido completo en inglés, web y app, con capturas de cada pantalla.
- Ficha de Play Store en inglés (descripción y capturas).
- Imágenes con texto en español (si las hay en `public/` o `assets/`): versión en inglés.

---

## 4. Pruebas que quedan para siempre

| Prueba | Qué impide |
|---|---|
| `es.json` y `en.json` con las mismas claves y sin textos en español en `en.json` | Botones o títulos sin traducir en la web |
| Todas las lecciones de las migraciones tienen inglés (**ya existe**) | Lecciones nuevas que salen solo en español (lo que pasó con 0147, 0251, 0253, 0254 y 0255) |
| Generadores en inglés sin palabras en español | Preguntas a medio traducir |
| Filas de contenido nuevo con su `_en` | Anuncios, logros o cosméticos solo en español |
| Paridad de la app: nada de texto fijo en el JSX | Pantallas de la app sin traducir |

Con estas cinco pruebas en `npm test` y `npm run paridad`, cualquier cosa nueva que se
agregue solo en español hace fallar la verificación.
