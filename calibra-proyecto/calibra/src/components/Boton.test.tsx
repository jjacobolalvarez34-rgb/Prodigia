import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Boton from "@/components/Boton";
import { colorSolidoPrimario } from "@/lib/degradeBoton";

// Regresión: el crash de Codia (2026-09-21) pasó por un bug que solo se
// veía al RENDERIZAR de verdad, no en los tests de generadores que nunca
// ejercitaban el render. Este archivo sí renderiza <Boton> (incluida la
// variante `destacado`, que ahora envuelve con BorderGlow directo — ya no
// hay una placa InsigniaCorte aparte, rediseño 2026-09-24) para no repetir
// ese error.
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

  it("renderiza sin tirar excepción con destacado (BorderGlow + placa de jugar) y no usa el amarillo plano viejo", () => {
    const html = renderToStaticMarkup(
      <Boton variante="primario" destacado>
        Jugar
      </Boton>
    );
    expect(html).toContain("Jugar");
    expect(html.toUpperCase()).not.toContain("#FFC53D");
    // Comprueba el fondo del <button> en sí (no solo que el color exista EN
    // ALGÚN LADO del HTML) — regresión real 2026-09-24: BorderGlow también
    // mete ese mismo hex en `--gradient-base` para el halo, así que un
    // `toContain(colorSolidoPrimario())` suelto pasaba aunque el <button>
    // quedara sin fondo propio (transparente), visto recién en captura.
    expect(html).toContain(`background:${colorSolidoPrimario()}`);
    expect(html).toContain("border-glow-card");
    // Rediseño 2026-09-24: ya no hay placa InsigniaCorte de esquinas
    // cortadas — el CTA destacado es una pastilla redondeada lisa, y ya
    // no lleva la clase de aquella placa.
    expect(html).not.toContain("insignia-corte");
    expect(html).toContain("rounded-full");
  });

  it("destacado sin ícono explícito trae la placa de 'jugar' automática (sin tocar cada llamador)", () => {
    const html = renderToStaticMarkup(
      <Boton variante="primario" destacado>
        Jugar
      </Boton>
    );
    // El triángulo de IconJugar (path relleno, sin trazo).
    expect(html).toContain('fill="currentColor"');
  });

  it("destacado deshabilitado no dibuja el halo de BorderGlow (se vería como un bug, no un estado apagado)", () => {
    const html = renderToStaticMarkup(
      <Boton variante="primario" destacado disabled>
        Jugar
      </Boton>
    );
    expect(html).not.toContain("border-glow-card");
    expect(html).toContain("disabled");
  });

  it("destacado + colorHex + disabled no revienta y conserva el color del mundo", () => {
    const colorNaipia = "#B91C1C";
    const html = renderToStaticMarkup(
      <Boton variante="primario" colorHex={colorNaipia} destacado disabled>
        Iniciar
      </Boton>
    );
    expect(html).toContain("Iniciar");
    expect(html).toContain(`background:${colorSolidoPrimario(colorNaipia)}`);
  });

  it("otras variantes (secundario, fantasma, peligro) siguen renderizando sin excepción", () => {
    expect(() => renderToStaticMarkup(<Boton variante="fantasma">Volver</Boton>)).not.toThrow();
    expect(() => renderToStaticMarkup(<Boton variante="peligro">Eliminar</Boton>)).not.toThrow();
    expect(() => renderToStaticMarkup(<Boton variante="secundario">Aprender</Boton>)).not.toThrow();
  });
});

// Rediseño 2026-09-24 (referencia visual del usuario): pastilla redondeada +
// placa circular con ícono a un lado, y el color del botón sigue al mundo
// (colorHex) — "en momentos normales" (sin colorHex) usa el violeta de
// marca por defecto, nunca queda sin color.
describe("Boton — rediseño de pastilla con placa de ícono (2026-09-24)", () => {
  it("`atras` en un secundario agrega la placa con la flecha a la izquierda, antes del texto", () => {
    const html = renderToStaticMarkup(
      <Boton variante="secundario" atras>
        Volver
      </Boton>
    );
    const iVolver = html.indexOf("Volver");
    const iFlecha = html.indexOf("M19 12H5"); // trazo de IconFlechaAtras
    expect(iFlecha).toBeGreaterThan(-1);
    expect(iFlecha).toBeLessThan(iVolver);
  });

  it("sin `atras` ni `icono`, un secundario no dibuja ninguna placa", () => {
    const html = renderToStaticMarkup(<Boton variante="secundario">Aprender</Boton>);
    expect(html).not.toContain("M19 12H5");
    expect(html).not.toContain("M8 5.14v13.72");
  });

  it("`icono`/`iconoLado` explícitos ganan por encima del atajo automático", () => {
    const html = renderToStaticMarkup(
      <Boton variante="secundario" atras icono={<span data-testid="propio">★</span>} iconoLado="derecha">
        Volver
      </Boton>
    );
    const iVolver = html.indexOf("Volver");
    const iPropio = html.indexOf("propio");
    expect(iPropio).toBeGreaterThan(-1);
    expect(iPropio).toBeGreaterThan(iVolver); // a la derecha del texto
    expect(html).not.toContain("M19 12H5"); // no la flecha automática
  });

  it("el color del botón sigue al mundo (colorHex) y por defecto es el violeta de marca (--boton-acento)", () => {
    const conMundo = renderToStaticMarkup(
      <Boton variante="secundario" colorHex="#0E9F6E" atras>
        Volver
      </Boton>
    );
    const sinMundo = renderToStaticMarkup(
      <Boton variante="secundario" atras>
        Volver
      </Boton>
    );
    expect(conMundo).toContain("--boton-acento:#0E9F6E");
    expect(sinMundo).toContain("--boton-acento:#6C4CF1");
  });

  it("cargando reemplaza cualquier ícono por el spinner (nunca los dos a la vez)", () => {
    const html = renderToStaticMarkup(
      <Boton variante="primario" destacado cargando>
        Jugar
      </Boton>
    );
    expect(html).toContain("animate-spin");
    expect(html).not.toContain('fill="currentColor"');
  });
});
