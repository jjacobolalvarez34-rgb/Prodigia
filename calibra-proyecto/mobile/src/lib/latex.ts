// LaTeX → SVG en el teléfono, con MathJax (JS puro, sin código nativo): así las
// fórmulas de la app se ven con la misma tipografía matemática que la web (KaTeX),
// no como texto común. Cada fórmula se convierte una vez y queda en memoria.
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import "mathjax-full/js/input/tex/base/BaseConfiguration.js";
import "mathjax-full/js/input/tex/ams/AmsConfiguration.js";

export interface FormulaSvg {
  xml: string;
  // Tamaño en «em» (1 = el tamaño de la letra) y cuánto baja de la línea base.
  ancho: number;
  alto: number;
  baja: number;
}

let doc: ReturnType<typeof mathjax.document> | null = null;
let adaptor: ReturnType<typeof liteAdaptor> | null = null;

function documento() {
  if (!doc) {
    adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);
    doc = mathjax.document("", {
      // Un error de LaTeX se avisa (y se muestra la fórmula como texto) en vez de
      // dibujar el cartel rojo de MathJax.
      InputJax: new TeX({ packages: ["base", "ams"], formatError: (_: unknown, err: Error) => { throw err; } }),
      OutputJax: new SVG({ fontCache: "none" }),
    });
  }
  return { doc, adaptor: adaptor! };
}

const cache = new Map<string, FormulaSvg | null>();

export function latexASvg(tex: string, display = false): FormulaSvg | null {
  const clave = `${display ? "D" : "I"}${tex}`;
  const guardada = cache.get(clave);
  if (guardada !== undefined) return guardada;
  let res: FormulaSvg | null = null;
  try {
    const { doc: d, adaptor: a } = documento();
    const nodo = d.convert(tex, { display, em: 16, ex: 8, containerWidth: 2000 });
    const svg = a.innerHTML(nodo);
    const vb = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg);
    const va = /vertical-align:\s*([-\d.]+)ex/.exec(svg);
    if (vb) {
      // El viewBox de MathJax usa 1000 unidades por em; 1 ex = 0,5 em con em 16 / ex 8.
      res = {
        // Sin ancho/alto/estilo propios: el tamaño lo pone quien lo dibuja.
        xml: svg.replace(/ (width|height|style)="[^"]*"/g, ""),
        ancho: Number(vb[3]) / 1000,
        alto: Number(vb[4]) / 1000,
        baja: va ? -Number(va[1]) * 0.5 : 0,
      };
    }
  } catch {
    // MathJax 3.2 falla con algunos «\mathrm{…}» que llevan subíndices con signos
    // (p. ej. \mathrm{C_nH_{2n+2}}); «{\rm …}» es lo mismo y sí lo dibuja.
    res = tex.includes("\\mathrm{") ? latexASvg(tex.replace(/\\mathrm\{/g, "{\\rm "), display) : null;
  }
  if (cache.size > 400) cache.clear();
  cache.set(clave, res);
  return res;
}

// Parte un texto con fórmulas ($…$ o $$…$$) en trozos de texto y de fórmula.
export type TrozoLatex = { tipo: "texto"; s: string } | { tipo: "formula"; tex: string; display: boolean };

export function trozosLatex(texto: string): TrozoLatex[] {
  const out: TrozoLatex[] = [];
  const re = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) out.push({ tipo: "texto", s: texto.slice(ultimo, m.index) });
    out.push({ tipo: "formula", tex: (m[1] ?? m[2]).trim(), display: m[1] !== undefined });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) out.push({ tipo: "texto", s: texto.slice(ultimo) });
  return out;
}
