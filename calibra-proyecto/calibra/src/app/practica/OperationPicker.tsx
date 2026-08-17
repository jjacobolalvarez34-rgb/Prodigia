import type { ReactElement } from "react";
import { ARITHMETIC_PROBLEM_TYPES, MODIFIER_NOMBRES, type ArithmeticProblemType, type ModifierSlug } from "@/types/database";
import Boton from "@/components/Boton";
import LevelDial from "./LevelDial";
import { IconSuma, IconResta, IconMultiplicacion, IconDivision, IconCheck } from "@/components/icons";

export type Seleccion = ArithmeticProblemType[];

const NOMBRES: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

const ICONOS: Record<ArithmeticProblemType, (props: { className?: string }) => ReactElement> = {
  suma: IconSuma,
  resta: IconResta,
  multiplicacion: IconMultiplicacion,
  division: IconDivision,
};

interface Props {
  nivelPorOperacion: Record<ArithmeticProblemType, number>;
  modificadoresPorOperacion: Record<ArithmeticProblemType, ModifierSlug[]>;
  seleccion: ArithmeticProblemType[];
  colorDial?: string;
  onToggle: (tipo: ArithmeticProblemType) => void;
  onIniciar: () => void;
}

// Rediseñado desde cero (Fase HH): filas anchas con relleno de color
// sólido cuando está elegida, no un borde tenue — la diferencia entre
// "elegida" y "no elegida" tiene que ser evidente de un vistazo, no
// leerse como una grilla de checkboxes de formulario.
export default function OperationPicker({
  nivelPorOperacion,
  modificadoresPorOperacion,
  seleccion,
  colorDial,
  onToggle,
  onIniciar,
}: Props) {
  const color = colorDial ?? "var(--primario)";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-20">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          ¿Qué practicamos?
        </h1>
        <p className="mt-2 text-texto-secundario">
          Elegí una o más operaciones. 10 problemas o 60 segundos, lo que llegue primero.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3">
        {ARITHMETIC_PROBLEM_TYPES.map((tipo) => {
          const Icono = ICONOS[tipo];
          const modificadores = modificadoresPorOperacion[tipo];
          const activo = seleccion.includes(tipo);
          return (
            <button
              key={tipo}
              onClick={() => onToggle(tipo)}
              aria-pressed={activo}
              className="flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                borderColor: activo ? color : "var(--border)",
                background: activo ? color : "var(--surface)",
              }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: activo ? "rgba(255,255,255,0.2)" : "color-mix(in oklab, var(--foreground) 6%, transparent)" }}
              >
                <Icono className={`h-5 w-5 ${activo ? "text-white" : "text-foreground/70"}`} />
              </span>

              <div className="min-w-0 flex-1">
                <p className={`font-display text-lg font-bold ${activo ? "text-white" : "text-foreground"}`}>
                  {NOMBRES[tipo]}
                </p>
                {modificadores.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {modificadores.map((slug) => (
                      <span
                        key={slug}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          activo ? "bg-white/20 text-white" : "bg-logro/15 text-texto-secundario"
                        }`}
                      >
                        + {MODIFIER_NOMBRES[slug]}
                      </span>
                    ))}
                  </span>
                )}
              </div>

              <LevelDial nivel={nivelPorOperacion[tipo]} size={44} mostrarEtiqueta={false} colorHex={activo ? "#FFFFFF" : colorDial} />

              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  activo ? "border-white bg-white" : "border-border"
                }`}
              >
                {activo && (
                  <span style={{ color }}>
                    <IconCheck className="h-4 w-4" />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <Boton
        onClick={onIniciar}
        disabled={seleccion.length === 0}
        colorHex={colorDial}
        destacado
        className="w-full max-w-md px-6 py-5 text-lg"
      >
        {seleccion.length === 0
          ? "Elegí al menos una operación"
          : `Iniciar partida${seleccion.length > 1 ? ` (${seleccion.length} operaciones)` : ""}`}
      </Boton>
    </div>
  );
}
