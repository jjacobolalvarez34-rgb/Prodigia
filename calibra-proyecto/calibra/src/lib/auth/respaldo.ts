// ¿Le falta la contraseña de respaldo? (pedido 2026-10-13) Cuentas que entraron con
// Google y todavía no crearon una contraseña: si algo pasa con Google, sin ella no
// pueden entrar. Lógica pura: la usan la web (ContrasenaRespaldo.tsx) y la app.
export function necesitaContrasenaRespaldo(user: { app_metadata?: { providers?: string[] }; user_metadata?: Record<string, unknown> } | null | undefined): boolean {
  const proveedores = user?.app_metadata?.providers ?? [];
  return proveedores.includes("google") && !proveedores.includes("email") && user?.user_metadata?.password_respaldo !== true;
}
