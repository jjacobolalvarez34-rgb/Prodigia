import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { mulberry32 } from "@/lib/rng";
import {
  generarProblemaNaipia,
  preguntaNaipia,
  conRngSembrado,
  enunciadoCompleto,
  cartasATexto,
  TABLA_SISTEMAS,
  BANDA_NAIPIA,
  MODOS_NAIPIA,
  SISTEMAS_CONTEO,
  VALORES_CARTA,
  NOMBRE_MODO_NAIPIA,
  type ModoNaipia,
  type ProblemaNaipia,
  type SistemaConteo,
  type Carta,
} from "./naipia";

// Verificación "real, nunca aproximada": para cada respuesta, además de que
// el generador la construye por fórmula, se la recalcula acá con un método
// INDEPENDIENTE que nunca llama a las tablas ni a la aritmética del
// generador:
//   - Valores de cada sistema: reescritos a mano desde la definición
//     publicada del sistema (rangos numéricos por comparación), sin usar
//     TABLA_SISTEMAS (que solo se cruza contra esto).
//   - Las cartas se re-parsean desde el TEXTO del enunciado (no desde
//     p.cartas) y se comparan con p.cartas.
//   - Conteo verdadero: redondeo por búsqueda exhaustiva del entero que
//     cumple la regla (no por Math.round/floor).

const PULLS = 250;

// ---------- Valores independientes ----------

function rangoNumerico(v: string): number {
  if (v === "A") return 1;
  if (v === "J") return 11;
  if (v === "Q") return 12;
  if (v === "K") return 13;
  return Number(v);
}

function valorIndependiente(sistema: SistemaConteo, valor: string): number {
  const n = rangoNumerico(valor); // A=1, 2..10, J=11, Q=12, K=13
  const esDiez = n >= 10 && n <= 13;
  const esAs = n === 1;
  if (sistema === "hilo") {
    if (n >= 2 && n <= 6) return 1;
    if (n >= 7 && n <= 9) return 0;
    return -1; // 10, J, Q, K, A
  }
  if (sistema === "ko") {
    if (n >= 2 && n <= 7) return 1;
    if (n === 8 || n === 9) return 0;
    return -1;
  }
  if (sistema === "hiopt2") {
    if (n === 2 || n === 3 || n === 6 || n === 7) return 1;
    if (n === 4 || n === 5) return 2;
    if (esDiez) return -2;
    return 0; // 8, 9, As
  }
  // omega2
  if (n === 2 || n === 3 || n === 7) return 1;
  if (n === 4 || n === 5 || n === 6) return 2;
  if (n === 9) return -1;
  if (esDiez) return -2;
  if (n === 8 || esAs) return 0;
  throw new Error(`carta inesperada ${valor}`);
}

function parsearCartas(texto: string): Carta[] {
  const simbolo: Record<string, Carta["palo"]> = { "♠": "picas", "♥": "corazones", "♦": "diamantes", "♣": "treboles" };
  return texto
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const m = /^(10|[2-9AJQK])([♠♥♦♣])$/.exec(tok);
      if (!m) throw new Error(`carta ilegible: "${tok}"`);
      return { valor: m[1] as Carta["valor"], palo: simbolo[m[2]] };
    });
}

function sumaIndependiente(sistema: SistemaConteo, cartas: Carta[]): number {
  let s = 0;
  for (const c of cartas) s += valorIndependiente(sistema, c.valor);
  return s;
}

// Mazo completo: 4 palos x 13 rangos, contado a mano.
function mazoIndependiente(sistema: SistemaConteo): number {
  let s = 0;
  for (const rango of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) {
    for (let palo = 0; palo < 4; palo++) s += valorIndependiente(sistema, rango);
  }
  return s;
}

// ---------- Redondeo independiente (búsqueda exhaustiva) ----------

type Regla = "cercano" | "truncar" | "abajo";

function reglaDeTexto(texto: string): Regla {
  if (texto.includes("redondeando al entero más cercano")) return "cercano";
  if (texto.includes("truncando hacia cero")) return "truncar";
  if (texto.includes("redondeando hacia abajo")) return "abajo";
  throw new Error(`regla de redondeo no declarada en: ${texto}`);
}

