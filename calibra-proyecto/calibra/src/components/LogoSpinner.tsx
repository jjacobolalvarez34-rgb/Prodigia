interface Props {
  size?: number;
  className?: string;
  colorAro?: string;
}

// Spinner de carga: reusa el path real de la chispa de Logo.tsx (mismo
// "M0,0 C..." de brazo cometa, con las mismas 4 <use> para las 4 puntas)
// en vez de una forma aproximada nueva. El aro y la chispa animan en
// ciclos independientes (ver globals.css: .logo-spinner-ring gira con
// easing propio, .logo-spinner-spark pulsa aparte) y la chispa tiene un
// resplandor propio (filter) que el aro no tiene.
export default function LogoSpinner({ size = 96, className, colorAro = "#6C4CF1" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="prodigia-star-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A794FF" />
          <stop offset="50%" stopColor="#E4CBA0" />
          <stop offset="100%" stopColor="#FFC53D" />
        </linearGradient>
        <path id="prodigia-spark-arm" d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" />
        <filter id="prodigia-spark-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rotación continua propia (no depende del rotate(82) estático de
          Logo.tsx, que solo importa para alinear la apertura en el logo
          quieto) — gira para siempre, así que el ángulo de arranque no
          se nota. */}
      <circle
        className="logo-spinner-ring"
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={colorAro}
        strokeWidth="14"
        strokeDasharray="158.6 55"
        strokeDashoffset="27.5"
      />

      <g transform="translate(82 44) rotate(14)">
        <g className="logo-spinner-spark" filter="url(#prodigia-spark-glow)" fill="url(#prodigia-star-gradient)">
          <use href="#prodigia-spark-arm" />
          <use href="#prodigia-spark-arm" transform="rotate(180) scale(0.33)" />
          <use href="#prodigia-spark-arm" transform="rotate(84) scale(0.2)" />
          <use href="#prodigia-spark-arm" transform="rotate(268) scale(0.15)" />
        </g>
      </g>
    </svg>
  );
}
