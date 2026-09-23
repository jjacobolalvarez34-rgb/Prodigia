"use client";

import { useTranslations } from "next-intl";
import type { RegionCuerpo, VisualAnatomiaCuerpo } from "@/lib/anatomia/visuales";
import { NOMBRE_REGION, resolverEntradasCuerpo, textoDeVisual } from "@/lib/anatomia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_ANATOMIA, fondoAcento } from "./comun";

interface Props {
  visual: VisualAnatomiaCuerpo;
}

// ESQUEMA de regiones (no un dibujo anatómico): cada región del cuerpo es una
// caja con forma de figura humana, en un lienzo de 100 x 212. No dibuja el
// músculo ni el órgano; solo dice en qué región del cuerpo está. Cada región
// puede tener varias formas (izquierda y derecha).
interface Forma {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

const FORMAS: Record<RegionCuerpo, Forma[]> = {
  cabeza: [{ x: 39, y: 1, w: 22, h: 26, r: 11 }],
  cuello: [{ x: 44, y: 28, w: 12, h: 7, r: 3 }],
  hombro: [
    { x: 22, y: 36, w: 14, h: 11, r: 5 },
    { x: 64, y: 36, w: 14, h: 11, r: 5 },
  ],
  torax: [{ x: 37, y: 36, w: 26, h: 29, r: 4 }],
  abdomen: [{ x: 37, y: 66, w: 26, h: 24, r: 4 }],
  pelvis: [{ x: 35, y: 91, w: 30, h: 19, r: 5 }],
  brazo: [
    { x: 20, y: 48, w: 11, h: 30, r: 5 },
    { x: 69, y: 48, w: 11, h: 30, r: 5 },
  ],
  antebrazo: [
    { x: 18, y: 79, w: 11, h: 30, r: 5 },
    { x: 71, y: 79, w: 11, h: 30, r: 5 },
  ],
  muslo: [
    { x: 35, y: 111, w: 14, h: 45, r: 5 },
    { x: 51, y: 111, w: 14, h: 45, r: 5 },
  ],
  pierna: [
    { x: 36, y: 157, w: 12, h: 50, r: 5 },
    { x: 52, y: 157, w: 12, h: 50, r: 5 },
  ],
};

const ORDEN_REGIONES = Object.keys(FORMAS) as RegionCuerpo[];

function Figura({ activas, etiqueta }: { activas: Set<RegionCuerpo>; etiqueta: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-texto-secundario">{etiqueta}</p>
      <svg viewBox="0 0 100 212" className="h-auto w-full max-w-[150px]" role="presentation">
        {ORDEN_REGIONES.flatMap((region) =>
          FORMAS[region].map((f, i) => {
            const activa = activas.has(region);
            return (
              <rect
                key={`${region}-${i}`}
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={f.r}
                fill={activa ? COLOR_ANATOMIA : "color-mix(in oklab, var(--foreground) 6%, var(--surface))"}
                fillOpacity={activa ? 0.9 : 1}
                stroke={activa ? COLOR_ANATOMIA : "color-mix(in oklab, var(--foreground) 32%, var(--surface))"}
                strokeWidth={activa ? 1.4 : 1}
                style={{ transition: "fill .35s ease, stroke .35s ease" }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

// Visual "anatomia.cuerpo": una entrada por paso; la región de la entrada se
// resalta en la figura de su vista (anterior o posterior) y debajo aparecen
// su nombre, su detalle y las regiones. Las entradas ya vistas quedan
// marcadas en la lista de abajo.
export default function Cuerpo({ visual }: Props) {
  const t = useTranslations("Anatomia.visuales.cuerpo");
  const entradas = resolverEntradasCuerpo(visual.entradas);
  const { alVer, ...r } = useReproductor({ total: entradas.length, ms: 1600, estatico: visual.estatico, inicio: entradas.length > 0 ? 1 : 0 });
  if (entradas.length === 0) return null;

  const actual = entradas[Math.max(0, r.paso - 1)];
  const activasAnterior = new Set<RegionCuerpo>(actual.vista === "anterior" ? actual.regiones : []);
  const activasPosterior = new Set<RegionCuerpo>(actual.vista === "posterior" ? actual.regiones : []);

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>)}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      nota={t("nota")}
      controles={<ControlesReproductor r={r} color={COLOR_ANATOMIA} />}
    >
      <div className="flex items-start justify-center gap-3">
        <Figura activas={activasAnterior} etiqueta={t("anterior")} />
        <Figura activas={activasPosterior} etiqueta={t("posterior")} />
      </div>
      <div className="rounded-xl border-2 px-3 py-2 text-center" style={{ borderColor: COLOR_ANATOMIA, background: fondoAcento(12) }}>
        <p className="text-base font-bold leading-snug" style={{ color: COLOR_ANATOMIA }}>
          {actual.nombre}
        </p>
        <p className="text-[13px] leading-snug text-foreground">
          {t("region", { regiones: actual.regiones.map((x) => NOMBRE_REGION[x]).join(", ") })}
          {actual.vista === "posterior" ? ` (${t("porDetras")})` : ""}
        </p>
        {actual.detalle && <p className="mt-0.5 text-[13px] leading-snug text-texto-secundario">{actual.detalle}</p>}
      </div>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {entradas.map((e, i) => {
          const visto = i < r.paso;
          const esActual = i === r.paso - 1;
          return (
            <li
              key={i}
              className="rounded-lg border px-2 py-1 text-xs font-semibold leading-snug"
              style={{
                borderColor: visto ? COLOR_ANATOMIA : "var(--border)",
                background: esActual ? COLOR_ANATOMIA : visto ? fondoAcento(12) : "var(--surface)",
                color: esActual ? "#fff" : visto ? "var(--foreground)" : "var(--texto-secundario, inherit)",
                opacity: visto ? 1 : 0.5,
              }}
            >
              {e.nombre}
            </li>
          );
        })}
      </ul>
    </MarcoVisual>
  );
}
