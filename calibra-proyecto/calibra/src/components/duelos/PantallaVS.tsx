import { rangoDeElo } from "@/types/database";

interface Props {
  miNombre: string;
  miElo: number;
  rivalNombre: string;
  rivalElo: number;
  rivalEsBot?: boolean;
  // "Sección Rankeds visual" (tanda nocturna): formato mejor-de-3 se
  // anuncia acá con el mismo tratamiento "FT3"/"MD3" de tetr.io — un
  // solo label arriba, el detalle de qué ronda va en `subtitulo`.
  modo?: "simple" | "mejor_de_3";
  subtitulo?: string; // ej. "Suma" o "Ronda 2/3 · Geografía"
  // null = todavía no hay cuenta regresiva (esperando al rival) — se
  // muestra "VS" solo. Un número = cuenta regresiva en curso.
  segundos: number | null;
}

// Pantalla de presentación antes de que arranque un duelo — mismo
// tratamiento visual en TODOS los mundos (Numeria vía SalaDuelo,
// Geografía/Enigmia/Quimia vía su propio PracticaClient). Puramente
// presentacional: quién maneja el reloj/la sincronización real es
// responsabilidad de quien la usa (SalaDuelo ya tiene Presence+Broadcast
// para Numeria; los demás mundos no necesitan esa sincronización real
// porque ya son asincrónicos por diseño, un countdown local alcanza).
export default function PantallaVS({ miNombre, miElo, rivalNombre, rivalElo, rivalEsBot = false, modo = "simple", subtitulo, segundos }: Props) {
  const miRango = rangoDeElo(miElo);
  const rivalRango = rangoDeElo(rivalElo);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Fondo dividido, cada mitad tintada con el color de rango de ese jugador */}
      <div className="pointer-events-none absolute inset-0 flex">
        <div className="flex-1" style={{ background: `linear-gradient(115deg, color-mix(in oklab, ${miRango.colorHex} 22%, var(--background)), var(--background) 85%)` }} />
        <div className="flex-1" style={{ background: `linear-gradient(295deg, color-mix(in oklab, ${rivalRango.colorHex} 22%, var(--background)), var(--background) 85%)` }} />
      </div>

      <div className="relative flex w-full max-w-lg flex-col items-center gap-6">
        {modo === "mejor_de_3" && (
          <span className="rounded-full bg-foreground/[0.08] px-4 py-1 font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Mejor de 3
          </span>
        )}
        {subtitulo && <p className="-mt-2 text-xs font-medium uppercase tracking-wide text-texto-secundario">{subtitulo}</p>}

        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
          <LadoJugador nombre={miNombre} elo={miElo} colorHex={miRango.colorHex} insigniaSlug={miRango.slug} align="right" />

          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-4xl font-black italic tracking-tight text-foreground sm:text-5xl">VS</span>
            {segundos !== null && (
              <span className="font-display text-3xl font-black tabular-nums text-primario">{segundos}</span>
            )}
          </div>

          <LadoJugador
            nombre={rivalEsBot ? rivalNombre : rivalNombre}
            elo={rivalElo}
            colorHex={rivalRango.colorHex}
            insigniaSlug={rivalRango.slug}
            align="left"
            esBot={rivalEsBot}
          />
        </div>
      </div>
    </div>
  );
}

function LadoJugador({
  nombre,
  elo,
  colorHex,
  insigniaSlug,
  align,
  esBot = false,
}: {
  nombre: string;
  elo: number;
  colorHex: string;
  insigniaSlug: string;
  align: "left" | "right";
  esBot?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col items-center gap-1.5 text-center ${align === "right" ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- mismo criterio que RankedsClient: tamaño intrínseco variable por rango */}
      <img src={`/rangos/${insigniaSlug}.png`} alt="" className="h-16 w-auto drop-shadow-lg sm:h-20" />
      <p className="max-w-[9rem] truncate font-display text-lg font-bold text-foreground sm:max-w-[11rem] sm:text-xl">{nombre}</p>
      <p className="font-mono text-sm font-semibold" style={{ color: colorHex }}>
        {elo} ELO
      </p>
      {esBot && (
        <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
          Clan de Bots
        </span>
      )}
    </div>
  );
}
