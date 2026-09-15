import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OSCURAS = path.join(RAIZ, "docs", "marketing", "assets", "pantallas-oscuras");
const env = (() => {
  const vars = {};
  for (const linea of readFileSync(path.join(RAIZ, ".env.local"), "utf-8").split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
})();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const { data, error } = await supabase.auth.signInAnonymously();
if (error) throw error;
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const cookie = {
  name: `sb-${ref}-auth-token`,
  value: "base64-" + Buffer.from(JSON.stringify(data.session), "utf-8").toString("base64url"),
  domain: "localhost", path: "/", sameSite: "Lax",
};

const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-AR", colorScheme: "dark" });
await context.addCookies([cookie, { name: "NEXT_LOCALE", value: "es", domain: "localhost", path: "/" }]);
await context.addInitScript(() => localStorage.setItem("prodigia-theme", "dark"));
const page = await context.newPage();
const navegar = async (url) => { for (let i = 0; i < 3; i++) { try { await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 }); return; } catch { await new Promise(r => setTimeout(r, 3000)); } } };

await navegar(BASE + "/es");
await page.waitForTimeout(2500);
const hay = await page.locator('input[type="text"]').count();
if (hay > 0) {
  await page.locator('input[type="text"]').first().fill("Melómano");
  await page.locator('button[type="submit"], button').filter({ hasText: /siguiente|continuar|guardar/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.locator("button").filter({ hasText: /numeria/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.locator("button").filter({ hasText: /melodía|melodia/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.locator("button").filter({ hasText: /comenzar|empezar/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2500);
}
await navegar(BASE + "/es/melodia");
await page.waitForTimeout(3500);
await page.evaluate(() => window.stop?.()).catch(() => {});
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: path.join(OSCURAS, "19-melodia-home-pentagrama.png"), type: "png" });
console.log("✓ 19-melodia-home-pentagrama.png (dark)");

await navegar(BASE + "/es/melodia/aprender");
await page.waitForTimeout(3500).catch(() => {});
await page.evaluate(() => window.stop?.()).catch(() => {});
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: path.join(OSCURAS, "20-melodia-detalle-musical.png"), type: "png" });
console.log("✓ 20-melodia-detalle-musical.png (dark)");

await browser.close();
console.log("LISTO");