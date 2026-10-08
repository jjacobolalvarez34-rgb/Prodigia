// Escenas animadas de las lecciones de Dinamia (src/lib/dibujo/escena.ts). Todo
// lo que se ve sale de las fórmulas a partir de los datos del visual; la web y la
// app las pintan igual. Gravedad 10 m/s² salvo que el visual diga otra.
import { esNum, lerp, limitar, num, ruido, suave, type Escena } from "@/lib/dibujo/escena";
import { barra, bloque, flecha, reglaHorizontal, texto } from "@/lib/dibujo/formas";
import { pasoLindo, r, type Dibujo, type Primitiva } from "@/lib/dibujo/primitivas";
import type {
  VisualDinamia,
  VisualDinamiaCaida,
  VisualDinamiaChoque,
  VisualDinamiaCiclo,
  VisualDinamiaCircular,
  VisualDinamiaCuerpoLibre,
  VisualDinamiaEnergia,
  VisualDinamiaFluido,
  VisualDinamiaGrafica,
  VisualDinamiaParabola,
  VisualDinamiaParticulas,
  VisualDinamiaPoleas,
  VisualDinamiaTermometro,
  VisualDinamiaTrayecto,
  VisualDinamiaTubo,
  VisualDinamiaVectores,
} from "./visuales";

const G = 10;
const AZUL = "#60A5FA";
const NARANJA = "#F59E0B";
const VERDE = "#34D399";
const ROJO = "#F87171";
const VIOLETA = "#A78BFA";
const ROSA = "#F472B6";

const SEN: Record<number, number> = { 30: 0.5, 45: 0.71, 60: 0.87 };
const COS: Record<number, number> = { 30: 0.87, 45: 0.71, 60: 0.5 };

// Tiempo continuo de la animación: en el paso p, con avance t, vale p − 1 + t.
const tau = (paso: number, t: number) => (paso <= 0 ? 0 : paso - 1 + t);
const dib = (ancho: number, alto: number, prims: Primitiva[]): Dibujo => ({ ancho, alto, prims });

// ---------- 1) Trayecto (MRU / MRUA) ----------
function trayecto(v: VisualDinamiaTrayecto): Escena | null {
  if (!esNum(v.v0, 0, 100) || !esNum(v.a, -20, 20) || !esNum(v.segundos, 1, 8)) return null;
  const n = Math.round(v.segundos);
  const x = (s: number) => v.v0 * s + 0.5 * v.a * s * s;
  const vel = (s: number) => v.v0 + v.a * s;
  const xMax = Math.max(1, ...Array.from({ length: n + 1 }, (_, k) => x(k)));
  const vMax = Math.max(1, ...Array.from({ length: n + 1 }, (_, k) => Math.abs(vel(k))));
  const X0 = 20;
  const X1 = 262;
  const px = (m: number) => X0 + ((X1 - X0) * m) / xMax;
  return {
    pasos: n,
    ms: 1300,
    dibujar: (paso, t) => {
      const s = tau(paso, t);
      const prims: Primitiva[] = [{ t: "linea", x1: 10, y1: 102, x2: 300, y2: 102, stroke: "texto2", sw: 2 }];
      prims.push(...reglaHorizontal(X0, X1, 140, xMax, pasoLindo(xMax, 5), "m"));
      // Una marca por segundo sobre el camino; el rótulo se omite si quedaría encima del anterior.
      let ultimo = -Infinity;
      for (let k = 0; k <= Math.floor(s + 1e-9); k++) {
        const mx = px(x(k));
        prims.push({ t: "circulo", cx: r(mx), cy: 102, r: 3.5, fill: NARANJA });
        if (mx - ultimo >= 16) {
          prims.push(texto(mx, 120, `${k} s`, { size: 8, fill: "texto2" }));
          ultimo = mx;
        }
      }
      const cx = px(x(s));
      prims.push({ t: "rect", x: r(cx - 16), y: 72, w: 32, h: 16, r: 5, fill: AZUL });
      prims.push({ t: "circulo", cx: r(cx - 9), cy: 90, r: 4, fill: "texto" }, { t: "circulo", cx: r(cx + 9), cy: 90, r: 4, fill: "texto" });
      // Flecha de la velocidad centrada sobre el auto, con el valor arriba.
      const largo = (60 * Math.abs(vel(s))) / vMax;
      prims.push(...flecha(cx - largo / 2, 58, cx + largo / 2, 58, VERDE));
      prims.push(texto(limitar(cx, 40, 270), 44, `v = ${num(vel(s), 1)} m/s`, { size: 10, fill: VERDE, bold: true }));
      return dib(310, 162, prims);
    },
    leyenda: (paso) => (paso === 0 ? `Sale con ${num(v.v0)} m/s${v.a ? ` y acelera ${num(v.a)} m/s² cada segundo` : " y no acelera"}.` : `t = ${paso} s · recorrió ${num(x(paso), 1)} m · va a ${num(vel(paso), 1)} m/s`),
    alternativa: `Un auto que sale a ${num(v.v0)} m/s con aceleración ${num(v.a)} m/s²; deja una marca cada segundo.`,
  };
}

// ---------- 2) Gráfica que se dibuja con el movimiento ----------
function grafica(v: VisualDinamiaGrafica): Escena | null {
  if (!esNum(v.v0, -50, 100) || !esNum(v.a, -20, 20) || !esNum(v.segundos, 1, 10)) return null;
  const n = Math.round(v.segundos);
  const x0 = esNum(v.x0) ? v.x0 : 0;
  const f = (s: number) => (v.eje === "x-t" ? x0 + v.v0 * s + 0.5 * v.a * s * s : v.v0 + v.a * s);
  const muestras = Array.from({ length: 41 }, (_, i) => f((n * i) / 40));
  const yMin = Math.min(0, ...muestras);
  const yMax = Math.max(1, ...muestras);
  const W = 300;
  const H = 170;
  const X = (s: number) => 40 + (240 * s) / n;
  const Y = (y: number) => H - 28 - ((H - 46) * (y - yMin)) / (yMax - yMin || 1);
  const pasoY = pasoLindo(yMax - yMin, 4);
  return {
    pasos: n,
    ms: 1200,
    dibujar: (paso, t) => {
      const s = tau(paso, t);
      const prims: Primitiva[] = [];
      for (let y = Math.ceil(yMin / pasoY) * pasoY; y <= yMax + 1e-9; y += pasoY) {
        prims.push({ t: "linea", x1: 40, y1: r(Y(y)), x2: 280, y2: r(Y(y)), stroke: "borde", sw: 1, op: 0.6 });
        prims.push(texto(36, Y(y) + 3, num(y), { size: 9, fill: "texto2", anchor: "end" }));
      }
      for (let k = 0; k <= n; k++) prims.push(texto(X(k), H - 14, String(k), { size: 9, fill: "texto2" }));
      prims.push({ t: "linea", x1: 40, y1: 14, x2: 40, y2: H - 28, stroke: "texto2", sw: 1.5 }, { t: "linea", x1: 40, y1: r(Y(Math.max(0, yMin))), x2: 284, y2: r(Y(Math.max(0, yMin))), stroke: "texto2", sw: 1.5 });
      prims.push(texto(284, H - 2, "t (s)", { size: 9, fill: "texto2", anchor: "end", bold: true }), texto(6, 10, v.eje === "x-t" ? "x (m)" : "v (m/s)", { size: 9, fill: "texto2", anchor: "start", bold: true }));
      const pts = Array.from({ length: 31 }, (_, i) => (s * i) / 30);
      if (v.eje === "v-t" && s > 0) prims.push({ t: "camino", d: `M${X(0)} ${r(Y(0))} L${pts.map((q) => `${r(X(q))} ${r(Y(f(q)))}`).join(" L")} L${r(X(s))} ${r(Y(0))} Z`, fill: "acento", op: 0.2 });
      if (s > 0) prims.push({ t: "camino", d: "M" + pts.map((q) => `${r(X(q))} ${r(Y(f(q)))}`).join(" L"), stroke: "acento", sw: 3 });
      prims.push({ t: "circulo", cx: r(X(s)), cy: r(Y(f(s))), r: 4.5, fill: "acento" });
      return dib(W, H, prims);
    },
    leyenda: (paso) => {
      if (paso === 0) return v.eje === "x-t" ? "La posición se dibuja a medida que pasa el tiempo." : "La velocidad se dibuja a medida que pasa el tiempo; el área pintada es la distancia.";
      if (v.eje === "x-t") return `t = ${paso} s · x = ${num(f(paso), 1)} m · velocidad (pendiente) = ${num(v.v0 + v.a * paso, 1)} m/s`;
      const area = v.v0 * paso + 0.5 * v.a * paso * paso;
      return `t = ${paso} s · v = ${num(f(paso), 1)} m/s · área = ${num(area, 1)} m recorridos`;
    },
    alternativa: `Gráfica ${v.eje} de un movimiento con v₀ = ${num(v.v0)} m/s y a = ${num(v.a)} m/s².`,
  };
}

