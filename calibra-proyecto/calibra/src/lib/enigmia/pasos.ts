import type { LogicPuzzle } from "@/types/database";

// «Cómo se resuelve» de Enigmia (pedido 2026-10-18). Los acertijos generados se
// explican desde su propio enunciado: los de cómputo se vuelven a ejecutar línea por
// línea (mostrando cuánto vale x en cada paso), las series dicen su regla y los de
// memoria muestran la lista. Los de deducción vienen del banco de la base, así que
// llevan su explicación escrita a mano (DEDUCCION, por enunciado).

const ORDINALES = ["primero", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno", "décimo"];

// ─── Cómputo ───

function aplicar(instr: string, x: number): { x: number; nota?: string } {
  const cond = /^si x (es par|> (-?\d+)): (.+); si no: (.+)$/.exec(instr.trim());
  if (cond) {
    const cumple = cond[1] === "es par" ? x % 2 === 0 : x > Number(cond[2]);
    const pregunta = cond[1] === "es par" ? `¿${x} es par?` : `¿${x} > ${cond[2]}?`;
    const r = aplicar(cumple ? cond[3] : cond[4], x);
    return { x: r.x, nota: `${pregunta} ${cumple ? "sí" : "no"} → ${(cumple ? cond[3] : cond[4]).replace("x = ", "")}` };
  }
  const m = /^x = x ([+\-×]) (\d+)$/.exec(instr.trim());
  if (!m) return { x: NaN };
  const k = Number(m[2]);
  return { x: m[1] === "+" ? x + k : m[1] === "-" ? x - k : x * k };
}

function traza(inicial: number, instrucciones: string[]): { pasos: string[]; final: number } {
  let x = inicial;
  const pasos: string[] = [];
  for (const instr of instrucciones) {
    const r = aplicar(instr, x);
    pasos.push(r.nota ? `${r.nota} = ${r.x}` : `${instr.replace("x = ", "")} → ${r.x}`.replace(/^x /, `${x} `));
    x = r.x;
  }
  return { pasos, final: x };
}

function pasosComputo(enunciado: string, respuesta: string): string[] | null {
  const ini = /^x = (-?\d+)\./.exec(enunciado);
  if (!ini) return null;
  const inicial = Number(ini[1]);

  const orden = /En orden: (.+)\. ¿Cuánto vale x al final\?$/.exec(enunciado);
  if (orden) {
    const { pasos, final } = traza(inicial, orden[1].split(". "));
    return [`Empieza en x = ${inicial} y aplica cada línea al valor que va quedando`, ...pasos, `Al final x = ${final}`];
  }

  const anidado = /Repetir (\d+) veces: \{ repetir (\d+) veces: (.+) \}\./.exec(enunciado);
  if (anidado) {
    const [n, m, instr] = [Number(anidado[1]), Number(anidado[2]), anidado[3]];
    const vueltas = n * m;
    const { final } = traza(inicial, Array(vueltas).fill(instr));
    const cuenta = instr.includes("×") ? `x se duplica ${vueltas} veces: ${inicial} × 2^${vueltas} = ${final}` : `${instr.replace("x = ", "")} aplicado ${vueltas} veces desde ${inicial} = ${final}`;
    return [`El bucle de adentro corre ${m} veces por cada vuelta del de afuera: ${n} × ${m} = ${vueltas} veces en total`, cuenta];
  }

  const bucle = /Repetir (\d+) veces: (?:\{ (.+) \}|(x = x [^.]+))\./.exec(enunciado);
  if (bucle) {
    const n = Number(bucle[1]);
    const instr = bucle[2] ?? bucle[3];
    const { pasos, final } = traza(inicial, Array(n).fill(instr));
    const vueltas = pasos.map((p, i) => `Vuelta ${i + 1}: ${p}`);
    return [`Empieza en x = ${inicial}; ${bucle[2] ? "en cada vuelta se vuelve a mirar la condición con el x nuevo" : `se aplica «${instr.replace("x = ", "")}» ${n} veces`}`, ...vueltas, `Al final x = ${final}`];
  }

  const ordenar = /termine en (-?\d+)\?$/.exec(enunciado);
  if (ordenar) {
    const { pasos } = traza(inicial, respuesta.split(" → "));
    return [`Prueba el orden en que el ×2 queda donde hace falta: el ×2 duplica todo lo que se sumó o restó antes`, `Con ${respuesta}: x = ${inicial}, ${pasos.join(", ")} ✓`];
  }
  return null;
}

// ─── Series ───

function pasosSerie(enunciado: string, respuesta: string): string[] | null {
  const m = /^(-?\d+(?:, -?\d+)+), \?$/.exec(enunciado);
  if (!m) return null;
  const s = m[1].split(", ").map(Number);
  const sig = Number(respuesta);
  const d = s.slice(1).map((x, i) => x - s[i]);
  const con = (x: number) => (x >= 0 ? `+${x}` : `−${-x}`);
  const op = (x: number) => (x >= 0 ? `+ ${x}` : `− ${-x}`);
  const ult = s[s.length - 1];
  // Cada regla se acepta solo si de verdad da la respuesta.
  if (d.every((x) => x === d[0]) && ult + d[0] === sig) return [`Diferencias: ${d.map(con).join(", ")}: siempre ${con(d[0])}`, `${ult} ${op(d[0])} = ${sig}`];
  const suma = s[1] - s[0];
  if (s.length === 4 && s[2] === s[1] * 2 && s[3] === s[2] + suma && s[3] * 2 === sig) return [`Se intercalan dos operaciones: ${con(suma)}, ×2, ${con(suma)}, ×2…`, `${s[0]} ${op(suma)} = ${s[1]}, × 2 = ${s[2]}, ${op(suma)} = ${s[3]}, × 2 = ${sig}`];
  if (s[0] !== 0 && s.slice(1).every((x, i) => x === s[i] * (s[1] / s[0])) && ult * (s[1] / s[0]) === sig) {
    const r = s[1] / s[0];
    return [`Cada número es el anterior × ${r}: ${s.join(" → ")}`, `${ult} × ${r} = ${sig}`];
  }
  if (d.length === 3 && d[0] === d[2] && d[0] !== d[1] && ult + d[1] === sig) return [`Diferencias: ${d.map(con).join(", ")}: se alternan ${con(d[0])} y ${con(d[1])}`, `Toca ${con(d[1])}: ${ult} ${op(d[1])} = ${sig}`];
  return null;
}

// ─── Deducción (banco de la base: 0015, 0020 y 0164) ───

const DEDUCCION: Record<string, string[]> = {
  "Todos los perros ladran. Rex es un perro. ¿Rex ladra?": ["Si todos los perros ladran y Rex es uno de ellos, Rex también ladra"],
  "Ana es más alta que Beto. Beto es más alto que Caro. ¿Quién es el más bajo?": ["De más alto a más bajo: Ana > Beto > Caro", "Caro queda al final"],
  "Si llueve, el piso se moja. El piso está mojado. ¿Llovió seguro?": ["«Si llueve, se moja» no dice que sea la única forma de mojarse (alguien pudo regarlo)", "Que el piso esté mojado no alcanza para saber si llovió"],
  "Todos los Bloops son Razzies. Todos los Razzies son Lazzies. ¿Todos los Bloops son Lazzies?": ["Los Bloops están dentro de los Razzies, y los Razzies dentro de los Lazzies", "Entonces los Bloops también están dentro de los Lazzies"],
  "Juan llega antes que María. María llega antes que Pedro. Pedro llega antes que Sol. ¿Quién llega último?": ["Orden de llegada: Juan → María → Pedro → Sol", "Sol es el último"],
  "Ningún reptil tiene pelo. Las serpientes son reptiles. ¿Las serpientes tienen pelo?": ["Las serpientes son reptiles, y ningún reptil tiene pelo", "Entonces no tienen pelo"],
  "Hay 3 cajas: roja, azul y verde. La roja no está primera. La verde está después de la azul. ¿Cuál va primera?": ["La roja no puede ir primera, y la verde tampoco (va después de la azul)", "Solo queda la azul"],
  "Si apruebo el examen, voy a la fiesta. No fui a la fiesta. ¿Aprobé el examen?": ["Si hubiera aprobado, habría ido a la fiesta", "Como no fui, no aprobé (si no pasa lo que se sigue, no pasó lo que lo causaba)"],
  "En una fila de 3, Tomás está a la izquierda de Lucía, y Lucía a la izquierda de Nico. ¿Quién está en el medio?": ["De izquierda a derecha: Tomás, Lucía, Nico", "Lucía está en el medio"],
  "Todos los que estudian aprueban. Marcos aprobó. ¿Marcos estudió seguro?": ["La regla dice que estudiar lleva a aprobar, no que sea la única forma de aprobar", "Que Marcos aprobara no alcanza para saber si estudió"],
  "Todas las rosas son flores. Ese objeto es una rosa. ¿Es una flor?": ["Toda rosa es una flor, y ese objeto es una rosa: es una flor"],
  "Ningún anfibio es reptil. La rana es un anfibio. ¿La rana es un reptil?": ["La rana es un anfibio, y ningún anfibio es reptil: no lo es"],
  "Todos los cuadrados tienen 4 lados. Esta figura es un cuadrado. ¿Tiene 4 lados?": ["Todo cuadrado tiene 4 lados, y esta figura es un cuadrado: tiene 4"],
  "Bruno llegó antes que Carla. Carla llegó antes que Dani. ¿Quién llegó primero?": ["Orden: Bruno → Carla → Dani", "Bruno llegó primero"],
  "Elsa llegó antes que Fede. Fede llegó antes que Gus. ¿Quién llegó último?": ["Orden: Elsa → Fede → Gus", "Gus llegó último"],
  "Todos los triángulos tienen 3 lados. Esta figura tiene 3 lados. ¿Es un triángulo seguro?": ["La regla va de «triángulo» a «3 lados», no al revés", "Con lo que dice el enunciado no se puede asegurar: hay que ir del triángulo a los lados, no de los lados al triángulo"],
  "Si el semáforo está en rojo, los autos se detienen. Los autos se detuvieron. ¿El semáforo estaba en rojo seguro?": ["Los autos pueden detenerse por otras razones (un peatón, un choque)", "Que se detuvieran no prueba que el semáforo estuviera en rojo"],
  "Si el semáforo está en rojo, los autos se detienen. El semáforo no está en rojo. ¿Los autos se detienen seguro?": ["La regla solo dice qué pasa con el rojo; sin rojo no dice nada", "Pueden detenerse o no: no se sabe"],
  "Hay 3 cajas: A, B y C. La caja A pesa más que B. La caja B pesa más que C. ¿Cuál pesa menos?": ["De más pesada a más liviana: A > B > C", "C es la que pesa menos"],
  "Todos los Wibbles son Zorbos. Todos los Zorbos son Fyxos. ¿Todos los Wibbles son Fyxos?": ["Los Wibbles están dentro de los Zorbos, y los Zorbos dentro de los Fyxos", "Entonces todos los Wibbles son Fyxos"],
  "Ningún Tarko es Molvo. Todos los Sindes son Tarkos. ¿Algún Sinde es Molvo?": ["Cada Sinde es un Tarko, y ningún Tarko es Molvo", "Así que ningún Sinde es Molvo"],
  "Mora es más rápida que Nico. Nico es más rápido que Oscar. ¿Quién es el más lento?": ["De más rápido a más lento: Mora > Nico > Oscar", "Oscar es el más lento"],
  "En una fila de 4: Rita está antes que Saúl. Saúl está antes que Tavo. Tavo está antes que Uma. ¿Quién está segundo en la fila?": ["Orden: Rita, Saúl, Tavo, Uma", "Segundo: Saúl"],
  "Si estudio, apruebo. No aprobé. ¿Estudié?": ["Si hubiera estudiado, habría aprobado", "Como no aprobé, no estudié"],
  "Todos los que ganan el torneo reciben una medalla. Beto recibió una medalla. ¿Beto ganó el torneo seguro?": ["Ganar da medalla, pero también pueden recibirla otros (el segundo, el tercero)", "No se sabe si Beto ganó"],
  "Ningún número par es impar. 8 es un número par. ¿8 es impar?": ["8 es par, y ningún par es impar: no lo es"],
  "Hay 3 cajas apiladas: la verde está arriba de la azul. La azul está arriba de la roja. ¿Cuál está en el medio?": ["De arriba a abajo: verde, azul, roja", "En el medio, la azul"],
  "Si Pablo gana, festeja. Pablo festejó. ¿Pablo ganó seguro?": ["Pablo puede festejar por otra cosa", "Que festejara no prueba que ganó"],
  "Hay 4 corredores. Vico llegó antes que Willy. Willy llegó antes que Xime. Xime llegó antes que Yago. ¿Quién llegó en el tercer puesto?": ["Orden de llegada: Vico, Willy, Xime, Yago", "Tercero: Xime"],
  "Todos los que llegan tarde pierden puntos. Nadie que gana el juego perdió puntos. Kevin llegó tarde. ¿Kevin puede ganar el juego?": ["Kevin llegó tarde, así que perdió puntos", "Nadie que perdió puntos gana: Kevin no puede ganar"],
  "Si el motor está roto, el auto no arranca. El auto arrancó. ¿El motor está roto?": ["Si el motor estuviera roto, el auto no arrancaría", "Como arrancó, el motor no está roto"],
  "Ana, Bibi y Coco tienen mascotas distintas: perro, gato y pez. Ana no tiene el gato. Bibi tiene el perro. ¿Quién tiene el gato?": ["Bibi tiene el perro, así que el gato es de Ana o de Coco", "Ana no tiene el gato: es de Coco (y Ana tiene el pez)"],
  "Cuatro amigos —Fani, Gustavo, Hugo e Iris— están en fila. Hugo está primero. Fani no está primera ni última. Gustavo está justo después de Fani. Iris no está al lado de Hugo. ¿Quién está última?": ["Hugo es 1.º. Iris no puede ser 2.ª (estaría al lado de Hugo)", "Fani va 2.ª o 3.ª con Gustavo justo detrás: si Fani fuera 3.ª, Iris quedaría 2.ª, y no puede", "Entonces Hugo, Fani, Gustavo, Iris: Iris es la última"],
  "Ana, Bibi y Coco tienen mascotas distintas: perro, gato y pez. Bibi no tiene perro ni pez. Coco no tiene perro. ¿Quién tiene el pez?": ["Bibi no tiene perro ni pez: tiene el gato", "Coco no tiene perro, así que el perro es de Ana", "A Coco le queda el pez"],
  "Cinco corredores —J, K, L, M y N— terminaron en puestos distintos, del 1° al 5°. J terminó justo antes que K. L terminó tercero. M terminó después de N pero antes que J. ¿Quién terminó primero?": ["Van en orden N, luego M, luego J y K pegados; L ocupa el 3.º", "La única forma: N 1.º, M 2.º, L 3.º, J 4.º, K 5.º", "Primero: N"],
  "Cuatro amigas —Eli, Fer, Gia y Hana— juegan distintos deportes: tenis, natación, atletismo y fútbol. Fer juega fútbol. Hana juega natación. Eli no juega tenis. Gia no juega atletismo. ¿Qué deporte juega Eli?": ["Fútbol es de Fer y natación de Hana: a Eli y Gia les quedan tenis y atletismo", "Eli no juega tenis: juega atletismo (y Gia, tenis)"],
  "Tres corredores —Ori, Pipa y Quique— corrieron una carrera. Ori no llegó primero. Quique no llegó último. Pipa llegó justo después de Ori. ¿Quién llegó primero?": ["Ori no es 1.º y tiene a Pipa justo detrás, así que Ori es 2.º y Pipa 3.º", "Quique llegó primero"],
  "En una isla, los caballeros siempre dicen la verdad y los pícaros siempre mienten. Ana dice: 'Beto es un pícaro.' Beto dice: 'Ana y yo somos del mismo tipo.' ¿Qué es Beto?": ["Supón que Beto es caballero: entonces Ana es como él (caballero), pero Ana dice que Beto es pícaro y mentiría: contradicción", "Beto es pícaro: miente, así que Ana es de otro tipo (caballero) y lo que dice es verdad"],
  "En la misma isla, Caro dice, hablando de ella y de Dini: 'Al menos uno de nosotros dos es un pícaro.' ¿Qué es Caro?": ["Si Caro fuera pícara, la frase sería verdad (ella misma es una pícara), y un pícaro no puede decir la verdad", "Entonces Caro es caballero, y Dini es pícaro"],
  "Ana, Bibi, Coco y Dana tienen edades distintas: 8, 9, 10 y 11 años. Ana es mayor que Bibi. Bibi es mayor que Coco. Dana es mayor que Coco. Dana no es la mayor de todas. ¿Quién tiene 11 años?": ["Todas son mayores que Coco: Coco tiene 8", "La mayor no es Bibi (Ana le gana) ni Dana (lo dice el enunciado): Ana tiene 11"],
};

export function pasosEnigmia(p: LogicPuzzle): string[] {
  const { enunciado, secuencia } = p.contenido;
  const r = p.respuesta;
  if (secuencia && secuencia.length) {
    const i = secuencia.indexOf(r);
    return [`La lista era: ${secuencia.map((x, k) => `${k + 1}. ${x}`).join(", ")}`, `El ${ORDINALES[i] ?? `n.º ${i + 1}`} era ${r}`, "Truco: arma una historia corta con las palabras en orden, o agrúpalas de a tres"];
  }
  const ded = DEDUCCION[enunciado];
  if (ded) return [...ded, `Respuesta: ${r}`];
  return pasosComputo(enunciado, r) ?? pasosSerie(enunciado, r) ?? [`Respuesta: ${r}`];
}
