import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TECNICAS_ANATOMIA, CLASES_ANATOMIA, SLUGS_TECNICAS_HISTORICAS } from "./index";
import { generarSqlAnatomia, ARCHIVO_MIGRACION_ANATOMIA } from "./sql";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_ANATOMIA } from "@/components/anatomia/visuales/registro";
import {
  ENTRADAS_MUSCULOS_GRANDES,
  ENTRADAS_ORGANOS,
  CAVIDADES,
  PARES_CRANEALES,
  FLUJO_ALIMENTO,
  FLUJO_AIRE,
  FLUJO_SANGRE,
  FLUJO_ORINA,
  FLUJO_ARCO_REFLEJO,
} from "@/lib/anatomia/datos";
import {
  MAX_ENTRADAS_CUERPO,
  MAX_ETAPAS,
  MAX_GRUPOS,
  MAX_HUESOS_ESQUELETO,
  resolverEntradasCuerpo,
  resolverEtapas,
  resolverGrupos,
  resolverHuesos,
  textoDeVisual,
} from "@/lib/anatomia/visualesDatos";
import {
  HUESO_CLICKEABLE,
  OSEO_BAJO,
  OSEO_ALTO,
  MUSCULAR_BAJO,
  MUSCULAR_ALTO,
  ORGANOS,
  NERVIOSO_BAJO,
  NERVIOSO_ALTO,
} from "@/lib/practica/anatomia";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";

// Verificación del contenido de Aprender de Anatomía (21 Técnicas + 22
// Clases): estructura, visuales, cobertura de TODO lo que evalúa la práctica
// y datos anatómicos cruzados contra una TABLA DE REFERENCIA escrita aparte,
// aquí mismo (no sale del contenido que verifica). Regenerar la migración:
//   ANATOMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/anatomia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const rutaMigracion = path.join(raiz, "supabase", "migrations", ARCHIVO_MIGRACION_ANATOMIA);

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_ANATOMIA)]);
const TODAS = [...TECNICAS_ANATOMIA, ...CLASES_ANATOMIA];
const GRUPOS = ["oseo", "muscular", "organos", "nervioso"] as const;

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Texto completo enseñado por una lección: pasos, quiz y el texto de todos
// sus visuales (nombres resueltos incluidos).
function corpus(l: (typeof TODAS)[number]): string {
  return norm(
    [
      l.nombre,
      l.descripcion,
      ...l.pasos,
      ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion]),
      ...l.visuales.map((v) => textoDeVisual(v as unknown as { tipo: string } & Record<string, unknown>)),
      ...l.visuales.map((v) => v.titulo ?? ""),
    ].join(" \n ")
  );
}

