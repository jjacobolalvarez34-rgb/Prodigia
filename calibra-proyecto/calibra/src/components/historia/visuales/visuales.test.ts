import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_HISTORIA } from "./registro";
import { TIPOS_VISUAL_HISTORIA } from "@/lib/historia/visuales";
import { TECNICAS_HISTORIA, CLASES_HISTORIA } from "@/lib/historia/lecciones";

// Tests de RENDER de los visuales de Historia con react-dom/server (sin navegador),
// mismo patrón que src/components/trigonometria/visuales/visuales.test.ts: marco
// accesible, controles, alternativa textual, cero NaN/undefined y todos los mensajes
// es/en resueltos. El dibujo real (etiquetas, conectores, solapes a 360 px) se vio
// en el navegador.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Historia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Historia: MENSAJES[idioma].Historia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_HISTORIA })
    )
  );
}

const MUESTRAS = [
  { tipo: "historia.linea", hechos: ["escritura-cuneiforme", "piramide-de-keops", "batalla-de-maraton", "asesinato-de-julio-cesar", "caida-de-roma-occidente"] },
  { tipo: "historia.linea", hechos: ["herramientas-de-piedra", "uso-del-fuego", "homo-sapiens", "pinturas-de-lascaux"], escala: "orden" },
  { tipo: "historia.epocas" },
  { tipo: "historia.epocas", resaltar: ["edad-media"], ejemplos: { "edad-media": ["hegira", "peste-negra"], contemporanea: ["waterloo"] } },
  { tipo: "historia.causas", cadena: ["asesinato-de-julio-cesar", "batalla-de-accio", "comienzo-del-imperio-romano"] },
  { tipo: "historia.siglos", ejemplos: [1492, 1900, -44, "batalla-de-maraton", 2001] },
  { tipo: "historia.sincronia", carriles: [{ region: "europa", hechos: ["batalla-de-maraton", "muerte-de-socrates"] }, { region: "asia-sur", hechos: ["ensenanzas-de-buda"] }, { region: "asia-oriental", hechos: ["ensenanzas-de-confucio"] }] },
  { tipo: "historia.personaje", personajes: ["julio-cesar", "cleopatra", "augusto"] },
];

describe("visuales de Historia: se dibujan sin romper (muestras de todos los tipos)", () => {
  it("todos los tipos declarados tienen componente registrado y muestra", () => {
    expect(Object.keys(REGISTRO_VISUALES_HISTORIA).sort()).toEqual([...TIPOS_VISUAL_HISTORIA].sort());
    expect(new Set(MUESTRAS.map((m) => m.tipo))).toEqual(new Set(TIPOS_VISUAL_HISTORIA));
  });

  it("cada muestra se renderiza (animada y estática, es y en) con marco accesible, alternativa textual, controles y sin basura", () => {
    for (const visual of MUESTRAS) {
      for (const estatico of [false, true]) {
        for (const idioma of ["es", "en"]) {
          const salida = html({ ...visual, estatico }, idioma);
          const donde = `${visual.tipo} ${JSON.stringify(visual).slice(0, 70)} estatico=${estatico} ${idioma}`;
          expect(salida.length, donde).toBeGreaterThan(300);
          expect(salida, donde).toContain('role="group"');
          expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
          expect(salida, donde).toContain("<figcaption");
          expect(salida.replace(/<annotation[\s\S]*?<\/annotation>/g, ""), donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
          expect(salida, donde).not.toContain("Historia.visuales");
          expect(salida, donde).not.toContain("Aprender.visual");
          expect(salida, donde).toContain("<button");
        }
      }
    }
  });

  it("el dibujo va en aria-hidden y lo que lee un lector de pantalla es la alternativa textual con todos los nombres", () => {
    const salida = html(MUESTRAS[0]);
    expect(salida).toContain('aria-hidden="true"');
    const alt = salida.match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1];
    for (const n of ["Invención de la escritura en Sumeria", "Batalla de Maratón", "Asesinato de Julio César", "Caída del Imperio romano de Occidente"]) expect(alt).toContain(n);
    expect(alt).toContain("44 a. C.");
  });

  it("los nombres de época y región se muestran en el idioma de la interfaz", () => {
    expect(html(MUESTRAS[2], "es")).toContain("Edad Media");
    expect(html(MUESTRAS[2], "en")).toContain("Middle Ages");
    expect(html(MUESTRAS[6], "es")).toContain("Asia del Sur");
    expect(html(MUESTRAS[6], "en")).toContain("South Asia");
  });

  it("los datos inválidos se omiten sin romper la lección (el visual devuelve vacío)", () => {
    for (const visual of [
      { tipo: "historia.linea", hechos: ["homo-sapiens"] },
      { tipo: "historia.linea", hechos: "homo-sapiens" },
      { tipo: "historia.linea" },
      { tipo: "historia.linea", hechos: ["homo-sapiens", "no-existe"] },
      { tipo: "historia.causas", cadena: ["primera-guerra-mundial", "asesinato-de-francisco-fernando"] },
      { tipo: "historia.causas" },
      { tipo: "historia.siglos", ejemplos: [] },
      { tipo: "historia.siglos", ejemplos: [0] },
      { tipo: "historia.sincronia", carriles: [] },
      { tipo: "historia.sincronia" },
      { tipo: "historia.personaje", personajes: ["nadie"] },
      { tipo: "historia.personaje" },
      { tipo: "historia.epocas", ejemplos: { antiguedad: ["waterloo"] } },
    ]) {
      expect(html(visual), JSON.stringify(visual)).toBe("");
    }
  });
});

describe("visuales de Historia: las lecciones reales se dibujan sin romper", () => {
  const TODAS = [...TECNICAS_HISTORIA, ...CLASES_HISTORIA];

  it("cada visual de cada Técnica y Clase se renderiza (es y en, animado y estático) y NINGUNO se omite por datos rotos", () => {
    let total = 0;
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        if (!v.tipo.startsWith("historia.")) continue;
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${leccion.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, `${donde}: el visual se omitió`).toBeGreaterThan(300);
            expect(salida, donde).toContain('role="group"');
            expect(salida.replace(/<annotation[\s\S]*?<\/annotation>/g, ""), donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Historia.visuales");
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(400);
  }, 300_000);

  it("CuerpoVisual arma una lección completa (pasos + visuales) sin romper", () => {
    for (const leccion of [TECNICAS_HISTORIA[0], CLASES_HISTORIA[0], CLASES_HISTORIA[10], CLASES_HISTORIA[30]]) {
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Historia: MENSAJES.es.Historia, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: leccion.pasos, visuales: leccion.visuales, registro: REGISTRO_VISUALES_HISTORIA })
        )
      );
      expect(salida).toContain("<figure");
      expect(salida).not.toMatch(/NaN|undefined/);
    }
  });
});
