import type { Lenguaje } from "@/lib/codia/tipos";
import { NOMBRE_LENGUAJE } from "@/lib/codia/tipos";
import { tokensPorLinea, type TipoToken } from "./resaltado";

interface Props {
  codigo: string;
  lenguaje: Lenguaje;
  // Muestra el número de línea a la izquierda (las preguntas de
  // "¿en qué línea?" lo necesitan).
  numeros?: boolean;
  className?: string;
}

const COLOR: Record<TipoToken, string | undefined> = {
  clave: "color-mix(in oklab, #0891b2 78%, var(--foreground))",
  cadena: "color-mix(in oklab, var(--correcto) 60%, var(--foreground))",
  numero: "color-mix(in oklab, var(--racha) 62%, var(--foreground))",
  comentario: "var(--texto-secundario)",
  texto: undefined,
};

// Bloque de código monoespaciado y accesible: <pre><code> real (el lector
// de pantalla lo lee como código, con saltos de línea), foco por teclado
// para poder desplazarlo, contraste de tokens sobre la superficie del
// tema, y números de línea que no se copian ni se leen (aria-hidden).
export default function BloqueCodigo({ codigo, lenguaje, numeros = true, className = "" }: Props) {
  const lineas = tokensPorLinea(codigo, lenguaje);
  const ancho = String(lineas.length).length;
  return (
    <pre
      tabIndex={0}
      aria-label={`Código en ${NOMBRE_LENGUAJE[lenguaje]}`}
      className={`w-full overflow-x-auto rounded-xl border border-border bg-surface-2 px-3 py-3 text-left font-mono text-[13px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primario ${className}`}
    >
      <code className="block min-w-max">
        {lineas.map((toks, i) => (
          <span key={i} className="flex">
            {numeros && (
              <span aria-hidden className="mr-3 inline-block select-none text-right text-texto-secundario" style={{ minWidth: `${ancho}ch` }}>
                {i + 1}
              </span>
            )}
            <span className="whitespace-pre">
              {toks.length === 0 ? " " : toks.map((t, j) => (COLOR[t.tipo] ? <span key={j} style={{ color: COLOR[t.tipo], fontStyle: t.tipo === "comentario" ? "italic" : undefined, fontWeight: t.tipo === "clave" ? 600 : undefined }}>{t.texto}</span> : t.texto))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
