import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { BlendMode, Canvas, createPicture, PaintStyle, Picture, Skia, StrokeCap, TileMode, useClock } from "@shopify/react-native-skia";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withTiming, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { CAMINO_CHISPA, CINE, COLORES_CINE as C, crearEstallidoCine, crearEstrellasCine, muestrearCinematica } from "@/lib/fx/cinematicaPro";
import { precargarSonidos, sonar, vibrar } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { fuente } from "~/tema";
import Texto from "./Texto";

// Cinemática de Prodigia Pro en la app (2026-10-15), la misma línea de tiempo que la
// web (src/lib/fx/cinematicaPro.ts): hiperespacio, el logo llega, se carga de poder,
// estalla y aparece «PRODIGIA PRO». Todo se dibuja en el hilo de la interfaz con Skia,
// desde la línea de tiempo ya muestreada; los brillos son degradés armados una vez
// (sin desenfoques en vivo). Un toque la salta.

function canal(hex: string, i: number) {
  return parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
}

function brillo(color: string) {
  const [r, g, b] = [canal(color, 0), canal(color, 1), canal(color, 2)];
  const p = Skia.Paint();
  p.setAntiAlias(true);
  p.setBlendMode(BlendMode.Plus);
  p.setShader(Skia.Shader.MakeRadialGradient(Skia.Point(0, 0), 1, [Skia.Color([1, 1, 1, 1]), Skia.Color([r, g, b, 0.94]), Skia.Color([r, g, b, 0.3]), Skia.Color([r, g, b, 0])], [0, 0.15, 0.45, 1], TileMode.Clamp));
  return p;
}

