import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TECNICAS_NUMERIA } from "./index";
import { generarSqlTecnicas } from "./sql";
import { esVisualLeccion, type VisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_NUMERIA } from "@/components/numeria/visuales/registro";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import {
  columnasSuma,
  columnasResta,
  mcmPorListado,
  fraccionOperacion,
  simplificarFraccion,
  productoCruzado,
  decimalDeFraccion,
  porcentajeDeNumero,
  redondearDecimal,
  potenciaCadena,
  raizCuadradaPorTanteo,
  notacionCientifica,
  despejarLineal,
  verificarSustitucion,
  ternaPitagorica,
  areaCompuesta,
  areaCirculo,
  anguloComplementario,
  sumaDigitos,
  redondearAPosicion,
  divisionPorPartes,
  numerosCercanosA100,
  x11Trick,
} from "../visualesDatos";

// Verificación del contenido de las 39 Técnicas de Numeria con apartado
// visual nuevo (2026-09-22, "revisa TODAS y colócales su apartado
// visual"): estructura (39 slugs exactos, coinciden con
// GRUPOS_APRENDER.numeria.tecnicas), visuales con tipos conocidos, y
// sobre todo que CADA número mostrado se recalcula con aritmética
// independiente (operadores nativos +, -, *, Math.floor, %, Math.sqrt,
// Math.log10 — nunca las mismas funciones que arma tecnicas.ts).
// Regenerar la migración 0201: NUMERIA_TECNICAS_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones/tecnicas.test.ts

const raiz = path.resolve(__dirname, "../../../..");
const ruta0201 = path.join(raiz, "supabase", "migrations", "0201_numeria_tecnicas_visuales.sql");

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_NUMERIA)]);

const SLUGS_ESPERADOS = GRUPOS_APRENDER.numeria.tecnicas.flatMap((g) => g.slugs);

