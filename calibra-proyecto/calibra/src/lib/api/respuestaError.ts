import { NextResponse } from "next/server";

interface ErrorConCodigo {
  message: string;
  code?: string;
}

// Fase X3: ~19 rutas de API reenviaban error.message (de Postgres/
// Supabase) directo al cliente sin filtrar — seguro en el camino feliz
// (la mayoría son `raise exception '...'` de funciones security definer
// propias, siempre en español y pensadas a propósito para mostrarse),
// pero un error realmente inesperado (constraint violation sin manejar,
// timeout, lo que sea) se propagaría crudo.
//
// P0001 es el código que Postgres le pone SIEMPRE a un `raise exception`
// sin SQLSTATE explícito — que es como están escritas todas las
// funciones de este proyecto (grep confirma: ninguna usa un SQLSTATE
// custom). Cualquier otro código es un error que NO se previó a
// propósito, así que cae al genérico. El error real, completo, con el
// código, siempre queda en el log del servidor con el contexto de qué
// ruta lo tiró.
export function respuestaError(contexto: string, error: ErrorConCodigo, status = 400): NextResponse {
  console.error(`[api:${contexto}]`, error.code, error.message);
  const esMensajeDeNegocio = error.code === "P0001";
  return NextResponse.json(
    { error: esMensajeDeNegocio ? error.message : "Algo salió mal. Probá de nuevo." },
    { status }
  );
}
