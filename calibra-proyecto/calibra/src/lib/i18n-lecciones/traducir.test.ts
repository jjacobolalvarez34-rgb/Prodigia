import { describe, expect, it } from "vitest";
import {
  aplicarTextos,
  generarSqlTraducciones,
  quizEnContenido,
  textosTraducibles,
  validarTraduccion,
  type LeccionFuente,
  type TraduccionLeccion,
} from "./traducir";

const fuente: LeccionFuente = {
  slug: "cercanos-a-100",
  nombre: "Números cercanos a 100",
  descripcion: "Multiplica rápido",
  pasos: ["Usa el complemento: $100 - 98 = 2$.", "```python\nprint(98)\n```\nListo."],
  quiz: [{ pregunta: "¿Cuánto es $98 \times 97$?", opciones: ["9506", "9406"], respuesta: "9506", explicacion: "Sale $9506$." }],
  visuales: [
    { tipo: "cuadros", despuesDePaso: 1, cuadros: [{ texto: "Resta en cruz" }, { formula: "98 - 3 = 95" }] },
    { tipo: "tabla", filas: [["Au", "oro"]], columnas: ["Símbolo", "Elemento"], titulo: "Metales" },
  ],
};

const bien: TraduccionLeccion = {
  nombre: "Numbers near 100",
  descripcion: "Multiply fast",
  pasos: ["Use the complement: $100 - 98 = 2$.", "```python\nprint(98)\n```\nDone."],
  quiz: [{ pregunta: "What is $98 \times 97$?", opciones: ["9506", "9406"], respuesta: 0, explicacion: "It is $9506$." }],
  visuales: ["Cross subtraction", "Au", "gold", "Symbol", "Element", "Metals"],
};

describe("traducir lecciones", () => {
  it("extrae en orden los textos traducibles de los visuales (y no las fórmulas ni los ids)", () => {
    expect(textosTraducibles(fuente.visuales)).toEqual(["Resta en cruz", "Au", "oro", "Símbolo", "Elemento", "Metales"]);
  });

  it("aplicarTextos reemplaza solo esos textos y no muta la fuente", () => {
    const antes = JSON.stringify(fuente.visuales);
    const r = aplicarTextos(fuente.visuales, bien.visuales!) as { cuadros?: { texto?: string; formula?: string }[]; filas?: string[][]; titulo?: string }[];
    expect(r[0].cuadros?.[0].texto).toBe("Cross subtraction");
    expect(r[0].cuadros?.[1].formula).toBe("98 - 3 = 95");
    expect(r[1].filas).toEqual([["Au", "gold"]]);
    expect(r[1].titulo).toBe("Metals");
    expect(JSON.stringify(fuente.visuales)).toBe(antes);
  });

  it("una traducción correcta no tiene errores", () => {
    expect(validarTraduccion(fuente, bien)).toEqual([]);
  });

  it("detecta pasos, opciones y textos de visual de más o de menos", () => {
    expect(validarTraduccion(fuente, { ...bien, pasos: ["x"] }).join("\n")).toMatch(/1 pasos/);
    expect(validarTraduccion(fuente, { ...bien, visuales: ["a"] }).join("\n")).toMatch(/textos de visuales/);
    const q = { ...bien.quiz![0], opciones: ["9506"] };
    expect(validarTraduccion(fuente, { ...bien, quiz: [q] }).join("\n")).toMatch(/opciones/);
  });

  it("exige la MISMA respuesta correcta (posición) y fórmulas y código intactos", () => {
    const otraPosicion = { ...bien, quiz: [{ ...bien.quiz![0], respuesta: 1 }] };
    expect(validarTraduccion(fuente, otraPosicion).join("\n")).toMatch(/la respuesta correcta es la opción 1/);
    const formulaTocada = { ...bien, pasos: ["Use the complement: $100 - 97 = 3$.", bien.pasos[1]] };
    expect(validarTraduccion(fuente, formulaTocada).join("\n")).toMatch(/fórmulas/);
    const codigoTocado = { ...bien, pasos: [bien.pasos[0], "```python\nprint(99)\n```\nDone."] };
    expect(validarTraduccion(fuente, codigoTocado).join("\n")).toMatch(/código/);
  });

  it("permite traducir las palabras dentro de \\text{…} de una fórmula", () => {
    const f: LeccionFuente = { slug: "t", nombre: "T", pasos: ["$x = 5\\text{ metros}$"] };
    expect(validarTraduccion(f, { nombre: "T", pasos: ["$x = 5\\text{ meters}$"] })).toEqual([]);
    expect(validarTraduccion(f, { nombre: "T", pasos: ["$x = 6\\text{ meters}$"] }).join("\n")).toMatch(/fórmulas/);
  });

  it("el quiz en el contenido usa el TEXTO de la opción correcta", () => {
    expect(quizEnContenido(bien)![0].respuesta).toBe("9506");
    expect(quizEnContenido({ nombre: "x", pasos: [] })).toBeUndefined();
  });

  it("el SQL hace update por slug, escapa comillas y pone la traducción sobre el contenido en español", () => {
    const f2: LeccionFuente = { ...fuente, slug: "it's" };
    const sql = generarSqlTraducciones("-- cabecera", "techniques", "numeria", [{ fuente: f2, traduccion: { ...bien, nombre: "Don't panic" } }], "leccion_en");
    expect(sql).toContain("update public.techniques");
    expect(sql).toContain("set nombre_en = 'Don''t panic'");
    expect(sql).toContain("contenido_en = contenido || jsonb_build_object(");
    expect(sql).toContain("where slug = 'it''s' and problem_type = 'numeria';");
    expect(sql).toContain("$leccion_en$");
    const bloques = [...sql.matchAll(/\$leccion_en\$([\s\S]*?)\$leccion_en\$/g)].map((m) => m[1]);
    expect(bloques).toHaveLength(3);
    for (const b of bloques) expect(() => JSON.parse(b)).not.toThrow();
  });
});

describe("notación trigonométrica en inglés", () => {
  it("acepta \\sin y \\csc en lugar de \\operatorname{sen} y \\operatorname{cosec}", () => {
    const f: LeccionFuente = { slug: "s", nombre: "S", pasos: ["$\\operatorname{sen}(x) + \\operatorname{cosec}(x)$"] };
    expect(validarTraduccion(f, { nombre: "S", pasos: ["$\\sin(x) + \\csc(x)$"] })).toEqual([]);
    expect(validarTraduccion(f, { nombre: "S", pasos: ["$\\cos(x) + \\csc(x)$"] }).join("\n")).toMatch(/fórmulas/);
  });
});
