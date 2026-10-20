import { describe, expect, it } from "vitest";
import { DECIMALES_PI, digitosCorrectos } from "./pi";

describe("dígitos de π", () => {
  it("empieza bien y tiene 1000 decimales", () => {
    expect(DECIMALES_PI.slice(0, 30)).toBe("141592653589793238462643383279");
    expect(DECIMALES_PI).toHaveLength(1000);
    // El famoso «punto de Feynman»: seis 9 seguidos desde el decimal 762.
    expect(DECIMALES_PI.slice(761, 767)).toBe("999999");
  });
  it("cuenta los correctos desde el principio", () => {
    expect(digitosCorrectos("14159")).toBe(5);
    expect(digitosCorrectos("14158")).toBe(4);
    expect(digitosCorrectos("")).toBe(0);
  });
});
