import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { G, Path, Rect, Text as SvgText, TSpan } from "react-native-svg";
import type { VisualMelodiaAcorde, VisualMelodiaEscala, VisualMelodiaFrecuencia, VisualMelodiaPentagrama, VisualMelodiaRitmo, VisualMelodiaTeclado } from "@/lib/melodia/visuales";
import {
  esTeclaNegra,
  etiquetaSalto,
  formatoHz,
  formatoRazon,
  nombreDeTecla,
  nombreSinOctava,
  PULSOS_TEXTO,
  resolverFrecuencia,
  resolverPentagrama,
  resolverRitmo,
  resolverTeclado,
  resolverTecladoAcorde,
  resolverTecladoEscala,
  type GeometriaTeclado,
  type TecladoResuelto,
} from "@/lib/melodia/visualesDatos";
import { NOMBRE_FIGURA, nombreNota, semitonoAbsoluto, type NotaMusical } from "@/lib/practica/melodia";
import { textosDe } from "~/lib/textosWeb";
import { FG , Aparece, BORDE, Marco, mezcla, SECUNDARIO, SUPERFICIE } from "../comun";
import Pentagrama, { FiguraRitmicaIcono } from "../../Pentagrama";
import Texto from "../../Texto";
import { NOTAS } from "../../visuales/notas";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Melodía (components/melodia/visuales de la web): el
// mismo teclado (lib/melodia/visualesDatos), el pentagrama, las figuras y las
// frecuencias; "Escuchar" toca las notas con los mismos sonidos del oído absoluto.
const COLOR_MELODIA = "#B8860B";
const ACENTO = "#F2C14E";
const fondoAcento = (pct: number) => mezcla(COLOR_MELODIA, pct);
const tv = textosDe("Melodia.visuales");
const MS_ENTRE_NOTAS = 420;

function Nota({ texto }: { texto: string }) {
  return texto ? (
    <Texto v="nota" tam={11} centro>
      {texto}
    </Texto>
  ) : null;
}

// Toca las notas (de a una o juntas) con los sonidos del oído absoluto.
function BotonEscuchar({ notas, juntas = false }: { notas: NotaMusical[]; juntas?: boolean }) {
  const jugadores = useRef<AudioPlayer[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      jugadores.current.forEach((j) => j.remove());
    },
    []
  );
  function tocar(n: NotaMusical) {
    const fuente = NOTAS[semitonoAbsoluto(n)];
    if (!fuente) return;
    const j = createAudioPlayer(fuente);
    jugadores.current.push(j);
    j.play();
    setTimeout(() => {
      j.remove();
      jugadores.current = jugadores.current.filter((x) => x !== j);
    }, 2500);
  }
  function escuchar() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    notas.forEach((n, i) => {
      if (juntas || i === 0) tocar(n);
      else timers.current.push(setTimeout(() => tocar(n), i * MS_ENTRE_NOTAS));
    });
  }
  return (
    <Pressable onPress={escuchar} style={({ pressed }) => [styles.escuchar, pressed && { transform: [{ scale: 0.96 }] }]}>
      <Svg width={14} height={14} viewBox="0 0 16 16">
        <Path d="M2 6h3l4-3v10L5 10H2z" stroke={ACENTO} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
        <Path d="M11.5 5.5a3.5 3.5 0 0 1 0 5" stroke={ACENTO} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      </Svg>
      <Texto v="fuerte" tam={12} c={ACENTO}>
        {tv("escuchar")}
      </Texto>
    </Pressable>
  );
}

// ---------- Teclado de piano (TecladoSvg.tsx de la web) ----------
const COLOR_BLANCA = "#F8F6F0";
const COLOR_BORDE_T = "#B9B4A8";
const COLOR_NEGRA = "#26231F";
const COLOR_TEXTO = "#3A362F";
const COLOR_BLANCA_RESALTADA = "#F3D98B";
const COLOR_GRUPO_2 = "#4F7FBF";
const COLOR_GRUPO_3 = "#3E9A6A";

function lineasDe(etiqueta: string, cifrado?: string): string[] {
  const partes = etiqueta.split("=");
  return cifrado !== undefined && partes.length === 1 ? [etiqueta, cifrado] : partes;
}