export default function CinematicaPro({ onTerminar }: { onTerminar: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const liviano = useLiviano();
  const reloj = useClock();

  // Todo lo que se arma una vez: la línea de tiempo muestreada, estrellas, partículas y pinturas.
  const datos = useMemo(() => {
    const m = muestrearCinematica();
    const estrellas = crearEstrellasCine(liviano ? 90 : 150);
    const estallido = crearEstallidoCine(liviano ? 70 : 120);
    const brillos: Record<string, ReturnType<typeof Skia.Paint>> = { [C.oro]: brillo(C.oro), [C.cian]: brillo(C.cian), [C.violetaClaro]: brillo(C.violetaClaro), [C.violeta]: brillo(C.violeta), "#FFFFFF": brillo("#FFFFFF") };
    const trazo = Skia.Paint();
    trazo.setAntiAlias(true);
    trazo.setStyle(PaintStyle.Stroke);
    trazo.setStrokeCap(StrokeCap.Round);
    const anillo = Skia.Paint();
    anillo.setAntiAlias(true);
    anillo.setStyle(PaintStyle.Stroke);
    anillo.setBlendMode(BlendMode.Plus);
    const logo = Skia.Path.MakeFromSVGString(CAMINO_CHISPA)!;
    const pinturaLogo = Skia.Paint();
    pinturaLogo.setAntiAlias(true);
    pinturaLogo.setShader(Skia.Shader.MakeLinearGradient(Skia.Point(0, 0), Skia.Point(24, 24), [Skia.Color(C.violetaClaro), Skia.Color(C.arena), Skia.Color(C.oro)], [0, 0.5, 1], TileMode.Clamp));
    // Rayos: abanico de radio 1 con degradé, se escala y gira al dibujarlo.
    const rayos = Skia.Path.Make();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const ancho = i % 2 ? 0.05 : 0.11;
      rayos.moveTo(0, 0);
      rayos.lineTo(Math.cos(a - ancho), Math.sin(a - ancho));
      rayos.lineTo(Math.cos(a + ancho), Math.sin(a + ancho));
      rayos.close();
    }
    const pinturaRayos = Skia.Paint();
    pinturaRayos.setAntiAlias(true);
    pinturaRayos.setBlendMode(BlendMode.Plus);
    pinturaRayos.setShader(Skia.Shader.MakeRadialGradient(Skia.Point(0, 0), 1, [Skia.Color("rgba(255,197,61,0.44)"), Skia.Color("rgba(124,92,255,0.15)"), Skia.Color("rgba(124,92,255,0)")], [0, 0.4, 1], TileMode.Clamp));
    const filo = Skia.Paint();
    filo.setAntiAlias(true);
    filo.setStyle(PaintStyle.Stroke);
    filo.setStrokeWidth(0.45);
    filo.setColor(Skia.Color("rgba(255,255,255,0.7)"));
    const blanco = Skia.Paint();
    blanco.setColor(Skia.Color("#FFFFFF"));
    return { m, estrellas, estallido, brillos, trazo, anillo, logo, pinturaLogo, filo, rayos, pinturaRayos, blanco };
  }, [liviano]);

  const dibujo = useDerivedValue(() => {
    const t = reloj.value / 1000;
    const d = datos;
    const m = d.m;
    // Interpolación en la tabla muestreada.
    const x = Math.max(0, t) / m.paso;
    const i0 = Math.min(m.destello.length - 1, Math.floor(x));
    const i1 = Math.min(m.destello.length - 1, i0 + 1);
    const f = x - Math.floor(x);
    const en = (a: number[]) => a[i0] + (a[i1] - a[i0]) * f;
    return createPicture((canvas) => {
      const cx = W / 2;
      const cy = H * 0.42;
      const lado = Math.min(W, H);
      canvas.drawColor(Skia.Color(C.fondo));

      // Hiperespacio.
      const D = en(m.recorrido);
      const v = Math.max(0, (m.recorrido[i1] - m.recorrido[i0]) / m.paso);
      const largo = 0.015 + 0.03 * Math.min(3, v);
      const R = Math.max(W, H) * 0.2;
      const entrada = Math.min(1, t * 2);
      for (let k = 0; k < d.estrellas.length; k++) {
        const e = d.estrellas[k];
        let z = (e.z - D * 0.32) % 1;
        if (z <= 0) z += 1;
        const dd = 0.04 + z * 0.96;
        const d2 = Math.min(1, dd + largo);
        const cerca = 1 - dd;
        d.trazo.setColor(Skia.Color(e.tono < 0.12 ? C.cian : e.tono < 0.24 ? C.violetaClaro : "#FFFFFF"));
        d.trazo.setAlphaf(Math.min(1, 0.15 + cerca * cerca * 1.1) * entrada);
        d.trazo.setStrokeWidth(0.6 + cerca * 2.2);
        canvas.drawLine(cx + (e.x / d2) * R, cy + (e.y / d2) * R, cx + (e.x / dd) * R, cy + (e.y / dd) * R, d.trazo);
      }

      const lx = cx + en(m.logoX) * lado;
      const ly = cy + en(m.logoY) * lado;
      const tam = lado * 0.3 * en(m.logoEscala);
      const opLogo = en(m.logoOpacidad);
      const brilloLogo = en(m.logoBrillo);

      // Rayos.
      const opRayos = en(m.rayos);
      if (opRayos > 0.01) {
        const lr = Math.max(W, H) * 0.75;
        d.pinturaRayos.setAlphaf(opRayos);
        canvas.save();
        canvas.translate(lx, ly);
        canvas.rotate(t * 14, 0, 0);
        canvas.scale(lr, lr);
        canvas.drawPath(d.rayos, d.pinturaRayos);
        canvas.restore();
      }

      // Brillo del logo.
      if (opLogo > 0.01) {
        const rg = tam * (1.1 + brilloLogo * 0.9);
        d.brillos[C.violeta].setAlphaf(opLogo * Math.min(1, 0.35 + brilloLogo * 0.5));
        canvas.save();
        canvas.translate(lx, ly);
        canvas.scale(rg, rg);
        canvas.drawCircle(0, 0, 1, d.brillos[C.violeta]);
        canvas.restore();
        d.brillos[C.oro].setAlphaf(opLogo * Math.min(1, brilloLogo * 0.55));
        canvas.save();
        canvas.translate(lx, ly);
        canvas.scale(rg * 0.7, rg * 0.7);
        canvas.drawCircle(0, 0, 1, d.brillos[C.oro]);
        canvas.restore();
      }

      // Anillos de energía.
      const coloresAnillo = [C.oro, C.cian, C.violetaClaro];
      for (let k = 0; k < 3; k++) {
        const o = en(m.anilloOpacidad[k]);
        if (o <= 0.001) continue;
        const r = lado * 0.6 * en(m.anilloRadio[k]) + tam * 0.35;
        d.anillo.setColor(Skia.Color(coloresAnillo[k]));
        d.anillo.setAlphaf(o * 0.22);
        d.anillo.setStrokeWidth(14);
        canvas.drawCircle(lx, ly, r, d.anillo);
        d.anillo.setAlphaf(o);
        d.anillo.setStrokeWidth(2.5);
        canvas.drawCircle(lx, ly, r, d.anillo);
      }

      // Chispas en espiral durante la carga.
      for (let k = 0; k < 40; k++) {
        const desde = CINE.cargaDesde + (k / 40) * 1.1;
        const p = Math.min(1, Math.max(0, (t - desde) / 0.55));
        if (p <= 0 || p >= 1) continue;
        const rr = lado * 0.5 * Math.pow(1 - p, 1.4);
        const ang = k * 2.39996 + p * 4.5;
        const s = 10 + (1 - p) * 8;
        const pin = d.brillos[coloresAnillo[k % 3]];
        pin.setAlphaf(Math.sin(p * Math.PI));
        canvas.save();
        canvas.translate(lx + Math.cos(ang) * rr, ly + Math.sin(ang) * rr);
        canvas.scale(s, s);
        canvas.drawCircle(0, 0, 1, pin);
        canvas.restore();
      }

      // Estallido: partículas y onda.
      const tb = t - CINE.estallido;
      if (tb > 0) {
        for (let k = 0; k < d.estallido.length; k++) {
          const p = d.estallido[k];
          if (tb > p.vida) continue;
          const dist = (p.v * (1 - Math.exp(-2.4 * tb))) / 2.4;
          const s = p.tam * 4;
          const pin = d.brillos[p.color];
          pin.setAlphaf(1 - tb / p.vida);
          canvas.save();
          canvas.translate(lx + Math.cos(p.a) * dist, ly + Math.sin(p.a) * dist + 60 * tb * tb);
          canvas.scale(s, s);
          canvas.drawCircle(0, 0, 1, pin);
          canvas.restore();
        }
        const o = en(m.onda);
        if (o > 0 && o < 1) {
          const r = lado * 0.08 + o * Math.max(W, H) * 0.75;
          d.anillo.setColor(Skia.Color("#FFFFFF"));
          d.anillo.setAlphaf((1 - o) * 0.25);
          d.anillo.setStrokeWidth(30 * (1 - o) + 4);
          canvas.drawCircle(lx, ly, r, d.anillo);
          d.anillo.setColor(Skia.Color(C.oro));
          d.anillo.setAlphaf(1 - o);
          d.anillo.setStrokeWidth(2);
          canvas.drawCircle(lx, ly, r, d.anillo);
        }
      }

      // El logo.
      if (opLogo > 0.01) {
        d.pinturaLogo.setAlphaf(opLogo);
        canvas.save();
        canvas.translate(lx, ly);
        canvas.rotate((en(m.logoGiro) * 180) / Math.PI, 0, 0);
        canvas.scale(tam / 24, tam / 24);
        canvas.translate(-12, -12);
        canvas.drawPath(d.logo, d.pinturaLogo);
        d.filo.setAlphaf(opLogo * 0.7);
        canvas.drawPath(d.logo, d.filo);
        canvas.restore();
      }

      // Destello.
      const fl = en(m.destello);
      if (fl > 0.01) {
        d.blanco.setAlphaf(fl * 0.92);
        canvas.drawRect(Skia.XYWHRect(0, 0, W, H), d.blanco);
      }
    });
  });

  // Brillo que recorre «PRO».
  const barrido = useSharedValue(-1);
  const estiloBarrido = useAnimatedStyle(() => ({ transform: [{ translateX: barrido.value * 160 }] }));

  useEffect(() => {
    precargarSonidos(["swoosh", "acierto_cristal1", "acierto_cristal3", "acierto_cristal5", "victoria"]);
    const timers = [
      setTimeout(() => sonar("swoosh"), 200),
      ...[0, 1, 2].map((k) => setTimeout(() => sonar((["acierto_cristal1", "acierto_cristal3", "acierto_cristal5"] as const)[k]), (CINE.cargaDesde + k * 0.38) * 1000)),
      setTimeout(() => {
        sonar("victoria");
        vibrar.exito();
      }, CINE.estallido * 1000),
      setTimeout(onTerminar, (CINE.fin + 0.6) * 1000),
    ];
    barrido.set(withDelay((CINE.brilloTitulo - 0.1) * 1000, withTiming(1.2, { duration: 700, easing: Easing.inOut(Easing.quad) })));
    return () => timers.forEach(clearTimeout);
    // Solo al montar: la cinemática corre una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.capa}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onTerminar} accessibilityRole="button" accessibilityLabel="Saltar la animación">
        <Canvas style={StyleSheet.absoluteFill}>
          <Picture picture={dibujo} />
        </Canvas>
        <View style={[styles.titulo, { top: H * 0.56 }]} pointerEvents="none">
          <Animated.View entering={FadeInDown.delay(CINE.tituloDesde * 1000).duration(900)}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 46, letterSpacing: 8, color: "#FFFFFF", textShadowColor: C.violeta, textShadowRadius: 24 }}>PRODIGIA</Texto>
          </Animated.View>
          <Animated.View entering={ZoomIn.delay((CINE.tituloDesde + 0.35) * 1000).springify().damping(10).stiffness(180)} style={styles.pro}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 30, letterSpacing: 9, color: "#1A1206" }}>PRO</Texto>
            <Animated.View style={[styles.barrido, estiloBarrido]}>
              <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, backgroundColor: C.fondo, zIndex: 140, elevation: 140 },
  titulo: { position: "absolute", left: 0, right: 0, alignItems: "center", gap: 10 },
  pro: { overflow: "hidden", paddingHorizontal: 22, paddingVertical: 4, borderRadius: 16, borderWidth: 2, borderColor: "#05060F", backgroundColor: C.oro, boxShadow: "4px 4px 0px #05060F" },
  barrido: { position: "absolute", top: 0, bottom: 0, left: 0, width: 50, transform: [{ rotate: "15deg" }] },
});
