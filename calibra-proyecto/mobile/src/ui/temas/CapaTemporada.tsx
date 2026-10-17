import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, createPicture, Picture, Skia, useClock, type SkImage } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { PARTICULAS, PASANTES } from "@/lib/temas/dibujos";
import { svgDeDibujo } from "@/lib/temas/svg";
import { capaVisible } from "@/lib/temas/temas";
import { useLiviano } from "~/lib/rendimiento";
import { useTemaHoy } from "~/lib/temporada";

// Ambiente de la festividad en la app (igual que la web, docs/eventos/PLAN_FESTIVIDADES.md
// capas 1 y 3): copos, hojas, corazones… que caen o suben suaves por encima de todo, y
// cada ~45 s algo que cruza arriba (trineo, bruja, dragón). Todo se calcula con el
// reloj en el hilo de la interfaz (sin estado por cuadro) y los dibujos se convierten
// una sola vez en imágenes. No recibe toques. _layout no la monta dentro de partidas.

function aImagen(svg: string): SkImage | null {
  const s = Skia.SVG.MakeFromString(svg);
  if (!s) return null;
  const w = Math.max(1, Math.round(s.width()));
  const h = Math.max(1, Math.round(s.height()));
  const superficie = Skia.Surface.Make(w, h);
  if (!superficie) return null;
  superficie.getCanvas().drawSvg(s, w, h);
  return superficie.makeImageSnapshot();
}

const CICLO_PASANTE = 45;
const CRUCE = 9;

export default function CapaTemporada() {
  const tema = useTemaHoy();
  const visible = !!tema && capaVisible(tema, "ambiente") && !!tema.tema.particulas;
  if (!visible || !tema) return null;
  return <Lienzo clave={tema.tema.id} conPasante={capaVisible(tema, "pasante")} />;
}

function Lienzo({ clave, conPasante }: { clave: string; conPasante: boolean }) {
  const { width: W, height: H } = useWindowDimensions();
  const liviano = useLiviano();
  const reloj = useClock();
  const tema = useTemaHoy();

  const datos = useMemo(() => {
    const t = tema?.tema;
    const spec = t?.particulas;
    if (!t || !spec) return null;
    const imgs = spec.colores.map((c) => aImagen(svgDeDibujo(PARTICULAS[spec.tipo], c, 2))).filter((x): x is SkImage => !!x);
    const pasante = conPasante && t.pasante ? aImagen(svgDeDibujo(PASANTES[t.pasante], undefined, 3)) : null;
    let s = 7;
    const azar = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const cantidad = Math.round(spec.cantidad * (liviano ? 0.5 : 0.75));
    const particulas = Array.from({ length: cantidad }, () => ({
      x: azar() * W,
      y0: azar() * (H + 60),
      v: (spec.movimiento === "flota" ? 8 : 26) + azar() * 30,
      tam: 12 + azar() * 12,
      fase: azar() * Math.PI * 2,
      vGiro: (azar() - 0.5) * 70,
      op: 0.45 + azar() * 0.4,
      img: Math.floor(azar() * Math.max(1, imgs.length)),
    }));
    const pintura = Skia.Paint();
    return { imgs, pasante, particulas, pintura, movimiento: spec.movimiento, gira: spec.tipo !== "farol" && spec.tipo !== "linterna" };
    // La clave (el tema) decide cuándo rearmar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, conPasante, W, H, liviano]);

  const dibujo = useDerivedValue(() => {
    const t = reloj.value / 1000;
    return createPicture((canvas) => {
      if (!datos || datos.imgs.length === 0) return;
      const largo = H + 60;
      for (let i = 0; i < datos.particulas.length; i++) {
        const p = datos.particulas[i];
        let x = p.x;
        let y = 0;
        if (datos.movimiento === "cae") {
          y = ((p.y0 + p.v * t) % largo) - 30;
          x += Math.sin(t * 0.9 + p.fase) * 14;
        } else if (datos.movimiento === "sube") {
          y = H + 30 - ((p.y0 + p.v * t) % largo);
          x += Math.sin(t * 0.7 + p.fase) * 10;
        } else {
          x += Math.cos(t * 0.3 + p.fase) * 40;
          y = (p.y0 % H) + Math.sin(t * 0.4 + p.fase) * 30;
        }
        const img = datos.imgs[p.img % datos.imgs.length];
        datos.pintura.setAlphaf(p.op);
        canvas.save();
        canvas.translate(x, y);
        if (datos.gira) canvas.rotate(t * p.vGiro + p.fase * 57, 0, 0);
        canvas.drawImageRect(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(-p.tam / 2, -p.tam / 2, p.tam, p.tam), datos.pintura);
        canvas.restore();
      }
      // Lo que cruza el cielo: 9 s de cada 45, alternando el lado.
      if (datos.pasante) {
        const ciclo = Math.floor(t / CICLO_PASANTE);
        const enCiclo = t - ciclo * CICLO_PASANTE - 12;
        if (enCiclo > 0 && enCiclo < CRUCE) {
          const img = datos.pasante;
          const ancho = Math.min(220, W * 0.5);
          const alto = (ancho * img.height()) / img.width();
          const avance = enCiclo / CRUCE;
          const derecha = ciclo % 2 === 0;
          const x = derecha ? -ancho + avance * (W + ancho * 2) : W + ancho - avance * (W + ancho * 2);
          const y = H * (0.1 + 0.06 * Math.sin(ciclo * 1.7)) + Math.sin(t * 1.6) * 6;
          datos.pintura.setAlphaf(0.95);
          canvas.save();
          canvas.translate(x, y);
          if (!derecha) canvas.scale(-1, 1);
          canvas.drawImageRect(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(-ancho / 2, -alto / 2, ancho, alto), datos.pintura);
          canvas.restore();
        }
      }
    });
  });

  return (
    <Canvas style={[StyleSheet.absoluteFill, { zIndex: 90, elevation: 90 }]} pointerEvents="none">
      <Picture picture={dibujo} />
    </Canvas>
  );
}
