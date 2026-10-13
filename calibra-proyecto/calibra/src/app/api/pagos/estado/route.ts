import { NextResponse } from "next/server";
import { pagosHabilitados } from "@/lib/pagos/flags";

// Diagnóstico de cobros (2026-10-12): qué commit está publicado y qué variables de
// Paddle ve el servidor. Solo dice si cada variable existe, nunca su valor.
export const dynamic = "force-dynamic";

const VARIABLES = [
  "PADDLE_API_KEY",
  "PADDLE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
  "PADDLE_PRICE_PRO_MENSUAL",
  "PADDLE_PRICE_PRO_ANUAL",
  "PADDLE_PRICE_CHISPAS_1000",
  "PADDLE_PRICE_CHISPAS_2500",
  "PADDLE_PRICE_CHISPAS_6000",
  "PADDLE_PRICE_CHISPAS_15000",
  "PADDLE_PRICE_COMETAS_100",
  "PADDLE_PRICE_COMETAS_550",
  "PADDLE_PRICE_COMETAS_1200",
  "PADDLE_PRICE_COMETAS_2600",
  "PADDLE_PRICE_COMETAS_7000",
  "NEXT_PUBLIC_PAGOS_HABILITADOS",
];

export function GET() {
  const env: Record<string, string | undefined> = process.env;
  return NextResponse.json({
    pagosHabilitados: pagosHabilitados(),
    commit: env["VERCEL_GIT_COMMIT_SHA"]?.slice(0, 7) ?? null,
    entorno: env["VERCEL_ENV"] ?? null,
    sandbox: (env["PADDLE_API_KEY"] ?? "").startsWith("pdl_sdbx_"),
    variables: Object.fromEntries(VARIABLES.map((v) => [v, !!env[v]?.trim()])),
  });
}
