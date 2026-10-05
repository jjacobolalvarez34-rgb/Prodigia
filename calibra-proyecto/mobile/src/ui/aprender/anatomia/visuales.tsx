import { Fragment } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { G, Path, Rect } from "react-native-svg";
import type { RegionCuerpo, VisualAnatomiaCuerpo, VisualAnatomiaEsqueleto, VisualAnatomiaFlujo, VisualAnatomiaGrupos } from "@/lib/anatomia/visuales";
import { NOMBRE_REGION, resolverEntradasCuerpo, resolverEtapas, resolverGrupos, resolverHuesos } from "@/lib/anatomia/visualesDatos";
import datos from "~/lib/datos/esqueleto.json";
import { textosDe } from "~/lib/textosWeb";
import Texto from "../../Texto";
import { Aparece, BORDE, FG, FONDO, Marco, mezcla, SECUNDARIO, SUPERFICIE, T } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Anatomía (components/anatomia/visuales de la web).
const COLOR_ANATOMIA = "#8B2942";
const fondoAcento = (pct: number) => mezcla(COLOR_ANATOMIA, pct);
const NEUTRO = mezcla(FG, 6);
const TRAZO_NEUTRO = mezcla(FG, 32);

function Nota({ texto }: { texto: string }) {
  return (
    <Texto v="nota" tam={11} centro>
      {texto}
    </Texto>
  );
}

// ---------- Cuerpo: regiones de la figura humana ----------
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

function Figura({ activas, etiqueta, ancho }: { activas: Set<RegionCuerpo>; etiqueta: string; ancho: number }) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
      <Texto v="micro" tam={11}>
        {etiqueta}
      </Texto>
      <Svg width={ancho} height={(ancho * 212) / 100} viewBox="0 0 100 212">
        {ORDEN_REGIONES.flatMap((region) =>
          FORMAS[region].map((f, i) => {
            const activa = activas.has(region);
            return (
              <Rect
                key={`${region}-${i}`}
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={f.r}
                fill={activa ? COLOR_ANATOMIA : NEUTRO}
                fillOpacity={activa ? 0.9 : 1}
                stroke={activa ? COLOR_ANATOMIA : TRAZO_NEUTRO}
                strokeWidth={activa ? 1.4 : 1}
              />
            );
          })
        )}
      </Svg>
    </View>
  );
}

export function Cuerpo({ visual }: { visual: VisualAnatomiaCuerpo }) {
  const t = textosDe("Anatomia.visuales.cuerpo");
  const { width } = useWindowDimensions();
  const entradas = resolverEntradasCuerpo(visual.entradas);
  const r = useReproductor({ total: entradas.length, ms: 1600, estatico: visual.estatico, inicio: entradas.length > 0 ? 1 : 0 });
  if (entradas.length === 0) return null;
  const actual = entradas[Math.max(0, r.paso - 1)];
  const anterior = new Set<RegionCuerpo>(actual.vista === "anterior" ? actual.regiones : []);
  const posterior = new Set<RegionCuerpo>(actual.vista === "posterior" ? actual.regiones : []);
  const ancho = Math.min(130, (width - 110) / 2);
  return (
    <Marco acento={COLOR_ANATOMIA} titulo={visual.titulo} r={r}>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
        <Figura activas={anterior} etiqueta={t("anterior")} ancho={ancho} />
        <Figura activas={posterior} etiqueta={t("posterior")} ancho={ancho} />
      </View>
      <View style={[styles.destacado, { borderColor: COLOR_ANATOMIA, backgroundColor: fondoAcento(12) }]}>
        <T tam={16} negrita c={COLOR_ANATOMIA} centro>
          {actual.nombre}
        </T>
        <T tam={13} centro>
          {t("region", { regiones: actual.regiones.map((x) => NOMBRE_REGION[x]).join(", ") }) + (actual.vista === "posterior" ? ` (${t("porDetras")})` : "")}
        </T>
        {actual.detalle ? (
          <T tam={13} c={SECUNDARIO} centro>
            {actual.detalle}
          </T>
        ) : null}
      </View>
      <View style={styles.chips}>
        {entradas.map((e, i) => {
          const visto = i < r.paso;
          const esActual = i === r.paso - 1;
          return (
            <View
              key={i}
              style={[styles.chip, { borderColor: visto ? COLOR_ANATOMIA : BORDE, backgroundColor: esActual ? COLOR_ANATOMIA : visto ? fondoAcento(12) : SUPERFICIE, opacity: visto ? 1 : 0.5 }]}
            >
              <Texto v="fuerte" tam={12} c={esActual ? "#fff" : FG}>
                {e.nombre}
              </Texto>
            </View>
          );
        })}
      </View>
      <Nota texto={t("nota")} />
    </Marco>
  );
}