function aplicarRegla(rc: number, mazos: number, regla: Regla): number {
  // Busca el entero k que cumple la regla comparando k*mazos con rc.
  const cociente = rc / mazos; // solo para acotar la búsqueda
  const candidatos: number[] = [];
  for (let k = Math.floor(cociente) - 2; k <= Math.ceil(cociente) + 2; k++) candidatos.push(k);
  if (regla === "abajo") {
    // mayor k con k*mazos <= rc
    return Math.max(...candidatos.filter((k) => k * mazos <= rc + 1e-9));
  }
  if (regla === "truncar") {
    // k de menor |k| tal que |k|*mazos <= |rc| < (|k|+1)*mazos, con signo de rc
    const abs = Math.abs(rc);
    let k = 0;
    while ((k + 1) * mazos <= abs + 1e-9) k++;
    return rc < 0 ? (k === 0 ? 0 : -k) : k;
  }
  // cercano: k que minimiza |rc - k*mazos| (los generadores descartan empates)
  let mejor = candidatos[0];
  let mejorDist = Infinity;
  let empates = 0;
  for (const k of candidatos) {
    const d = Math.abs(rc - k * mazos);
    if (d < mejorDist - 1e-9) {
      mejor = k;
      mejorDist = d;
      empates = 0;
    } else if (Math.abs(d - mejorDist) < 1e-9) {
      empates++;
    }
  }
  if (empates > 0) throw new Error(`empate en redondeo al más cercano: ${rc}/${mazos}`);
  return mejor;
}

function medioMazoMasCercano(restantes: number): number {
  // Busca el múltiplo de 26 cartas (medio mazo) más cercano a `restantes`.
  let mejor = 0;
  let mejorDist = Infinity;
  for (let medios = 0; medios <= 52 * 10; medios++) {
    const d = Math.abs(restantes - medios * 26);
    if (d < mejorDist) {
      mejor = medios;
      mejorDist = d;
    }
    if (medios * 26 > restantes + 26) break;
  }
  return mejor / 2;
}

function num(texto: string): number {
  return Number(texto.replace(",", ".").replace("+", ""));
}

// ---------- Verificación por problema ----------

function verificarProblema(p: ProblemaNaipia, sistemaEsperado: ModoNaipia) {
  expect(p.modo).toBe(sistemaEsperado);
  expect(p.entrada).toBe("numero");
  expect(p.tolerancia).toBe(0);
  expect(Number.isFinite(p.respuesta)).toBe(true);
  expect(Number.isInteger(p.respuesta * 2)).toBe(true); // enteros o medios

  if (p.modo !== "verdadero") {
    const sistema = p.modo;
    // Las cartas del texto coinciden con p.cartas
    const texto = enunciadoCompleto(p);
    const idx = texto.indexOf(" Cartas: ");
    expect(idx).toBeGreaterThan(0);
    const cartasTexto = parsearCartas(texto.slice(idx + " Cartas: ".length));
    expect(cartasTexto).toEqual(p.cartas);
    expect(cartasATexto(p.cartas)).toBe(texto.slice(idx + " Cartas: ".length));

    // Sin cartas repetidas (todas salen de UN mazo de 52)
    const claves = new Set(p.cartas.map((c) => `${c.valor}${c.palo}`));
    expect(claves.size).toBe(p.cartas.length);

    const suma = sumaIndependiente(sistema, cartasTexto);
    if (p.tipo === "corriente") {
      expect(p.respuesta).toBe(suma);
    } else {
      expect(p.tipo).toBe("restante");
      const m = /suma ([+-]?\d+)\./.exec(p.enunciado);
      expect(m).not.toBeNull();
      const totalDeclarado = Number(m![1]);
      expect(totalDeclarado).toBe(mazoIndependiente(sistema));
      expect(p.respuesta).toBe(totalDeclarado - suma);
    }
    return;
  }

  expect(p.cartas).toHaveLength(0);
  const e = p.enunciado;
  if (p.tipo === "verdadero") {
    const m = /conteo corriente es ([+-]?\d+) y quedan (\d+(?:,\d)?) mazos/.exec(e);
    expect(m).not.toBeNull();
    const rc = num(m![1]);
    const mazos = num(m![2]);
    expect(p.respuesta).toBe(aplicarRegla(rc, mazos, reglaDeTexto(e)));
  } else if (p.tipo === "mazos") {
    const m = /conjunto de (\d+) mazos de 52 cartas y ya salieron (\d+) cartas/.exec(e);
    expect(m).not.toBeNull();
    const restantes = Number(m![1]) * 52 - Number(m![2]);
    expect(restantes).toBeGreaterThan(0);
    expect(p.respuesta).toBe(medioMazoMasCercano(restantes));
  } else {
    expect(p.tipo).toBe("verdadero2");
    const m = /conjunto de (\d+) mazos de 52 cartas: el conteo corriente es ([+-]?\d+) y ya salieron (\d+) cartas/.exec(e);
    expect(m).not.toBeNull();
    const restantes = Number(m![1]) * 52 - Number(m![3]);
    const mazos = medioMazoMasCercano(restantes);
    expect(mazos).toBeGreaterThanOrEqual(1);
    expect(p.respuesta).toBe(aplicarRegla(num(m![2]), mazos, reglaDeTexto(e)));
  }
}

