// Emulador mínimo de las migraciones que SEMBRARON las lecciones de Calculia
// (0165, 0170, 0178, 0181, 0195). No es un intérprete de SQL: solo entiende las
// tres formas de sentencia sobre `public.techniques` que esos archivos usan
// (insert de filas, update con `contenido || '...'`, `jsonb_set(contenido,
// '{clave}', '...')` o reemplazo total; los literales pueden ir entre comillas
// simples o entre $tag$) y calcula el estado FINAL de cada fila.
// lecciones.test.ts lo usa para comprobar que el contenido de TypeScript
// (`tecnicas.ts` / `clases.ts`) es EXACTAMENTE lo que ya está sembrado, sin
// reescribirlo. Es puro (recibe el texto SQL, no lee archivos).

export interface ContenidoSembrado {
  pasos?: string[];
  quiz?: { pregunta: string; opciones: string[]; respuesta: string; explicacion: string }[];
  visuales?: unknown[];
  [clave: string]: unknown;
}

export interface FilaSembrada {
  slug: string;
  nombre: string;
  descripcion: string;
  orden: number;
  requierePro: boolean;
  contenido: ContenidoSembrado;
}

type Token = { t: "str"; v: string } | { t: "num"; v: number } | { t: "word"; v: string } | { t: "sym"; v: string };

