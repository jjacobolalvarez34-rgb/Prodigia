import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_NAIPIA } from "./registro";
import { LECCIONES_NAIPIA } from "@/lib/naipia/lecciones";
import type { VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";

// Tests de RENDER de los visuales de Naipia y del dispatcher genérico, con
// react-dom/server (sin navegador): cada visual de las 13 lecciones reales
// se dibuja sin excepciones (también con mensajes faltantes -> falla) y
// contiene los valores esperados, recalculados con tablas INDEPENDIENTES.

const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Naipia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Naipia: MENSAJES[idioma].Naipia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_NAIPIA })
    )
  );
}

const MENOS = "−";
const RANGOS_TEXTO: Record<string, string> = { A: "as", J: "jota", Q: "reina", K: "rey" };
const nombreRango = (r: string) => RANGOS_TEXTO[r] ?? r;

const TABLA: Record<string, Record<string, number>> = {
  hilo: { "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1, A: -1 },
  ko: { "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1, A: -1 },
  hiopt2: { "2": 1, "3": 1, "4": 2, "5": 2, "6": 1, "7": 1, "8": 0, "9": 0, "10": -2, J: -2, Q: -2, K: -2, A: 0 },
  omega2: { "2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1, "8": 0, "9": -1, "10": -2, J: -2, Q: -2, K: -2, A: 0 },
};
const ORDEN = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const signo = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `${MENOS}${Math.abs(n)}` : "0");
const conteo = (s: string, cartas: string[]) => cartas.reduce((a, c) => a + TABLA[s][c.slice(0, -1)], 0);

describe("visuales de Naipia: las 13 lecciones reales se dibujan sin romper", () => {
  it("cada visual de cada lección se renderiza (animado y estático, es y en) con su alternativa textual", () => {
    let total = 0;
    for (const l of LECCIONES_NAIPIA) {
      for (const v of l.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${l.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(200);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{8,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Naipia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button"); // controles
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(100);
  }, 60_000);

  it("cero lenguaje ajeno al encuadre en el HTML generado", () => {
    const prohibidos = /casino|apuest|blackjack|dinero|ganancia|ruleta|p[oó]ker|\bfichas?\b|gambl|\bbet\b|\bmoney\b/i;
    for (const l of LECCIONES_NAIPIA) {
      for (const v of l.visuales) expect(html({ ...v, estatico: true })).not.toMatch(prohibidos);
    }
  }, 30_000);
});

describe("naipia.valores: tabla animada de valores", () => {
  it("Hi-Lo contiene los tres grupos con +1, 0 y −1 (el signo menos tipográfico)", () => {
    const salida = html({ tipo: "naipia.valores", sistema: "hilo", estatico: true });
    expect(salida).toContain("+1");
    expect(salida).toContain(`${MENOS}1`);
    expect(salida).toMatch(/>0</);
    expect(salida).toContain("Las cartas 2, 3, 4, 5, 6 valen +1");
    expect(salida).toContain("Las cartas 7, 8, 9 valen 0");
    expect(salida).toContain(`Las cartas 10, jota, reina, rey, as valen ${MENOS}1`);
    // 13 cartas dibujadas (una por rango), cada una con su aria-label.
    expect((salida.match(/role="img"/g) ?? []).length).toBe(13);
  });

  it("los cuatro sistemas: cada grupo del sistema (tabla independiente) aparece con su valor", () => {
    for (const s of ["hilo", "ko", "hiopt2", "omega2"]) {
      const salida = html({ tipo: "naipia.valores", sistema: s, estatico: true });
      const grupos = new Map<number, string[]>();
      for (const r of ORDEN) grupos.set(TABLA[s][r], [...(grupos.get(TABLA[s][r]) ?? []), r]);
      for (const [valor, rangos] of grupos) {
        const orden = ORDEN.filter((r) => rangos.includes(r));
        expect(salida, `${s} ${valor}`).toContain(`valen ${signo(valor)}`);
        // Los rangos del grupo aparecen juntos (en orden de lectura: 2..10, J, Q, K, A).
        expect(salida, `${s} ${valor}`).toContain(orden.map(nombreRango).join(", ") + ` valen ${signo(valor)}`);
      }
      expect((salida.match(/role="img"/g) ?? []).length).toBe(13);
    }
  });

  it("enfatizar atenúa los demás grupos", () => {
    const salida = html({ tipo: "naipia.valores", sistema: "hilo", enfatizar: 0, estatico: true });
    expect((salida.match(/opacity:0\.35/g) ?? []).length).toBe(2);
  });
});

describe("naipia.conteo: conteo corriente animado", () => {
  const casos: [string, string[]][] = [
    ["hilo", "7♠ K♥ 3♦ 10♣ 2♠ 5♥ A♦ 9♣ 6♠ J♥".split(" ")],
    ["ko", "7♠ K♥ 4♦ 9♣ 7♥ 2♠ A♦ 8♣ 6♠ 3♥".split(" ")],
    ["hiopt2", "4♠ 10♥ 6♦ A♣ 3♠ K♦ 5♥ 8♣ 2♠".split(" ")],
    ["omega2", "6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣".split(" ")],
  ];

  it("el conteo final mostrado coincide con el cálculo independiente (y con los valores conocidos)", () => {
    const esperados = [0, 4, 3, 1];
    casos.forEach(([s, cartas], i) => {
      const final = conteo(s, cartas);
      expect(final).toBe(esperados[i]);
      const salida = html({ tipo: "naipia.conteo", sistema: s, cartas, estatico: true });
      expect(salida).toContain(`Conteo final: ${signo(final)}`);
      expect(salida).toMatch(new RegExp(`data-marcador[^>]*>${signo(final).replace("+", "\\+")}<`));
      // Una carta dibujada por carta y el valor de cada una en el texto alternativo.
      expect((salida.match(/role="img"/g) ?? []).length).toBe(cartas.length);
      let acum = 0;
      for (const c of cartas) {
        acum += TABLA[s][c.slice(0, -1)];
        expect(salida).toContain(`vale ${signo(TABLA[s][c.slice(0, -1)])}; el conteo queda en ${signo(acum)}`);
      }
    });
  });

  it("por bloques: muestra el valor de cada bloque y el mismo conteo final", () => {
    const cartas = "4♠ 6♥ 2♦ K♣ 8♠ A♥ 3♣ 10♦ 5♠".split(" ");
    const salida = html({ tipo: "naipia.conteo", sistema: "hilo", cartas, bloque: 3, estatico: true });
    expect(salida).toContain("Bloque 1: +3");
    expect(salida).toContain(`Bloque 2: ${MENOS}2`);
    expect(salida).toContain("Bloque 3: +1");
    expect(salida).toContain("Conteo final: +2");
  });

  it("animado (sin estatico): arranca sin cartas visibles y el marcador en 0", () => {
    const salida = html({ tipo: "naipia.conteo", sistema: "hilo", cartas: ["7♠", "K♥"] });
    expect(salida).toMatch(/data-marcador[^>]*>0</);
    expect(salida).toContain("opacity:0");
  });
});

describe("naipia.cancelacion", () => {
  it("el ejemplo de pares (Hi-Lo): 3 pares, 2 neutras y nada sobra; el conteo es 0", () => {
    const cartas = "K♠ 3♥ 9♦ 5♣ A♠ 2♦ 7♥ Q♣".split(" ");
    expect(conteo("hilo", cartas)).toBe(0);
    const salida = html({ tipo: "naipia.cancelacion", sistema: "hilo", cartas, estatico: true });
    expect((salida.match(/se cancelan: suman 0/g) ?? []).length).toBe(3);
    expect(salida).toContain("Las cartas neutras no se cuentan");
    expect(salida).toContain("No sobra ninguna carta: el conteo es 0");
  });

  it("Hi-Opt II: los +1 sin pareja quedan y su suma es el conteo", () => {
    const cartas = "5♠ Q♦ 4♥ J♣ 6♠ 3♦ 8♥ 7♣".split(" ");
    const esperado = conteo("hiopt2", cartas);
    expect(esperado).toBe(3);
    const salida = html({ tipo: "naipia.cancelacion", sistema: "hiopt2", cartas, estatico: true });
    expect(salida).toContain(`Su suma es ${signo(esperado)}`);
    expect(salida).toContain(`Conteo final: ${signo(esperado)}`);
  });
});

describe("naipia.mazo", () => {
  it("Hi-Lo suma 0 (balanceado) y KO suma +4 (no balanceado)", () => {
    expect(html({ tipo: "naipia.mazo", sistema: "hilo", estatico: true })).toContain("Sistema balanceado: el mazo completo suma 0");
    const ko = html({ tipo: "naipia.mazo", sistema: "ko", estatico: true });
    expect(ko).toContain("Sistema no balanceado: el mazo completo suma +4");
    expect(ko).toContain("24 cartas");
    expect(ko).toContain("24 × +1 = +24");
    expect(ko).toContain(`20 × ${MENOS}1 = ${MENOS}20`);
  });

  it("Hi-Opt II y Omega II suman 0", () => {
    for (const s of ["hiopt2", "omega2"]) {
      expect(html({ tipo: "naipia.mazo", sistema: s, estatico: true })).toContain("el mazo completo suma 0");
    }
  });
});

describe("naipia.verdadero", () => {
  it("+10, conjunto de 4 mazos y 96 cartas jugadas: quedan 112, 2 mazos, verdadero +5 (más cercano)", () => {
    const salida = html({ tipo: "naipia.verdadero", conteo: 10, mazosTotales: 4, cartasJugadas: 96, regla: "cercano", estatico: true });
    expect(salida).toContain("Salieron 96 cartas y quedan 112");
    expect(salida).toContain("Al medio mazo más cercano: 2");
    expect(salida).toContain("+10 ÷ 2 = 5");
    expect(salida).toContain("Regla de redondeo: al entero más cercano");
    expect(salida).toContain("El conteo verdadero es +5");
  });

  it("−7 entre 3 mazos hacia abajo da −3; +11 entre 2,5 mazos al más cercano da +4", () => {
    const a = html({ tipo: "naipia.verdadero", conteo: -7, mazosRestantes: 3, regla: "abajo", estatico: true });
    expect(a).toContain(`${MENOS}7 ÷ 3 ≈ ${MENOS}2,33`);
    expect(a).toContain("hacia abajo (al entero menor)");
    expect(a).toContain(`El conteo verdadero es ${MENOS}3`);
    const b = html({ tipo: "naipia.verdadero", conteo: 11, mazosRestantes: 2.5, regla: "cercano", estatico: true });
    expect(b).toContain("+11 ÷ 2,5 = 4,4");
    expect(b).toContain("El conteo verdadero es +4");
  });

  it("en inglés usa el punto decimal", () => {
    const b = html({ tipo: "naipia.verdadero", conteo: 11, mazosRestantes: 2.5, regla: "cercano", estatico: true }, "en");
    expect(b).toContain("+11 ÷ 2.5 = 4.4");
    expect(b).toContain("Rounding rule: to the nearest integer");
  });
});

describe("naipia.comparar", () => {
  it("los totales de cada sistema coinciden con el cálculo independiente", () => {
    const cartas = "6♠ K♥ 4♦ 9♣ 2♥ A♠ 5♦ 7♣".split(" ");
    const sistemas = ["hilo", "ko", "hiopt2", "omega2"];
    const esperado = sistemas.map((s) => conteo(s, cartas));
    expect(esperado).toEqual([2, 3, 5, 5]);
    const salida = html({ tipo: "naipia.comparar", sistemas, cartas, estatico: true });
    expect(salida).toContain(`Conteo final: Hi-Lo ${signo(2)}, KO ${signo(3)}, Hi-Opt II ${signo(5)}, Omega II ${signo(5)}`);
  });
});

describe("cuadros: primitivo genérico", () => {
  it("dibuja todos los cuadros (fórmulas con KaTeX) y los controles Anterior / Siguiente / Repetir / Pausa", () => {
    const visual = {
      tipo: "cuadros",
      cuadros: [
        { texto: "$\\sqrt{7}$: $3 \\cdot 3 = 9$ pasa de 7." },
        { texto: "Prueba 2,6.", formula: "2{,}6^2 = 6{,}76", resaltar: "$\\approx 2{,}6$" },
        { texto: "Tercer cuadro." },
      ],
      estatico: true,
    };
    const salida = html(visual);
    expect(salida).toContain("katex");
    expect(salida).toContain("Tercer cuadro.");
    for (const boton of ["Anterior", "Siguiente", "Repetir"]) expect(salida).toContain(boton);
    expect(salida).toContain("3 de 3");
    // Animado: aparece solo el primer cuadro visible y hay Pausa/Reproducir.
    const animado = html({ ...visual, estatico: false });
    expect(animado).toContain("1 de 3");
    expect(animado).toContain("Reproducir");
    expect((animado.match(/<li[ >]/g) ?? []).length).toBeGreaterThanOrEqual(1 + 3); // 1 visible + 3 de la alternativa
  });
});

describe("dispatcher: tolerancia a datos malos", () => {
  const vacio = (v: unknown) => expect(html(v)).toBe("");

  it("tipo desconocido, sin tipo, no-objeto o tipo heredado de Object.prototype: se omite", () => {
    vacio({ tipo: "mundo-inexistente.algo" });
    vacio({ tipo: "constructor" });
    vacio({ tipo: "__proto__" });
    vacio({ tipo: "toString" });
    vacio({});
    vacio(null);
    vacio("naipia.valores");
    vacio(42);
    vacio({ tipo: "naipia.valores", sistema: "hilo", despuesDePaso: -1 });
  });

  it("props inválidas de un tipo conocido: el visual se omite sin lanzar", () => {
    vacio({ tipo: "naipia.valores", sistema: "verdadero" });
    vacio({ tipo: "naipia.valores" });
    vacio({ tipo: "naipia.conteo", sistema: "hilo", cartas: ["7♠", "??"] });
    vacio({ tipo: "naipia.conteo", sistema: "hilo", cartas: [] });
    vacio({ tipo: "naipia.conteo", sistema: "hilo", cartas: "7♠ K♥" });
    vacio({ tipo: "naipia.conteo", sistema: "nada", cartas: ["7♠"] });
    vacio({ tipo: "naipia.cancelacion", sistema: "hilo" });
    vacio({ tipo: "naipia.mazo", sistema: 5 });
    vacio({ tipo: "naipia.comparar", sistemas: ["hilo"], cartas: ["7♠"] });
    vacio({ tipo: "naipia.comparar", sistemas: "hilo", cartas: ["7♠"] });
    vacio({ tipo: "naipia.verdadero", conteo: 5, regla: "inventada", mazosRestantes: 2 });
    vacio({ tipo: "naipia.verdadero", conteo: 5, regla: "cercano" });
    vacio({ tipo: "naipia.verdadero", conteo: 5, regla: "cercano", mazosRestantes: 0 });
    vacio({ tipo: "naipia.verdadero", conteo: "5", regla: "cercano", mazosRestantes: 2 });
    vacio({ tipo: "cuadros", cuadros: "no es una lista" });
    vacio({ tipo: "cuadros", cuadros: [] });
    vacio({ tipo: "cuadros", cuadros: [{ formula: 5 }, null, {}] });
  });

  it("un visual que lanza al dibujarse (componente roto) no rompe el resto del cuerpo de la lección", () => {
    const Roto = () => {
      throw new Error("visual roto");
    };
    const registro = { ...REGISTRO_VISUALES_NAIPIA, "prueba.roto": Roto as never };
    // En el servidor React reintenta en el cliente: renderToStaticMarkup con
    // Suspense sin fallback devuelve vacío para ese visual y sigue con el resto.
    const salida = renderToStaticMarkup(
      createElement(
        Proveedor,
        { locale: "es", timeZone: "UTC", messages: { Naipia: MENSAJES.es.Naipia, Aprender: MENSAJES.es.Aprender } as never },
        createElement(CuerpoVisual, {
          pasos: ["Primer paso", "Segundo paso"],
          visuales: [{ tipo: "prueba.roto", despuesDePaso: 0 }, { tipo: "naipia.mazo", sistema: "hilo", despuesDePaso: 1, estatico: true }] as DatosVisual[],
          registro,
        })
      )
    );
    expect(salida).toContain("Primer paso");
    expect(salida).toContain("Segundo paso");
    expect(salida).toContain("Sistema balanceado");
  });
});

describe("CuerpoVisual: cada visual va justo debajo de su paso", () => {
  it("en las 13 lecciones el orden es paso i, sus visuales, paso i+1", () => {
    for (const l of LECCIONES_NAIPIA) {
      const marcas: Record<string, unknown> = {};
      const registro = Object.fromEntries(
        Object.keys(REGISTRO_VISUALES_NAIPIA)
          .concat("cuadros")
          .map((tipo) => [tipo, (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never])
      );
      void marcas;
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Naipia: MENSAJES.es.Naipia, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: l.pasos, visuales: l.visuales, registro })
        )
      );
      const inicios = l.pasos.map((p) => {
        const clave = p.slice(0, 20).split("$")[0];
        expect(clave.length, l.slug).toBeGreaterThanOrEqual(8);
        const idx = salida.indexOf(clave.replace(/&/g, "&amp;"));
        expect(idx, `${l.slug}: no encuentro el paso «${clave}»`).toBeGreaterThanOrEqual(0);
        return idx;
      });
      expect([...inicios].sort((a, b) => a - b)).toEqual(inicios);
      const posiciones: number[] = [];
      let desde = 0;
      for (const v of l.visuales) {
        const idx = salida.indexOf(`data-visual="${v.tipo}"`, desde);
        expect(idx, `${l.slug}: falta ${v.tipo}`).toBeGreaterThanOrEqual(0);
        // Justo debajo de su paso: después del inicio del paso y antes del siguiente.
        const paso = v.despuesDePaso!;
        expect(idx).toBeGreaterThan(inicios[paso]);
        if (paso + 1 < inicios.length) expect(idx).toBeLessThan(inicios[paso + 1]);
        posiciones.push(idx);
        desde = idx + 1;
      }
      expect(posiciones.length).toBe(l.visuales.length);
    }
  });
});
