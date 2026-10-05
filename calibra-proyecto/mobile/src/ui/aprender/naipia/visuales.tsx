import { useEffect, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, ZoomIn } from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";
import type { VisualNaipiaCancelacion, VisualNaipiaComparar, VisualNaipiaConteo, VisualNaipiaMazo, VisualNaipiaValores, VisualNaipiaVerdadero } from "@/lib/naipia/visuales";
import { acumulados, dividirConRegla, esReglaRedondeo, esSistemaConteo, filasMazo, mediosMazosRestantes, ordenarRangos, parsearCartas, planCancelacion, valoresDe } from "@/lib/naipia/visualesDatos";
import { gruposDeSistema, sumaMazoCompleto, type Carta as CartaNaipia, type Palo, type SistemaConteo, type ValorCarta } from "@/lib/practica/naipia";
import { textosDe } from "~/lib/textosWeb";
import { color, fuente } from "~/tema";
import Texto from "../../Texto";
import Carta from "../../visuales/Carta";
import { Aparece, BORDE, FG, FONDO, Marco, mezcla, SECUNDARIO } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Naipia (components/naipia/visuales de la web): los
// mismos cálculos (lib/naipia/visualesDatos) con las cartas que vuelan a la mesa.
const COLOR_NAIPIA = "#B91C1C";
const COLOR_NAIPIA_CLARO = "#F25C5C";
const t = textosDe("Naipia.visuales");
const tm = textosDe("Naipia.modos");

function signo(n: number) {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

function numero(n: number) {
  const texto = Math.abs(n).toLocaleString("es", { maximumFractionDigits: 2 });
  return n < 0 ? `−${texto}` : texto;
}

function estiloValor(valor: number): ViewStyle {
  if (valor === 0) return { backgroundColor: color.surface2, borderColor: BORDE };
  const base = valor > 0 ? color.correcto : color.error;
  return { backgroundColor: mezcla(base, Math.abs(valor) >= 2 ? 48 : 26), borderColor: base };
}

function ChipValor({ valor, grande = false }: { valor: number; grande?: boolean }) {
  return (
    <View style={[grande ? styles.chipGrande : styles.chip, { borderWidth: Math.abs(valor) >= 2 ? 2 : 1 }, estiloValor(valor)]}>
      <Texto style={{ fontFamily: fuente.mono, fontSize: grande ? 16 : 12, color: FG }}>{signo(valor)}</Texto>
    </View>
  );
}

const PALOS_ROTATIVOS: Palo[] = ["picas", "corazones", "treboles", "diamantes"];
function cartaDeRango(valor: ValorCarta, i: number): CartaNaipia {
  return { valor, palo: PALOS_ROTATIVOS[i % PALOS_ROTATIVOS.length] };
}

// El número grande del conteo: cae con resorte cada vez que cambia.
function Marcador({ etiqueta, valor, texto }: { etiqueta: string; valor: number; texto?: string }) {
  const c = valor > 0 ? color.correcto : valor < 0 ? color.error : SECUNDARIO;
  return (
    <View style={styles.marcador}>
      <Texto v="micro" tam={11}>
        {etiqueta}
      </Texto>
      <Animated.View key={`${valor}-${texto ?? ""}`} entering={ZoomIn.springify().damping(14)}>
        <Texto style={{ fontFamily: fuente.mono, fontSize: 30, color: c }}>{texto ?? signo(valor)}</Texto>
      </Animated.View>
    </View>
  );
}

// Una carta que vuela desde el mazo hasta su lugar (o vuelve) según `visible`.
function Vuela({ visible, demora = 0, desde = { x: 60, y: -70, r: 16 }, children, estilo }: { visible: boolean; demora?: number; desde?: { x: number; y: number; r: number }; children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  const v = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    v.set(visible ? withDelay(demora, withSpring(1, { damping: 20, stiffness: 240, mass: 0.8 })) : withTiming(0, { duration: 200 }));
  }, [visible, demora, v]);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, v.value * 1.4),
    transform: [{ translateX: (1 - v.value) * desde.x }, { translateY: (1 - v.value) * desde.y }, { rotate: `${(1 - v.value) * desde.r}deg` }, { scale: 0.55 + 0.45 * v.value }],
  }));
  return <Animated.View style={[estilo, a]}>{children}</Animated.View>;
}

