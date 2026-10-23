# Auditoría de la base de preguntas (15 mundos)

Origen: reporte del usuario del 2026-10-23. En Numeria, «Decimales · Convertir» le salió unas 30 veces
con la misma pregunta y la dificultad no se notaba. La causa era el generador: en nivel 1-2 solo podía
producir **una** pregunta («Convierte 1/2 a decimal»). Ver `docs/avance/NUMERIA_PREGUNTAS.md`.
Numeria ya está arreglada y vigilada por un test. Este documento es el plan para revisar el resto de
los mundos con el mismo criterio, y trae la primera medición.

## 1. Qué se revisa en cada generador

| Aspecto | Pregunta | Cómo se mide |
|---|---|---|
| Variedad por nivel | ¿Cuántas preguntas distintas puede dar cada nivel? | N = 200 preguntas por nivel, cada una con su propia semilla; se cuentan las distintas. |
| Repetición en partida | ¿Se repite dentro de una partida de 10? | `repetidasPorPartida` (sin deduplicador). Con el deduplicador (`generarSinRepetir`, 20 intentos) solo se repite si el espacio es más chico que la partida. |
| Dificultad real | ¿Subir de nivel cambia lo que se pregunta? | **Solapamiento 1↔10**: qué parte de lo que sale en nivel 10 ya salía en nivel 1. **Meseta**: con la misma semilla, qué parte sale idéntica entre bandas consecutivas (1→3, 3→5, 5→7, 7→9). Una meseta del 100 % significa que el generador ignora el nivel en ese tramo. |
| Respuestas correctas | ¿La respuesta guardada es la correcta? | Test que recalcula la respuesta **desde el enunciado** (lo que ve el jugador), como `decimales.test.ts`, `estadistica.test.ts`, `calculia.test.ts` y `trigonometria.test.ts`. Un enunciado que no encaje con ninguna forma conocida también falla. |
| Enunciados claros | ¿Se entiende qué se pide y cómo responder? | Redondeos declarados en el enunciado («redondea a 2 decimales»); fracciones simplificadas; sin datos imposibles (p. ej. triángulos que no cierran); respuestas que se pueden escribir con el teclado de cada plataforma (en la app, Numeria tiene tecla «,» solo en Decimales y «−» en el resto). Revisión a mano de una muestra de 20 por modo y nivel bajo/medio/alto. |
| Render | ¿Las fórmulas se dibujan bien en web y app? | `mathRender.test.ts` (KaTeX) para la web; en la app, `textoConFormulas` (`mobile/src/ui/TextoMate.tsx`). |

### Umbrales propuestos (los que ya usa Numeria)

- Al menos **30 preguntas distintas por nivel** (de 200). Excepción documentada solo cuando el espacio
  es chico por naturaleza en los niveles básicos (en Numeria: potencias 16 y raíces 14 en nivel 1-2).
- **Solapamiento 1↔10 ≤ 50 %**.
- **Meseta < 50 %** entre bandas consecutivas.
- Los bancos fijos (preguntas escritas a mano: Historia, Anatomía, Vitalia, Geografía…) no pueden
  «generar» más: ahí el remedio es agregar preguntas al banco o mezclar plantillas, y el umbral se
  mide sobre el banco disponible para ese nivel.

## 2. Herramientas (ya en el repo)

- `src/lib/practica/variedad.ts`: `conSemilla`, `medirVariedad` (distintas por nivel, solapamiento,
  meseta), `repetidasPorPartida`, `filaTabla`/`encabezadoTabla`.
- `src/lib/practica/variedadNumeria.test.ts`: Numeria, **con umbrales** (falla si alguien vuelve a
  achicar un generador). Tabla: `AUDITAR_VARIEDAD=1 npx vitest run src/lib/practica/variedadNumeria --silent=false --reporter=verbose`.
- `src/lib/practica/variedadMundos.test.ts`: los 13 adaptadores compartidos
  (`src/lib/mundosJugables`, todos sus modos y filtros) y Geografía (mapa). **Solo reporta**, sin
  umbrales. Misma forma de correrlo con `AUDITAR_VARIEDAD=1`. Tarda ~1-2 min.
