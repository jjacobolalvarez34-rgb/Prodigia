interface Props {
  size?: number;
  className?: string;
  // Fase II: el aro cambia al color del mundo activo (violeta por
  // defecto) — es la señal más fuerte de "estás en otro lugar".
  colorAro?: string;
}

// Anillo flat #6C4CF1 con una apertura de la que brota una chispa
// ASIMÉTRICA de 4 puntas en degradé violeta→dorado: un brazo largo tipo
// cometa, un brazo corto de contrapeso justo en la dirección opuesta, y
// dos protuberancias chicas perpendiculares — de tamaño y ángulo
// distintos entre sí a propósito, para que no haya ningún eje de
// simetría en el conjunto (ni rotacional ni de espejo). La apertura del
// anillo está centrada exactamente en el ángulo donde se apoya la
// chispa (translate(82 44) medido desde el centro del anillo, 50 50),
// para que se lea como si la chispa realmente escapara por ahí.
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

        {/* Brazo "cometa" compartido por las 4 puntas de la chispa (más
            los spinners de carga, que reusan este mismo id): un solo
            path con <use rotate/scale> en vez de 4 paths repetidos a
            mano, así el mismo trazo define el largo, el corto y las dos
            protuberancias. */}
        <path id="prodigia-spark-arm" d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" />
      </defs>

      {/* Extremos sin stroke-linecap (butt = default): un stroke de arco
          termina en un corte radial, que es justo el corte angulado que
          tiene el anillo de referencia, no una punta redondeada. La
          apertura (el 55 del dasharray) queda centrada en ~349° —el
          ángulo real de translate(82 44) visto desde (50,50)— gracias al
          rotate(82). */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={colorAro}
        strokeWidth="14"
        strokeDasharray="158.6 55"
        strokeDashoffset="27.5"
        transform="rotate(82 50 50)"
        style={{ transition: "stroke .3s ease" }}
      />

      {/* Chispa de 4 puntas: largo (norte, escala 1 = 36 de largo), corto
          de contrapeso (sur, escala 0.33 ≈ 12, un tercio del largo) y
          dos protuberancias perpendiculares de tamaño Y ángulo distintos
          entre sí (84°/escala 0.2 vs 268°/escala 0.15, no exactamente
          opuestos ni iguales) para que no quede ningún eje de simetría. */}
      <g transform="translate(82 44) rotate(14)" fill="url(#prodigia-star-gradient)">
        <use href="#prodigia-spark-arm" />
        <use href="#prodigia-spark-arm" transform="rotate(180) scale(0.33)" />
        <use href="#prodigia-spark-arm" transform="rotate(84) scale(0.2)" />
        <use href="#prodigia-spark-arm" transform="rotate(268) scale(0.15)" />
      </g>
    </svg>
  );
}
