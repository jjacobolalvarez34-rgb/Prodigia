import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_QUIMIA } from "./registro";
import { TECNICAS_QUIMIA, CLASES_QUIMIA } from "@/lib/quimia/lecciones";
import type { VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";
import { ELEMENTOS } from "@/lib/practica/quimia";

// Tests de RENDER de los 6 visuales de Quimia y del dispatcher genérico con
// react-dom/server (sin navegador), mismo patrón que
// src/components/geografia/visuales/visuales.test.ts. Se dibujan TODAS las
// lecciones reales (16 Técnicas + 17 Clases) en es y en, animadas y
// estáticas, con `onError` que lanza (un mensaje i18n faltante o mal
// formateado rompe el test). La legibilidad real (tabla periódica a 360 px,
// subíndices, animaciones) se verificó a ojo en el navegador: ver el reporte
// de la tarea y docs/PARIDAD_MUNDOS.md.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Quimia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Quimia: MENSAJES[idioma].Quimia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e;
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_QUIMIA })
    )
  );
}

describe("visuales de Quimia: las 33 lecciones reales se dibujan sin romper", () => {
  it("cada visual se renderiza (animado y estático, es y en) con marco accesible, controles y sin datos rotos", () => {
    const TODAS = [...TECNICAS_QUIMIA, ...CLASES_QUIMIA];
    let total = 0;
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${leccion.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(200);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            // Números rotos en atributos/estilos (no confundir con el texto "NaNO2", el nitrito de sodio).
            expect(salida, donde).not.toMatch(/="NaN"|:\s*NaN|NaN(px|%)|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Quimia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).not.toContain("katex-error");
            expect(salida, donde).toContain("<button"); // controles del reproductor
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(300);
  }, 120_000);
});

describe("quimia.tabla", () => {
  const visual = {
    tipo: "quimia.tabla",
    pasos: [
      { etiqueta: "Los halógenos.", seleccion: { por: "familia", familia: "halogeno" } },
      { etiqueta: "El grupo 1.", seleccion: { por: "grupo", n: 1 } },
    ],
    estatico: true,
  };

  it("dibuja los 118 símbolos, los números de grupo (1-18) y de período (1-7), la leyenda de familias y la alternativa con los elementos de cada paso", () => {
    const salida = html(visual);
    for (const e of ELEMENTOS) expect(salida, e.simbolo).toContain(`>${e.simbolo}</text>`);
    expect((salida.match(/<rect/g) ?? []).length).toBe(118 + 2); // 118 casilleros + 2 marcadores del bloque f
    expect(salida).toContain("Metales alcalinos");
    expect(salida).toContain("Gases nobles");
    // alternativa accesible: cada paso con los símbolos que resalta
    expect(salida).toContain("F, Cl, Br, I, At, Ts");
    expect(salida).toContain("H, Li, Na, K, Rb, Cs, Fr");
  });

  it("estático muestra el último paso; con flecha dibuja el marcador; sin pasos válidos no dibuja nada", () => {
    expect(html(visual)).toContain("El grupo 1.");
    expect(html({ tipo: "quimia.tabla", pasos: [{ etiqueta: "Sube", flecha: "arriba" }], estatico: true })).toContain("quimia-punta");
    expect(html({ tipo: "quimia.tabla", pasos: [] })).toBe("");
    expect(html({ tipo: "quimia.tabla", pasos: "no es arreglo" })).toBe("");
    expect(html({ tipo: "quimia.tabla", pasos: [{ sinEtiqueta: true }] })).toBe("");
  });
});

describe("quimia.elemento", () => {
  it("la alternativa lista cada dato del hierro con su valor real (Z, masa, configuración, electronegatividad, estados de oxidación)", () => {
    const salida = html({ tipo: "quimia.elemento", simbolo: "Fe", campos: ["numeroAtomico", "masa", "configuracion", "electronegatividad", "oxidacion", "estado", "posicion", "familia"], estatico: true });
    expect(salida).toContain("Número atómico (Z): 26");
    expect(salida).toContain("55,85 u");
    expect(salida).toContain("[Ar] 4s² 3d⁶"); // exponentes como superíndices Unicode
    expect(salida).toContain("Electronegatividad: 1,83");
    expect(salida).toContain("+2, +3");
    expect(salida).toContain("sólido");
    expect(salida).toContain("grupo 8, período 4");
    expect(salida).toContain("Metales de transición");
  });

  it("gas noble sin electronegatividad, en inglés; elemento sin datos o campos inválidos: no dibuja", () => {
    expect(html({ tipo: "quimia.elemento", simbolo: "Ar", campos: ["electronegatividad"], estatico: true }, "en")).toContain("not defined (noble gas)");
    expect(html({ tipo: "quimia.elemento", simbolo: "Uue", campos: ["masa"] })).toBe("");
    expect(html({ tipo: "quimia.elemento", simbolo: "Og", campos: ["masa"] })).toBe(""); // sin datos cargados
    expect(html({ tipo: "quimia.elemento", simbolo: "Fe", campos: ["inventado"] })).toBe("");
    expect(html({ tipo: "quimia.elemento", simbolo: "Fe" })).toBe("");
  });
});

describe("quimia.enlace", () => {
  it("iónico: NaCl y MgO cuentan los electrones y las cargas reales; covalente: O2 doble, N2 triple, HCl polar; metálico: Na", () => {
    const nacl = html({ tipo: "quimia.enlace", enlace: "ionico", ejemplo: "NaCl", estatico: true });
    expect(nacl).toContain("Na tiene 1 electrón de valencia y Cl tiene 7 electrones");
    expect(nacl).toContain("Na⁺");
    expect(nacl).toContain("Cl⁻");
    const mgo = html({ tipo: "quimia.enlace", enlace: "ionico", ejemplo: "MgO", estatico: true });
    expect(mgo).toContain("Mg cede 2 electrones a O");
    expect(mgo).toContain("Mg²⁺");
    expect(mgo).toContain("O²⁻");
    expect(html({ tipo: "quimia.enlace", enlace: "covalente", ejemplo: "O2", estatico: true })).toContain("comparten 2 pares");
    expect(html({ tipo: "quimia.enlace", enlace: "covalente", ejemplo: "N2", estatico: true })).toContain("Enlace covalente triple");
    const hcl = html({ tipo: "quimia.enlace", enlace: "covalente", ejemplo: "HCl", estatico: true });
    expect(hcl).toContain("es polar");
    expect(hcl).toContain("0,96");
    expect(html({ tipo: "quimia.enlace", enlace: "covalente", ejemplo: "H2", estatico: true })).toContain("apolar");
    expect(html({ tipo: "quimia.enlace", enlace: "metalico", ejemplo: "Mg", estatico: true })).toContain("Mg²⁺");
  });

  it("tipo que no coincide con el ejemplo, o ejemplo inventado (incluido 'constructor'): no dibuja", () => {
    expect(html({ tipo: "quimia.enlace", enlace: "metalico", ejemplo: "NaCl" })).toBe("");
    expect(html({ tipo: "quimia.enlace", enlace: "ionico", ejemplo: "constructor" })).toBe("");
    expect(html({ tipo: "quimia.enlace", enlace: "ionico", ejemplo: "XyZ" })).toBe("");
  });
});

describe("quimia.cruce", () => {
  it("Al³⁺ + O²⁻ da Al₂O₃ con nombre; Ca²⁺ + O²⁻ agrega el paso de simplificar; Na⁺ + Cl⁻ no", () => {
    const al = html({ tipo: "quimia.cruce", cation: "Al3+", anion: "O2-", estatico: true });
    expect(al).toContain("Al_2O_3");
    expect(al).toContain("óxido de aluminio");
    const ca = html({ tipo: "quimia.cruce", cation: "Ca2+", anion: "O2-", estatico: true });
    expect(ca).toContain("se simplifica a");
    expect(ca).toContain("{Ca}_{2}");
    expect(ca).toContain("óxido de calcio");
    const na = html({ tipo: "quimia.cruce", cation: "Na+", anion: "Cl-", estatico: true });
    expect(na).not.toContain("se simplifica a");
    expect(na).toContain("cloruro de sodio");
    // ion poliatómico con paréntesis
    expect(html({ tipo: "quimia.cruce", cation: "Al3+", anion: "SO4^2-", estatico: true })).toContain("(SO_4)_3");
    // sin nombre en la tabla: solo la fórmula
    expect(html({ tipo: "quimia.cruce", cation: "NH4+", anion: "PO4^3-", estatico: true })).toContain("(NH_4)_3PO_4");
  });

  it("iones que no existen: no dibuja", () => {
    expect(html({ tipo: "quimia.cruce", cation: "Xx9+", anion: "O2-" })).toBe("");
    expect(html({ tipo: "quimia.cruce", cation: "Na+", anion: "Yy-" })).toBe("");
  });
});

describe("quimia.cuadro y quimia.orbitales", () => {
  it("cuadro: tabla con encabezados y todas las celdas en la alternativa; filas mal formadas se descartan", () => {
    const salida = html({ tipo: "quimia.cuadro", columnas: ["Símbolo", "Elemento"], filas: [["Na", "sodio"], ["K", "potasio"], ["solo una celda"]], estatico: true });
    expect(salida).toContain("<table");
    expect(salida).toContain("sodio");
    expect(salida).toContain("potasio");
    expect(salida).not.toContain("solo una celda");
    expect(html({ tipo: "quimia.cuadro", columnas: [], filas: [["a"]] })).toBe("");
    expect(html({ tipo: "quimia.cuadro", columnas: ["a"], filas: [] })).toBe("");
  });

  it("orbitales: el hierro muestra su configuración completa; el cromo marca la excepción; Z inválido no dibuja", () => {
    const fe = html({ tipo: "quimia.orbitales", z: 26, estatico: true });
    expect(fe).toContain("1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶");
    expect(fe).not.toContain("excepción");
    const cr = html({ tipo: "quimia.orbitales", z: 24, estatico: true });
    expect(cr).toContain("4s¹ 3d⁵");
    expect(cr).toContain("excepción a la regla de llenado");
    expect(html({ tipo: "quimia.orbitales", z: 0 })).toBe("");
    expect(html({ tipo: "quimia.orbitales", z: 119 })).toBe("");
    expect(html({ tipo: "quimia.orbitales", z: 2.5 })).toBe("");
  });
});

describe("visuales de la tanda 2: redox", () => {
  it("quimia.redox: Zn + Cu²⁺ muestra los números de oxidación, los electrones y los agentes; un ejemplo inexistente no dibuja", () => {
    const salida = html({ tipo: "quimia.redox", ejemplo: "zn-cu", estatico: true });
    expect(salida).toContain("\\overset{+2}{\\mathrm{Zn}}");
    expect(salida).toContain("Se oxida");
    expect(salida).toContain("Se reduce");
    expect(salida).toContain("Agente reductor");
    expect(salida).toContain("2\\,\\mathrm{e^{-}}");
    expect(html({ tipo: "quimia.redox", ejemplo: "no-existe" })).toBe("");
    expect(html({ tipo: "quimia.redox" })).toBe("");
  });

  it("quimia.redox: la dismutación del H₂O₂ usa el texto propio y KMnO₄ + HCl balancea 10 electrones", () => {
    expect(html({ tipo: "quimia.redox", ejemplo: "h2o2", estatico: true })).toContain("dismutación");
    const k = html({ tipo: "quimia.redox", ejemplo: "kmno4-hcl", estatico: true });
    expect(k).toContain("Se pierden 10");
    expect(k).toContain("\\overset{+7}{\\mathrm{Mn}}");
  });

  it("quimia.oxidacion: el Mn de KMnO₄ es +7, el S del ion sulfato +6; sin incógnita válida no dibuja", () => {
    const k = html({ tipo: "quimia.oxidacion", formula: "KMnO4", incognita: "Mn", estatico: true });
    expect(k).toContain("+7");
    expect(k).toContain("Comprobación");
    const so4 = html({ tipo: "quimia.oxidacion", formula: "SO4", carga: -2, incognita: "S", estatico: true });
    expect(so4).toContain("+6");
    expect(html({ tipo: "quimia.oxidacion", formula: "KMnO4", incognita: "Zz" })).toBe("");
    expect(html({ tipo: "quimia.oxidacion", formula: "KMnO4" })).toBe("");
    // dos incógnitas sin aclarar: no se inventa un resultado
    expect(html({ tipo: "quimia.oxidacion", formula: "MnCl2", incognita: "Mn" })).toBe("");
  });

  it("quimia.balanceo: medio ácido (6 pasos) y básico (8 pasos), con la ecuación neta final", () => {
    const a = html({ tipo: "quimia.balanceo", caso: "mno4-fe2", estatico: true });
    expect(a).toContain("Ecuación iónica neta");
    expect(a).toContain("8\\,\\mathrm{H^{+}}");
    expect(a).toContain("5\\,\\mathrm{Fe^{3+}}");
    const b = html({ tipo: "quimia.balanceo", caso: "mno4-i", estatico: true });
    expect(b).toContain("8\\,\\mathrm{OH^{-}}");
    expect(b).toContain("Medio básico");
    expect(html({ tipo: "quimia.balanceo", caso: "no-existe" })).toBe("");
  });

  it("quimia.pila: la pila de Daniell da 1,10 V (1.10 en inglés) y el ánodo es el zinc; un par no espontáneo no dibuja", () => {
    const es = html({ tipo: "quimia.pila", anodo: "Zn", catodo: "Cu", estatico: true });
    expect(es).toContain("1,10 V");
    expect(es).toContain("Ánodo");
    expect(es).toContain("puente salino");
    expect(html({ tipo: "quimia.pila", anodo: "Zn", catodo: "Cu", estatico: true }, "en")).toContain("1.10 V");
    expect(html({ tipo: "quimia.pila", anodo: "Cu", catodo: "Zn" })).toBe("");
    expect(html({ tipo: "quimia.pila", anodo: "Xx", catodo: "Cu" })).toBe("");
  });
});

describe("visuales de la tanda 2: orgánica", () => {
  it("quimia.cadena (nombrar): calcula el nombre, marca cadena, numeración y ramificaciones", () => {
    const salida = html({ tipo: "quimia.cadena", molecula: "2,4-dimetilhexano", estatico: true });
    expect(salida).toContain("2,4-dimetilhexano");
    expect(salida).toContain("raíz es «hex-»");
    expect(salida).toContain("metil en el carbono 2; metil en el carbono 4");
    expect(salida).toContain("<svg");
    expect(html({ tipo: "quimia.cadena", molecula: "no-existe" })).toBe("");
    expect(html({ tipo: "quimia.cadena" })).toBe("");
  });

  it("quimia.cadena: con grupo principal, enlace múltiple y anillos", () => {
    expect(html({ tipo: "quimia.cadena", molecula: "propan-2-ol", estatico: true })).toContain("grupo principal (alcohol)");
    expect(html({ tipo: "quimia.cadena", molecula: "but-1-eno", estatico: true })).toContain("enlace múltiple");
    expect(html({ tipo: "quimia.cadena", molecula: "benceno", estatico: true })).toContain("Kekulé");
    expect(html({ tipo: "quimia.cadena", molecula: "ciclohexano", estatico: true })).toContain("ciclohexano");
  });

  it("quimia.cadena (formulas): hidrógenos por carbono, condensada y molecular", () => {
    const salida = html({ tipo: "quimia.cadena", molecula: "2-metilbutano", modo: "formulas", estatico: true });
    expect(salida).toContain("5 carbonos y 12 hidrógenos");
    expect(salida).toContain("C_5H_{12}");
    expect(salida).toContain("5 C, 12 H");
    expect(salida).toContain("CH_{3}{-}CH(CH_{3}){-}CH_{2}{-}CH_{3}");
  });

  it("quimia.grupos: un grupo por paso con su fórmula general y el nombre calculado", () => {
    const salida = html({ tipo: "quimia.grupos", moleculas: ["etanol", "etanal", "acido-etanoico"], estatico: true });
    expect(salida).toContain("alcohol");
    expect(salida).toContain("aldehído");
    expect(salida).toContain("ácido carboxílico");
    expect(salida).toContain("etanol");
    expect(salida).toContain("ácido etanoico");
    expect(salida).not.toMatch(/mathrm[A-Z]/); // LaTeX bien escapado: la fórmula general se dibuja con KaTeX
    expect(salida).toContain("katex");
    expect(html({ tipo: "quimia.grupos", moleculas: ["no-existe"] })).toBe("");
    expect(html({ tipo: "quimia.grupos", moleculas: [] })).toBe("");
  });

  it("quimia.isomeria: misma fórmula molecular; si las fórmulas no coinciden (o hay un solo compuesto) no dibuja", () => {
    const salida = html({ tipo: "quimia.isomeria", moleculas: ["butano", "2-metilpropano"], isomeria: "cadena", estatico: true });
    expect(salida).toContain("C_4H_{10}");
    expect(salida).toContain("2-metilpropano");
    expect(salida).toContain("Isomería de cadena");
    expect(html({ tipo: "quimia.isomeria", moleculas: ["butano", "pentano"] })).toBe("");
    expect(html({ tipo: "quimia.isomeria", moleculas: ["butano"] })).toBe("");
    expect(html({ tipo: "quimia.isomeria", moleculas: ["cis-but-2-eno", "trans-but-2-eno"], isomeria: "geometrica", estatico: true })).toContain("cis-but-2-eno");
  });

  it("quimia.hibridacion: sp³ 109,5° (metano), sp² ≈120° (eteno), sp 180° (etino); molécula no soportada no dibuja", () => {
    const m = html({ tipo: "quimia.hibridacion", molecula: "metano", estatico: true });
    expect(m).toContain("sp^{3}");
    expect(m).toContain("109,5");
    expect(m).toContain("tetraédrica");
    const e = html({ tipo: "quimia.hibridacion", molecula: "eteno", estatico: true });
    expect(e).toContain("sp^{2}");
    expect(e).toContain("trigonal plana");
    expect(e).toContain("1 enlace pi");
    const i = html({ tipo: "quimia.hibridacion", molecula: "etino", estatico: true });
    expect(i).toContain("180");
    expect(i).toContain("lineal");
    expect(html({ tipo: "quimia.hibridacion", molecula: "benceno" })).toBe("");
    expect(html({ tipo: "quimia.hibridacion", molecula: "metano", estatico: true }, "en")).toContain("109.5");
  });
});

describe("i18n de los visuales", () => {
  const claves = (obj: Record<string, unknown>, pre = ""): Record<string, string> => {
    const r: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "object" && v !== null) Object.assign(r, claves(v as Record<string, unknown>, `${pre}${k}.`));
      else r[`${pre}${k}`] = String(v);
    }
    return r;
  };
  // Parámetros ICU ({nombre}, {n, plural, ...}, {tipo, select, ...}): siempre en camelCase con minúscula inicial.
  const marcadores = (s: string) => [...s.matchAll(/\{([a-z]\w*)\s*[,}]/g)].map((m) => m[1]).sort();

  it("Quimia.visuales tiene las mismas claves en es y en, y cada texto usa los mismos {parámetros}", () => {
    const es = claves((MENSAJES.es.Quimia as { visuales: Record<string, unknown> }).visuales);
    const en = claves((MENSAJES.en.Quimia as { visuales: Record<string, unknown> }).visuales);
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const k of Object.keys(es)) {
      expect(marcadores(en[k]), k).toEqual(marcadores(es[k]));
      expect(en[k].length, k).toBeGreaterThan(0);
    }
  });
});

