"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { ELEMENTOS } from "@/lib/practica/quimia";
import {
  ORDEN_FAMILIAS,
  familiaDe,
  posicionEnTabla,
  simbolosDeSelector,
  type FamiliaQuimica,
  type SelectorTabla,
} from "@/lib/quimia/tabla";
import type { FlechaTabla, PasoTablaPeriodica, VisualQuimiaTabla } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaTabla;
}

// Colores por familia (tonos de CSS fijos que se ven bien sobre fondo claro
// y oscuro porque se usan siempre con transparencia).
export const COLOR_FAMILIA: Record<FamiliaQuimica, string> = {
  alcalino: "#EF4444",
  alcalinoterreo: "#F97316",
  transicion: "#EAB308",
  otrosMetales: "#22C55E",
  metaloide: "#14B8A6",
  noMetal: "#3B82F6",
  halogeno: "#8B5CF6",
  gasNoble: "#EC4899",
  lantanido: "#06B6D4",
  actinido: "#64748B",
};

const CELDA = 22;
const IZQ = 16;
const SUP = 16;
const DER = 8;
const HUECO_F = 10;
const ANCHO = IZQ + 18 * CELDA + DER;
const ALTO = SUP + 7 * CELDA + HUECO_F + 2 * CELDA + 4;

function xDe(columna: number): number {
  return IZQ + (columna - 1) * CELDA;
}
function yDe(fila: number): number {
  if (fila <= 7) return SUP + (fila - 1) * CELDA;
  return SUP + 7 * CELDA + HUECO_F + (fila - 9) * CELDA;
}

function pasosValidos(pasos: unknown): PasoTablaPeriodica[] {
  if (!Array.isArray(pasos)) return [];
  return pasos.filter((p): p is PasoTablaPeriodica => typeof p === "object" && p !== null && typeof (p as PasoTablaPeriodica).etiqueta === "string");
}

function grupoDelSelector(sel: SelectorTabla | undefined): number | null {
  return sel?.por === "grupo" ? sel.n : null;
}
function periodoDelSelector(sel: SelectorTabla | undefined): number | null {
  return sel?.por === "periodo" ? sel.n : null;
}