// ---------------------------------------------------------------------------
// Tabla de referencia (independiente del contenido). Nivel colegio, según la
// Terminología Anatómica Internacional y los textos de referencia habituales.
// ---------------------------------------------------------------------------
const REF = {
  paresCraneales: [
    [1, "I", "Olfatorio", "S"],
    [2, "II", "Óptico", "S"],
    [3, "III", "Oculomotor", "M"],
    [4, "IV", "Troclear", "M"],
    [5, "V", "Trigémino", "B"],
    [6, "VI", "Abducens", "M"],
    [7, "VII", "Facial", "B"],
    [8, "VIII", "Vestibulococlear", "S"],
    [9, "IX", "Glosofaríngeo", "B"],
    [10, "X", "Vago", "B"],
    [11, "XI", "Accesorio", "M"],
    [12, "XII", "Hipogloso", "M"],
  ] as [number, string, string, string][],
  craneo: { craneales: 8, faciales: 14, total: 22 },
  mano: { carpianos: 8, metacarpianos: 5, falanges: 14 },
  pie: { tarsianos: 7, metatarsianos: 5, falanges: 14 },
  columna: { cervicales: 7, toracicas: 12, lumbares: 5, sacro: 5, coccix: 4 },
  costillas: { pares: 12, verdaderas: 7 },
  esqueleto: { total: 206, axial: 80, apendicular: 126 },
  espinales: { cervicales: 8, toracicos: 12, lumbares: 5, sacros: 5, coccigeo: 1, total: 31 },
  cavidades: {
    craneal: ["Cerebro"],
    toracica: ["Corazón", "Pulmones"],
    abdominal: ["Hígado", "Estómago", "Riñones", "Intestino", "Páncreas", "Bazo"],
    pelvica: ["Vejiga"],
  } as Record<string, string[]>,
  // Región gruesa de cada órgano (vista anterior salvo aclaración).
  regionOrgano: {
    Cerebro: "cabeza",
    Corazón: "torax",
    Pulmones: "torax",
    Hígado: "abdomen",
    Estómago: "abdomen",
    Bazo: "abdomen",
    Páncreas: "abdomen",
    Riñones: "abdomen",
    Intestino: "abdomen",
    Vejiga: "pelvis",
  } as Record<string, string>,
  regionMusculo: {
    Deltoides: ["hombro"],
    "Pectoral mayor": ["torax"],
    "Recto abdominal": ["abdomen"],
    Bíceps: ["brazo"],
    Tríceps: ["brazo"],
    Cuádriceps: ["muslo"],
    Trapecio: ["cuello", "torax"],
    "Dorsal ancho": ["torax", "abdomen"],
    Glúteos: ["pelvis"],
    Gastrocnemio: ["pierna"],
  } as Record<string, string[]>,
  vistaPosterior: ["Trapecio", "Dorsal ancho", "Tríceps", "Glúteos", "Gastrocnemio"],
  flujos: {
    alimento: ["boca", "faringe", "esofago", "estomago", "intestino delgado", "intestino grueso", "recto y ano"],
    aire: ["nariz", "faringe", "laringe", "traquea", "bronquios", "bronquiolos", "alveolos"],
    sangre: [
      "auricula derecha",
      "ventriculo derecho",
      "arterias pulmonares",
      "pulmones",
      "venas pulmonares",
      "auricula izquierda",
      "ventriculo izquierdo",
      "aorta y arterias",
      "venas cavas",
    ],
    orina: ["rinones", "ureteres", "vejiga", "uretra"],
    arcoReflejo: ["estimulo", "receptor", "neurona sensitiva (aferente)", "centro integrador", "neurona motora (eferente)", "efector"],
  },
};

describe("Anatomía: Técnicas (estructura)", () => {
  it("son 21: óseo 5, muscular 6, órganos 5, nervioso 5; todas requierePro=false", () => {
    expect(TECNICAS_ANATOMIA).toHaveLength(21);
    expect(TECNICAS_ANATOMIA.every((t) => t.requierePro === false)).toBe(true);
    const por = Object.fromEntries(GRUPOS.map((g) => [g, TECNICAS_ANATOMIA.filter((t) => t.grupo === g).length]));
    expect(por).toEqual({ oseo: 5, muscular: 6, organos: 5, nervioso: 5 });
  });

  it("slugs únicos con prefijo anatomia-, y las 5 históricas de 0081 siguen existiendo", () => {
    const slugs = TECNICAS_ANATOMIA.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s.startsWith("anatomia-"), s).toBe(true);
    for (const h of SLUGS_TECNICAS_HISTORICAS) expect(slugs, h).toContain(h);
    expect(SLUGS_TECNICAS_HISTORICAS).toHaveLength(5);
  });

  it("3 a 5 pasos y de 3 a 5 preguntas de quiz por Técnica", () => {
    for (const t of TECNICAS_ANATOMIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(5);
      expect(t.quiz.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.quiz.length, t.slug).toBeLessThanOrEqual(5);
    }
  });
});