- Cuando un mundo quede arreglado, se le agregan sus umbrales (igual que Numeria) para que el test lo
  vigile.

## 3. Cómo hacer la auditoría de cada mundo (orden de trabajo)

1. Correr la tabla y marcar los modos con **Mín < 30**, **solapamiento > 50 %** o **meseta ≥ 50 %**.
2. Leer el generador del modo y encontrar la causa (rango fijo, tabla por banda con un solo valor,
   banco chico, `Math.min(nivel, 7)`, etc.). Anotarla.
3. Arreglar: más plantillas por banda, rangos que crecen con el nivel, formas propias de los niveles
   altos (sin perder las firmas públicas: los usan web, app, duelos y Modo Zen).
4. Test de corrección desde el enunciado (si el mundo no lo tiene).
5. Revisión a mano de una muestra de enunciados (claridad, redondeos, teclado de la app).
6. Agregar los umbrales del mundo al test de variedad.
7. `npx tsc --noEmit -p .`, `npx eslint`, `npx vitest run src/lib/practica`; en `mobile`,
   `npx tsc --noEmit -p .`.

## 4. Numeria (hecho el 2026-10-23)

Antes (HEAD) → después. «Mín» es el peor nivel; meseta como se define arriba.

| Modo | Mín antes | Mín después | Meseta antes | Meseta después | Qué se hizo |
|---|---:|---:|---:|---:|---|
| decimales · convertir | **1** | 41 | 0 % | 7 % | Reescrito: fracción↔decimal↔porcentaje por banda; decimal→fracción; periódicos (redondeo declarado y a fracción) en 7-10. |
| decimales · porcentaje | **20** (igual en los 10 niveles) | 140 | 0 % | 29 % | Bases variables, aumentos/descuentos, «¿qué porcentaje es?», inverso, cambios sucesivos; sin redondeos ocultos. |
| decimales · redondear | 198 | 191 | 7 % | 0 % | Aritmética entera (antes 12,105 a 2 decimales daba 12,1), coma decimal, acarreos, decenas/centenas/millares. |
| aritmética · multiplicación | 16 | 32 | 7 % | 9 % | Banda 0: 2..9 × 2..5. |
| aritmética · división | 16 | 32 | 6 % | 15 % | Igual (usa las mismas tablas). |
| geometría · perímetro | 73 | 106 | **100 %** (N7→N9) | 2 % | Formas por banda: polígonos, inversos, figura en L, circunferencia en k·π; triángulos válidos. |
| geometría · área | 87 | 87 | **100 %** (N7→N9) | 2 % | Trapecio, rombo, círculo en k·π o con π ≈ 3,14 redondeado al entero (antes pedía decimales y la app no tiene coma en Geometría), inversos. |
| geometría · ángulos | 46 | 52 | **100 %** (N1→N3) | 39 % | Tercer ángulo, isósceles, exterior, alrededor de un punto, polígonos regulares. |
| geometría · ternas | **6** | 40 | 59 % | 29 % | 6 ternas base, factores por banda, catetos en ambos órdenes, «cateto faltante» desde nivel 1. |
| fracciones · simplificar | **10** | 40 | 28 % | 16 % | Denominadores y factores más amplios; mínimo de denominador sube con el nivel. |
| fracciones · comparar | 23 | 75 | 7 % | 3 % | Ídem. |
| fracciones · sumar | 24 | 77 | 11 % | 5 % | Ídem. |
| potencias · potencia | **6** | 16 | 24 % | 12 % | Base mínima por banda (las altas ya no piden 2²), exponentes hasta 10. |
| potencias · raíz | **4** | 14 | 26 % | 9 % | Raíces cúbicas, cuartas, quintas y «redondas» (√3600). |
| potencias · notación | 36 (igual en los 10 niveles) | 35 | 0 % | 16 % | Más cifras significativas, números chicos (exponente negativo), productos y cocientes. |
| aritmética · suma / resta | 74 / 44 | igual | 0 % | 0 % | Sin cambios (ya cumplían). |
| álgebra (3 modos) | ≥ 98 | igual | ≤ 13 % | igual | Sin cambios (ya cumplían). |

