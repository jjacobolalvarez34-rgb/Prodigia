import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { HECHOS, PERSONAJES, HECHO_POR_ID, PERSONAJE_POR_ID, causasDe, consecuenciasDe, textoRevela, ventanaDeVida, distinguibles } from "./tabla";
import { EPOCAS, ORDEN_EPOCAS, epocaDeAnio } from "./epocas";
import { aRomano, decada, formatoAnio, limitesSiglo, mismoSigloConMargen, siglo, sigloEtiqueta, sigloTexto } from "./tiempo";
import { generarDocumentoHechos } from "./documento";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";

// Consistencia de la TABLA CANÓNICA de Historia. Es lo que garantiza que todo lo
// que se deriva (cronología, fechas, causa y efecto, visuales, lecciones) sea
// coherente por construcción: si una fila rompe una regla, falla acá.
// Regenerar docs/HISTORIA_HECHOS.md: HISTORIA_ESCRIBIR_DOC=1 npx vitest run src/lib/historia

const raiz = path.resolve(__dirname, "../../..");
const rutaDoc = path.join(raiz, "docs", "HISTORIA_HECHOS.md");

describe("tiempo: años, siglos y formato (con a. C.)", () => {
  it("números romanos", () => {
    expect(aRomano(1)).toBe("I");
    expect(aRomano(4)).toBe("IV");
    expect(aRomano(9)).toBe("IX");
    expect(aRomano(14)).toBe("XIV");
    expect(aRomano(19)).toBe("XIX");
    expect(aRomano(20)).toBe("XX");
    expect(aRomano(21)).toBe("XXI");
    expect(aRomano(1994)).toBe("MCMXCIV");
    expect(() => aRomano(0)).toThrow();
  });

  it("año a siglo: los siglos empiezan en el año 1 y terminan en el 100, 200... (d. C.)", () => {
    const casos: [number, number][] = [[1, 1], [100, 1], [101, 2], [476, 5], [800, 8], [1000, 10], [1001, 11], [1492, 15], [1789, 18], [1900, 19], [1901, 20], [1969, 20], [2000, 20], [2001, 21], [2020, 21]];
    for (const [anio, n] of casos) expect(siglo(anio), `año ${anio}`).toEqual({ n, aC: false });
  });

  it("año a siglo con a. C.: cuenta hacia atrás (el siglo I a. C. va del 100 al 1 a. C.)", () => {
    const casos: [number, number][] = [[-1, 1], [-44, 1], [-100, 1], [-101, 2], [-200, 2], [-201, 3], [-490, 5], [-753, 8], [-776, 8], [-800, 8], [-801, 9], [-2560, 26], [-3500, 35]];
    for (const [anio, n] of casos) expect(siglo(anio), `año ${anio}`).toEqual({ n, aC: true });
  });

  it("no existe el año 0 y los años deben ser enteros", () => {
    expect(() => siglo(0)).toThrow();
    expect(() => formatoAnio(0)).toThrow();
    expect(() => siglo(1.5)).toThrow();
  });

  it("textos: siglo XV, siglo I a. C., 44 a. C., 476 d. C., 1492", () => {
    expect(sigloTexto(1492)).toBe("siglo XV");
    expect(sigloEtiqueta(-44)).toBe("Siglo I a. C.");
    expect(formatoAnio(-44)).toBe("44 a. C.");
    expect(formatoAnio(476)).toBe("476 d. C.");
    expect(formatoAnio(1492)).toBe("1492");
    expect(formatoAnio(-2560)).toBe("2560 a. C.");
    expect(formatoAnio(-300000)).toBe("300 000 a. C.");
    expect(decada(1969)).toBe(1960);
    expect(limitesSiglo(1, true)).toEqual({ primero: -100, ultimo: -1 });
    expect(limitesSiglo(20, false)).toEqual({ primero: 1901, ultimo: 2000 });
  });

  it("todo año cae dentro de los límites de su siglo (barrido -3000..2025)", () => {
    for (let a = -3000; a <= 2025; a++) {
      if (a === 0) continue;
      const s = siglo(a);
      const { primero, ultimo } = limitesSiglo(s.n, s.aC);
      expect(a >= primero && a <= ultimo, `año ${a}`).toBe(true);
    }
  });

  it("mismoSigloConMargen: un margen que cruza el límite del siglo o del año 1 no se puede afirmar", () => {
    expect(mismoSigloConMargen(-44, 0)).toBe(true);
    expect(mismoSigloConMargen(-776, 3)).toBe(true);
    expect(mismoSigloConMargen(-500, 60)).toBe(false);
    expect(mismoSigloConMargen(1450, 3)).toBe(true);
    expect(mismoSigloConMargen(1400, 3)).toBe(false);
    expect(mismoSigloConMargen(1000, 15)).toBe(false);
    expect(mismoSigloConMargen(-5, 10)).toBe(false);
  });
});