describe("Anatomía: Clases (estructura)", () => {
  it("son 22: óseo 6, muscular 5, órganos 5, nervioso 6; todas requierePro=true, slug anatomia-clase-*", () => {
    expect(CLASES_ANATOMIA).toHaveLength(22);
    expect(CLASES_ANATOMIA.every((c) => c.requierePro === true)).toBe(true);
    const por = Object.fromEntries(GRUPOS.map((g) => [g, CLASES_ANATOMIA.filter((c) => c.grupo === g).length]));
    expect(por).toEqual({ oseo: 6, muscular: 5, organos: 5, nervioso: 6 });
    const slugs = CLASES_ANATOMIA.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s.startsWith("anatomia-clase-"), s).toBe(true);
  });

  it("la primera Clase de todas (la preview gratis) es posición anatómica y planos", () => {
    expect(CLASES_ANATOMIA[0].slug).toBe("anatomia-clase-posicion-y-planos");
    expect(CLASES_ANATOMIA[0].orden).toBe(1);
    expect(CLASES_ANATOMIA[0].grupo).toBe("oseo");
  });

  it("5 a 7 pasos desarrollados y 5 preguntas de quiz con explicación por Clase", () => {
    for (const c of CLASES_ANATOMIA) {
      expect(c.pasos.length, c.slug).toBeGreaterThanOrEqual(5);
      expect(c.pasos.length, c.slug).toBeLessThanOrEqual(7);
      expect(c.quiz.length, c.slug).toBe(5);
      // Cada Clase termina con un paso de errores comunes o de simplificación (pedido: definiciones + errores comunes).
      expect(norm(c.pasos.join(" ")), c.slug).toMatch(/errores comunes|error comun|simplificacion/);
    }
  });
});

describe("Anatomía: quiz de las 43 lecciones", () => {
  it("la respuesta está entre las opciones, sin opciones repetidas, con explicación real y 3 a 4 opciones", () => {
    for (const l of TODAS) {
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(3);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(10);
        expect(q.pregunta.length, donde).toBeGreaterThan(8);
      }
    }
  });

  it("la respuesta correcta no está siempre en la misma posición (no se adivina por posición)", () => {
    const posiciones = new Map<number, number>();
    let total = 0;
    for (const l of TODAS) {
      for (const q of l.quiz) {
        const i = q.opciones.indexOf(q.respuesta);
        posiciones.set(i, (posiciones.get(i) ?? 0) + 1);
        total++;
      }
    }
    for (const [pos, n] of posiciones) expect(n / total, `posición ${pos}`).toBeLessThan(0.5);
    expect(posiciones.size).toBeGreaterThanOrEqual(3);
  });

  it("el gating Pro del servidor aplica: toda Clase tiene quiz, y /api/aprender/completar solo valida requiere_pro cuando hay quiz", () => {
    for (const c of CLASES_ANATOMIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
    const ruta = fs.readFileSync(path.join(raiz, "src", "app", "api", "aprender", "completar", "route.ts"), "utf8");
    expect(ruta).toMatch(/if \(quiz\.length > 0\)[\s\S]*tecnica\.requiere_pro[\s\S]*plan !== "pro"[\s\S]*403/);
  });
});

describe("Anatomía: español neutro y texto limpio", () => {
  it("ninguna lección tiene voseo", () => {
    for (const l of TODAS) {
      const texto = [l.nombre, l.descripcion, ...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion])].join("\n");
      expect(detectarVoseo(texto), l.slug).toEqual([]);
      // Formas de voseo que el detector no lista: -alo/-elo/-ilo enclíticos y "vos".
      expect(texto, l.slug).not.toMatch(/\b(agrupalos|dividilos|leelo|separalos|dejalos|ubicalos|fijate|acordate|mirá|tenés|sabés|podés|querés)\b/i);
    }
  });

  it("sin $ desparejados ni placeholders rotos", () => {
    for (const l of TODAS) {
      for (const p of [...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion])]) {
        expect((p.match(/\$/g) ?? []).length % 2, `${l.slug}: «${p}»`).toBe(0);
        expect(p, l.slug).not.toMatch(/undefined|NaN|\[object/);
      }
    }
  });

  it("sin contenido médico prescriptivo (diagnóstico, tratamiento, dosis, consejos médicos)", () => {
    for (const l of TODAS) {
      expect(corpus(l), l.slug).not.toMatch(/\b(tratamiento|diagnostic|dosis|receta medica|medicament|debes consultar|acude al medico|tomar pastillas)/);
    }
  });
});

