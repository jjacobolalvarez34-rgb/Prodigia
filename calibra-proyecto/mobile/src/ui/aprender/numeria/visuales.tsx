import { useEffect, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from "react-native-svg";
import type { VisualNumeriaBalanza, VisualNumeriaColumnas, VisualNumeriaDivision, VisualNumeriaFigura, VisualNumeriaFraccion, VisualNumeriaMcm, VisualNumeriaMultiplicacion, VisualNumeriaPotencia, VisualNumeriaRecta } from "@/lib/numeria/visuales";
import {
  anguloComplementario,
  areaCirculo,
  areaCompuesta,
  columnasResta,
  columnasSuma,
  despejarLineal,
  divisionLarga,
  fraccionOperacion,
  mcmPorListado,
  multiplicacionColumnas,
  posicionEnRecta,
  potenciaCadena,
  ternaPitagorica,
  verificarSustitucion,
  type DatosColumnas,
  type DatosFraccion,
} from "@/lib/numeria/visualesDatos";
import { textosDe } from "~/lib/textosWeb";
import { color, fuente } from "~/tema";
import Texto from "../../Texto";
import { Aparece, BORDE, FG, FONDO, GAparece, Marco, mezcla, SECUNDARIO, SUPERFICIE, T } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Numeria (components/numeria/visuales de la web),
// con los mismos cálculos (lib/numeria/visualesDatos).
const COLOR_NUMERIA = "#6C4CF1";
const ACENTO2 = "#E8703A";
const tt = (sub: string) => textosDe(`Numeria.visuales.${sub}`);
const tCol = tt("columnas");
const tMul = tt("multiplicacion");
const tDiv = tt("division");
const tMcm = tt("mcm");
const tFra = tt("fraccion");
const tPot = tt("potencia");
const tBal = tt("balanza");
const tFig = tt("figura");

function Casilla({ valor, activo = false, chico = false }: { valor: number | string; activo?: boolean; chico?: boolean }) {
  return (
    <View
      style={[
        chico ? styles.casillaChica : styles.casilla,
        activo ? { borderColor: COLOR_NUMERIA, backgroundColor: mezcla(COLOR_NUMERIA, 16) } : { borderColor: BORDE, backgroundColor: SUPERFICIE },
      ]}
    >
      <Texto style={[styles.mono, chico && { fontSize: 11 }]}>{String(valor)}</Texto>
    </View>
  );
}

function Resaltado({ children }: { children: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.resaltado}>
      <T negrita c={COLOR_NUMERIA} tam={13}>
        {children}
      </T>
    </Animated.View>
  );
}

function Entra({ children, estilo }: { children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(300)} style={estilo}>
      {children}
    </Animated.View>
  );
}

function Raya() {
  return <View style={{ height: 2, alignSelf: "stretch", borderRadius: 1, backgroundColor: COLOR_NUMERIA, opacity: 0.5 }} />;
}

// ---------- Columnas (suma / resta con acarreo o préstamo) ----------
function datosColumnas(visual: VisualNumeriaColumnas): DatosColumnas | null {
  const a = Math.trunc(visual.a);
  const b = Math.trunc(visual.b);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) return null;
  if (visual.operacion === "resta" && a < b) return null;
  return visual.operacion === "suma" ? columnasSuma(a, b) : columnasResta(a, b);
}