describe("CuerpoVisual: cada visual de Quimia va justo debajo de su paso, en las lecciones reales", () => {
  it("el orden es paso i, sus visuales, paso i+1", () => {
    for (const leccion of [...TECNICAS_QUIMIA, ...CLASES_QUIMIA]) {
      const registro = Object.fromEntries(
        [...Object.keys(REGISTRO_VISUALES_QUIMIA), "cuadros"].map((tipo) => [
          tipo,
          (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never,
        ])
      );
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Quimia: MENSAJES.es.Quimia, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: leccion.pasos, visuales: leccion.visuales as DatosVisual[], registro })
        )
      );
      // El visual que sigue a cada paso aparece después del texto de ese paso
      // y antes del siguiente: se comprueba por posición del primer texto de cada paso.
      const posPasos: number[] = [];
      leccion.pasos.forEach((p, i) => posPasos.push(salida.indexOf(p.replace(/\$[^$]+\$/g, "").slice(0, 12), i === 0 ? 0 : posPasos[i - 1] + 1)));
      const porPaso = new Map<number, string[]>();
      for (const v of leccion.visuales) {
        const d = Math.min(v.despuesDePaso ?? leccion.pasos.length - 1, leccion.pasos.length - 1);
        porPaso.set(d, [...(porPaso.get(d) ?? []), v.tipo]);
      }
      for (const [d, tipos] of porPaso) {
        for (const tipo of tipos) {
          const idx = salida.indexOf(`data-visual="${tipo}"`, Math.max(0, posPasos[d]));
          expect(idx, `${leccion.slug}: falta ${tipo} tras el paso ${d}`).toBeGreaterThanOrEqual(0);
          if (d + 1 < posPasos.length && posPasos[d + 1] > 0) expect(idx, `${leccion.slug}: ${tipo} debe ir antes del paso ${d + 1}`).toBeLessThan(posPasos[d + 1]);
        }
      }
    }
  }, 60_000);
});