describe("Anatomía: visuales (estructura y datos verificados)", () => {
  it("cada lección tiene al menos 1 visual de tipo conocido, con despuesDePaso válido, y ≤ 2 esqueletos", () => {
    for (const l of TODAS) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      let esqueletos = 0;
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!, l.slug).toBeLessThan(l.pasos.length);
        if (v.tipo === "anatomia.esqueleto") esqueletos++;
      }
      expect(esqueletos, `${l.slug}: cada esqueleto es un SVG de ~800 KB`).toBeLessThanOrEqual(2);
    }
  });

  it("esqueleto: cada clave es una zona real del SVG que usa la práctica (data-hueso en el archivo) y no se descarta ninguna", () => {
    const svg = fs.readFileSync(path.join(raiz, "public", "data", "esqueleto-oseo.svg"), "utf8");
    const clavesPractica = new Set(Object.values(HUESO_CLICKEABLE));
    let vistos = 0;
    for (const l of TODAS) {
      for (const v of l.visuales) {
        if (v.tipo !== "anatomia.esqueleto") continue;
        expect(v.huesos.length, l.slug).toBeGreaterThanOrEqual(1);
        expect(v.huesos.length, l.slug).toBeLessThanOrEqual(MAX_HUESOS_ESQUELETO);
        expect(resolverHuesos(v.huesos), `${l.slug}: alguna clave se descartó`).toHaveLength(v.huesos.length);
        for (const clave of v.huesos) {
          expect(clavesPractica.has(clave), `${l.slug}: ${clave} no es un hueso clickeable de la práctica`).toBe(true);
          expect(svg, `${l.slug}: ${clave} no está en el SVG`).toContain(`data-hueso="${clave}"`);
          vistos++;
        }
      }
    }
    expect(vistos).toBeGreaterThan(15);
  });

  it("esqueleto: TODA zona que la práctica pide clickear (HUESO_CLICKEABLE) aparece resaltada en alguna lección", () => {
    const enLecciones = new Set(
      TODAS.flatMap((l) => l.visuales.flatMap((v) => (v.tipo === "anatomia.esqueleto" ? v.huesos : [])))
    );
    for (const [nombre, clave] of Object.entries(HUESO_CLICKEABLE)) {
      expect(enLecciones.has(clave!), `${nombre} (${clave}) no se enseña en el esqueleto`).toBe(true);
    }
  });

  it("cuerpo: entradas válidas, sin descartes, nombres de órganos/músculos reales de la práctica y región coincidente con la referencia", () => {
    const nombresPractica = new Set([...ORGANOS, ...MUSCULAR_BAJO]);
    for (const l of TODAS) {
      for (const v of l.visuales) {
        if (v.tipo !== "anatomia.cuerpo") continue;
        expect(v.entradas.length, l.slug).toBeGreaterThanOrEqual(1);
        expect(v.entradas.length, l.slug).toBeLessThanOrEqual(MAX_ENTRADAS_CUERPO);
        expect(resolverEntradasCuerpo(v.entradas), `${l.slug}: alguna entrada se descartó`).toHaveLength(v.entradas.length);
        for (const e of v.entradas) {
          expect(nombresPractica.has(e.nombre), `${l.slug}: ${e.nombre} no es un término de la práctica`).toBe(true);
          const esperado = REF.regionOrgano[e.nombre] ? [REF.regionOrgano[e.nombre]] : REF.regionMusculo[e.nombre];
          expect(e.regiones, `${l.slug}: región de ${e.nombre}`).toEqual(esperado);
          const posterior = REF.vistaPosterior.includes(e.nombre);
          expect((e.vista ?? "anterior") === "posterior", `${l.slug}: vista de ${e.nombre}`).toBe(posterior);
        }
      }
    }
  });

  it("grupos y flujos: sin descartes por datos malos y dentro de los máximos", () => {
    for (const l of TODAS) {
      for (const v of l.visuales) {
        if (v.tipo === "anatomia.grupos") {
          expect(v.grupos.length, l.slug).toBeLessThanOrEqual(MAX_GRUPOS);
          const res = resolverGrupos(v.grupos);
          expect(res, `${l.slug}: algún grupo se descartó`).toHaveLength(v.grupos.length);
          res.forEach((g, i) => expect(g.items, `${l.slug}: ítems de «${g.nombre}»`).toHaveLength(v.grupos[i].items.length));
        }
        if (v.tipo === "anatomia.flujo") {
          expect(v.etapas.length, l.slug).toBeLessThanOrEqual(MAX_ETAPAS);
          expect(resolverEtapas(v.etapas), l.slug).toHaveLength(v.etapas.length);
        }
      }
    }
  });
});

