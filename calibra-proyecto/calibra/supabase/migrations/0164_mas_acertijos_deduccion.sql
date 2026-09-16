-- Pedido en vivo (2026-09-15): "en Enigmia necesito más variedad de
-- preguntas de nuevo". Investigación: memoria/patrones/computacional ya
-- son generadas por código (src/lib/enigmia/generadores.ts, infinitas
-- de verdad) — pero "deduccion" NUNCA tuvo generador (ver el comentario
-- en ese archivo: armar uno de verdad implica derivar pistas mínimas de
-- una solución al azar, un problema bastante más difícil) y seguía
-- dependiendo ÚNICAMENTE de los 10 acertijos sembrados en
-- 0015_mundo_enigmia.sql desde el lanzamiento — con eso se repiten
-- rápido. EnigmiaSprintRunner.tsx filtra el banco por
-- tipo = 'deduccion' (ver ahí, líneas ~58-73), así que agregar filas acá
-- alcanza sin tocar código. 30 acertijos nuevos (3 por dificultad 1-10),
-- cada uno resuelto y verificado a mano por unicidad de respuesta antes
-- de escribirlo — variedad real de forma, no solo de nombres: silogismos
-- universales, falacias clásicas (afirmar el consecuente, negar el
-- antecedente) con respuesta "No se sabe", modus tollens, transitividad,
-- órdenes encadenados, y en las dificultades altas (8-10) grillas de
-- 3-4 variables y dos acertijos de caballeros-y-pícaros.
insert into public.logic_puzzles (tipo, dificultad, contenido, respuesta) values
('deduccion', 1, '{"enunciado": "Todas las rosas son flores. Ese objeto es una rosa. ¿Es una flor?", "opciones": ["Sí", "No", "No se sabe", "A veces"]}', 'Sí'),
('deduccion', 1, '{"enunciado": "Ningún anfibio es reptil. La rana es un anfibio. ¿La rana es un reptil?", "opciones": ["Sí", "No", "No se sabe", "A veces"]}', 'No'),
('deduccion', 1, '{"enunciado": "Todos los cuadrados tienen 4 lados. Esta figura es un cuadrado. ¿Tiene 4 lados?", "opciones": ["Sí", "No", "No se sabe", "Depende"]}', 'Sí'),
('deduccion', 2, '{"enunciado": "Bruno llegó antes que Carla. Carla llegó antes que Dani. ¿Quién llegó primero?", "opciones": ["Bruno", "Carla", "Dani", "No se sabe"]}', 'Bruno'),
('deduccion', 2, '{"enunciado": "Elsa llegó antes que Fede. Fede llegó antes que Gus. ¿Quién llegó último?", "opciones": ["Elsa", "Fede", "Gus", "No se sabe"]}', 'Gus'),
('deduccion', 2, '{"enunciado": "Todos los triángulos tienen 3 lados. Esta figura tiene 3 lados. ¿Es un triángulo seguro?", "opciones": ["Sí", "No", "No se sabe", "Nunca"]}', 'No se sabe'),
('deduccion', 3, '{"enunciado": "Si el semáforo está en rojo, los autos se detienen. Los autos se detuvieron. ¿El semáforo estaba en rojo seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"]}', 'No se sabe'),
('deduccion', 3, '{"enunciado": "Si el semáforo está en rojo, los autos se detienen. El semáforo no está en rojo. ¿Los autos se detienen seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"]}', 'No se sabe'),
('deduccion', 3, '{"enunciado": "Hay 3 cajas: A, B y C. La caja A pesa más que B. La caja B pesa más que C. ¿Cuál pesa menos?", "opciones": ["A", "B", "C", "No se sabe"]}', 'C'),
('deduccion', 4, '{"enunciado": "Todos los Wibbles son Zorbos. Todos los Zorbos son Fyxos. ¿Todos los Wibbles son Fyxos?", "opciones": ["Sí", "No", "No se sabe", "Solo algunos"]}', 'Sí'),
('deduccion', 4, '{"enunciado": "Ningún Tarko es Molvo. Todos los Sindes son Tarkos. ¿Algún Sinde es Molvo?", "opciones": ["Sí", "No", "No se sabe", "Todos"]}', 'No'),
('deduccion', 4, '{"enunciado": "Mora es más rápida que Nico. Nico es más rápido que Oscar. ¿Quién es el más lento?", "opciones": ["Mora", "Nico", "Oscar", "No se sabe"]}', 'Oscar'),
('deduccion', 5, '{"enunciado": "En una fila de 4: Rita está antes que Saúl. Saúl está antes que Tavo. Tavo está antes que Uma. ¿Quién está segundo en la fila?", "opciones": ["Rita", "Saúl", "Tavo", "Uma"]}', 'Saúl'),
('deduccion', 5, '{"enunciado": "Si estudio, apruebo. No aprobé. ¿Estudié?", "opciones": ["Sí", "No", "No se sabe", "Tal vez"]}', 'No'),
('deduccion', 5, '{"enunciado": "Todos los que ganan el torneo reciben una medalla. Beto recibió una medalla. ¿Beto ganó el torneo seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"]}', 'No se sabe'),
('deduccion', 6, '{"enunciado": "Ningún número par es impar. 8 es un número par. ¿8 es impar?", "opciones": ["Sí", "No", "No se sabe", "A veces"]}', 'No'),
('deduccion', 6, '{"enunciado": "Hay 3 cajas apiladas: la verde está arriba de la azul. La azul está arriba de la roja. ¿Cuál está en el medio?", "opciones": ["Verde", "Azul", "Roja", "No se sabe"]}', 'Azul'),
('deduccion', 6, '{"enunciado": "Si Pablo gana, festeja. Pablo festejó. ¿Pablo ganó seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"]}', 'No se sabe'),
('deduccion', 7, '{"enunciado": "Hay 4 corredores. Vico llegó antes que Willy. Willy llegó antes que Xime. Xime llegó antes que Yago. ¿Quién llegó en el tercer puesto?", "opciones": ["Vico", "Willy", "Xime", "Yago"]}', 'Xime'),
('deduccion', 7, '{"enunciado": "Todos los que llegan tarde pierden puntos. Nadie que gana el juego perdió puntos. Kevin llegó tarde. ¿Kevin puede ganar el juego?", "opciones": ["Sí", "No", "No se sabe", "Depende"]}', 'No'),
('deduccion', 7, '{"enunciado": "Si el motor está roto, el auto no arranca. El auto arrancó. ¿El motor está roto?", "opciones": ["Sí", "No", "No se sabe", "Tal vez"]}', 'No'),
('deduccion', 8, '{"enunciado": "Ana, Bibi y Coco tienen mascotas distintas: perro, gato y pez. Ana no tiene el gato. Bibi tiene el perro. ¿Quién tiene el gato?", "opciones": ["Ana", "Bibi", "Coco", "No se sabe"]}', 'Coco'),
('deduccion', 8, '{"enunciado": "Cuatro amigos —Fani, Gustavo, Hugo e Iris— están en fila. Hugo está primero. Fani no está primera ni última. Gustavo está justo después de Fani. Iris no está al lado de Hugo. ¿Quién está última?", "opciones": ["Fani", "Gustavo", "Hugo", "Iris"]}', 'Iris'),
('deduccion', 8, '{"enunciado": "Ana, Bibi y Coco tienen mascotas distintas: perro, gato y pez. Bibi no tiene perro ni pez. Coco no tiene perro. ¿Quién tiene el pez?", "opciones": ["Ana", "Bibi", "Coco", "No se sabe"]}', 'Coco'),
('deduccion', 9, '{"enunciado": "Cinco corredores —J, K, L, M y N— terminaron en puestos distintos, del 1° al 5°. J terminó justo antes que K. L terminó tercero. M terminó después de N pero antes que J. ¿Quién terminó primero?", "opciones": ["J", "K", "L", "M", "N"]}', 'N'),
('deduccion', 9, '{"enunciado": "Cuatro amigas —Eli, Fer, Gia y Hana— juegan distintos deportes: tenis, natación, atletismo y fútbol. Fer juega fútbol. Hana juega natación. Eli no juega tenis. Gia no juega atletismo. ¿Qué deporte juega Eli?", "opciones": ["Tenis", "Natación", "Atletismo", "Fútbol"]}', 'Atletismo'),
('deduccion', 9, '{"enunciado": "Tres corredores —Ori, Pipa y Quique— corrieron una carrera. Ori no llegó primero. Quique no llegó último. Pipa llegó justo después de Ori. ¿Quién llegó primero?", "opciones": ["Ori", "Pipa", "Quique", "No se sabe"]}', 'Quique'),
('deduccion', 10, '{"enunciado": "En una isla, los caballeros siempre dicen la verdad y los pícaros siempre mienten. Ana dice: ''Beto es un pícaro.'' Beto dice: ''Ana y yo somos del mismo tipo.'' ¿Qué es Beto?", "opciones": ["Caballero", "Pícaro", "No se sabe", "Los dos"]}', 'Pícaro'),
('deduccion', 10, '{"enunciado": "En la misma isla, Caro dice, hablando de ella y de Dini: ''Al menos uno de nosotros dos es un pícaro.'' ¿Qué es Caro?", "opciones": ["Caballero", "Pícaro", "No se sabe", "Los dos"]}', 'Caballero'),
('deduccion', 10, '{"enunciado": "Ana, Bibi, Coco y Dana tienen edades distintas: 8, 9, 10 y 11 años. Ana es mayor que Bibi. Bibi es mayor que Coco. Dana es mayor que Coco. Dana no es la mayor de todas. ¿Quién tiene 11 años?", "opciones": ["Ana", "Bibi", "Coco", "Dana"]}', 'Ana');
