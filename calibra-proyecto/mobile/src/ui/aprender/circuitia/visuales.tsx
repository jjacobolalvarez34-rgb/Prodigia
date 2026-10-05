import { useEffect, useMemo, useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, G, Line, Polygon, Polyline, Text as SvgText, TSpan } from "react-native-svg";
import { disenarEquivalente, disenarEsquema, textoResistor, textoValores, type Esquema, type ResistorEsquema } from "@/lib/circuitia/esquema";
import type { VisualCircuitiaCircuito, VisualCircuitiaLeyOhm, VisualCircuitiaResistenciaEquivalente } from "@/lib/circuitia/visuales";
import { datosLeyOhm, datosResistenciaEquivalente, resolverParaVisual, type MagnitudOhm } from "@/lib/circuitia/visualesDatos";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { textosDe } from "~/lib/textosWeb";
import { color } from "~/tema";
import Texto from "../../Texto";
import { BORDE, FG, Formula, GAparece, Leyenda, Marco, SECUNDARIO, T } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Circuitia (components/circuitia/visuales de la web):
// el mismo esquema (lib/circuitia/esquema) y los mismos valores resueltos.
const COLOR_CIRCUITIA = "#F59E0B";
const t = textosDe("Circuitia.visuales");
const CABLE = "rgba(244,246,251,0.7)";
const CICLO_PATRON = 12;
const PolylineAnimada = Animated.createAnimatedComponent(Polyline);

function seguro<X>(f: () => X): X | null {
  try {
    return f();
  } catch {
    return null;
  }
}

// Un pulso de corriente: puntitos que avanzan por el camino (stroke-dashoffset).
function Pulso({ puntos, duracionMs }: { puntos: string; duracionMs: number }) {
  const off = useSharedValue(0);
  useEffect(() => {
    off.set(withRepeat(withTiming(-CICLO_PATRON, { duration: duracionMs, easing: Easing.linear }), -1));
    return () => cancelAnimation(off);
  }, [off, duracionMs]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: off.value }));
  return (
    <PolylineAnimada
      animatedProps={props}
      points={puntos}
      fill="none"
      stroke={COLOR_CIRCUITIA}
      strokeWidth={3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`0.1 ${CICLO_PATRON - 0.1}`}
    />
  );
}

type Mostrar = "ninguna" | "voltaje" | "corriente" | "ambas";

