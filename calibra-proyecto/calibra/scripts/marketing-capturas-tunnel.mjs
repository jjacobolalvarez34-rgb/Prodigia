// Marketing — capturas reales de la app a través del tunnel del usuario.
// Abre la app en modo claro y oscuro REAL (localStorage prodigia-theme) y
// guarda PNG curados en docs/marketing/assets/pantallas-reales/ y
// pantallas-oscuras/, usando los mismos nombres descriptivos.
//
// Uso: node scripts/marketing-capturas-tunnel.mjs <URL_DEL_TUNNEL>
//   node scripts/marketing-capturas-tunnel.mjs https://814f2c7c-3000.use2.devtunnels.ms
//
// NOTAS:
// - Requiere .env.local (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) para la
//   sesión de invitado (misma fórmula que login-qa.mjs).
// - Solo toca docs/marketing/assets/pantallas-*. Ninguna línea de la app.
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REALES = path.join(RAIZ, "docs", "marketing", "assets", "pantallas-reales");
const OSCURAS = path.join(RAIZ, "docs", "marketing", "assets", "pantallas-oscuras");

function leerEnv(nombre) {
  const contenido = readFileSync(path.join(RAIZ, nombre), "utf-8");
  const vars = {};
  for (const linea of contenido.split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

const BASE = process.argv[2];
if (!BASE) {
  console.error("Falta URL del tunnel como argumento.");
  process.exit(1);
}

const env = leerEnv(".env.local");
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) throw new Error("Faltan NEXT_PUBLIC_ en .env.local");

async function crearSesionInvitado() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  return {
    nombreCookie: `sb-${ref}-auth-token`,
    valorCookie: "base64-" + Buffer.from(JSON.stringify(data.session), "utf-8").toString("base64url"),
  };
}

