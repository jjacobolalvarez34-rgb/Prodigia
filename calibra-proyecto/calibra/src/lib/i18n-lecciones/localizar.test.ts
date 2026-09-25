import { describe, expect, it } from "vitest";
import { esIngles, localizarFila, localizarFilas, respuestaCorrecta } from "./localizar";

const fila = {
  nombre: "Complemento a 10",
  descripcion: "Suma rápido",
  contenido: { pasos: ["uno"] },
  nombre_en: "Complement to 10",
  descripcion_en: "Add fast",
  contenido_en: { pasos: ["one"] },
};

describe("localizar lecciones", () => {
  it("en español no toca nada", () => {
    expect(localizarFila(fila, "es")).toBe(fila);
    expect(localizarFila(fila, undefined)).toBe(fila);
  });

  it("en inglés usa la traducción campo por campo", () => {
    const r = localizarFila(fila, "en");
    expect(r.nombre).toBe("Complement to 10");
    expect(r.descripcion).toBe("Add fast");
    expect(r.contenido).toEqual({ pasos: ["one"] });
    expect(esIngles("en-US")).toBe(true);
    expect(esIngles("es")).toBe(false);
  });

  it("si falta parte de la traducción, cae al español solo en ese campo", () => {
    const r = localizarFila({ ...fila, descripcion_en: null, contenido_en: null }, "en");
    expect(r.nombre).toBe("Complement to 10");
    expect(r.descripcion).toBe("Suma rápido");
    expect(r.contenido).toEqual({ pasos: ["uno"] });
    const vacio = localizarFila({ ...fila, nombre_en: "  " }, "en");
    expect(vacio.nombre).toBe("Complemento a 10");
  });

  it("localizarFilas acepta null y no muta las filas originales", () => {
    expect(localizarFilas(null, "en")).toEqual([]);
    const copia = JSON.stringify(fila);
    localizarFilas([fila], "en");
    expect(JSON.stringify(fila)).toBe(copia);
  });

  it("el quiz acepta la respuesta correcta en cualquiera de los dos idiomas, por posición", () => {
    const es = [{ respuesta: "Cuánto falta" }, { respuesta: "9506" }];
    const en = [{ respuesta: "How much is missing" }, { respuesta: "9506" }];
    expect(respuestaCorrecta("Cuánto falta", es, en, 0)).toBe(true);
    expect(respuestaCorrecta("How much is missing", es, en, 0)).toBe(true);
    expect(respuestaCorrecta("How much is missing", es, en, 1)).toBe(false); // otra posición
    expect(respuestaCorrecta("How much is missing", es, null, 0)).toBe(false); // sin traducción
    expect(respuestaCorrecta(undefined, es, en, 0)).toBe(false);
    expect(respuestaCorrecta("9506", es, en, 1)).toBe(true);
  });
});
