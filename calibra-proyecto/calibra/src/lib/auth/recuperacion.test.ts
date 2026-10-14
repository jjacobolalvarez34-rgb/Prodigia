import { describe, expect, it } from "vitest";
import { enmascararCorreo, mundosCoinciden, opcionesDeCorreo } from "./recuperacion";

describe("recuperar la contraseña con preguntas", () => {
  it("el correo se muestra enmascarado, nunca entero", () => {
    expect(enmascararCorreo("Jacobo.Lopez@Gmail.com")).toBe("ja•••@gmail.com");
    expect(enmascararCorreo("sin-arroba")).toBe("•••");
  });

  it("4 opciones, una es la verdadera, y siempre las mismas para el mismo usuario", () => {
    const a = opcionesDeCorreo("nico", "nicolas@hotmail.com");
    expect(a).toHaveLength(4);
    expect(new Set(a).size).toBe(4);
    expect(a).toContain("ni•••@hotmail.com");
    expect(opcionesDeCorreo("nico", "nicolas@hotmail.com")).toEqual(a);
    for (const o of a) expect(o).not.toContain("nicolas");
  });

  it("un usuario que no existe recibe opciones con el mismo formato", () => {
    const x = opcionesDeCorreo("no-existe", null);
    expect(x).toHaveLength(4);
    for (const o of x) expect(o).toMatch(/^[a-z]{2}•••@[a-z.]+$/);
  });

  it("los dos primeros mundos valen en cualquier orden", () => {
    expect(mundosCoinciden(["quimia", "numeria"], ["numeria", "quimia", "historia"])).toBe(true);
    expect(mundosCoinciden(["numeria", "historia"], ["numeria", "quimia"])).toBe(false);
    expect(mundosCoinciden(["numeria"], ["numeria", "quimia"])).toBe(false);
  });
});
