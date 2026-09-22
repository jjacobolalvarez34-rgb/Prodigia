import { describe, it, expect, vi } from "vitest";

// AmigosClient.tsx importa "@/i18n/navigation" a nivel de módulo (useRouter),
// que a su vez importa "next/navigation" — Vitest (fuera del bundler real
// de Next) no logra resolver ese subpath ("Cannot find module
// 'next/navigation'..."). Mismo mock local (no global) que
// components/PlacaAmigo.test.ts, solo para que el import no explote —
// este archivo ni siquiera renderiza el componente, solo prueba la
// función pura normalizarNombre.
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

const { normalizarNombre } = await import("./AmigosClient");

// Lógica pura del nuevo buscador local de "Tus amigos" (filtra la
// lista que ya está en el cliente, sin red — distinto del buscador de
// arriba que llama a buscar_usuarios). Extraída para poder probarla
// sin montar todo AmigosClient.
describe("normalizarNombre", () => {
  it("ignora mayúsculas y acentos", () => {
    expect(normalizarNombre("Ágata")).toBe("agata");
    expect(normalizarNombre("JOSÉ")).toBe("jose");
    expect(normalizarNombre("Ñandú")).toBe("nandu");
  });

  it("permite que un filtro sin acento encuentre un nombre con acento", () => {
    const filtro = normalizarNombre("agata");
    const nombre = normalizarNombre("Ágata Fernández");
    expect(nombre.includes(filtro)).toBe(true);
  });

  it("no cambia texto ya en minúsculas sin acentos", () => {
    expect(normalizarNombre("juan perez")).toBe("juan perez");
  });
});
