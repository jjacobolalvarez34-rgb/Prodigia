// La Calcu (0124) — parser de la secuencia que arma el jugador arrastrando
// fichas (LaCalcu.tsx) a un AST anidado ["op", izq, der] como el que espera
// resolver_la_calcu (0124_trastienda_minijuegos.sql, eval_calcu). El server
// evalúa CUALQUIER árbol bien formado — nunca le importó que el cliente
// solo mandara una cadena a la izquierda (buildAst viejo); este parser solo
// existe para que la UI pueda ofrecer paréntesis y orden real de
// operaciones (× ÷ antes que + −) en vez de esa cadena forzada.
//
// El server es la única fuente de verdad: si algo se cuela acá mal armado,
// resolver_la_calcu igual lo re-evalúa y lo re-valida contra el target y el
// multiset de números — este parser solo mejora la experiencia de armar la
// expresión, nunca reemplaza esa validación.
export type FichaCalcu =
  | { id: string; tipo: "num"; valor: number }
  | { id: string; tipo: "op"; valor: "+" | "-" | "×" | "÷" }
  | { id: string; tipo: "paren"; valor: "(" | ")" };

const OP_SERVIDOR: Record<"+" | "-" | "×" | "÷", "+" | "-" | "*" | "/"> = {
  "+": "+",
  "-": "-",
  "×": "*",
  "÷": "/",
};

// Recursive descent estándar: expr := term (('+'|'-') term)*,
// term := factor (('×'|'÷') factor)*, factor := numero | '(' expr ')'.
// Devuelve null si la secuencia no es una expresión completa y balanceada
// (paréntesis sin cerrar, operador sin operando, fichas sobrantes, etc.).
export function parsearSecuenciaCalcu(secuencia: FichaCalcu[]): unknown | null {
  let pos = 0;

  function factor(): unknown | null {
    const tk = secuencia[pos];
    if (!tk) return null;
    if (tk.tipo === "num") {
      pos++;
      return tk.valor;
    }
    if (tk.tipo === "paren" && tk.valor === "(") {
      pos++;
      const inner = expr();
      if (inner == null) return null;
      const cierre = secuencia[pos];
      if (!cierre || cierre.tipo !== "paren" || cierre.valor !== ")") return null;
      pos++;
      return inner;
    }
    return null;
  }

  function term(): unknown | null {
    let left = factor();
    if (left == null) return null;
    while (true) {
      const tk = secuencia[pos];
      if (!tk || tk.tipo !== "op" || (tk.valor !== "×" && tk.valor !== "÷")) break;
      pos++;
      const right = factor();
      if (right == null) return null;
      left = [OP_SERVIDOR[tk.valor], left, right];
    }
    return left;
  }

  function expr(): unknown | null {
    let left = term();
    if (left == null) return null;
    while (true) {
      const tk = secuencia[pos];
      if (!tk || tk.tipo !== "op" || (tk.valor !== "+" && tk.valor !== "-")) break;
      pos++;
      const right = term();
      if (right == null) return null;
      left = [OP_SERVIDOR[tk.valor], left, right];
    }
    return left;
  }

  if (secuencia.length === 0) return null;
  const ast = expr();
  if (ast == null || pos !== secuencia.length) return null;
  return ast;
}
