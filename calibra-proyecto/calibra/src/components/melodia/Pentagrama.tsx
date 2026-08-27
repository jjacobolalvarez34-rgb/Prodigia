import { indiceDiatonicoAbsoluto, type NotaMusical } from "@/lib/practica/melodia";

interface Props {
  notas: NotaMusical[];
  // "secuencial": una nota al lado de la otra (escalas). "simultanea":
  // todas apiladas en la misma posición horizontal (acordes, o una
  // sola nota en Lectura/Alteraciones).
  disposicion?: "secuencial" | "simultanea";
  colorHex?: string;
  className?: string;
}

const ESPACIO_LINEA = 12;
const RADIO_CABEZA = 6.5;
// E4 (mi central) es la línea de abajo del pentagrama en clave de
// sol — índice diatónico absoluto de referencia, 0 pasos.
const INDICE_LINEA_INFERIOR = 4 * 7 + 2;

// Líneas de pentagrama adicionales (ledger lines) necesarias para una
// nota que cae fuera de las 5 líneas reales — ver derivación completa
// en el comentario de melodia.ts sobre bandas de Lectura. Cada línea
// adicional está separada 2 "pasos" (una nota completa, línea o
// espacio) de la siguiente, igual que las líneas reales del
// pentagrama.
function pasosLineasAdicionales(pasos: number): number[] {
  const resultado: number[] = [];
  if (pasos < 0) {
    let k = -2;
    while (k >= pasos) {
      resultado.push(k);
      k -= 2;
    }
  } else if (pasos > 8) {
    let k = 10;
    while (k <= pasos) {
      resultado.push(k);
      k += 2;
    }
  }
  return resultado;
}

function pasosDeNota(nota: NotaMusical): number {
  return indiceDiatonicoAbsoluto(nota) - INDICE_LINEA_INFERIOR;
}

// Pentagrama en clave de sol, reutilizado por los 4 modos de Melodía
// que dibujan notas (Lectura, Alteraciones, Escalas, Acordes) — la
// única infraestructura visual compartida, nada se reconstruye por
// modo. Dibuja líneas, clave, cabezas de nota en su altura real
// (por índice diatónico, con ledger lines cuando corresponde) y el
// símbolo de alteración cuando la nota lo tiene. Sin plicas/corchetes
// a propósito: no forman parte de lo pedido y para acordes (varias
// cabezas simultáneas a distinta altura) agregan una complejidad de
// dibujo real que no aporta nada a un ejercicio de identificación.
export default function Pentagrama({ notas, disposicion = "secuencial", colorHex = "#B8860B", className = "" }: Props) {
  const yLineaInferior = 90;
  const xClave = 16;
  const xPrimeraNota = 52;
  const pasoX = 34;

  const anchoContenido = disposicion === "secuencial" ? xPrimeraNota + pasoX * Math.max(0, notas.length - 1) + 24 : xPrimeraNota + 40;
  const ancho = Math.max(140, anchoContenido);
  const alto = 140;

  function yDePasos(pasos: number): number {
    return yLineaInferior - (pasos * ESPACIO_LINEA) / 2;
  }

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width="100%" className={className} role="img" aria-label="Pentagrama musical">
      {/* 5 líneas del pentagrama */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={8}
          y1={yLineaInferior - i * ESPACIO_LINEA}
          x2={ancho - 8}
          y2={yLineaInferior - i * ESPACIO_LINEA}
          stroke="currentColor"
          strokeWidth={1.2}
          className="text-foreground/70"
        />
      ))}

      {/* Clave de sol — antes era el glifo Unicode U+1D11E (𝄞) vía
          <text>, que en varios dispositivos (sobre todo Android/Linux
          sin la fuente correcta instalada) no tiene glifo para ese
          carácter y no dibuja NADA — la causa real de "a veces no
          carga" reportada en Melodía (auditoría 2026-08-25, Fase 4).
          Un path SVG dibujado a mano, verificado renderizando el
          archivo antes de usarlo (mismo criterio que el resto del
          proyecto con assets nuevos) — no depende de ninguna fuente
          del sistema, así que renderiza siempre, en cualquier
          dispositivo. */}
      <g transform={`translate(${xClave - 5}, ${yLineaInferior - 66})`} className="fill-none stroke-foreground/85">
        <path
          d="M21 8C15 8 12 13 14 19C16 25 24 33 26 42C27.5 49 20 51 17 46C14.5 42 18 38 22 39C27 40.3 27 47 22 49.5C16 52.5 10 47 12 40C13.5 34.5 20 33 24 37L22 12C21.3 9.5 18 9 17 12C16 15 18.5 17 20.5 15.5"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M21 20L21 70" strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={21} cy={70} r={3.4} className="fill-foreground/85" stroke="none" />
      </g>

      {notas.map((nota, i) => {
        const pasos = pasosDeNota(nota);
        const x = disposicion === "secuencial" ? xPrimeraNota + i * pasoX : xPrimeraNota + 16;
        const y = yDePasos(pasos);
        const lineasExtra = pasosLineasAdicionales(pasos);
        const simbolo = nota.alteracion === "sostenido" ? "♯" : nota.alteracion === "bemol" ? "♭" : null;

        return (
          <g key={i}>
            {lineasExtra.map((p) => (
              <line
                key={p}
                x1={x - RADIO_CABEZA - 5}
                y1={yDePasos(p)}
                x2={x + RADIO_CABEZA + 5}
                y2={yDePasos(p)}
                stroke="currentColor"
                strokeWidth={1.2}
                className="text-foreground/70"
              />
            ))}
            {simbolo && (
              <text x={x - RADIO_CABEZA - 13} y={y + 5} fontSize={17} className="fill-foreground" style={{ fontWeight: 600 }}>
                {simbolo}
              </text>
            )}
            <ellipse cx={x} cy={y} rx={RADIO_CABEZA} ry={RADIO_CABEZA - 1.3} fill={colorHex} transform={`rotate(-18 ${x} ${y})`} />
          </g>
        );
      })}
    </svg>
  );
}