// ---------- Valores del sistema ----------
export function Valores({ visual }: { visual: VisualNaipiaValores }) {
  const ok = esSistemaConteo(visual.sistema);
  const grupos = ok ? gruposDeSistema(visual.sistema).map((g) => ({ ...g, rangos: ordenarRangos(g.rangos) })) : [];
  const r = useReproductor({ total: grupos.length, ms: 1500, estatico: visual.estatico });
  if (!ok || grupos.length === 0) return null;
  return (
    <Marco acento={COLOR_NAIPIA} titulo={visual.titulo ?? t("valoresEtiqueta", { sistema: tm(visual.sistema) })} r={r}>
      <View style={{ gap: 10 }}>
        {grupos.map((g, gi) => {
          const visible = gi < r.paso;
          const atenuado = visual.enfatizar !== undefined && visual.enfatizar !== g.valor;
          return (
            <Aparece key={g.valor} visible={visible} opacidad={atenuado ? 0.35 : 1} ms={400} estilo={[styles.grupo, estiloValor(g.valor), { backgroundColor: FONDO }]}>
              <View style={styles.filaCartas}>
                {g.rangos.map((rango, ri) => (
                  <Vuela key={rango} visible={visible} demora={ri * 70} desde={{ x: 24, y: 0, r: 10 }}>
                    <Carta valor={cartaDeRango(rango, ri).valor} palo={cartaDeRango(rango, ri).palo} tam={30} />
                  </Vuela>
                ))}
              </View>
              <Vuela visible={visible} demora={300} desde={{ x: 0, y: 0, r: 0 }}>
                <ChipValor valor={g.valor} grande />
              </Vuela>
            </Aparece>
          );
        })}
      </View>
    </Marco>
  );
}

// ---------- Conteo corriente ----------
const ANCHO_CARTA = 34;

export function Conteo({ visual }: { visual: VisualNaipiaConteo }) {
  const ok = esSistemaConteo(visual.sistema);
  const cartas = ok ? parsearCartas(visual.cartas) : null;
  const tamBloque = Number.isInteger(visual.bloque) && (visual.bloque as number) >= 2 ? Math.min(6, visual.bloque as number) : 1;
  const bloques: number[][] = [];
  if (cartas) for (let i = 0; i < cartas.length; i += tamBloque) bloques.push(cartas.slice(i, i + tamBloque).map((_, k) => i + k));
  const ms = typeof visual.velocidad === "number" && visual.velocidad >= 300 && visual.velocidad <= 10000 ? visual.velocidad : 1300;
  const r = useReproductor({ total: bloques.length, ms, estatico: visual.estatico });
  if (!ok || !cartas) return null;
  const valores = valoresDe(visual.sistema, cartas);
  const acum = acumulados(valores);
  const mostradas = bloques.slice(0, r.paso).flat().length;
  const actual = mostradas > 0 ? acum[mostradas - 1] : 0;
  const segundos = numero(ms / 1000);
  return (
    <Marco acento={COLOR_NAIPIA} titulo={visual.titulo ?? t("conteoEtiqueta", { sistema: tm(visual.sistema), n: cartas.length })} r={r}>
      <Marcador etiqueta={t("conteoCorriente")} valor={actual} />
      <View style={[styles.filaCartas, { rowGap: 12, columnGap: 8 }]}>
        {bloques.map((idxs, bi) => {
          const visible = bi < r.paso;
          const suma = idxs.reduce((a, i) => a + valores[i], 0);
          return (
            <View key={bi} style={[{ alignItems: "center", gap: 6 }, tamBloque > 1 && styles.bloque]}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {idxs.map((i, k) => (
                  <View key={i} style={{ width: ANCHO_CARTA, alignItems: "center", gap: 4 }}>
                    <View style={styles.hueco}>
                      <Vuela visible={visible} demora={k * 120}>
                        <Carta valor={cartas[i].valor} palo={cartas[i].palo} tam={ANCHO_CARTA} />
                      </Vuela>
                    </View>
                    <Aparece visible={visible} ms={300}>
                      <ChipValor valor={valores[i]} />
                    </Aparece>
                    {tamBloque === 1 && (
                      <Aparece visible={visible} ms={300}>
                        <Texto style={{ fontFamily: fuente.monoMedio, fontSize: 11, color: SECUNDARIO }}>→ {signo(acum[i])}</Texto>
                      </Aparece>
                    )}
                  </View>
                ))}
              </View>
              {tamBloque > 1 && (
                <Aparece visible={visible} ms={300} estilo={[styles.chip, estiloValor(suma)]}>
                  <Texto style={{ fontFamily: fuente.mono, fontSize: 12, color: FG }}>{t("bloqueEtiqueta", { n: bi + 1, valor: signo(suma) })}</Texto>
                </Aparece>
              )}
            </View>
          );
        })}
      </View>
      <Texto v="nota" tam={12} centro>
        {tamBloque > 1 ? t("ritmoBloque", { n: tamBloque, s: segundos }) : t("ritmo", { s: segundos })}
      </Texto>
    </Marco>
  );
}

