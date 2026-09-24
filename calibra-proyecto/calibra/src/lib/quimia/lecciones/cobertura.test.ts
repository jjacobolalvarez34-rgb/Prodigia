import { describe, it, expect } from "vitest";
import { TECNICAS_QUIMIA, CLASES_QUIMIA, type VisualLeccionQuimia } from "./index";
import { ELEMENTOS, Z_MAX_CON_ESTADO_OXIDACION } from "@/lib/practica/quimia";
import { COMPUESTOS_ORGANICOS } from "@/lib/practica/quimicaOrganica";
import { CATALOGO_MOLECULAS, fichaDe } from "@/lib/quimia/moleculas";
import { gruposFuncionales, type IdGrupo } from "@/lib/quimia/organica";
import { REGISTRO_VISUALES_QUIMIA } from "@/components/quimia/visuales/registro";

// Cobertura: todo lo que la práctica de Quimia (y sus generadores) puede
// preguntar de REDOX y de ORGÁNICA tiene que estar enseñado en al menos una
// lección de esos grupos (los conceptos de nomenclatura inorgánica ya los
// cubre la tanda 1). El test cruza los dos lados: lo que evalúan
// src/lib/practica/quimia.ts (estado de oxidación más común, niveles 8-10 de
// "Tabla periódica") y src/lib/practica/quimicaOrganica.ts (10 compuestos con
// su estructura), contra lo que traen las lecciones.

const REDOX = [...TECNICAS_QUIMIA, ...CLASES_QUIMIA].filter((l) => l.grupo === "redox");
const ORGANICA = [...TECNICAS_QUIMIA, ...CLASES_QUIMIA].filter((l) => l.grupo === "organica");

const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Todo el texto de una lección (pasos, cuadros, quiz) en minúscula y sin tildes.
function corpus(lecciones: (typeof REDOX)[number][]): string {
  const t: string[] = [];
  for (const l of lecciones) {
    t.push(l.nombre, l.descripcion, ...l.pasos);
    for (const q of l.quiz) t.push(q.pregunta, ...q.opciones, q.explicacion);
    for (const v of l.visuales) {
      if (v.titulo) t.push(v.titulo);
      if (v.tipo === "quimia.cuadro") t.push(...v.columnas, ...v.filas.flat());
    }
  }
  return sinTildes(t.join(" \n "));
}

const moleculasDe = (v: VisualLeccionQuimia): string[] => {
  if (v.tipo === "quimia.cadena") return [v.molecula];
  if (v.tipo === "quimia.grupos" || v.tipo === "quimia.isomeria") return v.moleculas;
  if (v.tipo === "quimia.hibridacion") return [v.molecula];
  return [];
};

describe("cobertura: cada lección de redox y de orgánica trae visuales", () => {
  it("todas las Técnicas y Clases de esos dos grupos tienen al menos un visual, con tipo registrado", () => {
    expect(REDOX.length).toBe(13);
    expect(ORGANICA.length).toBe(18);
    for (const l of [...REDOX, ...ORGANICA]) {
      expect(l.visuales.length, `${l.slug} sin visual`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) expect(v.tipo === "cuadros" || v.tipo in REGISTRO_VISUALES_QUIMIA, `${l.slug}: ${v.tipo}`).toBe(true);
    }
  });

  it("cada uno de los 8 visuales nuevos se usa en al menos una lección", () => {
    const usados = new Set<string>([...REDOX, ...ORGANICA].flatMap((l) => l.visuales.map((v) => v.tipo)));
    for (const tipo of ["quimia.redox", "quimia.oxidacion", "quimia.balanceo", "quimia.pila", "quimia.cadena", "quimia.grupos", "quimia.isomeria", "quimia.hibridacion"]) {
      expect(usados.has(tipo), tipo).toBe(true);
    }
  });
});

