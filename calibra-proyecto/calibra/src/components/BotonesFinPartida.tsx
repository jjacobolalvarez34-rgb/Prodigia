import Link from "next/link";

interface Props {
  onOtraVez: () => void;
  volverHref: string;
  colorHex?: string;
}

// Fase UU: toda pantalla de resumen de partida termina con las mismas
// dos salidas — repetir con la misma configuración, o volver a la home
// del mundo — nunca solo una.
export default function BotonesFinPartida({ onOtraVez, volverHref, colorHex }: Props) {
  return (
    <div className="flex w-full max-w-md gap-3">
      <button
        onClick={onOtraVez}
        className="flex-1 rounded-2xl px-4 py-4 font-display font-semibold text-white shadow-[0_12px_30px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: colorHex
            ? `linear-gradient(120deg, ${colorHex}, #3FB88B)`
            : "linear-gradient(120deg, var(--primario), var(--logro))",
        }}
      >
        Otra partida
      </button>
      <Link
        href={volverHref}
        className="flex items-center justify-center rounded-2xl border-2 border-border px-6 py-4 font-display font-semibold text-foreground transition-colors hover:border-primario/40"
      >
        Volver
      </Link>
    </div>
  );
}