// ---------- Lista de términos ajenos al encuadre ----------

const TERMINOS_PROHIBIDOS: RegExp[] = [
  /casino/i,
  /blackjack/i,
  /black\s*jack/i,
  /apuest/i,
  /apostar/i,
  /apostad/i,
  /\bbanca\b/i,
  /banquero/i,
  /croupier|crupier/i,
  /\bdealer\b/i,
  /dinero/i,
  /plata\b/i,
  /ganancia/i,
  /jackpot/i,
  /ruleta/i,
  /tragamonedas|tragaperras/i,
  /p[oó]ker/i,
  /gambl/i,
  /wager/i,
  /\bbet(s|ting)?\b/i,
  /\bmoney\b/i,
  /\bcash\b/i,
  /bankroll/i,
  /house edge/i,
  /ventaja de la casa/i,
  /jugar contra/i,
  /play against the (house|dealer)/i,
  /\bwin(ning)? (money|cash)\b/i,
  /ganar (dinero|plata)/i,
  /\bfichas?\b/i,
  /\bchips\b/i,
  /\bslot/i,
  /loter[ií]a/i,
  /\bcasa de juego/i,
];

function terminosEncontrados(texto: string): string[] {
  return TERMINOS_PROHIBIDOS.filter((re) => re.test(texto)).map((re) => re.source);
}

function recolectarCadenas(valor: unknown, salida: string[] = []): string[] {
  if (typeof valor === "string") salida.push(valor);
  else if (Array.isArray(valor)) valor.forEach((v) => recolectarCadenas(v, salida));
  else if (valor && typeof valor === "object") Object.values(valor).forEach((v) => recolectarCadenas(v, salida));
  return salida;
}

function claves(valor: unknown, prefijo = "", salida: string[] = []): string[] {
  if (valor && typeof valor === "object" && !Array.isArray(valor)) {
    for (const [k, v] of Object.entries(valor)) claves(v, prefijo ? `${prefijo}.${k}` : k, salida);
  } else {
    salida.push(prefijo);
  }
  return salida;
}

// ---------- Tests ----------