describe("cobertura de REDOX: lo que evalúa la práctica está enseñado", () => {
  // Práctica: «¿Cuál es el estado de oxidación más común de X?» para todo
  // elemento con Z <= 103 (src/lib/practica/quimia.ts). La Clase del número de
  // oxidación trae las tablas «Estados de oxidación más comunes»; acá se leen
  // de las celdas de esos cuadros (no de la función que las genera) y se
  // comparan con el banco elemento por elemento.
  const clase1 = CLASES_QUIMIA.find((c) => c.slug === "quimia-clase-redox-numero-oxidacion-herramienta")!;
  const enseñado = new Map<string, number>();

  it("las tablas de la Clase de número de oxidación asignan a CADA elemento (Z <= 103) exactamente el estado que pregunta la práctica", () => {
    for (const v of clase1.visuales) {
      if (v.tipo !== "quimia.cuadro" || !v.columnas[1]?.startsWith("Estado de oxidación más común")) continue;
      for (const fila of v.filas) {
        for (const trozo of fila[1].split("; ")) {
          const [simbolos, valor] = trozo.split(": ");
          const n = valor === "0" ? 0 : parseInt(valor.replace("−", "-"), 10);
          expect(Number.isNaN(n), `${fila[0]}: «${trozo}»`).toBe(false);
          for (const s of simbolos.split(", ")) {
            expect(enseñado.has(s), `${s} figura dos veces`).toBe(false);
            enseñado.set(s, n);
          }
        }
      }
    }
    const evaluados = ELEMENTOS.filter((e) => e.numeroAtomico <= Z_MAX_CON_ESTADO_OXIDACION);
    expect(evaluados.length).toBe(103);
    for (const e of evaluados) expect(enseñado.get(e.simbolo), `${e.simbolo} (${e.nombre})`).toBe(e.estadoOxidacionComun);
    // y no se enseña nada de más: los superpesados (Z > 103) no tienen estado establecido
    expect(enseñado.size).toBe(103);
  });

  it("los conceptos de redox están en alguna lección: número de oxidación, oxidación, reducción, agentes, semirreacciones, balanceo por número y por ion-electrón (ácido y básico), serie de actividad, pilas y electrólisis", () => {
    const texto = corpus(REDOX);
    const conceptos: [string, RegExp][] = [
      ["número de oxidación", /numero de oxidacion/],
      ["casos especiales (peróxido, hidruro)", /peroxido[\s\S]*hidruro|hidruro[\s\S]*peroxido/],
      ["oxidación = perder electrones", /oxidarse es perder electrones/],
      ["reducción = ganar electrones", /reducirse es ganarlos|reducirse es ganar electrones/],
      ["agente oxidante", /agente oxidante/],
      ["agente reductor", /agente reductor/],
      ["semirreacciones", /semirreaccion/],
      ["balanceo por cambio del número de oxidación", /cambio del numero de oxidacion/],
      ["ion-electrón", /ion-electron/],
      ["medio ácido", /medio acido/],
      ["medio básico", /medio basico/],
      ["serie de actividad", /serie de actividad/],
      ["potencial de reducción", /potencial estandar de reduccion|potenciales estandar/],
      ["pila (celda galvánica)", /pila/],
      ["ánodo y cátodo", /anodo[\s\S]*catodo/],
      ["puente salino", /puente salino/],
      ["electrólisis", /electrolisis/],
      ["dismutación", /dismutacion/],
      ["combustión", /combustion/],
      ["reacción con permanganato", /permanganato/],
      ["reacción con dicromato", /dicromato/],
    ];
    for (const [nombre, re] of conceptos) expect(texto, nombre).toMatch(re);
  });

  it("los ejemplos clásicos del pedido (combustión, Zn + Cu²⁺, KMnO₄, K₂Cr₂O₇) figuran como visuales o ecuaciones", () => {
    const ejemplos = new Set(REDOX.flatMap((l) => l.visuales.filter((v) => v.tipo === "quimia.redox").map((v) => (v as { ejemplo: string }).ejemplo)));
    for (const id of ["zn-cu", "ch4-o2", "kmno4-hcl", "fe2o3-co", "h2o2"]) expect(ejemplos.has(id), id).toBe(true);
    const casos = new Set(REDOX.flatMap((l) => l.visuales.filter((v) => v.tipo === "quimia.balanceo").map((v) => (v as { caso: string }).caso)));
    for (const id of ["mno4-fe2", "cr2o7-fe2", "mno4-i"]) expect(casos.has(id), id).toBe(true);
    const oxi = REDOX.flatMap((l) => l.visuales.filter((v) => v.tipo === "quimia.oxidacion").map((v) => (v as { formula: string }).formula));
    expect(oxi).toEqual(expect.arrayContaining(["KMnO4", "Cr2O7"]));
  });
});