// ---------- 3) Caída libre y tiro vertical ----------
function caida(v: VisualDinamiaCaida): Escena | null {
  if (!esNum(v.g, 1, 20) || !esNum(v.v0, 0, 60) || !esNum(v.segundos, 0.5, 5)) return null;
  const n = Math.round(v.segundos * 2);
  const s = (q: number) => v.v0 * q - 0.5 * v.g * q * q;
  const vel = (q: number) => v.v0 - v.g * q;
  const valores = Array.from({ length: n + 1 }, (_, k) => s(k / 2));
  const tope = Math.max(0, v.v0 > 0 ? (v.v0 * v.v0) / (2 * v.g) : 0, ...valores);
  const fondo = Math.min(0, ...valores);
  const Y = (h: number) => 22 + (150 * (tope - h)) / (tope - fondo || 1);
  // Lanzada hacia arriba: cada marca se corre un poco a la derecha para que la
  // subida y la bajada no queden una encima de la otra.
  const X = (q: number) => (v.v0 > 0 ? 95 + (70 * q) / (n / 2) : 120);
  return {
    pasos: n,
    ms: 900,
    dibujar: (paso, t) => {
      const q = tau(paso, t) / 2;
      const prims: Primitiva[] = [{ t: "linea", x1: 60, y1: 22, x2: 60, y2: 172, stroke: "texto2", sw: 1.5 }];
      const pasoR = pasoLindo(tope - fondo || 1, 5);
      for (let h = Math.ceil(fondo / pasoR) * pasoR; h <= tope + 1e-9; h += pasoR) {
        prims.push({ t: "linea", x1: 55, y1: r(Y(h)), x2: 60, y2: r(Y(h)), stroke: "texto2", sw: 1 }, texto(50, Y(h) + 3, num(h), { size: 9, fill: "texto2", anchor: "end" }));
      }
      prims.push(texto(50, 14, "m", { size: 9, fill: "texto2", anchor: "end", bold: true }));
      // Un rótulo que quedaría encima del anterior se omite.
      let ux = -Infinity;
      let uy = -Infinity;
      for (let k = 0; k <= Math.floor(q * 2 + 1e-9); k++) {
        const mx = X(k / 2);
        const my = Y(s(k / 2));
        prims.push({ t: "circulo", cx: r(mx), cy: r(my), r: 3, fill: NARANJA, op: 0.6 });
        if (Math.abs(my - uy) >= 11 || Math.abs(mx - ux) >= 30) {
          prims.push(texto(mx + 8, my + 3, `${num(k / 2)} s`, { size: 8, fill: "texto2", anchor: "start" }));
          ux = mx;
          uy = my;
        }
      }
      const yb = Y(s(q));
      prims.push({ t: "circulo", cx: r(X(q)), cy: r(yb), r: 9, fill: AZUL });
      const vq = vel(q);
      // La flecha de la velocidad va en su propia columna, centrada en el alto.
      const lv = limitar(vq * 3, -70, 70);
      if (Math.abs(vq) > 0.05) {
        prims.push(...flecha(235, 97 + lv / 2, 235, 97 - lv / 2, VERDE));
        prims.push(texto(244, 100, `${num(Math.abs(vq), 1)} m/s ${vq > 0 ? "↑" : "↓"}`, { size: 9, fill: VERDE, anchor: "start", bold: true }));
      } else prims.push(texto(250, 100, "v = 0 (arriba de todo)", { size: 9, fill: VERDE }));
      return dib(310, 190, prims);
    },
    leyenda: (paso) => (paso === 0 ? (v.v0 > 0 ? `Sube a ${num(v.v0)} m/s y la gravedad le quita ${num(v.g)} m/s cada segundo.` : `Se suelta: cada segundo gana ${num(v.g)} m/s hacia abajo.`) : `t = ${num(paso / 2)} s · posición ${num(s(paso / 2), 2)} m · v = ${num(vel(paso / 2), 1)} m/s`),
    alternativa: `Una pelota ${v.v0 > 0 ? `lanzada hacia arriba a ${num(v.v0)} m/s` : "que se suelta"} con g = ${num(v.g)} m/s², con marcas cada medio segundo.`,
  };
}

// ---------- 4) Tiro parabólico ----------
function parabola(v: VisualDinamiaParabola): Escena | null {
  if (!esNum(v.v0, 1, 60) || !SEN[v.angulo]) return null;
  const vx = v.v0 * COS[v.angulo];
  const vy = v.v0 * SEN[v.angulo];
  const T = (2 * vy) / G;
  const alcance = vx * T;
  const hmax = (vy * vy) / (2 * G);
  const esc = Math.min(215 / alcance, 115 / Math.max(hmax, 0.1));
  const P = (q: number): [number, number] => [25 + vx * q * esc, 160 - (vy * q - 0.5 * G * q * q) * esc];
  return {
    pasos: 6,
    ms: 1000,
    dibujar: (paso, t) => {
      const q = (tau(paso, t) / 6) * T;
      const prims: Primitiva[] = [{ t: "linea", x1: 15, y1: 160, x2: 295, y2: 160, stroke: "texto2", sw: 2 }];
      const total = Array.from({ length: 41 }, (_, i) => P((T * i) / 40));
      prims.push({ t: "camino", d: "M" + total.map(([a, b]) => `${r(a)} ${r(b)}`).join(" L"), stroke: "texto2", sw: 1.5, dash: "4 5", op: 0.6 });
      if (q > 0) {
        const hecho = Array.from({ length: 31 }, (_, i) => P((q * i) / 30));
        prims.push({ t: "camino", d: "M" + hecho.map(([a, b]) => `${r(a)} ${r(b)}`).join(" L"), stroke: "acento", sw: 3 });
      }
      const [bx, by] = P(q);
      prims.push({ t: "circulo", cx: r(bx), cy: r(by), r: 7, fill: AZUL });
      const vyq = vy - G * q;
      const kv = 40 / v.v0;
      prims.push(...flecha(bx, by, bx + vx * kv, by, NARANJA, "vx"));
      if (Math.abs(vyq) > 0.1) prims.push(...flecha(bx, by, bx, by - vyq * kv, VERDE, "vy"));
      prims.push({ t: "linea", x1: r(25 + alcance * esc), y1: 156, x2: r(25 + alcance * esc), y2: 164, stroke: "texto2", sw: 1.5 });
      prims.push(texto(25 + alcance * esc, 177, `alcance ${num(alcance, 1)} m`, { size: 9, fill: "texto2", anchor: "end" }));
      return dib(310, 180, prims);
    },
    leyenda: (paso) => {
      if (paso === 0) return `vx = ${num(vx, 1)} m/s no cambia; vy = ${num(vy, 1)} m/s y la gravedad la frena.`;
      const q = (paso / 6) * T;
      const vyq = vy - G * q;
      return `t = ${num(q, 2)} s · vx = ${num(vx, 1)} m/s · vy = ${num(vyq, 1)} m/s${paso === 3 ? " (arriba de todo: vy = 0)" : ""}${paso === 6 ? ` · cae a ${num(alcance, 1)} m` : ""}`;
    },
    alternativa: `Tiro parabólico a ${num(v.v0)} m/s y ${v.angulo}°: alcance ${num(alcance, 1)} m, altura máxima ${num(hmax, 1)} m.`,
  };
}