function EsquemaCircuito({ esquema, vFuente, resaltarId, mostrar, valores, animar, ancho }: { esquema: Esquema; vFuente: number; resaltarId?: string; mostrar: Mostrar; valores: Map<string, { voltaje: number; corriente: number }>; animar: boolean; ancho: number }) {
  const { bateria } = esquema;
  return (
    <Svg width={ancho} height={(ancho * esquema.alto) / esquema.ancho} viewBox={`0 0 ${esquema.ancho} ${esquema.alto}`} style={{ alignSelf: "center" }}>
      {esquema.cables.map((c, i) => (
        <Line key={`c${i}`} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={CABLE} strokeWidth={2} strokeLinecap="round" />
      ))}
      <Line x1={bateria.xNegativa} y1={bateria.y - 8} x2={bateria.xNegativa} y2={bateria.y + 8} stroke={COLOR_CIRCUITIA} strokeWidth={4.5} strokeLinecap="round" />
      <Line x1={bateria.xPositiva} y1={bateria.y - 15} x2={bateria.xPositiva} y2={bateria.y + 15} stroke={COLOR_CIRCUITIA} strokeWidth={2} strokeLinecap="round" />
      <SvgText x={bateria.xNegativa - 9} y={bateria.y - 12} textAnchor="middle" fontSize={12} fontWeight="700" fill={CABLE}>
        −
      </SvgText>
      <SvgText x={bateria.xPositiva + 9} y={bateria.y - 12} textAnchor="middle" fontSize={12} fontWeight="700" fill={CABLE}>
        +
      </SvgText>
      <SvgText x={bateria.xTexto} y={bateria.yTexto} textAnchor="middle" fontSize={12} fontWeight="700" fill={COLOR_CIRCUITIA}>
        {`${vFuente} V`}
      </SvgText>
      {esquema.resistores.map((r) => {
        const resaltado = r.id === resaltarId;
        const textoV = textoValores(valores.get(r.id), mostrar);
        return (
          <G key={r.id}>
            <Polyline points={r.puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={resaltado ? COLOR_CIRCUITIA : "rgba(244,246,251,0.8)"} strokeWidth={resaltado ? 3.2 : 2} strokeLinejoin="round" strokeLinecap="round" />
            <SvgText x={r.xCentro} y={r.yEtiqueta} textAnchor="middle" fontSize={12} fontWeight={resaltado ? "900" : "600"} fill={FG}>
              {textoResistor(r)}
            </SvgText>
            {textoV !== "" && (
              <SvgText x={r.xCentro} y={r.yValor} textAnchor="middle" fontSize={11.5} fontWeight="700" fill={COLOR_CIRCUITIA}>
                {textoV}
              </SvgText>
            )}
          </G>
        );
      })}
      {esquema.uniones.map((u, i) => (
        <Circle key={`u${i}`} cx={u.x} cy={u.y} r={3} fill="rgba(244,246,251,0.8)" />
      ))}
      {esquema.flechas.map((f, i) => (
        <Polygon key={`f${i}`} points="-4.5,-3.6 4.5,0 -4.5,3.6" transform={`translate(${f.x} ${f.y}) rotate(${f.grados})`} fill={CABLE} />
      ))}
      {animar && esquema.pulsos.map((p, i) => <Pulso key={`p${i}`} puntos={p.puntos.map((q) => `${q.x},${q.y}`).join(" ")} duracionMs={p.duracionMs} />)}
    </Svg>
  );
}

export function Circuito({ visual }: { visual: VisualCircuitiaCircuito }) {
  const { width } = useWindowDimensions();
  const visible = useAnimacionActiva();
  const calculado = useMemo(() => seguro(() => ({ esquema: disenarEsquema(visual.topologia, visual.vFuente), resueltos: resolverParaVisual(visual.topologia, visual.vFuente) })), [visual]);
  const mostrar = visual.mostrarValores ?? "ninguna";
  const totalPasos = mostrar === "ninguna" || !calculado ? 0 : calculado.resueltos.length;
  const r = useReproductor({ total: totalPasos, ms: 1200, estatico: visual.estatico, inicio: totalPasos > 0 ? 1 : 0 });
  const [corriente, setCorriente] = useState(true);
  if (!calculado) return null;
  const { esquema, resueltos } = calculado;
  const revelados = new Map(resueltos.slice(0, Math.max(r.paso, 0)).map((x) => [x.id, { voltaje: x.voltaje, corriente: x.corriente }]));
  const conPulsos = (visual.animarCorriente ?? true) && !visual.estatico;
  return (
    <Marco acento={COLOR_CIRCUITIA} titulo={visual.titulo} r={totalPasos > 0 ? r : undefined}>
      <EsquemaCircuito esquema={esquema} vFuente={visual.vFuente} resaltarId={visual.resaltarId} mostrar={mostrar} valores={revelados} animar={conPulsos && corriente && visible} ancho={Math.min(440, width - 64)} />
      <T tam={12} c={SECUNDARIO} centro>
        {t("circuito.leyenda")}
      </T>
      {conPulsos && (
        <Pressable onPress={() => setCorriente((a) => !a)} style={{ alignSelf: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: BORDE }}>
          <Texto v="cuerpo" tam={12}>
            {corriente ? t("circuito.pausarCorriente") : t("circuito.mostrarCorriente")}
          </Texto>
        </Pressable>
      )}
    </Marco>
  );
}

const UNIDAD: Record<MagnitudOhm, string> = { v: "V", i: "A", r: "Ω" };
const LETRA: Record<MagnitudOhm, string> = { v: "V", i: "I", r: "R" };

export function LeyOhm({ visual }: { visual: VisualCircuitiaLeyOhm }) {
  const { width } = useWindowDimensions();
  const datos = useMemo(() => seguro(() => datosLeyOhm(visual)), [visual]);
  const r = useReproductor({ total: 1, ms: 1600, estatico: visual.estatico, inicio: 0 });
  if (!datos) return null;
  const revelado = r.paso >= 1;
  const valorTexto = (m: MagnitudOhm) => (m === datos.incognita && !revelado ? "?" : `${datos[m]} ${UNIDAD[m]}`);
  const formula = datos.incognita === "v" ? "V = I \\cdot R" : datos.incognita === "i" ? "I = \\frac{V}{R}" : "R = \\frac{V}{I}";
  const colorDe = (m: MagnitudOhm) => (m === datos.incognita ? (revelado ? color.logro : color.error) : COLOR_CIRCUITIA);
  const letras: Record<MagnitudOhm, { x: number; y: number }> = { v: { x: 100, y: 52 }, i: { x: 62, y: 112 }, r: { x: 138, y: 112 } };
  const columnas: Record<MagnitudOhm, number> = { v: 100, i: 36, r: 164 };
  const ancho = Math.min(280, width - 64);
  return (
    <Marco acento={COLOR_CIRCUITIA} titulo={visual.titulo} r={r}>
      <Svg width={ancho} height={(ancho * 178) / 200} viewBox="0 0 200 178" style={{ alignSelf: "center" }}>
        <Polygon points="100,8 20,132 180,132" fill="none" stroke={COLOR_CIRCUITIA} strokeWidth={2.5} strokeLinejoin="round" />
        <Line x1={52} y1={82} x2={148} y2={82} stroke={COLOR_CIRCUITIA} strokeWidth={2.5} />
        <Line x1={100} y1={82} x2={100} y2={132} stroke={COLOR_CIRCUITIA} strokeWidth={2.5} />
        {(Object.keys(letras) as MagnitudOhm[]).map((m) => (
          <SvgText key={m} x={letras[m].x} y={letras[m].y} textAnchor="middle" fontSize={26} fontWeight="900" fill={colorDe(m)}>
            {LETRA[m]}
          </SvgText>
        ))}
        {(["i", "v", "r"] as MagnitudOhm[]).map((m) => (
          <SvgText key={`v${m}`} x={columnas[m]} y={162} textAnchor="middle" fontSize={12.5} fontWeight="700" fill={colorDe(m)}>
            {`${LETRA[m]} = ${valorTexto(m)}`}
          </SvgText>
        ))}
      </Svg>
      <Formula tex={formula} />
      <Leyenda acento={COLOR_CIRCUITIA}>
        <T>{t(`leyOhm.${revelado ? "resultado" : "pregunta"}`, { letra: LETRA[datos.incognita] })}</T>
      </Leyenda>
    </Marco>
  );
}

function Zigzag({ r, resaltado }: { r: ResistorEsquema; resaltado?: boolean }) {
  return <Polyline points={r.puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={resaltado ? COLOR_CIRCUITIA : "rgba(244,246,251,0.8)"} strokeWidth={resaltado ? 3.2 : 2} strokeLinejoin="round" strokeLinecap="round" />;
}

export function ResistenciaEquivalente({ visual }: { visual: VisualCircuitiaResistenciaEquivalente }) {
  const { width } = useWindowDimensions();
  const calculado = useMemo(
    () =>
      seguro(() => {
        const datos = datosResistenciaEquivalente(visual.modo, visual.ohmios);
        return { datos, dibujo: disenarEquivalente(visual.modo, visual.ohmios, datos.total) };
      }),
    [visual]
  );
  const totalPasos = (calculado?.datos.ohmios.length ?? 0) + (calculado?.datos.formulas.length ?? 0);
  const r = useReproductor({ total: totalPasos, ms: 1600, estatico: visual.estatico, inicio: totalPasos > 0 ? 1 : 0 });
  if (!calculado) return null;
  const { datos, dibujo } = calculado;
  const nResistores = Math.min(r.paso, datos.ohmios.length);
  const nFormulas = Math.max(0, Math.min(datos.formulas.length, r.paso - datos.ohmios.length));
  const fundido = r.alFinal;
  const ancho = Math.min(440, width - 64);
  return (
    <Marco acento={COLOR_CIRCUITIA} titulo={visual.titulo} r={r}>
      <Svg width={ancho} height={(ancho * dibujo.alto) / dibujo.ancho} viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`} style={{ alignSelf: "center" }}>
        {fundido ? (
          <GAparece key="eq" visible ms={350}>
            {dibujo.cablesEquivalente.map((c, i) => (
              <Line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={CABLE} strokeWidth={2} strokeLinecap="round" />
            ))}
            <Zigzag r={dibujo.equivalente} resaltado />
            <SvgText x={dibujo.equivalente.xCentro} y={dibujo.equivalente.yEtiqueta} textAnchor="middle" fontSize={12} fontWeight="900" fill={COLOR_CIRCUITIA}>
              R
              <TSpan dy={3} fontSize={8.5}>
                eq
              </TSpan>
              <TSpan dy={-3}>{` = ${dibujo.equivalente.ohmios} Ω`}</TSpan>
            </SvgText>
          </GAparece>
        ) : (
          <G>
            {dibujo.cables
              .filter((c) => c.desde <= nResistores)
              .map((c, i) => (
                <Line key={`c${i}`} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={CABLE} strokeWidth={2} strokeLinecap="round" />
              ))}
            {nResistores >= 2 && dibujo.uniones.map((u, i) => <Circle key={`u${i}`} cx={u.x} cy={u.y} r={3} fill="rgba(244,246,251,0.8)" />)}
            {dibujo.resistores.slice(0, nResistores).map((res) => (
              <GAparece key={res.id} visible ms={350}>
                <Zigzag r={res} />
                <SvgText x={res.xCentro} y={res.yEtiqueta} textAnchor="middle" fontSize={11.5} fontWeight="600" fill={FG}>
                  {`${res.id} = ${res.ohmios} Ω`}
                </SvgText>
              </GAparece>
            ))}
          </G>
        )}
      </Svg>
      {nFormulas > 0 && !fundido && datos.formulas.slice(0, nFormulas).map((f, i) => <Formula key={i} tex={f} />)}
      {fundido && <Formula tex={datos.formulas[datos.formulas.length - 1]} />}
      <Leyenda acento={COLOR_CIRCUITIA}>
        <T>
          {fundido
            ? t(`resistenciaEquivalente.resultado.${visual.modo}`, { total: datos.total })
            : nFormulas > 0
              ? t(`resistenciaEquivalente.formula.${visual.modo}`)
              : t("resistenciaEquivalente.resistores", { n: nResistores })}
        </T>
      </Leyenda>
    </Marco>
  );
}

