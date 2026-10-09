import { useMemo } from "react";
import { BlurMask, Circle, createPicture, Group, LinearGradient, Oval, Path, Picture, RadialGradient, Rect, RoundedRect, Skia, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { dibujarParticulas, type Particula } from "./particulas";

// Capas de efectos para dibujar dentro de un <Canvas> de Skia. Todas reciben
// valores compartidos de Reanimated, así se animan en el hilo de la interfaz.

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

// ---------- Rayos de luz que giran detrás del premio ----------
export function Rayos({ cx, cy, radio, color, opacidad, reloj, escala, cantidad = 12, velocidad = 0.22 }: { cx: number; cy: number; radio: number; color: string; opacidad: SharedValue<number>; reloj: SharedValue<number>; escala?: SharedValue<number>; cantidad?: number; velocidad?: number }) {
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
  return (
    <Group opacity={opacidad} blendMode="plus">
      <Group transform={transform}>
        <Path path={anchos}>
          <RadialGradient c={vec(0, 0)} r={radio} colors={[rgba(color, 0.75), rgba(color, 0.25), rgba(color, 0)]} positions={[0, 0.45, 1]} />
          <BlurMask blur={8} style="normal" />
        </Path>
      </Group>
      <Group transform={contra}>
        <Path path={finos}>
          <RadialGradient c={vec(0, 0)} r={radio} colors={["rgba(255,255,255,0.7)", rgba(color, 0.2), rgba(color, 0)]} positions={[0, 0.5, 1]} />
          <BlurMask blur={3} style="normal" />
        </Path>
      </Group>
    </Group>
  );
}

// ---------- Halo: resplandor redondo ----------
export function Halo({ cx, cy, radio, color, opacidad, escala }: { cx: number; cy: number; radio: number; color: string; opacidad: SharedValue<number>; escala?: SharedValue<number> }) {
  const r = useDerivedValue(() => radio * (escala ? escala.value : 1));
  return (
    <Group opacity={opacidad} blendMode="plus">
      <Circle cx={cx} cy={cy} r={r}>
        <RadialGradient c={vec(cx, cy)} r={r} colors={["rgba(255,255,255,0.95)", rgba(color, 0.8), rgba(color, 0.25), rgba(color, 0)]} positions={[0, 0.18, 0.55, 1]} />
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
  const ancho = useDerivedValue(() => 2 + 16 * (1 - avance.value));
  const op = useDerivedValue(() => (avance.value <= 0 || avance.value >= 1 ? 0 : (1 - avance.value) * 0.95));
  return (
    <Group opacity={op} blendMode="plus">
      <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={ancho} color={color}>
        <BlurMask blur={5} style="solid" />
      </Circle>
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
  const dibujo = useDerivedValue(() =>
    createPicture(
      (canvas) => {
        if (tiempo.value <= 0) return;
        dibujarParticulas(canvas, lista, tiempo.value, cx, cy, brillo);
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
          <RoundedRect x={28.5} y={34} width={5.5} height={30} r={2.75} color="rgba(255,255,255,0.55)">
            <BlurMask blur={1.4} style="normal" />
          </RoundedRect>
          <Circle cx={37} cy={29} r={2.2} color="rgba(255,255,255,0.85)">
            <BlurMask blur={0.8} style="normal" />
          </Circle>
          <Path path={EMBLEMA} color="rgba(255,255,255,0.92)" />
        </>
      ) : (
        <>
          <RoundedRect x={28.5} y={76} width={5.5} height={24} r={2.75} color="rgba(255,255,255,0.32)">
            <BlurMask blur={1.4} style="normal" />
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

export function CuerpoCapsula({ ancho, colores, abierta, ranura, colorRanura, reloj }: { ancho: number; colores: [string, string]; abierta: SharedValue<number>; ranura: SharedValue<number>; colorRanura: string; reloj: SharedValue<number> }) {
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
  const anchoFuga = useDerivedValue(() => 18 + 110 * ranura.value);
  const ovalo = useDerivedValue(() => Skia.XYWHRect(50 - anchoFuga.value / 2, 70 - (2 + 6 * ranura.value), anchoFuga.value, 4 + 12 * ranura.value));
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
      {/* Luz que se escapa por la unión. */}
      <Group opacity={opRanura} blendMode="plus">
        <Oval rect={ovalo} color={colorRanura}>
          <BlurMask blur={6} style="normal" />
        </Oval>
        <Rect x={19} y={69} width={62} height={2.2} color="#FFFFFF">
          <BlurMask blur={1.2} style="solid" />
        </Rect>
      </Group>
    </Group>
  );
}
