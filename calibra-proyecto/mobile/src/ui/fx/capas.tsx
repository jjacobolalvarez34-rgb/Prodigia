import { useMemo } from "react";
import { Circle, createPicture, Group, LinearGradient, Oval, Path, Picture, RadialGradient, Rect, RoundedRect, Skia, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { crearRecursosParticulas, dibujarParticulas, type Particula } from "./particulas";
import { ADORNOS_CAPSULA } from "@/lib/temas/dibujos";
import { capaVisible } from "@/lib/temas/temas";
import { useTemaHoy } from "~/lib/temporada";

// Capas de efectos para dibujar dentro de un <Canvas> de Skia. Todas reciben
// valores compartidos de Reanimated, así se animan en el hilo de la interfaz.
//
// Rendimiento (2026-10-15, «al abrir cápsulas se traba»): ninguna capa usa
// desenfoques en vivo (BlurMask). Lo suave sale de degradés, que la GPU pinta casi
// gratis, y los brillos se suman con blendMode «plus», como en los juegos.

// ---------- Colores ----------
function canales(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgba(hex: string, a: number): string {
  const [r, g, b] = canales(hex);
  return `rgba(${r},${g},${b},${a})`;
}
// cuanto > 0 aclara hacia blanco; < 0 oscurece hacia negro.
export function tonoHex(hex: string, cuanto: number): string {
  const [r, g, b] = canales(hex).map((v) => Math.round(cuanto >= 0 ? v + (255 - v) * cuanto : v * (1 + cuanto)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Color que cambia con la animación (rgba de 0 a 1, como lo da interpolateColors).
export type ColorVivo = SharedValue<number[]>;

// Degradé de un color con varias opacidades; con color vivo, se recalcula en el hilo de la interfaz.
function useDegrade(color: string, alfas: number[], vivo?: ColorVivo, blancoAlCentro = false) {
  const fijo = useMemo(() => alfas.map((a, i) => (blancoAlCentro && i === 0 ? `rgba(255,255,255,${a})` : rgba(color, a))), [color, alfas, blancoAlCentro]);
  return useDerivedValue(() => {
    if (!vivo) return fijo;
    const c = vivo.value;
    // Como texto rgba: los arreglos tipados no siempre cruzan bien entre hilos.
    const base = `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`;
    return alfas.map((a, i) => (blancoAlCentro && i === 0 ? `rgba(255,255,255,${a})` : `rgba(${base},${a})`));
  });
}

const ALFAS_ANCHOS = [0.7, 0.22, 0];
const ALFAS_FINOS = [0.75, 0.2, 0];
const ALFAS_HALO = [0.95, 0.8, 0.25, 0];

// ---------- Rayos de luz que giran detrás del premio ----------
export function Rayos({ cx, cy, radio, color, colorVivo, opacidad, reloj, escala, cantidad = 12, velocidad = 0.22 }: { cx: number; cy: number; radio: number; color: string; colorVivo?: ColorVivo; opacidad: SharedValue<number>; reloj: SharedValue<number>; escala?: SharedValue<number>; cantidad?: number; velocidad?: number }) {
  const [anchos, finos] = useMemo(() => {
    const hacer = (ancho: number, desfase: number) => {
      const p = Skia.Path.Make();
      for (let i = 0; i < cantidad; i++) {
        const a = (i / cantidad) * Math.PI * 2 + desfase;
        const w = (Math.PI / cantidad) * ancho;
        p.moveTo(0, 0);
        p.lineTo(Math.cos(a - w) * radio, Math.sin(a - w) * radio);
        p.lineTo(Math.cos(a + w) * radio, Math.sin(a + w) * radio);
        p.close();
      }
      return p;
    };
    return [hacer(0.55, 0), hacer(0.14, Math.PI / cantidad)];
  }, [cantidad, radio]);
  const transform = useDerivedValue(() => [{ translateX: cx }, { translateY: cy }, { rotate: (reloj.value / 1000) * velocidad }, { scale: escala ? escala.value : 1 }]);
  const contra = useDerivedValue(() => [{ translateX: cx }, { translateY: cy }, { rotate: -(reloj.value / 1000) * velocidad * 0.6 }, { scale: escala ? escala.value * 0.85 : 0.85 }]);
  const coloresAnchos = useDegrade(color, ALFAS_ANCHOS, colorVivo);
  const coloresFinos = useDegrade(color, ALFAS_FINOS, colorVivo, true);
  return (
    <Group opacity={opacidad} blendMode="plus">
      <Group transform={transform}>
        <Path path={anchos}>
          <RadialGradient c={vec(0, 0)} r={radio} colors={coloresAnchos} positions={[0, 0.42, 1]} />
        </Path>
      </Group>
      <Group transform={contra}>
        <Path path={finos}>
          <RadialGradient c={vec(0, 0)} r={radio} colors={coloresFinos} positions={[0, 0.5, 1]} />
        </Path>
      </Group>
    </Group>
  );
}

// ---------- Halo: resplandor redondo ----------
export function Halo({ cx, cy, radio, color, colorVivo, opacidad, escala }: { cx: number; cy: number; radio: number; color: string; colorVivo?: ColorVivo; opacidad: SharedValue<number>; escala?: SharedValue<number> }) {
  const r = useDerivedValue(() => radio * (escala ? escala.value : 1));
  const colores = useDegrade(color, ALFAS_HALO, colorVivo, true);
  return (
    <Group opacity={opacidad} blendMode="plus">
      <Circle cx={cx} cy={cy} r={r}>
        <RadialGradient c={vec(cx, cy)} r={r} colors={colores} positions={[0, 0.18, 0.55, 1]} />
      </Circle>
    </Group>
  );
}

// ---------- Onda expansiva (avance 0..1) ----------
export function Onda({ cx, cy, desde, hasta, color, avance }: { cx: number; cy: number; desde: number; hasta: number; color: string; avance: SharedValue<number> }) {
  const r = useDerivedValue(() => {
    const p = avance.value;
    return desde + (hasta - desde) * (1 - (1 - p) * (1 - p) * (1 - p));
  });
  const ancho = useDerivedValue(() => 4 + 26 * (1 - avance.value));
  const medio = useDerivedValue(() => 2 + 8 * (1 - avance.value));
  const op = useDerivedValue(() => (avance.value <= 0 || avance.value >= 1 ? 0 : (1 - avance.value) * 0.95));
  const suave = useMemo(() => rgba(color, 0.22), [color]);
  return (
    <Group opacity={op} blendMode="plus">
      <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={ancho} color={suave} />
      <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={medio} color={color} opacity={0.7} />
      <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.9)" />
    </Group>
  );
}

// ---------- Destello de pantalla completa ----------
export function Destello({ ancho, alto, opacidad, color = "#FFFFFF" }: { ancho: number; alto: number; opacidad: SharedValue<number>; color?: string }) {
  return <Rect x={0} y={0} width={ancho} height={alto} color={color} opacity={opacidad} />;
}

// ---------- Partículas: `tiempo` son los segundos desde que salieron (≤ 0 = todavía no) ----------
export function Particulas({ lista, tiempo, cx, cy, ancho, alto, brillo = true }: { lista: Particula[]; tiempo: SharedValue<number>; cx: number; cy: number; ancho: number; alto: number; brillo?: boolean }) {
  // Pinturas y brillos se arman una sola vez por lista, no en cada cuadro.
  const recursos = useMemo(() => crearRecursosParticulas(lista.map((p) => p.color)), [lista]);
  const dibujo = useDerivedValue(() =>
    createPicture(
      (canvas) => {
        if (tiempo.value <= 0) return;
        dibujarParticulas(canvas, lista, tiempo.value, cx, cy, recursos, brillo);
      },
      { width: ancho, height: alto }
    )
  );
  return <Picture picture={dibujo} />;
}

// ---------- La cápsula (dos mitades con volumen, ranura que suelta luz) ----------
// Se dibuja centrada en (0, 0) con `ancho` px de ancho; quien la usa la mueve con
// un <Group transform>. `abierta` 0..1 separa las mitades; `ranura` 0..1 es la luz
// que se escapa por la unión antes de abrirse; `reloj` mueve el reflejo.
const MITAD_ARRIBA = "M20 70 V50 A30 30 0 0 1 80 50 V70 Z";
const MITAD_ABAJO = "M20 70 V90 A30 30 0 0 0 80 90 V70 Z";
const ENTERA = "M20 70 V50 A30 30 0 0 1 80 50 V90 A30 30 0 0 1 20 90 Z";
const EMBLEMA = "M50 30 Q51.4 38.6 60 40 Q51.4 41.4 50 50 Q48.6 41.4 40 40 Q48.6 38.6 50 30 Z";
const BRILLO_VERTICAL = ["rgba(255,255,255,0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0)"];

function Mitad({ d, color, arriba }: { d: string; color: string; arriba: boolean }) {
  const camino = useMemo(() => Skia.Path.MakeFromSVGString(d)!, [d]);
  return (
    <Group>
      {/* Cuerpo con sombreado de cilindro (oscuro en los bordes, brillo a un tercio). */}
      <Path path={camino}>
        <LinearGradient start={vec(20, 0)} end={vec(80, 0)} colors={[tonoHex(color, -0.5), color, tonoHex(color, 0.38), color, tonoHex(color, -0.55)]} positions={[0, 0.26, 0.4, 0.66, 1]} />
      </Path>
      {/* Luz de arriba / sombra de abajo. */}
      <Path path={camino}>
        <LinearGradient start={vec(0, arriba ? 20 : 70)} end={vec(0, arriba ? 70 : 120)} colors={arriba ? ["rgba(255,255,255,0.28)", "rgba(255,255,255,0)"] : ["rgba(0,0,0,0.35)", "rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]} positions={arriba ? [0, 1] : [0, 0.35, 1]} />
      </Path>
      <Path path={camino} style="stroke" strokeWidth={0.8} color="rgba(255,255,255,0.22)" />
      {arriba ? (
        <>
          {/* Reflejo vertical: degradé en vez de desenfoque. */}
          <RoundedRect x={27} y={34} width={8.5} height={30} r={4}>
            <LinearGradient start={vec(27, 0)} end={vec(35.5, 0)} colors={BRILLO_VERTICAL} />
          </RoundedRect>
          <Circle cx={37} cy={29} r={3.2}>
            <RadialGradient c={vec(37, 29)} r={3.2} colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0)"]} />
          </Circle>
          <Path path={EMBLEMA} color="rgba(255,255,255,0.92)" />
        </>
      ) : (
        <>
          <RoundedRect x={27} y={76} width={8.5} height={24} r={4} opacity={0.6}>
            <LinearGradient start={vec(27, 0)} end={vec(35.5, 0)} colors={BRILLO_VERTICAL} />
          </RoundedRect>
          {/* Aro metálico de la unión. */}
          <Rect x={18.5} y={67.6} width={63} height={5}>
            <LinearGradient start={vec(0, 67.6)} end={vec(0, 72.6)} colors={["#E9ECF5", "#8D93A8", "#3B3F52"]} />
          </Rect>
          <Rect x={18.5} y={67.6} width={63} height={1} color="rgba(255,255,255,0.6)" />
        </>
      )}
    </Group>
  );
}

export function CuerpoCapsula({ ancho, colores: coloresBase, abierta, ranura, colorRanura, colorVivo, reloj }: { ancho: number; colores: [string, string]; abierta: SharedValue<number>; ranura: SharedValue<number>; colorRanura: string; colorVivo?: ColorVivo; reloj: SharedValue<number> }) {
  // Festividades (src/lib/temas): la cápsula toma los colores y el adorno de la fecha.
  const tema = useTemaHoy();
  const piel = capaVisible(tema, "capsula") ? tema?.tema.capsula : undefined;
  const colores = piel?.colores ?? coloresBase;
  const adorno = piel ? ADORNOS_CAPSULA[piel.adorno] : null;
  const opAdorno = useDerivedValue(() => Math.max(0, 1 - abierta.value * 3));
  const k = ancho / 60;
  const base = useMemo(() => [{ scale: k }, { translateX: -50 }, { translateY: -70 }], [k]);
  const entera = useMemo(() => Skia.Path.MakeFromSVGString(ENTERA)!, []);
  const arriba = useDerivedValue(() => {
    const a = abierta.value;
    return [{ translateX: -22 * a }, { translateY: -70 * a }, { rotate: -0.6 * a }];
  });
  const abajo = useDerivedValue(() => {
    const a = abierta.value;
    return [{ translateX: 22 * a }, { translateY: 64 * a }, { rotate: 0.55 * a }];
  });
  const opMitades = useDerivedValue(() => (abierta.value < 0.55 ? 1 : Math.max(0, (1 - abierta.value) / 0.45)));
  const opRanura = useDerivedValue(() => ranura.value * (1 - abierta.value));
  // Luz que se escapa por la unión: un óvalo con degradé radial (aplastado en vertical).
  const radioFuga = useDerivedValue(() => 9 + 55 * ranura.value);
  const ovalo = useDerivedValue(() => Skia.XYWHRect(50 - radioFuga.value, 70 - radioFuga.value, radioFuga.value * 2, radioFuga.value * 2));
  const aplastar = useDerivedValue(() => [{ scaleY: 0.12 + 0.1 * ranura.value }]);
  const coloresFuga = useDegrade(colorRanura, ALFAS_HALO, colorVivo, true);
  // Reflejo diagonal que cruza la cápsula cada ~3 s.
  const reflejo = useDerivedValue(() => {
    const ciclo = ((reloj.value / 1000) % 3.2) / 3.2;
    return [{ translateX: -40 + ciclo * 260 }, { rotate: 0.45 }];
  });
  const opReflejo = useDerivedValue(() => 1 - abierta.value);
  return (
    <Group transform={base} origin={vec(0, 0)}>
      <Group opacity={opMitades}>
        <Group transform={abajo} origin={vec(50, 70)}>
          <Mitad d={MITAD_ABAJO} color={colores[1]} arriba={false} />
        </Group>
        <Group transform={arriba} origin={vec(50, 70)}>
          <Mitad d={MITAD_ARRIBA} color={colores[0]} arriba />
        </Group>
      </Group>
      <Group clip={entera} opacity={opReflejo}>
        <Group transform={reflejo} origin={vec(0, 70)}>
          <Rect x={-20} y={0} width={14} height={160}>
            <LinearGradient start={vec(-20, 0)} end={vec(-6, 0)} colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]} />
          </Rect>
        </Group>
      </Group>
      {adorno && (
        <Group opacity={opAdorno}>
          {adorno.map((f, i) => (
            <Path key={i} path={f.d} color={f.relleno ?? f.trazo ?? "#FFFFFF"} style={f.relleno ? "fill" : "stroke"} strokeWidth={f.ancho ?? 1} strokeCap="round" strokeJoin="round" opacity={f.opacidad ?? 1} />
          ))}
        </Group>
      )}
      {/* Luz que se escapa por la unión. */}
      <Group opacity={opRanura} blendMode="plus">
        <Group transform={aplastar} origin={vec(50, 70)}>
          <Oval rect={ovalo}>
            <RadialGradient c={vec(50, 70)} r={radioFuga} colors={coloresFuga} positions={[0, 0.18, 0.55, 1]} />
          </Oval>
        </Group>
        <Rect x={19} y={69.2} width={62} height={1.6} color="#FFFFFF" />
      </Group>
    </Group>
  );
}
