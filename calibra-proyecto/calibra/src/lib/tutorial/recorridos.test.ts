import { describe, expect, it } from "vitest";
import { MAX_PASOS, RECORRIDOS, pasosPara, recorridoDeRutaWeb, textoDe, type IdRecorrido } from "./recorridos";

const IDS = Object.keys(RECORRIDOS) as IdRecorrido[];

describe("tutorial guiado", () => {
  it("cada paso tiene título y texto en los dos idiomas, cortos", () => {
    for (const id of IDS) {
      for (const p of RECORRIDOS[id]) {
        for (const t of [p.titulo, p.texto]) {
          expect(t[0].length).toBeGreaterThan(2);
          expect(t[1].length).toBeGreaterThan(2);
        }
        expect(p.texto[0].length).toBeLessThanOrEqual(140);
      }
    }
  });

  it("ninguna sección pasa de 5 pasos en ninguna plataforma", () => {
    for (const id of IDS) {
      expect(pasosPara(id, "web").length).toBeLessThanOrEqual(MAX_PASOS + 2);
      expect(pasosPara(id, "app").length).toBeLessThanOrEqual(MAX_PASOS);
    }
  });

  it("filtra los pasos por plataforma", () => {
    const web = pasosPara("inicio", "web").map((p) => p.web ?? "centro");
    const app = pasosPara("inicio", "app").map((p) => p.app ?? "centro");
    expect(web).toContain("inicio-metricas");
    expect(web).not.toContain("inicio-continuar");
    expect(app).toContain("inicio-continuar");
    expect(pasosPara("docente", "app")).toEqual([]);
  });

  it("elige el recorrido según la ruta de la web", () => {
    expect(recorridoDeRutaWeb("/")).toBe("inicio");
    expect(recorridoDeRutaWeb("/quimia")).toBe("ciudad");
    expect(recorridoDeRutaWeb("/quimia/practica")).toBeNull();
    expect(recorridoDeRutaWeb("/rankeds")).toBe("competir");
    expect(recorridoDeRutaWeb("/profesor")).toBe("docente");
    expect(recorridoDeRutaWeb("/profesor/abc")).toBe("panel");
    expect(recorridoDeRutaWeb("/profesor/abc/estadisticas")).toBeNull();
    expect(recorridoDeRutaWeb("/ajustes")).toBeNull();
  });

  it("elige el texto según el idioma", () => {
    expect(textoDe(["Hola", "Hi"], "es")).toBe("Hola");
    expect(textoDe(["Hola", "Hi"], "en")).toBe("Hi");
  });
});
