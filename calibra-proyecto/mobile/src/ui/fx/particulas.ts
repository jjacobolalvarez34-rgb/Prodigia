import { BlendMode, PaintStyle, Skia, StrokeCap, TileMode, type SkCanvas, type SkPaint, type SkPath } from "@shopify/react-native-skia";

// Partículas de las celebraciones (cápsulas, premios): cada una sale con una
// velocidad, la frena el aire y la tira la gravedad. La posición se calcula de
// forma exacta para cualquier instante (sin estado por cuadro), así se dibujan
// en el hilo de la interfaz, nítidas, sin importar cuántos cuadros se pierdan.

export type FormaParticula = "estrella" | "confeti" | "punto" | "chispa";

export interface Particula {
  forma: FormaParticula;
  color: string;
  // Velocidad inicial (px/s), frenado del aire (1/s) y gravedad (px/s²).
  vx: number;
  vy: number;
  arrastre: number;
  gravedad: number;
  tam: number;
  giro: number;
  // Segundos de vida y retraso de salida.
  vida: number;
  retraso: number;
  // Origen relativo al centro de la explosión.
  x0: number;
  y0: number;
  // Fase del parpadeo/volteo.
  fase: number;
}

// Pseudoazar con semilla: la misma explosión cada vez (y nada de Math.random en render).
function azar(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface OpcionesExplosion {
  cantidad: number;
  colores: string[];
  velocidad?: number;
  formas?: FormaParticula[];
  gravedad?: number;
  // Abanico: ángulo central (grados, 0 = derecha, -90 = arriba) y apertura.
  angulo?: number;
  apertura?: number;
  vida?: number;
  semilla?: number;
  tam?: number;
  // Radio de salida (las partículas nacen en un anillo, no en un punto).
  radioSalida?: number;
}

export function crearExplosion(o: OpcionesExplosion): Particula[] {
  const r = azar(o.semilla ?? 7);
  const formas = o.formas ?? ["estrella", "confeti", "punto", "chispa"];
  const centro = ((o.angulo ?? 0) * Math.PI) / 180;
  const apertura = ((o.apertura ?? 360) * Math.PI) / 180;
  return Array.from({ length: o.cantidad }, (_, i) => {
    const ang = apertura >= Math.PI * 2 - 1e-6 ? (i / o.cantidad) * Math.PI * 2 + r() * 0.5 : centro + (r() - 0.5) * apertura;
    const vel = (o.velocidad ?? 520) * (0.45 + r() * 0.75);
    const forma = formas[Math.floor(r() * formas.length)];
    const rs = (o.radioSalida ?? 0) * (0.6 + r() * 0.4);
    return {
      forma,
      color: o.colores[Math.floor(r() * o.colores.length)],
      vx: Math.cos(ang) * vel,
      vy: Math.sin(ang) * vel,
      arrastre: forma === "confeti" ? 2.6 : 2 + r() * 1.4,
      gravedad: (o.gravedad ?? 420) * (forma === "confeti" ? 0.55 : forma === "punto" ? 0.25 : 1),
      tam: (o.tam ?? 7) * (forma === "punto" ? 0.6 + r() * 0.8 : 0.7 + r() * 0.7),
      giro: (r() - 0.5) * 720,
      vida: (o.vida ?? 1.6) * (0.7 + r() * 0.6),
      retraso: r() * 0.08,
      x0: Math.cos(ang) * rs,
      y0: Math.sin(ang) * rs,
      fase: r() * Math.PI * 2,
    };
  });
}

// Lluvia de confeti desde arriba (premios legendarios).
export function crearLluvia(ancho: number, cantidad: number, colores: string[], semilla = 11): Particula[] {
  const r = azar(semilla);
  return Array.from({ length: cantidad }, () => ({
    forma: r() < 0.75 ? "confeti" : "estrella",
    color: colores[Math.floor(r() * colores.length)],
    vx: (r() - 0.5) * 60,
    vy: 40 + r() * 120,
    arrastre: 0.9,
    gravedad: 160,
    tam: 6 + r() * 5,
    giro: (r() - 0.5) * 540,
    vida: 2.6 + r() * 1.4,
    retraso: r() * 1.4,
    x0: (r() - 0.5) * ancho,
    y0: -60 - r() * 200,
    fase: r() * Math.PI * 2,
  }));
}

// Estrella de 4 puntas de radio 1 (se escala al dibujar).
function estrella(): SkPath {
  const p = Skia.Path.Make();
  const a = 1;
  const b = 0.28;
  p.moveTo(0, -a);
  p.quadTo(b * 0.35, -b * 0.35, b, 0);
  p.lineTo(a, 0);
  p.quadTo(b * 0.35, b * 0.35, 0, b);
  p.lineTo(0, a);
  p.quadTo(-b * 0.35, b * 0.35, -b, 0);
  p.lineTo(-a, 0);
  p.quadTo(-b * 0.35, -b * 0.35, 0, -b);
  p.close();
  return p;
}

function canal(hex: string, i: number): number {
  return parseInt(hex.replace("#", "").slice(i * 2, i * 2 + 2), 16) / 255;
}

// Lo que se reusa en cada cuadro (rendimiento, 2026-10-15): la forma de la estrella,
// una pintura y, por color, un brillo ya armado con un degradé radial. Antes cada
// partícula llevaba un desenfoque calculado en vivo (MaskFilter), lo más caro que hay
// en un teléfono: así lo hacen los juegos, con el brillo «horneado» de antemano.
export interface RecursosParticulas {
  estrella: SkPath;
  pintura: SkPaint;
  halos: Record<string, SkPaint>;
}

export function crearRecursosParticulas(colores: string[]): RecursosParticulas {
  const pintura = Skia.Paint();
  pintura.setAntiAlias(true);
  const halos: Record<string, SkPaint> = {};
  for (const c of new Set([...colores, "#FFFFFF"])) {
    const [r, g, b] = [canal(c, 0), canal(c, 1), canal(c, 2)];
    const h = Skia.Paint();
    h.setAntiAlias(true);
    h.setBlendMode(BlendMode.Plus);
    h.setShader(
      Skia.Shader.MakeRadialGradient(
        Skia.Point(0, 0),
        1,
        [Skia.Color([r, g, b, 0.85]), Skia.Color([r, g, b, 0.3]), Skia.Color([r, g, b, 0])],
        [0, 0.38, 1],
        TileMode.Clamp
      )
    );
    halos[c] = h;
  }
  return { estrella: estrella(), pintura, halos };
}

// Dibuja las partículas `t` segundos después de salir desde (cx, cy).
export function dibujarParticulas(canvas: SkCanvas, lista: Particula[], t: number, cx: number, cy: number, recursos: RecursosParticulas, brillo = true) {
  "worklet";
  if (t <= 0) return;
  const forma = recursos.estrella;
  const pintura = recursos.pintura;
  for (let i = 0; i < lista.length; i++) {
    const p = lista[i];
    const s = t - p.retraso;
    if (s <= 0 || s >= p.vida) continue;
    const e = 1 - Math.exp(-p.arrastre * s);
    const vt = p.gravedad / p.arrastre;
    const x = cx + p.x0 + (p.vx / p.arrastre) * e;
    const y = cy + p.y0 + vt * s + ((p.vy - vt) / p.arrastre) * e;
    const vida = s / p.vida;
    // Aparece de golpe y se apaga en el último 35 %.
    const alfa = vida < 0.65 ? 1 : Math.max(0, (1 - vida) / 0.35);
    const ang = p.giro * s;
    const halo = recursos.halos[p.color];
    pintura.setColor(Skia.Color(p.color));
    pintura.setAlphaf(alfa);
    canvas.save();
    canvas.translate(x, y);
    if (p.forma === "punto") {
      const titila = 0.75 + 0.25 * Math.sin(s * 18 + p.fase);
      if (brillo && halo) {
        const rh = p.tam * 1.8 + 8;
        halo.setAlphaf(alfa * 0.9);
        canvas.save();
        canvas.scale(rh, rh);
        canvas.drawCircle(0, 0, 1, halo);
        canvas.restore();
      }
      pintura.setColor(Skia.Color("#FFFFFF"));
      pintura.setAlphaf(alfa * titila);
      canvas.drawCircle(0, 0, p.tam * 0.55, pintura);
    } else if (p.forma === "estrella") {
      const tam = p.tam * (0.9 + 0.3 * Math.sin(s * 14 + p.fase));
      if (brillo && halo) {
        const rh = tam * 1.3 + 8;
        halo.setAlphaf(alfa * 0.8);
        canvas.save();
        canvas.scale(rh, rh);
        canvas.drawCircle(0, 0, 1, halo);
        canvas.restore();
      }
      canvas.rotate(ang * 0.4, 0, 0);
      canvas.scale(tam, tam);
      canvas.drawPath(forma, pintura);
    } else if (p.forma === "confeti") {
      // Papelito que da vueltas: se aplana y se ensancha (volteo 3D falso).
      canvas.rotate(ang, 0, 0);
      canvas.scale(1, Math.cos(s * 9 + p.fase));
      canvas.drawRect(Skia.XYWHRect(-p.tam * 0.5, -p.tam * 0.3, p.tam, p.tam * 0.6), pintura);
    } else {
      // Chispa: rayita en la dirección del movimiento.
      const vx = p.vx * Math.exp(-p.arrastre * s);
      const vy = (p.vy - vt) * Math.exp(-p.arrastre * s) + vt;
      const largo = Math.min(26, Math.hypot(vx, vy) * 0.035 + 3);
      const a = Math.atan2(vy, vx);
      pintura.setStrokeWidth(Math.max(1.2, p.tam * 0.32));
      pintura.setStrokeCap(StrokeCap.Round);
      pintura.setStyle(PaintStyle.Stroke);
      canvas.drawLine(0, 0, -Math.cos(a) * largo, -Math.sin(a) * largo, pintura);
      pintura.setStyle(PaintStyle.Fill);
    }
    canvas.restore();
  }
}