describe("Anatomía: datos anatómicos contra la tabla de referencia", () => {
  it("12 pares craneales: número, romano, nombre y tipo (sensitivo/motor/mixto) idénticos a la referencia", () => {
    expect(PARES_CRANEALES).toHaveLength(12);
    expect(PARES_CRANEALES.map((p) => [p.numero, p.romano, p.nombre, p.tipo])).toEqual(REF.paresCraneales);
  });

  it("los nombres de los pares craneales son los mismos, y en el mismo orden, que evalúa la práctica (NERVIOSO_ALTO)", () => {
    expect(PARES_CRANEALES.map((p) => p.nombre)).toEqual(NERVIOSO_ALTO);
  });

  it("clasificación clásica: sensitivos 3, motores 5, mixtos 4", () => {
    const cuenta = (t: string) => REF.paresCraneales.filter((p) => p[3] === t).length;
    expect([cuenta("S"), cuenta("M"), cuenta("B")]).toEqual([3, 5, 4]);
    const clase = CLASES_ANATOMIA.find((c) => c.slug === "anatomia-clase-pares-craneales")!;
    const g = clase.visuales.find((v) => v.tipo === "anatomia.grupos" && v.grupos.length === 3);
    expect(g && g.tipo === "anatomia.grupos" ? g.grupos.map((x) => x.items.length) : []).toEqual([3, 5, 4]);
  });

  it("cavidades: cada órgano evaluado está en exactamente una cavidad, igual que la referencia", () => {
    expect(Object.fromEntries(CAVIDADES.map((c) => [c.id, c.organos]))).toEqual(REF.cavidades);
    const todos = CAVIDADES.flatMap((c) => c.organos);
    expect(new Set(todos).size).toBe(todos.length);
    expect([...todos].sort()).toEqual([...ORGANOS].sort());
  });

  it("entradas del esquema del cuerpo: cubren exactamente los 10 órganos y los 10 músculos grandes de la práctica", () => {
    expect(ENTRADAS_ORGANOS.map((e) => e.nombre).sort()).toEqual([...ORGANOS].sort());
    expect(ENTRADAS_MUSCULOS_GRANDES.map((e) => e.nombre).sort()).toEqual([...MUSCULAR_BAJO].sort());
  });

  it("cifras del esqueleto: las sumas de la referencia cierran (22 = 8 + 14; 80 + 126 = 206; 126 = 6 + 2 × 30)", () => {
    expect(REF.craneo.craneales + REF.craneo.faciales).toBe(REF.craneo.total);
    expect(REF.esqueleto.axial + REF.esqueleto.apendicular).toBe(REF.esqueleto.total);
    const miembroSup = 1 + 2 + REF.mano.carpianos + REF.mano.metacarpianos + REF.mano.falanges;
    const miembroInf = 1 + 1 + 2 + REF.pie.tarsianos + REF.pie.metatarsianos + REF.pie.falanges;
    expect([miembroSup, miembroInf]).toEqual([30, 30]);
    expect(6 + miembroSup * 2 + miembroInf * 2).toBe(REF.esqueleto.apendicular);
    // axial: cráneo 22 + 6 huesecillos + hioides 1 + columna 26 + tórax 25
    expect(22 + 6 + 1 + (24 + 1 + 1) + (24 + 1)).toBe(REF.esqueleto.axial);
    expect(REF.columna.cervicales + REF.columna.toracicas + REF.columna.lumbares + REF.columna.sacro + REF.columna.coccix).toBe(33);
    expect(REF.espinales.cervicales + REF.espinales.toracicos + REF.espinales.lumbares + REF.espinales.sacros + REF.espinales.coccigeo).toBe(
      REF.espinales.total
    );
  });

  const texto = (slug: string) => corpus(TODAS.find((l) => l.slug === slug)!);

  it("las lecciones enseñan las cifras de la referencia (no otras)", () => {
    expect(texto("anatomia-clase-tejido-oseo")).toContain("206 huesos");
    const craneo = texto("anatomia-clase-craneo");
    expect(craneo).toContain("22 huesos");
    expect(craneo).toContain("8 huesos que protegen");
    expect(craneo).toContain("14 huesos");
    const zona = texto("anatomia-craneo-por-zona");
    expect(zona).toContain("8 huesos craneales");
    expect(zona).toContain("14 faciales");
    const manoPie = texto("anatomia-mano-y-pie-por-filas");
    for (const s of ["8 carpianos", "5 metacarpianos", "14 falanges", "7 tarsianos", "5 metatarsianos"]) expect(manoPie, s).toContain(s);
    const col = texto("anatomia-clase-columna-y-torax");
    for (const s of ["7 cervicales", "12 torácicas", "5 lumbares", "12 pares de costillas", "pares 1 a 7", "pares 8 a 10", "pares 11 y 12"]) {
      expect(col, s).toContain(norm(s));
    }
    const apend = texto("anatomia-clase-esqueleto-apendicular");
    for (const s of ["80 huesos", "126 huesos", "30 huesos", "80 + 126 = 206"]) expect(apend, s).toContain(s);
    const snc = texto("anatomia-clase-snc-y-snp");
    for (const s of ["12 pares de nervios craneales", "31 pares", "8 cervicales", "12 toracicos", "5 lumbares", "5 sacros", "1 coccigeo"]) {
      expect(snc, s).toContain(s);
    }
    expect(texto("anatomia-clase-pares-craneales")).toContain("12 pares de nervios");
    const resp = texto("anatomia-clase-aparato-respiratorio");
    expect(resp).toContain("derecho tiene 3 lobulos");
    expect(resp).toContain("izquierdo 2");
    expect(texto("anatomia-clase-corazon-sangre-y-bazo")).toContain("cuatro cavidades");
  });

  it("ninguna lección afirma una cifra distinta de la referencia (lista de afirmaciones conocidas como falsas)", () => {
    const FALSAS = [
      "205 huesos",
      "207 huesos",
      "208 huesos",
      "10 pares craneales",
      "11 pares craneales",
      "13 pares craneales",
      "24 pares craneales",
      "32 pares de nervios",
      "30 pares de nervios",
      "6 vertebras cervicales",
      "8 vertebras cervicales",
      "13 vertebras toracicas",
      "11 vertebras toracicas",
      "6 vertebras lumbares",
      "21 huesos del craneo",
      "23 huesos del craneo",
      "9 carpianos",
      "6 tarsianos",
      "8 tarsianos",
      "el corazon tiene 3 cavidades",
      "el corazon tiene 2 cavidades",
      "el pulmon derecho tiene 2 lobulos",
      "el pulmon izquierdo tiene 3 lobulos",
    ];
    for (const l of TODAS) for (const f of FALSAS) expect(corpus(l), `${l.slug}: «${f}»`).not.toContain(f);
  });

  it("los recorridos (alimento, aire, sangre, orina, arco reflejo) siguen el orden de la referencia", () => {
    const t = (etapas: { titulo: string }[]) => etapas.map((e) => norm(e.titulo));
    expect(t(FLUJO_ALIMENTO)).toEqual(REF.flujos.alimento);
    expect(t(FLUJO_AIRE)).toEqual(REF.flujos.aire);
    expect(t(FLUJO_SANGRE)).toEqual(REF.flujos.sangre);
    expect(t(FLUJO_ORINA)).toEqual(REF.flujos.orina);
    expect(t(FLUJO_ARCO_REFLEJO)).toEqual(REF.flujos.arcoReflejo);
  });
});