// ---------- Esqueleto: huesos que se van pintando ----------
interface Trazo {
  d: string;
  h?: string;
}
const TRAZOS = (datos as { trazos: Trazo[] }).trazos;
const [, , VB_W, VB_H] = (datos as { viewBox: string }).viewBox.split(/\s+/).map(Number);

export function Esqueleto({ visual }: { visual: VisualAnatomiaEsqueleto }) {
  const t = textosDe("Anatomia.visuales.esqueleto");
  const { width } = useWindowDimensions();
  const huesos = resolverHuesos(visual.huesos);
  const r = useReproductor({ total: huesos.length, ms: 1700, estatico: visual.estatico, inicio: huesos.length > 0 ? 1 : 0 });
  if (huesos.length === 0) return null;
  const i = Math.max(0, r.paso - 1);
  const actual = huesos[i];
  const previos = new Set(huesos.slice(0, i).map((h) => h.clave));
  const ancho = Math.min(160, (width - 80) * 0.42);
  return (
    <Marco acento={COLOR_ANATOMIA} titulo={visual.titulo} r={r}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Svg width={ancho} height={(ancho * VB_H) / VB_W} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          <G>
            {TRAZOS.map((tr, k) => {
              const esActual = tr.h === actual.clave;
              const previo = tr.h ? previos.has(tr.h) : false;
              return (
                <Path
                  key={k}
                  d={tr.d}
                  fill={esActual ? COLOR_ANATOMIA : previo ? fondoAcento(38) : mezcla(FG, 9)}
                  stroke={esActual || previo ? COLOR_ANATOMIA : mezcla(FG, 28)}
                  strokeWidth={0.6}
                />
              );
            })}
          </G>
        </Svg>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={[styles.destacado, { borderColor: COLOR_ANATOMIA, backgroundColor: fondoAcento(12) }]}>
            <T tam={17} negrita c={COLOR_ANATOMIA} centro>
              {actual.nombre}
            </T>
          </View>
          {huesos.map((h, k) => {
            const visto = k < r.paso;
            const esActual = k === i;
            return (
              <View key={h.clave} style={[styles.fila, { borderColor: visto ? COLOR_ANATOMIA : BORDE, backgroundColor: esActual ? COLOR_ANATOMIA : visto ? fondoAcento(12) : SUPERFICIE, opacity: visto ? 1 : 0.45 }]}>
                <Texto v="fuerte" tam={13} c={esActual ? "#fff" : FG}>
                  {h.nombre}
                </Texto>
              </View>
            );
          })}
        </View>
      </View>
      <Nota texto={t("nota")} />
    </Marco>
  );
}