function Flecha({ direccion }: { direccion: FlechaTabla }) {
  const cx = IZQ + 9 * CELDA;
  const cy = SUP + 3.5 * CELDA;
  const horizontal = direccion === "derecha" || direccion === "izquierda";
  const largo = horizontal ? 15 * CELDA : 6 * CELDA;
  const signo = direccion === "derecha" || direccion === "abajo" ? 1 : -1;
  const x1 = horizontal ? cx - (signo * largo) / 2 : cx;
  const y1 = horizontal ? cy : cy - (signo * largo) / 2;
  const x2 = horizontal ? cx + (signo * largo) / 2 : cx;
  const y2 = horizontal ? cy : cy + (signo * largo) / 2;
  return (
    <g aria-hidden="true">
      <defs>
        <marker id="quimia-punta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={COLOR_QUIMIA} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLOR_QUIMIA} strokeWidth={5} strokeOpacity={0.55} strokeLinecap="round" markerEnd="url(#quimia-punta)" />
    </g>
  );
}

// Visual "quimia.tabla": la tabla periódica completa (118 elementos, bloque f
// abajo) coloreada por familia, que va resaltando paso a paso un grupo, un
// período, un bloque, una familia o unos elementos, con su explicación. La
// posición y la familia salen de src/lib/quimia/tabla.ts (derivadas de
// ELEMENTOS): ningún casillero está escrito a mano.
export default function TablaPeriodica({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.tabla");
  const pasos = pasosValidos(visual.pasos);
  const { alVer, ...r } = useReproductor({ total: pasos.length, ms: 3200, estatico: visual.estatico, inicio: 1 });
  if (pasos.length === 0) return null;

  const paso = pasos[Math.min(pasos.length, Math.max(1, r.paso)) - 1];
  const seleccion = paso.seleccion;
  const activos = new Set(seleccion ? simbolosDeSelector(seleccion) : []);
  const hayAtenuacion = seleccion !== undefined;
  const grupoAct = grupoDelSelector(seleccion);
  const periodoAct = periodoDelSelector(seleccion);

  const alternativa = (
    <ol>
      {pasos.map((p, i) => (
        <li key={i}>
          <MathText texto={p.etiqueta} />
          {p.seleccion ? ` (${simbolosDeSelector(p.seleccion).join(", ")})` : ""}
        </li>
      ))}
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full max-w-[520px]" role="presentation">
        {Array.from({ length: 18 }, (_, i) => (
          <text
            key={`g${i}`}
            x={xDe(i + 1) + CELDA / 2}
            y={SUP - 5}
            textAnchor="middle"
            fontSize={7.5}
            fontWeight={grupoAct === i + 1 ? 800 : 500}
            fill={grupoAct === i + 1 ? COLOR_QUIMIA : "var(--texto-secundario)"}
          >
            {i + 1}
          </text>
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <text
            key={`p${i}`}
            x={IZQ - 5}
            y={yDe(i + 1) + CELDA / 2 + 2.5}
            textAnchor="middle"
            fontSize={7.5}
            fontWeight={periodoAct === i + 1 ? 800 : 500}
            fill={periodoAct === i + 1 ? COLOR_QUIMIA : "var(--texto-secundario)"}
          >
            {i + 1}
          </text>
        ))}
        {ELEMENTOS.map((e) => {
          const pos = posicionEnTabla(e);
          const fam = familiaDe(e);
          const on = activos.has(e.simbolo);
          const fillOpacity = !hayAtenuacion ? 0.4 : on ? 0.75 : 0.1;
          return (
            <g key={e.simbolo}>
              <rect
                x={xDe(pos.columna) + 0.75}
                y={yDe(pos.fila) + 0.75}
                width={CELDA - 1.5}
                height={CELDA - 1.5}
                rx={2.5}
                fill={COLOR_FAMILIA[fam]}
                fillOpacity={fillOpacity}
                stroke={on ? "var(--foreground)" : "none"}
                strokeWidth={on ? 1.4 : 0}
                style={{ transition: "fill-opacity .35s ease" }}
              />
              <text
                x={xDe(pos.columna) + CELDA / 2}
                y={yDe(pos.fila) + CELDA / 2 + 3}
                textAnchor="middle"
                fontSize={9}
                fontWeight={on ? 800 : 600}
                fill="var(--foreground)"
                fillOpacity={hayAtenuacion && !on ? 0.4 : 1}
              >
                {e.simbolo}
              </text>
            </g>
          );
        })}
        {/* Marcadores del bloque f dentro del grupo 3 de los períodos 6 y 7 */}
        {[
          { fila: 6, texto: "57–71", fam: "lantanido" as const },
          { fila: 7, texto: "89–103", fam: "actinido" as const },
        ].map((m) => (
          <g key={m.texto}>
            <rect
              x={xDe(3) + 0.75}
              y={yDe(m.fila) + 0.75}
              width={CELDA - 1.5}
              height={CELDA - 1.5}
              rx={2.5}
              fill={COLOR_FAMILIA[m.fam]}
              fillOpacity={hayAtenuacion ? 0.08 : 0.25}
            />
            <text x={xDe(3) + CELDA / 2} y={yDe(m.fila) + CELDA / 2 + 2} textAnchor="middle" fontSize={5.5} fill="var(--foreground)" fillOpacity={0.7}>
              {m.texto}
            </text>
          </g>
        ))}
        {paso.flecha && <Flecha direccion={paso.flecha} />}
      </svg>
      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1" aria-hidden="true">
        {ORDEN_FAMILIAS.map((f) => (
          <li key={f} className="flex items-center gap-1 text-[10px] text-texto-secundario">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COLOR_FAMILIA[f], opacity: 0.6 }} />
            {t(`familias.${f}`)}
          </li>
        ))}
      </ul>
      <TextoDelPaso>
        <MathText texto={paso.etiqueta} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