// ---------- Cancelación en pares ----------
function ParQueSeCancela({ a, b, va, vb }: { a: CartaNaipia; b: CartaNaipia; va: number; vb: number }) {
  const x = useSharedValue(0);
  useEffect(() => {
    x.set(withSequence(withTiming(0.85, { duration: 600 }), withTiming(1, { duration: 500 })));
  }, [x]);
  const izq = useAnimatedStyle(() => ({ opacity: 1 - Math.max(0, x.value - 0.85) * 3, transform: [{ translateX: -80 + x.value * 55 }, { scale: 1 - Math.max(0, x.value - 0.85) * 0.6 }] }));
  const der = useAnimatedStyle(() => ({ opacity: 1 - Math.max(0, x.value - 0.85) * 3, transform: [{ translateX: 80 - x.value * 55 }, { scale: 1 - Math.max(0, x.value - 0.85) * 0.6 }] }));
  return (
    <View style={{ width: 220, height: 96, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute" }, izq]}>
        <Carta valor={a.valor} palo={a.palo} tam={46} />
      </Animated.View>
      <Animated.View style={[{ position: "absolute" }, der]}>
        <Carta valor={b.valor} palo={b.palo} tam={46} />
      </Animated.View>
      <Animated.View entering={ZoomIn.delay(1000).springify().damping(16)} style={styles.sumaCero}>
        <ChipValor valor={va} />
        <ChipValor valor={vb} />
        <Texto style={{ fontFamily: fuente.mono, fontSize: 14, color: FG }}>= 0</Texto>
      </Animated.View>
    </View>
  );
}

export function Cancelacion({ visual }: { visual: VisualNaipiaCancelacion }) {
  const ok = esSistemaConteo(visual.sistema);
  const cartas = ok ? parsearCartas(visual.cartas) : null;
  const valores = cartas && ok ? valoresDe(visual.sistema, cartas) : [];
  const plan = planCancelacion(valores);
  const hayNeutras = plan.neutras.length > 0;
  const totalPasos = (hayNeutras ? 1 : 0) + plan.pares.length;
  const ms = typeof visual.velocidad === "number" && visual.velocidad >= 500 && visual.velocidad <= 10000 ? visual.velocidad : 2200;
  const r = useReproductor({ total: totalPasos, ms, estatico: visual.estatico });
  if (!ok || !cartas) return null;
  const total = valores.reduce((a, v) => a + v, 0);
  const pasoActual = r.paso - 1;
  const parDelPaso = (k: number): [number, number] | null => {
    const idx = hayNeutras ? k - 1 : k;
    return idx >= 0 ? (plan.pares[idx] ?? null) : null;
  };
  const resuelta = (i: number) => {
    if (hayNeutras && plan.neutras.includes(i)) return r.paso >= 1;
    const p = plan.pares.findIndex((par) => par.includes(i));
    return p >= 0 && r.paso >= p + 1 + (hayNeutras ? 1 : 0);
  };
  const parActual = pasoActual >= 0 ? parDelPaso(pasoActual) : null;
  const esNeutras = hayNeutras && pasoActual === 0;
  const fin = r.paso >= totalPasos;
  return (
    <Marco acento={COLOR_NAIPIA} titulo={visual.titulo ?? t("cancelacionEtiqueta", { sistema: tm(visual.sistema), n: cartas.length })} r={r}>
      <Marcador etiqueta={t("cancelacionConteo")} valor={total} />
      <View style={styles.escenario}>
        {parActual ? (
          <ParQueSeCancela key={pasoActual} a={cartas[parActual[0]]} b={cartas[parActual[1]]} va={valores[parActual[0]]} vb={valores[parActual[1]]} />
        ) : esNeutras ? (
          <Texto v="fuerte" tam={14} centro>
            {t("cancelacionNeutras")}
          </Texto>
        ) : (
          <Texto v="nota" centro>
            {fin && totalPasos === 0 ? t("cancelacionNadaQueCancelar") : t("cancelacionBuscar")}
          </Texto>
        )}
      </View>
      <View style={[styles.filaCartas, { columnGap: 6, rowGap: 8 }]}>
        {cartas.map((c, i) => {
          const apagada = resuelta(i);
          const enPar = parActual !== null && parActual.includes(i) && !fin;
          return (
            <View key={i} style={{ width: 30, alignItems: "center", gap: 4 }}>
              <Aparece visible opacidad={apagada ? 0.22 : 1} ms={400} estilo={enPar ? { borderRadius: 6, borderWidth: 2, borderColor: COLOR_NAIPIA_CLARO, transform: [{ scale: 1.08 }] } : undefined}>
                <Carta valor={c.valor} palo={c.palo} tam={30} />
              </Aparece>
              <Aparece visible opacidad={apagada ? 0.3 : 1} ms={400}>
                <ChipValor valor={valores[i]} />
              </Aparece>
            </View>
          );
        })}
      </View>
      <Texto v="fuerte" tam={14} centro>
        {fin ? (plan.sobran.length > 0 ? t("cancelacionSobran", { n: signo(total) }) : t("cancelacionNadaSobra", { n: signo(total) })) : t("cancelacionSigueIgual")}
      </Texto>
    </Marco>
  );
}

// ---------- Conteo verdadero ----------
function Mazo({ resto }: { resto: number }) {
  const alto = Math.max(0, Math.min(1, resto)) * 40;
  return (
    <Svg width={32} height={44} viewBox="0 0 32 44">
      <Rect x={1} y={1} width={30} height={42} rx={4} fill="none" stroke={BORDE} strokeWidth={1.5} strokeDasharray="3 3" />
      <Rect x={3} y={42 - alto} width={26} height={alto} rx={3} fill={COLOR_NAIPIA_CLARO} />
    </Svg>
  );
}

export function Verdadero({ visual }: { visual: VisualNaipiaVerdadero }) {
  const conteoOk = Number.isInteger(visual.conteo);
  const reglaOk = esReglaRedondeo(visual.regla);
  const conJugadas =
    Number.isInteger(visual.mazosTotales) && Number.isInteger(visual.cartasJugadas) && (visual.mazosTotales as number) >= 1 && (visual.cartasJugadas as number) >= 0 && (visual.cartasJugadas as number) < 52 * (visual.mazosTotales as number);
  const restantesDirecto = typeof visual.mazosRestantes === "number" && visual.mazosRestantes >= 0.5 && Number.isInteger(visual.mazosRestantes * 2);
  const datosOk = conteoOk && reglaOk && (conJugadas || restantesDirecto);
  const mazosTotales = conJugadas ? (visual.mazosTotales as number) : Math.ceil(visual.mazosRestantes ?? 1);
  const cartasJugadas = conJugadas ? (visual.cartasJugadas as number) : 0;
  const cartasRestantes = conJugadas ? 52 * mazosTotales - cartasJugadas : 0;
  const mazosRestantes = conJugadas ? mediosMazosRestantes(mazosTotales, cartasJugadas) / 2 : (visual.mazosRestantes ?? 1);
  const pasosTotales = conJugadas ? 4 : 3;
  const pDivision = conJugadas ? 3 : 2;
  const pRegla = pDivision + 1;
  const r = useReproductor({ total: pasosTotales, ms: 2600, estatico: visual.estatico });
  if (!datosOk || mazosRestantes <= 0 || mazosTotales > 12) return null;
  const crudo = visual.conteo / mazosRestantes;
  const resultado = dividirConRegla(visual.conteo, mazosRestantes, visual.regla);
  const restos = Array.from({ length: mazosTotales }, (_, i) => (conJugadas && r.paso < 2 ? 1 : Math.max(0, Math.min(1, mazosRestantes - (mazosTotales - 1 - i)))));
  const exacto = Math.abs(crudo * 100 - Math.round(crudo * 100)) < 1e-9;
  return (
    <Marco acento={COLOR_NAIPIA} titulo={visual.titulo ?? t("verdaderoEtiqueta")} r={r}>
      <View style={[styles.filaCartas, { gap: 6, alignItems: "flex-end" }]}>
        {restos.map((resto, i) => (
          <Aparece key={i} visible={r.paso >= 1} ms={400}>
            <Mazo resto={resto} />
          </Aparece>
        ))}
      </View>
      <View style={{ gap: 6 }}>
        <Aparece visible={r.paso >= 1}>
          <Texto v="cuerpo" tam={14} centro>
            {conJugadas ? t("verdaderoConjunto", { m: mazosTotales }) : t("verdaderoRestantes", { mazos: numero(mazosRestantes) })}
          </Texto>
        </Aparece>
        {conJugadas && (
          <Aparece visible={r.paso >= 2}>
            <Texto v="cuerpo" tam={14} centro>
              {t("verdaderoJugadas", { j: cartasJugadas, r: cartasRestantes, mazos: numero(cartasRestantes / 52), medio: numero(mazosRestantes) })}
            </Texto>
          </Aparece>
        )}
        <Aparece visible={r.paso >= pDivision}>
          <Texto style={{ fontFamily: fuente.mono, fontSize: 15, color: FG, textAlign: "center" }}>
            {signo(visual.conteo)} ÷ {numero(mazosRestantes)} {exacto ? "=" : "≈"} {numero(crudo)}
          </Texto>
        </Aparece>
        <Aparece visible={r.paso >= pRegla}>
          <Texto v="cuerpo" tam={14} centro>
            {t("verdaderoRegla", { regla: t(`regla.${visual.regla}`) })}
          </Texto>
        </Aparece>
      </View>
      <Marcador etiqueta={t("verdaderoConteo")} valor={r.paso >= pRegla ? resultado : 0} texto={r.paso >= pRegla ? signo(resultado) : "?"} />
    </Marco>
  );
}

// ---------- El mazo completo suma… ----------
function BarraAporte({ visible, porcentaje, c }: { visible: boolean; porcentaje: number; c: string }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(visible ? withDelay(200, withTiming(porcentaje, { duration: 800 })) : withTiming(0, { duration: 200 }));
  }, [visible, porcentaje, w]);
  const a = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={styles.barraFondo}>
      <Animated.View style={[{ height: "100%", borderRadius: 5, backgroundColor: c }, a]} />
    </View>
  );
}

