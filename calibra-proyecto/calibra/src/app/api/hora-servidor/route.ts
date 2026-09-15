import { NextResponse } from "next/server";

// Bug reportado en vivo (2026-09-14, "el conteo de aciertos de Enigmia
// sigue fallando" — probado a mano: 10/10 correctas mostraba 3/10).
// Causa real: /api/enigmia/finish (y el mismo patrón en TODOS los
// finish de práctica) filtraba logic_attempts/attempts con
// `created_at >= started_at`, donde started_at venía del RELOJ DEL
// NAVEGADOR del usuario (new Date().toISOString()) — si ese reloj está
// adelantado respecto al reloj real (nada raro: hora del sistema mal
// configurada, sin sincronización automática), el filtro terminaba
// excluyendo casi todas las respuestas reales de la partida, porque su
// created_at (reloj del servidor de Supabase, siempre correcto) quedaba
// por DEBAJO de ese umbral adelantado.
//
// Esta ruta no hace nada más que devolver la hora real del servidor de
// Next.js (siempre sincronizada, a diferencia de un navegador
// cualquiera) — cada *PracticaClient.tsx la pide al arrancar un sprint
// y la usa en vez de new Date().toISOString() para el started_at que
// se manda a /api/*/finish. Nunca bloquea el arranque de la partida
// (se pide en paralelo, sin esperar la respuesta) — si por lo que sea
// falla, el valor optimista del reloj del navegador sigue siendo el
// fallback, ni mejor ni peor que el comportamiento de antes.
export async function GET() {
  return NextResponse.json({ ahora: new Date().toISOString() });
}