export function Columnas({ visual }: { visual: VisualNumeriaColumnas }) {
  const datos = datosColumnas(visual);
  const r = useReproductor({ total: datos?.columnas.length ?? 0, ms: 1500, estatico: visual.estatico });
  if (!datos) return null;
  const { columnas, resultado, operacion } = datos;
  const total = columnas.length;
  const primero = total - r.paso;
  const actual = r.reproduciendo || r.paso < total ? primero : -1;
  const simbolo = operacion === "suma" ? "+" : "−";
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <View style={styles.filaDigitos}>
          <View style={styles.columnaOperador}>
            <View style={{ height: 22 }} />
            <View style={{ height: 40 }} />
            <Texto v="fuerte" tam={20} c={COLOR_NUMERIA}>
              {simbolo}
            </Texto>
          </View>
          {columnas.map((c, i) => {
            const revelado = i >= primero;
            return (
              <Aparece key={i} visible={revelado} ms={300} estilo={{ alignItems: "center", gap: 4 }}>
                <View style={{ height: 22, justifyContent: "center" }}>{revelado && c.entra > 0 ? <Casilla valor={c.entra} chico activo /> : null}</View>
                <Casilla valor={c.digitoA} activo={i === actual} />
                <Casilla valor={c.digitoB} activo={i === actual} />
              </Aparece>
            );
          })}
        </View>
        <Raya />
        <View style={styles.filaDigitos}>
          <View style={{ width: 24 }} />
          {columnas.map((c, i) => (
            <Aparece key={i} visible={i >= primero} ms={300}>
              <Casilla valor={i >= primero ? c.resultado : ""} activo={i === actual} />
            </Aparece>
          ))}
        </View>
      </View>
      {r.paso >= total && <Resaltado>{tCol("resultado", { n: resultado })}</Resaltado>}
    </Marco>
  );
}

// ---------- Multiplicación con productos parciales ----------
function digitosAlineados(valor: number, ancho: number): (number | null)[] {
  const texto = String(Math.trunc(Math.abs(valor)));
  const relleno = ancho - texto.length;
  return Array.from({ length: ancho }, (_, i) => (i < relleno ? null : Number(texto[i - relleno])));
}

function Fila({ digitos, activo = false, operador }: { digitos: (number | null)[]; activo?: boolean; operador?: string }) {
  return (
    <View style={styles.filaDigitos}>
      <View style={[styles.casilla, { borderWidth: 0 }]}>
        <Texto v="fuerte" tam={18} c={COLOR_NUMERIA}>
          {operador ?? ""}
        </Texto>
      </View>
      {digitos.map((d, i) => (d === null ? <View key={i} style={styles.hueco} /> : <Casilla key={i} valor={d} activo={activo} />))}
    </View>
  );
}

export function Multiplicacion({ visual }: { visual: VisualNumeriaMultiplicacion }) {
  const a = Math.trunc(visual.a);
  const b = Math.trunc(visual.b);
  const valido = Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0;
  const datos = valido ? multiplicacionColumnas(a, b) : null;
  const r = useReproductor({ total: datos?.parciales.length ?? 0, ms: 1800, estatico: visual.estatico });
  if (!datos) return null;
  const { parciales, resultado } = datos;
  const ancho = Math.max(String(resultado).length, String(a).length);
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Fila digitos={digitosAlineados(a, ancho)} />
        <Fila digitos={digitosAlineados(b, ancho)} operador="×" />
        <Raya />
        {parciales.map((p, i) => {
          const revelado = i < r.paso;
          return (
            <Aparece key={i} visible={revelado} ms={300}>
              <Fila digitos={digitosAlineados(revelado ? p.valor : 0, ancho).map((d) => (revelado ? d : null))} activo={i === r.paso - 1} />
            </Aparece>
          );
        })}
        {r.paso >= parciales.length && (
          <Entra estilo={{ alignItems: "center", gap: 4, alignSelf: "stretch" }}>
            <Raya />
            <Fila digitos={digitosAlineados(resultado, ancho)} activo />
          </Entra>
        )}
      </View>
      {r.paso >= parciales.length && <Resaltado>{tMul("suma", { n: resultado })}</Resaltado>}
    </Marco>
  );
}