// ---------- 5) Vectores ----------
function vectores(v: VisualDinamiaVectores): Escena | null {
  if (!Array.isArray(v.vectores) || v.vectores.length === 0 || v.vectores.length > 4 || v.vectores.some((w) => !esNum(w.x, -12, 12) || !esNum(w.y, -12, 12) || typeof w.nombre !== "string")) return null;
  const sx = v.vectores.reduce((a, w) => a + w.x, 0);
  const sy = v.vectores.reduce((a, w) => a + w.y, 0);
  let acx = 0;
  let acy = 0;
  const colas = v.vectores.map((w) => {
    const c = [acx, acy];
    acx += w.x;
    acy += w.y;
    return c;
  });
  const R = Math.max(4, ...v.vectores.flatMap((w, i) => [Math.abs(w.x), Math.abs(w.y), Math.abs(colas[i][0] + w.x), Math.abs(colas[i][1] + w.y)]), Math.abs(sx), Math.abs(sy)) + 1;
  const L = 240;
  const u = (L / 2 - 14) / R;
  const P = (x: number, y: number): [number, number] => [L / 2 + x * u, L / 2 - y * u];
  const COL = [AZUL, NARANJA, VIOLETA, ROSA];
  const n = v.vectores.length;
  const pasos = v.modo === "componentes" ? 3 : v.modo === "suma" ? n + 1 : n + 2;
  const base = (): Primitiva[] => {
    const out: Primitiva[] = [];
    for (let k = -R; k <= R; k++) {
      const [ax, ay] = P(k, -R);
      const [bx, by] = P(k, R);
      out.push({ t: "linea", x1: r(ax), y1: r(ay), x2: r(bx), y2: r(by), stroke: k === 0 ? "texto2" : "borde", sw: k === 0 ? 1.5 : 1, op: k === 0 ? 0.9 : 0.35 });
      const [cx, cy] = P(-R, k);
      const [dx, dy] = P(R, k);
      out.push({ t: "linea", x1: r(cx), y1: r(cy), x2: r(dx), y2: r(dy), stroke: k === 0 ? "texto2" : "borde", sw: k === 0 ? 1.5 : 1, op: k === 0 ? 0.9 : 0.35 });
    }
    return out;
  };
  return {
    pasos,
    ms: 1300,
    dibujar: (paso, t) => {
      const prims = base();
      const e = suave(t);
      if (v.modo === "componentes") {
        const w = v.vectores[0];
        const [ox, oy] = P(0, 0);
        const [tx, ty] = P(w.x, w.y);
        if (paso >= 1) prims.push(...flecha(ox, oy, lerp(ox, tx, paso === 1 ? e : 1), lerp(oy, ty, paso === 1 ? e : 1), AZUL, w.nombre));
        if (paso >= 2) {
          const [px] = P(w.x * (paso === 2 ? e : 1), 0);
          prims.push(...flecha(ox, oy, px, oy, NARANJA, `${w.nombre}x = ${num(w.x)}`), { t: "linea", x1: r(tx), y1: r(ty), x2: r(tx), y2: r(oy), stroke: NARANJA, sw: 1.5, dash: "4 4" });
        }
        if (paso >= 3) {
          const [, py] = P(0, w.y * (paso === 3 ? e : 1));
          prims.push(...flecha(ox, oy, ox, py, VERDE, `${w.nombre}y = ${num(w.y)}`), { t: "linea", x1: r(tx), y1: r(ty), x2: r(ox), y2: r(ty), stroke: VERDE, sw: 1.5, dash: "4 4" });
        }
        return dib(L, L, prims);
      }
      v.vectores.forEach((w, i) => {
        if (paso < i + 1) return;
        const avance = paso === i + 1 ? e : 1;
        const desde = v.modo === "suma" ? colas[i] : [0, 0];
        const cx0 = lerp(0, desde[0], avance);
        const cy0 = lerp(0, desde[1], avance);
        const [ax, ay] = P(cx0, cy0);
        const [bx, by] = P(cx0 + w.x, cy0 + w.y);
        prims.push(...flecha(ax, ay, bx, by, COL[i % COL.length], w.nombre));
      });
      const final = v.modo === "suma" ? n + 1 : n + 1;
      if (paso >= final) {
        const [ox, oy] = P(0, 0);
        const [rx, ry] = P(sx * (paso === final ? e : 1), sy * (paso === final ? e : 1));
        prims.push(...flecha(ox, oy, rx, ry, VERDE, "R", 3.5));
      }
      if (v.modo === "equilibrante" && paso >= n + 2) {
        const [ox, oy] = P(0, 0);
        const [qx, qy] = P(-sx * (paso === n + 2 ? e : 1), -sy * (paso === n + 2 ? e : 1));
        prims.push(...flecha(ox, oy, qx, qy, ROJO, "E = −R", 3.5));
      }
      return dib(L, L, prims);
    },
    leyenda: (paso) => {
      if (v.modo === "componentes") {
        const w = v.vectores[0];
        return ["Un vector se puede ver como dos: uno horizontal y uno vertical.", `${w.nombre} = (${num(w.x)}, ${num(w.y)})`, `Componente en x: ${num(w.x)}`, `Componente en y: ${num(w.y)} · módulo = √(${num(w.x)}² + ${num(w.y)}²) = ${num(Math.hypot(w.x, w.y), 2)}`][paso] ?? null;
      }
      if (paso === 0) return v.modo === "suma" ? "Los vectores se ponen uno detrás del otro: punta con cola." : "Las fuerzas actúan sobre el mismo punto.";
      if (paso <= n) return `${v.vectores[paso - 1].nombre} = (${num(v.vectores[paso - 1].x)}, ${num(v.vectores[paso - 1].y)})`;
      if (paso === n + 1) return `Resultante R = (${num(sx)}, ${num(sy)}) · |R| = ${num(Math.hypot(sx, sy), 2)}`;
      return `La equilibrante es la resultante dada vuelta: E = (${num(-sx)}, ${num(-sy)}). Con ella, la suma da cero.`;
    },
    alternativa: `${v.vectores.map((w) => `${w.nombre} = (${w.x}, ${w.y})`).join(", ")}; resultante (${sx}, ${sy}).`,
  };
}

// ---------- 6) Diagrama de cuerpo libre ----------
interface Fuerza {
  nombre: string;
  valor: number;
  ang: number; // grados, 0 = derecha, 90 = arriba
  color: string;
}

