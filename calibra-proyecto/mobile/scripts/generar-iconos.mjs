// Genera los íconos de la app (fondo negro, logo centrado por su caja real; 2026-10-16).
// Uso (desde calibra/, que tiene Playwright): node ../mobile/scripts/generar-iconos.mjs ../mobile/assets/images
import { chromium } from "playwright";

const salida = process.argv[2];
const colorC = process.argv[3] ?? "#7C5CFF";
const FONDO = "#07080D";

function svg({ fondo, fraccion, monocromo }) {
  const relleno = monocromo ? "#FFFFFF" : "url(#g)";
  const trazo = monocromo ? "#FFFFFF" : colorC;
  return `<svg id="s" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A794FF"/><stop offset="50%" stop-color="#E4CBA0"/><stop offset="100%" stop-color="#FFC53D"/>
    </linearGradient>
    <radialGradient id="luz" cx="50%" cy="46%" r="55%">
      <stop offset="0%" stop-color="#2A1F5C" stop-opacity="0.85"/><stop offset="100%" stop-color="${FONDO}" stop-opacity="0"/>
    </radialGradient>
    <path id="arm" d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z"/>
  </defs>
  ${fondo ? `<rect width="1024" height="1024" fill="${FONDO}"/><rect width="1024" height="1024" fill="url(#luz)"/>` : ""}
  <g id="marca" data-fraccion="${fraccion}">
    <circle cx="50" cy="50" r="34" fill="none" stroke="${trazo}" stroke-width="14" stroke-dasharray="158.6 55" stroke-dashoffset="27.5" transform="rotate(82 50 50)"/>
    <g transform="translate(82 44) rotate(14)" fill="${relleno}">
      <use href="#arm"/><use href="#arm" transform="rotate(180) scale(0.33)"/><use href="#arm" transform="rotate(84) scale(0.2)"/><use href="#arm" transform="rotate(268) scale(0.15)"/>
    </g>
  </g>
</svg>`;
}

const piezas = [
  { archivo: "icon.png", fondo: true, fraccion: 0.6 },
  { archivo: "android-icon-foreground.png", fondo: false, fraccion: 0.46 },
  { archivo: "android-icon-monochrome.png", fondo: false, fraccion: 0.46, monocromo: true },
  { archivo: "android-icon-background.png", soloFondo: true },
  { archivo: "muestra-redonda.png", fondo: true, fraccion: 0.46, redonda: true },
];

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1024, height: 1024 } });
for (const p of piezas) {
  const cuerpo = p.soloFondo ? `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${FONDO}"/></svg>` : svg(p);
  await pagina.setContent(`<html><body style="margin:0;background:transparent">${cuerpo}</body></html>`);
  if (!p.soloFondo) {
    // Centrar la marca por su caja real (la C con la chispa), no por el círculo.
    await pagina.evaluate(() => {
      const g = document.getElementById("marca");
      const f = Number(g.dataset.fraccion);
      const b = g.getBBox();
      const lado = 1024 * f;
      const k = lado / Math.max(b.width, b.height);
      const tx = 512 - (b.x + b.width / 2) * k;
      const ty = 512 - (b.y + b.height / 2) * k;
      g.setAttribute("transform", `translate(${tx} ${ty}) scale(${k})`);
    });
  }
  if (p.redonda) await pagina.evaluate(() => (document.getElementById("s").style.clipPath = "circle(50%)"));
  await pagina.screenshot({ path: `${salida}/${p.archivo}`, omitBackground: true, clip: { x: 0, y: 0, width: 1024, height: 1024 } });
}
await navegador.close();
console.log("listo");
