// Generador del modo 5 "Lectura de gráficos". Los DATOS del gráfico se
// generan por construcción (valores múltiplos de la guía del eje, extremos
// únicos donde se pregunta por el mayor/menor, atípicos estrictamente
// fuera de 1.5·IQR) y la RESPUESTA se deriva siempre de esos mismos datos
// — nunca de una regla aparte. El SVG lo dibuja src/components/estadistica.

import type { EjeValores, GraficoEstadistica, ProblemaEstadistica, TipoProblemaEstadistica } from "./tipos";
import { armarOpciones, azar, clamp, elegir, elegirPonderado, mezclar, randomInt, suma } from "./util";

type Bruto = Omit<Extract<ProblemaEstadistica, { entrada: "opciones" }>, "modo"> | Omit<Extract<ProblemaEstadistica, { entrada: "numero" }>, "modo">;

function opciones(tipo: TipoProblemaEstadistica, enunciado: string, grafico: GraficoEstadistica, correcta: string, distractores: string[], params?: Record<string, number | string>): Bruto {
  return { entrada: "opciones", enunciado, grafico, opciones: armarOpciones(correcta, distractores), respuesta: correcta, detalle: { tipo, params } };
}

function numero(tipo: TipoProblemaEstadistica, enunciado: string, grafico: GraficoEstadistica, respuesta: number, params?: Record<string, number | string>): Bruto {
  return { entrada: "numero", enunciado, grafico, respuesta, tolerancia: Number.isInteger(respuesta) ? 0 : 0.005, detalle: { tipo, params } };
}

// ---------- Temas ----------

interface TemaBarras {
  titulo: string;
  etiquetaEje: string;
  categorias: string[];
}

const TEMAS_BARRAS: TemaBarras[] = [
  { titulo: "Libros prestados por mes", etiquetaEje: "Libros", categorias: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"] },
  { titulo: "Estudiantes por taller", etiquetaEje: "Estudiantes", categorias: ["Ajedrez", "Teatro", "Robótica", "Música", "Dibujo"] },
  { titulo: "Ventas por sucursal", etiquetaEje: "Unidades", categorias: ["Norte", "Sur", "Este", "Oeste", "Centro"] },
  { titulo: "Visitas por día", etiquetaEje: "Visitas", categorias: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] },
  { titulo: "Votos por fruta favorita", etiquetaEje: "Votos", categorias: ["Manzana", "Banana", "Uva", "Pera", "Mango"] },
];

