import { esTeclaNegra, etiquetaSalto, nombreDeTecla, type GeometriaTeclado } from "@/lib/melodia/visualesDatos";
import { semitonoAbsoluto, type NotaMusical } from "@/lib/practica/melodia";

interface Props {
  geometria: GeometriaTeclado;
  // Notas resaltadas (en orden) y su texto.
  notas: NotaMusical[];
  etiquetas: string[];
  cifrados?: string[];
  cifrado?: boolean;
  // Cuántas de esas notas se ven ya (0 = ninguna).
  visibles: number;
  nombres: "resaltadas" | "todas" | "ninguna";
  grupos?: boolean;
  semitonosNaturales?: boolean;
  saltos?: boolean;
  idioma: "es" | "en";
  color: string;
}

// «Do♯=Re♭» -> ["Do♯", "Re♭"]; con cifrado, «Fa♯» -> ["Fa♯", "F♯"].
function lineasDe(etiqueta: string, cifrado?: string): string[] {
  const partes = etiqueta.split("=");
  return cifrado !== undefined && partes.length === 1 ? [etiqueta, cifrado] : partes;
}

const COLOR_BLANCA = "#F8F6F0";
const COLOR_BORDE = "#B9B4A8";
const COLOR_NEGRA = "#26231F";
const COLOR_TEXTO = "#3A362F";
const COLOR_BLANCA_RESALTADA = "#F3D98B";
const COLOR_GRUPO_2 = "#4F7FBF";
const COLOR_GRUPO_3 = "#3E9A6A";