describe("Numeria: 39 Técnicas con apartado visual (estructura)", () => {
  it("son exactamente los 39 slugs de GRUPOS_APRENDER.numeria.tecnicas, sin repetidos, en el mismo orden", () => {
    expect(TECNICAS_NUMERIA.map((t) => t.slug)).toEqual(SLUGS_ESPERADOS);
    expect(SLUGS_ESPERADOS).toHaveLength(39);
    expect(new Set(SLUGS_ESPERADOS).size).toBe(39);
  });

  it("los pasos son una introducción corta (1-3 pasos, cada uno breve, sin $ desparejados)", () => {
    for (const tec of TECNICAS_NUMERIA) {
      expect(tec.pasos.length, tec.slug).toBeGreaterThanOrEqual(1);
      expect(tec.pasos.length, tec.slug).toBeLessThanOrEqual(3);
      for (const p of tec.pasos) {
        expect(p.length, `${tec.slug}: paso demasiado largo`).toBeLessThanOrEqual(430);
        expect((p.match(/\$/g) ?? []).length % 2, `${tec.slug}: $ desparejado en «${p}»`).toBe(0);
        expect(p, tec.slug).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("ninguna técnica queda solo con texto: al menos 1 visual, y cada uno es válido con despuesDePaso en rango", () => {
    for (const tec of TECNICAS_NUMERIA) {
      expect(tec.visuales.length, `${tec.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of tec.visuales) {
        expect(esVisualLeccion(v), tec.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${tec.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${tec.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!).toBeLessThan(tec.pasos.length);
      }
    }
  });

  it("ningún visual, ni ningún paso, contiene JSON serializado con NaN/undefined/Infinity", () => {
    for (const tec of TECNICAS_NUMERIA) {
      const json = JSON.stringify(tec.visuales);
      expect(json, tec.slug).not.toMatch(/NaN|Infinity|null/);
    }
  });
});

describe("Numeria: los números de las Técnicas salen de un cálculo independiente", () => {
  function tec(slug: string) {
    const t = TECNICAS_NUMERIA.find((x) => x.slug === slug);
    expect(t, slug).toBeDefined();
    return t!;
  }
  function textoDe(t: { pasos: string[] }): string {
    return t.pasos.join(" ");
  }

  it("complemento-a-10: 8+5=13, complemento 2, resto 3", () => {
    const texto = textoDe(tec("complemento-a-10"));
    expect(texto).toContain("8");
    expect(texto).toContain("5");
    const json = JSON.stringify(tec("complemento-a-10").visuales);
    expect(json).toContain("13");
    expect(10 - 8).toBe(2);
    expect(5 - 2).toBe(3);
    expect(8 + 5).toBe(13);
  });

  it("redondear-decena: 47+38=85 (redondeo 40, ajuste 2)", () => {
    const json = JSON.stringify(tec("redondear-decena").visuales);
    expect(47 + 38).toBe(85);
    expect(json).toContain("85");
    expect(json).toContain("87"); // 47+40 intermedio
  });

  it("sumar-por-la-izquierda: 456+327=783, por posición", () => {
    const json = JSON.stringify(tec("sumar-por-la-izquierda").visuales);
    expect(4 + 3).toBe(7);
    expect(5 + 2).toBe(7);
    expect(6 + 7).toBe(13);
    expect(456 + 327).toBe(783);
    expect(json).toContain("783");
  });

  it("duplicar-y-ajustar: 48+51=99", () => {
    const json = JSON.stringify(tec("duplicar-y-ajustar").visuales);
    expect(48 * 2 + 3).toBe(99);
    expect(48 + 51).toBe(99);
    expect(json).toContain("99");
  });

  it("sumar-por-posicion-numeros-grandes: 4827+3956 en numeria.columnas, resultado correcto", () => {
    const v = tec("sumar-por-posicion-numeros-grandes").visuales[0] as VisualLeccion & { a: number; b: number };
    expect(v.tipo).toBe("numeria.columnas");
    const d = columnasSuma(v.a, v.b);
    expect(d.resultado).toBe(v.a + v.b);
    expect(v.a).toBe(4827);
    expect(v.b).toBe(3956);
    expect(d.resultado).toBe(8783);
  });

  it("estimar-antes-de-sumar-grande: estimación 9000, real 8783", () => {
    const json = JSON.stringify(tec("estimar-antes-de-sumar-grande").visuales);
    expect(Math.round(4827 / 1000) * 1000).toBe(5000);
    expect(Math.round(3956 / 1000) * 1000).toBe(4000);
    expect(json).toContain("9000");
    expect(json).toContain("8783");
  });

  it("resta-compensacion: 82-47=35", () => {
    const json = JSON.stringify(tec("resta-compensacion").visuales);
    expect(82 - 47).toBe(35);
    expect(json).toContain("35");
  });

  it("complemento-a-100: 100-63=37", () => {
    const json = JSON.stringify(tec("complemento-a-100").visuales);
    expect(100 - 63).toBe(37);
    expect(9 - 6).toBe(3);
    expect(10 - 3).toBe(7);
    expect(json).toContain("37");
  });

  it("restar-por-posicion-numeros-grandes: 8241-3956 en numeria.columnas, resultado correcto", () => {
    const v = tec("restar-por-posicion-numeros-grandes").visuales[0] as VisualLeccion & { a: number; b: number };
    expect(v.tipo).toBe("numeria.columnas");
    const d = columnasResta(v.a, v.b);
    expect(d.resultado).toBe(v.a - v.b);
    expect(d.resultado).toBe(4285);
  });

  it("restar-completando-al-redondo-mas-cercano: 9241-6850=2391", () => {
    const json = JSON.stringify(tec("restar-completando-al-redondo-mas-cercano").visuales);
    expect(9241 - 6850).toBe(2391);
    expect(json).toContain("2391");
  });

  it("x11-segundo: 37×11=407, con acarreo", () => {
    const d = x11Trick(37);
    expect(d.resultado).toBe(37 * 11);
    expect(d.resultado).toBe(407);
    expect(d.acarreo).toBe(true);
    const json = JSON.stringify(tec("x11-segundo").visuales);
    expect(json).toContain("407");
  });

  it("x5-mitad-de-x10: 48×5=240", () => {
    const json = JSON.stringify(tec("x5-mitad-de-x10").visuales);
    expect((48 * 10) / 2).toBe(240);
    expect(48 * 5).toBe(240);
    expect(json).toContain("240");
  });

  it("cuadrado-terminado-en-5: 35²=1225", () => {
    const json = JSON.stringify(tec("cuadrado-terminado-en-5").visuales);
    expect(35 ** 2).toBe(1225);
    expect(3 * 4 * 100 + 25).toBe(1225);
    expect(json).toContain("1225");
  });

  it("x9-es-x10-menos-el-numero: 47×9=423", () => {
    const json = JSON.stringify(tec("x9-es-x10-menos-el-numero").visuales);
    expect(47 * 10 - 47).toBe(423);
    expect(47 * 9).toBe(423);
    expect(json).toContain("423");
  });

  it("numeros-cercanos-a-100: 98×97=9506", () => {
    const d = numerosCercanosA100(98, 97);
    expect(d.resultado).toBe(98 * 97);
    expect(d.resultado).toBe(9506);
    const json = JSON.stringify(tec("numeros-cercanos-a-100").visuales);
    expect(json).toContain("9506");
  });

  it("x4-duplicar-dos-veces: 37×4=148", () => {
    const json = JSON.stringify(tec("x4-duplicar-dos-veces").visuales);
    expect(37 * 2 * 2).toBe(148);
    expect(37 * 4).toBe(148);
    expect(json).toContain("148");
  });

  it("multiplicar-por-partes: 234×6=1404 (1200+180+24)", () => {
    const json = JSON.stringify(tec("multiplicar-por-partes").visuales);
    expect(200 * 6 + 30 * 6 + 4 * 6).toBe(1404);
    expect(234 * 6).toBe(1404);
    expect(json).toContain("1404");
  });

  it("multiplicar-redondeando-primero: 98×47=4606", () => {
    const json = JSON.stringify(tec("multiplicar-redondeando-primero").visuales);
    expect(100 * 47 - 2 * 47).toBe(4606);
    expect(98 * 47).toBe(4606);
    expect(json).toContain("4606");
  });

  it("divisibilidad-por-3: 471, suma dígitos 12, divisible", () => {
    const d = sumaDigitos(471);
    expect(d).toBe(4 + 7 + 1);
    expect(d).toBe(12);
    expect(471 % 3).toBe(0);
    const json = JSON.stringify(tec("divisibilidad-por-3").visuales);
    expect(json).toContain("12");
  });

  it("dividir-por-5: 84÷5=16.8", () => {
    const json = JSON.stringify(tec("dividir-por-5").visuales);
    expect((84 * 2) / 10).toBe(16.8);
    expect(84 / 5).toBe(16.8);
    expect(json).toContain("16.8");
  });

  it("dividir-numeros-grandes-por-partes: 288÷12=24 (240+48)", () => {
    const d = divisionPorPartes(288, 12);
    expect(d.cocienteTotal).toBe(Math.floor(288 / 12));
    expect(d.cocienteTotal).toBe(24);
    expect(d.multiploRedondo).toBe(240);
    expect(d.resto1).toBe(48);
    const json = JSON.stringify(tec("dividir-numeros-grandes-por-partes").visuales);
    expect(json).toContain("24");
  });

  it("estimar-el-cociente-grande: 8916÷4=2229, estimado 2250", () => {
    const json = JSON.stringify(tec("estimar-el-cociente-grande").visuales);
    expect(8916 / 4).toBe(2229);
    expect(9000 / 4).toBe(2250);
    expect(json).toContain("2229");
    expect(json).toContain("2250");
  });

  it("sumar-fracciones-igual-denominador: 1/5+2/5=3/5 en numeria.fraccion", () => {
    const v = tec("sumar-fracciones-igual-denominador").visuales[0] as VisualLeccion & { num1: number; den1: number; num2: number; den2: number };
    expect(v.tipo).toBe("numeria.fraccion");
    const d = fraccionOperacion("suma", v.num1, v.den1, v.num2, v.den2);
    expect({ num: d.numSimplificado, den: d.denSimplificado }).toEqual({ num: 3, den: 5 });
  });

  it("simplificar-con-mcd: 8/12 simplificada = 2/3 (MCD 4)", () => {
    const d = simplificarFraccion(8, 12);
    expect(d.divisorComun).toBe(4);
    expect(d.numSimplificado).toBe(2);
    expect(d.denSimplificado).toBe(3);
    const json = JSON.stringify(tec("simplificar-con-mcd").visuales);
    expect(json).toContain("4");
  });

  it("minimo-comun-denominador: MCM(4,6)=12, y 1/4+1/6=5/12", () => {
    const d = mcmPorListado(4, 6);
    expect(d.mcm).toBe(12);
    const suma = fraccionOperacion("suma", 1, 4, 1, 6);
    expect({ num: suma.numSimplificado, den: suma.denSimplificado }).toEqual({ num: 5, den: 12 });
  });

  it("comparar-con-producto-cruzado: 3/4 vs 4/5 → 15 < 16, la segunda es mayor", () => {
    const d = productoCruzado(3, 4, 4, 5);
    expect(d.productoIzquierdo).toBe(3 * 5);
    expect(d.productoDerecho).toBe(4 * 4);
    expect(d.mayor).toBe("segunda");
  });

  it("convertir-fraccion-decimal: 3/4=0.75", () => {
    expect(decimalDeFraccion(3, 4)).toBe(0.75);
    const json = JSON.stringify(tec("convertir-fraccion-decimal").visuales);
    expect(json).toContain("0.75");
  });

  it("porcentaje-como-decimal: 15% de 200 = 30", () => {
    const d = porcentajeDeNumero(15, 200);
    expect(d.decimal).toBe(0.15);
    expect(d.resultado).toBe(30);
    const json = JSON.stringify(tec("porcentaje-como-decimal").visuales);
    expect(json).toContain("0.15");
  });

  it("redondear-decimales: 3.14159 redondeado a 2 decimales = 3.14", () => {
    const d = redondearDecimal(3.14159, 2);
    expect(d.redondeado).toBe(3.14);
    expect(d.digitoSiguiente).toBe(1);
    const json = JSON.stringify(tec("redondear-decimales").visuales);
    expect(json).toContain("3.14159");
    expect(json).toContain("3.14");
  });

  it("potencia-como-multiplicacion-repetida: 2^4=16", () => {
    const d = potenciaCadena(2, 4);
    expect(d.resultado).toBe(2 ** 4);
    expect(d.resultado).toBe(16);
    expect(d.pasos.map((p) => p.acumulado)).toEqual([4, 8, 16]);
  });

  it("raiz-cuadrada-por-tanteo: √49=7", () => {
    const d = raizCuadradaPorTanteo(49);
    expect(d.base).toBe(7);
    expect(d.base * d.base).toBe(49);
    expect(d.exacta).toBe(true);
  });

  it("notacion-cientifica-basica: 3000=3×10³, 45000=4.5×10⁴", () => {
    const a = notacionCientifica(3000);
    const b = notacionCientifica(45000);
    expect(a).toEqual({ valor: 3000, mantisa: 3, exponente: 3 });
    expect(b).toEqual({ valor: 45000, mantisa: 4.5, exponente: 4 });
    expect(a.mantisa * 10 ** a.exponente).toBe(3000);
    expect(b.mantisa * 10 ** b.exponente).toBe(45000);
  });

  it("que-es-una-variable: x+5=12 → x=7", () => {
    const d = despejarLineal(1, 5, 12);
    expect(d.x).toBe(7);
    expect(1 * d.x + 5).toBe(12);
  });

  it("despejar-paso-a-paso: 2x+3=11 → x=4", () => {
    const d = despejarLineal(2, 3, 11);
    expect(d.x).toBe(4);
    expect(d.trasConstante).toBe(8);
    expect(2 * d.x + 3).toBe(11);
  });

  it("verificar-sustituyendo: sustituyendo x=4 en 2x+3, da 11", () => {
    const c = verificarSustitucion(2, 3, 4);
    expect(c).toBe(11);
    expect(2 * 4 + 3).toBe(11);
  });

  it("geometria-ternas-pitagoricas: catetos 8 y 6 → hipotenusa 10", () => {
    const d = ternaPitagorica(8, 6);
    expect(d.hipotenusa).toBe(10);
    expect(8 ** 2 + 6 ** 2).toBe(100);
    expect(Math.sqrt(100)).toBe(10);
  });

  it("geometria-area-compuestas: 10×8 menos 3×2 = 74", () => {
    const d = areaCompuesta(10, 8, 3, 2);
    expect(d.areaFinal).toBe(10 * 8 - 3 * 2);
    expect(d.areaFinal).toBe(74);
  });

  it("geometria-pi-fraccion: radio 7 (múltiplo de 7), área = 154 exacta", () => {
    const d = areaCirculo(7);
    expect(d.multiploDe7).toBe(true);
    expect(d.area).toBe((22 / 7) * 49);
    expect(d.area).toBe(154);
  });

  it("geometria-angulos-complementarios: suplementario de 125° es 55°", () => {
    const d = anguloComplementario("suplementario", 125);
    expect(d.total).toBe(180);
    expect(d.otro).toBe(55);
    expect(125 + d.otro).toBe(180);
  });
});

describe("Numeria: migración 0201", () => {
  it("es exactamente lo que se genera de src/lib/numeria/lecciones/tecnicas.ts", () => {
    const esperado = generarSqlTecnicas(TECNICAS_NUMERIA);
    if (process.env.NUMERIA_TECNICAS_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0201, esperado, "utf8");
    expect(fs.existsSync(ruta0201), "falta 0201: NUMERIA_TECNICAS_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones/tecnicas.test.ts").toBe(true);
    expect(fs.readFileSync(ruta0201, "utf8")).toBe(esperado);
  });

  it("el SQL generado: 39 UPDATE con jsonb_set, jsonb parseable, tipos de visual conocidos, quiz intacto (no tocado)", () => {
    const sql = fs.readFileSync(ruta0201, "utf8");
    expect(sql).not.toMatch(/insert into public\.techniques/);
    expect(sql).not.toMatch(/'\{quiz\}'/);
    const re =
      /update public\.techniques\nset contenido = jsonb_set\(\n {2}jsonb_set\(contenido, '\{pasos\}', \$numeria\$([\s\S]*?)\$numeria\$::jsonb\),\n {2}'\{visuales\}', \$numeria\$([\s\S]*?)\$numeria\$::jsonb\n\)\nwhere slug = '([^']+)';/g;
    const filas: { pasos: string[]; visuales: unknown[]; slug: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      filas.push({ pasos: JSON.parse(m[1]), visuales: JSON.parse(m[2]), slug: m[3] });
    }
    expect(filas).toHaveLength(39);
    expect(filas.map((f) => f.slug)).toEqual(SLUGS_ESPERADOS);
    for (const f of filas) {
      const original = TECNICAS_NUMERIA.find((t) => t.slug === f.slug);
      expect(original, `slug ${f.slug} no está en TECNICAS_NUMERIA`).toBeDefined();
      expect(f.pasos).toEqual(original!.pasos);
      expect(f.visuales).toEqual(original!.visuales);
      expect(f.visuales.length).toBeGreaterThan(0);
      for (const v of f.visuales) {
        expect(esVisualLeccion(v), f.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has((v as VisualLeccion).tipo), `${f.slug}: ${(v as VisualLeccion).tipo}`).toBe(true);
      }
    }
  });

  it("redondearAPosicion está bien exportada e independiente (4827→5000, 3956→4000, 8916→9000)", () => {
    expect(redondearAPosicion(4827, 3)).toBe(5000);
    expect(redondearAPosicion(3956, 3)).toBe(4000);
    expect(redondearAPosicion(8916, 3)).toBe(9000);
  });
});
