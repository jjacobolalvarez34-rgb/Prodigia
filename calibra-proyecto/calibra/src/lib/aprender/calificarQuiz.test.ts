import { describe, expect, it } from "vitest";
import { calificarOpcion, cuantasBien, estadoPregunta, quizListoParaEnviar } from "./calificarQuiz";

const p1 = { opciones: ["a", "b", "c"], respuesta: "b" };
const p2 = { opciones: ["x", "y"], respuesta: "x" };
const desfasada = { opciones: ["1", "2"], respuesta: "3" };

describe("calificarQuiz", () => {
  it("califica cada opción al momento", () => {
    expect(calificarOpcion(p1, "b")).toBe(true);
    expect(calificarOpcion(p1, "a")).toBe(false);
    expect(calificarOpcion(desfasada, "1")).toBeNull();
  });

  it("estado de cada pregunta", () => {
    expect(estadoPregunta(p1, "")).toBe("sin-responder");
    expect(estadoPregunta(p1, undefined)).toBe("sin-responder");
    expect(estadoPregunta(p1, "c")).toBe("mal");
    expect(estadoPregunta(p1, "b")).toBe("bien");
    expect(estadoPregunta(desfasada, "2")).toBe("sin-saber");
  });

  it("solo deja enviar con todas bien (o sin poder saberlo en pantalla)", () => {
    expect(quizListoParaEnviar([p1, p2], ["b", ""])).toBe(false);
    expect(quizListoParaEnviar([p1, p2], ["b", "y"])).toBe(false);
    expect(quizListoParaEnviar([p1, p2], ["b", "x"])).toBe(true);
    expect(quizListoParaEnviar([p1, desfasada], ["b", "1"])).toBe(true);
    expect(cuantasBien([p1, p2], ["b", "y"])).toBe(1);
  });
});