function cuerpoLibre(v: VisualDinamiaCuerpoLibre): Escena | null {
  if (!esNum(v.masa, 0.5, 200)) return null;
  const m = v.masa;
  const P = m * G;
  const fuerzas: Fuerza[] = [];
  let neta = 0;
  let dirNeta = 0;
  let rot = 0;
  if (v.situacion === "piso") fuerzas.push({ nombre: "Peso", valor: P, ang: -90, color: ROJO }, { nombre: "Normal", valor: P, ang: 90, color: AZUL });
  else if (v.situacion === "colgando") fuerzas.push({ nombre: "Peso", valor: P, ang: -90, color: ROJO }, { nombre: "Tensión", valor: P, ang: 90, color: VIOLETA });
  else if (v.situacion === "empujado") {
    const F = esNum(v.empuje, 0, 5000) ? v.empuje : 2 * P;
    const roz = (esNum(v.mu, 0, 1) ? v.mu : 0) * P;
    fuerzas.push({ nombre: "Peso", valor: P, ang: -90, color: ROJO }, { nombre: "Normal", valor: P, ang: 90, color: AZUL }, { nombre: "Empuje", valor: F, ang: 0, color: VERDE });
    if (roz > 0) fuerzas.push({ nombre: "Rozamiento", valor: roz, ang: 180, color: NARANJA });
    neta = Math.max(0, F - roz);
    dirNeta = 0;
  } else {
    const a = v.angulo ?? 30;
    rot = -a;
    const N = P * COS[a];
    const roz = (esNum(v.mu, 0, 1) ? v.mu : 0) * N;
    fuerzas.push({ nombre: "Peso", valor: P, ang: -90, color: ROJO }, { nombre: "Normal", valor: N, ang: 90 + a, color: AZUL });
    if (roz > 0) fuerzas.push({ nombre: "Rozamiento", valor: roz, ang: a, color: NARANJA });
    neta = Math.max(0, P * SEN[a] - roz);
    dirNeta = 180 + a;
  }
  const maxF = Math.max(...fuerzas.map((f) => f.valor));
  const largo = (f: number) => 18 + (52 * f) / maxF;
  const n = fuerzas.length;
  const cx = 150;
  const cy = v.situacion === "colgando" ? 110 : 100;
  return {
    pasos: n + 1,
    ms: 1300,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [];
      if (v.situacion === "colgando") prims.push({ t: "linea", x1: 90, y1: 20, x2: 210, y2: 20, stroke: "texto2", sw: 3 }, { t: "linea", x1: cx, y1: 20, x2: cx, y2: cy - 16, stroke: "texto2", sw: 2 });
      else if (v.situacion === "plano") {
        const a = ((v.angulo ?? 30) * Math.PI) / 180;
        prims.push({ t: "camino", d: `M30 170 L270 170 L270 ${r(170 - 240 * Math.tan(a))} Z`, fill: "borde", op: 0.5, stroke: "texto2", sw: 1.5 });
      } else prims.push({ t: "linea", x1: 20, y1: cy + 18, x2: 280, y2: cy + 18, stroke: "texto2", sw: 2 });
      let bx = cx;
      let by = cy;
      if (v.situacion === "plano") {
        const a = ((v.angulo ?? 30) * Math.PI) / 180;
        bx = 170;
        by = 170 - (270 - 170) * Math.tan(a) - 16 / Math.cos(a);
      }
      const desliz = paso === n + 1 && neta > 0 ? suave(t) * 18 : 0;
      const ang = (dirNeta * Math.PI) / 180;
      bx += Math.cos(ang) * desliz;
      by -= Math.sin(ang) * desliz;
      prims.push(...bloque(bx, by, 32, "acento", `${num(m)} kg`, rot));
      fuerzas.forEach((f, i) => {
        if (paso < i + 1) return;
        const k = paso === i + 1 ? suave(t) : 1;
        const a = (f.ang * Math.PI) / 180;
        const l = largo(f.valor) * k;
        prims.push(...flecha(bx, by, bx + Math.cos(a) * l, by - Math.sin(a) * l, f.color, k > 0.9 ? `${f.nombre} ${num(f.valor, 1)} N` : undefined));
      });
      if (paso === n + 1 && neta > 0) {
        // En el plano, la neta va aparte (arriba a la izquierda) para no tapar las otras.
        const [nx, ny] = v.situacion === "plano" ? [95, 40] : [bx, by - 46];
        prims.push(...flecha(nx, ny, nx + Math.cos(ang) * 50, ny - Math.sin(ang) * 50, "acento", `Neta ${num(neta, 1)} N`));
      }
      return dib(300, 198, prims);
    },
    leyenda: (paso) => {
      if (paso === 0) return "Primero el cuerpo solo; después, cada fuerza que lo toca.";
      if (paso <= n) {
        const f = fuerzas[paso - 1];
        const porque: Record<string, string> = { Peso: `siempre: masa × g = ${num(m)} × 10`, Normal: "el apoyo empuja perpendicular a la superficie", Tensión: "la cuerda tira hacia arriba", Empuje: "la fuerza que tú aplicas", Rozamiento: "μ × Normal, contra el movimiento" };
        return `${f.nombre}: ${num(f.valor, 1)} N (${porque[f.nombre]})`;
      }
      return neta > 0 ? `Fuerza neta = ${num(neta, 1)} N → a = F / m = ${num(neta / m, 2)} m/s²` : "Las fuerzas se cancelan: fuerza neta 0, el cuerpo sigue quieto.";
    },
    alternativa: `Diagrama de cuerpo libre de ${num(m)} kg (${v.situacion}): ${fuerzas.map((f) => `${f.nombre} ${num(f.valor, 1)} N`).join(", ")}.`,
  };
}

// ---------- 7) Máquina de Atwood ----------
function poleas(v: VisualDinamiaPoleas): Escena | null {
  if (!esNum(v.m1, 0.5, 50) || !esNum(v.m2, 0.5, 50)) return null;
  const a = ((v.m1 - v.m2) * G) / (v.m1 + v.m2);
  const T = (2 * v.m1 * v.m2 * G) / (v.m1 + v.m2);
  return {
    pasos: 3,
    ms: 1500,
    dibujar: (paso, t) => {
      const d = paso === 3 ? suave(t) * 34 * Math.sign(a) : 0;
      const y1 = 110 + d;
      const y2 = 110 - d;
      const prims: Primitiva[] = [
        { t: "linea", x1: 100, y1: 16, x2: 200, y2: 16, stroke: "texto2", sw: 3 },
        { t: "linea", x1: 150, y1: 16, x2: 150, y2: 30, stroke: "texto2", sw: 2 },
        { t: "circulo", cx: 150, cy: 44, r: 16, stroke: "texto", sw: 2.5 },
        { t: "linea", x1: 134, y1: 44, x2: 134, y2: r(y1 - 16), stroke: "texto2", sw: 2 },
        { t: "linea", x1: 166, y1: 44, x2: 166, y2: r(y2 - 16), stroke: "texto2", sw: 2 },
        ...bloque(134, y1, 30, AZUL, `${num(v.m1)} kg`),
        ...bloque(166, y2, 30, NARANJA, `${num(v.m2)} kg`),
      ];
      if (paso >= 1) prims.push(...flecha(110, y1, 110, y1 + 20 + v.m1 * 2, ROJO, `${num(v.m1 * G)} N`), ...flecha(190, y2, 190, y2 + 20 + v.m2 * 2, ROJO, `${num(v.m2 * G)} N`));
      if (paso >= 2) prims.push(...flecha(134, y1 - 18, 134, y1 - 44, VIOLETA, `T ${num(T, 1)} N`), ...flecha(166, y2 - 18, 166, y2 - 44, VIOLETA));
      return dib(300, 185, prims);
    },
    leyenda: (paso) =>
      [
        "Dos masas cuelgan de una polea, unidas por la misma cuerda.",
        `Pesos: ${num(v.m1 * G)} N y ${num(v.m2 * G)} N. Gana el más pesado.`,
        `La cuerda tira de las dos con la misma tensión: ${num(T, 1)} N.`,
        `a = (m₁ − m₂) · g / (m₁ + m₂) = ${num(Math.abs(a), 2)} m/s²`,
      ][paso] ?? null,
    alternativa: `Máquina de Atwood con ${v.m1} kg y ${v.m2} kg: aceleración ${num(Math.abs(a), 2)} m/s², tensión ${num(T, 1)} N.`,
  };
}

