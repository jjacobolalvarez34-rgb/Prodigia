// Fase 1 ("Geometría básica" — activación de Numeria): mismo espíritu
// que el resto de /practica — técnicas MENTALES, no enseñar geometría
// desde cero. 4 sub-temas independientes, mismo patrón de calibración
// por sub-tema que fracciones/decimales/potencias/algebra (Fase 2).

export type TipoGeometria = "perimetro" | "area" | "angulos" | "ternas";

export interface ProblemaGeometria {
  tipo: TipoGeometria;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
  // «Cómo se resuelve» para el repaso de errores (repaso.ts).
  pasos?: string[];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

// Auditoría de variedad 2026-10-23 (docs/AUDITORIA_PREGUNTAS.md): las ternas
// tenían 6 preguntas posibles en nivel 1-2; perímetro y área eran IGUALES en
// niveles 7-8 y 9-10 (y ángulos en 5-10), así que subir de nivel no cambiaba
// nada; el triángulo de perímetro podía tener lados imposibles (3, 3, 10) y el
// área del círculo pedía decimales (en la app, Geometría no tiene tecla de coma).
// Ahora cada banda suma formas propias y todas las respuestas son enteras.

const azar = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

const POLIGONOS: Record<number, string> = { 5: "pentágono", 6: "hexágono", 7: "heptágono", 8: "octágono", 9: "eneágono", 10: "decágono", 12: "dodecágono" };

// ---------- Perímetro: figuras simples -> inversos -> compuestas ----------
function perimetroCuadrado(maxLado: number): ProblemaGeometria {
  const lado = randomInt(2, maxLado);
  return { tipo: "perimetro", enunciado: `Perímetro de un cuadrado de lado ${lado}`, respuesta: lado * 4, tolerancia: 0, pasos: [`El cuadrado tiene 4 lados iguales: ${lado} × 4 = ${lado * 4}`] };
}

function perimetroRectangulo(maxLado: number): ProblemaGeometria {
  const base = randomInt(3, maxLado);
  const altura = randomInt(2, Math.max(2, base - 1));
  return {
    tipo: "perimetro",
    enunciado: `Perímetro de un rectángulo de ${base} × ${altura}`,
    respuesta: 2 * (base + altura),
    tolerancia: 0,
    pasos: [`Suma un largo y un ancho: ${base} + ${altura} = ${base + altura}`, `El rectángulo tiene dos de cada uno: ${base + altura} × 2 = ${2 * (base + altura)}`],
  };
}

function perimetroTriangulo(maxLado: number): ProblemaGeometria {
  // Lados que forman un triángulo de verdad: cada uno menor que la suma de los otros dos.
  for (;;) {
    const [a, b, c] = [randomInt(2, maxLado), randomInt(2, maxLado), randomInt(2, maxLado)];
    if (a + b <= c || a + c <= b || b + c <= a) continue;
    return { tipo: "perimetro", enunciado: `Perímetro de un triángulo de lados ${a}, ${b} y ${c}`, respuesta: a + b + c, tolerancia: 0, pasos: [`Suma los tres lados: ${a} + ${b} + ${c} = ${a + b + c}`] };
  }
}

function perimetroPoligono(lados: readonly number[], maxLado: number): ProblemaGeometria {
  const n = azar(lados);
  const lado = randomInt(2, maxLado);
  return {
    tipo: "perimetro",
    enunciado: `Perímetro de un ${POLIGONOS[n]} regular de lado ${lado}`,
    respuesta: n * lado,
    tolerancia: 0,
    pasos: [`Un ${POLIGONOS[n]} tiene ${n} lados iguales`, `${lado} × ${n} = ${n * lado}`],
  };
}

function ladoDesdePerimetro(maxLado: number): ProblemaGeometria {
  const n = azar([3, 4, 5, 6, 8, 10]);
  const lado = randomInt(3, maxLado);
  const nombre = n === 3 ? "triángulo equilátero" : n === 4 ? "cuadrado" : `${POLIGONOS[n]} regular`;
  return {
    tipo: "perimetro",
    enunciado: `Un ${nombre} tiene un perímetro de ${n * lado}. ¿Cuánto mide cada lado?`,
    respuesta: lado,
    tolerancia: 0,
    pasos: [`Tiene ${n} lados iguales: reparte el perímetro entre ${n}`, `${n * lado} ÷ ${n} = ${lado}`],
  };
}

function alturaDesdePerimetro(maxLado: number): ProblemaGeometria {
  const base = randomInt(4, maxLado);
  const altura = randomInt(2, maxLado);
  const p = 2 * (base + altura);
  return {
    tipo: "perimetro",
    enunciado: `Un rectángulo tiene perímetro ${p} y base ${base}. ¿Cuánto mide su altura?`,
    respuesta: altura,
    tolerancia: 0,
    pasos: [`La mitad del perímetro es base + altura: ${p} ÷ 2 = ${p / 2}`, `${p / 2} − ${base} = ${altura}`],
  };
}

// Figura en L: el truco mental es que su perímetro es IDÉNTICO al del rectángulo
// que la contiene (los segmentos que se "meten" hacia adentro se cancelan).
function perimetroL(min: number, max: number): ProblemaGeometria {
  const base = randomInt(min, max);
  const altura = randomInt(Math.max(4, min - 2), max - 2);
  return {
    tipo: "perimetro",
    enunciado: `Una figura en L cabe justo en un rectángulo de ${base} × ${altura} (le falta un rectángulo en una esquina). ¿Cuál es su perímetro?`,
    respuesta: 2 * (base + altura),
    tolerancia: 0,
    pasos: [
      `Los lados que entran en la esquina recortada miden lo mismo que los que faltan: el perímetro es el del rectángulo de ${base} × ${altura}`,
      `(${base} + ${altura}) × 2 = ${2 * (base + altura)}`,
    ],
  };
}

function perimetroDesdeArea(): ProblemaGeometria {
  const base = randomInt(4, 25);
  const altura = randomInt(3, 20);
  const area = base * altura;
  return {
    tipo: "perimetro",
    enunciado: `Un rectángulo tiene área ${area} y base ${base}. ¿Cuál es su perímetro?`,
    respuesta: 2 * (base + altura),
    tolerancia: 0,
    pasos: [`Primero la altura: ${area} ÷ ${base} = ${altura}`, `Perímetro: (${base} + ${altura}) × 2 = ${2 * (base + altura)}`],
  };
}

function circunferenciaEnPi(maxRadio: number): ProblemaGeometria {
  const radio = randomInt(2, maxRadio);
  const conDiametro = Math.random() < 0.5;
  return {
    tipo: "perimetro",
    enunciado: conDiametro
      ? `Una circunferencia de diámetro ${2 * radio} mide k·π. ¿Cuánto vale k?`
      : `Una circunferencia de radio ${radio} mide k·π. ¿Cuánto vale k?`,
    respuesta: 2 * radio,
    tolerancia: 0,
    pasos: [`La longitud de la circunferencia es 2 × π × radio = diámetro × π`, `${conDiametro ? `El diámetro es ${2 * radio}` : `2 × ${radio} = ${2 * radio}`}: mide ${2 * radio}π`],
  };
}

function generarPerimetro(nivel: number): ProblemaGeometria {
  switch (banda(nivel)) {
    case 0:
      return azar([() => perimetroCuadrado(12), () => perimetroRectangulo(12), () => perimetroTriangulo(10)])();
    case 1:
      return azar([() => perimetroCuadrado(25), () => perimetroRectangulo(20), () => perimetroTriangulo(15), () => perimetroPoligono([5, 6], 12)])();
    case 2:
      return azar([() => ladoDesdePerimetro(20), () => alturaDesdePerimetro(20), () => perimetroPoligono([5, 6, 7, 8], 20), () => perimetroTriangulo(30)])();
    case 3:
      return azar([() => perimetroL(8, 20), () => ladoDesdePerimetro(40), () => alturaDesdePerimetro(40), () => circunferenciaEnPi(15)])();
    default:
      return azar([() => perimetroL(15, 45), () => perimetroDesdeArea(), () => perimetroPoligono([7, 8, 9, 10, 12], 45), () => circunferenciaEnPi(40)])();
  }
}

// ---------- Área: rectángulo/triángulo -> círculo, trapecio -> compuestas ----------
function areaRectangulo(maxLado: number): ProblemaGeometria {
  const base = randomInt(2, maxLado);
  const altura = randomInt(2, maxLado);
  return { tipo: "area", enunciado: `Área de un rectángulo de ${base} × ${altura}`, respuesta: base * altura, tolerancia: 0, pasos: [`Área del rectángulo = base × altura`, `${base} × ${altura} = ${base * altura}`] };
}

function areaCuadrado(maxLado: number): ProblemaGeometria {
  const lado = randomInt(2, maxLado);
  return { tipo: "area", enunciado: `Área de un cuadrado de lado ${lado}`, respuesta: lado * lado, tolerancia: 0, pasos: [`Área del cuadrado = lado × lado`, `${lado} × ${lado} = ${lado * lado}`] };
}

function areaTriangulo(maxBase: number, maxAltura: number): ProblemaGeometria {
  const base = randomInt(1, maxBase / 2) * 2; // par, para que /2 dé entero
  const altura = randomInt(2, maxAltura);
  return {
    tipo: "area",
    enunciado: `Área de un triángulo de base ${base} y altura ${altura}`,
    respuesta: (base * altura) / 2,
    tolerancia: 0,
    pasos: [`Área del triángulo = base × altura ÷ 2`, `${base} × ${altura} = ${base * altura}`, `${base * altura} ÷ 2 = ${(base * altura) / 2}`],
  };
}

// Área del círculo «en unidades de π»: entera y sin aproximar π.
function areaCirculoEnPi(maxRadio: number): ProblemaGeometria {
  const radio = randomInt(2, maxRadio);
  const conDiametro = Math.random() < 0.4;
  return {
    tipo: "area",
    enunciado: conDiametro ? `El área de un círculo de diámetro ${2 * radio} es k·π. ¿Cuánto vale k?` : `El área de un círculo de radio ${radio} es k·π. ¿Cuánto vale k?`,
    respuesta: radio * radio,
    tolerancia: 0,
    pasos: [...(conDiametro ? [`El radio es la mitad del diámetro: ${2 * radio} ÷ 2 = ${radio}`] : []), `Área del círculo = π × radio²`, `${radio}² = ${radio * radio}: el área es ${radio * radio}π`],
  };
}

// Con π ≈ 3,14 y redondeo al entero declarado (se evitan los radios que caen justo en ,5).
function areaCirculoAproximada(maxRadio: number): ProblemaGeometria {
  for (;;) {
    const radio = randomInt(2, maxRadio);
    const centesimas = 314 * radio * radio;
    if (centesimas % 100 === 50) continue;
    const respuesta = Math.round(centesimas / 100);
    const exacta = (centesimas / 100).toLocaleString("es", { maximumFractionDigits: 2, useGrouping: false });
    return {
      tipo: "area",
      enunciado: `Área de un círculo de radio ${radio} (usa π ≈ 3,14 y redondea al entero)`,
      respuesta,
      tolerancia: 0,
      pasos: [`Área del círculo = π × radio²`, `${radio}² = ${radio * radio}`, `3,14 × ${radio * radio} = ${exacta}, que redondeado es ${respuesta}`],
    };
  }
}

function areaTrapecio(max: number): ProblemaGeometria {
  for (;;) {
    const mayor = randomInt(4, max);
    const menor = randomInt(2, mayor - 1);
    const altura = randomInt(2, max);
    if (((mayor + menor) * altura) % 2 !== 0) continue;
    const r = ((mayor + menor) * altura) / 2;
    return {
      tipo: "area",
      enunciado: `Área de un trapecio de bases ${mayor} y ${menor} y altura ${altura}`,
      respuesta: r,
      tolerancia: 0,
      pasos: [`Área del trapecio = (base mayor + base menor) × altura ÷ 2`, `(${mayor} + ${menor}) × ${altura} = ${(mayor + menor) * altura}`, `${(mayor + menor) * altura} ÷ 2 = ${r}`],
    };
  }
}

function areaRombo(max: number): ProblemaGeometria {
  const D = randomInt(2, max / 2) * 2;
  const d = randomInt(2, D);
  return {
    tipo: "area",
    enunciado: `Área de un rombo de diagonales ${D} y ${d}`,
    respuesta: (D * d) / 2,
    tolerancia: 0,
    pasos: [`Área del rombo = diagonal mayor × diagonal menor ÷ 2`, `${D} × ${d} = ${D * d}`, `${D * d} ÷ 2 = ${(D * d) / 2}`],
  };
}

// Compuesta: rectángulo grande menos un rectángulo chico (esquina faltante) —
// "divide en partes simples", el mismo truco que la lección de Aprender.
function areaCompuesta(min: number, max: number): ProblemaGeometria {
  const baseGrande = randomInt(min, max);
  const alturaGrande = randomInt(Math.max(6, min - 2), max - 4);
  const baseChica = randomInt(2, Math.floor(baseGrande / 2));
  const alturaChica = randomInt(2, Math.floor(alturaGrande / 2));
  return {
    tipo: "area",
    enunciado: `Un rectángulo de ${baseGrande} × ${alturaGrande} tiene un rectángulo de ${baseChica} × ${alturaChica} recortado en una esquina. ¿Cuál es el área que queda?`,
    respuesta: baseGrande * alturaGrande - baseChica * alturaChica,
    tolerancia: 0,
    pasos: [
      `Área del rectángulo grande: ${baseGrande} × ${alturaGrande} = ${baseGrande * alturaGrande}`,
      `Área del recorte: ${baseChica} × ${alturaChica} = ${baseChica * alturaChica}`,
      `Resta: ${baseGrande * alturaGrande} − ${baseChica * alturaChica} = ${baseGrande * alturaGrande - baseChica * alturaChica}`,
    ],
  };
}

// Al revés: dada el área, un lado.
function ladoDesdeArea(): ProblemaGeometria {
  const triangulo = Math.random() < 0.5;
  const base = triangulo ? randomInt(2, 15) * 2 : randomInt(3, 25);
  const altura = randomInt(3, 25);
  const area = triangulo ? (base * altura) / 2 : base * altura;
  return {
    tipo: "area",
    enunciado: `Un ${triangulo ? "triángulo" : "rectángulo"} tiene área ${area} y base ${base}. ¿Cuánto mide su altura?`,
    respuesta: altura,
    tolerancia: 0,
    pasos: triangulo
      ? [`Área = base × altura ÷ 2, así que altura = área × 2 ÷ base`, `${area} × 2 = ${area * 2}`, `${area * 2} ÷ ${base} = ${altura}`]
      : [`Área = base × altura, así que altura = área ÷ base`, `${area} ÷ ${base} = ${altura}`],
  };
}

function generarArea(nivel: number): ProblemaGeometria {
  switch (banda(nivel)) {
    case 0:
      return azar([() => areaRectangulo(10), () => areaCuadrado(12), () => areaTriangulo(12, 10)])();
    case 1:
      return azar([() => areaRectangulo(15), () => areaTriangulo(20, 15), () => areaCirculoEnPi(10), () => areaCuadrado(20)])();
    case 2:
      return azar([() => areaTrapecio(16), () => areaRombo(20), () => areaCirculoEnPi(15), () => areaTriangulo(30, 20)])();
    case 3:
      return azar([() => areaCompuesta(10, 18), () => areaCirculoAproximada(10), () => areaTrapecio(25), () => ladoDesdeArea()])();
    default:
      return azar([() => areaCompuesta(15, 40), () => areaCirculoAproximada(20), () => ladoDesdeArea(), () => areaRombo(40)])();
  }
}

// ---------- Ángulos: complementarios -> triángulos -> polígonos ----------
function complementoOSuplemento(paso: number): ProblemaGeometria {
  const suplementario = Math.random() < 0.5;
  const total = suplementario ? 180 : 90;
  const angulo = randomInt(1, Math.floor((total - 1) / paso)) * paso;
  return {
    tipo: "angulos",
    enunciado: `Dos ángulos son ${suplementario ? "suplementarios" : "complementarios"} (suman ${total}°). Uno mide ${angulo}°. ¿Cuánto mide el otro?`,
    respuesta: total - angulo,
    tolerancia: 0,
    pasos: [`Los ángulos ${suplementario ? "suplementarios" : "complementarios"} suman ${total}°`, `${total}° − ${angulo}° = ${total - angulo}°`],
  };
}

function tercerAngulo(paso: number): ProblemaGeometria {
  const a = randomInt(1, Math.floor(150 / paso)) * paso;
  const b = randomInt(1, Math.floor((175 - a) / paso)) * paso;
  return {
    tipo: "angulos",
    enunciado: `Un triángulo tiene dos ángulos de ${a}° y ${b}°. ¿Cuánto mide el tercero?`,
    respuesta: 180 - a - b,
    tolerancia: 0,
    pasos: [`Los ángulos de un triángulo suman 180°`, `180° − ${a}° − ${b}° = ${180 - a - b}°`],
  };
}

function isosceles(): ProblemaGeometria {
  const verticePar = randomInt(5, 85) * 2; // par: los otros dos dan entero
  const base = (180 - verticePar) / 2;
  return {
    tipo: "angulos",
    enunciado: `En un triángulo isósceles, el ángulo distinto mide ${verticePar}°. ¿Cuánto mide cada uno de los otros dos?`,
    respuesta: base,
    tolerancia: 0,
    pasos: [`Los otros dos son iguales y entre los tres suman 180°`, `(180° − ${verticePar}°) ÷ 2 = ${base}°`],
  };
}

function anguloExterior(): ProblemaGeometria {
  const a = randomInt(15, 100);
  const b = randomInt(15, 160 - a);
  return {
    tipo: "angulos",
    enunciado: `Dos ángulos interiores de un triángulo miden ${a}° y ${b}°. ¿Cuánto mide el ángulo exterior junto al tercer vértice?`,
    respuesta: a + b,
    tolerancia: 0,
    pasos: [`Un ángulo exterior es igual a la suma de los dos interiores que no lo tocan`, `${a}° + ${b}° = ${a + b}°`],
  };
}

function alrededorDeUnPunto(): ProblemaGeometria {
  const a = randomInt(20, 200);
  const b = randomInt(20, 340 - a - 20);
  return {
    tipo: "angulos",
    enunciado: `Tres ángulos alrededor de un punto completan la vuelta. Dos miden ${a}° y ${b}°. ¿Cuánto mide el tercero?`,
    respuesta: 360 - a - b,
    tolerancia: 0,
    pasos: [`Una vuelta completa son 360°`, `360° − ${a}° − ${b}° = ${360 - a - b}°`],
  };
}

function poligonoRegular(): ProblemaGeometria {
  const n = azar([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
  const forma = randomInt(0, 2);
  const suma = (n - 2) * 180;
  const nombre = `un polígono regular de ${n} lados`;
  if (forma === 0) {
    return { tipo: "angulos", enunciado: `¿Cuánto mide cada ángulo interior de ${nombre}?`, respuesta: suma / n, tolerancia: 0, pasos: [`Los ángulos interiores suman (${n} − 2) × 180° = ${suma}°`, `Son ${n} iguales: ${suma}° ÷ ${n} = ${suma / n}°`] };
  }
  if (forma === 1) {
    return { tipo: "angulos", enunciado: `¿Cuánto mide cada ángulo exterior de ${nombre}?`, respuesta: 360 / n, tolerancia: 0, pasos: [`Los ángulos exteriores de cualquier polígono suman 360°`, `360° ÷ ${n} = ${360 / n}°`] };
  }
  const m = randomInt(5, 20);
  return { tipo: "angulos", enunciado: `¿Cuánto suman los ángulos interiores de un polígono de ${m} lados?`, respuesta: (m - 2) * 180, tolerancia: 0, pasos: [`Se divide en ${m} − 2 = ${m - 2} triángulos de 180°`, `${m - 2} × 180° = ${(m - 2) * 180}°`] };
}

function generarAngulos(nivel: number): ProblemaGeometria {
  switch (banda(nivel)) {
    case 0:
      return complementoOSuplemento(5);
    case 1:
      return azar([() => complementoOSuplemento(1), () => tercerAngulo(10)])();
    case 2:
      return azar([() => complementoOSuplemento(1), () => tercerAngulo(5), () => isosceles()])();
    case 3:
      return azar([() => tercerAngulo(1), () => isosceles(), () => anguloExterior(), () => alrededorDeUnPunto()])();
    default:
      return azar([() => poligonoRegular(), () => anguloExterior(), () => alrededorDeUnPunto()])();
  }
}

// ---------- Ternas pitagóricas: reconocer, no calcular raíz ----------
// En orden de dificultad: cada banda suma ternas nuevas y factores más grandes.
const TERNAS_BASE: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];
const TERNAS_POR_BANDA = [2, 3, 4, 5, 6];
const FACTOR_TERNA: [number, number][] = [
  [1, 5],
  [1, 6],
  [2, 8],
  [2, 10],
  [3, 12],
];

// Ternas pitagóricas: se reconoce la terna base y su múltiplo, sin sacar raíces.
function pasosTerna(a: number, b: number, c: number, factor: number, queMide: string, original: number, valor: number): string[] {
  const terna = `${a}, ${b} y ${c} forman un triángulo rectángulo porque ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} = ${c}²`;
  if (factor === 1) return [terna, `Así que ${queMide} ${valor}`];
  return [`Estos lados son los de la terna ${a}, ${b}, ${c} multiplicados por ${factor}`, terna, `Entonces ${queMide} ${original} × ${factor} = ${valor}`];
}

function generarTernas(nivel: number): ProblemaGeometria {
  const i = banda(nivel);
  const [a0, b0, c0] = TERNAS_BASE[randomInt(0, TERNAS_POR_BANDA[i] - 1)];
  const factor = randomInt(FACTOR_TERNA[i][0], FACTOR_TERNA[i][1]);
  // Los catetos en cualquier orden: «6 y 8» y «8 y 6» son la misma terna vista distinto.
  const [p0, q0] = Math.random() < 0.5 ? [a0, b0] : [b0, a0];
  const [cateto1, cateto2, hipotenusa] = [p0 * factor, q0 * factor, c0 * factor];

  // Desde el nivel 1 a veces se pide un cateto (la terna «al revés»), más seguido arriba.
  const pedirCateto = Math.random() < [0.3, 0.35, 0.4, 0.5, 0.5][i];
  if (pedirCateto) {
    return {
      tipo: "ternas",
      enunciado: `Un triángulo rectángulo tiene un cateto de ${cateto1} y la hipotenusa mide ${hipotenusa}. ¿Cuánto mide el otro cateto?`,
      respuesta: cateto2,
      tolerancia: 0,
      pasos: pasosTerna(a0, b0, c0, factor, "el otro cateto mide", q0, cateto2),
    };
  }
  return {
    tipo: "ternas",
    enunciado: `Un triángulo rectángulo tiene catetos de ${cateto1} y ${cateto2}. ¿Cuánto mide la hipotenusa?`,
    respuesta: hipotenusa,
    tolerancia: 0,
    pasos: pasosTerna(a0, b0, c0, factor, "la hipotenusa mide", c0, hipotenusa),
  };
}

const GENERADORES: Record<TipoGeometria, (nivel: number) => ProblemaGeometria> = {
  perimetro: generarPerimetro,
  area: generarArea,
  angulos: generarAngulos,
  ternas: generarTernas,
};

export const TIPOS_GEOMETRIA: TipoGeometria[] = ["perimetro", "area", "angulos", "ternas"];

export function generarProblemaGeometria(
  nivelPorTipo: Record<TipoGeometria, number>,
  tipos: TipoGeometria[] = TIPOS_GEOMETRIA
): ProblemaGeometria {
  const disponibles = tipos.length > 0 ? tipos : TIPOS_GEOMETRIA;
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivelPorTipo[tipo]);
}
