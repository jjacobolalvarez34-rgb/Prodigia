import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import Pentagrama from "@/components/melodia/Pentagrama";
import { limitesVerticalesPentagrama } from "@/components/melodia/Pentagrama";
import { REGISTRO_VISUALES_MELODIA } from "./registro";
import { TECNICAS_MELODIA, CLASES_MELODIA } from "@/lib/melodia/lecciones";
import {
  esTeclaNegra,
  etiquetaSalto,
  formatoHz,
  formatoRazon,
  geometriaTeclado,
  parseNota,
  resolverAcorde,
  resolverEscala,
  resolverFrecuencia,
  resolverNotas,
  resolverRitmo,
  resolverTeclado,
} from "@/lib/melodia/visualesDatos";
import {
  LETRAS,
  construirAcorde,
  construirEscala,
  frecuenciaDeNota,
  semitonoAbsoluto,
  type NotaMusical,
  type TipoAcorde,
  type TipoEscala,
} from "@/lib/practica/melodia";

// Tests de RENDER de los visuales de Melodía con react-dom/server (sin
// navegador), mismo patrón que src/components/anatomia/visuales/visuales.test.ts.
// El dibujo real (teclado, pentagrama, animación) se vio en el navegador.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Melodia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function envolver(hijo: ReturnType<typeof createElement>, idioma = "es") {
  return createElement(
    Proveedor,
    {
      locale: idioma,
      timeZone: "UTC",
      messages: { Melodia: MENSAJES[idioma].Melodia, Aprender: MENSAJES[idioma].Aprender } as never,
      onError: (e: unknown) => {
        throw e; // un mensaje faltante o mal formateado rompe el test
      },
    },
    hijo
  );
}

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(envolver(createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_MELODIA }), idioma));
}

const TODAS = [...TECNICAS_MELODIA, ...CLASES_MELODIA];
const nota = (s: string) => parseNota(s)!;

describe("visuales de Melodía: las 36 lecciones reales se dibujan sin romper", () => {
  it("cada visual se renderiza (animado y estático, es y en) con marco accesible, controles y alternativa textual", () => {
    let total = 0;
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${leccion.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(300);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Melodia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button"); // controles
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(200);
  }, 120_000);

  it("los mensajes es/en de Melodia.visuales tienen exactamente las mismas claves", () => {
    const claves = (o: unknown, pre = ""): string[] =>
      Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => (typeof v === "object" && v !== null ? claves(v, `${pre}${k}.`) : [`${pre}${k}`]));
    expect(claves(MENSAJES.en.Melodia && (MENSAJES.en.Melodia as Record<string, unknown>).visuales).sort()).toEqual(
      claves((MENSAJES.es.Melodia as Record<string, unknown>).visuales).sort()
    );
  });
});

describe("audio: solo por gesto del usuario", () => {
  it("los visuales con «escuchar» dibujan un botón pero ningún <audio> ni reproducción al montar", () => {
    const salida = html({ tipo: "melodia.escala", escala: { fundamental: "Do4", tipo: "mayor" }, escuchar: true, estatico: true });
    expect(salida).toContain("Escuchar");
    expect(salida).not.toContain("<audio");
    expect(html({ tipo: "melodia.escala", escala: { fundamental: "Do4", tipo: "mayor" }, escuchar: true, estatico: true }, "en")).toContain("Listen");
    expect(html({ tipo: "melodia.escala", escala: { fundamental: "Do4", tipo: "mayor" }, estatico: true })).not.toContain("Escuchar");
  });

  it("el código de los visuales solo llama a reproducirNotaMusical dentro del onClick (nunca en un efecto ni al montar)", () => {
    const dir = path.join(raiz, "src", "components", "melodia", "visuales");
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".tsx"))) {
      const codigo = fs.readFileSync(path.join(dir, f), "utf8");
      if (f !== "comun.tsx") {
        expect(codigo, f).not.toContain("reproducirNotaMusical");
        continue;
      }
      // Todo useEffect del archivo (solo limpia temporizadores) no reproduce nada.
      for (const efecto of codigo.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\}, \[[^\]]*\]\);/g)) expect(efecto[1]).not.toContain("reproducirNotaMusical");
      const dentro = codigo.slice(codigo.indexOf("function escuchar()"));
      expect(dentro).toContain("reproducirNotaMusical");
      expect(codigo.slice(0, codigo.indexOf("function escuchar()"))).not.toMatch(/reproducirNotaMusical\(/);
    }
  });
});