const TEMAS_LINEAS: TemaBarras[] = [
  { titulo: "Temperatura media mensual", etiquetaEje: "°C", categorias: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"] },
  { titulo: "Usuarios activos por semana", etiquetaEje: "Usuarios", categorias: ["S1", "S2", "S3", "S4", "S5", "S6"] },
  { titulo: "Ingresos por año", etiquetaEje: "Miles de $", categorias: ["2019", "2020", "2021", "2022", "2023", "2024"] },
];

// ---------- Ejes ----------

// Valores múltiplos de tick (nivel bajo) o de tick/2 (niveles altos).
function valorEnEje(nMax: number, tick: number, mitad: boolean): number {
  const paso = mitad ? tick / 2 : tick;
  return paso * randomInt(Math.ceil(tick / paso), Math.round((nMax * tick) / paso));
}

// n valores con extremo máximo y mínimo ÚNICOS (para "¿cuál es el mayor?").
function valoresConExtremosUnicos(n: number, tick: number, nTicks: number, mitad: boolean): number[] {
  for (let intento = 0; intento < 200; intento++) {
    const v = Array.from({ length: n }, () => valorEnEje(nTicks, tick, mitad));
    const max = Math.max(...v);
    const min = Math.min(...v);
    if (v.filter((x) => x === max).length === 1 && v.filter((x) => x === min).length === 1) return v;
  }
  // Fallback determinista: valores estrictamente crecientes, barajados.
  const paso = mitad ? tick / 2 : tick;
  return mezclar(Array.from({ length: n }, (_, i) => paso * (i + 2)));
}

function ejeDe(maxValor: number, tick: number, etiqueta: string): EjeValores {
  return { min: 0, max: Math.ceil((maxValor + 1e-9) / tick) * tick, tick, etiqueta };
}

// ---------- Barras ----------

function graficoBarras(nivel: number): { grafico: Extract<GraficoEstadistica, { tipo: "barras" }>; tema: TemaBarras } {
  const tema = elegir(TEMAS_BARRAS);
  const n = nivel >= 6 ? randomInt(5, tema.categorias.length) : randomInt(4, 5);
  const categorias = tema.categorias.slice(0, Math.min(n, tema.categorias.length));
  const tick = elegir([10, 20]);
  const mitad = nivel >= 6;
  const nTicks = randomInt(4, 7);
  const valores = valoresConExtremosUnicos(categorias.length, tick, nTicks, mitad);
  return {
    tema,
    grafico: { tipo: "barras", titulo: tema.titulo, categorias, valores, eje: ejeDe(Math.max(...valores), tick, tema.etiquetaEje) },
  };
}

function preguntaBarras(nivel: number): Bruto {
  const { grafico, tema } = graficoBarras(nivel);
  const { categorias, valores } = grafico;
  const tipos: Array<readonly ["valor" | "mayor" | "menor" | "diferencia" | "total", number]> = [
    ["valor", 5],
    ["mayor", 5],
    ["menor", 5],
    ["diferencia", 5],
    ["total", 6],
  ];
  const tipo = elegirPonderado(tipos, nivel);
  const idx = randomInt(0, categorias.length - 1);
  if (tipo === "valor") {
    return numero("grafico_valor", `En el gráfico, ¿cuál es el valor de la barra «${categorias[idx]}»? (${tema.etiquetaEje})`, grafico, valores[idx]);
  }
  if (tipo === "mayor" || tipo === "menor") {
    const objetivo = tipo === "mayor" ? Math.max(...valores) : Math.min(...valores);
    const correcta = categorias[valores.indexOf(objetivo)];
    const distractores = mezclar(categorias.filter((c) => c !== correcta)).slice(0, 3);
    return opciones(tipo === "mayor" ? "grafico_mayor" : "grafico_menor", `¿Qué categoría tiene el ${tipo === "mayor" ? "mayor" : "menor"} valor en el gráfico?`, grafico, correcta, distractores);
  }
  if (tipo === "diferencia") {
    let j = randomInt(0, categorias.length - 1);
    while (j === idx || valores[j] === valores[idx]) j = (j + 1) % categorias.length;
    const [a, b] = valores[idx] > valores[j] ? [idx, j] : [j, idx];
    return numero("grafico_diferencia", `¿Cuántas unidades más tiene «${categorias[a]}» que «${categorias[b]}»? (${tema.etiquetaEje})`, grafico, valores[a] - valores[b]);
  }
  return numero("grafico_total", `¿Cuál es el total de todas las barras del gráfico? (${tema.etiquetaEje})`, grafico, suma(valores));
}

// ---------- Líneas ----------

type Tendencia = "Crece" | "Decrece" | "Sube y luego baja" | "Se mantiene casi constante";
const TENDENCIAS: Tendencia[] = ["Crece", "Decrece", "Sube y luego baja", "Se mantiene casi constante"];

function serieConTendencia(n: number, tick: number, tendencia: Tendencia): number[] {
  const paso = tick / 2;
  if (tendencia === "Se mantiene casi constante") {
    const base = paso * randomInt(4, 10);
    // Solo dos niveles vecinos: rango total <= tick/2.
    return Array.from({ length: n }, () => base + (azar() < 0.5 ? 0 : paso));
  }
  if (tendencia === "Crece" || tendencia === "Decrece") {
    let v = paso * randomInt(1, 3);
    const s = [v];
    for (let i = 1; i < n; i++) {
      v += paso * randomInt(1, 3);
      s.push(v);
    }
    return tendencia === "Crece" ? s : s.reverse();
  }
  // Sube y luego baja: pico interior estricto.
  const pico = randomInt(2, n - 3);
  let v = paso * randomInt(1, 3);
  const s: number[] = [v];
  for (let i = 1; i < n; i++) {
    v += (i <= pico ? 1 : -1) * paso * randomInt(1, 3);
    s.push(v);
  }
  const minimo = Math.min(...s);
  const desplazamiento = paso * randomInt(1, 2);
  return s.map((x) => x - minimo + desplazamiento);
}

function clasificarTendencia(v: readonly number[], tick: number): Tendencia {
  let sube = true;
  let baja = true;
  for (let i = 1; i < v.length; i++) {
    if (!(v[i] > v[i - 1])) sube = false;
    if (!(v[i] < v[i - 1])) baja = false;
  }
  if (sube) return "Crece";
  if (baja) return "Decrece";
  if (Math.max(...v) - Math.min(...v) <= tick / 2) return "Se mantiene casi constante";
  return "Sube y luego baja";
}

function preguntaLineas(nivel: number): Bruto {
  const tema = elegir(TEMAS_LINEAS);
  const n = randomInt(5, tema.categorias.length);
  const etiquetas = tema.categorias.slice(0, n);
  const tick = elegir([10, 20]);
  const tipos: Array<readonly ["valor" | "maximo" | "tendencia" | "aumento", number]> = [
    ["valor", 6],
    ["maximo", 6],
    ["tendencia", 6],
    ["aumento", 8],
  ];
  const tipo = elegirPonderado(tipos, nivel);

  let valores: number[];
  if (tipo === "tendencia") {
    valores = serieConTendencia(n, tick, elegir(TENDENCIAS));
    // La definición de "constante" depende del eje: se reclasifica con
    // los datos finales y la respuesta sale SOLO de esa clasificación.
  } else if (tipo === "aumento") {
    // Aumento consecutivo máximo único (y positivo).
    valores = [];
    for (let intento = 0; intento < 200; intento++) {
      const v = Array.from({ length: n }, () => valorEnEje(6, tick, true));
      const difs = v.slice(1).map((x, i) => x - v[i]);
      const mx = Math.max(...difs);
      if (mx > 0 && difs.filter((d) => d === mx).length === 1) {
        valores = v;
        break;
      }
    }
    if (valores.length === 0) valores = Array.from({ length: n }, (_, i) => (tick / 2) * (i === 2 ? 8 : i + 1));
  } else {
    valores = valoresConExtremosUnicos(n, tick, 6, true);
  }
  const grafico: GraficoEstadistica = { tipo: "lineas", titulo: tema.titulo, etiquetas, valores, eje: ejeDe(Math.max(...valores), tick, tema.etiquetaEje) };

  if (tipo === "valor") {
    const i = randomInt(0, n - 1);
    return numero("grafico_valor", `En el gráfico de líneas, ¿cuál es el valor en «${etiquetas[i]}»? (${tema.etiquetaEje})`, grafico, valores[i]);
  }
  if (tipo === "maximo") {
    const correcta = etiquetas[valores.indexOf(Math.max(...valores))];
    return opciones("grafico_mayor", "¿En qué punto de la serie se alcanza el valor máximo?", grafico, correcta, mezclar(etiquetas.filter((e) => e !== correcta)).slice(0, 3));
  }
  if (tipo === "tendencia") {
    const correcta = clasificarTendencia(valores, tick);
    return opciones(
      "grafico_tendencia",
      "¿Cuál describe mejor la tendencia general de la serie? (Crece: cada punto supera al anterior; Decrece: cada punto es menor que el anterior; casi constante: la serie varía como máximo media unidad de la guía.)",
      grafico,
      correcta,
      TENDENCIAS.filter((t) => t !== correcta)
    );
  }
  const difs = valores.slice(1).map((x, i) => x - valores[i]);
  const iMax = difs.indexOf(Math.max(...difs));
  const par = (i: number) => `Entre ${etiquetas[i]} y ${etiquetas[i + 1]}`;
  const correcta = par(iMax);
  const otros = mezclar(difs.map((_, i) => i).filter((i) => i !== iMax)).slice(0, 3).map(par);
  return opciones("grafico_mayor_aumento", "¿En qué tramo (entre dos puntos consecutivos) hubo el mayor aumento?", grafico, correcta, otros);
}

// ---------- Histograma ----------

function preguntaHistograma(nivel: number): Bruto {
  const ancho = elegir([5, 10]);
  const inicio = ancho * randomInt(0, 4);
  const clases = randomInt(5, 6);
  const limites = Array.from({ length: clases + 1 }, (_, i) => inicio + i * ancho);
  let frecuencias: number[] = [];
  for (let intento = 0; intento < 200; intento++) {
    const f = Array.from({ length: clases }, () => randomInt(1, 14));
    const mx = Math.max(...f);
    if (f.filter((x) => x === mx).length === 1) {
      frecuencias = f;
      break;
    }
  }
  if (frecuencias.length === 0) frecuencias = [2, 5, 9, 12, 7, 3].slice(0, clases);
  const tick = 2;
  const grafico: GraficoEstadistica = {
    tipo: "histograma",
    titulo: "Distribución de puntajes",
    limites,
    frecuencias,
    eje: ejeDe(Math.max(...frecuencias), tick, "Frecuencia"),
    etiquetaX: "Puntaje",
  };
  const nota = "Cada clase incluye su límite inferior y no el superior.";
  const tipo = elegirPonderado(
    [
      ["total", 7],
      ["modal", 7],
      ["acumulado", 7],
    ] as const,
    clamp(nivel, 7, 9)
  );
  if (tipo === "total") {
    return numero("histograma_total", `Según el histograma, ¿cuántos datos hay en total? ${nota}`, grafico, suma(frecuencias));
  }
  if (tipo === "modal") {
    const label = (i: number) => `${limites[i]}–${limites[i + 1]}`;
    const iMax = frecuencias.indexOf(Math.max(...frecuencias));
    const otros = mezclar(frecuencias.map((_, i) => i).filter((i) => i !== iMax)).slice(0, 3).map(label);
    return opciones("histograma_clase_modal", `¿Cuál es la clase modal (la de mayor frecuencia)? ${nota}`, grafico, label(iMax), otros);
  }
  const k = randomInt(1, clases - 1);
  return numero(
    "histograma_acumulado",
    `¿Cuántos datos son menores que ${limites[k]}? ${nota}`,
    grafico,
    suma(frecuencias.slice(0, k)),
    { limite: limites[k] }
  );
}

// ---------- Boxplot ----------

export function construirBoxplot(nivel: number): Extract<GraficoEstadistica, { tipo: "boxplot" }> {
  const paso = nivel >= 8 ? 5 : 10;
  const tick = 10;
  for (let intento = 0; intento < 400; intento++) {
    const q1 = paso * randomInt(Math.ceil(40 / paso), Math.floor(70 / paso));
    const iqr = paso * randomInt(Math.ceil(20 / paso), Math.floor(40 / paso));
    const q3 = q1 + iqr;
    const medianaPaso = randomInt(1, iqr / paso - 1);
    const mediana = q1 + medianaPaso * paso;
    const cerca = 1.5 * iqr;
    const wInf = paso * randomInt(1, Math.floor(cerca / paso));
    const wSup = paso * randomInt(1, Math.floor(cerca / paso));
    // Bigotes dentro de la cerca (<=) y por lo menos un paso de largo.
    if (wInf > cerca || wSup > cerca) continue;
    const min = q1 - wInf;
    if (min < 0) continue;
    const max = q3 + wSup;
    const atipicos: number[] = [];
    const k = elegir([0, 0, 1, 1, 2]);
    for (let i = 0; i < k; i++) {
      const arriba = azar() < 0.6;
      const fuera = paso * randomInt(1, 3);
      // Estrictamente fuera de la cerca.
      const v = arriba
        ? Math.floor((q3 + cerca) / paso) * paso + paso + (fuera - paso)
        : Math.ceil((q1 - cerca) / paso) * paso - paso - (fuera - paso);
      if (v < 0 || atipicos.includes(v)) continue;
      atipicos.push(v);
    }
    atipicos.sort((a, b) => a - b);
    if (atipicos.some((v) => v >= q1 - cerca && v <= q3 + cerca)) continue;
    const todos = [min, max, ...atipicos];
    return {
      tipo: "boxplot",
      titulo: "Tiempos de resolución (minutos)",
      min,
      q1,
      mediana,
      q3,
      max,
      atipicos,
      eje: { min: 0, max: Math.ceil((Math.max(...todos) + 1e-9) / tick) * tick + tick, tick, etiqueta: "Minutos" },
    };
  }
  return {
    tipo: "boxplot",
    titulo: "Tiempos de resolución (minutos)",
    min: 30,
    q1: 50,
    mediana: 60,
    q3: 70,
    max: 90,
    atipicos: [],
    eje: { min: 0, max: 100, tick, etiqueta: "Minutos" },
  };
}

function preguntaBoxplot(nivel: number): Bruto {
  const g = construirBoxplot(nivel);
  const tipo = elegirPonderado(
    [
      ["mediana", 7],
      ["q3", 7],
      ["iqr", 8],
      ["atipicos", 8],
      ["porcentaje", 8],
    ] as const,
    nivel
  );
  if (tipo === "mediana") return numero("boxplot_valor", "En el diagrama de caja, ¿cuánto vale la mediana?", g, g.mediana, { estadistico: "mediana" });
  if (tipo === "q3") return numero("boxplot_valor", "En el diagrama de caja, ¿cuánto vale el tercer cuartil (Q3)?", g, g.q3, { estadistico: "q3" });
  if (tipo === "iqr") return numero("boxplot_iqr", "En el diagrama de caja, ¿cuánto vale el rango intercuartílico (Q3 − Q1)?", g, g.q3 - g.q1);
  if (tipo === "atipicos") {
    return numero("boxplot_atipicos", "¿Cuántos valores atípicos (puntos aislados fuera de los bigotes) muestra el diagrama de caja?", g, g.atipicos.length);
  }
  return opciones(
    "boxplot_porcentaje",
    "¿Qué porcentaje aproximado de los datos queda dentro de la caja (entre Q1 y Q3)?",
    g,
    "50%",
    ["25%", "75%", "100%"]
  );
}

// ---------- Gráfico engañoso por escala ----------

function preguntaEngano(nivel: number): Bruto {
  const A = 100 * randomInt(1, 5);
  const pct = elegir([2, 3, 4, 5, 6, 8, 10]);
  const d = (pct * A) / 100;
  const B = A + d;
  // Eje truncado: arranca k·d por debajo de A (k = 1 o 2), NO en 0.
  const k = randomInt(1, 2);
  const eje: EjeValores = { min: A - k * d, max: B + d, tick: d, etiqueta: "Ventas" };
  const nombres = elegir([
    ["Año 1", "Año 2"],
    ["Producto A", "Producto B"],
    ["Marca X", "Marca Y"],
  ] as const);
  const grafico: GraficoEstadistica = { tipo: "barras", titulo: "Comparación de ventas", categorias: [nombres[0], nombres[1]], valores: [A, B], eje };
  const tipo = elegirPonderado(
    [
      ["escala", 8],
      ["aparente", 9],
      ["porcentaje", 9],
    ] as const,
    nivel
  );
  if (tipo === "escala") {
    return opciones(
      "engano_escala",
      `Observa el eje vertical. ¿Qué hace que este gráfico exagere la diferencia entre «${nombres[0]}» y «${nombres[1]}»?`,
      grafico,
      "El eje vertical no empieza en 0",
      ["Las barras tienen anchos distintos", "El gráfico no tiene título", "Hay más de dos barras"]
    );
  }
  if (tipo === "aparente") {
    const aparente = (B - eje.min) / (A - eje.min);
    return numero(
      "engano_aparente",
      `Mirando solo la altura de las barras, ¿cuántas veces más alta se ve «${nombres[1]}» que «${nombres[0]}»? (mide desde la base dibujada, que es ${eje.min}.)`,
      grafico,
      aparente,
      { base: eje.min }
    );
  }
  return numero(
    "engano_porcentaje",
    `Según los valores del eje, ¿en qué porcentaje es realmente mayor «${nombres[1]}» que «${nombres[0]}»?`,
    grafico,
    pct,
    { valorA: A, valorB: B }
  );
}

// Toma el nivel 1-10 ya saturado a la banda 5-9 del modo.
export function generarGrafico(nivelEfectivo: number): Bruto {
  const tipos: Array<readonly ["barras" | "lineas" | "histograma" | "boxplot" | "engano", number]> = [
    ["barras", 5],
    ["lineas", 6],
    ["histograma", 7],
    ["boxplot", 7],
    ["engano", 8],
  ];
  const tipo = elegirPonderado(tipos, nivelEfectivo);
  if (tipo === "barras") return preguntaBarras(nivelEfectivo);
  if (tipo === "lineas") return preguntaLineas(nivelEfectivo);
  if (tipo === "histograma") return preguntaHistograma(nivelEfectivo);
  if (tipo === "boxplot") return preguntaBoxplot(nivelEfectivo);
  return preguntaEngano(nivelEfectivo);
}
