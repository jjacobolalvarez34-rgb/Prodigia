import katex from "katex";

export type FragmentoMathText = { tipo: "texto"; valor: string } | { tipo: "formula"; html: string };

const PATRON_MATH = /\$([^$]+)\$/g;

// Convención elegida para todo el contenido de Prodigia (lecciones y
// preguntas, ver docs/PLAN_REVISION_CONTENIDO.md): un fragmento entre
// $...$ se renderiza con KaTeX; el resto del string queda como texto
// plano exactamente igual que antes de que esta convención existiera —
// retrocompatible por construcción, ningún contenido viejo necesita
// tocarse para seguir funcionando.
export function partirMathText(texto: string): FragmentoMathText[] {
  const partes: FragmentoMathText[] = [];
  let ultimoIndice = 0;
  let match: RegExpExecArray | null;

  PATRON_MATH.lastIndex = 0;
  while ((match = PATRON_MATH.exec(texto)) !== null) {
    if (match.index > ultimoIndice) {
      partes.push({ tipo: "texto", valor: texto.slice(ultimoIndice, match.index) });
    }
    partes.push({ tipo: "formula", html: renderizarFormula(match[1]) });
    ultimoIndice = match.index + match[0].length;
  }
  if (ultimoIndice < texto.length) {
    partes.push({ tipo: "texto", valor: texto.slice(ultimoIndice) });
  }
  return partes;
}

function renderizarFormula(expresion: string): string {
  try {
    // throwOnError:false hace que una expresión LaTeX inválida se
    // muestre en rojo dentro de la página en vez de romper el render —
    // el try/catch es una segunda red de seguridad, no la principal.
    return katex.renderToString(expresion, { throwOnError: false, output: "htmlAndMathml" });
  } catch {
    return expresion;
  }
}
