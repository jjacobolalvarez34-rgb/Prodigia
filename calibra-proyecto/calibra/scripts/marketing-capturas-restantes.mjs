import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OSCURAS = path.join(RAIZ, "docs", "marketing", "assets", "pantallas-oscuras");
const REALES = path.join(RAIZ, "docs", "marketing", "assets", "pantallas-reales");

function leerEnv(nombre) {
  const contenido = readFileSync(path.join(RAIZ, nombre), "utf-8");
  const vars = {};
  for (const linea of contenido.split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

const BASE = "http://localhost:3000";
const env = leerEnv(".env.local");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  const cookieInvitado = {
    name: `sb-${ref}-auth-token`,
    value: "base64-" + Buffer.from(JSON.stringify(data.session), "utf-8").toString("base64url"),
    domain: "localhost",
    path: "/",
    secure: false,
    sameSite: "Lax",
  };
  const cookieLocale = { name: "NEXT_LOCALE", value: "es", domain: "localhost", path: "/", sameSite: "Lax" };

  const browser = await chromium.launch();
  const shot = async (page, ruta, nombre) => {
    await page.evaluate(() => window.stop?.()).catch(() => {});
    await new Promise((r) => setTimeout(r, 1100));
    await page.screenshot({ path: path.join(ruta, nombre), type: "png" });
    console.log("  ✓ " + nombre);
  };

  const rutas = [
    ["10-home-principal.png", "/es"],
    ["11-ranking-semanal.png", "/es/leaderboard"],
    ["12-reto-diario.png", "/es/reto-diario"],
    ["32-reto-semanal.png", "/es/reto-semanal"],
    ["13-tienda-bazar.png", "/es/tienda"],
    ["31-trastienda-ruleta.png", "/es/trastienda"],
    ["14-perfil-invitado.png", "/es/perfil"],
  ];

  // Contexto dark, sesión compartida, onboarding una vez
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-AR", colorScheme: "dark" });
    await context.addCookies([cookieInvitado, cookieLocale]);
    await context.addInitScript(() => localStorage.setItem("prodigia-theme", "dark"));
    let page = await context.newPage();
    const onb = await (async () => {
      await navegar(page, BASE + "/es");
      await page.waitForTimeout(2500);
      const hay = await page.locator('input[type="text"]').count();
      if (hay === 0) return false;
      await page.locator('input[type="text"]').first().fill("Jugador Invitado");
      await page.locator('button[type="submit"], button').filter({ hasText: /siguiente|continuar|guardar/i }).first().click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1500);
      await shot(page, OSCURAS, "06-onboarding-elegir-2-mundos.png");
      await page.locator("button").filter({ hasText: /numeria/i }).first().click({ timeout: 8000 }).catch(() => {});
      await page.locator("button").filter({ hasText: /melodía|melodia/i }).first().click({ timeout: 8000 }).catch(() => {});
      await page.locator("button").filter({ hasText: /comenzar|empezar/i }).first().click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(2500);
      return true;
    })();
    if (!onb) await shot(page, OSCURAS, "10-home-principal.png");

    for (const [nombre, rutaUrl] of rutas) {
      let ok = false;
      for (let i = 0; i < 3 && !ok; i++) {
        try {
          page = await context.newPage();
          await navegar(page, BASE + rutaUrl);
          await page.waitForTimeout(2200);
          await shot(page, OSCURAS, nombre);
          ok = true;
        } catch (e) {
          console.warn("  (reintento " + nombre + "): " + e.message.split("\n")[0]);
          await context.close().catch(() => {});
          const nuevo = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-AR", colorScheme: "dark" });
          await nuevo.addCookies([cookieInvitado, cookieLocale]);
          await nuevo.addInitScript(() => localStorage.setItem("prodigia-theme", "dark"));
          page = await nuevo.newPage();
        }
      }
    }
    await context.close().catch(() => {});
  }

  // Demos dark
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-AR", colorScheme: "dark" });
    await context.addCookies([cookieInvitado, cookieLocale]);
    await context.addInitScript(() => localStorage.setItem("prodigia-theme", "dark"));
    const demos = [
      ["23-demo-numeria-sprint.png", "numeria"],
      ["24-demo-melodia-figuras.png", "melodia"],
      ["25-demo-enigmia-logica.png", "enigmia"],
      ["26-demo-quimia-elementos.png", "quimia"],
      ["27-demo-historia-cronologia.png", "historia"],
      ["28-demo-anatomia-huesos.png", "anatomia"],
      ["29-demo-geografia-mapa.png", "geografia"],
      ["30-demo-trigonometria-triangulo.png", "trigonometria"],
    ];
    for (const [nombre, mundo] of demos) {
      let ok = false;
      for (let i = 0; i < 3 && !ok; i++) {
        try {
          const page = await context.newPage();
          await page.goto(`${BASE}/es/demo/${mundo}`, { waitUntil: "domcontentloaded", timeout: 90000 });
          await page.waitForTimeout(3200);
          await shot(page, OSCURAS, nombre);
          ok = true;
          break;
        } catch (e) {
          console.warn("  (reintento demo " + mundo + "): " + e.message.split("\n")[0]);
        }
      }
    }
    await context.close().catch(() => {});
  }

  // Perfil light (quedó fallando)
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-AR", colorScheme: "light" });
    await context.addCookies([cookieInvitado, cookieLocale]);
    await context.addInitScript(() => localStorage.setItem("prodigia-theme", "light"));
    let ok = false;
    for (let i = 0; i < 3 && !ok; i++) {
      try {
        const page = await context.newPage();
        await page.goto(`${BASE}/es/perfil`, { waitUntil: "domcontentloaded", timeout: 90000 });
        await page.waitForTimeout(2600);
        await shot(page, REALES, "14-perfil-invitado.png");
        ok = true;
      } catch (e) {
        console.warn("  (reintento perfil light): " + e.message.split("\n")[0]);
      }
    }
    await context.close().catch(() => {});
  }

  await browser.close();
  console.log("LISTO");
}

async function navegar(page, url) {
  let ultimo;
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
      return;
    } catch (e) {
      ultimo = e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw ultimo;
}

main().catch((e) => { console.error(e.message.split("\n")[0]); process.exit(1); });