Distintas por nivel, después (N1 … N10):

| Modo | N1 | N2 | N3 | N4 | N5 | N6 | N7 | N8 | N9 | N10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| decimales · convertir | 41 | 43 | 136 | 133 | 160 | 154 | 96 | 101 | 138 | 144 |
| decimales · porcentaje | 140 | 153 | 158 | 162 | 192 | 180 | 187 | 183 | 175 | 189 |
| geometría · ternas | 40 | 40 | 68 | 68 | 94 | 87 | 128 | 124 | 139 | 129 |
| fracciones · simplificar | 40 | 42 | 81 | 75 | 107 | 95 | 140 | 140 | 166 | 163 |
| potencias · potencia | 16 | 16 | 22 | 22 | 29 | 29 | 38 | 37 | 43 | 42 |
| potencias · raíz | 14 | 14 | 16 | 16 | 27 | 27 | 34 | 34 | 42 | 42 |

Correctitud: `decimales.test.ts` recalcula la respuesta de cada forma de enunciado (2 000 preguntas por
tipo); el resto de Numeria ya tenía pruebas de rango/pasos (`problems.test.ts`, `repaso.test.ts`,
`potencias.test.ts`, `mathRender.test.ts`). **Pendiente**: un test equivalente de «recalcular desde el
enunciado» para geometría, fracciones y álgebra.

## 5. Primera medición de los demás mundos (2026-10-23, sin arreglar)

`variedadMundos.test.ts`, N = 200 por nivel. Enigmia se midió sin el banco de la base (deducción
cae a patrones generados), así que su fila de «deducción» no representa el banco real. Geografía se
midió solo en el modo mapa (las preguntas avanzadas de opciones son un banco aparte).