async function main() {
  const { nombreCookie, valorCookie } = await crearSesionInvitado();
  const cookieInvitado = {
    name: nombreCookie,
    value: valorCookie,
    domain: new URL(BASE).hostname,
    path: "/",
    secure: BASE.startsWith("https"),
    sameSite: "Lax",
  };
  const cookieLocale = {
    name: "NEXT_LOCALE",
    value: "es",
    domain: new URL(BASE).hostname,
    path: "/",
    secure: BASE.startsWith("https"),
    sameSite: "Lax",
  };

  async function navegar(page, url) {
    let ultimo;
    for (let i = 0; i < 3; i++) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
        return;
      } catch (e) {
        ultimo = e;
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
    console.warn("  (aviso) navegación lenta, sigo igual: " + url);
  }

  const browser = await chromium.launch();
  const tomo = [];
  const shot = async (page, ruta, nombre) => {
    await page.evaluate(() => window.stop?.()).catch(() => {});
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: path.join(ruta, nombre), type: "png" });
    tomo.push(nombre);
    console.log("  ✓ " + nombre);
  };

  const conTema = (tema) =>
    async (log) => {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        locale: "es-AR",
        colorScheme: tema,
      });
      await context.addInitScript((theme) => {
        localStorage.setItem("prodigia-theme", theme);
      }, tema);
      return context;
    };

  const conSesion = async (log, tema) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: "es-AR",
      colorScheme: tema,
    });
    await context.addCookies([cookieInvitado, cookieLocale]);
    await context.addInitScript((theme) => {
      localStorage.setItem("prodigia-theme", theme);
    }, tema);
    return context;
  };

  // 1. Landing (sesión anónima = contexto SIN cookie)
  for (const tema of ["light", "dark"]) {
    const ruta = tema === "dark" ? OSCURAS : REALES;
    const etiqueta = tema === "dark" ? " (dark)" : " (light)";
    console.log("Landing" + etiqueta);
    const context = await conTema(tema)();
    const page = await context.newPage();
    await navegar(page, BASE + "/es");
    await page.waitForTimeout(3500);
    await shot(page, ruta, "01-landing-cold-entry.png");

    // pasar el modal de "conocer prodigia" hacia el intro
    await page.evaluate(() => localStorage.setItem("prodigia-conoce-prodigia", "no"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await shot(page, ruta, "02-landing-asi-es-prodigia.png");

    // intro -> grid hero
    await page
      .locator("button")
      .filter({ hasText: /tutorial|empezar|conocer/i })
      .first()
      .click({ timeout: 8000 })
      .catch(() => {});
    await page.waitForTimeout(2500);
    await shot(page, ruta, "03-landing-hero-8-ciudades.png");

    // grid -> mecanismo (elegir la primera ciudad)
    await page
      .locator("button")
      .filter({ hasText: /numeria/i })
      .first()
      .click({ timeout: 8000 })
      .catch(() => {});
    await page.waitForTimeout(2500);
    await shot(page, ruta, "04-landing-mecanismo-60s.png");
    await context.close();
  }

  // 2. Login y registro (públicos, ambos modos)
  for (const tema of ["light", "dark"]) {
    const ruta = tema === "dark" ? OSCURAS : REALES;
    console.log("Login" + (tema === "dark" ? " (dark)" : ""));
    const context = await conTema(tema)();
    const page = await context.newPage();
    await navegar(page, BASE + "/es/login");
    await page.waitForTimeout(3500);
    await shot(page, ruta, "05-login.png");
    await context.close();
  }

  // 3. Home + resto (con sesión de invitado, ambos modos)
  for (const tema of ["light", "dark"]) {
    const ruta = tema === "dark" ? OSCURAS : REALES;
    console.log("Sesión" + (tema === "dark" ? " (dark)" : ""));
    const context = await conSesion(null, tema);
    const page = await context.newPage();
    const intenta = async (fn, etiqueta) => {
      try {
        await fn();
      } catch (e) {
        console.warn("  (skip " + etiqueta + "): " + e.message.split("\n")[0]);
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
      }
    };
    await navegar(page, BASE + "/es");
    await page.waitForTimeout(3000);

    // onboarding (si aparece): nombre -> 2 mundos -> comenzar
    await intenta(async () => {
      const hayInput = await page.locator('input[type="text"]').count();
      if (hayInput > 0) {
        await page.locator('input[type="text"]').first().fill("Jugador Invitado");
        await page.locator('button[type="submit"], button').filter({ hasText: /siguiente|continuar|guardar/i }).first().click({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const rutaOnb = tema === "dark" ? OSCURAS : REALES;
        await shot(page, rutaOnb, "06-onboarding-elegir-2-mundos.png");
        await page.locator("button").filter({ hasText: /numeria/i }).first().click({ timeout: 8000 }).catch(() => {});
        await page.locator("button").filter({ hasText: /melodía|melodia/i }).first().click({ timeout: 8000 }).catch(() => {});
        await page.locator("button").filter({ hasText: /comenzar|empezar/i }).first().click({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(2500);
      }
    }, "onboarding");
    await shot(page, ruta, "10-home-principal.png");

    await intenta(async () => { await navegar(page, BASE + "/es/leaderboard"); await page.waitForTimeout(2500); await shot(page, ruta, "11-ranking-semanal.png"); }, "leaderboard");
    await intenta(async () => { await navegar(page, BASE + "/es/reto-diario"); await page.waitForTimeout(2500); await shot(page, ruta, "12-reto-diario.png"); }, "reto-diario");
    await intenta(async () => { await navegar(page, BASE + "/es/reto-semanal"); await page.waitForTimeout(2500); await shot(page, ruta, "32-reto-semanal.png"); }, "reto-semanal");
    await intenta(async () => { await navegar(page, BASE + "/es/tienda"); await page.waitForTimeout(2500); await shot(page, ruta, "13-tienda-bazar.png"); }, "tienda");
    await intenta(async () => { await navegar(page, BASE + "/es/trastienda"); await page.waitForTimeout(3000); await shot(page, ruta, "31-trastienda-ruleta.png"); }, "trastienda");
    await intenta(async () => { await navegar(page, BASE + "/es/perfil"); await page.waitForTimeout(2500); await shot(page, ruta, "14-perfil-invitado.png"); }, "perfil");

    await context.close();
  }

  // 4. Demos por mundo (con sesión, dark prioritario)
  const mundos = [
    [23, "numeria"],
    [24, "melodia"],
    [25, "enigmia"],
    [26, "quimia"],
    [27, "historia"],
    [28, "anatomia"],
    [29, "geografia"],
    [30, "trigonometria"],
  ];
  const contextDemo = await conSesion(null, "dark");
  const pageDemo = await contextDemo.newPage();
  for (const [num, mundo] of mundos) {
    console.log("Demo " + mundo + " (dark)");
    await pageDemo.goto(`${BASE}/es/demo/${mundo}`, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    await pageDemo.waitForTimeout(4000);
    await shot(pageDemo, OSCURAS, `${String(num).padStart(2, "0")}-demo-${mundo}.png`);
  }
  await contextDemo.close();

  await browser.close();
  console.log("\nCAPTURAS TOMADAS:");
  for (const n of tomo) console.log("  " + n);
  console.log("LISTO");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});