describe("Anatomía: cobertura de TODO lo que evalúa la práctica", () => {
  // Cada término de src/lib/practica/anatomia.ts (o que sus generadores
  // pueden preguntar) tiene que estar enseñado en al menos una lección de su
  // sistema, y en al menos una Clase. Si alguien agrega un término al banco
  // de la práctica sin lección, este test falla.
  const POR_SISTEMA: Record<(typeof GRUPOS)[number], string[]> = {
    oseo: [...OSEO_BAJO, ...OSEO_ALTO],
    muscular: [...MUSCULAR_BAJO, ...MUSCULAR_ALTO],
    organos: [...ORGANOS],
    nervioso: [...NERVIOSO_BAJO, ...NERVIOSO_ALTO],
  };

  for (const g of GRUPOS) {
    it(`${g}: cada término de la práctica está enseñado en una lección del sistema y en al menos una Clase`, () => {
      const lecciones = TODAS.filter((l) => l.grupo === g);
      const clases = CLASES_ANATOMIA.filter((l) => l.grupo === g);
      const enLecciones = lecciones.map(corpus);
      const enClases = clases.map(corpus);
      for (const termino of POR_SISTEMA[g]) {
        const n = norm(termino);
        expect(
          enLecciones.some((c) => c.includes(n)),
          `«${termino}» (${g}) no está enseñado en ninguna lección`
        ).toBe(true);
        expect(
          enClases.some((c) => c.includes(n)),
          `«${termino}» (${g}) no está enseñado en ninguna Clase`
        ).toBe(true);
      }
    });
  }

  it("los 4 sistemas de la práctica tienen Técnicas y Clases", () => {
    for (const g of GRUPOS) {
      expect(TECNICAS_ANATOMIA.some((t) => t.grupo === g), g).toBe(true);
      expect(CLASES_ANATOMIA.some((c) => c.grupo === g), g).toBe(true);
    }
  });

  it("los términos compartidos entre sistemas (frontal, temporal, occipital, cerebro) se enseñan como hueso Y como músculo/órgano, con la aclaración", () => {
    const oseo = TODAS.filter((l) => l.grupo === "oseo").map(corpus).join(" ");
    const musc = TODAS.filter((l) => l.grupo === "muscular").map(corpus).join(" ");
    for (const t of ["frontal", "temporal", "occipital"]) {
      expect(oseo, t).toContain(t);
      expect(musc, t).toContain(t);
    }
    expect(musc).toContain("el mismo nombre sirve para el hueso y para el musculo");
    const nerv = TODAS.filter((l) => l.grupo === "nervioso").map(corpus).join(" ");
    const org = TODAS.filter((l) => l.grupo === "organos").map(corpus).join(" ");
    expect(nerv).toContain("cerebro");
    expect(org).toContain("cerebro");
  });
});

