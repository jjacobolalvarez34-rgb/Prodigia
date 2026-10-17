import type { FormaIlustracion } from "@/lib/tienda/ilustracionesPaquetes";
import type { AdornoCiudad } from "./temas";

// Adornos de temporada sobre una ciudad (docs/eventos/PLAN_FESTIVIDADES.md, capa 2):
// a partir de los edificios que ya dibuja cada plataforma (x, ancho, alto, con el piso
// en `alto`) arma las formas de la nieve en los techos, las guirnaldas de luces, las
// calabazas, los faroles… La ciudad de abajo no cambia; esto va encima. Mismo
// resultado en la web y en la app (siempre igual para la misma ciudad).

export interface EdificioCiudad {
  x: number;
  w: number;
  h: number;
}

function azar(semilla: string) {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const c = (x: number, y: number, r: number) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${(r * 2).toFixed(1)} 0a${r} ${r} 0 1 0 ${(-r * 2).toFixed(1)} 0z`;
const n = (v: number) => v.toFixed(1);

// `escala`: tamaño de los adornos (1 = ciudades chicas de la app, ~100 px de alto).
export function adornosCiudad(edificios: EdificioCiudad[], ancho: number, alto: number, tipos: AdornoCiudad[], semilla = "ciudad", escala = 1): FormaIlustracion[] {
  const r = azar(semilla + tipos.join(","));
  const k = escala;
  const formas: FormaIlustracion[] = [];
  const techos = edificios.map((e) => ({ x: e.x, w: e.w, y: alto - e.h }));
  for (const tipo of tipos) {
    if (tipo === "nieve_techos") {
      let d = "";
      for (const t of techos) d += `M${n(t.x - k)} ${n(t.y + k)}q${n(t.w * 0.25)} ${n(-3.5 * k)} ${n(t.w * 0.5)} ${n(-1.5 * k)}q${n(t.w * 0.3)} ${n(-2.5 * k)} ${n(t.w * 0.5 + 2 * k)} ${n(k)}v${n(2.5 * k)}h${n(-(t.w + 2 * k))}z`;
      formas.push({ d, relleno: "#F4F8FF" });
    } else if (tipo === "luces") {
      const colores = ["#FF5D5D", "#FFD36B", "#3DDC97", "#5DE4FF"];
      const brillo: Record<string, string> = {};
      const foco: Record<string, string> = {};
      let cable = "";
      techos.forEach((t, ti) => {
        if (t.w < 8 * k) return;
        const y = t.y + 2.6 * k;
        cable += `M${n(t.x + 1.5 * k)} ${n(y - 0.8 * k)}H${n(t.x + t.w - 1.5 * k)}`;
        const cuantos = Math.max(2, Math.floor((t.w - 3 * k) / (4.5 * k)));
        for (let f = 0; f <= cuantos; f++) {
          const x = t.x + 1.5 * k + ((t.w - 3 * k) * f) / cuantos;
          const col = colores[(f + ti) % colores.length];
          brillo[col] = (brillo[col] ?? "") + c(x, y, 2.6 * k);
          foco[col] = (foco[col] ?? "") + c(x, y, 0.95 * k);
        }
      });
      formas.push({ d: cable, trazo: "#2A2F45", ancho: 0.5 * k });
      for (const col of colores) {
        if (brillo[col]) formas.push({ d: brillo[col], relleno: col, opacidad: 0.22 });
        if (foco[col]) formas.push({ d: foco[col], relleno: col });
      }
    } else if (tipo === "arbol") {
      const x = ancho * (0.2 + r() * 0.6);
      const base = alto;
      const h = Math.min(34 * k, alto * 0.38);
      formas.push({ d: `M${n(x)} ${n(base - h)}l${n(h * 0.42)} ${n(h * 0.85)}h${n(-h * 0.84)}z`, relleno: "#2A9D5C" });
      formas.push({ d: `M${n(x - 1.5 * k)} ${n(base - h * 0.15)}h${n(3 * k)}v${n(h * 0.15)}h${n(-3 * k)}z`, relleno: "#7A4A1A" });
      formas.push({ d: c(x, base - h, 2.2 * k), relleno: "#FFD36B" });
      formas.push({ d: c(x - h * 0.15, base - h * 0.45, 1.2 * k) + c(x + h * 0.2, base - h * 0.3, 1.2 * k) + c(x - h * 0.05, base - h * 0.62, 1.1 * k), relleno: "#FF5D5D" });
    } else if (tipo === "calabazas") {
      let cuerpo = "";
      let cara = "";
      let tallo = "";
      const cuantas = Math.max(3, Math.floor(ancho / 70));
      for (let i = 0; i < cuantas; i++) {
        const x = ((i + 0.5) * ancho) / cuantas + (r() - 0.5) * 20;
        const s = (3.5 + r() * 2.5) * k;
        const y = alto - s * 0.9;
        cuerpo += `M${n(x - s * 1.25)} ${n(y)}a${n(s * 1.25)} ${n(s * 0.95)} 0 1 0 ${n(s * 2.5)} 0a${n(s * 1.25)} ${n(s * 0.95)} 0 1 0 ${n(-s * 2.5)} 0z`;
        cara += `M${n(x - s * 0.6)} ${n(y - s * 0.2)}l${n(s * 0.3)} ${n(-s * 0.35)}l${n(s * 0.3)} ${n(s * 0.35)}zM${n(x + s * 0.05)} ${n(y - s * 0.2)}l${n(s * 0.3)} ${n(-s * 0.35)}l${n(s * 0.3)} ${n(s * 0.35)}zM${n(x - s * 0.6)} ${n(y + s * 0.25)}h${n(s * 1.2)}l${n(-s * 0.3)} ${n(s * 0.3)}h${n(-s * 0.6)}z`;
        tallo += `M${n(x - 0.6 * k)} ${n(y - s * 0.95)}h${n(1.2 * k)}v${n(-s * 0.4)}h${n(-1.2 * k)}z`;
      }
      formas.push({ d: cuerpo, relleno: "#FF8A1F" }, { d: cara, relleno: "#FFE08A" }, { d: tallo, relleno: "#3A7D44" });
    } else if (tipo === "luna_llena") {
      const x = ancho * 0.82;
      const y = alto * 0.22;
      formas.push({ d: c(x, y, 16 * k), relleno: "#FFE9B8", opacidad: 0.18 }, { d: c(x, y, 10 * k), relleno: "#FFF1CF" }, { d: c(x - 3 * k, y - 2 * k, 2 * k) + c(x + 3 * k, y + 3 * k, 1.4 * k), relleno: "#E8D3A0", opacidad: 0.7 });
    } else if (tipo === "papel_picado" || tipo === "serpentinas" || tipo === "faroles" || tipo === "linternas") {
      const colores = tipo === "faroles" ? ["#E63946"] : tipo === "linternas" ? ["#FFB347"] : ["#FF5D8F", "#FF9F1C", "#3DDC97", "#A794FF", "#5DE4FF"];
      for (let i = 0; i + 2 < techos.length; i += 3) {
        const a = techos[i];
        const b = techos[i + 2];
        const x1 = a.x + a.w * 0.7;
        const y1 = a.y + 3 * k;
        const x2 = b.x + b.w * 0.3;
        const y2 = b.y + 3 * k;
        const caida = Math.abs(x2 - x1) * 0.16 + 4 * k;
        const mx = (x1 + x2) / 2;
        const cy = Math.max(y1, y2) + caida * 2;
        formas.push({ d: `M${n(x1)} ${n(y1)}Q${n(mx)} ${n(cy)} ${n(x2)} ${n(y2)}`, trazo: tipo === "serpentinas" ? colores[i % colores.length] : "#3A3F55", ancho: (tipo === "serpentinas" ? 1.5 : 0.6) * k });
        if (tipo === "serpentinas") {
          formas.push({ d: `M${n(x1)} ${n(y1 + 3 * k)}Q${n(mx)} ${n(cy + 5 * k)} ${n(x2)} ${n(y2 + 3 * k)}`, trazo: colores[(i + 2) % colores.length], ancho: 1.5 * k });
          continue;
        }
        const cuantos = Math.max(3, Math.floor(Math.hypot(x2 - x1, y2 - y1) / ((tipo === "papel_picado" ? 6.5 : 9) * k)));
        const q = (v: number) => n(v * k);
        for (let f = 1; f < cuantos; f++) {
          const t = f / cuantos;
          const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
          const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
          const col = colores[(f + i) % colores.length];
          if (tipo === "papel_picado") {
            formas.push({ d: `M${n(x - 2.6 * k)} ${n(y)}h${q(5.2)}v${q(4.4)}l${q(-1.3)} ${q(-1.1)} ${q(-1.3)} ${q(1.1)} ${q(-1.3)} ${q(-1.1)} ${q(-1.3)} ${q(1.1)}z`, relleno: col });
          } else if (tipo === "faroles") {
            formas.push({ d: c(x, y + 4.4 * k, 4.6 * k), relleno: col, opacidad: 0.25 });
            formas.push({ d: `M${n(x - 2.2 * k)} ${n(y + k)}h${q(4.4)}v${q(0.9)}h${q(-4.4)}zM${n(x - 2.2 * k)} ${n(y + 7.2 * k)}h${q(4.4)}v${q(0.9)}h${q(-4.4)}z`, relleno: "#FFC53D" });
            formas.push({ d: `M${n(x - 2.8 * k)} ${n(y + 4.5 * k)}a${q(2.8)} ${q(2.7)} 0 1 0 ${q(5.6)} 0a${q(2.8)} ${q(2.7)} 0 1 0 ${q(-5.6)} 0z`, relleno: col });
          } else {
            formas.push({ d: c(x, y + 3.5 * k, 4 * k), relleno: col, opacidad: 0.25 });
            formas.push({ d: `M${n(x - 1.7 * k)} ${n(y + k)}h${q(3.4)}l${q(0.8)} ${q(4.8)}h${q(-5)}z`, relleno: col });
          }
        }
      }
    } else if (tipo === "corazones" || tipo === "diyas") {
      let d = "";
      for (const t of techos) {
        if (r() < 0.45) continue;
        const x = t.x + 3 * k + r() * Math.max(1, t.w - 8 * k);
        const y = t.y + 8 * k + r() * 14 * k;
        const q = (v: number) => n(v * k);
        if (tipo === "corazones") d += `M${n(x)} ${n(y + 2.4 * k)}c${q(-2.6)} ${q(-1.8)} ${q(-3.3)} ${q(-3.2)} ${q(-2.6)} ${q(-4.2)}c${q(0.6)} ${q(-0.9)} ${q(1.9)} ${q(-0.9)} ${q(2.6)} ${q(0.3)}c${q(0.7)} ${q(-1.2)} ${q(2)} ${q(-1.2)} ${q(2.6)} ${q(-0.3)}c${q(0.7)} ${q(1)} 0 ${q(2.4)} ${q(-2.6)} ${q(4.2)}z`;
        else d += `M${n(x)} ${n(y - 2.6 * k)}c${q(1)} ${q(1.3)} ${q(1.3)} ${q(2.4)} 0 ${q(3.2)}c${q(-1.3)} ${q(-0.8)} ${q(-1)} ${q(-1.9)} 0 ${q(-3.2)}zM${n(x - 2 * k)} ${n(y + 0.8 * k)}h${q(4)}l${q(-0.6)} ${q(1.2)}h${q(-2.8)}z`;
      }
      formas.push({ d, relleno: tipo === "corazones" ? "#FF5D8F" : "#FFB347" });
    } else if (tipo === "huevos") {
      const cuantos = Math.max(3, Math.floor(ancho / 60));
      const colores = ["#9BE7FF", "#FFB3C7", "#FFD36B", "#B8F2C8"];
      for (let i = 0; i < cuantos; i++) {
        const x = ((i + 0.5) * ancho) / cuantos + (r() - 0.5) * 18;
        const q = (v: number) => n(v * k);
        formas.push({ d: `M${n(x)} ${n(alto - 7.5 * k)}c${q(2.2)} 0 ${q(3.4)} ${q(3)} ${q(3.4)} ${q(5)}a${q(3.4)} ${q(3.4)} 0 0 1 ${q(-6.8)} 0c0 ${q(-2)} ${q(1.2)} ${q(-5)} ${q(3.4)} ${q(-5)}z`, relleno: colores[i % colores.length] });
      }
    } else if (tipo === "plantas") {
      let d = "";
      for (const t of techos) {
        if (r() < 0.5) continue;
        const x = t.x + t.w / 2;
        d += c(x - 2.5 * k, t.y - 1.5 * k, 2.4 * k) + c(x + 1.5 * k, t.y - 2.5 * k, 2.8 * k) + c(x + 4 * k, t.y - k, 2 * k);
      }
      formas.push({ d, relleno: "#3DDC97" });
    } else if (tipo === "fuegos") {
      const colores = ["#FFC53D", "#FF5D8F", "#5DE4FF", "#A794FF"];
      for (let i = 0; i < 3; i++) {
        const x = ancho * (0.15 + 0.35 * i + r() * 0.1);
        const y = alto * (0.12 + r() * 0.18);
        const rad = (7 + r() * 6) * k;
        let d = "";
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          d += `M${n(x + Math.cos(a) * rad * 0.35)} ${n(y + Math.sin(a) * rad * 0.35)}L${n(x + Math.cos(a) * rad)} ${n(y + Math.sin(a) * rad)}`;
        }
        formas.push({ d, trazo: colores[i % colores.length], ancho: 1.1 * k, opacidad: 0.9 });
      }
    } else if (tipo === "polvo_colores") {
      const colores = ["#FF5D8F", "#FFC53D", "#3DDC97", "#5DE4FF", "#A794FF"];
      for (const t of techos) {
        if (r() < 0.4) continue;
        formas.push({ d: c(t.x + r() * t.w, t.y + (6 + r() * 16) * k, (3 + r() * 3) * k), relleno: colores[Math.floor(r() * colores.length)], opacidad: 0.55 });
      }
    }
  }
  return formas;
}