// ---------- Flujo: etapas con flechas ----------
function Flecha({ visible }: { visible: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" style={{ alignSelf: "center", opacity: visible ? 1 : 0.2 }}>
      <Path d="M8 2v11M3.5 9 8 13.5 12.5 9" stroke={COLOR_ANATOMIA} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function Flujo({ visual }: { visual: VisualAnatomiaFlujo }) {
  const t = textosDe("Anatomia.visuales.flujo");
  const etapas = resolverEtapas(visual.etapas);
  const r = useReproductor({ total: etapas.length, ms: 1300, estatico: visual.estatico, inicio: etapas.length > 0 ? 1 : 0 });
  if (etapas.length === 0) return null;
  return (
    <Marco acento={COLOR_ANATOMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 4 }}>
        {etapas.map((e, i) => {
          const visible = i < r.paso;
          const actual = i === r.paso - 1;
          return (
            <Fragment key={i}>
              <Aparece visible opacidad={visible ? 1 : 0.28} ms={350} estilo={[styles.etapa, { borderColor: visible ? COLOR_ANATOMIA : BORDE, backgroundColor: actual ? fondoAcento(14) : SUPERFICIE }]}>
                <View style={[styles.circulo, { backgroundColor: visible ? COLOR_ANATOMIA : BORDE }]}>
                  <Texto v="fuerte" tam={12} c="#fff">
                    {i + 1}
                  </Texto>
                </View>
                <View style={{ flex: 1 }}>
                  <T negrita tam={14}>
                    {e.titulo}
                  </T>
                  {e.detalle ? (
                    <T tam={13} c={SECUNDARIO}>
                      {e.detalle}
                    </T>
                  ) : null}
                </View>
              </Aparece>
              {i < etapas.length - 1 && <Flecha visible={i + 1 < r.paso} />}
            </Fragment>
          );
        })}
      </View>
      {visual.ciclo ? (
        <View style={{ opacity: r.alFinal ? 1 : 0.3 }}>
          <T tam={12} negrita c={COLOR_ANATOMIA} centro>
            {t("ciclo")}
          </T>
        </View>
      ) : null}
    </Marco>
  );
}

// ---------- Grupos ----------
export function Grupos({ visual }: { visual: VisualAnatomiaGrupos }) {
  const grupos = resolverGrupos(visual.grupos);
  const r = useReproductor({ total: grupos.length, ms: 1500, estatico: visual.estatico, inicio: grupos.length > 0 ? 1 : 0 });
  if (grupos.length === 0) return null;
  return (
    <Marco acento={COLOR_ANATOMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 10 }}>
        {grupos.map((g, gi) => {
          const visible = gi < r.paso;
          const actual = gi === r.paso - 1;
          return (
            <Aparece key={gi} visible opacidad={visible ? 1 : 0.28} ms={350} estilo={[styles.grupo, { borderColor: visible ? COLOR_ANATOMIA : BORDE, backgroundColor: actual ? fondoAcento(14) : SUPERFICIE }]}>
              <T negrita tam={14} c={visible ? COLOR_ANATOMIA : FG}>
                {g.nombre}
              </T>
              {g.conDetalle ? (
                <View style={{ gap: 4 }}>
                  {g.items.map((it, ii) => (
                    <View key={ii} style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}>
                      {it.marca ? (
                        <View style={[styles.marca, { backgroundColor: fondoAcento(16) }]}>
                          <Texto v="fuerte" tam={11} c={COLOR_ANATOMIA}>
                            {it.marca}
                          </Texto>
                        </View>
                      ) : null}
                      <Texto v="cuerpo" tam={13} style={{ flex: 1 }}>
                        <Texto v="fuerte" tam={13}>
                          {it.texto}
                        </Texto>
                        {it.detalle ? <Texto v="cuerpo" tam={13} c={SECUNDARIO}>{` — ${it.detalle}`}</Texto> : null}
                      </Texto>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.chips}>
                  {g.items.map((it, ii) => (
                    <View key={ii} style={[styles.chip, { backgroundColor: FONDO, borderColor: BORDE }]}>
                      <Texto v="cuerpo" tam={13}>
                        {it.marca ? (
                          <Texto v="fuerte" tam={11} c={COLOR_ANATOMIA}>
                            {it.marca}{" "}
                          </Texto>
                        ) : null}
                        {it.texto}
                      </Texto>
                    </View>
                  ))}
                </View>
              )}
            </Aparece>
          );
        })}
      </View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  destacado: { gap: 2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  fila: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  etapa: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 2 },
  circulo: { minWidth: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 1 },
  grupo: { gap: 6, padding: 10, borderRadius: 12, borderWidth: 2 },
  marca: { minWidth: 24, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 6, alignItems: "center" },
});
