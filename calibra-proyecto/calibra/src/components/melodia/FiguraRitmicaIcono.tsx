import { useTranslations } from "next-intl";
import { formaFigura, type FiguraRitmica } from "@/lib/practica/melodia";

interface Props {
  figura: FiguraRitmica;
  colorHex?: string;
  className?: string;
}

// Ícono aislado de una figura rítmica (sin pentagrama, no hace falta
// altura real acá) — a diferencia de Pentagrama.tsx, esta SÍ necesita
// plica/corchetes porque es lo único que distingue visualmente
// redonda/blanca (huecas) de negra (rellena), negra de corchea (con
// corchete) y la corchea de la semicorchea, la fusa y la semifusa (2, 3 y 4
// corchetes). El puntillo va a la derecha de la cabeza y las corcheas unidas
// son dos cabezas con la barra en vez de corchetes. Nomenclatura estándar de
// notación musical, no una forma inventada (formaFigura, compartida con la app).
export default function FiguraRitmicaIcono({ figura, colorHex = "#B8860B", className = "" }: Props) {
  const t = useTranslations("Melodia.figuraRitmica");
  const forma = formaFigura(figura);
  const cy = 62;
  const yPlicaTope = 12;

  const cabeza = (cx: number, rx: number, ry: number) => (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      transform={`rotate(-18 ${cx} ${cy})`}
      fill={forma.hueca ? "none" : colorHex}
      stroke={colorHex}
      strokeWidth={forma.hueca ? 2.6 : 0}
    />
  );

  if (forma.unidas) {
    const xs = [14, 42];
    const plicas = xs.map((cx) => cx + 9 - 1.2);
    return (
      <svg viewBox="0 0 60 76" width={64} height={80} className={className} role="img" aria-label={t("ariaLabel", { figura })}>
        {plicas.map((x) => (
          <line key={x} x1={x} y1={cy} x2={x} y2={yPlicaTope + 2} stroke={colorHex} strokeWidth={2.4} strokeLinecap="round" />
        ))}
        <polygon points={`${plicas[0] - 1.2},${yPlicaTope} ${plicas[1] + 1.2},${yPlicaTope} ${plicas[1] + 1.2},${yPlicaTope + 6} ${plicas[0] - 1.2},${yPlicaTope + 6}`} fill={colorHex} />
        {xs.map((cx) => (
          <g key={cx}>{cabeza(cx, 9, 6.5)}</g>
        ))}
      </svg>
    );
  }

  const cx = forma.puntillo ? 22 : 26;
  const rx = 11;
  const xPlica = cx + rx - 1.5;
  return (
    <svg viewBox="0 0 60 76" width={64} height={80} className={className} role="img" aria-label={t("ariaLabel", { figura })}>
      {forma.plica && <line x1={xPlica} y1={cy} x2={xPlica} y2={yPlicaTope} stroke={colorHex} strokeWidth={2.4} strokeLinecap="round" />}
      {Array.from({ length: forma.corchetes }, (_, i) => {
        const y = yPlicaTope + i * 8;
        return (
          <path
            key={i}
            d={`M ${xPlica} ${y} C ${xPlica + 14} ${y + 5}, ${xPlica + 13} ${y + 15}, ${xPlica + 3} ${y + 20}`}
            fill="none"
            stroke={colorHex}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        );
      })}
      {cabeza(cx, rx, 8)}
      {forma.puntillo && <circle cx={cx + rx + 9} cy={cy - 3} r={2.8} fill={colorHex} />}
    </svg>
  );
}