// ---------- División larga ----------
export function Division({ visual }: { visual: VisualNumeriaDivision }) {
  const dividendo = Math.trunc(visual.dividendo);
  const divisor = Math.trunc(visual.divisor);
  const valido = Number.isFinite(dividendo) && Number.isFinite(divisor) && dividendo > 0 && divisor > 0;
  const datos = valido ? divisionLarga(dividendo, divisor) : null;
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2200, estatico: visual.estatico });
  if (!datos) return null;
  const { pasos, cociente, resto } = datos;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ alignItems: "center", gap: 4 }}>
        <View style={[styles.filaDigitos, { paddingLeft: 48 }]}>
          {pasos.map((p, i) => (
            <View key={i} style={[styles.hueco, { height: 30, alignItems: "center", justifyContent: "center" }]}>
              <Texto style={[styles.mono, { fontSize: 18, color: COLOR_NUMERIA }]}>{i < r.paso ? String(p.digitoCociente) : ""}</Texto>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "stretch" }}>
          <View style={styles.divisor}>
            <Texto style={[styles.mono, { fontSize: 18 }]}>{String(divisor)}</Texto>
          </View>
          <View style={styles.casita}>
            {String(dividendo)
              .split("")
              .map((d, i) => (
                <Casilla key={i} valor={d} activo={i === r.paso - 1 && r.paso < pasos.length} />
              ))}
          </View>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        {pasos.slice(0, r.paso).map((p, i) => (
          <Entra key={i} estilo={[styles.tarjeta, i === r.paso - 1 && styles.tarjetaActual]}>
            <Texto v="cuerpo" tam={13}>
              {`${tDiv("bajar", { d: p.bajado })} ${p.arrastreEntra > 0 ? tDiv("conArrastre", { arrastre: p.arrastreEntra, numero: p.numeroActual }) : ""}`}
            </Texto>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <Texto style={[styles.mono, { fontSize: 13 }]}>{`${p.numeroActual} ÷ ${divisor} = ${p.digitoCociente}`}</Texto>
              <Chip>{`${p.digitoCociente} × ${divisor} = ${p.producto}`}</Chip>
              <Chip>{tDiv("resto", { n: p.resto })}</Chip>
            </View>
          </Entra>
        ))}
      </View>
      {r.paso >= pasos.length && <Resaltado>{tDiv("final", { cociente, resto })}</Resaltado>}
    </Marco>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <View style={[styles.resaltado, { alignSelf: "auto", paddingVertical: 2 }]}>
      <Texto v="fuerte" tam={12} c={COLOR_NUMERIA}>
        {children}
      </Texto>
    </View>
  );
}

