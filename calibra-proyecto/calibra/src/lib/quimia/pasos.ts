// «Cómo se resuelve» de Quimia (pedido 2026-10-18). Funciones puras: reciben los datos
// del elemento o compuesto con que se armó la pregunta (y, para las fórmulas, cómo se
// llama cada símbolo).

// Símbolos que vienen del latín (no se parecen al nombre en español).
const LATIN: Record<string, string> = {
  Na: "natrium",
  K: "kalium",
  Fe: "ferrum",
  Cu: "cuprum",
  Ag: "argentum",
  Au: "aurum",
  Pb: "plumbum",
  Hg: "hydrargyrum",
  Sn: "stannum",
  Sb: "stibium",
  W: "wolfram",
  P: "phosphorus",
  S: "sulphur",
  N: "nitrogenium",
};

export interface DatosElemento {
  simbolo: string;
  nombre: string;
  numeroAtomico: number;
  periodo: number;
  grupo: number;
}

export function pasosSimbolo(el: DatosElemento): string[] {
  const pasos = [`${el.simbolo} es el símbolo de ${el.nombre.toLowerCase()} (número atómico ${el.numeroAtomico})`];
  if (LATIN[el.simbolo]) pasos.push(`Viene de su nombre en latín, «${LATIN[el.simbolo]}»: por eso no se parece al nombre en español`);
  else pasos.push(`El símbolo sale de las primeras letras del nombre (en latín o en inglés): la primera siempre en mayúscula`);
  return pasos;
}

export function pasosTabla(el: DatosElemento, que: "z" | "periodo" | "grupo" | "oxidacion", oxidacion?: string, otros?: string[]): string[] {
  if (que === "z") return [`El número atómico (Z) es la cantidad de protones del núcleo y el orden en la tabla`, `${el.nombre} (${el.simbolo}) tiene Z = ${el.numeroAtomico}`];
  if (que === "periodo") return [`El período es la fila de la tabla: dice cuántas capas de electrones tiene el átomo`, `${el.nombre} está en la fila ${el.periodo}`];
  if (que === "grupo") return [`El grupo es la columna: los elementos de una misma columna tienen los mismos electrones en la última capa y se parecen químicamente`, `${el.nombre} está en la columna ${el.grupo}`];
  return [
    `El estado de oxidación más común dice cuántos electrones suele ganar (negativo) o perder (positivo) el átomo al formar compuestos`,
    `${el.nombre}: ${oxidacion}${otros && otros.length ? ` (también puede tener ${otros.join(", ")})` : ""}`,
  ];
}

// Átomos de cada elemento en una fórmula (con paréntesis): Ca(OH)2 → Ca 1, O 2, H 2.
export function contarAtomos(formula: string): [string, number][] {
  const pila: Map<string, number>[] = [new Map()];
  const re = /([A-Z][a-z]?|\(|\))(\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(formula))) {
    const [, t, n] = m;
    const k = n ? Number(n) : 1;
    if (t === "(") pila.push(new Map());
    else if (t === ")") {
      const grupo = pila.pop()!;
      const arriba = pila[pila.length - 1];
      for (const [e, c] of grupo) arriba.set(e, (arriba.get(e) ?? 0) + c * k);
    } else {
      const arriba = pila[pila.length - 1];
      arriba.set(t, (arriba.get(t) ?? 0) + k);
    }
  }
  return [...pila[0].entries()];
}

const sub = (s: string) => s.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);

export function pasosFormula(formula: string, nombre: string, nombreDe: (simbolo: string) => string | undefined): string[] {
  const atomos = contarAtomos(formula)
    .map(([e, c]) => `${c} de ${(nombreDe(e) ?? e).toLowerCase()} (${e})`)
    .join(", ");
  return [`${sub(formula)} es ${nombre.charAt(0).toLowerCase()}${nombre.slice(1)}`, `Los números chicos dicen cuántos átomos de cada elemento hay: ${atomos}`];
}