describe("Naipia — tablas de valores (datos)", () => {
  it("cada sistema cubre los 13 rangos y coincide con la definición independiente", () => {
    for (const s of SISTEMAS_CONTEO) {
      for (const r of VALORES_CARTA) {
        expect(TABLA_SISTEMAS[s][r], `${s} ${r}`).toBe(valorIndependiente(s, r));
      }
    }
  });

  it("valores publicados: Hi-Lo, KO, Hi-Opt II y Omega II", () => {
    expect(TABLA_SISTEMAS.hilo["6"]).toBe(1);
    expect(TABLA_SISTEMAS.hilo["7"]).toBe(0);
    expect(TABLA_SISTEMAS.hilo.A).toBe(-1);
    expect(TABLA_SISTEMAS.ko["7"]).toBe(1);
    expect(TABLA_SISTEMAS.ko["9"]).toBe(0);
    expect(TABLA_SISTEMAS.hiopt2["4"]).toBe(2);
    expect(TABLA_SISTEMAS.hiopt2["9"]).toBe(0);
    expect(TABLA_SISTEMAS.hiopt2.A).toBe(0);
    expect(TABLA_SISTEMAS.hiopt2.K).toBe(-2);
    expect(TABLA_SISTEMAS.omega2["9"]).toBe(-1);
    expect(TABLA_SISTEMAS.omega2["6"]).toBe(2);
    expect(TABLA_SISTEMAS.omega2.A).toBe(0);
    expect(TABLA_SISTEMAS.omega2["10"]).toBe(-2);
  });

  it("mazo completo: 0 en los balanceados, +4 en KO", () => {
    expect(mazoIndependiente("hilo")).toBe(0);
    expect(mazoIndependiente("hiopt2")).toBe(0);
    expect(mazoIndependiente("omega2")).toBe(0);
    expect(mazoIndependiente("ko")).toBe(4);
  });
});

describe("Naipia — respuestas recalculadas por método independiente", () => {
  for (const modo of MODOS_NAIPIA) {
    for (let nivel = 1; nivel <= 10; nivel++) {
      it(`${modo} nivel ${nivel}: ${PULLS} pulls`, () => {
        for (let i = 0; i < PULLS; i++) {
          verificarProblema(generarProblemaNaipia(modo, nivel), modo);
        }
      });
    }
  }
});

describe("Naipia — bandas de nivel y cancelación en pares", () => {
  const largoMedio = (modo: ModoNaipia, nivel: number) => {
    let total = 0;
    for (let i = 0; i < 200; i++) total += generarProblemaNaipia(modo, nivel).cartas.length;
    return total / 200;
  };

  it("el largo de la secuencia crece con el nivel dentro de la banda", () => {
    for (const s of SISTEMAS_CONTEO) {
      const { min, max } = BANDA_NAIPIA[s];
      expect(largoMedio(s, max)).toBeGreaterThan(largoMedio(s, min) + 2);
    }
  });

  it("fuera de la banda el nivel se recorta (mismo largo que en el borde)", () => {
    expect(Math.abs(largoMedio("hilo", 10) - largoMedio("hilo", 3))).toBeLessThan(0.6);
    expect(Math.abs(largoMedio("omega2", 1) - largoMedio("omega2", 7))).toBeLessThan(0.6);
  });

  it("al empezar la banda siempre hay al menos un par contiguo que se cancela", () => {
    for (const s of SISTEMAS_CONTEO) {
      for (let i = 0; i < 200; i++) {
        const p = generarProblemaNaipia(s, BANDA_NAIPIA[s].min);
        const vals = p.cartas.map((c) => valorIndependiente(s, c.valor));
        const hayPar = vals.some((v, k) => k > 0 && v !== 0 && v + vals[k - 1] === 0);
        expect(hayPar, `${s}: ${cartasATexto(p.cartas)}`).toBe(true);
      }
    }
  });

  it("KO usa el +4 del mazo completo en las preguntas de cartas restantes", () => {
    let vistas = 0;
    for (let i = 0; i < 400; i++) {
      const p = generarProblemaNaipia("ko", 5);
      if (p.tipo === "restante") {
        vistas++;
        expect(p.enunciado).toContain("suma +4");
      }
    }
    expect(vistas).toBeGreaterThan(20);
  });

  it("el conteo verdadero mezcla las 3 formas en el nivel 10", () => {
    const tipos = new Set<string>();
    for (let i = 0; i < 300; i++) tipos.add(generarProblemaNaipia("verdadero", 10).tipo);
    expect([...tipos].sort()).toEqual(["mazos", "verdadero", "verdadero2"]);
  });

  it("las 3 reglas de redondeo aparecen declaradas en el enunciado", () => {
    const reglas = new Set<Regla>();
    for (let i = 0; i < 300; i++) {
      const p = generarProblemaNaipia("verdadero", 10);
      if (p.tipo !== "mazos") reglas.add(reglaDeTexto(p.enunciado));
    }
    expect(reglas.size).toBe(3);
  });
});

