import { describe, expect, it } from "vitest";
import { cosmeticosDesdeFila } from "@/lib/recompensas/api";
import { CATALOGO_NUEVO } from "@/lib/recompensas/catalogo";
import { conteo, enlaceTienda, estaPuesta, opcionesDe, opcionesFondo, opcionesMarco, opcionesTitulo, type EstadoPlaca, type NombresPlaca } from "./editorPlaca";

const n: NombresPlaca = {
  rango: (s) => `rango:${s}`,
  neon: (s) => `neon:${s}`,
  mundo: (s) => `mundo:${s}`,
  fuente: (v) => `fuente:${v}`,
  animacion: (v) => `anim:${v}`,
  fondo: (v) => `fondo:${v}`,
  ninguno: (s) => `ninguno:${s}`,
};

function estado(extra: Partial<EstadoPlaca> = {}): EstadoPlaca {
  return {
    marco: "ninguno",
    marcos: [],
    fuente: "default",
    fuentes: [],
    animacion: "ninguna",
    animaciones: [],
    fondo: "ninguno",
    fondoUrl: null,
    fondos: [],
    colorNombre: null,
    colorDesbloqueado: false,
    titulo: null,
    titulos: [],
    fuentePuntos: "clasica",
    fuentesPuntos: [],
    cos: cosmeticosDesdeFila(null),
    galeria: [],
    galeriaMia: [],
    nivelesMundo: {},
    esPro: false,
    ...extra,
  };
}

const HOY = "2026-10-30";

describe("editor de la placa", () => {
  it("cada sección empieza con su «sin nada», siempre disponible", () => {
    for (const s of ["fondo", "marco", "fuente", "animacion", "puntos", "titulo", "ciudad", "estela", "efecto", "sonido"] as const) {
      const lista = opcionesDe(s, estado(), n, HOY);
      expect(lista[0].grupo).toBe("base");
      expect(lista[0].tiene).toBe(true);
      expect(new Set(lista.map((o) => o.id)).size).toBe(lista.length);
    }
  });

  it("marca lo que tienes y lo que no, con cómo conseguirlo", () => {
    const lista = opcionesMarco(estado({ marcos: ["oro"], nivelesMundo: { numeria: 12 } }), n, HOY);
    expect(lista.find((o) => o.valor === "oro")?.tiene).toBe(true);
    const plata = lista.find((o) => o.valor === "plata");
    expect(plata?.tiene).toBe(false);
    expect(plata?.como?.tipo).toBe("tienda");
    expect(lista.find((o) => o.valor === "numeria")?.como).toMatchObject({ tipo: "nivelMundo", nivel: 12, requerido: 40 });
  });

  it("no muestra piezas de eventos ni de colección que no tengas", () => {
    const noVendibles = CATALOGO_NUEVO.filter((x) => !x.vendible && x.categoria === "marco").map((x) => x.valor);
    const sin = opcionesMarco(estado(), n, HOY).map((o) => o.valor);
    for (const v of noVendibles) expect(sin).not.toContain(v);
    expect(sin).not.toContain("pionero");
    const con = opcionesMarco(estado({ marcos: ["pionero", "coleccion_quimia"] }), n, HOY);
    expect(con.find((o) => o.valor === "pionero")?.tiene).toBe(true);
    expect(con.find((o) => o.valor === "coleccion_quimia")?.tiene).toBe(true);
  });

  it("el marco de temporada solo aparece el mes en que se vende (o si es tuyo)", () => {
    const valores = opcionesMarco(estado(), n, HOY).map((o) => o.valor);
    // Octubre → temporada 2 (Brasas).
    expect(valores).toContain("temporada_brasas");
    expect(valores).not.toContain("temporada_aurora");
    expect(opcionesMarco(estado({ marcos: ["temporada_aurora"] }), n, HOY).map((o) => o.valor)).toContain("temporada_aurora");
  });

  it("galería y fondo propio comparten «personalizado» pero se distinguen por la imagen", () => {
    const e = estado({
      fondo: "personalizado",
      fondoUrl: "https://x/galeria/a.gif",
      fondos: ["personalizado"],
      galeria: [{ slug: "a", nombre: "A", url: "https://x/galeria/a.gif", costo: 900 }],
      galeriaMia: ["a"],
    });
    const lista = opcionesFondo(e, n, HOY);
    expect(estaPuesta(lista.find((o) => o.id === "galeria:a")!, e)).toBe(true);
    expect(estaPuesta(lista.find((o) => o.id === "personalizado")!, e)).toBe(false);
    const propio = { ...e, fondoUrl: "https://x/fondos/mio.png" };
    expect(estaPuesta(lista.find((o) => o.id === "personalizado")!, propio)).toBe(true);
  });

  it("lo exclusivo de Pro manda a Pro si no lo eres", () => {
    expect(opcionesFondo(estado(), n, HOY).find((o) => o.valor === "prodigio")?.como?.tipo).toBe("pro");
    expect(opcionesFondo(estado({ esPro: true }), n, HOY).find((o) => o.valor === "prodigio")?.como?.tipo).toBe("tienda");
    expect(enlaceTienda({ tipo: "pro", puesto: "estudio", item: "fondo_prodigio" }, "fondo")).toBe("/pro");
  });

  it("los títulos ganados van primero y los de la tienda que ya tienes no se repiten", () => {
    const tienda = CATALOGO_NUEVO.find((x) => x.categoria === "titulo" && x.vendible)!;
    const lista = opcionesTitulo(estado({ titulos: [{ slug: tienda.valor, nombre: tienda.nombre }, { slug: "rango-oro", nombre: "Oro" }], titulo: "rango-oro" }), n, HOY);
    expect(lista.filter((o) => o.valor === tienda.valor)).toHaveLength(1);
    expect(lista[1].grupo).toBe("ganados");
    expect(estaPuesta(lista.find((o) => o.valor === "rango-oro")!, estado({ titulo: "rango-oro" }))).toBe(true);
    expect(estaPuesta(lista[0], estado())).toBe(true);
  });

  it("enlaza al puesto de la tienda con el artículo cuando se vende ahí", () => {
    const x = CATALOGO_NUEVO.find((c) => c.categoria === "ciudad_placa" && c.vendible)!;
    expect(enlaceTienda({ tipo: "tienda", precio: 1, moneda: "chispas", puesto: "estudio", item: x.item }, "ciudad")).toBe(`/tienda?puesto=estudio&item=${x.item}`);
    expect(enlaceTienda({ tipo: "tienda", precio: 1, moneda: "chispas", puesto: "herreria", item: "marco_oro" }, "marco")).toBe("/tienda?puesto=herreria");
  });

  it("cuenta lo tuyo sin el «sin nada»", () => {
    const lista = opcionesDe("fuente", estado({ fuentes: ["mono", "pixel"] }), n, HOY);
    expect(conteo(lista).mios).toBe(2);
  });
});
