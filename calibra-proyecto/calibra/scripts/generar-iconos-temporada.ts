// Íconos de la app para cada festividad (2026-10-17). Mismo logo que el ícono normal
// (mobile/scripts/generar-iconos.mjs), con el resplandor y las partículas de la fecha
// en el fondo y el accesorio de la fiesta sobre la C (o su emblema en una esquina).
// Se generan las 16; la app solo cambia el ícono en las que estén activadas en
// mobile/plugins/iconos-temporada.js (por ahora Halloween y Navidad).
//
// Uso (desde calibra/): npx tsx --tsconfig tsconfig.json scripts/generar-iconos-temporada.ts ../mobile/assets/iconos-temporada [id …]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { ACCESORIOS, PARTICULAS, type Dibujo } from "../src/lib/temas/dibujos";
import { TEMAS, type Tema } from "../src/lib/temas/temas";
import type { IdTema } from "../src/lib/temas/calendario";

const salida = process.argv[2];
const soloEstos = process.argv.slice(3) as IdTema[];
const FONDO = "#07080D";
const COLOR_C = "#7C5CFF";

// Densidades de Android: ícono clásico (48 dp) y capas del adaptativo (108 dp).
const DENSIDADES: [string, number][] = [
  ["mdpi", 1],
  ["hdpi", 1.5],
  ["xhdpi", 2],
  ["xxhdpi", 3],
  ["xxxhdpi", 4],
];

function formas(d: Dibujo): string {
  return d.formas
    .map((f) => `<path d="${f.d}" fill="${f.relleno ?? "none"}"${f.trazo ? ` stroke="${f.trazo}" stroke-width="${f.ancho ?? 1}" stroke-linecap="round" stroke-linejoin="round"` : ""}${f.opacidad != null ? ` opacity="${f.opacidad}"` : ""}/>`)
    .join("");
}

// Pseudoazar con semilla (las partículas quedan siempre en el mismo lugar).
function azar(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function fondo(t: Tema): string {
  const tipo = t.particulas?.tipo ?? "estrella";
  const dibujo = PARTICULAS[tipo];
  const colores = t.particulas?.colores ?? [t.acento];
  const r = azar(t.id.length * 97 + 5);
  let piezas = "";
  // Un anillo de partículas alrededor del logo, dentro de la zona que muestran los launchers.
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.35;
    const radio = 250 + r() * 70;
    const x = 512 + Math.cos(a) * radio;
    const y = 512 + Math.sin(a) * radio;
    const lado = 44 + r() * 34;
    const k = lado / dibujo.ancho;
    const color = colores[i % colores.length];
    const conColor = { ...dibujo, formas: dibujo.formas.map((f, j) => (j === 0 && f.relleno ? { ...f, relleno: color } : f)) };
    piezas += `<g transform="translate(${x - lado / 2} ${y - lado / 2}) rotate(${(r() - 0.5) * 60} ${lado / 2} ${lado / 2}) scale(${k})" opacity="${0.45 + r() * 0.3}">${formas(conColor)}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="luz" cx="50%" cy="42%" r="58%"><stop offset="0%" stop-color="${t.acento}" stop-opacity="0.5"/><stop offset="55%" stop-color="${t.acento}" stop-opacity="0.12"/><stop offset="100%" stop-color="${FONDO}" stop-opacity="0"/></radialGradient>
    <radialGradient id="luz2" cx="78%" cy="84%" r="50%"><stop offset="0%" stop-color="${t.acento2}" stop-opacity="0.35"/><stop offset="100%" stop-color="${FONDO}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="${FONDO}"/><rect width="1024" height="1024" fill="url(#luz)"/><rect width="1024" height="1024" fill="url(#luz2)"/>
  ${piezas}
</svg>`;
}

// Logo (igual que generar-iconos.mjs) + accesorio. El logo se centra por su caja real
// en el navegador; el accesorio se ubica después, relativo a la caja del logo.
function frente(t: Tema): string {
  const acc = t.accesorio ? ACCESORIOS[t.accesorio] : null;
  const emblema = !acc ? PARTICULAS[t.particulas?.tipo ?? "estrella"] : null;
  const colorEmblema = t.particulas?.colores?.[0] ?? t.acento;
  const conColor = emblema ? { ...emblema, formas: emblema.formas.map((f, j) => (j === 0 && f.relleno ? { ...f, relleno: colorEmblema } : f)) } : null;
  return `<svg id="s" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A794FF"/><stop offset="50%" stop-color="#E4CBA0"/><stop offset="100%" stop-color="#FFC53D"/>
    </linearGradient>
    <path id="arm" d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z"/>
  </defs>
  <g id="marca">
    <circle cx="50" cy="50" r="34" fill="none" stroke="${COLOR_C}" stroke-width="14" stroke-dasharray="158.6 55" stroke-dashoffset="27.5" transform="rotate(82 50 50)"/>
    <g transform="translate(82 44) rotate(14)" fill="url(#g)">
      <use href="#arm"/><use href="#arm" transform="rotate(180) scale(0.33)"/><use href="#arm" transform="rotate(84) scale(0.2)"/><use href="#arm" transform="rotate(268) scale(0.15)"/>
    </g>
  </g>
  ${acc ? `<g id="acc" data-lugar="${acc.lugar}" data-ancho="${acc.ancho}">${formas({ ...acc, formas: acc.formas.map((f) => ({ ...f, relleno: f.relleno ? "#000000" : undefined, trazo: f.trazo ? "#000000" : undefined, opacidad: 0.35 })) }).replace(/<path /g, '<path transform="translate(0.6 1.2)" ')}${formas(acc)}</g>` : ""}
  ${conColor ? `<g id="emb" data-ancho="${conColor.ancho}">${formas(conColor)}</g>` : ""}
</svg>`;
}

// Ubica el logo y el accesorio (corre en el navegador).
function ubicar() {
  const g = document.getElementById("marca") as unknown as SVGGElement;
  const b = g.getBBox();
  const lado = 1024 * 0.4;
  const k = lado / Math.max(b.width, b.height);
  const cx = 512;
  const cy = 540;
  g.setAttribute("transform", `translate(${cx - (b.x + b.width / 2) * k} ${cy - (b.y + b.height / 2) * k}) scale(${k})`);
  // Caja del anillo de la C (círculo de radio 34 + trazo, centro 50,50) en píxeles.
  const centroX = cx - (b.x + b.width / 2) * k + 50 * k;
  const centroY = cy - (b.y + b.height / 2) * k + 50 * k;
  const radio = 41 * k;
  const acc = document.getElementById("acc");
  if (acc) {
    const ancho = Number(acc.dataset.ancho);
    if (acc.dataset.lugar === "cabeza") {
      // Sobre la C, un poco a la izquierda (la chispa está arriba a la derecha) y ladeado.
      const tam = radio * 1.75;
      const s = tam / ancho;
      acc.setAttribute("transform", `translate(${centroX - tam * 0.62} ${centroY - radio - tam * 0.66}) rotate(-12 ${tam / 2} ${tam}) scale(${s})`);
    } else {
      // Sobre el centro de la C, como una cara.
      const tam = radio * 1.5;
      const s = tam / ancho;
      acc.setAttribute("transform", `translate(${centroX - tam / 2} ${centroY - tam * 0.5}) scale(${s})`);
    }
  }
  const emb = document.getElementById("emb");
  if (emb) {
    const tam = radio * 0.95;
    const s = tam / Number(emb.dataset.ancho);
    emb.setAttribute("transform", `translate(${centroX + radio * 0.45} ${centroY + radio * 0.3}) scale(${s})`);
  }
}

async function main() {
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1024, height: 1024 } });