export function MazoCompleto({ visual }: { visual: VisualNaipiaMazo }) {
  const ok = esSistemaConteo(visual.sistema);
  const { filas, total } = ok ? filasMazo(visual.sistema) : { filas: [], total: 0 };
  const r = useReproductor({ total: filas.length + 1, ms: 1500, estatico: visual.estatico });
  if (!ok || filas.length === 0 || total !== sumaMazoCompleto(visual.sistema)) return null;
  const mayor = Math.max(1, ...filas.map((f) => Math.abs(f.aporte)));
  const enTotal = r.paso >= filas.length + 1;
  const acumulado = filas.slice(0, Math.min(r.paso, filas.length)).reduce((a, f) => a + f.aporte, 0);
  return (
    <Marco acento={COLOR_NAIPIA} titulo={visual.titulo ?? t("mazoEtiqueta", { sistema: tm(visual.sistema) })} r={r}>
      <View style={{ gap: 8 }}>
        {filas.map((f, i) => {
          const visible = i < r.paso;
          const c = f.valor > 0 ? color.correcto : f.valor < 0 ? color.error : BORDE;
          return (
            <Aparece key={f.valor} visible={visible} ms={350} estilo={styles.filaMazo}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ChipValor valor={f.valor} />
                <Texto style={{ flex: 1, fontFamily: fuente.monoMedio, fontSize: 12, color: FG }}>{f.rangos.join(" ")}</Texto>
                <Texto v="nota" tam={12}>
                  {t("mazoCartas", { n: f.cartas })}
                </Texto>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <BarraAporte visible={visible} porcentaje={(Math.abs(f.aporte) / mayor) * 100} c={c} />
                <Texto style={{ width: 104, textAlign: "right", fontFamily: fuente.monoMedio, fontSize: 12, color: FG }}>
                  {f.cartas} × {signo(f.valor)} = {signo(f.aporte)}
                </Texto>
              </View>
            </Aparece>
          );
        })}
      </View>
      <Marcador etiqueta={enTotal ? t("mazoTotal") : t("mazoSumaHastaAhora")} valor={enTotal ? total : acumulado} />
      {enTotal ? (
        <Texto v="nota" tam={12} centro>
          {total === 0 ? t("mazoBalanceado", { n: signo(total) }) : t("mazoNoBalanceado", { n: signo(total) })}
        </Texto>
      ) : null}
    </Marco>
  );
}

