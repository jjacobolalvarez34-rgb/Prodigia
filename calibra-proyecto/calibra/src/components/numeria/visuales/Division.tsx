"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaDivision } from "@/lib/numeria/visuales";
import { divisionLarga } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { CasillaDigito, MarcoVisual, Resaltado, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaDivision;
}

// Clase 3 de Numeria: división larga ("casita"), paso a paso — bajar el
// dígito, ver cuántas veces entra el divisor, multiplicar, restar, y
// bajar el siguiente, hasta explicar el resto final.
export default function Division({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.division");
  const dividendo = Math.trunc(visual.dividendo);
  const divisor = Math.trunc(visual.divisor);
  const valido = Number.isFinite(dividendo) && Number.isFinite(divisor) && dividendo > 0 && divisor > 0;
  const datos = valido ? divisionLarga(dividendo, divisor) : null;
  const { alVer, ...r } = useReproductor({
    total: datos?.pasos.length ?? 0,
    ms: 2200,
    estatico: visual.estatico,
  });
  if (!datos) return null;
  const { pasos, cociente, resto } = datos;

  const alternativa = (
    <ol>
      {pasos.map((p, i) => (
        <li key={i}>{t("paso", { bajado: p.bajado, numero: p.numeroActual, divisor, digito: p.digitoCociente, producto: p.producto, resto: p.resto })}</li>
      ))}
      <li>{t("final", { cociente, resto })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { dividendo, divisor })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1 pl-9">
          {pasos.map((p, i) => (
            <span key={i} className="flex h-8 min-w-10 items-center justify-center font-mono text-lg font-bold" style={{ color: COLOR_NUMERIA }}>
              {i < r.paso ? p.digitoCociente : ""}
            </span>
          ))}
        </div>
        <div className="flex items-stretch gap-2">
          <div
            className="flex items-center justify-center rounded-md border-2 px-2 font-mono text-lg font-bold"
            style={{ borderColor: COLOR_NUMERIA, color: "var(--foreground)" }}
          >
            {divisor}
          </div>
          <div className="flex gap-1 border-l-2 border-t-2 pl-2 pt-1" style={{ borderColor: COLOR_NUMERIA }}>
            {String(dividendo)
              .split("")
              .map((d, i) => (
                <CasillaDigito key={i} valor={d} activo={i === r.paso - 1 && r.paso < pasos.length} />
              ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        {pasos.map((p, i) => {
          const revelado = i < r.paso;
          if (!revelado) return null;
          return (
            <motion.div
              key={i}
              animate={{ opacity: 1, y: 0 }}
              initial={r.reducir ? false : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-xl border px-3 py-2 text-sm ${
                i === r.paso - 1 ? "border-logro/50 bg-logro/10" : "border-border bg-background"
              }`}
            >
              <span className="text-foreground">
                {t("bajar", { d: p.bajado })} {p.arrastreEntra > 0 ? t("conArrastre", { arrastre: p.arrastreEntra, numero: p.numeroActual }) : ""}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-2 font-mono">
                <span>
                  {p.numeroActual} ÷ {divisor} = {p.digitoCociente}
                </span>
                <Resaltado>
                  {p.digitoCociente} × {divisor} = {p.producto}
                </Resaltado>
                <Resaltado>{t("resto", { n: p.resto })}</Resaltado>
              </div>
            </motion.div>
          );
        })}
      </div>

      {r.paso >= pasos.length && <p className="text-sm font-semibold text-foreground">{t("final", { cociente, resto })}</p>}
    </MarcoVisual>
  );
}
