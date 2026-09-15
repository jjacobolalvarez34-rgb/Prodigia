import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { paddleAdapter } from "./paddle";

// verificarFirma es la única línea de defensa entre "esto vino de
// verdad de Paddle" y "cualquiera puede pegarle a /api/webhooks/paddle
// y otorgarse Chispas gratis" — se prueba con fixtures reales, sin red
// ni base de datos, calculando el HMAC exactamente como lo hace la
// función (HMAC-SHA256(secret, `${ts}:${rawBody}`)) para no terminar
// probando "la función está de acuerdo consigo misma".
const SECRET = "un-secreto-de-prueba-no-real";
const RAW_BODY = JSON.stringify({ event_id: "evt_1", event_type: "transaction.completed" });

function firmarComoPaddle(ts: string, body: string, secret = SECRET): string {
  const h1 = createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
  return `ts=${ts};h1=${h1}`;
}

describe("paddleAdapter.verificarFirma", () => {
  beforeEach(() => {
    process.env.PADDLE_WEBHOOK_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.PADDLE_WEBHOOK_SECRET;
  });

  it("acepta una firma válida", async () => {
    const ts = "1700000000";
    const headers = new Headers({ "paddle-signature": firmarComoPaddle(ts, RAW_BODY) });
    expect(await paddleAdapter.verificarFirma(headers, RAW_BODY)).toBe(true);
  });

  it("rechaza si el body fue alterado después de firmarlo", async () => {
    const ts = "1700000000";
    const headers = new Headers({ "paddle-signature": firmarComoPaddle(ts, RAW_BODY) });
    const bodyAlterado = JSON.stringify({ event_id: "evt_1", event_type: "transaction.completed", monto: 999999 });
    expect(await paddleAdapter.verificarFirma(headers, bodyAlterado)).toBe(false);
  });

  it("rechaza una firma calculada con un secreto distinto", async () => {
    const ts = "1700000000";
    const headers = new Headers({ "paddle-signature": firmarComoPaddle(ts, RAW_BODY, "otro-secreto") });
    expect(await paddleAdapter.verificarFirma(headers, RAW_BODY)).toBe(false);
  });

  it("rechaza si falta el header paddle-signature", async () => {
    expect(await paddleAdapter.verificarFirma(new Headers(), RAW_BODY)).toBe(false);
  });

  it("rechaza si el header viene mal formado (sin ts o sin h1)", async () => {
    const headers = new Headers({ "paddle-signature": "solo-texto-random" });
    expect(await paddleAdapter.verificarFirma(headers, RAW_BODY)).toBe(false);
  });

  it("rechaza si falta PADDLE_WEBHOOK_SECRET en el entorno", async () => {
    delete process.env.PADDLE_WEBHOOK_SECRET;
    const headers = new Headers({ "paddle-signature": firmarComoPaddle("1700000000", RAW_BODY) });
    expect(await paddleAdapter.verificarFirma(headers, RAW_BODY)).toBe(false);
  });
});
