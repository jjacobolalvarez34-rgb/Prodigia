# Música de Prodigia

Actualizada el 12 de octubre de 2026. Versión editable: https://claude.ai/code/artifact/91ba6607-ace1-4d39-88e3-d8ec69caeddf

Empieza con 8 piezas que cubren toda la app; los 15 mundos vienen después, como variaciones del mismo tema.

## Primera etapa: 8 piezas

Con estas 8 suena toda la app: los menús, las partidas, los duelos y los momentos de festejo. Los loops tienen que empalmar el final con el principio sin que se note; los cortes (stingers) suenan una vez.

| Pieza | Dónde suena | Duración | Carácter |
| --- | --- | --- | --- |
| Tema principal | Hoy, Mundos, Perfil, Social | Loop de 1:30 a 2:00 | La identidad de Prodigia: cálida, nocturna, con ganas de jugar |
| Partida | El sprint de cualquier mundo | Loop de 60 a 90 s, en capas | Pulso constante y poca melodía: no tiene que distraer de la pregunta |
| Duelo | Rankeds, casual y retos entre amigos | Loop de 60 a 90 s, en capas | Más tensión y empuje que la Partida, mismo tempo para poder cambiar sin corte |
| Zen | Modo Zen y las lecciones de Aprender | Loop de 2:00 | Muy tranquilo, casi ambiente; para estudiar sin reloj |
| Bazar | Tienda, Inventario y Recompensas | Loop de 1:00 | Liviano y juguetón, como entrar a un negocio |
| Victoria | Fin de partida buena o duelo ganado | Corte de 4 a 6 s | El motivo del tema, completo y hacia arriba |
| Resultado neutro | Derrota o partida floja | Corte de 3 a 5 s | Amable, sin castigar: «la próxima sale» |
| Subir de nivel o de rango | Nivel de cuenta, nivel de mundo, rango nuevo y logros | Corte de 3 a 5 s | Fanfarria corta; la versión de rango un poco más grande |

## Segunda etapa: un mundo, una variación

Cada mundo lleva el tema principal con otra instrumentación, en loops de 30 a 45 s. Suena en el hub de ese mundo y, si quieres, como capa de color en su Partida. Al ser el mismo tema, todo sigue sonando a Prodigia.

| Mundo | Qué se enseña | Idea de instrumentación |
| --- | --- | --- |
| Numeria | Aritmética, fracciones, álgebra, geometría | Marimba rítmica y precisa, como contar |
| Calculia | Cálculo | La de Numeria más grave y amplia: vibráfono y contrabajo |
| Enigmia | Lógica | Caja de música en modo menor, misteriosa |
| Geografía | Países y capitales | Percusión de varias partes del mundo y flauta |
| Historia | Historia | Cuerdas y metales suaves, aire de documental |
| Quimia | Química | Sintes burbujeantes, arpegios que «reaccionan» |
| Anatomía | Cuerpo humano | Un latido como percusión, cuerdas cálidas |
| Vitalia | Biología | Latido más vivo, maderas y sonidos orgánicos |
| Melodía | Música | Piano solo, como una clase de piano |
| Trigonometría | Trigonometría | Arpegios que suben y bajan, como una onda seno |
| Circuitia | Circuitos | Sintes con pulsos eléctricos, bajo sintetizado |
| Codia | Programación | Chiptune de 8 bits |
| Estadística | Estadística | El tema con pequeñas variaciones de tempo y textura, como datos que cambian |
| Naipia | Sistemas de conteo de cartas | Jazz de casino suave: contrabajo y escobillas |
| Dinamia | Física | Percusión con impulso, un ritmo que acelera |

## La identidad del sonido

La música tiene que salir del mundo de Prodigia: números, conocimiento y ciudades de noche con ventanas que se encienden. Cuatro ideas para lograrlo:

- **El motivo sale de las matemáticas.** Arma la melodía principal con los dígitos de π (3, 1, 4, 1, 5, 9, 2, 6) como grados de la escala, o con un ritmo de Fibonacci (duraciones 1, 1, 2, 3, 5). Así el tema es literalmente de Prodigia, y es una buena historia para contar en redes.
- **La noche y las ventanas.** Pads cálidos de fondo, como el cielo nocturno de las ciudades. Encima, notas cortas de celesta o glockenspiel que suenan como ventanas que se prenden. Ese sonido puede volver en los cortes de Victoria y Subir de nivel.
- **En las partidas, poca melodía.** La gente está pensando una respuesta: ritmo y colchón armónico, con la melodía escasa o reservada para cuando la racha sube.
- **Todo en la misma tonalidad.** Los 3 cortes y los loops comparten tonalidad (o tonalidades vecinas), así un corte de Victoria encaja sobre lo que estaba sonando y con los efectos de acierto que ya existen.

## Especificaciones para entregar

Con esto la app puede usar la música tal cual, sin retoques.

| Tema | Qué entregar |
| --- | --- |
| Tonalidad | **La mayor** (o su relativa, Fa# menor). El sonido de acierto de la app es un La de 880 Hz que sube por la escala de La mayor con cada acierto seguido, y es el sonido que más se escucha. El de subir de nivel hoy es un acorde de Do mayor: se puede re-afinar a La para que todo combine |
| Tempo | Partida y Duelo al mismo tempo, entre 110 y 125 BPM, para pasar de una a otra sin corte |
| Loops | El último compás empalma con el primero. Entrega el archivo justo del largo del loop, sin silencio al final ni cola de reverb cortada |
| Capas (stems) | Partida y Duelo en 3 archivos del mismo largo: base (pads y bajo), percusión y melodía. La app los suma según la racha: base siempre, percusión con 5 aciertos seguidos, melodía con 10 (como las llamas que ya existen) |
| Formato | M4A (AAC) o OGG a 128 kbps, estéreo, 44,1 kHz. Los efectos actuales son WAV de 44,1 kHz, así que esa frecuencia coincide |
| Volumen | La música más baja que los efectos: alrededor de −18 LUFS integrados, con picos por debajo de −1 dBTP. Los cortes, un poco más fuertes (alrededor de −16 LUFS) |
| Nombres | `musica_tema.m4a`, `musica_partida_base.m4a`, `musica_partida_percusion.m4a`, `musica_partida_melodia.m4a`, `musica_duelo_*.m4a`, `musica_zen.m4a`, `musica_bazar.m4a`, `corte_victoria.m4a`, `corte_neutro.m4a`, `corte_nivel.m4a`; mundos: `musica_mundo_<mundo>.m4a` (por ejemplo `musica_mundo_quimia.m4a`) |

En la app, la música va a tener su propio interruptor en Ajustes, separado de los efectos: mucha gente estudia en silencio. Cuando entregues los archivos, la conecto en web y app.

## Orden de trabajo

El tema principal va primero porque todo lo demás sale de él.

- [ ] Elegir el motivo (π o Fibonacci) y probarlo en La mayor
- [ ] Tema principal
- [ ] Corte de Victoria (el motivo completo)
- [ ] Corte de Subir de nivel o de rango
- [ ] Corte de Resultado neutro
- [ ] Partida, en 3 capas
- [ ] Duelo, en 3 capas y al mismo tempo que Partida
- [ ] Zen
- [ ] Bazar
- [ ] Probar todo en el teléfono con los efectos de acierto encima
- [ ] Mundos, de a uno: empezar por los más jugados (Numeria y Geografía)