// ---------- Comparar sistemas ----------
export function Comparar({ visual }: { visual: VisualNaipiaComparar }) {
  const sistemas: SistemaConteo[] = Array.isArray(visual.sistemas) ? visual.sistemas.filter(esSistemaConteo) : [];
  const ok = sistemas.length >= 2 && sistemas.length === visual.sistemas.length && new Set(sistemas).size === sistemas.length;
  const cartas = ok ? parsearCartas(visual.cartas) : null;
  const r = useReproductor({ total: cartas?.length ?? 0, ms: 1300, estatico: visual.estatico });
  if (!ok || !cartas) return null;
  const valores = sistemas.map((s) => valoresDe(s, cartas));
  const acum = valores.map((v) => acumulados(v));
  const hasta = r.paso;
  return (
    <Marco acento={COLOR_NAIPIA} titulo={visual.titulo ?? t("compararEtiqueta", { n: cartas.length })} r={r}>
      <View style={{ gap: 6 }}>
        <View style={styles.filaTabla}>
          <View style={{ width: 38 }} />
          {sistemas.map((s) => (
            <Texto key={s} v="fuerte" tam={11} centro style={{ flex: 1 }}>
              {tm(s)}
            </Texto>
          ))}
        </View>
        {cartas.map((c, i) => {
          const visible = i < hasta;
          return (
            <View key={i} style={styles.filaTabla}>
              <Vuela visible={visible} desde={{ x: 30, y: 0, r: 0 }} estilo={{ width: 38, alignItems: "center" }}>
                <Carta valor={c.valor} palo={c.palo} tam={26} />
              </Vuela>
              {sistemas.map((s, si) => (
                <Vuela key={s} visible={visible} demora={200 + si * 80} desde={{ x: 0, y: 0, r: 0 }} estilo={{ flex: 1, alignItems: "center" }}>
                  <ChipValor valor={valores[si][i]} />
                </Vuela>
              ))}
            </View>
          );
        })}
        <View style={{ height: 1, backgroundColor: BORDE, marginVertical: 2 }} />
        <View style={styles.filaTabla}>
          <Texto v="nota" tam={11} centro style={{ width: 38 }}>
            {t("compararConteo")}
          </Texto>
          {sistemas.map((s, si) => {
            const valor = hasta > 0 ? acum[si][hasta - 1] : 0;
            return (
              <View key={s} style={{ flex: 1, alignItems: "center" }}>
                <Animated.View key={`${s}-${valor}`} entering={ZoomIn.springify().damping(18)} style={[styles.chipGrande, { borderWidth: 2 }, estiloValor(valor)]}>
                  <Texto style={{ fontFamily: fuente.mono, fontSize: 17, color: FG }}>{signo(valor)}</Texto>
                </Animated.View>
              </View>
            );
          })}
        </View>
      </View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  chip: { minWidth: 32, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  chipGrande: { minWidth: 40, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  marcador: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  grupo: { alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 2 },
  filaCartas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  bloque: { paddingHorizontal: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: BORDE },
  hueco: { width: ANCHO_CARTA, height: Math.round((ANCHO_CARTA * 84) / 60), borderRadius: 6, borderWidth: 1, borderStyle: "dashed", borderColor: BORDE },
  escenario: { height: 112, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: BORDE, backgroundColor: FONDO, paddingHorizontal: 12 },
  sumaCero: { position: "absolute", bottom: -2, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: BORDE, backgroundColor: color.surface1 },
  barraFondo: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: color.surface2 },
  filaMazo: { gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  filaTabla: { flexDirection: "row", alignItems: "center", gap: 6 },
});
