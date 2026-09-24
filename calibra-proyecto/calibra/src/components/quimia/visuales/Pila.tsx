"use client";

import { useLocale, useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { armarPila, ecuacionLatex, ladoLatex, voltios, type PilaGalvanica } from "@/lib/quimia/redox";
import type { VisualQuimiaPila } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaPila;
}

const PASOS = 6;
const COLOR_ELECTRON = "#F59E0B";
const COLOR_ANION = "#EF4444";
const COLOR_CATION = "#3B82F6";

function pilaSegura(a: unknown, c: unknown): PilaGalvanica | null {
  if (typeof a !== "string" || typeof c !== "string") return null;
  try {
    return armarPila(a, c);
  } catch {
    return null;
  }
}

const SUP: Record<string, string> = { "1": "", "2": "²", "3": "³" };
const ionTexto = (s: string, n: number) => `${s}${SUP[String(n)] ?? ""}⁺`;

// Visual "quimia.pila": una pila galvánica esquemática (dos semiceldas, cable,
// puente salino) con el sentido de los electrones, los iones del puente y
// el potencial. Los metales, las semirreacciones y E° salen de POTENCIALES y
// armarPila (src/lib/quimia/redox.ts); el ánodo es siempre el de menor
// potencial. El dibujo es un ESQUEMA, sin escala ni geometría real.
export default function Pila({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.pila");
  const locale = useLocale();
  const pila = pilaSegura(visual.anodo, visual.catodo);
  const { alVer, ...r } = useReproductor({ total: PASOS, ms: 3600, estatico: visual.estatico, inicio: 1 });
  if (!pila) return null;
  const paso = Math.min(PASOS, Math.max(1, r.paso));
  const animar = !r.reducir;
  const v = (cV: number) => (locale === "es" ? voltios(cV) : voltios(cV).replace(",", "."));
  const A = pila.anodo;
  const C = pila.catodo;

  const semiOx = `${ladoLatex(pila.oxidacion.reactivos)} \\rightarrow ${ladoLatex(pila.oxidacion.productos, pila.oxidacion.electrones)}`;
  const semiRe = `${ladoLatex(pila.reduccion.reactivos, pila.reduccion.electrones)} \\rightarrow ${ladoLatex(pila.reduccion.productos)}`;
  const global = ecuacionLatex(pila.global.reactivos, pila.global.productos);

  const textos = [
    t("p1"),
    t("p2", { metal: A.nombre, semi: `$${semiOx}$` }),
    t("p3", { metal: C.nombre, semi: `$${semiRe}$` }),
    t("p4"),
    t("p5"),
    t("p6", { global: `$${global}$`, c: v(C.cV), a: v(A.cV), e: v(pila.cV) }),
  ];

  const anchoAnodo = paso >= 2 ? 12 : 20;
  const anchoCatodo = paso >= 3 ? 28 : 20;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { anodo: A.simbolo, catodo: C.simbolo })}
      titulo={visual.titulo}
      alternativa={
        <div>
          <p>{t("nota")}</p>
          <ol>
            {textos.map((x, i) => (
              <li key={i}>
                <MathText texto={x} />
              </li>
            ))}
          </ol>
        </div>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <svg viewBox="0 0 320 210" className="h-auto w-full max-w-[420px]" role="presentation" data-paso={paso}>
        {/* soluciones y vasos */}
        <rect x={30} y={112} width={100} height={70} rx={3} fill="#93C5FD" opacity={0.35} />
        <rect x={190} y={112} width={100} height={70} rx={3} fill="#93C5FD" opacity={0.35} />
        <path d="M30 92 V182 H130 V92" fill="none" stroke="var(--foreground)" strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M190 92 V182 H290 V92" fill="none" stroke="var(--foreground)" strokeWidth={2.5} strokeLinejoin="round" />
        {/* electrodos */}
        <rect x={80 - anchoAnodo / 2} y={62} width={anchoAnodo} height={102} rx={2} fill="#9CA3AF" style={{ transition: animar ? "x 0.8s, width 0.8s" : "none" }} />
        <rect x={240 - anchoCatodo / 2} y={62} width={anchoCatodo} height={102} rx={2} fill="#B45309" style={{ transition: animar ? "x 0.8s, width 0.8s" : "none" }} />
        {/* nombres */}
        <text x={80} y={144} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--background)" stroke="none">
          {A.simbolo}
        </text>
        <text x={240} y={144} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--background)">
          {C.simbolo}
        </text>
        <text x={50} y={172} fontSize={11} fontWeight={700} fill="var(--foreground)">
          {ionTexto(A.simbolo, A.carga)}
        </text>
        <text x={252} y={172} fontSize={11} fontWeight={700} fill="var(--foreground)">
          {ionTexto(C.simbolo, C.carga)}
        </text>
        <text x={80} y={200} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLOR_QUIMIA}>
          {t("anodo")} (−)
        </text>
        <text x={240} y={200} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLOR_QUIMIA}>
          {t("catodo")} (+)
        </text>
        {/* cable con voltímetro */}
        <path d="M80 62 V28 H130 M190 28 H240 V62" fill="none" stroke="var(--foreground)" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={160} cy={28} r={17} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        <text x={160} y={29} textAnchor="middle" dominantBaseline="central" fontSize={paso >= 6 ? 9 : 12} fontWeight={800} fill="var(--foreground)">
          {paso >= 6 ? `${v(pila.cV)} V` : "V"}
        </text>
        {/* electrones por el cable: del ánodo al cátodo */}
        {paso >= 4 &&
          (animar ? (
            [0, 0.8, 1.6].map((d) => (
              <motion.circle
                key={d}
                r={3.6}
                fill={COLOR_ELECTRON}
                stroke="var(--background)"
                strokeWidth={0.8}
                initial={{ cx: 80, cy: 62 }}
                animate={{ cx: [80, 80, 128, 192, 240, 240], cy: [62, 28, 28, 28, 28, 62] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear", delay: d }}
              />
            ))
          ) : (
            <g>
              <circle cx={96} cy={28} r={3.6} fill={COLOR_ELECTRON} />
              <circle cx={215} cy={28} r={3.6} fill={COLOR_ELECTRON} />
            </g>
          ))}
        {paso >= 4 && (
          <g fontSize={11} fontWeight={800} fill="var(--foreground)">
            <text x={104} y={20}>
              e⁻
            </text>
            <text x={206} y={20}>
              e⁻
            </text>
            <path d="M104 44 L124 44" stroke="var(--foreground)" strokeWidth={1.6} markerEnd="url(#quimia-pila-flecha)" />
          </g>
        )}
        <defs>
          <marker id="quimia-pila-flecha" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--foreground)" />
          </marker>
        </defs>
        {/* puente salino */}
        <path d="M112 122 V96 Q112 84 124 84 H196 Q208 84 208 96 V122" fill="none" stroke="#9CA3AF" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
        <text x={160} y={68} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--foreground)">
          {t("puente")}
        </text>
        {paso >= 5 && (
          <g fontSize={13} fontWeight={800}>
            {animar ? (
              <>
                <motion.text y={88} fill={COLOR_ANION} initial={{ x: 200 }} animate={{ x: [200, 118] }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}>
                  −
                </motion.text>
                <motion.text y={88} fill={COLOR_CATION} initial={{ x: 118 }} animate={{ x: [118, 200] }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 0.4 }}>
                  +
                </motion.text>
              </>
            ) : (
              <>
                <text x={130} y={88} fill={COLOR_ANION}>
                  −
                </text>
                <text x={186} y={88} fill={COLOR_CATION}>
                  +
                </text>
              </>
            )}
          </g>
        )}
      </svg>
      <p className="text-center text-[11px] text-texto-secundario">{t("nota")}</p>
      <TextoDelPaso>
        <MathText texto={textos[paso - 1]} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