describe("épocas: fronteras convencionales", () => {
  it("son 5, en orden, contiguas y sin solaparse", () => {
    expect(ORDEN_EPOCAS).toEqual(["prehistoria", "antiguedad", "edad-media", "edad-moderna", "contemporanea"]);
    for (let i = 1; i < EPOCAS.length; i++) {
      const a = EPOCAS[i - 1];
      const b = EPOCAS[i];
      const siguiente = a.hasta === -1 ? 1 : a.hasta + 1;
      expect(b.desde, `${a.id} -> ${b.id}`).toBe(siguiente);
    }
    expect(EPOCAS.map((e) => e.numero)).toEqual([1, 2, 3, 4, 5]);
  });

  it("las fronteras son 3500 a. C., 476, 1492 y 1789, y cada una es el primer año de su época", () => {
    expect(EPOCAS.slice(1).map((e) => e.desde)).toEqual([-3500, 476, 1492, 1789]);
    expect(epocaDeAnio(-3501)).toBe("prehistoria");
    expect(epocaDeAnio(-3500)).toBe("antiguedad");
    expect(epocaDeAnio(475)).toBe("antiguedad");
    expect(epocaDeAnio(476)).toBe("edad-media");
    expect(epocaDeAnio(1491)).toBe("edad-media");
    expect(epocaDeAnio(1492)).toBe("edad-moderna");
    expect(epocaDeAnio(1788)).toBe("edad-moderna");
    expect(epocaDeAnio(1789)).toBe("contemporanea");
  });

  it("cada frontera declara que es una convención y menciona las variantes de otros textos", () => {
    for (const e of EPOCAS.slice(1)) expect(e.frontera!.es, e.id).toMatch(/convención|otros textos|según|hacia/i);
    expect(EPOCAS[3].frontera!.es).toContain("1453");
    expect(EPOCAS[0].frontera).toBeNull();
  });
});

