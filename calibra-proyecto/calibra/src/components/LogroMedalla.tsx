interface Props {
  nombre: string;
  descripcion: string;
  desbloqueado: boolean;
}

// Tratamiento de medalla real (Fase HH), no un rectángulo genérico igual
// al resto de las tarjetas: forma de escudo hexagonal vía clip-path,
// relleno dorado en degradé cuando está desbloqueado, solo contorno
// gris cuando no.
export default function LogroMedalla({ nombre, descripcion, desbloqueado }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className="flex h-20 w-[74px] items-center justify-center text-2xl"
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          background: desbloqueado ? "linear-gradient(160deg, #FFE39A, var(--logro) 60%, #C98F1A)" : "var(--surface-2)",
          border: desbloqueado ? "none" : "2px dashed var(--border)",
        }}
      >
        {desbloqueado ? "🏅" : "🔒"}
      </div>
      <p className={`text-xs font-semibold ${desbloqueado ? "text-foreground" : "text-texto-secundario"}`}>{nombre}</p>
      <p className="text-[10px] leading-snug text-texto-secundario">{descripcion}</p>
    </div>
  );
}
