import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Boton from "@/components/Boton";
import { colorSolidoPrimario } from "@/lib/degradeBoton";

// Regresión: el crash de Codia (2026-09-21) pasó por un bug que solo se
// veía al RENDERIZAR de verdad, no en los tests de generadores que nunca
// ejercitaban el render. Este archivo sí renderiza <Boton> (incluida la
// variante `destacado`, que ahora envuelve con InsigniaCorte + BorderGlow)
// para no repetir ese error.
describe("Boton (primario)", () => {
  it("renderiza sin tirar excepción sin colorHex y usa el color sólido nuevo (no #FFC53D crudo)", () => {
    const html = renderToStaticMarkup(<Boton variante="primario">Continuar</Boton>);
    expect(html).toContain("Continuar");
    expect(html.toUpperCase()).not.toContain("#FFC53D");
    expect(html).toContain(colorSolidoPrimario());
  });

  it("renderiza sin tirar excepción con colorHex (Calculia) y usa el color sólido de ese mundo", () => {
    const colorCalculia = "#4338CA";
    const html = renderToStaticMarkup(
      <Boton variante="primario" colorHex={colorCalculia}>
        Practicar
      </Boton>
    );
    expect(html).toContain("Practicar");
    expect(html.toUpperCase()).not.toContain("#FFC53D");
    expect(html).toContain(colorSolidoPrimario(colorCalculia));
  });

  it("renderiza sin tirar excepción con destacado (BorderGlow + InsigniaCorte) y no usa el amarillo plano viejo", () => {
    const html = renderToStaticMarkup(
      <Boton variante="primario" destacado>
        Jugar
      </Boton>
    );
    expect(html).toContain("Jugar");
    expect(html.toUpperCase()).not.toContain("#FFC53D");
    // El fondo sólido ahora lo pone InsigniaCorte (no el <button>).
    expect(html).toContain(colorSolidoPrimario());
    expect(html).toContain("insignia-corte");
    expect(html).toContain("border-glow-card");
  });

  it("destacado + colorHex + disabled no revienta y conserva el color del mundo", () => {
    const colorNaipia = "#B91C1C";
    const html = renderToStaticMarkup(
      <Boton variante="primario" colorHex={colorNaipia} destacado disabled>
        Iniciar
      </Boton>
    );
    expect(html).toContain("Iniciar");
    expect(html).toContain(colorSolidoPrimario(colorNaipia));
  });

  it("otras variantes (secundario, fantasma, peligro) siguen renderizando sin excepción", () => {
    expect(() => renderToStaticMarkup(<Boton variante="fantasma">Volver</Boton>)).not.toThrow();
    expect(() => renderToStaticMarkup(<Boton variante="peligro">Eliminar</Boton>)).not.toThrow();
    expect(() => renderToStaticMarkup(<Boton variante="secundario">Aprender</Boton>)).not.toThrow();
  });
});
