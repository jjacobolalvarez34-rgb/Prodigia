import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BotonEnlace from "@/components/BotonEnlace";

// Mismo motivo que PlacaAmigo.test.ts: next-intl/navigation no resuelve
// "next/navigation" fuera del bundler real de Next, así que se mockea acá,
// local a este archivo, con un <a> real.
vi.mock("@/i18n/navigation", async () => {
  const React = await import("react");
  return {
    Link: ({ href, children, ...rest }: Record<string, unknown>) =>
      React.createElement("a", { href, ...rest }, children as React.ReactNode),
    useRouter: () => ({ push: () => {} }),
    usePathname: () => "/",
    redirect: () => {},
    getPathname: () => "/",
  };
});

describe("BotonEnlace (volver de una página de servidor)", () => {
  it("es un <a href> con la pastilla, la flecha de volver y el color del mundo", () => {
    const html = renderToStaticMarkup(
      <BotonEnlace href="/perfil" variante="secundario" atras tamano="sm" colorHex="#0E9F6E">
        Volver al perfil
      </BotonEnlace>
    );
    expect(html).toContain('<a href="/perfil"');
    expect(html).not.toContain("<button");
    expect(html).toContain("Volver al perfil");
    expect(html).toContain("rounded-full");
    expect(html).toContain("M19 12H5");
    expect(html).toContain("h-6 w-6");
    expect(html).toContain("--boton-acento:#0E9F6E");
  });

  it("sin colorHex usa el violeta de marca por defecto", () => {
    const html = renderToStaticMarkup(
      <BotonEnlace href="/" variante="secundario" atras>
        Volver
      </BotonEnlace>
    );
    expect(html).toContain("--boton-acento:#6C4CF1");
  });
});