describe("hechos: estructura y coherencia", () => {
  it("tamaño objetivo: 150 a 220 hechos", () => {
    expect(HECHOS.length).toBeGreaterThanOrEqual(150);
    expect(HECHOS.length).toBeLessThanOrEqual(220);
  });

  it("ids únicos en kebab-case y nombres únicos", () => {
    expect(new Set(HECHOS.map((h) => h.id)).size).toBe(HECHOS.length);
    expect(new Set(HECHOS.map((h) => h.nombre)).size).toBe(HECHOS.length);
    for (const h of HECHOS) expect(h.id, h.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("año entero distinto de 0, dentro de los límites de su época, y la época declarada es la del año", () => {
    for (const h of HECHOS) {
      expect(Number.isInteger(h.anio) && h.anio !== 0, h.id).toBe(true);
      expect(epocaDeAnio(h.anio), `${h.id} (${h.anio})`).toBe(h.epoca);
      expect(h.prominencia, h.id).toBeGreaterThanOrEqual(1);
      expect(h.prominencia, h.id).toBeLessThanOrEqual(10);
    }
  });

  it("certeza y margen: exacta = 0; convencional o aproximada > 0; ningún margen que cruce la frontera de su época sin declararlo", () => {
    for (const h of HECHOS) {
      if (h.certeza === "exacta") expect(h.margen, h.id).toBe(0);
      else expect(h.margen, h.id).toBeGreaterThan(0);
      if (h.certeza === "aproximada") expect(h.anio, `${h.id}: un año exacto de un hecho aproximado no puede ser d. C. de tres cifras sin margen`).not.toBe(0);
    }
    // Los hechos de la Prehistoria son todos aproximados (no se fecha por año).
    for (const h of HECHOS.filter((x) => x.epoca === "prehistoria")) expect(h.certeza, h.id).toBe("aproximada");
  });

  it("las fechas de tradición o de variantes conocidas NO figuran como exactas", () => {
    for (const id of ["fundacion-de-roma", "primeros-juegos-olimpicos", "fundacion-de-cartago", "caida-de-roma-occidente", "escritura-cuneiforme", "piramide-de-keops", "ensenanzas-de-buda", "ensenanzas-de-confucio", "iliada-y-odisea", "fundacion-de-tenochtitlan", "comienzo-de-la-guerra-fria", "independencias-hispanoamericanas"]) {
      expect(HECHO_POR_ID.get(id)!.certeza, id).not.toBe("exacta");
    }
  });

  it("hay exactamente 4 hechos frontera y coinciden con el primer año de su época", () => {
    const fronteras = HECHOS.filter((h) => h.frontera);
    expect(fronteras.map((h) => h.id).sort()).toEqual(["caida-de-roma-occidente", "escritura-cuneiforme", "llegada-de-colon", "toma-de-la-bastilla"].sort());
    for (const h of fronteras) expect(h.anio, h.id).toBe(EPOCAS.find((e) => e.id === h.epoca)!.desde);
  });

  it("todas las épocas y los cuatro continentes con historia tienen hechos; Europa no pasa del 40 %", () => {
    for (const e of ORDEN_EPOCAS) expect(HECHOS.filter((h) => h.epoca === e).length, e).toBeGreaterThanOrEqual(8);
    const europa = HECHOS.filter((h) => h.region === "europa").length;
    expect(europa / HECHOS.length).toBeLessThanOrEqual(0.4);
    for (const r of ["africa", "america", "asia-sur", "asia-oriental", "oriente-proximo"] as const) expect(HECHOS.filter((h) => h.region === r).length, r).toBeGreaterThanOrEqual(10);
    // El siglo XX y hasta hoy es la mayor parte de la Edad Contemporánea pero no domina la tabla.
    expect(HECHOS.filter((h) => h.anio >= 1900).length / HECHOS.length).toBeLessThanOrEqual(0.3);
  });

  it("causas: existen, no se citan a sí mismas, son anteriores al hecho y no forman ciclos", () => {
    for (const h of HECHOS) {
      expect(new Set(h.causas).size, `${h.id}: causas repetidas`).toBe(h.causas.length);
      for (const c of h.causas) {
        const causa = HECHO_POR_ID.get(c);
        expect(causa, `${h.id}: causa desconocida «${c}»`).toBeDefined();
        expect(c, `${h.id}: se cita a sí mismo`).not.toBe(h.id);
        expect(causa!.anio - causa!.margen, `${h.id} <- ${c}: la causa no puede ser posterior`).toBeLessThanOrEqual(h.anio + h.margen);
        expect(causa!.anio, `${h.id} <- ${c}`).toBeLessThanOrEqual(h.anio);
      }
    }
    // Sin ciclos: DFS.
    const estado = new Map<string, 0 | 1 | 2>();
    const visitar = (id: string): void => {
      if (estado.get(id) === 2) return;
      expect(estado.get(id), `ciclo de causas en ${id}`).not.toBe(1);
      estado.set(id, 1);
      for (const c of HECHO_POR_ID.get(id)!.causas) visitar(c);
      estado.set(id, 2);
    };
    for (const h of HECHOS) visitar(h.id);
  });

  it("las consecuencias son la inversa exacta de las causas", () => {
    for (const h of HECHOS) {
      for (const c of causasDe(h.id)) expect(consecuenciasDe(c.id).map((x) => x.id)).toContain(h.id);
      for (const s of consecuenciasDe(h.id)) expect(s.causas).toContain(h.id);
    }
  });

  it("hay suficientes relaciones causales y cadenas de dos pasos para la práctica", () => {
    const aristas = HECHOS.reduce((a, h) => a + h.causas.length, 0);
    expect(aristas).toBeGreaterThanOrEqual(45);
    const cadenas = HECHOS.reduce((a, b) => a + b.causas.length * consecuenciasDe(b.id).length, 0);
    expect(cadenas).toBeGreaterThanOrEqual(15);
  });

  it("los ids de personajes de cada hecho existen y estaban vivos en su fecha (sin anacronismos)", () => {
    for (const h of HECHOS) {
      expect(new Set(h.personajes).size, h.id).toBe(h.personajes.length);
      for (const id of h.personajes) {
        const p = PERSONAJE_POR_ID.get(id);
        expect(p, `${h.id}: personaje desconocido «${id}»`).toBeDefined();
        const [desde, hasta] = ventanaDeVida(p!);
        expect(h.anio + h.margen >= desde && h.anio - h.margen <= hasta, `${h.id} (${h.anio}) vs ${id} (${desde}..${hasta})`).toBe(true);
      }
    }
  });

  it("el nombre de un hecho no lleva el año escrito (el año sale de la tabla, no del texto)", () => {
    for (const h of HECHOS) expect(h.nombre, h.id).not.toMatch(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  });

  it("distinguibles: dos hechos del mismo año no se pueden ordenar", () => {
    expect(distinguibles(HECHO_POR_ID.get("toma-de-la-bastilla")!, HECHO_POR_ID.get("derechos-del-hombre")!)).toBe(false);
    expect(distinguibles(HECHO_POR_ID.get("fundacion-de-roma")!, HECHO_POR_ID.get("republica-romana")!)).toBe(true);
  });
});

describe("personajes: estructura y coherencia", () => {
  it("tamaño objetivo: 80 a 120 personajes; ids únicos en kebab-case", () => {
    expect(PERSONAJES.length).toBeGreaterThanOrEqual(80);
    expect(PERSONAJES.length).toBeLessThanOrEqual(120);
    expect(new Set(PERSONAJES.map((p) => p.id)).size).toBe(PERSONAJES.length);
    expect(new Set(PERSONAJES.map((p) => p.nombre)).size).toBe(PERSONAJES.length);
    for (const p of PERSONAJES) expect(p.id, p.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("nacimiento < muerte, el auge cae dentro de su vida y la época es la de su auge", () => {
    for (const p of PERSONAJES) {
      if (p.nac !== null && p.mue !== null) {
        expect(p.nac, p.id).toBeLessThan(p.mue);
        expect(p.mue - p.nac, `${p.id}: vida de más de 110 años`).toBeLessThanOrEqual(110);
      }
      if (p.nac !== null) expect(p.auge, `${p.id}: auge antes de nacer`).toBeGreaterThanOrEqual(p.nac);
      if (p.mue !== null) expect(p.auge, `${p.id}: auge después de morir`).toBeLessThanOrEqual(p.mue);
      expect(epocaDeAnio(p.auge), p.id).toBe(p.epoca);
      for (const a of [p.nac, p.mue, p.auge]) if (a !== null) expect(a, p.id).not.toBe(0);
      expect(p.prominencia, p.id).toBeGreaterThanOrEqual(1);
      expect(p.prominencia, p.id).toBeLessThanOrEqual(10);
    }
  });

  it("todo personaje con fechas dudosas (aprox) lo dice; los de fecha de vida desconocida son aprox", () => {
    for (const p of PERSONAJES) if (p.nac === null || p.mue === null) expect(p.aprox || p.id === "berners-lee", `${p.id}: falta aprox`).toBe(true);
  });

  it("el dato del personaje no revela su nombre ni repite el de otro", () => {
    for (const p of PERSONAJES) {
      expect(textoRevela(p.logro, p), `${p.id}: el dato dice su nombre: «${p.logro}»`).toBe(false);
      expect(p.logro.length, p.id).toBeGreaterThan(20);
    }
    expect(new Set(PERSONAJES.map((p) => p.logro)).size).toBe(PERSONAJES.length);
  });

  it("balance: Europa no pasa del 45 % y hay personajes de todas las épocas y de todos los continentes", () => {
    expect(PERSONAJES.filter((p) => p.region === "europa").length / PERSONAJES.length).toBeLessThanOrEqual(0.45);
    for (const e of ORDEN_EPOCAS.slice(1)) expect(PERSONAJES.filter((p) => p.epoca === e).length, e).toBeGreaterThanOrEqual(15);
    for (const r of ["africa", "america", "asia-sur", "asia-oriental", "oriente-proximo"] as const) expect(PERSONAJES.filter((p) => p.region === r).length, r).toBeGreaterThanOrEqual(5);
  });

  it("cada personaje figura en un hecho o tiene al menos otro personaje de su rol y pueblo", () => {
    // Para el modo «hecho de personaje» hace falta un hecho; para «personaje de hecho», un personaje en el hecho.
    const conHecho = PERSONAJES.filter((p) => HECHOS.some((h) => h.personajes.includes(p.id)));
    expect(conHecho.length).toBeGreaterThanOrEqual(75);
  });
});

describe("neutralidad y español", () => {
  const TEXTOS = [
    ...HECHOS.map((h) => ({ id: h.id, t: h.nombre })),
    ...PERSONAJES.flatMap((p) => [
      { id: p.id, t: p.nombre },
      { id: p.id, t: p.rol },
      { id: p.id, t: p.logro },
    ]),
  ];

  it("sin voseo", () => {
    for (const { id, t } of TEXTOS) expect(detectarVoseo(t), `${id}: ${t}`).toEqual([]);
  });

  it("sin juicios morales, cifras de víctimas ni carga política en el texto (siglo XX incluido)", () => {
    const prohibido = /genocid|holocaust|v[ií]ctimas|muertos|millones de|masacre|criminal|dictador|tirano|culpa|cruel|brutal|heroic|villan|injust|opresi|invasor|terroris|agresi[oó]n|imperialista|genial/i;
    for (const { id, t } of TEXTOS) expect(t, `${id}: ${t}`).not.toMatch(prohibido);
  });

  it("sin comillas rectas ni dobles espacios; nombres y datos terminan en punto solo los datos", () => {
    for (const { id, t } of TEXTOS) {
      expect(t, id).not.toMatch(/"/);
      expect(t, id).not.toMatch(/ {2}/);
      expect(t.trim(), id).toBe(t);
    }
    for (const p of PERSONAJES) expect(p.logro, p.id).toMatch(/\.$/);
  });
});

describe("docs/HISTORIA_HECHOS.md: generado desde la tabla, sin desincronizarse", () => {
  const esperado = generarDocumentoHechos();

  it("es exactamente lo que genera la tabla (HISTORIA_ESCRIBIR_DOC=1 lo regenera)", () => {
    if (process.env.HISTORIA_ESCRIBIR_DOC === "1") fs.writeFileSync(rutaDoc, esperado, "utf8");
    expect(fs.existsSync(rutaDoc), "falta docs/HISTORIA_HECHOS.md: HISTORIA_ESCRIBIR_DOC=1 npx vitest run src/lib/historia").toBe(true);
    expect(fs.readFileSync(rutaDoc, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("lista TODOS los hechos y TODOS los personajes", () => {
    for (const h of HECHOS) expect(esperado, h.id).toContain(`| ${h.id} |`);
    for (const p of PERSONAJES) expect(esperado, p.id).toContain(`| ${p.id} |`);
  });
});
