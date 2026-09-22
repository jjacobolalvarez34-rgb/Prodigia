import { partirMathText } from "@/lib/texto/mathText";

interface Props {
  texto: string;
  className?: string;
}

// Único lugar del código que sabe renderizar la convención $...$ (ver
// docs/PLAN_REVISION_CONTENIDO.md) — un texto sin ningún $ se ve
// exactamente igual que antes de que este componente existiera, así
// que reemplazar un <p>{texto}</p> por <MathText texto={texto} /> en
// cualquier lugar del código es siempre seguro, incluso antes de que
// ese contenido específico se actualice a la convención nueva.
export default function MathText({ texto, className }: Props) {
  const partes = partirMathText(texto);
  return (
    <span className={className}>
      {partes.map((parte, i) =>
        parte.tipo === "texto" ? (
          <span key={i}>{parte.valor}</span>
        ) : (
          // HTML generado por katex.renderToString a partir de contenido propio, no de input de usuario.
          // inline-block + max-w-full + overflow-x-auto: una fórmula ancha (una
          // fracción larga en un botón de opción en un celular) se desplaza
          // dentro de su propio cuadro en vez de desbordar toda la página.
          <span
            key={i}
            className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-0.5 align-middle"
            dangerouslySetInnerHTML={{ __html: parte.html }}
          />
        )
      )}
    </span>
  );
}
