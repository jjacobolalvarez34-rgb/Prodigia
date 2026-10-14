"use client";

import { initializePaddle, type Paddle, type PaddleEventData } from "@paddle/paddle-js";

// Único punto de contacto del navegador con Paddle.js — TiendaClient.tsx
// y ProClient.tsx llaman abrirCheckoutPaddle() en vez de hablar con el
// SDK directo, mismo criterio de "un solo lugar" que el resto del
// Payment Service. El token público (NEXT_PUBLIC_..., seguro de
// exponer) decide sandbox vs producción por su propio prefijo (test_ /
// live_), igual que el server ya hace con la API key — así nunca se
// puede desincronizar una variable de entorno "environment" de la del
// token real.
let paddleInstancia: Paddle | null | undefined;

// Bug del 2026-10-14: el aviso de «pago hecho» se pasaba en Checkout.open, pero en
// Paddle.js v2 eso se ignora: los eventos solo llegan al `eventCallback` de
// initializePaddle. El overlay quedaba en «pago hecho», había que cerrarlo a mano y la
// bienvenida a Pro nunca arrancaba. Ahora el callback se registra al inicializar y
// reparte el evento al checkout que está abierto.
let alCompletarActual: (() => void) | null = null;

function alEventoPaddle(evento: PaddleEventData) {
  if (evento.name !== "checkout.completed" || !alCompletarActual) return;
  const seguir = alCompletarActual;
  alCompletarActual = null;
  // Se deja ver un momento el «pago hecho» de Paddle y se cierra solo.
  setTimeout(() => {
    paddleInstancia?.Checkout.close();
    seguir();
  }, 1500);
}

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
    eventCallback: alEventoPaddle,
  });
  paddleInstancia = instancia ?? null;
  return paddleInstancia;
}

// onCompletado se dispara cuando el overlay reporta "checkout.completed"
// — NUNCA es lo que otorga el Pro/las Chispas (eso ya pasó, o está por
// pasar, vía el webhook server-to-server), solo sirve para seguir en la
// web (cerrar el overlay y llevar a la bienvenida o recargar el saldo).
export async function abrirCheckoutPaddle(transactionId: string, onCompletado?: () => void): Promise<boolean> {
  const paddle = await obtenerPaddle();
  if (!paddle) return false;
  alCompletarActual = onCompletado ?? null;
  paddle.Checkout.open({
    transactionId,
    settings: {
      variant: "one-page",
    },
  });
  return true;
}
