// Graba los marcos animados (marcos.js) cuadro por cuadro y los pasa a WebP animado con
// transparencia: public/marcos/<id>.webp (animado) y <id>.png (quieto, para listas
// chicas y «Animaciones livianas»). Uso: node scripts/marcos/render.mjs [id...]
// Necesita Playwright (PLAYWRIGHT_BROWSERS_PATH) y Python con Pillow (codificar.py).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "public", "marcos");
const CUADROS = join(process.env.TEMP ?? AQUI, "prodigia-marcos-cuadros");
// 15 cuadros por segundo: todos los ciclos (2, 2,4, 3 y 4 s) dan un número entero de
// cuadros. 320 px: nítido hasta un avatar de ~90 px en pantallas 3x, y 300-800 KB.
const FPS = 15;
const LADO = 320; // px del archivo final (el marco ocupa 1,6 veces el avatar)
const CUADRO_QUIETO = 0.35; // fracción del ciclo para la imagen quieta

mkdirSync(SALIDA, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.goto("file:///" + join(AQUI, "vista.html").replace(/\\/g, "/") + "?t=0");
const ids = process.argv.slice(2).length ? process.argv.slice(2) : await pagina.evaluate(() => Object.keys(window.MARCOS.lista));

for (const id of ids) {
  const T = await pagina.evaluate((i) => window.MARCOS.lista[i].T, id);
  const n = Math.round(T * FPS);
  const dir = join(CUADROS, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (let k = 0; k < n; k++) {
    const url = await pagina.evaluate(([i, t, lado]) => {
      const c = document.createElement("canvas");
      c.width = lado; c.height = lado;
      window.dibujarMarco(i, c, t);
      return c.toDataURL("image/png");
    }, [id, (k / n) * T, LADO]);
    writeFileSync(join(dir, `c${String(k).padStart(3, "0")}.png`), Buffer.from(url.split(",")[1], "base64"));
  }
  const webp = join(SALIDA, `${id}.webp`);
  // Los que cambian en todo el cuadro (nieve, órbitas) bajan un poco la calidad para no pasar de ~800 KB.
  const calidad = { escarcha: 56, orbita: 58 }[id] ?? 66;
  execFileSync("python", [join(AQUI, "codificar.py"), dir, webp, String(FPS), String(calidad)]);
  const quieto = await pagina.evaluate(([i, t, lado]) => {
    const c = document.createElement("canvas");
    c.width = lado; c.height = lado;
    window.dibujarMarco(i, c, t);
    return c.toDataURL("image/png");
  }, [id, CUADRO_QUIETO * T, LADO]);
  writeFileSync(join(SALIDA, `${id}.png`), Buffer.from(quieto.split(",")[1], "base64"));
  console.log(`${id}: ${n} cuadros · ${(statSync(webp).size / 1024).toFixed(0)} KB animado · ${(statSync(join(SALIDA, `${id}.png`)).size / 1024).toFixed(0)} KB quieto`);
}
await navegador.close();