| Modo | N1 | N2 | N3 | N4 | N5 | N6 | N7 | N8 | N9 | N10 | Mín | Solap. 1↔10 | Meseta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| enigmia · mezcla | 180 | 192 | 194 | 200 | 199 | 198 | 174 | 175 | 193 | 192 | 174 | 0 % | 1 % |
| enigmia · memoria | 199 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 199 | 0 % | 0 % |
| enigmia · patrones | 154 | 178 | 163 | 200 | 199 | 197 | 116 | 116 | 165 | 164 | 116 | 0 % | 1 % |
| enigmia · deduccion (sin banco) | 153 | 164 | 172 | 199 | 199 | 200 | 113 | 112 | 162 | 167 | 112 | 0 % | 0 % |
| enigmia · computacional | 197 | 200 | 200 | 200 | 200 | 199 | 200 | 200 | 199 | 198 | 197 | 0 % | 0 % |
| quimia · simbolos | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 0 % | 3 % |
| quimia · formulas | 172 | 182 | 178 | 182 | 181 | 182 | 184 | 170 | 172 | 169 | 169 | 0 % | 28 % |
| quimia · tabla | 200 | 200 | 200 | 194 | 195 | 194 | 197 | 199 | 195 | 197 | 194 | 0 % | 3 % |
| quimia · nomenclatura | 199 | 199 | 198 | 200 | 200 | 198 | 199 | 197 | 199 | 199 | 197 | 0 % | 17 % |
| quimia · organica | 198 | 199 | 198 | 198 | 196 | 198 | 196 | 199 | 199 | 191 | 191 | 0 % | **52 %** (N3→N5) |
| anatomia · oseo | 200 | 197 | **30** | **23** | **27** | **27** | 142 | 123 | 137 | 128 | **23** | 0 % | **100 %** (N7→N9) |
| anatomia · muscular | 193 | 196 | 189 | 184 | 161 | 166 | 166 | 144 | 158 | 151 | 144 | 0 % | **100 %** (N7→N9) |
| anatomia · organos | 141 | 149 | 150 | 159 | 172 | 165 | 165 | 157 | 158 | 175 | 141 | 6 % | **100 %** (N7→N9) |
| anatomia · nervioso | 103 | 111 | 82 | 72 | 94 | 84 | 162 | 159 | 152 | 143 | 72 | 0 % | **100 %** (N7→N9) |
| melodia · fundamentos | **14** | **14** | **23** | **23** | 129 | 121 | 176 | 177 | 180 | 187 | **14** | 1 % | 12 % |
| melodia · lectura | 58 | 59 | 146 | 146 | 171 | 174 | 190 | 194 | 196 | 194 | 58 | 2 % | 0 % |
| melodia · alteraciones | 159 | 148 | 143 | 144 | **28** | **28** | **28** | **28** | **28** | **28** | **28** | 11 % | 2 % |
| melodia · escalas | 40 | 43 | 44 | 42 | 87 | 77 | 84 | 81 | 77 | 84 | 40 | 44 % | 5 % |
| melodia · acordes | 198 | 191 | 196 | 193 | 194 | 78 | 85 | 81 | 170 | 164 | 78 | 0 % | 0 % |
| melodia · oido_absoluto | **4** | **4** | **20** | **20** | 102 | 104 | 115 | 123 | 191 | 192 | **4** | 0 % | 0 % |
| melodia · tempo | 48 | 49 | 45 | 45 | 52 | 54 | 56 | 59 | 54 | 55 | 45 | 29 % | 2 % |
| trigonometria · razones | **8** | 68 | 95 | 167 | 150 | 154 | 173 | 178 | 192 | 191 | **8** | 0 % | 0 % |
| trigonometria · circulo | 55 | 87 | 97 | 94 | 133 | 152 | 136 | 163 | 184 | 177 | 55 | 0 % | 7 % |
| trigonometria · identidades | 38 | 123 | 111 | 73 | 89 | 87 | 84 | 47 | **27** | **19** | **19** | 0 % | 0 % |
| trigonometria · leyes | 102 | 200 | 186 | 200 | 200 | 199 | 200 | 200 | 200 | 200 | 102 | 0 % | 0 % |
| historia · cronologia | 197 | 200 | 200 | 196 | 196 | 198 | 190 | 178 | 173 | 165 | 165 | 0 % | 0 % |
| historia · personajes | 200 | 200 | 200 | 200 | 200 | 196 | 199 | 198 | 182 | 175 | 175 | 0 % | 0 % |
| historia · causaefecto | 194 | 185 | 198 | 196 | 182 | 173 | 188 | 187 | 195 | 152 | 152 | 0 % | 0 % |
| historia · fechas | **29** | 106 | 136 | 156 | 147 | 189 | 187 | 193 | 199 | 199 | **29** | 0 % | 0 % |
| calculia · derivadas | **24** | 149 | 175 | 182 | 178 | 176 | 169 | 176 | 176 | 179 | **24** | 11 % | 1 % |
| calculia · integrales | 42 | 42 | 39 | 52 | 100 | 88 | 98 | 98 | 95 | 95 | 39 | 25 % | 8 % |
| calculia · series | 100 | 99 | 104 | 103 | 94 | 110 | 92 | 135 | 117 | 126 | 92 | 33 % | 5 % |
| calculia · multivariable | 195 | 193 | 192 | 198 | 195 | 195 | 191 | 200 | 138 | 146 | 138 | 0 % | 0 % |
| circuitia · serie | 194 | 199 | 195 | 195 | 195 | 200 | 200 | 200 | 200 | 200 | 194 | 0 % | 0 % |
| circuitia · paralelo | 193 | 195 | 197 | 193 | 193 | 200 | 198 | 200 | 199 | 200 | 193 | 0 % | 0 % |
| circuitia · mixto | 200 | 200 | 200 | 200 | 200 | 199 | 200 | 200 | 200 | 200 | 199 | 0 % | 0 % |
| circuitia · cualitativo | 198 | 198 | 198 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 198 | 0 % | 0 % |
| estadistica · central | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 0 % | 0 % |
| estadistica · dispersion | 198 | 200 | 200 | 200 | 199 | 200 | 199 | 200 | 200 | 199 | 198 | 0 % | 0 % |
| estadistica · probabilidad | 139 | 148 | 151 | 146 | 185 | 169 | 170 | 162 | 170 | 164 | 139 | 5 % | 1 % |
| estadistica · datos | 200 | 199 | 200 | 199 | 200 | 200 | 200 | 200 | 200 | 200 | 199 | 0 % | 0 % |
| estadistica · graficos | 200 | 200 | 200 | 200 | 199 | 200 | 200 | 194 | 199 | 199 | 194 | 0 % | 0 % |
| naipia · hilo / ko / hiopt2 / omega2 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 0 % | 0 % |
| naipia · verdadero | 184 | 178 | 183 | 179 | 189 | 187 | 183 | 185 | 187 | 194 | 178 | 5 % | 1 % |
| codia · sintaxis (todos) | 55 | 79 | 106 | 115 | 107 | 104 | 105 | 105 | 100 | 114 | 55 | 30 % | 3 % |
| codia · sintaxis (python) | **14** | **28** | 40 | 40 | 40 | 40 | 41 | 40 | 41 | 39 | **14** | 31 % | 6 % |
| codia · sintaxis (java) | **14** | **28** | 40 | 41 | 39 | 41 | 40 | 40 | 41 | 41 | **14** | 32 % | 5 % |
| codia · sintaxis (javascript) | **14** | **28** | 42 | 40 | 42 | 42 | 39 | 40 | 41 | 41 | **14** | 34 % | 6 % |
| codia · sintaxis (typescript) | **14** | **28** | 42 | 42 | 40 | 40 | 41 | 38 | 40 | 38 | **14** | 37 % | 8 % |
| codia · salida (cada lenguaje) | ≥ 197 | | | | | | | | | | ≥ 189 | ≤ 1 % | 0 % |
| codia · error (cada lenguaje) | ≥ 200 | | | | | | | | | | ≥ 182 | ≤ 1 % | 0 % |
| codia · estructuras (cada lenguaje) | 200 | | | | | | | | 119-149 | 132-158 | ≥ 119 | 0 % | 0 % |
| dinamia · cinematica | 112 | 121 | 164 | 173 | 188 | 173 | 146 | 129 | 152 | 159 | 112 | 9 % | 1 % |
| dinamia · vectores | 102 | 95 | 151 | 155 | 135 | 136 | 137 | 122 | 182 | 166 | 95 | 8 % | 2 % |
| dinamia · newton | 94 | 97 | 167 | 178 | 123 | 135 | 121 | 149 | 162 | 164 | 94 | 4 % | 2 % |
| dinamia · energia | 110 | 137 | 180 | 183 | 146 | 120 | 175 | 166 | 178 | 174 | 110 | 13 % | 0 % |
| dinamia · termo | 135 | 104 | 117 | 156 | 129 | 125 | 161 | 161 | 172 | 160 | 104 | 8 % | 2 % |
| dinamia · fluidos | 56 | 57 | 124 | 122 | 154 | 144 | 117 | 114 | 113 | 116 | 56 | 13 % | 0 % |
| vitalia · celula | **7** | **7** | 162 | 157 | 113 | 125 | 108 | 96 | 105 | 121 | **7** | 6 % | 4 % |
| vitalia · procesos | **6** | **6** | **29** | **29** | 30 | 81 | 90 | 71 | 80 | 90 | **6** | 7 % | 4 % |
| vitalia · genetica | **6** | **6** | 139 | 164 | 176 | 170 | 106 | 103 | 130 | 124 | **6** | 5 % | 2 % |
| vitalia · sistemas | 109 | 107 | 60 | 66 | 59 | 65 | 81 | 90 | 67 | 69 | 59 | 20 % | 4 % |
| vitalia · reinos | 63 | 63 | 60 | 68 | 100 | 104 | 92 | 90 | 119 | 98 | 60 | 12 % | 2 % |
| vitalia · ecologia | 62 | 61 | 62 | 64 | 61 | 70 | 71 | 67 | 70 | 72 | 61 | 46 % | 2 % |
| geografia · america (mapa) | **12** | **15** | **18** | **20** | **19** | **19** | **20** | **16** | **13** | **10** | **10** | 0 % | 10 % |
| geografia · europa (mapa) | **11** | **14** | **17** | **20** | **18** | **19** | **18** | **15** | **12** | **9** | **9** | 0 % | 10 % |
| geografia · africa (mapa) | **12** | **17** | **23** | 34 | 40 | 42 | 41 | 37 | 32 | **26** | **12** | 0 % | 6 % |
| geografia · asia_oceania (mapa) | **24** | 30 | 39 | 44 | 42 | 39 | 30 | **26** | **20** | **11** | **11** | 0 % | 6 % |