describe("cobertura de ORGÁNICA: lo que evalúa la práctica está enseñado", () => {
  const texto = corpus(ORGANICA);
  const visuales = ORGANICA.flatMap((l) => l.visuales);
  const enVisuales = new Set(visuales.flatMap(moleculasDe));

  it("cada uno de los 10 compuestos de la práctica aparece dibujado en un visual de una lección de orgánica y su nombre (IUPAC y común) está en el texto", () => {
    expect(COMPUESTOS_ORGANICOS).toHaveLength(10);
    for (const c of COMPUESTOS_ORGANICOS) {
      const e = CATALOGO_MOLECULAS.find((x) => x.practica === c.id);
      expect(e, `${c.id} sin entrada en el catálogo`).toBeDefined();
      expect(enVisuales.has(e!.id), `${c.id}: ningún visual de orgánica dibuja ${e!.id}`).toBe(true);
      const ficha = fichaDe(e!.id);
      expect(texto, `${c.id}: falta el nombre IUPAC «${ficha.nombre}»`).toContain(sinTildes(ficha.nombre));
      // nombre tal como lo escribe la práctica (sin el paréntesis): fórmico, acético, glucosa, etileno...
      const nombrePractica = sinTildes(c.nombre.replace(/\s*\(.*\)/, ""));
      const comun = e!.comun ? sinTildes(e!.comun.replace(/\s*\(.*\)/, "")) : null;
      expect(texto.includes(nombrePractica) || (comun !== null && texto.includes(comun)), `${c.id}: falta «${c.nombre}»`).toBe(true);
      const paren = c.nombre.match(/\((.*)\)/)?.[1];
      if (paren) expect(texto, `${c.id}: falta «${paren}»`).toContain(sinTildes(paren));
    }
  });

  it("cada grupo funcional que pueden mostrar los compuestos de la práctica y el temario (12 familias) tiene un paso propio en un visual de grupos funcionales", () => {
    const enGrupos = new Set<IdGrupo>();
    for (const v of visuales) {
      if (v.tipo !== "quimia.grupos") continue;
      for (const id of v.moleculas) for (const g of gruposFuncionales(fichaDe(id).molecula)) enGrupos.add(g.id);
    }
    const todos: IdGrupo[] = ["alqueno", "alquino", "aromatico", "alcohol", "eter", "aldehido", "cetona", "acido", "ester", "amina", "amida", "haluro"];
    for (const g of todos) expect(enGrupos.has(g), g).toBe(true);
    // los grupos de los 10 compuestos de la práctica están entre ellos
    for (const c of COMPUESTOS_ORGANICOS) {
      const e = CATALOGO_MOLECULAS.find((x) => x.practica === c.id)!;
      for (const g of gruposFuncionales(fichaDe(e.id).molecula)) expect(enGrupos.has(g.id), `${c.id}: ${g.id}`).toBe(true);
    }
  });

  it("los conceptos del temario de orgánica están en alguna lección", () => {
    const conceptos: [string, RegExp][] = [
      ["tetravalencia", /tetravalente|forma siempre 4 enlaces|forma 4 enlaces/],
      ["hibridación sp3, sp2 y sp", /sp\^\{3\}|sp³|sp3[\s\S]*sp2[\s\S]*sp\b|hibridacion/],
      ["enlace sigma y pi", /sigma[\s\S]*pi|enlaces π|enlace π/],
      ["alcanos", /alcano/],
      ["alquenos", /alqueno/],
      ["alquinos", /alquino/],
      ["cicloalcanos", /cicloalcano/],
      ["benceno y aromáticos", /benceno[\s\S]*aromatico|aromatico[\s\S]*benceno/],
      ["fórmula molecular", /formula molecular/],
      ["fórmula condensada / semidesarrollada", /semidesarrollada|condensada/],
      ["fórmula de esqueleto", /esqueleto/],
      ["fórmula desarrollada", /desarrollada/],
      ["cadena principal", /cadena principal/],
      ["numeración", /numer/],
      ["ramificaciones", /ramificacion/],
      ["orden alfabético", /alfabetic/],
      ["prefijos di-, tri-", /\bdi-|\btri-/],
      ["instauraciones", /insaturad|enlace multiple/],
      ["alcoholes", /alcohol/],
      ["éteres", /eter/],
      ["aldehídos", /aldehido/],
      ["cetonas", /cetona/],
      ["ácidos carboxílicos", /acido carboxilico/],
      ["ésteres", /ester/],
      ["aminas", /amina/],
      ["amidas", /amida/],
      ["haluros", /haluro/],
      ["isomería de cadena", /isomeria de cadena/],
      ["isomería de posición", /isomeria de posicion/],
      ["isomería de función", /isomeria de funcion/],
      ["isomería geométrica cis/trans", /cis[\s\S]*trans/],
      ["combustión", /combustion/],
      ["adición", /adicion/],
      ["sustitución", /sustitucion/],
      ["esterificación", /esterificacion/],
      ["glucosa y carbohidratos", /glucosa[\s\S]*carbohidrato|hidrato de carbono/],
      ["polímeros", /polimero/],
      ["nombres comunes aceptados", /acido acetico[\s\S]*acido formico|acido formico[\s\S]*acido acetico/],
    ];
    for (const [nombre, re] of conceptos) expect(texto, nombre).toMatch(re);
  });

  it("los cinco tipos de reacción del temario traen al menos una ecuación balanceada en la Clase de reacciones", () => {
    const clase = CLASES_QUIMIA.find((c) => c.slug === "quimia-clase-organica-reacciones")!;
    const cuerpo = sinTildes(clase.pasos.join(" "));
    for (const t of ["combustion", "sustitucion", "adicion", "esterificacion", "oxidacion"]) expect(cuerpo, t).toContain(t);
    // cada ecuación pasó por ecu(): lleva la flecha de LaTeX
    expect((clase.pasos.join(" ").match(/\\rightarrow|\\rightleftharpoons/g) ?? []).length).toBeGreaterThanOrEqual(12);
  });
});
