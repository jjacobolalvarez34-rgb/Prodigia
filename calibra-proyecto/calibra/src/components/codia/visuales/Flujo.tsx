"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosFlujo, type FlujoBucle, type FlujoCondicional } from "@/lib/codia/visualesDatos";
import type { VisualCodiaFlujo } from "@/lib/codia/visuales";
import { COLOR_CODIA, Leyenda, MarcoVisual } from "./comun";

interface Props {
  visual: VisualCodiaFlujo;
}

type Tr = ReturnType<typeof useTranslations>;

function Variables({ variables, vacio }: { variables: [string, string][]; vacio: string }) {
  if (variables.length === 0) return <p className="text-texto-secundario">{vacio}</p>;
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[13px]">
      {variables.map(([nombre, valor]) => (
        <div key={nombre} className="flex min-w-0 items-baseline gap-1">
          <dt className="font-semibold" style={{ color: COLOR_CODIA }}>
            {nombre}
          </dt>
          <dd className="min-w-0 break-words">= {valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Chip({ verdadero, children }: { verdadero: boolean; children: string }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        verdadero ? "border-correcto/50 bg-correcto/15 text-correcto" : "border-error/40 bg-error/10 text-error"
      }`}
    >
      {children}
    </span>
  );
}

// ---------- cadena if / elif / else ----------

interface NodoRama {
  clave: string;
  condicion: string | null; // null = la rama sino
  resultado: boolean | null;
  accion: string | null;
  // La rama se recorrió en la ejecución (se evaluó, o es el sino tomado).
  recorrida: boolean;
}

function nodosDe(d: FlujoCondicional): NodoRama[] {
  const nodos: NodoRama[] = d.ramas.map((rama, i) => ({
    clave: `c${i}`,
    condicion: rama.condicion,
    resultado: rama.resultado,
    accion: rama.accion,
    recorrida: rama.resultado !== null,
  }));
  if (d.sino) nodos.push({ clave: "sino", condicion: null, resultado: d.sino.tomada ? true : null, accion: d.sino.accion, recorrida: d.sino.tomada });
  return nodos;
}

function FlujoSi({ datos, visual }: { datos: FlujoCondicional; visual: VisualCodiaFlujo }) {
  const t = useTranslations("Codia.visuales.flujo");
  const nodos = nodosDe(datos);
  const recorridos = nodos.filter((n) => n.recorrida);
  const total = recorridos.length;
  const { alVer, ...r } = useReproductor({ total, ms: 1500, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (total === 0) return null;
  const alFinal = r.paso >= total;

  const alternativa = (
    <ol>
      {nodos.map((nodo) => (
        <li key={nodo.clave}>{textoAlternativa(t, nodo)}</li>
      ))}
      <li>{datos.fallo ? t("errorAlt") : t("salidaAlt", { salida: datos.salida || t("sinSalida") })}</li>
    </ol>
  );

  // Posición de cada rama recorrida en el orden de la ejecución (-1 = nunca se evaluó).
  const posiciones = nodos.map((nodo) => (nodo.recorrida ? recorridos.indexOf(nodo) : -1));
  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CODIA} />}
    >
      <Leyenda>
        <p className="font-semibold text-texto-secundario">{t("valoresAntes")}</p>
        <div className="mt-1">
          <Variables variables={datos.variables} vacio={t("sinVariables")} />
        </div>
      </Leyenda>
      <div className="flex flex-col gap-2">
        {nodos.map((nodo, n) => {
          const indice = posiciones[n];
          const visible = nodo.recorrida ? indice < r.paso : alFinal;
          const activo = nodo.recorrida && indice === r.paso - 1;
          const evaluada = visible && nodo.recorrida;
          return (
            <motion.div
              key={nodo.clave}
              initial={false}
              animate={{ opacity: visible ? 1 : 0.4 }}
              transition={{ duration: r.reducir ? 0 : 0.3 }}
              className="flex flex-col gap-1.5"
            >
              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
                style={{
                  borderColor: activo ? COLOR_CODIA : undefined,
                  background: activo ? `color-mix(in oklab, ${COLOR_CODIA} 12%, var(--surface))` : undefined,
                }}
              >
                <p className="min-w-0 break-words font-mono text-[13px] font-semibold text-foreground">
                  {nodo.condicion === null ? t("sino") : t("pregunta", { condicion: nodo.condicion })}
                </p>
                {evaluada && nodo.condicion !== null && nodo.resultado !== null && (
                  <Chip verdadero={nodo.resultado}>{nodo.resultado ? t("verdadera") : t("falsa")}</Chip>
                )}
                {visible && !nodo.recorrida && <span className="text-[11px] text-texto-secundario">{t("noSeEvalua")}</span>}
              </div>
              {nodo.accion && (
                <div className="flex items-start gap-2 pl-3">
                  <span className="mt-1 shrink-0 text-xs font-semibold text-texto-secundario" aria-hidden="true">
                    {nodo.condicion === null ? "→" : `${t("si")} →`}
                  </span>
                  <p
                    className={`min-w-0 break-words rounded-lg border px-2.5 py-1 font-mono text-[12px] text-foreground ${
                      evaluada && nodo.resultado === true ? "border-correcto/50 bg-correcto/10" : "border-border bg-background"
                    }`}
                  >
                    {nodo.accion}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {alFinal && (
        <Leyenda acento={COLOR_CODIA}>
          <p className="font-semibold text-texto-secundario">{t("salida")}</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-[13px]">{datos.fallo ? t("errorAlt") : datos.salida || t("sinSalida")}</pre>
        </Leyenda>
      )}
    </MarcoVisual>
  );
}

function textoAlternativa(t: Tr, nodo: NodoRama): string {
  const accion = nodo.accion ?? "";
  if (nodo.condicion === null) return nodo.recorrida ? t("sinoTomadaAlt", { accion }) : t("sinoNoAlt", { accion });
  if (nodo.resultado === null) return t("noEvaluadaAlt", { condicion: nodo.condicion });
  return nodo.resultado ? t("verdaderaAlt", { condicion: nodo.condicion, accion }) : t("falsaAlt", { condicion: nodo.condicion });
}

// ---------- bucle while / for ----------

function FlujoBucleVista({ datos, visual }: { datos: FlujoBucle; visual: VisualCodiaFlujo }) {
  const t = useTranslations("Codia.visuales.flujo");
  const nVueltas = datos.vueltas.length;
  const hayFin = datos.alSalir !== null;
  const total = nVueltas + (hayFin ? 1 : 0);
  const { alVer, ...r } = useReproductor({ total, ms: 1500, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (total === 0) return null;

  const mientras = datos.forma === "mientras";
  const enSalida = hayFin && r.paso > nVueltas;
  const actual = enSalida ? datos.alSalir! : datos.vueltas[Math.max(0, r.paso - 1)];
  const alFinal = r.paso >= total;

  const alternativa = (
    <ol>
      <li>{t(mientras ? "mientrasAlt" : "paraAlt", { condicion: datos.condicion, cuerpo: datos.cuerpo.join("; ") })}</li>
      {datos.vueltas.map((vars, i) => (
        <li key={i}>{t("vueltaAlt", { n: i + 1, variables: vars.map(([k, val]) => `${k} = ${val}`).join(", ") || t("sinVariables") })}</li>
      ))}
      {hayFin && <li>{t("salirAlt", { variables: datos.alSalir!.map(([k, val]) => `${k} = ${val}`).join(", ") || t("sinVariables") })}</li>}
      <li>{datos.fallo ? t("errorAlt") : t("salidaAlt", { salida: datos.salida || t("sinSalida") })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiquetaBucle")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CODIA} />}
    >
      <div className="flex flex-col gap-2">
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: COLOR_CODIA, background: `color-mix(in oklab, ${COLOR_CODIA} 12%, var(--surface))` }}
        >
          <p className="min-w-0 break-words font-mono text-[13px] font-semibold text-foreground">
            {t(mientras ? "bucleMientras" : "buclePara")} {datos.condicion}
          </p>
          <Chip verdadero={!enSalida}>{enSalida ? t(mientras ? "falsa" : "sinMas") : t(mientras ? "verdadera" : "hayMas")}</Chip>
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: enSalida ? 0.4 : 1 }}
          transition={{ duration: r.reducir ? 0 : 0.3 }}
          className="flex items-start gap-2 pl-3"
        >
          <span className="mt-1 shrink-0 text-xs font-semibold text-texto-secundario" aria-hidden="true">
            {t("si")} →
          </span>
          <div className="min-w-0 flex-1 rounded-lg border border-correcto/50 bg-correcto/10 px-2.5 py-1 font-mono text-[12px] text-foreground">
            {datos.cuerpo.map((linea, i) => (
              <p key={i} className="break-words">
                {linea}
              </p>
            ))}
            <p className="mt-1 font-sans text-[11px] text-texto-secundario">↺ {t("vuelve")}</p>
          </div>
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: enSalida ? 1 : 0.4 }}
          transition={{ duration: r.reducir ? 0 : 0.3 }}
          className="flex items-start gap-2 pl-3"
        >
          <span className="mt-1 shrink-0 text-xs font-semibold text-texto-secundario" aria-hidden="true">
            {t("no")} ↓
          </span>
          <p className="min-w-0 rounded-lg border border-dashed border-border bg-background px-2.5 py-1 text-[12px] text-foreground">{t("salirDelBucle")}</p>
        </motion.div>
      </div>
      <Leyenda>
        <p className="font-semibold text-texto-secundario">
          {enSalida ? t("alSalir") : t("vuelta", { n: Math.min(r.paso, nVueltas), total: nVueltas })}
        </p>
        <div className="mt-1">
          <Variables variables={actual} vacio={t("sinVariables")} />
        </div>
      </Leyenda>
      {alFinal && (
        <Leyenda acento={COLOR_CODIA}>
          <p className="font-semibold text-texto-secundario">{t("salida")}</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-[13px]">{datos.fallo ? t("errorAlt") : datos.salida || t("sinSalida")}</pre>
        </Leyenda>
      )}
    </MarcoVisual>
  );
}

// Diagrama de flujo del primer condicional o bucle del programa. Todo sale
// de la ejecución real (datosFlujo): qué condición se evaluó, si dio
// verdadero o falso, qué rama corrió y con qué valores.
export default function Flujo({ visual }: Props) {
  const datos = useMemo(() => {
    try {
      return datosFlujo(visual.programa, visual.lenguaje);
    } catch {
      return null;
    }
  }, [visual.programa, visual.lenguaje]);
  if (!datos) return null;
  return datos.tipo === "si" ? <FlujoSi datos={datos} visual={visual} /> : <FlujoBucleVista datos={datos} visual={visual} />;
}
