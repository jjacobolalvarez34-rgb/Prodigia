import { useTranslations } from "next-intl";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import Boton from "@/components/Boton";

interface Props<T extends string> {
  titulo: string;
  subtitulo: string;
  tipos: readonly T[];
  nombres: Record<T, string>;
  nivelPorTipo: Record<T, number>;
  seleccion: T[];
  colorHex?: string;
  onToggle: (tipo: T) => void;
  onIniciar: () => void;
}

// Fase 2 ("Practicar" estandarizado): versión genérica de
// OperationPicker.tsx (Aritmética) — mismas filas anchas con relleno
// sólido al elegir, mismo patrón de selección múltiple (uno, varios, o
// todos los sub-temas). Reusada por Fracciones, Decimales, Potencias,
// Álgebra y Geometría en vez de reimplementar la misma UI 5 veces.
export default function SubtemaPicker<T extends string>({
  titulo,
  subtitulo,
  tipos,
  nombres,
  nivelPorTipo,
  seleccion,
  colorHex,
  onToggle,
  onIniciar,
}: Props<T>) {
  const t = useTranslations("Practica.subtemaPicker");
  const color = colorHex ?? "var(--primario)";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-20">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{titulo}</h1>
        <p className="mt-2 text-texto-secundario">{subtitulo}</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3">
        {tipos.map((tipo) => {
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
              <div className="min-w-0 flex-1">
                <p className={`font-display text-lg font-bold ${activo ? "text-white" : "text-foreground"}`}>{nombres[tipo]}</p>
              </div>

              <LevelDial nivel={nivelPorTipo[tipo]} size={44} mostrarEtiqueta={false} colorHex={activo ? "#FFFFFF" : colorHex} />

              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  activo ? "border-white bg-white" : "border-border"
                }`}
              >
                {activo && (
                  <span style={{ color }} className="text-xs font-bold">
                    ✓
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <Boton onClick={onIniciar} disabled={seleccion.length === 0} colorHex={colorHex} destacado className="w-full max-w-md px-6 py-5 text-lg">
        {seleccion.length === 0
          ? t("elegiAlMenosUno")
          : seleccion.length > 1
            ? t("iniciarPartidaConCantidad", { n: seleccion.length })
            : t("iniciarPartida")}
      </Boton>
    </div>
  );
}
