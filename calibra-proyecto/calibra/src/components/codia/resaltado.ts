import type { Lenguaje } from "@/lib/codia/tipos";

// Resaltado de sintaxis mínimo y sin dependencias para Codia: separa el
// código en fragmentos (comentario / cadena / número / palabra clave /
// texto). No pretende parsear el lenguaje: solo colorear lo que se ve en
// los fragmentos didácticos del mundo.

export type TipoToken = "comentario" | "cadena" | "numero" | "clave" | "texto";
export interface Token {
  tipo: TipoToken;
  texto: string;
}

const CLAVES: Record<Lenguaje, string[]> = {
  python: ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "True", "False", "None", "break", "continue", "import", "from", "pass", "class"],
  java: ["public", "static", "void", "int", "String", "boolean", "return", "if", "else", "for", "while", "new", "true", "false", "null", "break", "continue", "import", "class", "List", "Map", "Set", "Deque", "Queue"],
  javascript: ["function", "return", "if", "else", "for", "while", "let", "const", "var", "of", "in", "new", "true", "false", "null", "undefined", "break", "continue", "class"],
  typescript: ["function", "return", "if", "else", "for", "while", "let", "const", "var", "of", "in", "new", "true", "false", "null", "undefined", "break", "continue", "class", "number", "string", "boolean"],
};

export function tokenizar(codigo: string, lang: Lenguaje): Token[] {
  const claves = new Set(CLAVES[lang]);
  const comentario = lang === "python" ? "#[^\n]*" : "//[^\n]*|/\*[\s\S]*?(?:\*/|$)";
  const re = new RegExp(`(${comentario})|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)`, "g");
  const out: Token[] = [];
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(codigo)) !== null) {
    if (m.index > ultimo) out.push({ tipo: "texto", texto: codigo.slice(ultimo, m.index) });
    if (m[1] !== undefined) out.push({ tipo: "comentario", texto: m[1] });
    else if (m[2] !== undefined) out.push({ tipo: "cadena", texto: m[2] });
    else if (m[3] !== undefined) out.push({ tipo: "numero", texto: m[3] });
    else out.push({ tipo: claves.has(m[4]) ? "clave" : "texto", texto: m[4] });
    ultimo = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (ultimo < codigo.length) out.push({ tipo: "texto", texto: codigo.slice(ultimo) });
  return out;
}

// Parte los tokens en líneas (un comentario de bloque puede abarcar varias).
export function tokensPorLinea(codigo: string, lang: Lenguaje): Token[][] {
  const lineas: Token[][] = [[]];
  for (const t of tokenizar(codigo, lang)) {
    const partes = t.texto.split("\n");
    partes.forEach((p, i) => {
      if (i > 0) lineas.push([]);
      if (p !== "") lineas[lineas.length - 1].push({ tipo: t.tipo, texto: p });
    });
  }
  return lineas;
}
