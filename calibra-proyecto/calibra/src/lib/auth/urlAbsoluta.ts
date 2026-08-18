// Construye la URL absoluta que se manda como emailRedirectTo/redirectTo
// en CUALQUIER llamada de Supabase Auth que dispara un email (signUp,
// resetPasswordForEmail, updateUser con email nuevo) — un solo lugar,
// para no repetir `${window.location.origin}${path}` suelto en cada
// formulario. window.location.origin YA incluye el esquema en cualquier
// navegador real, pero se valida acá igual: si alguna vez llegara sin
// "http"/"https" adelante, se loguea fuerte en la consola en vez de
// mandarle a Supabase una URL rara en silencio.
//
// Nota sobre el bug real reportado (link de confirmación con
// "redirect_to=prodigia-sandy.vercel.app/", sin esquema y sin el path
// /auth/callback que este código sí manda): no se pudo reproducir acá
// porque window.location.origin no puede devolver eso — es casi
// seguro que Supabase rechazó el redirectTo que mandó la app (por el
// allow-list de Redirect URLs) y cayó a su propio "Site URL" de
// fallback, que en el dashboard parece estar cargado sin "https://".
// Ver docs/PROGRESO.md para el detalle completo y qué revisar en el
// dashboard — esto no es algo que el código pueda arreglar solo.
export function urlAbsoluta(path: string): string {
  const origen = window.location.origin;
  if (!/^https?:\/\//.test(origen)) {
    console.error(`[auth] window.location.origin sin esquema: "${origen}" — revisá cómo se está sirviendo la app.`);
  }
  return `${origen}${path}`;
}
