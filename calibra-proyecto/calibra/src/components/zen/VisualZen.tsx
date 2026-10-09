"use client";

import { useTranslations } from "next-intl";
import CircuitoSVG from "@/components/circuitia/CircuitoSVG";
import GraficoEstadistico from "@/components/estadistica/GraficoEstadistico";
import FiguraRitmicaIcono from "@/components/melodia/FiguraRitmicaIcono";
import Pentagrama from "@/components/melodia/Pentagrama";
import DibujoWeb from "@/components/mundosNuevos/DibujoWeb";
import FilaCartas from "@/components/naipia/FilaCartas";
import MoleculaSVG from "@/components/quimia/MoleculaSVG";
import TrianguloSVG from "@/components/trigonometria/TrianguloSVG";
import { dibujoDinamia } from "@/lib/dinamia/diagramas";
import type { Visual } from "@/lib/mundosJugables";
import type { Carta } from "@/lib/practica/naipia";
import { COMPUESTOS_ORGANICOS } from "@/lib/practica/quimicaOrganica";
import { reproducirAcorde, reproducirNotaMusical, reproducirPulso } from "@/lib/sonido";
import { dibujoVitalia } from "@/lib/vitalia/diagramas";

// Dibuja lo que va arriba de una pregunta del Modo Zen (el mismo `Visual` que
// usa la app), con los componentes que ya tiene cada mundo en la web.
export default function VisualZen({ visual, color }: { visual: Visual; color: string }) {
  const t = useTranslations("Zen");
  switch (visual.tipo) {
    case "pentagrama":
      return <Pentagrama notas={visual.notas} disposicion={visual.disposicion} colorHex={color} className="mx-auto w-full max-w-sm" />;
    case "figura":
      return <FiguraRitmicaIcono figura={visual.figura} colorHex={color} className="mx-auto h-24 w-24" />;
    case "nota-audio":
      return (
        <button
          type="button"
          onClick={() => (visual.acorde?.length ? reproducirAcorde(visual.acorde) : reproducirNotaMusical(visual.frecuencia))}
          className="mx-auto rounded-full border-2 px-5 py-2 text-sm font-bold"
          style={{ borderColor: color, color }}
        >
          ▶ {t("escuchar")}
        </button>
      );
    case "pulso":
      return (
        <button type="button" onClick={() => reproducirPulso(visual.bpm, visual.pulsos, visual.acentoCada)} className="mx-auto rounded-full border-2 px-5 py-2 text-sm font-bold" style={{ borderColor: color, color }}>
          ▶ {t("escuchar")}
        </button>
      );
    case "molecula": {
      const compuesto = COMPUESTOS_ORGANICOS.find((c) => c.id === visual.id);
      return compuesto ? (
        <div className="mx-auto w-full max-w-xs">
          <MoleculaSVG compuesto={compuesto} />
        </div>
      ) : null;
    }
    case "triangulo":
      return (
        <div className="mx-auto w-full max-w-xs">
          <TrianguloSVG triangulo={visual.triangulo} colorHex={color} />
        </div>
      );
    case "circuito":
      return (
        <div className="mx-auto w-full max-w-sm">
          <CircuitoSVG topologia={visual.topologia as Parameters<typeof CircuitoSVG>[0]["topologia"]} vFuente={visual.vFuente} resaltarId={visual.resaltarId} colorHex={color} />
        </div>
      );
    case "grafico":
      return (
        <div className="mx-auto w-full max-w-sm">
          <GraficoEstadistico grafico={visual.grafico} colorHex={color} />
        </div>
      );
    case "codigo":
      return (
        <pre className="overflow-x-auto rounded-xl border border-border bg-surface-2 p-3 text-left font-mono text-sm leading-relaxed text-foreground" aria-label={visual.lenguaje}>
          <code>{visual.codigo}</code>
        </pre>
      );
    case "cartas":
      return <FilaCartas cartas={visual.cartas as Carta[]} />;
    case "dinamia":
      return <DibujoWeb dibujo={dibujoDinamia(visual.diagrama)} acento={color} className="mx-auto w-full max-w-sm" />;
    case "vitalia":
      return <DibujoWeb dibujo={dibujoVitalia(visual.diagrama)} acento={color} className="mx-auto w-full max-w-sm" />;
    case "tabla":
      return (
        <table className="mx-auto text-sm">
          <caption className="pb-1 text-xs font-semibold text-texto-secundario">{visual.titulo}</caption>
          <tbody>
            {visual.filas.map((f) => (
              <tr key={f.etiqueta}>
                <td className="pr-4 text-texto-secundario">{f.etiqueta}</td>
                <td className="font-mono font-bold text-foreground">{f.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    default:
      return null;
  }
}
