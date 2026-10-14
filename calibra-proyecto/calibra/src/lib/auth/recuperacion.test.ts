import { describe, expect, it } from "vitest";
import { enmascararCorreo, mundosCoinciden, opcionesDeCorreo } from "./recuperacion";

describe("recuperar la contraseña con preguntas", () => {
  it("el correo se muestra enmascarado, nunca entero", () => {
    expect(enmascararCorreo("Jacobo.Lopez@Gmail.com")).toBe("ja•••@gmail.com");
    expect(enmascararCorreo("sin-arroba")).toBe("•••");
  });

  it("4 opciones con las mismas iniciales; una es la verdadera; siempre las mismas", () => {
    const a = opcionesDeCorreo("nico", "nicolas@hotmail.com");
    expect(a).toHaveLength(4);
    expect(new Set(a).size).toBe(4);
    expect(a).toContain("ni•••@hotmail.com");
    for (const o of a) {
      expect(o.startsWith("ni•••@")).toBe(true);
      expect(o).not.toContain("nicolas");
    }
    expect(opcionesDeCorreo("nico", "nicolas@hotmail.com")).toEqual(a);
  });

  it("con un dominio poco común, igual son 4 opciones y está la verdadera", () => {
    const a = opcionesDeCorreo("ana", "ana@colegio.edu.co");
    expect(a).toHaveLength(4);
    expect(a).toContain("an•••@colegio.edu.co");
  });

  it("un usuario que no existe recibe opciones con el mismo formato", () => {
    const x = opcionesDeCorreo("no-existe", null);
    expect(x).toHaveLength(4);
    for (const o of x) expect(o).toMatch(/^no•••@[a-z.]+$/);
  });

  it("los dos primeros mundos valen en cualquier orden", () => {
    expect(mundosCoinciden(["quimia", "numeria"], ["numeria", "quimia", "historia"])).toBe(true);
    expect(mundosCoinciden(["numeria", "historia"], ["numeria", "quimia"])).toBe(false);
    expect(mundosCoinciden(["numeria"], ["numeria", "quimia"])).toBe(false);
  });

  it("una cuenta vieja con un solo mundo acierta si lo elige", () => {
    expect(mundosCoinciden(["numeria", "historia"], ["numeria"])).toBe(true);
    expect(mundosCoinciden(["quimia", "historia"], ["numeria"])).toBe(false);
  });
});