// ---------- MCM por listado ----------
function FilaMultiplos({ etiqueta, valores, hasta, comun }: { etiqueta: string; valores: number[]; hasta: number; comun: number | null }) {
  return (
    <View style={{ gap: 6, alignSelf: "stretch" }}>
      <Texto v="micro" tam={11}>
        {etiqueta.toUpperCase()}
      </Texto>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {valores.slice(0, hasta).map((v, i) => {
          const esComun = v === comun;
          return (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(250)}
              style={[styles.multiplo, esComun ? { borderWidth: 2, borderColor: COLOR_NUMERIA, backgroundColor: mezcla(COLOR_NUMERIA, 20) } : { borderColor: BORDE, backgroundColor: SUPERFICIE }]}
            >
              <Texto style={[styles.mono, { fontSize: 14 }]}>{String(v)}</Texto>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

export function Mcm({ visual }: { visual: VisualNumeriaMcm }) {
  const a = Math.trunc(visual.a);
  const b = Math.trunc(visual.b);
  const valido = Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0;
  const datos = valido ? mcmPorListado(a, b) : null;
  const r = useReproductor({ total: datos?.multiplosA.length ?? 0, ms: 700, estatico: visual.estatico });
  if (!datos) return null;
  const { multiplosA, multiplosB, primerComun } = datos;
  const hasta = Math.max(1, r.paso);
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <FilaMultiplos etiqueta={tMcm("multiplosDe", { n: a })} valores={multiplosA} hasta={hasta} comun={primerComun} />
      <FilaMultiplos etiqueta={tMcm("multiplosDe", { n: b })} valores={multiplosB} hasta={hasta} comun={primerComun} />
      {primerComun !== null && multiplosA.slice(0, hasta).includes(primerComun) && multiplosB.slice(0, hasta).includes(primerComun) && (
        <Resaltado>{tMcm("resultado", { n: primerComun })}</Resaltado>
      )}
    </Marco>
  );
}

// ---------- Fracciones con barras ----------
function BarraFraccion({ num, den }: { num: number; den: number }) {
  if (!Number.isFinite(den) || den <= 0) return null;
  const negativo = num < 0;
  const absNum = Math.round(Math.abs(num));
  const barras = Math.max(1, Math.ceil(absNum / den));
  const lado = den > 10 ? 16 : 22;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      {negativo && (
        <Texto v="fuerte" tam={18} c={color.error}>
          −
        </Texto>
      )}
      {Array.from({ length: barras }).map((_, bi) => {
        const sombreadas = Math.max(0, Math.min(den, absNum - bi * den));
        return (
          <View key={bi} style={[styles.barraFraccion, { borderColor: COLOR_NUMERIA }]}>
            {Array.from({ length: den }).map((__, i) => (
              <View key={i} style={{ width: lado, height: 22, borderRightWidth: i < den - 1 ? 1 : 0, borderColor: BORDE, backgroundColor: i < sombreadas ? COLOR_NUMERIA : SUPERFICIE }} />
            ))}
          </View>
        );
      })}
    </View>
  );
}

interface EtapaFraccion {
  titulo: string;
  num: number;
  den: number;
}

function etapasDe(d: DatosFraccion): EtapaFraccion[] {
  const original1 = { titulo: tFra("original", { num: d.num1, den: d.den1 }), num: d.num1, den: d.den1 };
  const original2 = { titulo: tFra("original", { num: d.num2, den: d.den2 }), num: d.num2, den: d.den2 };
  const resultado = { titulo: tFra("resultado", { num: d.numSimplificado, den: d.denSimplificado }), num: d.numSimplificado, den: d.denSimplificado };
  if (d.operacion === "suma" || d.operacion === "resta") {
    return [
      original1,
      original2,
      { titulo: tFra("convertida", { num: d.num1Convertido!, den: d.denominadorComun! }), num: d.num1Convertido!, den: d.denominadorComun! },
      { titulo: tFra("convertida", { num: d.num2Convertido!, den: d.denominadorComun! }), num: d.num2Convertido!, den: d.denominadorComun! },
      resultado,
    ];
  }
  const etapas = [original1, original2];
  if (d.operacion === "division") etapas.push({ titulo: tFra("reciproca", { num: d.num2Operado!, den: d.den2Operado! }), num: d.num2Operado!, den: d.den2Operado! });
  etapas.push(resultado);
  return etapas;
}

export function Fraccion({ visual }: { visual: VisualNumeriaFraccion }) {
  const { num1, den1, num2, den2, operacion } = visual;
  const valido = [den1, den2].every((d) => Number.isFinite(d) && d > 0) && [num1, num2].every(Number.isFinite);
  const datos = valido ? fraccionOperacion(operacion, num1, den1, num2, den2) : null;
  const etapas = datos ? etapasDe(datos) : [];
  const r = useReproductor({ total: etapas.length, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 8 }}>
        {etapas.slice(0, r.paso).map((e, i) => (
          <Entra key={i} estilo={[styles.tarjeta, i === r.paso - 1 && styles.tarjetaActual]}>
            <T tam={12} c={SECUNDARIO} negrita>
              {e.titulo}
            </T>
            <BarraFraccion num={e.num} den={e.den} />
          </Entra>
        ))}
      </View>
      {r.paso >= etapas.length && <Resaltado>{tFra("resultado", { num: datos.numSimplificado, den: datos.denSimplificado })}</Resaltado>}
    </Marco>
  );
}

// ---------- Recta numérica ----------
export function Recta({ visual }: { visual: VisualNumeriaRecta }) {
  const { min, max } = visual;
  const marcas = Array.isArray(visual.marcas) ? visual.marcas.filter((m) => typeof m?.valor === "number" && Number.isFinite(m.valor)) : [];
  const valido = Number.isFinite(min) && Number.isFinite(max) && max > min && marcas.length > 0;
  const r = useReproductor({ total: marcas.length, ms: 1400, estatico: visual.estatico, inicio: 1 });
  if (!valido) return null;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ height: 84, marginHorizontal: 18 }}>
        <View style={[styles.rectaLinea, { backgroundColor: COLOR_NUMERIA }]} />
        <Texto v="nota" tam={11} style={{ position: "absolute", left: -16, top: 46 }}>
          {String(min)}
        </Texto>
        <Texto v="nota" tam={11} style={{ position: "absolute", right: -16, top: 46 }}>
          {String(max)}
        </Texto>
        {marcas.slice(0, r.paso).map((m, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(300)} style={[styles.marcaRecta, { left: `${posicionEnRecta(m.valor, min, max)}%` }]}>
            <View style={[styles.puntoRecta, { backgroundColor: COLOR_NUMERIA }]} />
            {m.etiqueta ? (
              <View style={[styles.etiquetaRecta, { backgroundColor: mezcla(COLOR_NUMERIA, 16) }]}>
                <T tam={11} negrita>
                  {m.etiqueta}
                </T>
              </View>
            ) : null}
          </Animated.View>
        ))}
      </View>
    </Marco>
  );
}

