import { chromium } from "playwright";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const dir = join(raiz, "docs", "marketing", "assets", "piezas");
const archivos = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage();
for (const f of archivos) {
  await page.goto(pathToFileURL(join(dir, f)).href);
  const res = await page.evaluate(async () => {
    const img = document.querySelector("img");
    if (!img) return { err: "sin img" };
    await img.decode().catch(() => {});
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 64) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    return { w: c.width, h: c.height, prom: [Math.round(r / n), Math.round(g / n), Math.round(b / n)] };
  });
  console.log(f, JSON.stringify(res));
}
await browser.close();