# TECNICAS-Y-CLASES-POR-MUNDO — Guía de publicidad de Aprender (Técnicas y Clases de las 13 ciudades)

> Versión 2026-09-25. Guía para quien diseña las piezas (incluido el agente de captura y diseño de `opencode`): qué enseña Aprender en cada ciudad, cuántas lecciones hay, qué capturar y con qué mensajes.
> Fuente de los números: el código real de cada mundo (`src/lib/<mundo>/lecciones/`), contado con un script el 2026-09-25 — `VERIFICADO EN CÓDIGO`. Los nombres de lecciones son los de la base (`techniques.nombre`); los de Numeria se listan tal como se sembraron (algunos ya normalizados a tuteo por la migración 0221).
> Reglas transversales: `README.md` (Regla de oro), `VOZ-TONO.md` (tuteo neutro), `PRODUCT-MESSAGING.md`.

## 1. Qué es Aprender (igual en las 13 ciudades)

Aprender tiene **dos pestañas**:

| Pestaña | Qué es | Acceso |
|---|---|---|
| **Técnicas** | Atajos y trucos cortos para resolver más rápido y recordar mejor. Cada una trae una explicación animada y un cuestionario corto. | Gratis |
| **Clases** | El curso completo del tema, paso a paso, con ejemplos resueltos, animaciones y cuestionario al final. | **Pro**, con la **primera Clase de cada ciudad gratis** como muestra |

Lo que se puede afirmar de TODAS (verificado):

- Cada lección tiene **al menos una explicación visual animada** (un test falla si alguna queda sin ella).
- Técnicas y Clases se desbloquean **por tema**: no hay que terminar todo un curso lineal para empezar por lo que te interesa (dentro de cada tema el orden sí es de la primera a la última).
- Al terminar una lección hay un botón para ir a practicar ese tema.
- Las animaciones respetan la opción de "reducir movimiento" del sistema (accesibilidad) y tienen alternativa de texto para lectores de pantalla.
- Todo el contenido está en español neutro. *(La versión en inglés de las lecciones está pendiente: ver punto 5.)*

## 2. Cuidado con lo que se promete

- **Pro:** `VOZ-TONO.md` pide validar el lanzamiento antes de vender Pro como beneficio. Recomendación de trabajo: las piezas de **Técnicas** (gratis) pueden salir ya; las de **Clases** conviene mostrarlas como "la primera clase es gratis" hasta que se decida cómo comunicar Pro (decisión del equipo, `HIPÓTESIS`).
- **Naipia:** enmarcar SIEMPRE como entrenamiento de memoria, atención y velocidad mental. Nada de casino, apuestas ni "ganar dinero" (la Trastienda de la app es otra sección y no se mezcla con Aprender).
- **Contenido de Historia:** los hechos están pendientes de revisión de una persona historiadora (`docs/HISTORIA_HECHOS.md`); evitar cifras concretas en piezas hasta esa revisión.
- **Sin promesas de nota o de aprobar.** Se puede decir "aprende más fácil", no "aprueba tu examen".
- **Números:** usar los de la tabla (se recalculan si se agregan lecciones; volver a contar antes de cada campaña).

## 3. Resumen por ciudad

| Ciudad | Color | Técnicas | Clases | Explicaciones animadas | Lección que más luce |
|---|---|---|---|---|---|
| Numeria | `#6C4CF1` | 39 | 5 | 53 | Números cercanos a 100 (6) |
| Enigmia | `#0E9F6E` | 10 | 11 | 35 | Patrones alternantes: dos secuencias en una (3) |
| Geografía | `#1E7A8C` | 23 | 16 | 42 | Divide y vencerás (2) |
| Quimia | `#C026D3` | 30 | 34 | 191 | Enlace químico: iónico, covalente y metálico (8) |
| Anatomía | `#8B2942` | 21 | 22 | 76 | El hueso por dentro: funciones y tejido (3) |
| Melodía | `#B8860B` | 18 | 18 | 78 | Acordes suspendidos, add9 y extendidos (9, 11 y 13) (7) |
| Trigonometría | `#84CC16` | 25 | 27 | 89 | Ecuaciones trigonométricas básicas (4) |
| Historia | `#A0522D` | 25 | 31 | 167 | Las Naciones Unidas, los derechos humanos y la Guerra Fría (6) |
| Calculia | `#4338CA` | 5 | 7 | 48 | Curso Pro: EDOs separables — separar variables e integrar (9) |
| Circuitia | `#F59E0B` | 5 | 7 | 37 | Curso Pro: Razonamiento cualitativo — cuándo algo genuinamente NO cambia (8) |
| Estadística | `#0D9488` | 5 | 8 | 50 | Clase 8: Lectura crítica de gráficos (10) |
| Naipia | `#B91C1C` | 5 | 8 | 35 | Clase 4: KO, un sistema no balanceado (4) |
| Codia | `#06B6D4` | 5 | 8 | 59 | Clase 3: Bucles — repetir sin copiar y pegar (8) |
| **Total** | | **216** (222 con las 6 históricas de Enigmia) | **202** | **960** | |