const foto = async (cuerpo: string, ruta: string, opciones: { lado?: number; redonda?: boolean; monocromo?: boolean; conUbicar?: boolean } = {}) => {
  const lado = opciones.lado ?? 1024;
  await pagina.setViewportSize({ width: lado, height: lado });
  // Todo se dibuja en 1024 y se achica con zoom (así el logo se ubica igual en cada tamaño).
  const estilo = `width:1024px;height:1024px;display:block;zoom:${lado / 1024};${opciones.redonda ? "clip-path:circle(50%);" : ""}${opciones.monocromo ? "filter:brightness(0) invert(1);" : ""}`;
  await pagina.setContent(`<html><body style="margin:0;background:transparent"><div id="caja" style="${estilo}">${cuerpo}</div></body></html>`);
  if (opciones.conUbicar) await pagina.evaluate(ubicar);
  await pagina.screenshot({ path: ruta, omitBackground: true, clip: { x: 0, y: 0, width: lado, height: lado } });
};

// Ícono clásico (cuadrado o redondo): fondo y frente superpuestos.
function compuesto(t: Tema): string {
  return `<div style="position:relative;width:1024px;height:1024px">${fondo(t).replace("<svg ", '<svg style="position:absolute;inset:0" ')}${frente(t).replace("<svg ", '<svg style="position:absolute;inset:0" ')}</div>`;
}

for (const t of Object.values(TEMAS)) {
  if (soloEstos.length && !soloEstos.includes(t.id)) continue;
  const dir = `${salida}/${t.id}`;
  mkdirSync(dir, { recursive: true });
  // Muestra grande (para ver cómo queda); lo que usa Android está en res/.
  await foto(compuesto(t), `${dir}/icono.png`, { lado: 512, conUbicar: true });
  for (const [dpi, f] of DENSIDADES) {
    const d = `${dir}/res/mipmap-${dpi}`;
    mkdirSync(d, { recursive: true });
    const n = t.id;
    await foto(fondo(t), `${d}/ic_launcher_${n}_fondo.png`, { lado: Math.round(108 * f) });
    await foto(frente(t), `${d}/ic_launcher_${n}_frente.png`, { lado: Math.round(108 * f), conUbicar: true });
    await foto(frente(t), `${d}/ic_launcher_${n}_monocromo.png`, { lado: Math.round(108 * f), conUbicar: true, monocromo: true });
    await foto(compuesto(t), `${d}/ic_launcher_${n}.png`, { lado: Math.round(48 * f), conUbicar: true });
    await foto(compuesto(t), `${d}/ic_launcher_${n}_redondo.png`, { lado: Math.round(48 * f), conUbicar: true, redonda: true });
  }
  console.log("listo", t.id);
}
await navegador.close();
}

void main();