### Hallazgos, por prioridad (sin arreglar todavía)

1. **Vitalia** — célula, procesos y genética tienen **6-7 preguntas** en nivel 1-2 (procesos, 29 hasta
   nivel 4): mismo patrón que el bug de Decimales. Revisar la banda 0 de `src/lib/practica/vitalia.ts`.
2. **Melodía** — oído absoluto **4** preguntas en nivel 1-2 (20 en 3-4); fundamentos 14; alteraciones
   cae a **28 fijas desde el nivel 5** (los niveles altos tienen menos variedad que los bajos).
3. **Anatomía** — meseta del **100 % de N7 a N9** en los 4 modos (hipótesis: el nivel se topa en 7 o
   las bandas 7-10 usan el mismo banco); óseo con 23-30 en niveles 3-6.
4. **Trigonometría** — razones **8** en nivel 1; identidades baja a **19-27 en niveles 9-10**.
5. **Codia · sintaxis** — 14 por lenguaje en nivel 1 (28 en nivel 2, ~40 tope): banco de sintaxis chico.
6. **Calculia** — derivadas 24 en nivel 1; integrales ~40 en niveles 1-4 con 25 % de solapamiento.
7. **Historia · fechas** — 29 en nivel 1.
8. **Geografía (mapa)** — 9-26 países por nivel en América/Europa y en los extremos de Asia/África: el
   filtro `|dificultad − nivel| ≤ 3` deja pocos países. No es generable: o se ensancha la ventana o
   se mezclan más preguntas avanzadas en los niveles extremos. Medir también las preguntas avanzadas.