// Dibujo del teclado (solo SVG, sin estado): teclas blancas y negras a escala
// uniforme, con las notas resaltadas, sus nombres y, si se pide, los saltos
// (T/S) entre notas consecutivas, los grupos de teclas negras (2 y 3) y los
// pares de teclas blancas sin negra en medio (Mi-Fa y Si-Do). Es un esquema
// para ver distancias, no una fotografía de un piano.
export default function TecladoSvg({ geometria, notas, etiquetas, cifrados, cifrado, visibles, nombres, grupos, semitonosNaturales, saltos, idioma, color }: Props) {
  const { teclas, blancas } = geometria;
  const W = Math.max(20, Math.min(46, Math.floor(330 / blancas)));
  const altoBlanca = 92;
  const altoNegra = 56;
  const anchoNegra = W * 0.6;
  const semitonos = notas.map(semitonoAbsoluto);
  const visiblesSet = new Map<number, number>(); // semitono -> índice de la nota
  semitonos.forEach((s, i) => {
    if (i < visibles) visiblesSet.set(s, i);
  });
  const actual = visibles - 1;
  const hayNegraResaltada = semitonos.some((s, i) => i < visibles && esTeclaNegra(s));
  const conSaltos = saltos === true && notas.length > 1;
  const filaSaltos = conSaltos ? 22 : 0;
  // Las etiquetas «A=B» (dos nombres de una misma tecla) van en dos líneas.
  const hayDoble = etiquetas.some((e) => e.includes("=")) || cifrado === true;
  const filaNegras = hayNegraResaltada || grupos ? (hayDoble && hayNegraResaltada ? 32 : 18) : 0;
  const y0 = 4 + filaSaltos + filaNegras;
  const filaInferior = semitonosNaturales ? 22 : 0;
  const ancho = blancas * W;
  const alto = y0 + altoBlanca + filaInferior + 4;
  const fuente = W >= 36 ? 12 : W >= 28 ? 10 : 8.5;
  const cx = (centro: number) => centro * W;

  // Grupos de teclas negras completos dentro del rango dibujado.
  const gruposNegras: { centro: number; n: 2 | 3 }[] = [];
  if (grupos) {
    const negras = teclas.filter((k) => k.negra);
    for (const k of negras) {
      const pc = ((k.semitono % 12) + 12) % 12;
      if (pc === 1 && negras.some((o) => o.semitono === k.semitono + 2)) gruposNegras.push({ centro: k.centro + 1, n: 2 });
      if (pc === 6 && negras.some((o) => o.semitono === k.semitono + 4)) gruposNegras.push({ centro: k.centro + 1, n: 3 });
    }
  }
  const colorDeNegra = (semitono: number): string | null => {
    if (!grupos) return null;
    const pc = ((semitono % 12) + 12) % 12;
    return pc === 1 || pc === 3 ? COLOR_GRUPO_2 : COLOR_GRUPO_3;
  };

  // Pares Mi-Fa y Si-Do (blancas contiguas, semitono 4-5 y 11-0).
  const paresNaturales: { x: number }[] = [];
  if (semitonosNaturales) {
    for (const k of teclas) {
      const pc = ((k.semitono % 12) + 12) % 12;
      if (!k.negra && (pc === 4 || pc === 11) && teclas.some((o) => !o.negra && o.semitono === k.semitono + 1)) paresNaturales.push({ x: cx(k.centro + 0.5) });
    }
  }

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width="100%" style={{ maxWidth: Math.max(ancho, 200) * 1.35 }} className="mx-auto" aria-hidden="true">
      {/* Saltos entre notas consecutivas resaltadas */}
      {conSaltos &&
        semitonos.slice(1).map((s, i) => {
          if (i + 1 >= visibles) return null;
          const a = teclas.find((k) => k.semitono === semitonos[i]);
          const b = teclas.find((k) => k.semitono === s);
          if (!a || !b) return null;
          const x1 = cx(a.centro) + 2;
          const x2 = cx(b.centro) - 2;
          const y = 19;
          return (
            <g key={`s${i}`}>
              <path d={`M ${x1} ${y + 3} V ${y} H ${x2} V ${y + 3}`} fill="none" stroke={color} strokeWidth={1.4} />
              <text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
                {etiquetaSalto(s - semitonos[i], idioma)}
              </text>
            </g>
          );
        })}

      {/* Grupos de teclas negras */}
      {gruposNegras.map((g, i) => (
        <text key={`g${i}`} x={cx(g.centro)} y={filaSaltos + 14} textAnchor="middle" fontSize={13} fontWeight={800} fill={g.n === 2 ? COLOR_GRUPO_2 : COLOR_GRUPO_3}>
          {g.n}
        </text>
      ))}

      {/* Teclas blancas */}
      {teclas
        .filter((k) => !k.negra)
        .map((k) => {
          const idx = visiblesSet.get(k.semitono);
          const resaltada = idx !== undefined;
          const x = k.indiceBlanca * W;
          const nombre = resaltada ? etiquetas[idx] : nombres === "todas" ? nombreDeTecla(k.semitono, false) : "";
          return (
            <g key={k.semitono}>
              <rect x={x + 0.5} y={y0} width={W - 1} height={altoBlanca} rx={3} fill={resaltada ? COLOR_BLANCA_RESALTADA : COLOR_BLANCA} stroke={idx === actual && resaltada ? color : COLOR_BORDE} strokeWidth={idx === actual && resaltada ? 2 : 1} />
              {nombres !== "ninguna" &&
                nombre !== "" &&
                lineasDe(nombre).map((linea, li, todas) => (
                  <text
                    key={li}
                    x={x + W / 2}
                    y={y0 + altoBlanca - (cifrado && resaltada ? 24 : 8) - (todas.length - 1 - li) * 13}
                    textAnchor="middle"
                    fontSize={Math.min(fuente, (W * 0.95) / (Math.max(1, linea.length) * 0.56))}
                    fontWeight={resaltada ? 700 : 500}
                    fill={COLOR_TEXTO}
                  >
                    {linea}
                  </text>
                ))}
              {cifrado && resaltada && cifrados && (
                <text x={x + W / 2} y={y0 + altoBlanca - 7} textAnchor="middle" fontSize={fuente + 3} fontWeight={800} fill={color}>
                  {cifrados[idx]}
                </text>
              )}
            </g>
          );
        })}

      {/* Teclas negras (encima) */}
      {teclas
        .filter((k) => k.negra)
        .map((k) => {
          const idx = visiblesSet.get(k.semitono);
          const resaltada = idx !== undefined;
          const propio = colorDeNegra(k.semitono);
          return (
            <g key={k.semitono}>
              <rect
                x={cx(k.centro) - anchoNegra / 2}
                y={y0}
                width={anchoNegra}
                height={altoNegra}
                rx={2.5}
                fill={resaltada ? color : (propio ?? COLOR_NEGRA)}
                stroke={idx === actual && resaltada ? "#fff" : COLOR_NEGRA}
                strokeWidth={idx === actual && resaltada ? 2 : 1}
              />
              {resaltada && nombres !== "ninguna" && (
                <text
                  textAnchor="middle"
                  fontSize={Math.min(fuente + 1, (W * 1.05) / (Math.max(1, ...lineasDe(etiquetas[idx], cifrado === true ? cifrados?.[idx] : undefined).map((l) => l.length)) * 0.56))}
                  fontWeight={700}
                  className="fill-foreground"
                >
                  {lineasDe(etiquetas[idx], cifrado === true ? cifrados?.[idx] : undefined).map((linea, li) => (
                    <tspan key={li} x={cx(k.centro)} y={filaSaltos + 12 + li * 13}>
                      {linea}
                    </tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}

      {/* Semitonos "naturales": Mi-Fa y Si-Do */}
      {paresNaturales.map((p, i) => (
        <g key={`n${i}`}>
          <path d={`M ${p.x - W * 0.5 + 3} ${y0 + altoBlanca + 5} V ${y0 + altoBlanca + 10} H ${p.x + W * 0.5 - 3} V ${y0 + altoBlanca + 5}`} fill="none" stroke={color} strokeWidth={1.4} />
          <text x={p.x} y={y0 + altoBlanca + 20} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
            {etiquetaSalto(1, idioma)}
          </text>
        </g>
      ))}
    </svg>
  );
}