function TecladoSvg(p: {
  geometria: GeometriaTeclado;
  notas: NotaMusical[];
  etiquetas: string[];
  cifrados?: string[];
  cifrado?: boolean;
  visibles: number;
  nombres: "resaltadas" | "todas" | "ninguna";
  grupos?: boolean;
  semitonosNaturales?: boolean;
  saltos?: boolean;
  anchoMax: number;
}) {
  const { teclas, blancas } = p.geometria;
  const W = Math.max(20, Math.min(46, Math.floor(330 / blancas)));
  const altoBlanca = 92;
  const altoNegra = 56;
  const anchoNegra = W * 0.6;
  const semitonos = p.notas.map(semitonoAbsoluto);
  const visibles = new Map<number, number>();
  semitonos.forEach((s, i) => {
    if (i < p.visibles) visibles.set(s, i);
  });
  const actual = p.visibles - 1;
  const hayNegraResaltada = semitonos.some((s, i) => i < p.visibles && esTeclaNegra(s));
  const conSaltos = p.saltos === true && p.notas.length > 1;
  const filaSaltos = conSaltos ? 22 : 0;
  const hayDoble = p.etiquetas.some((e) => e.includes("=")) || p.cifrado === true;
  const filaNegras = hayNegraResaltada || p.grupos ? (hayDoble && hayNegraResaltada ? 32 : 18) : 0;
  const y0 = 4 + filaSaltos + filaNegras;
  const filaInferior = p.semitonosNaturales ? 22 : 0;
  const ancho = blancas * W;
  const alto = y0 + altoBlanca + filaInferior + 4;
  const fuenteT = W >= 36 ? 12 : W >= 28 ? 10 : 8.5;
  const cx = (centro: number) => centro * W;
  const gruposNegras: { centro: number; n: 2 | 3 }[] = [];
  if (p.grupos) {
    const negras = teclas.filter((k) => k.negra);
    for (const k of negras) {
      const pc = ((k.semitono % 12) + 12) % 12;
      if (pc === 1 && negras.some((o) => o.semitono === k.semitono + 2)) gruposNegras.push({ centro: k.centro + 1, n: 2 });
      if (pc === 6 && negras.some((o) => o.semitono === k.semitono + 4)) gruposNegras.push({ centro: k.centro + 1, n: 3 });
    }
  }
  const colorDeNegra = (s: number): string | null => {
    if (!p.grupos) return null;
    const pc = ((s % 12) + 12) % 12;
    return pc === 1 || pc === 3 ? COLOR_GRUPO_2 : COLOR_GRUPO_3;
  };
  const paresNaturales: { x: number }[] = [];
  if (p.semitonosNaturales) {
    for (const k of teclas) {
      const pc = ((k.semitono % 12) + 12) % 12;
      if (!k.negra && (pc === 4 || pc === 11) && teclas.some((o) => !o.negra && o.semitono === k.semitono + 1)) paresNaturales.push({ x: cx(k.centro + 0.5) });
    }
  }
  const anchoPx = Math.min(p.anchoMax, Math.max(ancho, 200) * 1.35);
  return (
    <Svg width={anchoPx} height={(anchoPx * alto) / ancho} viewBox={`0 0 ${ancho} ${alto}`} style={{ alignSelf: "center" }}>
      {conSaltos &&
        semitonos.slice(1).map((s, i) => {
          if (i + 1 >= p.visibles) return null;
          const a = teclas.find((k) => k.semitono === semitonos[i]);
          const b = teclas.find((k) => k.semitono === s);
          if (!a || !b) return null;
          const x1 = cx(a.centro) + 2;
          const x2 = cx(b.centro) - 2;
          const y = 19;
          return (
            <G key={`s${i}`}>
              <Path d={`M ${x1} ${y + 3} V ${y} H ${x2} V ${y + 3}`} fill="none" stroke={ACENTO} strokeWidth={1.4} />
              <SvgText x={(x1 + x2) / 2} y={y - 4} textAnchor="middle" fontSize={11} fontWeight="700" fill={ACENTO}>
                {etiquetaSalto(s - semitonos[i], "es")}
              </SvgText>
            </G>
          );
        })}
      {gruposNegras.map((g, i) => (
        <SvgText key={`g${i}`} x={cx(g.centro)} y={filaSaltos + 14} textAnchor="middle" fontSize={13} fontWeight="800" fill={g.n === 2 ? COLOR_GRUPO_2 : COLOR_GRUPO_3}>
          {String(g.n)}
        </SvgText>
      ))}
      {teclas
        .filter((k) => !k.negra)
        .map((k) => {
          const idx = visibles.get(k.semitono);
          const resaltada = idx !== undefined;
          const x = k.indiceBlanca * W;
          const nombre = resaltada ? p.etiquetas[idx] : p.nombres === "todas" ? nombreDeTecla(k.semitono, false) : "";
          const esActual = idx === actual && resaltada;
          return (
            <G key={k.semitono}>
              <Rect x={x + 0.5} y={y0} width={W - 1} height={altoBlanca} rx={3} fill={resaltada ? COLOR_BLANCA_RESALTADA : COLOR_BLANCA} stroke={esActual ? COLOR_MELODIA : COLOR_BORDE_T} strokeWidth={esActual ? 2 : 1} />
              {p.nombres !== "ninguna" &&
                nombre !== "" &&
                lineasDe(nombre).map((linea, li, todas) => (
                  <SvgText
                    key={li}
                    x={x + W / 2}
                    y={y0 + altoBlanca - (p.cifrado && resaltada ? 24 : 8) - (todas.length - 1 - li) * 13}
                    textAnchor="middle"
                    fontSize={Math.min(fuenteT, (W * 0.95) / (Math.max(1, linea.length) * 0.56))}
                    fontWeight={resaltada ? "700" : "500"}
                    fill={COLOR_TEXTO}
                  >
                    {linea}
                  </SvgText>
                ))}
              {p.cifrado && resaltada && p.cifrados ? (
                <SvgText x={x + W / 2} y={y0 + altoBlanca - 7} textAnchor="middle" fontSize={fuenteT + 3} fontWeight="800" fill={COLOR_MELODIA}>
                  {p.cifrados[idx]}
                </SvgText>
              ) : null}
            </G>
          );
        })}
      {teclas
        .filter((k) => k.negra)
        .map((k) => {
          const idx = visibles.get(k.semitono);
          const resaltada = idx !== undefined;
          const propio = colorDeNegra(k.semitono);
          const esActual = idx === actual && resaltada;
          const lineas = resaltada ? lineasDe(p.etiquetas[idx], p.cifrado === true ? p.cifrados?.[idx] : undefined) : [];
          return (
            <G key={k.semitono}>
              <Rect x={cx(k.centro) - anchoNegra / 2} y={y0} width={anchoNegra} height={altoNegra} rx={2.5} fill={resaltada ? COLOR_MELODIA : propio ?? COLOR_NEGRA} stroke={esActual ? "#fff" : COLOR_NEGRA} strokeWidth={esActual ? 2 : 1} />
              {resaltada && p.nombres !== "ninguna" && (
                <SvgText textAnchor="middle" fontSize={Math.min(fuenteT + 1, (W * 1.05) / (Math.max(1, ...lineas.map((l) => l.length)) * 0.56))} fontWeight="700" fill={FG}>
                  {lineas.map((linea, li) => (
                    <TSpan key={li} x={cx(k.centro)} y={filaSaltos + 12 + li * 13}>
                      {linea}
                    </TSpan>
                  ))}
                </SvgText>
              )}
            </G>
          );
        })}
      {paresNaturales.map((pn, i) => (
        <G key={`n${i}`}>
          <Path d={`M ${pn.x - W * 0.5 + 3} ${y0 + altoBlanca + 5} V ${y0 + altoBlanca + 10} H ${pn.x + W * 0.5 - 3} V ${y0 + altoBlanca + 5}`} fill="none" stroke={ACENTO} strokeWidth={1.4} />
          <SvgText x={pn.x} y={y0 + altoBlanca + 20} textAnchor="middle" fontSize={11} fontWeight="700" fill={ACENTO}>
            {etiquetaSalto(1, "es")}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function TecladoBase({
  datos,
  titulo,
  estatico,
  nota,
  nombres = "resaltadas",
  grupos,
  semitonosNaturales,
  saltos,
  cifrado,
  escuchar,
  juntas,
  extra,
}: {
  datos: TecladoResuelto | null;
  titulo?: string;
  estatico?: boolean;
  nota?: string;
  nombres?: "resaltadas" | "todas" | "ninguna";
  grupos?: boolean;
  semitonosNaturales?: boolean;
  saltos?: boolean;
  cifrado?: boolean;
  escuchar?: boolean;
  juntas?: boolean;
  extra?: (visibles: number) => ReactNode;
}) {
  const { width } = useWindowDimensions();
  const total = datos?.notas.length ?? 0;
  const r = useReproductor({ total, ms: 1000, estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;
  return (
    <Marco acento={COLOR_MELODIA} titulo={titulo} r={r}>
      <TecladoSvg
        geometria={datos.geometria}
        notas={datos.notas}
        etiquetas={datos.etiquetas}
        cifrados={datos.cifrados}
        cifrado={cifrado}
        visibles={r.paso}
        nombres={nombres}
        grupos={grupos}
        semitonosNaturales={semitonosNaturales}
        saltos={saltos}
        anchoMax={width - 64}
      />
      {extra?.(r.paso)}
      <Nota texto={nota ?? ""} />
      {escuchar && <BotonEscuchar notas={datos.notas} juntas={juntas} />}
    </Marco>
  );
}

export function Teclado({ visual }: { visual: VisualMelodiaTeclado }) {
  const t = textosDe("Melodia.visuales.teclado");
  return (
    <TecladoBase
      datos={resolverTeclado(visual)}
      titulo={visual.titulo}
      estatico={visual.estatico}
      nota={t("nota")}
      nombres={visual.nombres}
      grupos={visual.grupos}
      semitonosNaturales={visual.semitonosNaturales}
      saltos={visual.saltos}
      cifrado={visual.cifrado}
      escuchar={visual.escuchar}
    />
  );
}

export function Escala({ visual }: { visual: VisualMelodiaEscala }) {
  const t = textosDe("Melodia.visuales.escala");
  return <TecladoBase datos={resolverTecladoEscala(visual)} titulo={visual.titulo} estatico={visual.estatico} nota={t("nota")} saltos escuchar={visual.escuchar} />;
}

export function Acorde({ visual }: { visual: VisualMelodiaAcorde }) {
  const t = textosDe("Melodia.visuales.acorde");
  const datos = resolverTecladoAcorde(visual);
  return (
    <TecladoBase
      datos={datos}
      titulo={visual.titulo}
      estatico={visual.estatico}
      nota={t("nota")}
      escuchar={visual.escuchar}
      juntas
      extra={(visibles) =>
        datos && (
          <View style={styles.grados}>
            {datos.notas.map((n, i) => (
              <View key={i} style={[styles.grado, { opacity: i < visibles ? 1 : 0.25, borderColor: i < visibles ? COLOR_MELODIA : BORDE, backgroundColor: i === visibles - 1 ? fondoAcento(16) : SUPERFICIE }]}>
                <Texto v="micro" tam={10}>
                  {t("grado", { grado: datos.grados[i] })}
                </Texto>
                <Texto v="fuerte" tam={14}>
                  {nombreSinOctava(n)}
                </Texto>
                <Texto v="nota" tam={11}>
                  {i === 0 ? t("fundamental") : t("semitonos", { n: datos.semitonos[i] })}
                </Texto>
              </View>
            ))}
          </View>
        )
      }
    />
  );
}

export function PentagramaVisual({ visual }: { visual: VisualMelodiaPentagrama }) {
  const t = textosDe("Melodia.visuales.pentagrama");
  const datos = resolverPentagrama(visual);
  const total = datos?.notas.length ?? 0;
  const r = useReproductor({ total, ms: 1100, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;
  const conEtiquetas = datos.etiquetas.some((e) => e !== "");
  return (
    <Marco acento={COLOR_MELODIA} titulo={visual.titulo} r={r}>
      <View style={{ alignSelf: "center", width: datos.disposicion === "simultanea" ? 240 : "100%" }}>
        <Pentagrama notas={datos.notas} disposicion={datos.disposicion} acento={ACENTO} visibles={r.paso} etiquetas={conEtiquetas ? datos.etiquetas : undefined} destacada={r.paso - 1} />
      </View>
      <Nota texto={t("nota")} />
    </Marco>
  );
}

export function Ritmo({ visual }: { visual: VisualMelodiaRitmo }) {
  const t = textosDe("Melodia.visuales.ritmo");
  const figuras = resolverRitmo(visual);
  const r = useReproductor({ total: figuras.length, ms: 1200, estatico: visual.estatico, inicio: figuras.length > 0 ? 1 : 0 });
  if (figuras.length === 0) return null;
  return (
    <Marco acento={COLOR_MELODIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 6 }}>
        {figuras.map((f, i) => {
          const visible = i < r.paso;
          const actual = i === r.paso - 1;
          return (
            <Aparece key={f.figura} visible opacidad={visible ? 1 : 0.2} ms={300} estilo={[styles.figura, { borderColor: visible ? COLOR_MELODIA : BORDE, backgroundColor: actual ? fondoAcento(14) : SUPERFICIE }]}>
              <View style={{ width: 46, alignItems: "center", transform: [{ scale: 0.7 }] }}>
                <FiguraRitmicaIcono figura={f.figura} acento={ACENTO} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Texto v="fuerte" tam={14}>
                  {NOMBRE_FIGURA[f.figura]}
                </Texto>
                <Texto v="nota" tam={12}>
                  {PULSOS_TEXTO[f.figura].es}
                </Texto>
                <View style={styles.compas}>
                  <View style={{ height: "100%", borderRadius: 5, width: `${(visible ? f.fraccionCompas : 0) * 100}%`, backgroundColor: ACENTO }} />
                </View>
              </View>
            </Aparece>
          );
        })}
      </View>
      <Nota texto={t("nota")} />
    </Marco>
  );
}

export function Frecuencia({ visual }: { visual: VisualMelodiaFrecuencia }) {
  const t = textosDe("Melodia.visuales.frecuencia");
  const filas = resolverFrecuencia(visual);
  const r = useReproductor({ total: filas.length, ms: 1300, estatico: visual.estatico, inicio: filas.length > 0 ? 1 : 0 });
  if (filas.length === 0) return null;
  return (
    <Marco acento={COLOR_MELODIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 4, alignSelf: "center", width: "100%", maxWidth: 320 }}>
        {filas.map((f, i) => {
          const visible = i < r.paso;
          const actual = i === r.paso - 1;
          return (
            <Fragment key={i}>
              {f.razon !== null && (
                <Aparece visible opacidad={visible ? 1 : 0.2} ms={300} estilo={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Svg width={14} height={14} viewBox="0 0 16 16">
                    <Path d="M8 2v11M3.5 9 8 13.5 12.5 9" stroke={ACENTO} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Texto v="fuerte" tam={12} c={ACENTO}>
                    {formatoRazon(f.razon, "es")}
                  </Texto>
                </Aparece>
              )}
              <Aparece visible opacidad={visible ? 1 : 0.2} ms={300} estilo={[styles.fila, { borderColor: visible ? COLOR_MELODIA : BORDE, backgroundColor: actual ? fondoAcento(14) : SUPERFICIE }]}>
                <Texto v="fuerte" tam={16}>
                  {nombreNota(f.nota)}
                </Texto>
                <Texto v="mono" tam={13} c={SECUNDARIO}>
                  {formatoHz(f.hz, "es")}
                </Texto>
              </Aparece>
            </Fragment>
          );
        })}
      </View>
      <Nota texto={t("nota")} />
      {visual.escuchar && <BotonEscuchar notas={filas.map((f) => f.nota)} />}
    </Marco>
  );
}

const styles = StyleSheet.create({
  escuchar: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: ACENTO },
  grados: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  grado: { alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  figura: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 2 },
  compas: { height: 10, borderRadius: 5, backgroundColor: mezcla("#8892B0", 30), overflow: "hidden", marginTop: 3 },
  fila: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2 },
});