9. **Quimia · orgánica** — meseta 52 % entre N3 y N5 (leve).
10. Vigilar: Melodía escalas/tempo (40-60, solapamiento 29-44 %), Vitalia ecología (solapamiento 46 %).

Sin problemas de variedad: Circuitia, Estadística, Naipia, Codia (salida, error, estructuras),
Dinamia, Historia (cronología, personajes, causa-efecto), Enigmia (generados), Quimia (resto).

### Lo que esta medición NO cubre todavía

- **Respuestas correctas**: todos los mundos tienen su `*.test.ts` en `src/lib/practica`, pero solo
  está comprobado (por código) que recalculan la respuesta desde el enunciado Estadística, Calculia,
  Trigonometría y Decimales. Para Anatomía, Circuitia, Codia, Dinamia, Historia, Melodía, Naipia,
  Quimia (`quimia.test.ts`, `quimiaAuditoria.test.ts`) y Vitalia: PENDIENTE revisar qué verifican.
- **Enunciados claros**: revisión a mano pendiente en todos los mundos salvo Numeria/Decimales.
- **Enigmia · deducción** con el banco real (`logic_puzzles` de la base) y Geografía avanzada.
- **Repetición entre partidas**: hoy el deduplicador vive solo dentro de una partida; si un banco es
  chico, el jugador ve lo mismo partida tras partida. Opción a evaluar: recordar las últimas claves
  vistas por modo (por jugador, en el cliente) y evitarlas.
