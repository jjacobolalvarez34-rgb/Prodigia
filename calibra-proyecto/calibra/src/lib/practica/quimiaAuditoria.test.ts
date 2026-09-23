import { describe, it, expect } from "vitest";
import {
  ELEMENTOS,
  COMPUESTOS,
  COMPUESTOS_NOMENCLATURA,
  Z_MAX_CON_ESTADO_OXIDACION,
  generarPreguntaQuimia,
  tieneGrupoDefinido,
} from "./quimia";
import { COMPUESTOS_ORGANICOS } from "./quimicaOrganica";
import { contarAtomos } from "@/lib/quimia/formulas";
import { COMPUESTOS_IONICOS, HIDRACIDOS, OTROS_COMPUESTOS, OXIDOS_NO_METALICOS, OXOACIDOS } from "@/lib/quimia/nomenclatura";
import { periodoPorZ } from "@/lib/quimia/tabla";

// Auditoría de los datos de PRÁCTICA de Quimia (tanda 1 del retrofit de
// Aprender, 2026-09-23). Cada test fija un error real encontrado (ver los
// comentarios de src/lib/practica/quimia.ts y la sección "Quimia: Técnicas |
// Clases (tanda 1)" de docs/PARIDAD_MUNDOS.md) o una verificación cruzada del
// banco contra las tablas de referencia de src/lib/quimia/.

