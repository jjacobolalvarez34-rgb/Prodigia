"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server Action, no Route Handler: el GET de /auth/confirm (page.tsx) solo
// MUESTRA el botón, nunca gasta el token — esto es lo único que realmente
// lo consume, y solo corre si alguien manda el <form> de verdad (un click
// humano). Ver el comentario largo en page.tsx para el motivo completo.
export async function confirmarCuenta(formData: FormData) {
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  const next = (formData.get("next") as string) || "/";
  const ref = formData.get("ref");

  if (typeof tokenHash !== "string" || typeof type !== "string" || !tokenHash || !type) {
    redirect("/login?error=auth");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash: tokenHash,
  });

  if (error) {
    console.error(`[auth/confirm] code=${error.code ?? "?"} status=${error.status ?? "?"}`, error.message);
    redirect("/login?error=auth");
  }

  if (typeof ref === "string" && ref) {
    await supabase.rpc("conectar_por_invitacion", { p_token: ref });
  }

  redirect(next);
}
