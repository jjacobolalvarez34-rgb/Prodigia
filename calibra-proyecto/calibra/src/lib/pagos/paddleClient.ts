"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// Único punto de contacto del navegador con Paddle.js — TiendaClient.tsx
// y ProClient.tsx llaman abrirCheckoutPaddle() en vez de hablar con el
// SDK directo, mismo criterio de "un solo lugar" que el resto del
// Payment Service. El token público (NEXT_PUBLIC_..., seguro de
// exponer) decide sandbox vs producción por su propio prefijo (test_ /
// live_), igual que el server ya hace con la API key — así nunca se
// puede desincronizar una variable de entorno "environment" de la del
// token real.
let paddleInstancia: Paddle | null | undefined;

async function obtenerPaddle(): Promise<Paddle | null> {
  if (paddleInstancia !== undefined) return paddleInstancia;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    console.error("[paddle-client] falta NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
    paddleInstancia = null;
    return null;
  }

  const instancia = await initializePaddle({
    token,
    environment: token.startsWith("test_") ? "sandbox" : "production",
  });
  paddleInstancia = instancia ?? null;
  return paddleInstancia;
}

// onCompletado se dispara cuando el overlay reporta "checkout.completed"
// — NUNCA es lo que otorga el Pro/las Chispas (eso ya pasó, o está por
// pasar, vía el webhook server-to-server), solo sirve para refrescar lo
// que se ve en pantalla sin que el usuario tenga que recargar a mano.
export async function abrirCheckoutPaddle(transactionId: string, onCompletado?: () => void): Promise<boolean> {
  const paddle = await obtenerPaddle();
  if (!paddle) return false;
  paddle.Checkout.open({
    transactionId,
    settings: {
      variant: "one-page",
    },
    ...(onCompletado
      ? {
          eventCallback: (event: { name?: string }) => {
            if (event.name === "checkout.completed") onCompletado();
          },
        }
      : {}),
  });
  return true;
}
