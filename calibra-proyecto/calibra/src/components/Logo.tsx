interface Props {
  size?: number;
  className?: string;
  // Fase II: el aro cambia al color del mundo activo (violeta por
  // defecto) — es la señal más fuerte de "estás en otro lugar".
  colorAro?: string;
}

// Anillo flat #6C4CF1 con apertura al costado derecho, de donde brota una
// chispa ASIMÉTRICA en degradé violeta→dorado: una punta larga tipo
// cometa + una punta chica de contrapeso en un ángulo distinto — a
// propósito sin simetría rotacional, para que se lea como chispa y no
// como una flor de 4 pétalos (Fase FF).
export default function Logo({ size = 32, className, colorAro = "#6C4CF1" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        {/* Degradé violeta -> dorado con una parada intermedia cálida
            neutra a propósito: interpolar RGB directo entre A794FF y
            FFC53D pasa por un rosa/coral apagado en el medio, que la
            marca pide evitar. */}
        <linearGradient id="prodigia-star-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A794FF" />
          <stop offset="50%" stopColor="#E4CBA0" />
          <stop offset="100%" stopColor="#FFC53D" />
        </linearGradient>
      </defs>

      {/* Extremos sin stroke-linecap (butt = default): un stroke de arco
          termina en un corte radial, que es justo el corte angulado que
          tiene el anillo de referencia, no una punta redondeada. */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={colorAro}
        strokeWidth="14"
        strokeDasharray="158.6 55"
        strokeDashoffset="27.5"
        transform="rotate(-10 50 50)"
        style={{ transition: "stroke .3s ease" }}
      />

      {/* Chispa de 2 puntas asimétricas: una larga tipo cometa (con los
          dos lados de la curva distintos a propósito, para que ni esa
          punta sola sea simétrica) y una chica de contrapeso a ~145°,
          no a 180° — así no hay ningún eje de simetría en el conjunto. */}
      <g transform="translate(82 44) rotate(14)" fill="url(#prodigia-star-gradient)">
        <path d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" />
        <path d="M0,0 C3,4.5 8,6.5 11,5 C7.5,2 3,0.5 0,0 Z" transform="rotate(146)" />
      </g>
    </svg>
  );
}