// ---------- 8) Movimiento circular ----------
function circular(v: VisualDinamiaCircular): Escena | null {
  if (!esNum(v.masa, 0.1, 100) || !esNum(v.radio, 0.1, 100) || !esNum(v.v, 0.1, 100)) return null;
  const F = (v.masa * v.v * v.v) / v.radio;
  const cx = 130;
  const cy = 95;
  const R = 62;
  return {
    pasos: 4,
    ms: 1500,
    dibujar: (paso, t) => {
      const ang = paso === 0 ? 0 : paso === 1 ? (suave(t) * Math.PI) / 2 : Math.PI / 2;
      const prims: Primitiva[] = [{ t: "circulo", cx, cy, r: R, stroke: "texto2", sw: 1.5 }, { t: "circulo", cx, cy, r: 3, fill: "texto" }];
      let ox = cx + R * Math.cos(ang);
      const oy = cy - R * Math.sin(ang);
      if (paso === 4) {
        ox -= suave(t) * 90;
      } else prims.push({ t: "linea", x1: cx, y1: cy, x2: r(ox), y2: r(oy), stroke: "texto2", sw: 1.5, dash: paso === 4 ? "3 3" : undefined });
      prims.push({ t: "circulo", cx: r(ox), cy: r(oy), r: 9, fill: AZUL });
      if (paso >= 2) prims.push(...flecha(ox, oy, ox - Math.sin(ang) * 55, oy - Math.cos(ang) * 55, VERDE, "v"));
      if (paso === 3) prims.push(...flecha(ox, oy, lerp(ox, cx, 0.6), lerp(oy, cy, 0.6), ROJO, `F ${num(F, 1)} N`));
      if (paso === 4) prims.push(texto(150, 175, "Sin cuerda, sigue derecho por la tangente", { size: 9, fill: "texto2" }));
      return dib(300, 185, prims);
    },
    leyenda: (paso) =>
      [
        `Una piedra de ${num(v.masa)} kg gira en un círculo de ${num(v.radio)} m.`,
        "Su velocidad cambia de dirección todo el tiempo.",
        `La velocidad (${num(v.v)} m/s) apunta siempre por la tangente.`,
        `Hace falta una fuerza hacia el centro: F = m · v² / r = ${num(F, 1)} N`,
        "Si se corta la cuerda, ya no hay fuerza al centro: sale en línea recta.",
      ][paso] ?? null,
    alternativa: `Movimiento circular: ${v.masa} kg a ${v.v} m/s en un radio de ${v.radio} m necesita ${num(F, 1)} N hacia el centro.`,
  };
}

// ---------- 9) Energía en una montaña rusa ----------
function energia(v: VisualDinamiaEnergia): Escena | null {
  if (!esNum(v.masa, 0.1, 1000) || !esNum(v.altura, 0.1, 200)) return null;
  const perdida = esNum(v.perdida, 0, 0.5) ? v.perdida : 0;
  const E0 = v.masa * G * v.altura;
  const alturas = [1, 0.55, 0, 0.4, 0.62];
  const xs = [20, 70, 125, 170, 210];
  const pista = (s: number) => {
    const i = Math.min(3, Math.floor(s));
    const f = suave(s - i);
    return { x: lerp(xs[i], xs[i + 1], s - i), h: lerp(alturas[i], alturas[i + 1], f) };
  };
  const Y = (h: number) => 150 - h * 110;
  const estado = (s: number) => {
    const { h } = pista(s);
    const calor = (E0 * perdida * s) / 4;
    const ep = v.masa * G * v.altura * h;
    const ec = Math.max(0, E0 - calor - ep);
    return { ep, ec, calor, h };
  };
  return {
    pasos: 4,
    ms: 1400,
    dibujar: (paso, t) => {
      const s = tau(paso, t);
      const muestras = Array.from({ length: 41 }, (_, i) => pista((4 * i) / 40));
      const prims: Primitiva[] = [{ t: "camino", d: "M" + muestras.map((p) => `${r(p.x)} ${r(Y(p.h))}`).join(" L"), stroke: "texto2", sw: 3 }];
      const p = pista(s);
      prims.push({ t: "circulo", cx: r(p.x), cy: r(Y(p.h) - 8), r: 8, fill: AZUL });
      const e = estado(s);
      const k = 80 / E0;
      prims.push(...barra(240, 150, e.ep * k, 80, VIOLETA, "Ep", `${num(e.ep, 0)} J`), ...barra(268, 150, e.ec * k, 80, VERDE, "Ec", `${num(e.ec, 0)} J`));
      if (perdida > 0) prims.push(...barra(296, 150, e.calor * k, 80, NARANJA, "Calor", `${num(e.calor, 0)} J`));
      return dib(318, 170, prims);
    },
    leyenda: (paso) => {
      const e = estado(paso);
      if (paso === 0) return `Arriba (${num(v.altura)} m): toda la energía es potencial, ${num(E0, 0)} J.`;
      return `Ep ${num(e.ep, 0)} J + Ec ${num(e.ec, 0)} J${perdida > 0 ? ` + calor ${num(e.calor, 0)} J` : ""} = ${num(E0, 0)} J: el total no cambia.`;
    },
    alternativa: `Montaña rusa de ${v.altura} m con ${v.masa} kg: la energía pasa de potencial a cinética${perdida > 0 ? " y una parte se va en calor" : ""}; el total es ${num(E0, 0)} J.`,
  };
}

// ---------- 10) Choque en una línea ----------
function choque(v: VisualDinamiaChoque): Escena | null {
  if (![v.m1, v.m2].every((m) => esNum(m, 0.1, 100)) || !esNum(v.v1, -30, 30) || !esNum(v.v2, -30, 30) || v.v1 <= v.v2) return null;
  const pTot = v.m1 * v.v1 + v.m2 * v.v2;
  const plast = v.clase === "plastico";
  const vf = pTot / (v.m1 + v.m2);
  const u1 = plast ? vf : ((v.m1 - v.m2) * v.v1 + 2 * v.m2 * v.v2) / (v.m1 + v.m2);
  const u2 = plast ? vf : ((v.m2 - v.m1) * v.v2 + 2 * v.m1 * v.v1) / (v.m1 + v.m2);
  return {
    pasos: 3,
    ms: 1500,
    dibujar: (paso, t) => {
      const e = suave(t);
      let x1 = 70;
      let x2 = 220;
      if (paso === 2) {
        x1 = lerp(70, 128, e);
        x2 = lerp(220, 162, e);
      } else if (paso === 3) {
        x1 = 128 + u1 * 4 * e;
        x2 = 162 + u2 * 4 * e;
      }
      const prims: Primitiva[] = [{ t: "linea", x1: 10, y1: 112, x2: 290, y2: 112, stroke: "texto2", sw: 2 }];
      prims.push({ t: "rect", x: r(x1 - 17), y: 86, w: 34, h: 20, r: 5, fill: AZUL }, { t: "rect", x: r(x2 - 17), y: 86, w: 34, h: 20, r: 5, fill: NARANJA });
      prims.push(texto(x1, 100, `${num(v.m1)} kg`, { size: 8, fill: "#FFFFFF", bold: true }), texto(x2, 100, `${num(v.m2)} kg`, { size: 8, fill: "#FFFFFF", bold: true }));
      const va = paso === 3 ? u1 : v.v1;
      const vb = paso === 3 ? u2 : v.v2;
      if (paso === 3 && plast) {
        if (Math.abs(vf) > 0.01) prims.push(...flecha((x1 + x2) / 2, 66, (x1 + x2) / 2 + vf * 5, 66, VERDE, `${num(vf, 2)} m/s`));
      } else if (paso !== 2) {
        if (Math.abs(va) > 0.01) prims.push(...flecha(x1, 70, x1 + va * 5, 70, VERDE, `${num(va, 2)} m/s`));
        if (Math.abs(vb) > 0.01) prims.push(...flecha(x2, 56, x2 + vb * 5, 56, VERDE, `${num(vb, 2)} m/s`));
      }
      return dib(300, 130, prims);
    },
    leyenda: (paso) =>
      [
        `Antes: p = ${num(v.m1)}·${num(v.v1)} + ${num(v.m2)}·${num(v.v2)} = ${num(pTot, 2)} kg·m/s`,
        `Cada carrito lleva su cantidad de movimiento (masa × velocidad).`,
        plast ? "Chocan y quedan pegados." : "Chocan y rebotan sin perder energía (choque elástico).",
        `Después: ${plast ? `los dos a ${num(vf, 2)} m/s` : `${num(u1, 2)} m/s y ${num(u2, 2)} m/s`}; la suma sigue siendo ${num(pTot, 2)} kg·m/s.`,
      ][paso] ?? null,
    alternativa: `Choque ${plast ? "plástico" : "elástico"}: la cantidad de movimiento total (${num(pTot, 2)} kg·m/s) es la misma antes y después.`,
  };
}