function prng(semilla: number) {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const elementoDelEnunciado = (enunciado: string) => {
  const simbolo = enunciado.match(/\(([A-Z][a-z]?)\)/)![1];
  return ELEMENTOS.find((e) => e.simbolo === simbolo)!;
};

describe("tabla periódica (práctica): estado de oxidación", () => {
  it("[error real] nunca se pregunta el estado de oxidación de un elemento con Z > 103 (los superpesados traían 0 como marcador de dato desconocido)", () => {
    const azar = prng(11);
    const vistos = new Set<string>();
    for (const nivel of [8, 9, 10]) {
      const usados = new Set<string>();
      for (let i = 0; i < 700; i++) {
        const p = generarPreguntaQuimia("tabla", nivel, usados, azar);
        const el = elementoDelEnunciado(p.enunciado);
        vistos.add(el.simbolo);
        expect(p.enunciado).toMatch(/estado de oxidación/);
        expect(el.numeroAtomico, `${el.simbolo} en nivel ${nivel}`).toBeLessThanOrEqual(Z_MAX_CON_ESTADO_OXIDACION);
        usados.add(p.clave);
        if (usados.size > 60) usados.clear();
      }
    }
    // El banco sigue siendo amplio: se ven muchos elementos distintos, no solo unos pocos.
    expect(vistos.size).toBeGreaterThan(60);
  });

  it("la respuesta '0' solo aparece para gases nobles (He, Ne, Ar, Kr, Xe, Rn), nunca como marcador de dato desconocido", () => {
    const azar = prng(12);
    for (const nivel of [8, 9, 10]) {
      const usados = new Set<string>();
      for (let i = 0; i < 700; i++) {
        const p = generarPreguntaQuimia("tabla", nivel, usados, azar);
        const el = elementoDelEnunciado(p.enunciado);
        if (p.respuesta === "0") expect(["He", "Ne", "Ar", "Kr", "Xe", "Rn"], el.simbolo).toContain(el.simbolo);
        usados.add(p.clave);
        if (usados.size > 60) usados.clear();
      }
    }
  });

  it("los elementos 1-103 tienen un estado de oxidación común entre −4 y +7 (+8 solo llegaría con los transactínidos, excluidos)", () => {
    for (const e of ELEMENTOS.filter((x) => x.numeroAtomico <= Z_MAX_CON_ESTADO_OXIDACION)) {
      expect(e.estadoOxidacionComun, e.simbolo).toBeGreaterThanOrEqual(-4);
      expect(e.estadoOxidacionComun, e.simbolo).toBeLessThanOrEqual(7);
    }
  });
});

describe("tabla periódica (práctica): período y grupo", () => {
  it("[error real] los lantánidos y actínidos (grupo 3 por convención) nunca reciben la pregunta de grupo, solo la de período", () => {
    const azar = prng(13);
    let periodosF = 0;
    for (const nivel of [4, 5, 6, 7]) {
      const usados = new Set<string>();
      for (let i = 0; i < 1500; i++) {
        const p = generarPreguntaQuimia("tabla", nivel, usados, azar);
        const el = elementoDelEnunciado(p.enunciado);
        if (!tieneGrupoDefinido(el)) {
          expect(p.enunciado, `${el.simbolo} no tiene grupo definido`).toMatch(/período/);
          periodosF++;
        }
        usados.add(p.clave);
        if (usados.size > 60) usados.clear();
      }
    }
    expect(periodosF, "se llegó a ver algún lantánido/actínido").toBeGreaterThan(20);
    expect(tieneGrupoDefinido(ELEMENTOS.find((e) => e.simbolo === "Ce")!)).toBe(false);
    expect(tieneGrupoDefinido(ELEMENTOS.find((e) => e.simbolo === "Fe")!)).toBe(true);
  });

  it("[error real] las opciones de período y de grupo ya no delatan la respuesta por estar fuera de una lista parcial", () => {
    const azar = prng(14);
    // Período: antes la lista de distractores era 1-6, así que el 7 solo aparecía si era la respuesta.
    let veces7EnDistractores = 0;
    let gruposMedioEnDistractores = 0;
    for (let i = 0; i < 600; i++) {
      const usados = new Set<string>();
      const p = generarPreguntaQuimia("tabla", 5, usados, azar);
      const el = elementoDelEnunciado(p.enunciado);
      expect(p.opciones).toContain(p.respuesta);
      expect(new Set(p.opciones).size).toBe(p.opciones.length);
      if (/período/.test(p.enunciado)) {
        expect(p.respuesta).toBe(String(el.periodo));
        if (el.periodo !== 7 && p.opciones.includes("7")) veces7EnDistractores++;
      } else {
        expect(p.respuesta).toBe(String(el.grupo));
        // un grupo 3-7, 9 o 10 como distractor (antes solo podía ser la respuesta)
        if (p.opciones.some((o) => ["3", "4", "5", "6", "7", "9", "10"].includes(o) && o !== p.respuesta)) gruposMedioEnDistractores++;
      }
    }
    expect(veces7EnDistractores).toBeGreaterThan(20);
    expect(gruposMedioEnDistractores).toBeGreaterThan(50);
  });

  it("el período y el grupo de los 118 elementos coinciden con el cálculo independiente por número atómico", () => {
    for (const e of ELEMENTOS) expect(periodoPorZ(e.numeroAtomico), e.simbolo).toBe(e.periodo);
  });
});

describe("nomenclatura y fórmulas (práctica) contra las tablas de referencia", () => {
  const nombresConocidos = new Set<string>();
  const agregar = (n: string | undefined) => n && nombresConocidos.add(n.toLowerCase());
  for (const c of COMPUESTOS_IONICOS) [c.tradicional, c.stock, c.sistematica, c.comun].forEach(agregar);
  for (const c of OXIDOS_NO_METALICOS) [c.tradicional, c.stock, c.sistematica].forEach(agregar);
  for (const c of OXOACIDOS) agregar(c.tradicional);
  for (const c of HIDRACIDOS) [c.acido, c.puro].forEach(agregar);
  for (const c of OTROS_COMPUESTOS) agregar(c.nombre);

  it("cada nombre de COMPUESTOS_NOMENCLATURA es un nombre válido (tradicional, Stock, IUPAC o común) de la tabla de referencia, y la fórmula existe", () => {
    for (const c of COMPUESTOS_NOMENCLATURA) {
      expect(() => contarAtomos(c.formula), c.formula).not.toThrow();
      expect(nombresConocidos.has(c.nombre.toLowerCase()), `${c.formula}: «${c.nombre}» no figura en ninguna tabla de referencia`).toBe(true);
    }
  });

  it("los nombres de COMPUESTOS (modo fórmulas) coinciden con la tabla de referencia, salvo el oxígeno y la glucosa (sustancias simples/orgánicas)", () => {
    for (const c of COMPUESTOS) {
      expect(() => contarAtomos(c.formula), c.formula).not.toThrow();
      if (c.formula === "O2" || c.formula === "C6H12O6") continue;
      expect(nombresConocidos.has(c.nombre.toLowerCase()), `${c.formula}: «${c.nombre}»`).toBe(true);
    }
  });

  it("carga neta cero de los compuestos iónicos del banco de nomenclatura: cada fórmula iónica está en la tabla de referencia, que se verifica por cruce de cargas", () => {
    const iónicos = COMPUESTOS_NOMENCLATURA.filter((c) => COMPUESTOS_IONICOS.some((r) => r.formula === c.formula));
    expect(iónicos.length).toBeGreaterThanOrEqual(12);
  });
});

describe("química orgánica (práctica): los datos del banco son coherentes", () => {
  const sub = (s: string) => s.replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080));

  it("los átomos de la fórmula condensada (grupos) coinciden con la fórmula molecular de cada compuesto", () => {
    for (const c of COMPUESTOS_ORGANICOS) {
      const suma: Record<string, number> = {};
      for (const g of c.grupos) for (const [s, n] of Object.entries(contarAtomos(sub(g)))) suma[s] = (suma[s] ?? 0) + n;
      expect(suma, `${c.id}: ${c.grupos.join("-")} vs ${c.formula}`).toEqual(contarAtomos(c.formula));
    }
  });

  it("ids únicos y el enlace doble apunta a un par de grupos que existe", () => {
    expect(new Set(COMPUESTOS_ORGANICOS.map((c) => c.id)).size).toBe(COMPUESTOS_ORGANICOS.length);
    for (const c of COMPUESTOS_ORGANICOS) if (c.enlaceDoble !== undefined) expect(c.enlaceDoble).toBeLessThan(c.grupos.length - 1);
  });
});
