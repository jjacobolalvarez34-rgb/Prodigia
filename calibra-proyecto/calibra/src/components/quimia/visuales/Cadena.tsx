"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { fichaDe, type FichaMolecula } from "@/lib/quimia/moleculas";
import { condensadaLatex, formulaMolecular, hidrogenos, nombrarAbierta, nombrarAnillo, type ResultadoNombre } from "@/lib/quimia/organica";
import { formulaLatex } from "@/lib/quimia/formulas";
import type { VisualQuimiaCadena } from "@/lib/quimia/visuales";
import Esqueleto from "./Esqueleto";
import { MarcoVisual, TextoDelPaso, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaCadena;
}

const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

export function fichaSegura(id: unknown): FichaMolecula | null {
  if (typeof id !== "string") return null;
  try {
    return fichaDe(id);
  } catch {
    return null;
  }
}

// "CH₃" / "CH₂" / "CH" / "C" para el carbono `i`.
function textoCarbono(ficha: FichaMolecula, i: number): string {
  const h = hidrogenos(ficha.molecula, i);
  return `C${h > 0 ? `H${h > 1 ? SUB[String(h)] : ""}` : ""}`;
}

// Visual "quimia.cadena": esqueleto 2D esquemático de una molécula del
// catálogo (src/lib/quimia/moleculas.ts). Modo "nombrar": cadena principal,
// numeración, ramificaciones y el nombre armado; modo "formulas": esqueleto,
// hidrógenos de cada carbono, fórmula condensada y molecular. Todo (nombre,
// numeración, fórmulas) lo calcula src/lib/quimia/organica.ts.
export default function Cadena({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.cadena");
  const tg = useTranslations("Quimia.visuales.grupos.nombres");
  const ficha = fichaSegura(visual.molecula);
  const modo = visual.modo === "formulas" ? "formulas" : "nombrar";
  const anillo = ficha ? ficha.molecula.enlaces.length >= ficha.molecula.atomos.length : false;
  const total = modo === "formulas" ? (anillo ? 3 : 4) : anillo ? 3 : 4;
  const { alVer, ...r } = useReproductor({ total, ms: 3200, estatico: visual.estatico, inicio: 1 });
  if (!ficha) return null;
  const paso = Math.min(total, Math.max(1, r.paso));
  const animar = !r.reducir;
  const m = ficha.molecula;

  let res: ResultadoNombre | null = null;
  let ringAtoms: number[] = [];
  if (anillo) ringAtoms = nombrarAnillo(m).anillo;
  else res = nombrarAbierta(m);

  const cadenaSet = new Set<number>(anillo ? ringAtoms : res!.cadena);
  const cont = formulaMolecular(m);
  const nCarbonos = cont.C ?? 0;
  const grupoNombre = res && res.principal !== "ninguno" ? tg(res.principal) : "";

  // ---- textos de cada paso ----
  const textos: string[] = [];
  let resaltar: Set<number> | undefined;
  let resaltar2: Set<number> | undefined;
  let localizadores = false;
  let carbonos: Map<number, string> | undefined;
  let nombreFinal: { prefijos: string; cuerpo: string; acido: boolean } | null = null;

  if (modo === "nombrar") {
    if (anillo) {
      const benceno = ficha.nombre.endsWith("benceno") || ficha.nombre === "fenol";
      textos.push(benceno ? t("nombrar.p1Benceno") : t("nombrar.p1Anillo", { n: ringAtoms.length }));
      const externos = ficha.dibujo.atomos.filter((a) => !cadenaSet.has(a.id));
      textos.push(externos.length > 0 ? t("nombrar.p3Anillo") : t("nombrar.p3Sin"));
      textos.push(t("nombrar.p4", { nombre: ficha.nombre }));
      if (paso === 1) resaltar = cadenaSet;
      if (paso === 2) {
        resaltar = cadenaSet;
        resaltar2 = new Set(externos.map((a) => a.id));
      }
    } else {
      const raiz = res!.partes.cuerpo.match(/^[a-záéíóú]+/)?.[0] ?? "";
      const nCad = res!.cadena.length;
      const tieneGrupo = res!.principal !== "ninguno";
      const tieneMult = res!.dobles.length + res!.triples.length > 0;
      const raizBase = ["", "met", "et", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec", "undec", "dodec"][nCad] ?? raiz;
      if (tieneGrupo && tieneMult) textos.push(t("nombrar.p1Ambos", { n: nCad, raiz: raizBase, grupo: grupoNombre }));
      else if (tieneGrupo) textos.push(t("nombrar.p1Grupo", { n: nCad, raiz: raizBase, grupo: grupoNombre }));
      else if (tieneMult) textos.push(t("nombrar.p1Multiple", { n: nCad, raiz: raizBase }));
      else textos.push(t("nombrar.p1Sola", { n: nCad, raiz: raizBase }));
      // numeración
      if (tieneGrupo) textos.push(t("nombrar.p2Grupo", { grupo: grupoNombre, loc: res!.posPrincipal.join(", ") }));
      else if (tieneMult) textos.push(t("nombrar.p2Multiple", { loc: [...res!.dobles, ...res!.triples].sort((a, b) => a - b).join(", ") }));
      else if (res!.ramas.length > 0) textos.push(t("nombrar.p2Ramas", { locs: res!.ramas.map((x) => x.pos).sort((a, b) => a - b).join(", ") }));
      else textos.push(t("nombrar.p2Nada"));
      // ramificaciones: los sustituyentes de la cadena (sin el grupo principal)
      if (res!.ramas.length > 0) {
        const lista = [...res!.ramas]
          .sort((a, b) => a.pos - b.pos)
          .map((x) => t("nombrar.ramaEn", { nombre: x.nombre, pos: x.pos }))
          .join("; ");
        textos.push(t("nombrar.p3Ramas", { lista }));
      } else textos.push(t("nombrar.p3Sin"));
      textos.push(t("nombrar.p4", { nombre: ficha.nombre }));
      nombreFinal = res!.partes;
      if (paso === 1) resaltar = cadenaSet;
      if (paso === 2) {
        resaltar = cadenaSet;
        localizadores = true;
      }
      if (paso === 3) {
        localizadores = true;
        // las ramificaciones: todo lo que cuelga de la cadena por un sustituyente nombrado
        const rama = new Set<number>();
        const recorrer = (i: number, desde: number) => {
          rama.add(i);
          for (const x of m.ady[i]) if (x.v !== desde && !cadenaSet.has(x.v)) recorrer(x.v, i);
        };
        for (const x of res!.ramas) recorrer(x.atomo, -1);
        resaltar2 = rama;
        resaltar = cadenaSet;
      }
    }
  } else {
    textos.push(t("formulas.f1"));
    textos.push(t("formulas.f2", { c: nCarbonos, h: cont.H ?? 0 }));
    if (!anillo) textos.push(t("formulas.f3", { condensada: `$\\mathrm{${condensadaLatex(ficha.condensada ?? "")}}$` }));
    const conteo = Object.entries(cont)
      .sort(([a], [b]) => (a === "C" ? -1 : b === "C" ? 1 : a === "H" ? -1 : b === "H" ? 1 : a.localeCompare(b)))
      .map(([s, n]) => `${n} ${s}`)
      .join(", ");
    textos.push(t("formulas.f4", { formula: `$${formulaLatex(ficha.formula)}$`, conteo }));
    if (paso >= 2) {
      carbonos = new Map();
      ficha.dibujo.atomos.forEach((a) => {
        if (a.el === "C") carbonos!.set(a.id, textoCarbono(ficha, a.id));
      });
    }
  }
  const textoPaso = textos[paso - 1] ?? "";
  const alternativa = (
    <div>
      <p>
        {t("etiqueta", { nombre: ficha.nombre })}. {t("nota")}
      </p>
      <ol>
        {textos.map((x, i) => (
          <li key={i}>
            <MathText texto={x} />
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { nombre: ficha.nombre })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="flex w-full justify-center" data-paso={paso}>
        <Esqueleto dibujo={ficha.dibujo} resaltar={resaltar} resaltar2={resaltar2} localizadores={localizadores} carbonos={carbonos} animar={animar} />
      </div>
      {modo === "nombrar" && nombreFinal && paso === total && (
        <p className="text-center text-lg font-bold" aria-hidden="true">
          {nombreFinal.acido && <span className="text-texto-secundario">ácido </span>}
          {nombreFinal.prefijos && <span style={{ color: "#D97706" }}>{nombreFinal.prefijos}</span>}
          <span style={{ color: COLOR_QUIMIA }}>{nombreFinal.cuerpo}</span>
        </p>
      )}
      <p className="text-center text-[11px] text-texto-secundario">{t("nota")}</p>
      <TextoDelPaso>
        <MathText texto={textoPaso} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