// ---------- Potencias (cadena o cuadrícula) ----------
export function Potencia({ visual }: { visual: VisualNumeriaPotencia }) {
  const { width } = useWindowDimensions();
  const base = Math.trunc(visual.base);
  const exponente = Math.trunc(visual.exponente);
  const modo = visual.modo === "cuadricula" ? "cuadricula" : "cadena";
  const valido = Number.isFinite(base) && base > 0 && Number.isFinite(exponente) && exponente >= 2 && exponente <= 8 && (modo !== "cuadricula" || (exponente === 2 && base <= 15));
  const datos = valido ? potenciaCadena(base, exponente) : null;
  const totalPasos = modo === "cuadricula" ? base : (datos?.pasos.length ?? 0);
  const r = useReproductor({ total: totalPasos, ms: modo === "cuadricula" ? 150 : 1600, estatico: visual.estatico, inicio: modo === "cadena" ? 0 : 1 });
  if (!datos) return null;
  const { pasos, resultado } = datos;
  const lado = Math.max(8, Math.min(16, Math.floor((width - 90) / base) - 4));
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      {modo === "cadena" ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <Casilla valor={base} activo={r.paso === 0} />
          {pasos.map((p, i) => {
            const revelado = i < r.paso;
            return (
              <Aparece key={i} visible={revelado} ms={300} estilo={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Texto v="fuerte" tam={17} c={COLOR_NUMERIA}>
                  {`× ${base} =`}
                </Texto>
                <Casilla valor={revelado ? p.acumulado : ""} activo={revelado && i === r.paso - 1} />
              </Aparece>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 4, alignSelf: "center" }}>
          {Array.from({ length: base }).map((_, fila) => (
            <Aparece key={fila} visible={fila < r.paso} opacidad={0.85} ms={200} estilo={{ flexDirection: "row", gap: 4 }}>
              {Array.from({ length: base }).map((__, col) => (
                <View key={col} style={{ width: lado, height: lado, borderRadius: 3, backgroundColor: COLOR_NUMERIA }} />
              ))}
            </Aparece>
          ))}
        </View>
      )}
      {r.paso >= totalPasos && <Resaltado>{modo === "cadena" ? tPot("resultado", { base, exponente, n: resultado }) : tPot("cuadricula", { base, n: resultado })}</Resaltado>}
    </Marco>
  );
}

// ---------- Balanza (despejar / verificar) ----------
function textoEcuacion(coefX: number, constante: number): string {
  const coef = coefX === 1 ? "x" : coefX === -1 ? "-x" : `${coefX}x`;
  if (constante === 0) return coef;
  return `${coef} ${constante > 0 ? "+" : "-"} ${Math.abs(constante)}`;
}

function Plato({ contenido }: { contenido: string }) {
  return (
    <View style={[styles.plato, { borderColor: COLOR_NUMERIA }]}>
      <T negrita tam={16}>
        {contenido}
      </T>
    </View>
  );
}

export function Balanza({ visual }: { visual: VisualNumeriaBalanza }) {
  const { coefX, constante, resultado } = visual;
  const valido = [coefX, constante, resultado].every((n) => Number.isFinite(n)) && coefX !== 0;
  const modo = visual.modo === "verificar" ? "verificar" : "despejar";
  const totalPasos = modo === "despejar" ? 2 : 1;
  const r = useReproductor({ total: totalPasos, ms: 2000, estatico: visual.estatico, inicio: 1 });
  const despeje = valido ? despejarLineal(coefX, constante, resultado) : null;
  if (!despeje) return null;
  const { x, trasConstante } = despeje;
  const original = textoEcuacion(coefX, constante);
  const etapas =
    modo === "despejar"
      ? [
          { izq: original, der: `${resultado}` },
          { izq: textoEcuacion(coefX, 0), der: `${trasConstante}` },
          { izq: "x", der: `${x}` },
        ]
      : [
          { izq: original, der: `${resultado}` },
          { izq: `${coefX}(${x})${constante >= 0 ? "+" : "-"}${Math.abs(constante)}`, der: `${resultado}` },
        ];
  const paso = Math.min(r.paso, etapas.length - 1);
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Entra key={paso} estilo={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Plato contenido={etapas[paso].izq} />
        <Texto v="fuerte" tam={20} c={COLOR_NUMERIA}>
          =
        </Texto>
        <Plato contenido={etapas[paso].der} />
      </Entra>
      {r.paso >= totalPasos && <Resaltado>{modo === "despejar" ? tBal("resultado", { n: x }) : tBal("comprobacion", { n: verificarSustitucion(coefX, constante, x) })}</Resaltado>}
    </Marco>
  );
}

// ---------- Figuras (triángulo, área compuesta, círculo, ángulos) ----------
type DeModo<M extends VisualNumeriaFigura["modo"]> = Extract<VisualNumeriaFigura, { modo: M }>;

function Linea({ children }: { children: string }) {
  return (
    <Entra>
      <T tam={12} c={SECUNDARIO} centro>
        {children}
      </T>
    </Entra>
  );
}

function Triangulo({ visual }: { visual: DeModo<"triangulo"> }) {
  const c1 = Math.trunc(visual.cateto1);
  const c2 = Math.trunc(visual.cateto2);
  const valido = Number.isFinite(c1) && c1 > 0 && Number.isFinite(c2) && c2 > 0;
  const r = useReproductor({ total: 3, ms: 1300, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? ternaPitagorica(c1, c2) : null;
  if (!datos) return null;
  const hip = Number.isInteger(datos.hipotenusa) ? String(datos.hipotenusa) : datos.hipotenusa.toFixed(2);
  const escala = Math.min(14, 130 / Math.max(c1, c2));
  const w = c1 * escala;
  const h = c2 * escala;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Svg width={w + 40} height={h + 40} viewBox={`0 0 ${w + 40} ${h + 40}`} style={{ alignSelf: "center" }}>
        <Polygon points={`20,20 20,${20 + h} ${20 + w},${20 + h}`} fill={mezcla(COLOR_NUMERIA, 10)} stroke={COLOR_NUMERIA} strokeWidth={2} />
        <Rect x={20} y={20 + h - 10} width={10} height={10} fill="none" stroke={COLOR_NUMERIA} strokeWidth={1.5} />
        <GAparece visible={r.paso >= 1}>
          <SvgText x={8} y={20 + h / 2} fontSize={12} fontWeight="bold" fill={FG} textAnchor="middle">
            {String(c2)}
          </SvgText>
        </GAparece>
        <GAparece visible={r.paso >= 2}>
          <SvgText x={20 + w / 2} y={20 + h + 16} fontSize={12} fontWeight="bold" fill={FG} textAnchor="middle">
            {String(c1)}
          </SvgText>
        </GAparece>
        <GAparece visible={r.paso >= 3}>
          <SvgText x={20 + w / 2 + 8} y={20 + h / 2 - 6} fontSize={12} fontWeight="bold" fill={COLOR_NUMERIA} textAnchor="middle">
            {hip}
          </SvgText>
        </GAparece>
      </Svg>
      {r.paso >= 3 && <Resaltado>{tFig("hipotenusa", { n: hip })}</Resaltado>}
    </Marco>
  );
}

function AreaCompuesta({ visual }: { visual: DeModo<"areaCompuesta"> }) {
  const [aG, hG0, aR, hR0] = [visual.anchoGrande, visual.altoGrande, visual.anchoRecorte, visual.altoRecorte].map(Math.trunc);
  const valido = [aG, hG0, aR, hR0].every((n) => Number.isFinite(n) && n > 0) && aR < aG && hR0 < hG0;
  const r = useReproductor({ total: 3, ms: 1500, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? areaCompuesta(aG, hG0, aR, hR0) : null;
  if (!datos) return null;
  const escala = Math.min(16, 160 / aG, 120 / hG0);
  const wG = aG * escala;
  const hG = hG0 * escala;
  const wR = aR * escala;
  const hR = hR0 * escala;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Svg width={wG + 4} height={hG + 4} viewBox={`0 0 ${wG + 4} ${hG + 4}`} style={{ alignSelf: "center" }}>
        <GAparece visible opacidad={r.paso >= 1 ? 1 : 0.3}>
          <Rect x={2} y={2} width={wG} height={hG} fill={mezcla(COLOR_NUMERIA, 22)} stroke={COLOR_NUMERIA} strokeWidth={2} />
        </GAparece>
        <GAparece visible={r.paso >= 2}>
          <Rect x={2 + wG - wR} y={2} width={wR} height={hR} fill={FONDO} stroke={ACENTO2} strokeWidth={2} strokeDasharray="4 3" />
        </GAparece>
      </Svg>
      <View style={{ gap: 4 }}>
        {r.paso >= 1 && <Linea>{tFig("areaGrande", { ancho: aG, alto: hG0, n: datos.areaGrande })}</Linea>}
        {r.paso >= 2 && (
          <Entra>
            <T tam={12} c={ACENTO2} centro>
              {tFig("areaRecorte", { ancho: aR, alto: hR0, n: datos.areaRecorte })}
            </T>
          </Entra>
        )}
        {r.paso >= 3 && <Resaltado>{tFig("areaFinal", { n: datos.areaFinal })}</Resaltado>}
      </View>
    </Marco>
  );
}

function CirculoFig({ visual }: { visual: DeModo<"circulo"> }) {
  const radio = Math.trunc(visual.radio);
  const valido = Number.isFinite(radio) && radio > 0;
  const r = useReproductor({ total: 2, ms: 1600, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? areaCirculo(radio) : null;
  if (!datos) return null;
  const areaTexto = Number.isInteger(datos.area) ? String(datos.area) : datos.area.toFixed(2);
  const pi = datos.multiploDe7 ? "22/7" : "3.14";
  const rPx = radio * Math.min(10, 90 / radio);
  const tam = rPx * 2 + 30;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} style={{ alignSelf: "center" }}>
        <Circle cx={tam / 2} cy={tam / 2} r={rPx} fill={mezcla(COLOR_NUMERIA, 18)} stroke={COLOR_NUMERIA} strokeWidth={2} />
        <GAparece visible={r.paso >= 1}>
          <Line x1={tam / 2} y1={tam / 2} x2={tam / 2 + rPx} y2={tam / 2} stroke={COLOR_NUMERIA} strokeWidth={2} />
          <SvgText x={tam / 2 + rPx / 2} y={tam / 2 - 6} fontSize={12} fontWeight="bold" fill={FG} textAnchor="middle">
            {String(radio)}
          </SvgText>
        </GAparece>
      </Svg>
      {r.paso >= 1 && <Linea>{tFig("radio", { n: radio })}</Linea>}
      {r.paso >= 2 && <Resaltado>{tFig("area", { pi, n: areaTexto })}</Resaltado>}
    </Marco>
  );
}

function Tramo({ ancho, fondo, texto }: { ancho: number; fondo: string; texto: string }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(withTiming(ancho, { duration: 400 }));
  }, [ancho, w]);
  const a = useAnimatedStyle(() => ({ width: w.value }));
  return (
    <Animated.View style={[{ height: "100%", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: fondo }, a]}>
      <Texto v="fuerte" tam={12} c="#fff" numberOfLines={1}>
        {texto}
      </Texto>
    </Animated.View>
  );
}

function Angulos({ visual }: { visual: DeModo<"angulos"> }) {
  const conocido = Math.trunc(visual.conocido);
  const tipo = visual.tipoAngulo === "complementario" ? "complementario" : "suplementario";
  const tope = tipo === "complementario" ? 90 : 180;
  const valido = Number.isFinite(conocido) && conocido > 0 && conocido < tope;
  const r = useReproductor({ total: 2, ms: 1300, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? anguloComplementario(tipo, conocido) : null;
  if (!datos) return null;
  const { total, otro } = datos;
  const anchoBarra = 240;
  const aConocido = (conocido / total) * anchoBarra;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={[styles.barraAngulos, { width: anchoBarra + 2, borderColor: COLOR_NUMERIA }]}>
        <Tramo ancho={r.paso >= 1 ? aConocido : 0} fondo={COLOR_NUMERIA} texto={r.paso >= 1 ? `${conocido}°` : ""} />
        <Tramo ancho={r.paso >= 2 ? anchoBarra - aConocido : 0} fondo={ACENTO2} texto={r.paso >= 2 ? `${otro}°` : ""} />
      </View>
      {r.paso >= 1 && <Linea>{tFig("conocido", { n: conocido })}</Linea>}
      {r.paso >= 2 && <Resaltado>{tFig("otro", { total, n: otro })}</Resaltado>}
    </Marco>
  );
}

export function Figura({ visual }: { visual: VisualNumeriaFigura }) {
  if (visual.modo === "triangulo") return <Triangulo visual={visual} />;
  if (visual.modo === "areaCompuesta") return <AreaCompuesta visual={visual} />;
  if (visual.modo === "circulo") return <CirculoFig visual={visual} />;
  if (visual.modo === "angulos") return <Angulos visual={visual} />;
  return null;
}

const styles = StyleSheet.create({
  mono: { fontFamily: fuente.mono, fontSize: 17, color: FG },
  casilla: { height: 40, minWidth: 36, paddingHorizontal: 4, borderRadius: 7, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  casillaChica: { height: 20, minWidth: 20, paddingHorizontal: 2, borderRadius: 5, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hueco: { height: 40, minWidth: 36 },
  filaDigitos: { flexDirection: "row", alignItems: "flex-end", gap: 5 },
  columnaOperador: { width: 24, alignItems: "center", justifyContent: "flex-end", gap: 4, height: 110, paddingBottom: 6 },
  resaltado: { alignSelf: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: mezcla(COLOR_NUMERIA, 14) },
  tarjeta: { gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  tarjetaActual: { borderColor: conAlfaLogro(0.5), backgroundColor: conAlfaLogro(0.1) },
  divisor: { paddingHorizontal: 8, borderRadius: 7, borderWidth: 2, borderColor: COLOR_NUMERIA, alignItems: "center", justifyContent: "center" },
  casita: { flexDirection: "row", gap: 4, paddingLeft: 8, paddingTop: 4, borderLeftWidth: 2, borderTopWidth: 2, borderColor: COLOR_NUMERIA },
  multiplo: { height: 36, minWidth: 36, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  barraFraccion: { flexDirection: "row", borderWidth: 1, borderRadius: 6, overflow: "hidden" },
  rectaLinea: { position: "absolute", left: 0, right: 0, top: 30, height: 4, borderRadius: 2, opacity: 0.3 },
  marcaRecta: { position: "absolute", top: 25, width: 120, marginLeft: -60, alignItems: "center", gap: 10 },
  puntoRecta: { width: 14, height: 14, borderRadius: 7 },
  etiquetaRecta: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  plato: { minHeight: 44, minWidth: 64, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 2, backgroundColor: SUPERFICIE, alignItems: "center", justifyContent: "center" },
  barraAngulos: { height: 40, flexDirection: "row", alignSelf: "center", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
});

function conAlfaLogro(a: number) {
  return mezcla(color.logro, a * 100);
}