describe("Naipia — reto diario", () => {
  it("preguntaNaipia devuelve opciones válidas y es determinista por semilla", () => {
    for (let s = 1; s <= 200; s++) {
      const a = preguntaNaipia(mulberry32(s));
      const b = preguntaNaipia(mulberry32(s));
      expect(a).toEqual(b);
      expect(a.mundo).toBe("naipia");
      expect(a.opciones).toHaveLength(4);
      expect(new Set(a.opciones).size).toBe(4);
      expect(a.opciones).toContain(a.respuesta);
      expect(a.enunciado).toContain("Cartas: ");
    }
  });

  it("conRngSembrado restaura el generador global", () => {
    const a = conRngSembrado(mulberry32(7), () => generarProblemaNaipia("hilo", 2));
    const b = conRngSembrado(mulberry32(7), () => generarProblemaNaipia("hilo", 2));
    expect(a).toEqual(b);
  });
});

describe("Naipia — encuadre: cero lenguaje ajeno al deporte mental", () => {
  it("el texto generado (muchos pulls, todos los modos y niveles) no contiene términos prohibidos", () => {
    const textos = new Set<string>();
    for (const modo of MODOS_NAIPIA) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 60; i++) {
          const p = generarProblemaNaipia(modo, nivel);
          textos.add(p.enunciado);
          textos.add(enunciadoCompleto(p));
        }
      }
    }
    for (let s = 1; s <= 200; s++) {
      const q = preguntaNaipia(mulberry32(s));
      textos.add(q.enunciado);
      q.opciones.forEach((o) => textos.add(o));
    }
    for (const modo of MODOS_NAIPIA) textos.add(NOMBRE_MODO_NAIPIA[modo]);
    const malos = [...textos].filter((t) => terminosEncontrados(t).length > 0);
    expect(malos).toEqual([]);
  });

  it("el detector funciona (sanidad: detecta términos prohibidos conocidos)", () => {
    expect(terminosEncontrados("Jugar en un casino")).not.toEqual([]);
    expect(terminosEncontrados("hacer una apuesta")).not.toEqual([]);
    expect(terminosEncontrados("Vas a ganar dinero")).not.toEqual([]);
    expect(terminosEncontrados("conteo corriente y mazos restantes")).toEqual([]);
  });

  const raiz = path.resolve(__dirname, "../../..");
  for (const idioma of ["es", "en"]) {
    it(`namespace Naipia de messages/${idioma}.json sin términos prohibidos`, () => {
      const json = JSON.parse(readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
      const cadenas = recolectarCadenas(json.Naipia);
      expect(cadenas.length).toBeGreaterThan(0);
      const malas = cadenas.filter((c) => terminosEncontrados(c).length > 0);
      expect(malas).toEqual([]);
    });
  }

  it("paridad de claves es/en en el namespace Naipia", () => {
    const es = JSON.parse(readFileSync(path.join(raiz, "messages", "es.json"), "utf8")).Naipia;
    const en = JSON.parse(readFileSync(path.join(raiz, "messages", "en.json"), "utf8")).Naipia;
    expect(claves(es).sort()).toEqual(claves(en).sort());
  });

  it("la migración de lecciones (0192_naipia_contenido.sql) no contiene términos prohibidos", () => {
    const ruta = path.join(raiz, "supabase", "migrations", "0192_naipia_contenido.sql");
    expect(existsSync(ruta)).toBe(true);
    const sql = readFileSync(ruta, "utf8");
    expect(sql.length).toBeGreaterThan(1000);
    expect(terminosEncontrados(sql)).toEqual([]);
  });
});