describe("dispatcher: datos malos se omiten sin romper", () => {
  it("un visual con datos inválidos no dibuja nada", () => {
    expect(html({ tipo: "melodia.pentagrama", notas: ["Xx9"] })).toBe("");
    expect(html({ tipo: "melodia.pentagrama" })).toBe("");
    expect(html({ tipo: "melodia.teclado", notas: [] })).toBe("");
    expect(html({ tipo: "melodia.teclado", notas: ["Do4"], desde: "Mi9", hasta: "Do4" })).toBe(html({ tipo: "melodia.teclado", notas: ["Do4"], desde: "Mi9", hasta: "Do4" }));
    expect(html({ tipo: "melodia.escala", escala: { fundamental: "Do4", tipo: "marciana" } })).toBe("");
    expect(html({ tipo: "melodia.acorde", acorde: { fundamental: "Zz4", tipo: "mayor" } })).toBe("");
    expect(html({ tipo: "melodia.ritmo", figuras: ["semifusa"] })).toBe("");
    expect(html({ tipo: "melodia.frecuencia", notas: ["La4"] })).toBe("");
  });
});

describe("melodia.pentagrama", () => {
  it("dibuja el pentagrama de la Práctica con las notas y sus nombres, y la alternativa textual las declara", () => {
    const salida = html({ tipo: "melodia.pentagrama", notas: ["Mi4", "Sol4", "Si4"], estatico: true });
    for (const n of ["Mi4", "Sol4", "Si4"]) expect(salida).toContain(n);
    expect(salida).toContain("Pentagrama en clave de sol: Mi4, Sol4, Si4.");
    expect((salida.match(/<ellipse/g) ?? []).length).toBe(3);
    expect((salida.match(/<line/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });

  it("estático: todas las notas visibles; animado: sin reproducir aún solo se ve la primera", () => {
    const estatica = html({ tipo: "melodia.pentagrama", notas: ["Do4", "Re4", "Mi4"], estatico: true });
    expect((estatica.match(/opacity:1/g) ?? []).length).toBe(3);
    const animada = html({ tipo: "melodia.pentagrama", notas: ["Do4", "Re4", "Mi4"] });
    expect((animada.match(/opacity:1/g) ?? []).length).toBe(1);
    expect((animada.match(/opacity:0/g) ?? []).length).toBe(2);
  });

  it("etiquetas: nombre con octava, solo la letra o ninguna; escalas y acordes salen de las funciones de la práctica", () => {
    expect(html({ tipo: "melodia.pentagrama", notas: ["Sol♯4"], etiquetas: "letra", estatico: true })).toContain(">Sol♯<");
    expect(html({ tipo: "melodia.pentagrama", escala: { fundamental: "Sol4", tipo: "mayor" }, estatico: true })).toContain("Fa♯5");
    expect(html({ tipo: "melodia.pentagrama", acorde: { fundamental: "Do4", tipo: "menor", bemoles: true }, estatico: true })).toContain("Mi♭4");
  });

  it("BUG CORREGIDO: el viewBox crece para que ninguna cabeza quede fuera del dibujo (Do3/Re3 y acordes de 11 y 13 desde La4 o Si4)", () => {
    const TIPOS: TipoAcorde[] = ["mayor", "menor", "disminuido", "aumentado", "maj7", "dominante7", "menor7", "disminuido7", "sus2", "sus4", "add9", "novena", "oncena", "trecena"];
    const cy = (s: string) => [...s.matchAll(/<ellipse[^>]*cy="([-\d.]+)"/g)].map((m) => Number(m[1]));
    let fueraDelViejo = 0;
    let total = 0;
    const revisar = (notas: NotaMusical[], donde: string) => {
      const salida = renderToStaticMarkup(envolver(createElement(Pentagrama, { notas, disposicion: "simultanea" })));
      const vb = /viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/.exec(salida)!;
      const minY = Number(vb[2]);
      const alto = Number(vb[4]);
      for (const y of cy(salida)) {
        expect(y - 6.5, `${donde}: cabeza cortada arriba`).toBeGreaterThanOrEqual(minY);
        expect(y + 6.5, `${donde}: cabeza cortada abajo`).toBeLessThanOrEqual(minY + alto);
      }
      // Cómo era el viewBox fijo anterior (0-140): ¿alguna cabeza se salía?
      if (cy(salida).some((y) => y - 6.5 < 0 || y + 6.5 > 140)) fueraDelViejo++;
      total++;
    };
    for (const letra of LETRAS) {
      for (const octava of [3, 4]) {
        for (const tipo of TIPOS) for (const bem of [false, true]) revisar(construirAcorde({ letra, octava, alteracion: null }, tipo, bem), `${letra}${octava} ${tipo}`);
        for (const tipo of ["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"] as TipoEscala[]) {
          revisar(construirEscala({ letra, octava, alteracion: null }, tipo, false), `escala ${letra}${octava} ${tipo}`);
        }
      }
    }
    expect(total).toBe(448);
    // Documenta el error de la Práctica: con el viewBox viejo (0-140) había notas cortadas en 72 de estos 448 casos (escalas y acordes desde Do3/Re3, y oncenas/trecenas desde La4/Si4).
    expect(fueraDelViejo).toBe(72);
  }, 60_000);

  it("sin regresión: una nota dentro del pentagrama conserva el viewBox 0 0 140 140 de siempre", () => {
    const salida = renderToStaticMarkup(envolver(createElement(Pentagrama, { notas: [nota("Sol4")], disposicion: "simultanea" })));
    expect(salida).toContain('viewBox="0 0 140 140"');
    expect(limitesVerticalesPentagrama([nota("Do4")])).toEqual({ minY: 0, maxY: 140 });
    expect(limitesVerticalesPentagrama([nota("Do3")]).maxY).toBeGreaterThan(140);
    expect(limitesVerticalesPentagrama([{ letra: "Sol", octava: 6, alteracion: "sostenido" }]).minY).toBeLessThan(0);
  });
});

describe("melodia.teclado: geometría", () => {
  it("Do4 a Do5: 8 teclas blancas y 5 negras; cada negra queda en el borde entre dos blancas", () => {
    const g = geometriaTeclado(semitonoAbsoluto(nota("Do4")), semitonoAbsoluto(nota("Do5")));
    expect(g.blancas).toBe(8);
    expect(g.teclas.filter((t) => t.negra)).toHaveLength(5);
    expect(g.teclas).toHaveLength(13);
    for (const negra of g.teclas.filter((t) => t.negra)) {
      const izq = g.teclas.find((t) => !t.negra && t.semitono === negra.semitono - 1)!;
      const der = g.teclas.find((t) => !t.negra && t.semitono === negra.semitono + 1)!;
      expect(negra.centro).toBe((izq.centro + der.centro) / 2);
    }
  });

  it("un rango que empieza o termina en tecla negra se completa con las blancas vecinas", () => {
    const g = geometriaTeclado(semitonoAbsoluto(nota("Do♯4")), semitonoAbsoluto(nota("La♯4")));
    expect(esTeclaNegra(g.desde)).toBe(false);
    expect(esTeclaNegra(g.hasta)).toBe(false);
    expect(g.desde).toBe(semitonoAbsoluto(nota("Do4")));
    expect(g.hasta).toBe(semitonoAbsoluto(nota("Si4")));
  });

  it("solo Do4-Mi4 -> Mi-Fa y Si-Do son los pares de blancas sin negra en medio (el patrón de 2 y 3 negras)", () => {
    const g = geometriaTeclado(semitonoAbsoluto(nota("Do4")), semitonoAbsoluto(nota("Do5")));
    const blancas = g.teclas.filter((t) => !t.negra);
    const sinNegra = blancas.filter((t, i) => i < blancas.length - 1 && blancas[i + 1].semitono - t.semitono === 1);
    expect(sinNegra.map((t) => t.semitono % 12)).toEqual([4, 11]); // Mi y Si
    const pcNegras = g.teclas.filter((t) => t.negra).map((t) => t.semitono % 12);
    expect(pcNegras).toEqual([1, 3, 6, 8, 10]); // grupo de 2: Do♯ Re♯; grupo de 3: Fa♯ Sol♯ La♯
  });

  it("notas resaltadas fuera del rango pedido descartan el visual; el rango por defecto es el de las notas", () => {
    expect(resolverTeclado({ notas: ["Do4", "Do5"], desde: "Do4", hasta: "Sol4" })).toBeNull();
    expect(resolverTeclado({ notas: ["Do4", "Sol4"] })!.geometria.blancas).toBe(5);
    expect(resolverTeclado({ notas: ["Do4", "Fa4"], saltos: true })!.saltos).toEqual([5]);
  });

  it("los saltos de una escala son T, S y 1½ según la fórmula; en inglés H y W", () => {
    const r = resolverEscala({ fundamental: "Do4", tipo: "mayor" })!;
    const saltos = r.notas.slice(1).map((n, i) => semitonoAbsoluto(n) - semitonoAbsoluto(r.notas[i]));
    expect(saltos.map((s) => etiquetaSalto(s)).join("")).toBe("TTSTTTS");
    expect(saltos.map((s) => etiquetaSalto(s, "en")).join("")).toBe("WWHWWWH");
    expect(etiquetaSalto(3)).toBe("1½");
    expect(etiquetaSalto(5)).toBe("5");
  });

  it("el teclado dibuja el nombre de las notas resaltadas y los saltos de la escala", () => {
    const salida = html({ tipo: "melodia.escala", escala: { fundamental: "Sol4", tipo: "mayor" }, estatico: true });
    expect(salida).toContain("Fa♯");
    expect(salida).toContain(">T<");
    expect(salida).toContain(">S<");
    const acorde = html({ tipo: "melodia.acorde", acorde: { fundamental: "Do4", tipo: "menor", bemoles: true }, estatico: true });
    expect(acorde).toContain("Mi♭");
    expect(acorde).toContain("Grado 3");
    expect(acorde).toContain("+3 semitonos");
    expect(html({ tipo: "melodia.teclado", notas: ["Do4", "Re4"], cifrado: true, estatico: true })).toContain(">C<");
  });
});

describe("melodia.acorde, escala, ritmo y frecuencia: datos", () => {
  it("resolver* usa las funciones de la práctica: nada tipeado", () => {
    expect(resolverEscala({ fundamental: "Fa4", tipo: "mayor", bemoles: true })!.notas).toEqual(construirEscala(nota("Fa4"), "mayor", true));
    expect(resolverAcorde({ fundamental: "Do4", tipo: "novena", bemoles: true })!.notas).toEqual(construirAcorde(nota("Do4"), "novena", true));
    expect(resolverFrecuencia({ notas: ["La3", "La4"] }).map((f) => f.hz)).toEqual([frecuenciaDeNota(nota("La3")), frecuenciaDeNota(nota("La4"))]);
  });

  it("parseNota: solo notas válidas; descarta lo demás", () => {
    expect(parseNota("Do4")).toEqual({ letra: "Do", octava: 4, alteracion: null });
    expect(parseNota("Si♭3")).toEqual({ letra: "Si", octava: 3, alteracion: "bemol" });
    expect(parseNota("Fa♯5")!.alteracion).toBe("sostenido");
    for (const malo of ["do4", "Do", "Do44", "Xx4", "Do#4", 4, null, undefined, {}]) expect(parseNota(malo)).toBeNull();
    expect(resolverNotas(["Do4", "malo", "Re4"], 10)).toHaveLength(2);
    expect(resolverNotas("Do4", 10)).toEqual([]);
  });

  it("ritmo: sin repetidas ni figuras inválidas, con la duración y la fracción del compás de 4/4", () => {
    const r = resolverRitmo({ figuras: ["redonda", "redonda", "semifusa" as never, "corchea"] });
    expect(r.map((f) => [f.figura, f.pulsos, f.fraccionCompas])).toEqual([
      ["redonda", 4, 1],
      ["corchea", 0.5, 0.125],
    ]);
    const salida = html({ tipo: "melodia.ritmo", figuras: ["redonda", "blanca", "negra", "corchea"], estatico: true });
    expect(salida).toContain("4 pulsos");
    expect(salida).toContain("2 pulsos");
    expect(salida).toContain("1 pulso<");
    expect(salida).toContain("medio pulso");
    expect(html({ tipo: "melodia.ritmo", figuras: ["negra"], estatico: true }, "en")).toContain("Quarter note");
  });

  it("frecuencia: la octava duplica, el semitono multiplica por 2^(1/12), con coma decimal en español y punto en inglés", () => {
    const r = resolverFrecuencia({ notas: ["La3", "La4", "La5"] });
    expect(r.map((f) => f.razon)).toEqual([null, 2, 2]);
    expect(r.map((f) => f.octavasDesdeLaPrimera)).toEqual([0, 1, 2]);
    expect(formatoRazon(2)).toBe("×2");
    expect(formatoRazon(Math.pow(2, 1 / 12))).toBe("×1,0595");
    expect(formatoRazon(Math.pow(2, 1 / 12), "en")).toBe("×1.0595");
    expect(formatoHz(frecuenciaDeNota(nota("Do4")))).toBe("261,63 Hz");
    expect(formatoHz(440, "en")).toBe("440 Hz");
    const salida = html({ tipo: "melodia.frecuencia", notas: ["La3", "La4", "La5"], estatico: true });
    for (const t of ["220 Hz", "440 Hz", "880 Hz", "×2"]) expect(salida).toContain(t);
    expect(html({ tipo: "melodia.frecuencia", notas: ["Do4", "Do♯4"], estatico: true })).toContain("×1,0595");
  });
});
