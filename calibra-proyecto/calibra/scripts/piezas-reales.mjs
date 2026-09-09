import { chromium } from "playwright";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const dir = join(raiz, "docs", "marketing", "assets", "piezas");
const tamanos = { square: [1080, 1080], story: [1080, 1920], banner: [1200, 630] };

const htmls = readdirSync(dir).filter((f) => f.endsWith(".html"));

async function main() {
  const browser = await chromium.launch();
  try {
    for (const f of htmls) {
      const etiqueta = /(square|story|banner)/.exec(f)?.[1];
      const tam = etiqueta ? tamanos[etiqueta] : null;
      if (!tam) {
        console.log("skip (sin formato conocido): " + f);
        continue;
      }
      const page = await browser.newPage({ viewport: { width: tam[0], height: tam[1] } });
      await page.goto(pathToFileURL(join(dir, f)).href, { waitUntil: "load" });
      await page.screenshot({ path: join(dir, f.replace(/\.html$/, ".png")), type: "png" });
      console.log("OK " + f + " -> " + f.replace(/\.html$/, ".png") + " (" + tam[0] + "x" + tam[1] + ")");
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log("LISTO");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});