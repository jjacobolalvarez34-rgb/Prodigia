import Boton from "@/components/Boton";
import PantallaVS from "@/components/duelos/PantallaVS";
import type { EstadoArranque } from "@/lib/duelos/useArranqueSincronizado";

interface Props {
  estado: EstadoArranque;
  segundos: number | null;
  rivalPresente: boolean;
  miElo: number;
  rivalNombre: string;
  rivalElo: number;
  rivalEsBot?: boolean;
  modo?: "simple" | "mejor_de_3";
  subtitulo?: string;
  onEmpezarAhora: () => void;
}

// Extraído de SalaDuelo.tsx (Numeria) — misma pantalla de espera para
// los 4 mundos (Fase 2 de "Duelos: llevar el progreso en vivo..."), la
// lógica de sincronización vive en useArranqueSincronizado.
export default function SalaEsperaDuelo({
  estado,
  segundos,
  rivalPresente,
  miElo,
  rivalNombre,
  rivalElo,
  rivalEsBot = false,
  modo = "simple",
  subtitulo,
  onEmpezarAhora,
}: Props) {
  if (estado === "cuenta-regresiva") {
    return (
      <PantallaVS
        miNombre="Vos"
        miElo={miElo}
        rivalNombre={rivalNombre}
        rivalElo={rivalElo}
        rivalEsBot={rivalEsBot}
        modo={modo}
        subtitulo={subtitulo}
        segundos={segundos}
      />
    );
  }

  if (estado === "agotado") {
    return (
      <div className="flex flex-1 flex-col">
        <PantallaVS miNombre="Vos" miElo={miElo} rivalNombre={rivalNombre} rivalElo={rivalElo} rivalEsBot={rivalEsBot} modo={modo} subtitulo={subtitulo} segundos={null} />
        <div className="mx-auto -mt-10 flex w-full max-w-md flex-col items-center gap-4 px-4 pb-16 text-center">
          <p className="text-sm text-texto-secundario">
            {rivalNombre} todavía no se conectó a la sala — podés seguir esperando o arrancar tu parte
            ahora (se resuelve el duelo apenas juegue la suya, como antes).
          </p>
          <Boton onClick={onEmpezarAhora} className="w-full py-4">
            Jugar mi parte ahora
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PantallaVS miNombre="Vos" miElo={miElo} rivalNombre={rivalNombre} rivalElo={rivalElo} rivalEsBot={rivalEsBot} modo={modo} subtitulo={subtitulo} segundos={null} />
      <div className="mx-auto -mt-10 flex w-full max-w-md flex-col items-center gap-3 px-4 pb-16 text-center">
        <div className="flex items-center gap-2 text-sm text-texto-secundario">
          <span className={`h-2 w-2 rounded-full ${estado === "esperando" ? "bg-correcto" : "bg-foreground/20"}`} />
          <span>Vos, listo</span>
          <span className="mx-1">·</span>
          <span className={`h-2 w-2 rounded-full ${rivalPresente ? "bg-correcto" : "bg-foreground/20 animate-pulse"}`} />
          <span>{rivalPresente ? `${rivalNombre}, listo` : `Esperando a ${rivalNombre}…`}</span>
        </div>
        <p className="text-xs text-texto-secundario">Arranca solo apenas estén los dos — no hace falta que apretés nada.</p>
      </div>
    </div>
  );
}
