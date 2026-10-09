import { describe, expect, it } from "vitest";
import { revisarEscena } from "@/lib/dibujo/revisarEscena";
import { escenaVitalia, fenotipoPunnett, traducirCodon } from "./escenas";
import { TIPOS_VISUALES_VITALIA, type VisualVitalia } from "./visuales";

// Un ejemplo (o varios) de cada tipo y modo.
export const EJEMPLOS_VITALIA: VisualVitalia[] = [
  { tipo: "vitalia.celula", variante: "animal" },
  { tipo: "vitalia.celula", variante: "vegetal" },
  { tipo: "vitalia.celula", variante: "procariota" },
  { tipo: "vitalia.membrana", modo: "difusion" },
  { tipo: "vitalia.membrana", modo: "osmosis", medio: "hipotonico" },
  { tipo: "vitalia.membrana", modo: "osmosis", medio: "hipertonico" },
  { tipo: "vitalia.membrana", modo: "activo" },
  { tipo: "vitalia.division", modo: "mitosis", dosN: 46 },
  { tipo: "vitalia.division", modo: "meiosis", dosN: 4 },
  { tipo: "vitalia.energia", modo: "ciclo" },
  { tipo: "vitalia.energia", modo: "fotosintesis" },
  { tipo: "vitalia.energia", modo: "respiracion" },
  { tipo: "vitalia.energia", modo: "fermentacion" },
  { tipo: "vitalia.adn", modo: "replicacion", hebra: "ATGCCA" },
  { tipo: "vitalia.adn", modo: "transcripcion", hebra: "TACGGA" },
  { tipo: "vitalia.adn", modo: "traduccion", hebra: "AUGCCUGUU" },
  { tipo: "vitalia.punnett", padre1: "Aa", padre2: "Aa" },
  { tipo: "vitalia.punnett", padre1: "AaBb", padre2: "AaBb" },
  { tipo: "vitalia.punnett", padre1: "Rr", padre2: "Rr", incompleta: true },
  { tipo: "vitalia.pedigri", modo: "recesiva" },
  { tipo: "vitalia.pedigri", modo: "ligadaX" },
  { tipo: "vitalia.recorrido", sistema: "circulatorio" },
  { tipo: "vitalia.recorrido", sistema: "digestivo" },
  { tipo: "vitalia.recorrido", sistema: "respiratorio" },
  { tipo: "vitalia.recorrido", sistema: "urinario" },
  { tipo: "vitalia.recorrido", sistema: "nervioso" },
  { tipo: "vitalia.hormona", modo: "glucosa" },
  { tipo: "vitalia.hormona", modo: "temperatura" },
  { tipo: "vitalia.defensa", modo: "respuesta" },
  { tipo: "vitalia.defensa", modo: "vacuna" },
  { tipo: "vitalia.arbol", ejemplo: "humano" },
  { tipo: "vitalia.arbol", ejemplo: "roble" },
  { tipo: "vitalia.reinos", modo: "reinos" },
  { tipo: "vitalia.reinos", modo: "vertebrados" },
  { tipo: "vitalia.reinos", modo: "invertebrados" },
  { tipo: "vitalia.plantas" },
  { tipo: "vitalia.cadena", eslabones: ["Pasto", "Conejo", "Zorro", "Águila"] },
];

describe("escenas de Vitalia", () => {
  it("hay ejemplo de cada tipo", () => {
    const tipos = new Set(EJEMPLOS_VITALIA.map((v) => v.tipo));
    for (const t of TIPOS_VISUALES_VITALIA) expect(tipos.has(t), t).toBe(true);
  });

  for (const v of EJEMPLOS_VITALIA) {
    it(`${v.tipo} ${JSON.stringify(v).slice(0, 80)}`, () => {
      const e = escenaVitalia(v);
      expect(e).not.toBeNull();
      expect(revisarEscena(e!)).toEqual([]);
    });
  }

  it("Punnett: 3:1, 9:3:3:1 y 1:2:1", () => {
    expect(escenaVitalia({ tipo: "vitalia.punnett", padre1: "Aa", padre2: "Aa" })!.leyenda(3)).toContain("3 : 1");
    expect(escenaVitalia({ tipo: "vitalia.punnett", padre1: "AaBb", padre2: "AaBb" })!.leyenda(3)).toContain("9 : 3 : 3 : 1");
    expect(escenaVitalia({ tipo: "vitalia.punnett", padre1: "Rr", padre2: "Rr", incompleta: true })!.leyenda(3)).toContain("1 : 2 : 1");
    expect(fenotipoPunnett("Aa")).toBe("A");
    expect(fenotipoPunnett("aabb")).toBe("ab");
  });

  it("código genético: algunos codones conocidos", () => {
    expect(traducirCodon("AUG")).toBe("Met");
    expect(traducirCodon("UGG")).toBe("Trp");
    expect(traducirCodon("UAA")).toBe("Stop");
    expect(traducirCodon("GCU")).toBe("Ala");
    expect(traducirCodon("CCU")).toBe("Pro");
    expect(traducirCodon("GUU")).toBe("Val");
    expect(traducirCodon("UUU")).toBe("Phe");
    expect(traducirCodon("AAA")).toBe("Lys");
    expect(traducirCodon("GGG")).toBe("Gly");
  });

  it("transcripción: A→U, T→A, G→C, C→G", () => {
    expect(escenaVitalia({ tipo: "vitalia.adn", modo: "transcripcion", hebra: "TTGGTTGGA" })!.leyenda(3)).toContain("AACCAACCU");
  });

  it("con datos rotos no arma escena", () => {
    const malos = [
      { tipo: "vitalia.adn", modo: "traduccion", hebra: "AUGC" },
      { tipo: "vitalia.adn", modo: "replicacion", hebra: "AXG" },
      { tipo: "vitalia.punnett", padre1: "Ab", padre2: "Aa" },
      { tipo: "vitalia.cadena", eslabones: ["Solo"] },
      { tipo: "vitalia.desconocido" },
    ] as unknown as VisualVitalia[];
    for (const v of malos) expect(escenaVitalia(v), v.tipo).toBeNull();
  });
});
