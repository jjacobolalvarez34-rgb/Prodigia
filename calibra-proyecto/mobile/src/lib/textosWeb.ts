// Textos de la web (calibra/messages/es.json) para lo que la app dibuja igual que la
// web, como los visuales de las lecciones: una sola fuente de textos, así no se
// desalinean (docs/PARIDAD_APP_WEB.md). Imita lo justo de next-intl: `{variable}`,
// `{n, plural, one {…} other {…}}`, `{x, select, a {…} other {…}}` y quita las
// etiquetas de t.rich (`<b>…</b>`).
import mensajes from "../../../calibra/messages/es.json";

type Valores = Record<string, string | number>;
type Arbol = { [k: string]: string | Arbol };

function buscar(ruta: string): string | null {
  let nodo: string | Arbol = mensajes as unknown as Arbol;
  for (const parte of ruta.split(".")) {
    if (typeof nodo !== "object" || !(parte in nodo)) return null;
    nodo = nodo[parte];
  }
  return typeof nodo === "string" ? nodo : null;
}

// Busca el cierre de una llave balanceada desde `i` (que apunta a "{").
function cierre(s: string, i: number): number {
  let nivel = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") nivel++;
    else if (s[j] === "}") {
      nivel--;
      if (nivel === 0) return j;
    }
  }
  return s.length - 1;
}

function formatear(plantilla: string, valores: Valores): string {
  let out = "";
  let i = 0;
  while (i < plantilla.length) {
    if (plantilla[i] !== "{") {
      out += plantilla[i++];
      continue;
    }
    const fin = cierre(plantilla, i);
    const dentro = plantilla.slice(i + 1, fin);
    i = fin + 1;
    const coma = dentro.indexOf(",");
    if (coma < 0) {
      const v = valores[dentro.trim()];
      out += v === undefined ? "" : typeof v === "number" ? v.toLocaleString("es") : v;
      continue;
    }
    const nombre = dentro.slice(0, coma).trim();
    const resto = dentro.slice(coma + 1);
    const coma2 = resto.indexOf(",");
    const tipo = resto.slice(0, coma2).trim();
    const opcionesTxt = resto.slice(coma2 + 1);
    const opciones: Record<string, string> = {};
    let k = 0;
    while (k < opcionesTxt.length) {
      const m = /\s*(=?\w+)\s*\{/y;
      m.lastIndex = k;
      const r = m.exec(opcionesTxt);
      if (!r) break;
      const abre = m.lastIndex - 1;
      const cierra = cierre(opcionesTxt, abre);
      opciones[r[1]] = opcionesTxt.slice(abre + 1, cierra);
      k = cierra + 1;
    }
    const v = valores[nombre];
    let elegido: string | undefined;
    if (tipo === "plural") {
      const n = Number(v);
      elegido = opciones[`=${n}`] ?? (n === 1 ? opciones.one : undefined) ?? opciones.other;
      elegido = elegido?.replace(/#/g, String(n));
    } else {
      elegido = opciones[String(v)] ?? opciones.other;
    }
    out += formatear(elegido ?? "", valores);
  }
  return out;
}

export function textoWeb(ruta: string, valores: Valores = {}): string {
  const plantilla = buscar(ruta);
  if (plantilla == null) return "";
  return formatear(plantilla, valores).replace(/<\/?[a-zA-Z0-9]+>/g, "");
}

export function tieneTextoWeb(ruta: string): boolean {
  return buscar(ruta) != null;
}

// Igual que useTranslations("Namespace") de next-intl: t("clave", { valores }).
export function textosDe(espacio: string) {
  const t = (clave: string, valores?: Valores) => textoWeb(`${espacio}.${clave}`, valores);
  t.has = (clave: string) => tieneTextoWeb(`${espacio}.${clave}`);
  return t;
}