// Regla de nomenclatura según cómo empieza o termina el nombre.
export function pasosNomenclatura(formula: string, nombre: string, nombreDe: (simbolo: string) => string | undefined): string[] {
  const n = nombre.toLowerCase();
  let regla: string;
  if (n.startsWith("óxido")) regla = "Óxido: un elemento unido al oxígeno (O)";
  else if (n.startsWith("hidróxido")) regla = "Hidróxido: un metal unido al grupo OH";
  else if (n.startsWith("ácido") && /ico$/.test(n.split(" ").pop() ?? "")) regla = "Ácido «-ico»: H + no metal + oxígeno, con el estado de oxidación mayor (el «-oso» es el menor; «per-…-ico» el máximo, «hipo-…-oso» el mínimo)";
  else if (n.startsWith("ácido")) regla = "Ácido «-oso»: H + no metal + oxígeno, con el estado de oxidación menor («hipo-…-oso» es el más bajo)";
  else if (/uro de/.test(n)) regla = "«-uro»: sal binaria, un no metal con un metal y sin oxígeno";
  else if (/ato de|ito de/.test(n)) regla = "«-ato» o «-ito»: sal de un ácido con oxígeno («-ato» viene de «-ico», «-ito» de «-oso»); «bi-» o «hidrógeno» indica que le queda un H";
  else regla = "Lee los elementos de la fórmula y la terminación del nombre";
  const pasos = [regla];
  if (/\((I|II|III|IV|V|VI|VII)\)/.test(nombre)) pasos.push(`El número romano es la carga del metal: ${/\(([IVX]+)\)/.exec(nombre)![1]}`);
  pasos.push(...pasosFormula(formula, nombre, nombreDe));
  return pasos;
}

const PREFIJO: Record<number, string> = { 1: "met-", 2: "et-", 3: "prop-", 4: "but-", 5: "pent-", 6: "hex-", 7: "hept-", 8: "oct-" };

export function pasosOrganica(c: { nombre: string; formula: string; grupos: string[]; anillo?: boolean; enlaceDoble?: number }): string[] {
  const n = c.nombre.toLowerCase();
  if (c.anillo) return [`Anillo de 6 carbonos con enlaces alternados: es el benceno (o un derivado si tiene algo pegado)`, `Respuesta: ${c.nombre}`];
  const carbonos = contarAtomos(c.formula).find(([e]) => e === "C")?.[1] ?? 0;
  const pasos: string[] = [];
  if (PREFIJO[carbonos]) pasos.push(`Cuenta los carbonos: ${carbonos} → prefijo «${PREFIJO[carbonos]}»`);
  let grupo: string;
  if (n.startsWith("ácido")) grupo = "Grupo carboxilo (−COOH) → «ácido …-oico»";
  else if (/ol$/.test(n)) grupo = "Grupo hidroxilo (−OH) → alcohol, terminación «-ol»";
  else if (/al$/.test(n)) grupo = "Grupo aldehído (−CHO, en la punta) → terminación «-al»";
  else if (/ona$/.test(n)) grupo = "Grupo carbonilo en el medio (C=O) → cetona, terminación «-ona»";
  else if (/amina$/.test(n)) grupo = "Grupo amino (−NH₂) → amina";
  else if (/ato de/.test(n)) grupo = "Éster (−COO−): «-ato de …»";
  else if (/éter/.test(n)) grupo = "Un oxígeno entre dos cadenas (−O−) → éter";
  else if (/ino$/.test(n)) grupo = "Un enlace triple → alquino, terminación «-ino»";
  else if (/eno$/.test(n) || c.enlaceDoble != null) grupo = "Un enlace doble → alqueno, terminación «-eno»";
  else grupo = "Solo enlaces simples → alcano, terminación «-ano»";
  pasos.push(grupo, `Respuesta: ${c.nombre}`);
  return pasos;
}
