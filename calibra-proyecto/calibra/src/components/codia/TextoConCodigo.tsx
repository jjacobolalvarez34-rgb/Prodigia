import MathText from "@/components/MathText";
import BloqueCodigo from "./BloqueCodigo";
import type { Lenguaje } from "@/lib/codia/tipos";

const LENGUAJES_VALIDOS: string[] = ["python", "java", "javascript", "typescript"];

interface Props {
  texto: string;
}

// Renderiza el texto de una lección de Codia. Los bloques
// ```lenguaje ... ``` (lenguaje en la primera línea) se muestran como
// bloque de código con resaltado; los bloques ```salida ... ``` como la
// salida real del ejemplo; el resto pasa por MathText (misma convención
// $...$ que todo Prodigia: las lecciones de Codia evitan el signo $ en el
// código para no chocar con ella).
export default function TextoConCodigo({ texto }: Props) {
  const partes = texto.split("```");
  return (
    <div className="flex flex-col gap-2">
      {partes.map((parte, i) => {
        if (i % 2 === 0) {
          return parte.trim() === "" ? null : (
            <p key={i} className="whitespace-pre-line">
              <MathText texto={parte.trim()} />
            </p>
          );
        }
        const salto = parte.indexOf("\n");
        // "python!" marca un ejemplo que falla a propósito: se colorea igual que "python".
        const etiqueta = (salto >= 0 ? parte.slice(0, salto) : parte).trim().toLowerCase().replace(/!$/, "");
        const cuerpo = (salto >= 0 ? parte.slice(salto + 1) : "").replace(/\n$/, "");
        if (etiqueta === "salida") {
          return (
            <pre
              key={i}
              tabIndex={0}
              aria-label="Salida del programa"
              className="w-full overflow-x-auto rounded-xl border border-dashed border-border bg-background px-3 py-2 text-left font-mono text-[13px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primario"
            >
              <span aria-hidden className="mr-2 select-none text-texto-secundario">
                &gt;
              </span>
              <code className="whitespace-pre">{cuerpo}</code>
            </pre>
          );
        }
        const lang: Lenguaje = LENGUAJES_VALIDOS.includes(etiqueta) ? (etiqueta as Lenguaje) : "python";
        return <BloqueCodigo key={i} codigo={cuerpo} lenguaje={lang} numeros={false} />;
      })}
    </div>
  );
}
