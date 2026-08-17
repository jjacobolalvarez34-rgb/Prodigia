interface Props {
  apuesta: { gano: boolean; monto: number } | null;
}

// Resultado de "doble o nada" (Fase G2) en el resumen de partida —
// solo aparece si había una apuesta activa.
export default function ApuestaResultado({ apuesta }: Props) {
  if (!apuesta) return null;
  return (
    <div
      className={`rounded-2xl px-5 py-3 text-center text-sm font-medium ${
        apuesta.gano ? "bg-logro/15 text-foreground" : "bg-surface-2 text-texto-secundario"
      }`}
    >
      {apuesta.gano
        ? `🎲 Doble o nada: ganaste — +${apuesta.monto * 2} Puntos`
        : `🎲 Doble o nada: esta vez no — perdiste los ${apuesta.monto} Puntos apostados`}
    </div>
  );
}
