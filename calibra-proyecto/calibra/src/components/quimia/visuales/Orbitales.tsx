"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import {
  ORDEN_MOELLER,
  configuracionElectronica,
  configuracionConSuperindices,
  configuracionTexto,
  esExcepcionAufbau,
  type LetraOrbital,
} from "@/lib/quimia/datos";
import { elementoPorZ } from "@/lib/quimia/tabla";
import type { VisualQuimiaOrbitales } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaOrbitales;
}

const COLUMNAS: LetraOrbital[] = ["s", "p", "d", "f"];
const CAPACIDAD: Record<LetraOrbital, number> = { s: 2, p: 6, d: 10, f: 14 };

// Visual "quimia.orbitales": el diagrama de llenado de las subcapas (regla de
// Aufbau / diagrama de Moeller) de un elemento. Cada paso ocupa la siguiente
// subcapa, con su número de orden y cuántos electrones lleva; los
// electrones son cuadraditos (llenos = electrones, vacíos = lugar libre).
// La configuración sale de configuracionElectronica (datos.ts, verificada
// para los 118 elementos).
export default function Orbitales({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.orbitales");
  const z = Number.isInteger(visual.z) ? visual.z : 0;
  const el = z >= 1 && z <= 118 ? elementoPorZ(z) : undefined;
  const config = el ? configuracionElectronica(z) : [];
  const { alVer, ...r } = useReproductor({ total: config.length, ms: 1800, estatico: visual.estatico, inicio: 1 });
  if (!el || config.length === 0) return null;

  const paso = Math.min(config.length, Math.max(1, r.paso));
  const acumulado = config.slice(0, paso).reduce((a, s) => a + s.electrones, 0);
  const actual = config[paso - 1];
  const ordenDe = (nombre: string) => ORDEN_MOELLER.findIndex((o) => `${o.n}${o.l}` === nombre) + 1;
  const nMax = Math.max(...config.map((s) => s.n));

  const texto = t("paso", { sub: actual.nombre, e: actual.electrones, cap: actual.capacidad, total: acumulado, nombre: el.nombre });
  const final = paso === config.length;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { nombre: el.nombre })}
      titulo={visual.titulo}
      alternativa={
        <p>
          {t("etiqueta", { nombre: el.nombre })}: {configuracionConSuperindices(configuracionTexto(z))}
          {esExcepcionAufbau(z) ? ` (${t("excepcion")})` : ""}
        </p>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="w-full overflow-x-auto">
        <div className="mx-auto grid w-full min-w-[280px] max-w-md grid-cols-[auto_repeat(4,1fr)] gap-1 text-xs">
          <span />
          {COLUMNAS.map((l) => (
            <span key={l} className="text-center font-bold text-texto-secundario">
              {l}
            </span>
          ))}
          {Array.from({ length: nMax }, (_, i) => i + 1).map((n) => (
            <div key={n} className="contents">
              <span className="self-center pr-1 text-right font-bold text-texto-secundario">{n}</span>
              {COLUMNAS.map((l) => {
                const existe = ORDEN_MOELLER.some((o) => o.n === n && o.l === l);
                if (!existe) return <span key={l} />;
                const nombre = `${n}${l}`;
                const idx = config.findIndex((s) => s.nombre === nombre);
                const usado = idx >= 0 && idx < paso;
                const esActual = idx === paso - 1;
                const sub = idx >= 0 ? config[idx] : null;
                return (
                  <motion.div
                    key={l}
                    initial={false}
                    animate={{ opacity: usado ? 1 : 0.22, scale: esActual && !r.reducir ? 1.04 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-1"
                    style={{
                      borderColor: esActual ? COLOR_QUIMIA : "var(--border)",
                      background: usado ? `color-mix(in oklab, ${COLOR_QUIMIA} ${esActual ? 18 : 8}%, var(--surface))` : "var(--surface)",
                    }}
                  >
                    <span className="flex items-center gap-1 font-bold text-foreground">
                      {nombre}
                      {usado && <span className="rounded bg-foreground/10 px-1 text-[9px] tabular-nums">{ordenDe(nombre)}º</span>}
                    </span>
                    <span className="flex flex-wrap justify-center gap-[2px]">
                      {Array.from({ length: CAPACIDAD[l] }, (_, k) => (
                        <span
                          key={k}
                          className="inline-block h-1.5 w-1.5 rounded-[2px]"
                          style={{ background: usado && sub && k < sub.electrones ? COLOR_QUIMIA : "var(--border)" }}
                        />
                      ))}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <TextoDelPaso>
        <MathText texto={texto} />
        {final && (
          <>
            {" "}
            <strong>{configuracionConSuperindices(configuracionTexto(z))}</strong>
            {esExcepcionAufbau(z) ? ` — ${t("excepcion")}` : ""}
          </>
        )}
      </TextoDelPaso>
    </MarcoVisual>
  );
}