// ---------- 11) Termómetros y curva de calentamiento ----------
function termometro(v: VisualDinamiaTermometro): Escena | null {
  if (v.modo === "escalas") {
    const temps = (v.temperaturas ?? []).filter((x) => esNum(x, -80, 200));
    if (temps.length === 0 || temps.length > 6) return null;
    const escalas = [
      { nombre: "°C", conv: (c: number) => c, color: AZUL },
      { nombre: "K", conv: (c: number) => c + 273, color: VIOLETA },
      { nombre: "°F", conv: (c: number) => (c * 9) / 5 + 32, color: NARANJA },
    ];
    const nivel = (c: number) => limitar((c + 50) / 200, 0, 1);
    return {
      pasos: temps.length,
      ms: 1400,
      dibujar: (paso, t) => {
        const anterior = paso <= 1 ? -20 : temps[paso - 2];
        const c = paso === 0 ? -20 : lerp(anterior, temps[paso - 1], suave(t));
        const prims: Primitiva[] = [];
        escalas.forEach((e, i) => {
          const x = 70 + i * 80;
          prims.push({ t: "rect", x: x - 9, y: 20, w: 18, h: 120, r: 9, stroke: "texto2", sw: 1.5 }, { t: "circulo", cx: x, cy: 150, r: 13, fill: e.color });
          const h = 116 * nivel(c);
          prims.push({ t: "rect", x: x - 5, y: r(138 - h), w: 10, h: r(h + 4), r: 5, fill: e.color });
          prims.push(texto(x, 178, e.nombre, { size: 11, bold: true, fill: e.color }), texto(x + 26, r(140 - h), num(e.conv(c), 1), { size: 10, fill: "texto", anchor: "start", bold: true }));
        });
        return dib(300, 185, prims);
      },
      leyenda: (paso) => {
        if (paso === 0) return "Los tres termómetros miden la misma temperatura con distinta escala.";
        const c = temps[paso - 1];
        return `${num(c)} °C = ${num(c + 273)} K = ${num((c * 9) / 5 + 32, 1)} °F`;
      },
      alternativa: `Tres termómetros (°C, K, °F) marcando ${temps.map((c) => `${c} °C`).join(", ")}.`,
    };
  }
  // Curva de calentamiento del agua: hielo → se derrite → agua → hierve → vapor.
  const tramos = [
    { t0: 0, t1: 1, c0: -20, c1: 0, texto: "El hielo se calienta de −20 °C a 0 °C." },
    { t0: 1, t1: 2.6, c0: 0, c1: 0, texto: "Se derrite: la temperatura se queda en 0 °C aunque siga recibiendo calor." },
    { t0: 2.6, t1: 4, c0: 0, c1: 100, texto: "El agua líquida sube de 0 °C a 100 °C." },
    { t0: 4, t1: 6.6, c0: 100, c1: 100, texto: "Hierve: se queda en 100 °C mientras se evapora (calor latente)." },
    { t0: 6.6, t1: 7.4, c0: 100, c1: 120, texto: "El vapor sigue calentándose." },
  ];
  const X = (q: number) => 40 + q * 33;
  const Y = (c: number) => 150 - ((c + 20) * 130) / 140;
  return {
    pasos: tramos.length,
    ms: 1500,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [{ t: "linea", x1: 40, y1: 10, x2: 40, y2: 150, stroke: "texto2", sw: 1.5 }, { t: "linea", x1: 40, y1: 150, x2: 290, y2: 150, stroke: "texto2", sw: 1.5 }];
      for (const c of [-20, 0, 50, 100]) prims.push(texto(36, Y(c) + 3, `${c} °C`, { size: 8, fill: "texto2", anchor: "end" }), { t: "linea", x1: 40, y1: r(Y(c)), x2: 290, y2: r(Y(c)), stroke: "borde", sw: 1, op: 0.5 });
      prims.push(texto(290, 166, "calor que entra →", { size: 8, fill: "texto2", anchor: "end" }));
      const puntos: string[] = [];
      tramos.forEach((tr, i) => {
        if (paso < i + 1) return;
        const k = paso === i + 1 ? suave(t) : 1;
        puntos.push(`${r(X(tr.t0))} ${r(Y(tr.c0))}`, `${r(X(lerp(tr.t0, tr.t1, k)))} ${r(Y(lerp(tr.c0, tr.c1, k)))}`);
        if (tr.c0 === tr.c1 && k > 0.9) prims.push({ t: "rect", x: r(X(tr.t0)), y: r(Y(tr.c0) - 4), w: r(X(tr.t1) - X(tr.t0)), h: 8, r: 4, fill: "acento", op: 0.2 });
      });
      if (puntos.length) prims.push({ t: "camino", d: "M" + puntos.join(" L"), stroke: "acento", sw: 3 });
      return dib(300, 172, prims);
    },
    leyenda: (paso) => (paso === 0 ? "Calentamos hielo a −20 °C sin parar." : tramos[paso - 1].texto),
    alternativa: "Curva de calentamiento del agua con mesetas a 0 °C (se derrite) y 100 °C (hierve).",
  };
}

// ---------- 12) Partículas de un gas ----------
function particulas(v: VisualDinamiaParticulas): Escena | null {
  const valores = (v.valores ?? []).filter((x) => esNum(x, 1, 2000));
  if (valores.length === 0 || valores.length > 5) return null;
  const n = valores.length;
  const ini = esNum(v.inicial, 0.1, 100) ? v.inicial : 1;
  const tri = (x: number) => {
    const f = x - Math.floor(x);
    return f < 0.5 ? f * 2 : 2 - f * 2;
  };
  const altoDe = (k: number) => {
    if (v.modo === "boyle") return (valores[k] / Math.max(...valores)) * 110;
    if (v.modo === "charles") return (valores[k] / Math.max(...valores)) * 110;
    return 110;
  };
  return {
    pasos: n,
    ms: 1600,
    dibujar: (paso, t) => {
      const k = Math.max(0, paso - 1);
      const kPrev = Math.max(0, paso - 2);
      const h = paso === 0 ? altoDe(0) : lerp(altoDe(kPrev), altoDe(k), suave(t));
      const temp = v.modo === "boyle" ? 300 : valores[k];
      const rapidez = Math.sqrt(temp / 300) * 0.9;
      const tiempo = paso + t;
      const prims: Primitiva[] = [{ t: "rect", x: 90, y: 20, w: 120, h: 130, r: 4, stroke: "texto2", sw: 2 }];
      const techo = 150 - h;
      prims.push({ t: "rect", x: 92, y: r(techo - 8), w: 116, h: 8, fill: "texto2" }, { t: "linea", x1: 150, y1: r(techo - 8), x2: 150, y2: 8, stroke: "texto2", sw: 3 });
      for (let i = 0; i < 14; i++) {
        const px = 96 + 108 * tri(ruido(i) + tiempo * rapidez * (0.6 + ruido(i, 1)));
        const py = techo + 4 + (h - 8) * tri(ruido(i, 2) + tiempo * rapidez * (0.6 + ruido(i, 3)));
        prims.push({ t: "circulo", cx: r(px), cy: r(py), r: 4, fill: temp > 400 ? ROJO : temp > 300 ? NARANJA : AZUL, op: 0.9 });
      }
      return dib(300, 160, prims);
    },
    leyenda: (paso) => {
      if (paso === 0) return v.modo === "boyle" ? "Temperatura fija: cambiamos el volumen y miramos la presión." : v.modo === "charles" ? "Presión fija: cambiamos la temperatura y miramos el volumen." : "Más temperatura = partículas más rápidas.";
      const x = valores[paso - 1];
      if (v.modo === "boyle") return `V = ${num(x)} L → P = ${num((ini * valores[0]) / x, 2)} atm (P · V se mantiene: ${num(ini * valores[0], 2)})`;
      if (v.modo === "charles") return `T = ${num(x)} K → V = ${num((ini * x) / valores[0], 2)} L (V / T se mantiene)`;
      return `T = ${num(x)} K: ${x > 400 ? "se mueven muy rápido" : x > 300 ? "se mueven más rápido" : "se mueven despacio"}.`;
    },
    alternativa: `Partículas de un gas (${v.modo}) con valores ${valores.join(", ")}.`,
  };
}