describe("Anatomía: migración generada", () => {
  const esperado = () => generarSqlAnatomia(TECNICAS_ANATOMIA, CLASES_ANATOMIA, SLUGS_TECNICAS_HISTORICAS);

  it("es exactamente lo que se genera de src/lib/anatomia/lecciones/", () => {
    if (process.env.ANATOMIA_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaMigracion, esperado(), "utf8");
    expect(fs.existsSync(rutaMigracion), "falta la migración: ANATOMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/anatomia/lecciones").toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8")).toBe(esperado());
  });

  it("el orden de las sentencias es seguro: UPDATE de las 5 históricas, después los INSERT (nunca pisa un slug existente)", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    const idxUpdate = sql.indexOf("update public.techniques");
    const idxInsert = sql.indexOf("insert into public.techniques");
    expect(idxUpdate).toBeGreaterThan(-1);
    expect(idxInsert).toBeGreaterThan(idxUpdate);
    expect((sql.match(/^update public\.techniques/gm) ?? []).length).toBe(5);
    expect((sql.match(/^insert into public\.techniques/gm) ?? []).length).toBe(2);
    // Cada UPDATE apunta a una fila que 0081 sembró (slug histórico).
    const objetivos = [...sql.matchAll(/where problem_type = 'anatomia' and slug = '([a-z0-9-]+)';/g)].map((m) => m[1]);
    expect(objetivos.sort()).toEqual([...SLUGS_TECNICAS_HISTORICAS].sort());
    // Ningún slug insertado coincide con un slug histórico ni con otro de la propia migración.
    const insertados = [...sql.matchAll(/^\('(anatomia-[a-z0-9-]+)', '/gm)].map((m) => m[1]);
    expect(insertados).toHaveLength(16 + 22);
    expect(new Set(insertados).size).toBe(insertados.length);
    for (const h of SLUGS_TECNICAS_HISTORICAS) expect(insertados).not.toContain(h);
  });

  it("los slugs insertados no chocan con ninguno sembrado por migraciones anteriores (slug es unique)", () => {
    const dir = path.join(raiz, "supabase", "migrations");
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    const nuevos = new Set([...sql.matchAll(/^\('(anatomia-[a-z0-9-]+)', '/gm)].map((m) => m[1]));
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".sql") && n !== ARCHIVO_MIGRACION_ANATOMIA)) {
      const otro = fs.readFileSync(path.join(dir, f), "utf8");
      if (!otro.includes("'anatomia-") || !/insert into public\.techniques/i.test(otro)) continue;
      for (const m of otro.matchAll(/^\s*\('(anatomia-[a-z0-9-]+)',\s*'/gm)) {
        expect(nuevos.has(m[1]) && !SLUGS_TECNICAS_HISTORICAS.includes(m[1]), `${f} ya siembra ${m[1]}`).toBe(false);
      }
    }
  }, 30_000);

  it("cada bloque jsonb es parseable, con pasos, visuales de tipo conocido y quiz", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    let total = 0;
    for (const m of sql.matchAll(/\$anatomia\$([\s\S]*?)\$anatomia\$::jsonb/g)) {
      const c = JSON.parse(m[1]) as { pasos: string[]; visuales: { tipo: string }[]; quiz: { respuesta: string; opciones: string[] }[] };
      expect(Array.isArray(c.pasos)).toBe(true);
      expect(c.visuales.length).toBeGreaterThan(0);
      for (const v of c.visuales) expect(TIPOS_CONOCIDOS.has(v.tipo)).toBe(true);
      for (const q of c.quiz) expect(q.opciones).toContain(q.respuesta);
      total++;
    }
    expect(total).toBe(21 + 22);
  });

  it("la migración no tiene voseo (español neutro)", () => {
    expect(detectarVoseo(fs.readFileSync(rutaMigracion, "utf8"))).toEqual([]);
  });

  it("0081 (Técnicas históricas) quedó sin voseo, y por eso ya no está en DEUDA_HISTORICA_VOSEO", () => {
    const viejo = fs.readFileSync(path.join(raiz, "supabase", "migrations", "0081_mundo_anatomia.sql"), "utf8");
    expect(detectarVoseo(viejo)).toEqual([]);
    expect(viejo).not.toMatch(/\b(agrupalos|dividilos|leelo|separalos|dejalos|Ubicalos)\b/);
  });
});
