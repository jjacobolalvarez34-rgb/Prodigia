interface Props {
  url: string | null;
  nombre: string | null;
  size?: number;
  className?: string;
}

// Fase P3: avatar con foto subida, o iniciales sobre fondo violeta si
// no hay una — nunca un ícono genérico gris, para que siga sintiéndose
// parte de la marca.
export default function Avatar({ url, nombre, size = 40, className = "" }: Props) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const inicial = (nombre ?? "").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-primario/15 font-display font-bold text-primario ${className}`}
    >
      {inicial}
    </div>
  );
}
