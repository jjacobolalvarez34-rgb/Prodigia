import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { VERSION_TERMINOS } from "@/lib/legal/terminos";
import { urlAbsoluta } from "./entorno";
import { mensajeError, supabase } from "./supabase";

// La primera vez en la app (docs/PLAN_PRIMERA_VEZ_APP.md, aprobado el 2026-10-07):
// bienvenida → una pregunta de prueba → crear cuenta (sin modo invitado) → Kit del
// Pionero → recorrido por las pestañas. Lo que ya se vio queda marcado en el teléfono.
const CLAVE_BIENVENIDA = "prodigia:bienvenida-vista";
const CLAVE_RECORRIDO = "prodigia:recorrido-pestanas";
const CLAVE_NOMBRE = "prodigia:nombre-pendiente";
const claveKit = (userId: string) => `prodigia:kit-pionero:${userId}`;

async function leer(clave: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(clave);
  } catch {
    return null;
  }
}
async function guardar(clave: string, valor: string | null) {
  try {
    if (valor === null) await AsyncStorage.removeItem(clave);
    else await AsyncStorage.setItem(clave, valor);
  } catch {
    // Si no se puede guardar, a lo sumo se vuelve a mostrar.
  }
}

export const bienvenidaVista = async () => (await leer(CLAVE_BIENVENIDA)) === "1";
export const marcarBienvenidaVista = () => guardar(CLAVE_BIENVENIDA, "1");
export const recorridoVisto = async () => (await leer(CLAVE_RECORRIDO)) === "1";
export const marcarRecorridoVisto = () => guardar(CLAVE_RECORRIDO, "1");

export type ResultadoCuenta = { ok: true; confirmarCorreo: boolean } | { ok: false; error: string };

function errorAuth(e: { code?: string; message?: string }): string {
  const m = (e.message ?? "").toLowerCase();
  if (e.code === "email_exists" || e.code === "user_already_exists" || m.includes("already registered") || m.includes("already been registered")) {
    return "Ese correo ya tiene una cuenta. Entra con «Ya tengo cuenta».";
  }
  if (e.code === "weak_password" || m.includes("password should be")) return "La contraseña debe tener al menos 6 caracteres.";
  if (e.code === "email_address_invalid" || m.includes("invalid email")) return "Ese correo no es válido.";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera un minuto y prueba de nuevo.";
  return mensajeError(e);
}

// El nombre se guarda en el perfil con la misma RPC que la web. Si la cuenta todavía
// no tiene sesión (falta confirmar el correo), queda pendiente para el primer ingreso.
async function guardarNombre(nombre: string): Promise<boolean> {
  const { error } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre });
  return !error;
}

export async function aplicarNombrePendiente() {
  const nombre = await leer(CLAVE_NOMBRE);
  if (!nombre) return;
  if (await guardarNombre(nombre)) await guardar(CLAVE_NOMBRE, null);
}

// Igual que RegistroForm.tsx de la web: el correo de confirmación lleva a la web y
// después se entra en la app con los mismos datos.
export async function crearCuenta(nombre: string, email: string, password: string): Promise<ResultadoCuenta> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: urlAbsoluta("/auth/callback") ?? undefined, data: { terminos_version: VERSION_TERMINOS } },
  });
  if (error) return { ok: false, error: errorAuth(error) };
  await guardar(CLAVE_NOMBRE, nombre.trim());
  if (data.session) await aplicarNombrePendiente();
  return { ok: true, confirmarCorreo: !data.session };
}

// Invitados que ya existían: la cuenta anónima pasa a ser real conservando todo
// (lo mismo que ConvertirCuenta.tsx de la web).
export async function convertirInvitado(nombre: string, email: string, password: string): Promise<ResultadoCuenta> {
  const { data, error } = await supabase.auth.updateUser({ email: email.trim(), password }, { emailRedirectTo: urlAbsoluta("/auth/callback") ?? undefined });
  if (error) return { ok: false, error: errorAuth(error) };
  await guardar(CLAVE_NOMBRE, nombre.trim());
  await aplicarNombrePendiente();
  return { ok: true, confirmarCorreo: !data.user?.email_confirmed_at };
}

// Google: se abre el navegador del sistema y Supabase vuelve a prodigia://auth con
// la sesión. Requiere el proveedor Google activo en Supabase y esa URL en
// "Redirect URLs" (Authentication → URL Configuration).
export async function entrarConGoogle(): Promise<{ ok: boolean; error?: string }> {
  const vuelta = Linking.createURL("auth");
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: vuelta, skipBrowserRedirect: true } });
  if (error || !data?.url) return { ok: false, error: error ? errorAuth(error) : "No se pudo abrir Google." };
  const r = await WebBrowser.openAuthSessionAsync(data.url, vuelta);
  if (r.type !== "success") return { ok: false };
  const url = r.url;
  const params = new URLSearchParams(url.includes("#") ? url.split("#")[1] : url.split("?")[1] ?? "");
  const errorUrl = params.get("error_description");
  if (errorUrl) return { ok: false, error: errorUrl.replace(/\+/g, " ") };
  const code = params.get("code");
  if (code) {
    const { error: e } = await supabase.auth.exchangeCodeForSession(code);
    return e ? { ok: false, error: errorAuth(e) } : { ok: true };
  }
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return { ok: false, error: "Google no devolvió la sesión. Prueba de nuevo." };
  const { error: e } = await supabase.auth.setSession({ access_token, refresh_token });
  return e ? { ok: false, error: errorAuth(e) } : { ok: true };
}

// Kit del Pionero (0258): una vez por cuenta. Devuelve true solo la vez que se
// entrega (para mostrar la animación). Si la base todavía no tiene 0258, no hace nada.
export async function reclamarKitApp(userId: string): Promise<{ marcoPuesto: boolean } | null> {
  if ((await leer(claveKit(userId))) === "1") return null;
  const { data, error } = await supabase.rpc("reclamar_kit_app");
  if (error) return null;
  await guardar(claveKit(userId), "1");
  const fila = (Array.isArray(data) ? data[0] : data) as { reclamado: boolean; marco_puesto: boolean } | null;
  return fila?.reclamado ? { marcoPuesto: !!fila.marco_puesto } : null;
}

// Mientras se ve algo de la primera vez (guardar progreso, kit, recorrido), las
// otras ventanas que aparecen solas (la pregunta de edad) esperan su turno.
let primeraVezActiva = false;
const oyentesPrimeraVez = new Set<() => void>();
export function fijarPrimeraVezActiva(v: boolean) {
  if (primeraVezActiva === v) return;
  primeraVezActiva = v;
  oyentesPrimeraVez.forEach((o) => o());
}
export function suscribirPrimeraVez(o: () => void) {
  oyentesPrimeraVez.add(o);
  return () => {
    oyentesPrimeraVez.delete(o);
  };
}
export const leerPrimeraVezActiva = () => primeraVezActiva;
