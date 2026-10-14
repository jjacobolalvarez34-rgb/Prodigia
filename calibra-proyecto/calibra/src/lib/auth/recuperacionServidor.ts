import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Datos de una cuenta para recuperar la contraseña con preguntas (ver
// lib/auth/recuperacion.ts). Solo servidor: usa la clave de servicio.
export interface CuentaRecuperable {
  userId: string;
  correo: string | null;
  conGoogle: boolean;
  primerosMundos: string[];
}

export async function buscarCuenta(usuario: string): Promise<CuentaRecuperable | null> {
  const nombre = usuario.trim();
  if (!nombre || nombre.length > 40) return null;
  const admin = createAdminClient();
  // display_name es único sin importar mayúsculas (0037); se escapan los comodines.
  const { data: perfil } = await admin
    .from("profiles")
    .select("id, mundos_desbloqueados")
    .ilike("display_name", nombre.replace(/[\\%_]/g, (c) => `\\${c}`))
    .maybeSingle();
  if (!perfil) return null;
  const { data } = await admin.auth.admin.getUserById(perfil.id as string);
  const u = data.user;
  if (!u || u.is_anonymous) return null;
  const proveedores = (u.app_metadata?.providers as string[] | undefined) ?? [];
  return {
    userId: perfil.id as string,
    correo: u.email ?? null,
    conGoogle: proveedores.includes("google") || (u.identities ?? []).some((i) => i.provider === "google"),
    primerosMundos: ((perfil.mundos_desbloqueados as string[] | null) ?? []).slice(0, 2),
  };
}

export function hashPermiso(permiso: string): string {
  return createHash("sha256").update(permiso).digest("hex");
}

export function nuevoPermiso(): string {
  return randomBytes(24).toString("base64url");
}