// Tokeniza desde `desde` hasta el primer `;` fuera de un literal. Los literales
// son SQL estándar: '' escapa la comilla y la barra invertida NO es especial.
function tokenizarSentencia(sql: string, desde: number): { tokens: Token[]; fin: number } {
  const tokens: Token[] = [];
  let i = desde;
  while (i < sql.length) {
    const c = sql[i];
    if (c === ";") return { tokens, fin: i + 1 };
    if (c === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "'") {
      let s = "";
      i++;
      for (;;) {
        if (i >= sql.length) throw new Error("literal sin cerrar");
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            s += "'";
            i += 2;
            continue;
          }
          i++;
          break;
        }
        s += sql[i++];
      }
      tokens.push({ t: "str", v: s });
      continue;
    }
    if (c === "$") {
      // Literal con delimitador de dólares ($tag$ ... $tag$), como el que usa
      // la migración generada de los visuales (contenido sin escapes).
      const m = /^\$([A-Za-z_]*)\$/.exec(sql.slice(i));
      if (m) {
        const cierre = sql.indexOf(m[0], i + m[0].length);
        if (cierre < 0) throw new Error("literal $tag$ sin cerrar");
        tokens.push({ t: "str", v: sql.slice(i + m[0].length, cierre) });
        i = cierre + m[0].length;
        continue;
      }
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < sql.length && /[0-9]/.test(sql[j])) j++;
      tokens.push({ t: "num", v: Number(sql.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_.]/.test(sql[j])) j++;
      tokens.push({ t: "word", v: sql.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if (c === ":" && sql[i + 1] === ":") {
      tokens.push({ t: "sym", v: "::" });
      i += 2;
      continue;
    }
    if (c === "|" && sql[i + 1] === "|") {
      tokens.push({ t: "sym", v: "||" });
      i += 2;
      continue;
    }
    tokens.push({ t: "sym", v: c });
    i++;
  }
  throw new Error("sentencia sin ';'");
}

class Lector {
  private pos = 0;
  constructor(private tokens: Token[]) {}
  get fin(): boolean {
    return this.pos >= this.tokens.length;
  }
  ver(): Token | undefined {
    return this.tokens[this.pos];
  }
  palabra(v: string): void {
    const t = this.tokens[this.pos++];
    if (!t || t.t !== "word" || t.v !== v) throw new Error(`se esperaba «${v}», llegó ${JSON.stringify(t)}`);
  }
  simbolo(v: string): void {
    const t = this.tokens[this.pos++];
    if (!t || t.t !== "sym" || t.v !== v) throw new Error(`se esperaba «${v}», llegó ${JSON.stringify(t)}`);
  }
  cadena(): string {
    const t = this.tokens[this.pos++];
    if (!t || t.t !== "str") throw new Error(`se esperaba un literal, llegó ${JSON.stringify(t)}`);
    return t.v;
  }
  numero(): number {
    const t = this.tokens[this.pos++];
    if (!t || t.t !== "num") throw new Error(`se esperaba un número, llegó ${JSON.stringify(t)}`);
    return t.v;
  }
  siguienteEs(tipo: Token["t"], v?: string): boolean {
    const t = this.tokens[this.pos];
    return !!t && t.t === tipo && (v === undefined || t.v === v);
  }
  avanzar(): Token {
    return this.tokens[this.pos++];
  }
  jsonbLiteral(): unknown {
    const s = this.cadena();
    this.simbolo("::");
    this.palabra("jsonb");
    return JSON.parse(s);
  }
}

function aplicarInsert(l: Lector, filas: Map<string, FilaSembrada>): void {
  l.palabra("insert");
  l.palabra("into");
  l.palabra("public.techniques");
  l.simbolo("(");
  const columnas: string[] = [];
  for (;;) {
    const t = l.avanzar();
    if (t.t !== "word") throw new Error("columna inesperada");
    columnas.push(t.v);
    if (l.siguienteEs("sym", ",")) {
      l.avanzar();
      continue;
    }
    break;
  }
  l.simbolo(")");
  l.palabra("values");
  for (;;) {
    l.simbolo("(");
    const fila: Record<string, unknown> = {};
    for (let c = 0; c < columnas.length; c++) {
      const t = l.ver();
      if (t?.t === "str") {
        const s = l.cadena();
        if (columnas[c] === "contenido") fila[columnas[c]] = JSON.parse(s);
        else fila[columnas[c]] = s;
      } else if (t?.t === "num") fila[columnas[c]] = l.numero();
      else if (t?.t === "word" && (t.v === "true" || t.v === "false")) {
        l.avanzar();
        fila[columnas[c]] = t.v === "true";
      }
      else throw new Error(`valor inesperado ${JSON.stringify(t)}`);
      if (c < columnas.length - 1) l.simbolo(",");
    }
    l.simbolo(")");
    if (fila.problem_type === "calculia") {
      const slug = fila.slug as string;
      filas.set(slug, {
        slug,
        nombre: fila.nombre as string,
        descripcion: fila.descripcion as string,
        orden: fila.orden as number,
        requierePro: fila.requiere_pro === true,
        contenido: fila.contenido as ContenidoSembrado,
      });
    }
    if (l.siguienteEs("sym", ",")) {
      l.avanzar();
      continue;
    }
    break;
  }
  // `on conflict (slug) do nothing` opcional: no cambia el estado final.
}

function aplicarUpdate(l: Lector, filas: Map<string, FilaSembrada>): void {
  l.palabra("update");
  l.palabra("public.techniques");
  l.palabra("set");
  l.palabra("contenido");
  l.simbolo("=");
  let nuevo: (previo: ContenidoSembrado) => ContenidoSembrado;
  if (l.siguienteEs("word", "contenido")) {
    l.avanzar();
    l.simbolo("||");
    const j = l.jsonbLiteral() as ContenidoSembrado;
    nuevo = (p) => ({ ...p, ...j });
  } else if (l.siguienteEs("word", "jsonb_set")) {
    l.avanzar();
    l.simbolo("(");
    l.palabra("contenido");
    l.simbolo(",");
    const ruta = l.cadena();
    const m = /^\{([a-z_]+)\}$/.exec(ruta);
    if (!m) throw new Error(`ruta de jsonb_set no soportada: ${ruta}`);
    l.simbolo(",");
    const j = l.jsonbLiteral();
    l.simbolo(")");
    nuevo = (p) => ({ ...p, [m[1]]: j });
  } else {
    const j = l.jsonbLiteral() as ContenidoSembrado;
    nuevo = () => j;
  }
  l.palabra("where");
  l.palabra("slug");
  l.simbolo("=");
  const slug = l.cadena();
  const fila = filas.get(slug);
  if (!fila) return; // update de otro mundo (0195 mezcla Calculia y Circuitia)
  fila.contenido = nuevo(fila.contenido);
}

// Aplica en orden las migraciones dadas (texto SQL) y devuelve las filas de
// `techniques` con problem_type='calculia' en su estado final, por slug.
export function estadoSembradoCalculia(migraciones: string[]): Map<string, FilaSembrada> {
  const filas = new Map<string, FilaSembrada>();
  for (const sql of migraciones) {
    const re = /^(insert into public\.techniques|update public\.techniques)/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      const { tokens, fin } = tokenizarSentencia(sql, m.index);
      if (m[1].startsWith("insert")) {
        // Recorta un posible `on conflict ...` final (no aporta al estado).
        const iOn = tokens.findIndex((t) => t.t === "word" && t.v === "on");
        aplicarInsert(new Lector(iOn >= 0 ? tokens.slice(0, iOn) : tokens), filas);
      } else {
        aplicarUpdate(new Lector(tokens), filas);
      }
      re.lastIndex = fin;
    }
  }
  return filas;
}