> Enigmia: en el código hay 10 Técnicas nuevas y 11 Clases; además la base ya traía 6 Técnicas históricas (sembradas en 0015/0020), así que la ciudad tiene **16 Técnicas** en total. La tabla cuenta las 10 nuevas y las 11 Clases; si citas un total, usa 16 para Técnicas de Enigmia.
> Numeria: sus Clases (5) son las de Aprender; el resto del catálogo de la ciudad son las 39 Técnicas.
> Geografía incluye 3 Técnicas generales de método ("Divide y vencerás", "Ancla por vecinos", "Forma característica") además de las 20 por continente.

## 4. Ficha por ciudad

Cómo usar cada ficha: **Qué enseña** (para el copy), **Ganchos** (ideas de titular, ya en tuteo neutro), **Qué capturar** (ruta + lección) y **Lecciones** (lista real; las Clases son Pro salvo la primera).

### Numeria — cálculo mental y matemática escolar

- **Color:** `#6C4CF1` · **Temas:** Aritmética, fracciones, decimales, potencias, álgebra y geometría.
- **Qué enseña:** Trucos de cálculo mental (×11 en un segundo, el método de bases, complementos) y clases con tablero animado de multiplicación en columna y división larga.
- **Ganchos:** "×11 en un segundo" · "Multiplica 98 × 97 en la cabeza" (método de bases) · "La casita de la división, animada".
- **Qué capturar:** `/aprender` (las dos pestañas) y la lección con más animación, «Números cercanos a 100» (`/aprender/numeros-cercanos-a-100`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (39)**

- Complemento a 10
- Sumar redondeando a la decena
- Sumar por la izquierda
- Duplicar y ajustar
- Sumar números grandes, posición por posición
- Estima antes de sumar números grandes
- Resta por compensación
- Complemento a 100
- Restar números grandes, pidiendo prestado a lo grande
- Restar completando hasta el redondo más cercano
- ×11 en un segundo
- ×5 = la mitad de ×10
- Cuadrados de números terminados en 5
- ×9 = ×10 menos el número
- Números cercanos a 100
- ×4 = duplicar dos veces
- Multiplicación por partes (distributiva)
- Multiplicar redondeando primero
- Reglas de divisibilidad por 3
- ÷5 = ×2 y correr el punto
- Dividir números grandes, por partes
- Estimar el cociente antes de dividir
- Sumar con el mismo denominador
- Simplificar dividiendo por el máximo común divisor
- Mínimo común denominador
- Comparar fracciones con producto cruzado
- De fracción a decimal, dividiendo
- Un porcentaje es un decimal corrido dos lugares
- Redondear mirando el dígito siguiente
- Una potencia es multiplicar el número por sí mismo
- Raíz cuadrada probando cuadrados cercanos
- Notación: contar los ceros
- Qué es una variable
- Despejar paso a paso
- Verificar tu respuesta sustituyendo
- Ternas pitagóricas de memoria
- Área de figuras compuestas: divide en partes simples
- π ≈ 22/7 cuando el radio es múltiplo de 7, si no, 3.14
- Ángulos complementarios y suplementarios, de un vistazo

**Clases (5)**

- Conceptos básicos: valor posicional, sumar y restar — *gratis (muestra)*
- Multiplicación en columna: productos parciales
- División larga: la "casita", paso a paso
- Mínimo común múltiplo (MCM)
- Operaciones entre fracciones

### Enigmia — razonamiento y memoria

- **Color:** `#0E9F6E` · **Temas:** Lógica: patrones, deducción, memoria y pensamiento computacional.
- **Qué enseña:** Atajos para resolver acertijos (silogismos, eliminación, método de loci) y clases sobre secuencias, algoritmos, bucles y depuración.
- **Ganchos:** "Método de loci: memoriza con un recorrido" · "Un silogismo en 10 segundos" · "Por qué falla un algoritmo".
- **Qué capturar:** `/enigmia/aprender` (las dos pestañas) y la lección con más animación, «Patrones alternantes: dos secuencias en una» (`/enigmia/aprender/enigmia-tecnica-patrones-alternantes`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (10)**

- Patrones alternantes: dos secuencias en una
- Silogismos: atajo para encadenar dos premisas
- Negación: qué significa "ningún X es Y"
- Eliminación por descarte
- Método de loci: memorizar con un recorrido
- Agrupar por categoría antes de memorizar
- Visualizar en vez de repetir
- Trazar un bucle a mano
- Identificar la condición de corte
- Simplificar antes de ejecutar

**Clases (11)**

- Qué es una secuencia: diferencia constante vs. razón constante — *gratis (muestra)*
- Patrones no numéricos: letras, formas y colores
- Proposiciones, valor de verdad y la contrapositiva
- Silogismos simples: si A→B y B→C, entonces A→C
- Chunking y asociación: agrupar para recordar más
- Qué es un algoritmo: pasos, condicionales y el orden
- Patrones compuestos: dos reglas combinadas
- Deducción por eliminación
- Repetición espaciada y recuerdo activo
- Bucles y repetición
- Depuración: por qué falla un algoritmo

### Geografía — mapa y regiones

- **Color:** `#1E7A8C` · **Temas:** Ubicar países y regiones en el mapa.
- **Qué enseña:** Técnicas por continente para ubicar países (Brasil como ancla, los Balcanes, el Cuerno de África…) y clases por región con explicación animada.
- **Ganchos:** "Brasil limita con casi todo el continente" · "Los cinco '-stán' de Asia Central" · "Lesoto: el país rodeado por otro".
- **Qué capturar:** `/geografia/aprender` (las dos pestañas) y la lección con más animación, «Divide y vencerás» (`/geografia/aprender/dividir-en-subregiones`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (23)**

- Sudamérica vs. Centroamérica: dos formas muy distintas
- Brasil como ancla: limita con casi todo el continente
- Islas del Caribe: tamaño y posición relativa
- El istmo centroamericano, país por país
- Cono Sur: la franja angosta y el bloque grande
- Países escandinavos: forma y orientación
- Los Balcanes: muchos países chicos y cercanos
- Islas europeas separadas del continente
- Alemania: el cruce de caminos de Europa central
- La península ibérica: dos países, un mismo bloque
- Países africanos sin salida al mar
- El Sahara como frontera natural
- El Cuerno de África: la punta que sobresale
- Fronteras rectas: herencia colonial
- Lesoto: un país rodeado por otro
- Tres penínsulas asiáticas para ubicarse rápido
- Indonesia y Filipinas: países archipiélago
- Oceanía: Australia enorme, el resto mucho más chico
- Asia Central: los cinco países terminados en '-stán'
- Oriente Medio alrededor de Arabia Saudita
- Divide y vencerás
- Ancla por vecinos
- Forma característica

**Clases (16)**

- Cono Sur: Argentina, Chile, Uruguay y Paraguay — *gratis (muestra)*
- Región Andina: Colombia, Venezuela, Ecuador, Perú y Bolivia
- Centroamérica y el Caribe: el istmo y las islas
- Norteamérica: Estados Unidos, Canadá y México
- Europa Occidental: Francia, Alemania, Países Bajos y Bélgica
- Europa del Este: Polonia, Ucrania, Hungría y Rumania
- Escandinavia y el Báltico: Suecia, Noruega, Dinamarca y Finlandia
- Región Mediterránea: España, Italia, Grecia y Portugal
- Norte de África (Magreb): Marruecos, Argelia, Túnez y Libia
- África Occidental: Nigeria, Ghana, Senegal y Costa de Marfil
- África Oriental: Kenia, Etiopía, Tanzania y Uganda
- África Austral: Sudáfrica, Namibia, Botsuana y Zimbabue
- Asia Oriental: China, Japón, Corea del Sur y Mongolia
- Sudeste Asiático y Asia Meridional: Indonesia, Filipinas, Vietnam e India
- Oriente Medio: Arabia Saudita, Irán, Turquía e Israel
- Oceanía: Australia, Nueva Zelanda, Papúa Nueva Guinea y Fiyi

### Quimia — química general, inorgánica y orgánica

- **Color:** `#C026D3` · **Temas:** Tabla periódica, nomenclatura, redox y química orgánica.
- **Qué enseña:** La mayor biblioteca del producto: 30 Técnicas y 34 Clases con esquemas de la tabla, enlaces, nomenclatura y moléculas animadas.
- **Ganchos:** "Cruza las cargas y escribe cualquier fórmula" · "Balancear por electrones: el truco de la cruz" · "El carbono siempre hace cuatro enlaces".
- **Qué capturar:** `/quimia/aprender` (las dos pestañas) y la lección con más animación, «Enlace químico: iónico, covalente y metálico» (`/quimia/aprender/quimia-clase-enlace-quimico`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (30)**

- Agrupar por familia
- Leer la tabla como un mapa, no como una lista
- Los gases nobles como hitos
- La escalera de los metaloides
- La electronegatividad crece hacia el flúor
- Asociación por color o uso cotidiano
- Nombres latinos: cuando el símbolo no se parece
- Una mayúscula abre un elemento
- La carga sale del grupo
- Cruzar las cargas
- Subíndice y coeficiente: cuenta los átomos
- Patrones en cómo se nombran los compuestos
- hídrico-uro, ico-ato, oso-ito
- Los prefijos cuentan los átomos
- Los oxácidos del cloro se ordenan por sus oxígenos
- El número romano es la carga del metal
- Oxidar y reducir sin confundirse
- Calcular un número de oxidación en tres pasos
- ¿Es redox? Busca el cambio de número
- Balancear por electrones: el truco de la cruz
- Ion-electrón: el orden O, H, e⁻
- Serie de actividad: quién desplaza a quién
- El carbono siempre hace cuatro enlaces
- Del esqueleto a la fórmula molecular
- Los prefijos de la cadena
- La terminación dice la familia
- Nombrar un ramificado en cuatro pasos
- Reconocer el grupo funcional
- Isómeros: misma fórmula, distinta estructura
- Combustión de un hidrocarburo en tres pasos

**Clases (34)**

- Materia, átomo y partículas — *gratis (muestra)*
- Cómo se organiza la tabla periódica
- Configuración electrónica y electrones de valencia
- Propiedades periódicas
- Cómo leer la ficha de un elemento
- Símbolos y elementos comunes
- Enlace químico: iónico, covalente y metálico
- Fórmulas químicas y masa molar
- Valencia, número de oxidación y cómo armar fórmulas
- Nomenclatura inorgánica: visión general
- Óxidos básicos y óxidos ácidos
- Hidruros y peróxidos
- Hidróxidos (bases)
- Ácidos: hidrácidos y oxoácidos
- Sales binarias y oxisales
- Sales ácidas, sales básicas e iones comunes
- Método para nombrar cualquier compuesto
- El número de oxidación como herramienta
- Oxidación, reducción y agentes
- Balanceo por cambio del número de oxidación
- Método ion-electrón en medio ácido
- Método ion-electrón en medio básico
- Serie de actividad y potenciales
- Pilas y electrólisis
- El carbono y sus enlaces
- Formas de escribir una molécula orgánica
- Alcanos y su nomenclatura
- Alquenos y alquinos
- Cicloalcanos y compuestos aromáticos
- Alcoholes, éteres, aldehídos y cetonas
- Ácidos carboxílicos, ésteres, aminas, amidas y haluros
- Isomería
- Reacciones orgánicas básicas
- Glucosa y polímeros

### Anatomía — cuerpo humano

- **Color:** `#8B2942` · **Temas:** Huesos, músculos, órganos y sistema nervioso.
- **Qué enseña:** Truquitos para memorizar (el horario 7-12-5 de columna y tórax, los 12 pares craneales de tres en tres) y clases por sistema.
- **Ganchos:** "Los 12 pares craneales de tres en tres" · "El camino de la sangre: dos circuitos, cuatro cavidades" · "El arco reflejo".
- **Qué capturar:** `/anatomia/aprender` (las dos pestañas) y la lección con más animación, «El hueso por dentro: funciones y tejido» (`/anatomia/aprender/anatomia-clase-tejido-oseo`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (21)**

- Huesos del cráneo: agrúpalos por zona
- Brazo y pierna: mismo plano, distinto nombre
- Mano y pie: tres filas, de la muñeca a la punta
- Columna y tórax: el horario 7-12-5
- Clasifica los huesos por su forma
- De lo simple a lo compuesto: primero el cuerpo, después la cabeza
- Ubica cada músculo por región del cuerpo
- Lee el nombre: forma, número, ubicación y acción
- Cada músculo tiene su opuesto
- El nombre del músculo ya te dice dónde está
- Cabeza y cuello: los que expresan y los que mastican
- Los órganos, por cavidad
- Cada órgano, en su aparato
- El camino del alimento, de la boca al ano
- El camino del aire: de la nariz a los alvéolos
- El camino de la sangre: dos circuitos, cuatro cavidades
- Pares craneales: agrúpalos por función, no por número
- Los 12 pares en orden: de tres en tres
- El nombre del nervio es una pista
- Central o periférico: lo que está dentro del hueso y lo que sale
- El arco reflejo: una respuesta que no espera al cerebro

**Clases (22)**

- Posición anatómica, planos y direcciones — *gratis (muestra)*
- El hueso por dentro: funciones y tejido
- El cráneo: 22 huesos y sus suturas
- Columna vertebral y caja torácica
- Cinturas y extremidades: el esqueleto apendicular
- Las articulaciones: cómo se unen los huesos
- Tipos de músculo y cómo se contraen
- Nombres, origen e inserción de los músculos grandes
- Músculos de la cabeza y el cuello
- Músculos del tronco: pecho, abdomen y espalda
- Músculos de los brazos y las piernas
- Las cavidades del cuerpo y sus órganos
- Aparato digestivo: del bocado al ano
- Aparato respiratorio: vías, pulmones y alvéolos
- Corazón, vasos, sangre y bazo
- Aparato excretor: riñones y vejiga
- La neurona y la sinapsis
- Sistema nervioso central y periférico
- El encéfalo: cerebro, cerebelo y tronco encefálico
- La médula espinal y los reflejos
- Los 12 pares craneales
- El sistema nervioso autónomo: simpático y parasimpático

### Melodía — teoría musical

- **Color:** `#B8860B` · **Temas:** Teoría musical: notas, ritmo, escalas, acordes y oído.
- **Qué enseña:** Desde el cifrado americano hasta acordes de séptima y extendidos, con teclado, pentagrama y ondas animadas.
- **Ganchos:** "Do es C y sigue el abecedario" · "Las cuatro tríadas, apilando terceras" · "La escala mayor: T-T-S-T-T-T-S".
- **Qué capturar:** `/melodia/aprender` (las dos pestañas) y la lección con más animación, «Acordes suspendidos, add9 y extendidos (9, 11 y 13)» (`/melodia/aprender/melodia-clase-suspendidos-y-extendidos`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (18)**

- Cifrado americano: Do es C y sigue el abecedario
- Figuras rítmicas: cada una vale la mitad de la anterior
- Teclas negras: los grupos de 2 y 3 te dicen dónde estás
- Lee el pentagrama por posición, no nota por nota
- Un truco para no olvidar las 9 posiciones
- Fuera del pentagrama: sigue la alternancia línea, espacio, línea
- Sostenidos y bemoles: la misma tecla, dos nombres
- Mi-Fa y Si-Do: los dos semitonos sin tecla negra
- Enarmonía: primero la posición, después el símbolo
- La escala mayor: T-T-S-T-T-T-S desde cualquier nota
- Menor natural: la escala mayor empezada en su 6.º grado
- Reconoce la escala: cuenta las notas y mira el primer salto
- Cómo se arma cualquier tríada: fundamental, 3.ª y 5.ª
- De tríada a séptima: una nota más arriba
- Las cuatro tríadas: apila terceras de 4 y de 3 semitonos
- Sus, add9 y los de 9, 11 y 13: qué nota cambia o se agrega
- Ancla tu oído en una referencia: el La de 440 Hz
- Ordena las opciones de grave a aguda y compara

**Clases (18)**

- El sonido y la nota: altura, octava y nombre — *gratis (muestra)*
- Las siete notas en el teclado y el cifrado americano
- Figuras rítmicas, pulso y compás
- El pentagrama y la clave de sol
- Líneas adicionales: leer más allá de las cinco líneas
- El nombre completo de una nota: letra y octava
- Semitonos y tonos: la unidad de medida de la música
- Sostenido, bemol y becuadro
- Enarmonía: un sonido, dos nombres
- La escala mayor
- La escala menor natural y las escalas relativas
- Las escalas pentatónicas mayor y menor
- Intervalos: medir la distancia entre dos notas
- Las cuatro tríadas: mayor, menor, disminuida y aumentada
- Acordes de séptima: maj7, 7, m7 y dim7
- Acordes suspendidos, add9 y extendidos (9, 11 y 13)
- Frecuencia, La = 440 Hz y la razón de octava
- Oído absoluto y oído relativo: qué son y cómo se entrena

### Trigonometría — trigonometría de secundaria a bachillerato

- **Color:** `#84CC16` · **Temas:** Razones, círculo unitario, gráficas, leyes, identidades y ecuaciones.
- **Qué enseña:** Trucos como SOH-CAH-TOA o el truco de la mano para los valores notables, y clases con círculo unitario y ondas animadas.
- **Ganchos:** "El truco de la mano para los ángulos notables" · "SOH-CAH-TOA" · "La tangente no es una onda".
- **Qué capturar:** `/trigonometria/aprender` (las dos pestañas) y la lección con más animación, «Ecuaciones trigonométricas básicas» (`/trigonometria/aprender/trigonometria-clase-26-ecuaciones-basicas`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (25)**

- SOH-CAH-TOA: opuesto y adyacente dependen del ángulo
- ¿Qué razón uso? Dato, incógnita y el lado que sobra
- La «co» engaña: la cosecante es del seno
- Medio cuadrado y medio equilátero
- Elevación y depresión: mide desde la horizontal
- Coseno es x, seno es y: léelos como coordenadas
- El truco de la mano para los valores notables
- Simetría por cuadrante: ángulo de referencia y signos
- Conversión rápida entre grados y radianes
- Suma o resta vueltas: ángulos coterminales
- La onda: amplitud es la altura, periodo es el largo de un ciclo
- El periodo de y = a·sen(bx) es 2π/b
- c corre, d sube: y = a·sen(b(x − c)) + d
- De la gráfica a la ecuación en cuatro pasos
- La tangente no es una onda: asíntotas en π/2 + kπ
- Cuándo usar la ley del seno y cuándo la del coseno
- Área = ½ · a · b · sen C
- SSA: compara a con la altura h = b·sen A
- Tres identidades que abren todas las puertas
- sen(A + B) no es sen A + sen B
- El seno de un ángulo es el coseno de su complemento
- Cómo verificar una identidad: un solo lado, a senos y cosenos
- En una vuelta, casi siempre dos soluciones
- La calculadora te da una: la otra sale por simetría
- No dividas entre sen x: factoriza

**Clases (27)**

- El triángulo rectángulo y sus lados según el ángulo — *gratis (muestra)*
- Seno, coseno y tangente
- Cosecante, secante y cotangente
- Hallar un lado
- Hallar un ángulo: las razones inversas
- Triángulos especiales: 45-45-90 y 30-60-90
- Ángulos de elevación y de depresión
- Ángulos en el plano: cuadrantes y coterminales
- Radianes
- El círculo unitario y los valores exactos
- Ángulo de referencia y signos por cuadrante
- La función seno y su gráfica
- La función coseno
- Amplitud
- Periodo y frecuencia
- Desfase y desplazamiento vertical
- La tangente y sus asíntotas
- Leer y escribir la ecuación de una gráfica
- Ley del seno
- Ley del coseno
- Cuál ley usar y el área del triángulo
- El caso ambiguo (SSA)
- Identidades fundamentales
- Ángulo doble, suma y diferencia de ángulos
- Simplificar y verificar identidades
- Ecuaciones trigonométricas básicas
- Ecuaciones con identidades y con factorización

### Historia — historia universal

- **Color:** `#A0522D` · **Temas:** De la Prehistoria a la actualidad, por época y por región.
- **Qué enseña:** 25 Técnicas y 31 Clases ordenadas por época, con líneas de tiempo, causas y consecuencias, y personajes por rol.
- **Ganchos:** "Cuatro fechas que ordenan toda la historia" · "Los años a. C. se cuentan hacia atrás" · "¿Qué pasaba a la vez en otras partes del mundo?".
- **Qué capturar:** `/historia/aprender` (las dos pestañas) y la lección con más animación, «Las Naciones Unidas, los derechos humanos y la Guerra Fría» (`/historia/aprender/historia-clase-30-onu-derechos-humanos-y-guerra-fria`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (25)**

- Anclaje cronológico: cuatro fechas que ordenan todo
- Línea de tiempo mental
- Cuando no hay años: fechas aproximadas y «hacia»
- Causa, hecho y consecuencia
- Agrupar por siglo, no por fecha suelta
- Los años a. C. se cuentan hacia atrás
- ¿Qué pasaba a la vez en otras partes?
- Reconocer personajes por su rol y su época
- Cadenas de dos pasos: del hecho A al hecho C
- Asociación memorable
- Siglas para recordar secuencias cortas
- El siglo XIII: cuatro regiones a la vez
- Causa y efecto en el siglo XIV
- Cómo se cierra la Edad Media: 1453 o 1492
- Antes y después de 1492: usa la ancla de la Edad Moderna
- Cadenas de dos pasos: de Colón al Virreinato
- Fines del siglo XVI y comienzos del XVII: cuatro regiones a la vez
- Reconocer personajes del siglo XVII por su rol
- Una cadena de tres hechos: de la guerra de los Siete Años a la Constitución
- Cadenas de dos pasos: de la Revolución francesa a Haití y a Hispanoamérica
- Cuatro continentes a la vez: 1815 y 1839
- El cambio de siglo: los años redondos cierran el siglo
- Causas y consecuencias: la Primera Guerra Mundial y la crisis de 1929
- Personajes por rol: la Segunda Guerra Mundial y la posguerra
- Hechos y opiniones: cómo estudiar la historia reciente

**Clases (31)**

- Los primeros humanos: el Paleolítico — *gratis (muestra)*
- El Neolítico: la revolución agrícola y el fin de la Prehistoria
- Mesopotamia y Egipto: las primeras civilizaciones
- La India antigua: del valle del Indo a los Gupta
- La China antigua: de los Shang a los Han
- Grecia y Persia: polis, guerras médicas y filosofía
- Alejandro Magno y el mundo helenístico
- Roma: de la ciudad a la República
- El Imperio romano y el cristianismo
- África y América antiguas: Cartago, Aksum, los olmecas y los mayas
- Bizancio: del fin de Roma de Occidente a la caída de Constantinopla
- El mundo islámico: de Mahoma a Saladino
- Europa feudal: francos, vikingos, normandos y Cruzadas
- La crisis de la Baja Edad Media: peste negra y guerra de los Cien Años
- China, Japón, India y el Sudeste asiático: de los Tang a los Ming
- África y Oceanía medievales: Mali, Zimbabue y los maoríes
- América precolombina: aztecas e incas
- El Renacimiento y la Reforma protestante
- Los viajes de exploración y la conquista de América
- Los grandes imperios de Asia: mogoles, Tokugawa y Qing
- La revolución científica y la Ilustración
- El mundo atlántico: colonias, esclavitud y rivalidades entre potencias
- La independencia de Estados Unidos
- La Revolución francesa y Napoleón
- La revolución haitiana y las independencias de Hispanoamérica
- La industrialización y los avances científicos
- Imperialismo, abolición de la esclavitud y nuevos Estados
- La Primera Guerra Mundial, la Revolución rusa y los años de entreguerras
- La Segunda Guerra Mundial
- Las Naciones Unidas, los derechos humanos y la Guerra Fría
- La descolonización, el fin de la Guerra Fría y el mundo actual

### Calculia — cálculo universitario

- **Color:** `#4338CA` · **Temas:** Derivadas, integrales, series, multivariable y ecuaciones diferenciales.
- **Qué enseña:** Ver una derivada como la pendiente de una secante que se vuelve tangente, una integral como área y una serie que converge, todo animado.
- **Ganchos:** "La secante que se convierte en tangente" · "La integral es un área" · "Una serie infinita que suma 8".
- **Qué capturar:** `/calculia/aprender` (las dos pestañas) y la lección con más animación, «Curso Pro: EDOs separables — separar variables e integrar» (`/calculia/aprender/calculia-pro-edos-separables`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (5)**

- Reconocer de un vistazo la regla de derivación correcta
- Tabla mental de las 5 integrales más comunes
- Identificar el tipo de serie por su forma antes de aplicar un criterio
- Separar variables en una EDO: reconocer cuándo es inmediato
- Derivar parciales: congelar las otras variables como constantes

**Clases (7)**

- Curso Pro: Derivadas desde cero — la regla de la potencia — *gratis (muestra)*
- Curso Pro: Derivadas — producto, cociente y cadena
- Curso Pro: Integrales desde cero — la antiderivada
- Curso Pro: Integrales — exponencial, trigonométricas y sustitución
- Curso Pro: Series — geométricas, convergencia y suma infinita
- Curso Pro: Multivariable — derivadas parciales desde cero
- Curso Pro: EDOs separables — separar variables e integrar

### Circuitia — electricidad básica

- **Color:** `#F59E0B` · **Temas:** Ley de Ohm, serie, paralelo y circuitos mixtos.
- **Qué enseña:** Circuitos dibujados con la corriente en movimiento: se ve cómo se reparte en paralelo y qué cambia (o no) al modificar una resistencia.
- **Ganchos:** "Serie vs. paralelo de un vistazo" · "¿Sube o baja la corriente? Sin calcular todo" · "La corriente en movimiento".
- **Qué capturar:** `/circuitia/aprender` (las dos pestañas) y la lección con más animación, «Curso Pro: Razonamiento cualitativo — cuándo algo genuinamente NO cambia» (`/circuitia/aprender/circuitia-pro-cualitativo-cuando-no-cambia`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (5)**

- Reconocer serie vs. paralelo de un vistazo
- La fórmula de resistencia equivalente en paralelo (recíprocos)
- Cuándo el voltaje es compartido y cuándo la corriente es compartida
- Leer un circuito mixto: identificar el bloque en paralelo primero
- Estimar rápido si una corriente sube o baja sin calcular todo

**Clases (7)**

- Curso Pro: Fundamentos — Ley de Ohm y circuitos en serie — *gratis (muestra)*
- Curso Pro: Circuitos en paralelo — voltaje compartido y reparto de corriente
- Curso Pro: Resistencia equivalente — series vs. paralelo
- Curso Pro: Circuitos mixtos — identificar el bloque en paralelo primero
- Curso Pro: Circuitos mixtos — resolverlos paso a paso
- Curso Pro: Razonamiento cualitativo — cómo cambia una corriente sin calcular todo
- Curso Pro: Razonamiento cualitativo — cuándo algo genuinamente NO cambia

### Estadística — estadística y probabilidad

- **Color:** `#0D9488` · **Temas:** Media, mediana, dispersión, probabilidad, combinatoria y gráficos.
- **Qué enseña:** Cada medida se ve sobre los datos: se ordenan y se marca la mediana, se colorean las desviaciones, se dibuja la campana y la recta de regresión.
- **Ganchos:** "La mediana, sin calcular de más" · "Combinatoria sin factoriales enormes" · "Cómo te engaña un gráfico".
- **Qué capturar:** `/estadistica/aprender` (las dos pestañas) y la lección con más animación, «Clase 8: Lectura crítica de gráficos» (`/estadistica/aprender/estadistica-clase-8-lectura-critica-de-graficos`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (5)**

- Calcular una media larga con una media provisoria
- Hallar la mediana por posición
- Cuartiles y rango intercuartílico por mitades
- Combinatoria sin factoriales enormes
- Varianza a partir de las desviaciones

**Clases (8)**

- Clase 1: Datos y tipos de variable — *gratis (muestra)*
- Clase 2: Media, mediana y moda
- Clase 3: Dispersión, varianza y desvío
- Clase 4: Probabilidad simple, independiente y condicional
- Clase 5: Combinatoria — contar sin listar
- Clase 6: Puntaje z, regla empírica y percentiles
- Clase 7: Correlación y regresión lineal simple
- Clase 8: Lectura crítica de gráficos

### Naipia — memoria y concentración

- **Color:** `#B91C1C` · **Temas:** Conteo de cartas como entrenamiento de memoria y atención.
- **Qué enseña:** Cinco sistemas de conteo (Hi-Lo, KO, Hi-Opt II, Omega II y conteo verdadero) enseñados como un deporte mental, con cartas dibujadas.
- **Ganchos:** "Cuenta cartas en pares que se cancelan" · "¿Cuántas cartas puedes seguir a la vez?" · "Un mazo completo suma 0".
- **Qué capturar:** `/naipia/aprender` (las dos pestañas) y la lección con más animación, «Clase 4: KO, un sistema no balanceado» (`/naipia/aprender/naipia-clase-ko`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (5)**

- Agrupa cartas en pares que se cancelan
- Cuenta por bloques
- Encuentra tu ritmo
- Verificación: un mazo completo suma 0
- Las cartas neutras no se cuentan

**Clases (8)**

- Clase 1: Por qué se cuentan valores y no cartas — *gratis (muestra)*
- Clase 2: Hi-Lo, el sistema base
- Clase 3: Cancelación y velocidad
- Clase 4: KO, un sistema no balanceado
- Clase 5: Por qué existen distintos sistemas
- Clase 6: Hi-Opt II
- Clase 7: Omega II
- Clase 8: Conteo verdadero y estimación de cartas restantes

### Codia — programación

- **Color:** `#06B6D4` · **Temas:** Programación en Python, Java, JavaScript y TypeScript.
- **Qué enseña:** Ejecutar el código en la cabeza: tablas de seguimiento, bucles, errores típicos y complejidad, con el mismo ejemplo en 4 lenguajes.
- **Ganchos:** "¿Qué imprime este código?" · "El mismo programa en Python, Java, JS y TS" · "O(n) contra O(n²), con barras que crecen".
- **Qué capturar:** `/codia/aprender` (las dos pestañas) y la lección con más animación, «Clase 3: Bucles — repetir sin copiar y pegar» (`/codia/aprender/codia-clase-03-bucles`), en tema claro y oscuro. Una cuenta de prueba con Pro para las Clases.

**Técnicas (5)**

- Trazar variables a mano con una tabla de seguimiento
- Leer un bucle: cuántas vueltas da y qué cambia en cada una
- Reconocer los errores típicos por el mensaje
- División entera y resto: cuidado con los negativos
- Complejidad de un vistazo: contar bucles anidados

**Clases (8)**

- Clase 1: Variables y tipos — guardar y nombrar datos — *gratis (muestra)*
- Clase 2: Condicionales — decidir qué camino sigue el código
- Clase 3: Bucles — repetir sin copiar y pegar
- Clase 4: Funciones — nombrar un bloque de código y reutilizarlo
- Clase 5: Listas y diccionarios — guardar muchos datos
- Clase 6: Recorridos y complejidad — O(n) contra O(n²)
- Clase 7: Errores comunes y depuración
- Clase 8: Pilas, colas y conjuntos

## 5. Traducción (en curso)

Las lecciones viven hoy solo en español (`techniques.nombre`, `descripcion` y `contenido`). Los nombres de los grupos/temas del panel lateral de Aprender sí existen en español e inglés (`src/lib/aprender/grupos.ts`). Mientras las lecciones no estén traducidas, **no anunciar Aprender en inglés**: la interfaz cambia de idioma, pero el contenido de las lecciones no.

## 6. Piezas sugeridas (para `assets/piezas/`, estilo `cNN-…-square/story`)

| Pieza | Formato | Idea | Captura |
|---|---|---|---|
| **"Una técnica en 15 segundos"** | Reel/Short, una por ciudad | mostrar el truco animado (por ejemplo ×11 o el método de bases) y el resultado | la lección animada, grabación de pantalla |
| **"Las 13 ciudades, 13 formas de aprender"** | Carrusel | una diapositiva por ciudad con su color, su gancho y su número de lecciones | fichas de la sección 3 |
| **"Empieza por lo que te interesa"** | Post | mostrar el panel de temas de Aprender: todos abiertos desde el principio | `/…/aprender` con el panel lateral |
| **"La primera clase es gratis"** | Story con CTA | animación de una Clase 1 y el mensaje | Clase 1 de cada ciudad |
| **"Mira cómo se mueve"** | Reel | la animación más vistosa de cada ciudad (Quimia, Calculia, Circuitia, Codia) | lecciones con más visuales de la tabla |
| **"Antes de practicar, aprende el truco"** | Post | flujo Aprender → Ir a practicar | lección + botón final |

## 7. Checklist antes de publicar

- [ ] Los números salen de la tabla de la sección 3 (o se volvieron a contar).
- [ ] La lección mostrada existe con ese nombre (lista de la ficha).
- [ ] Sin promesas de nota, sin Pro como beneficio si el equipo no lo decidió, sin casino en Naipia.
- [ ] Tuteo neutro y ortografía revisados (`VOZ-TONO.md`).
- [ ] Pieza en tema claro y oscuro; captura real de la app, no maquetada.