// ---------- 13) Ciclo de una máquina térmica ----------
function ciclo(v: VisualDinamiaCiclo): Escena | null {
  if (!esNum(v.qc, 1, 1e6) || !esNum(v.w, 0, v.qc)) return null;
  const qf = v.qc - v.w;
  const eta = (v.w / v.qc) * 100;
  const esq: [number, number][] = [
    [50, 40],
    [150, 40],
    [150, 120],
    [50, 120],
  ];
  return {
    pasos: 5,
    ms: 1200,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [{ t: "linea", x1: 30, y1: 10, x2: 30, y2: 140, stroke: "texto2", sw: 1.5 }, { t: "linea", x1: 30, y1: 140, x2: 170, y2: 140, stroke: "texto2", sw: 1.5 }];
      prims.push(texto(26, 14, "P", { size: 10, fill: "texto2", anchor: "end", bold: true }), texto(172, 154, "V", { size: 10, fill: "texto2", bold: true }));
      const lados = Math.min(4, paso);
      for (let i = 0; i < lados; i++) {
        const [a, b] = esq[i];
        const [c, d] = esq[(i + 1) % 4];
        const k = paso === i + 1 ? suave(t) : 1;
        prims.push(...flecha(a, b, lerp(a, c, k), lerp(b, d, k), "acento", undefined, 2.5));
      }
      if (paso >= 4) prims.push({ t: "rect", x: 50, y: 40, w: 100, h: 80, fill: "acento", op: 0.18 }, texto(100, 84, `W = ${num(v.w)} J`, { size: 10, bold: true, fill: "acento" }));
      if (paso === 5) {
        const k = suave(t);
        prims.push({ t: "rect", x: 200, y: 10, w: 90, h: 24, r: 6, fill: ROJO, op: 0.25 }, texto(245, 26, "Caliente", { size: 10, bold: true }));
        prims.push({ t: "rect", x: 200, y: 126, w: 90, h: 24, r: 6, fill: AZUL, op: 0.25 }, texto(245, 142, "Frío", { size: 10, bold: true }));
        prims.push({ t: "circulo", cx: 245, cy: 80, r: 18, stroke: "texto", sw: 2 }, texto(245, 84, "Motor", { size: 8 }));
        prims.push(...flecha(245, 34, 245, lerp(34, 62, k), ROJO, `${num(v.qc)} J`, 2 + (6 * v.qc) / v.qc));
        prims.push(...flecha(263, 80, lerp(263, 296, k), 80, "acento", `W`, 2 + (6 * v.w) / v.qc));
        prims.push(...flecha(245, 98, 245, lerp(98, 126, k), AZUL, `${num(qf)} J`, 2 + (6 * qf) / v.qc));
      }
      return dib(310, 160, prims);
    },
    leyenda: (paso) =>
      [
        "Un gas recorre un ciclo y vuelve a como estaba.",
        "Se expande a presión alta…",
        "…se enfría…",
        "…y se comprime a presión baja.",
        `El área encerrada es el trabajo que hace en cada vuelta: ${num(v.w)} J.`,
        `Toma ${num(v.qc)} J del foco caliente, hace ${num(v.w)} J de trabajo y tira ${num(qf)} J al frío: rendimiento ${num(eta, 1)} %.`,
      ][paso] ?? null,
    alternativa: `Ciclo de una máquina térmica: toma ${v.qc} J, hace ${v.w} J de trabajo, rendimiento ${num(eta, 1)} %.`,
  };
}

// ---------- 14) Fluidos: presión, prensa y flotación ----------
function fluido(v: VisualDinamiaFluido): Escena | null {
  if (v.modo === "presion") {
    const prof = (v.profundidades ?? []).filter((x) => esNum(x, 0, 100));
    if (prof.length === 0 || prof.length > 5) return null;
    const max = Math.max(...prof, 10);
    const Y = (h: number) => 30 + (130 * h) / max;
    return {
      pasos: prof.length,
      ms: 1400,
      dibujar: (paso, t) => {
        const prims: Primitiva[] = [{ t: "rect", x: 60, y: 30, w: 140, h: 130, fill: "#3B82F6", op: 0.22 }, { t: "camino", d: "M60 20 L60 160 L200 160 L200 20", stroke: "texto2", sw: 2 }];
        const h = paso === 0 ? 0 : lerp(paso === 1 ? 0 : prof[paso - 2], prof[paso - 1], suave(t));
        prims.push({ t: "circulo", cx: 130, cy: r(Y(h)), r: 8, fill: NARANJA }, { t: "linea", x1: 60, y1: r(Y(h)), x2: 210, y2: r(Y(h)), stroke: NARANJA, sw: 1, dash: "3 3" });
        prims.push(texto(214, Y(h) + 4, `${num(h, 1)} m`, { size: 10, anchor: "start", bold: true }));
        prims.push(...barra(265, 160, (h * 10 * 120) / (max * 10), 120, "acento", "kPa", `${num(h * 10, 1)}`));
        return dib(300, 180, prims);
      },
      leyenda: (paso) => (paso === 0 ? "Cuanto más hondo, más agua arriba empujando." : `A ${num(prof[paso - 1])} m: P = ρ · g · h = 1000 · 10 · ${num(prof[paso - 1])} = ${num(prof[paso - 1] * 10, 1)} kPa`),
      alternativa: `Presión del agua a ${prof.join(", ")} metros: sube 10 kPa por metro.`,
    };
  }
  if (v.modo === "prensa") {
    if (!esNum(v.f1, 1, 1e5) || !esNum(v.a1, 0.001, 10) || !esNum(v.a2, 0.001, 100) || v.a2 <= v.a1) return null;
    const f1 = v.f1;
    const k = v.a2 / v.a1;
    const F2 = f1 * k;
    return {
      pasos: 2,
      ms: 1600,
      dibujar: (paso, t) => {
        const e = paso === 2 ? suave(t) : 0;
        const baja = 40 * e;
        const sube = baja / k;
        const anchoG = 40 + Math.min(80, 40 * Math.sqrt(k));
        const prims: Primitiva[] = [{ t: "camino", d: `M40 60 L40 150 L${r(110 + anchoG)} 150 L${r(110 + anchoG)} 60`, stroke: "texto2", sw: 2 }, { t: "rect", x: 41, y: r(70 + baja), w: 28, h: r(79 - baja), fill: "#3B82F6", op: 0.25 }, { t: "rect", x: 70, y: 120, w: r(40 + anchoG), h: 29, fill: "#3B82F6", op: 0.25 }, { t: "rect", x: 110, y: r(70 - sube), w: r(anchoG), h: r(79 + sube), fill: "#3B82F6", op: 0.25 }];
        prims.push({ t: "rect", x: 41, y: r(62 + baja), w: 28, h: 8, fill: "texto2" }, { t: "rect", x: 110, y: r(62 - sube), w: r(anchoG), h: 8, fill: "texto2" });
        if (paso >= 1) prims.push(...flecha(55, 20 + baja, 55, 58 + baja, ROJO, `F₁ ${num(f1)} N`), ...flecha(110 + anchoG / 2, 58 - sube, 110 + anchoG / 2, 14 - sube, VERDE, `F₂ ${num(F2)} N`));
        return dib(300, 160, prims);
      },
      leyenda: (paso) => ["El líquido transmite la presión igual a todas partes (Pascal).", `F₂ = F₁ · (A₂ / A₁) = ${num(f1)} · ${num(k, 2)} = ${num(F2)} N`, `A cambio, el pistón grande sube ${num(k, 2)} veces menos de lo que baja el chico.`][paso] ?? null,
      alternativa: `Prensa hidráulica: ${v.f1} N en ${v.a1} m² levantan ${num(F2)} N en ${v.a2} m².`,
    };
  }
  if (!esNum(v.densidad, 10, 20000) || !esNum(v.liquido, 100, 20000)) return null;
  const dens = v.densidad;
  const liq = v.liquido;
  const frac = Math.min(1, dens / liq);
  const flota = dens < liq;
  return {
    pasos: 2,
    ms: 1600,
    dibujar: (paso, t) => {
      const lado = 50;
      const sup = 70;
      const fondo = 160;
      const yFinal = flota ? sup - lado / 2 + lado * frac : fondo - lado / 2;
      const y = paso === 0 ? 30 : paso === 1 ? lerp(30, sup - lado / 2 + lado * frac * 0.5, suave(t)) : lerp(sup - lado / 2 + lado * frac * 0.5, yFinal, suave(t));
      const prims: Primitiva[] = [{ t: "rect", x: 60, y: sup, w: 180, h: fondo - sup, fill: "#3B82F6", op: 0.22 }, { t: "camino", d: `M60 30 L60 ${fondo} L240 ${fondo} L240 30`, stroke: "texto2", sw: 2 }];
      prims.push(...bloque(150, y, lado, NARANJA, `${num(dens)} kg/m³`));
      if (paso >= 1) {
        const sumergido = limitar((y + lado / 2 - sup) / lado, 0, 1);
        prims.push(...flecha(150, y + lado / 2, 150, y + lado / 2 + 30, ROJO, "Peso"), ...flecha(110, y + lado / 2, 110, y + lado / 2 - 20 - 40 * sumergido * (liq / Math.max(dens, liq)), VERDE, "Empuje"));
      }
      return dib(300, 175, prims);
    },
    leyenda: (paso) => ["Un cuerpo en un líquido recibe un empuje hacia arriba (Arquímedes).", "Cuanto más se hunde, más líquido desaloja y más empuje recibe.", flota ? `Flota con el ${num(frac * 100, 0)} % bajo la superficie: su densidad / la del líquido.` : "Su peso le gana al empuje máximo: se hunde."][paso] ?? null,
    alternativa: `Un cuerpo de ${v.densidad} kg/m³ en un líquido de ${v.liquido} kg/m³ ${flota ? `flota con ${num(frac * 100, 0)} % sumergido` : "se hunde"}.`,
  };
}

