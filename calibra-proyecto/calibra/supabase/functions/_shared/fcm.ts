// Supabase Edge Function — helper compartido para mandar notificaciones
// push por Firebase Cloud Messaging (HTTP v1).
//
// Requiere un secret en el proyecto de Supabase llamado
// FIREBASE_SERVICE_ACCOUNT con el JSON completo de la service account de
// Firebase (Project settings -> Service accounts -> Generate new
// private key). Se lee acá con Deno.env, así que solo existe en el
// servidor, nunca en el cliente.
//
// Uso desde una función:
//   import { createSupabaseAdmin, enviarPushATokens, enviarPush } from "../_shared/fcm.ts";

import { createClient as supabaseCreateClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createSupabaseAdmin(): SupabaseClient {
  return supabaseCreateClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

export function leerServiceAccount(): Record<string, string> {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está definido como secret");
  return JSON.parse(raw);
}

export interface MensajePush {
  titulo: string;
  cuerpo: string;
  data?: Record<string, string>;
  // Después de Android 13 el usuario tiene que dar permiso; cuando lo
  // dio (PushNotifications de Capacitor lo pide), priority high hace
  // que el sistema muestre el heads-up.
  prioridad?: "normal" | "high";
}

// Firma RS256 del JWT de la service account vía WebCrypto (estándar en
// Deno, sin dependencias).
async function firmarConClavePem(clavePem: string, datos: string): Promise<ArrayBuffer> {
  const base64 = clavePem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    bin.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const dataBin = new TextEncoder().encode(datos);
  return crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, dataBin);
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function obtenerAccessToken(sa: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const signingInput = `${enc(header)}.${enc(claims)}`;
  const firma = await firmarConClavePem(sa.private_key, signingInput);
  const jwt = `${signingInput}.${b64url(firma)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`OAuth FCM falló: ${res.status} ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

// Manda un push a UN token (device) y devuelve si FCM lo aceptó. Si el
// token ya no sirve (desinstalada / invalidado), devuelve invalido:true
// para que el caller lo borre de la base.
export async function enviarPush(
  token: string,
  sa: Record<string, string>,
  msg: MensajePush
): Promise<{ ok: boolean; invalido: boolean }> {
  const accessToken = await obtenerAccessToken(sa);
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        token,
        notification: {
          title: msg.titulo,
          body: msg.cuerpo,
        },
        data: msg.data ?? {},
        android: {
          priority: msg.prioridad ?? "high",
        },
      },
    }),
  });

  if (res.ok) return { ok: true, invalido: false };
  const text = await res.text();
  if (res.status === 404 || /UNREGISTERED|NOT_FOUND|INVALID_ARGUMENT/.test(text)) {
    return { ok: false, invalido: true };
  }
  console.error("FCM error", res.status, text);
  return { ok: false, invalido: false };
}

// Conveniencia: manda a un listado de tokens, borra de la base los ya
// inválidos y devuelve cuántos salieron ok.
export async function enviarPushATokens(
  supabase: SupabaseClient,
  tokens: { token: string }[],
  msg: MensajePush
): Promise<number> {
  const sa = leerServiceAccount();
  let enviados = 0;
  for (const row of tokens) {
    const r = await enviarPush(row.token, sa, msg);
    if (r.ok) enviados++;
    else if (r.invalido) {
      await supabase.from("device_push_tokens").delete().eq("token", row.token).maybeSingle();
    }
  }
  return enviados;
}
