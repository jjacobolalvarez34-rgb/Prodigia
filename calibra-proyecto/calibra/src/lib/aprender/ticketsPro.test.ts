import { describe, expect, it } from "vitest";
import { aplicarTicketsPro } from "./ticketsPro";

const nodo = (id: string, estado: "completado" | "activo" | "bloqueado", bloqueadoPorPlan: boolean) => ({ id, estado, bloqueadoPorPlan });

describe("aplicarTicketsPro", () => {
  it("abre solo las clases bloqueadas por plan que se abrieron con ticket", () => {
    const nodos = [nodo("a", "activo", false), nodo("b", "bloqueado", true), nodo("c", "bloqueado", true), nodo("d", "bloqueado", false)];
    const r = aplicarTicketsPro(nodos, new Set(["b", "d"]));
    expect(r.map((n) => [n.id, n.estado, n.bloqueadoPorPlan])).toEqual([
      ["a", "activo", false],
      ["b", "activo", false],
      ["c", "bloqueado", true],
      ["d", "bloqueado", false],
    ]);
  });

  it("sin clases con ticket devuelve el mismo camino", () => {
    const nodos = [nodo("b", "bloqueado", true)];
    expect(aplicarTicketsPro(nodos, new Set())).toBe(nodos);
  });
});