// ---------- 15) Caños: continuidad y Torricelli ----------
function tubo(v: VisualDinamiaTubo): Escena | null {
  if (v.modo === "torricelli") {
    if (!esNum(v.h, 0.05, 50)) return null;
    const vel = Math.sqrt(2 * G * v.h);
    return {
      pasos: 2,
      ms: 1600,
      dibujar: (paso, t) => {
        const prims: Primitiva[] = [{ t: "rect", x: 30, y: 30, w: 90, h: 120, fill: "#3B82F6", op: 0.22 }, { t: "camino", d: "M30 20 L30 150 L120 150 L120 20", stroke: "texto2", sw: 2 }];
        prims.push({ t: "linea", x1: 128, y1: 30, x2: 128, y2: 130, stroke: NARANJA, sw: 1.5 }, texto(132, 82, `h = ${num(v.h!)} m`, { size: 10, anchor: "start", bold: true, fill: NARANJA }));
        if (paso >= 1) {
          const k = paso === 1 ? suave(t) : 1;
          const pts = Array.from({ length: 21 }, (_, i) => {
            const q = (i / 20) * k;
            return `${r(120 + q * 160)} ${r(130 + q * q * 40)}`;
          });
          prims.push({ t: "camino", d: "M" + pts.join(" L"), stroke: "#3B82F6", sw: 5, op: 0.8 });
        }
        return dib(300, 175, prims);
      },
      leyenda: (paso) => ["El agua sale por un agujero a una profundidad h.", `Sale tan rápido como si cayera desde h: v = √(2 · g · h) = ${num(vel, 2)} m/s`, "Más profundidad, chorro más rápido."][paso] ?? null,
      alternativa: `Torricelli: con ${v.h} m de agua encima, el chorro sale a ${num(vel, 2)} m/s.`,
    };
  }
  if (!esNum(v.v1, 0.1, 50) || !esNum(v.k, 1, 6)) return null;
  const v2 = v.v1 * v.k;
  return {
    pasos: 2,
    ms: 2200,
    dibujar: (paso, t) => {
      const alto1 = 60;
      const alto2 = alto1 / v.k!;
      const c = 90;
      const prims: Primitiva[] = [{ t: "camino", d: `M10 ${c - alto1 / 2} L120 ${c - alto1 / 2} L170 ${r(c - alto2 / 2)} L290 ${r(c - alto2 / 2)} M10 ${c + alto1 / 2} L120 ${c + alto1 / 2} L170 ${r(c + alto2 / 2)} L290 ${r(c + alto2 / 2)}`, stroke: "texto2", sw: 2.5 }];
      const tiempo = paso + t;
      for (let i = 0; i < 18; i++) {
        let x = (ruido(i) * 280 + tiempo * 40 * (1 + 0)) % 280;
        const ancho = x < 120 ? alto1 : x > 170 ? alto2 : lerp(alto1, alto2, (x - 120) / 50);
        if (x > 145) x = 145 + ((x - 145) * v.k!) % 145;
        const y = c + (ruido(i, 1) - 0.5) * (ancho - 10);
        prims.push({ t: "circulo", cx: r(10 + x), cy: r(y), r: 3, fill: "#3B82F6" });
      }
      if (paso >= 1) prims.push(...flecha(40, 40, 40 + v.v1! * 8, 40, VERDE, `${num(v.v1!)} m/s`), ...flecha(210, c - alto2 / 2 - 18, 210 + Math.min(80, v2 * 8), c - alto2 / 2 - 18, VERDE, `${num(v2)} m/s`));
      return dib(300, 160, prims);
    },
    leyenda: (paso) => ["Por el caño pasa la misma agua por segundo en todos lados (caudal).", `Si el área baja a 1/${num(v.k!)}, la velocidad se multiplica por ${num(v.k!)}: ${num(v.v1!)} → ${num(v2)} m/s`, "A₁ · v₁ = A₂ · v₂: por eso tapas la manguera con el dedo y el chorro sale más rápido."][paso] ?? null,
    alternativa: `Continuidad: el agua pasa de ${v.v1} m/s a ${num(v2)} m/s cuando el área se reduce ${v.k} veces.`,
  };
}

export function escenaDinamia(v: VisualDinamia): Escena | null {
  switch (v.tipo) {
    case "dinamia.trayecto":
      return trayecto(v);
    case "dinamia.grafica":
      return grafica(v);
    case "dinamia.caida":
      return caida(v);
    case "dinamia.parabola":
      return parabola(v);
    case "dinamia.vectores":
      return vectores(v);
    case "dinamia.cuerpoLibre":
      return cuerpoLibre(v);
    case "dinamia.poleas":
      return poleas(v);
    case "dinamia.circular":
      return circular(v);
    case "dinamia.energia":
      return energia(v);
    case "dinamia.choque":
      return choque(v);
    case "dinamia.termometro":
      return termometro(v);
    case "dinamia.particulas":
      return particulas(v);
    case "dinamia.ciclo":
      return ciclo(v);
    case "dinamia.fluido":
      return fluido(v);
    case "dinamia.tubo":
      return tubo(v);
    default:
      return null;
  }
}
