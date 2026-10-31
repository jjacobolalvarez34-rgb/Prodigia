import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";
import { URL_APK } from "@/lib/appAndroid";
import { hayVersionNueva } from "@/lib/app/versiones";
import { ORIGEN_WEB } from "./entorno";

// «Hay una nueva versión de Prodigia» (2026-10-14). La última publicada la dice la web
// (/api/app/version, el último release de GitHub). La app baja el APK ella misma, con
// su progreso, y abre el instalador de Android: así no depende del navegador, que a
// veces se quedaba trabado al terminar la descarga.

const CLAVE_POSPONER = "prodigia:actualizacion:posponer";
const POSPONER_MS = 24 * 60 * 60 * 1000;

export interface VersionNueva {
  version: string;
  notas: string | null;
}

export function versionInstalada(): string | null {
  return Constants.expoConfig?.version ?? null;
}

// La versión nueva si hay una y no se pospuso en las últimas 24 h.
export async function buscarVersionNueva(): Promise<VersionNueva | null> {
  if (Platform.OS !== "android") return null;
  try {
    const nueva = await consultarVersionNueva();
    if (!nueva) return null;
    const pospuesta = JSON.parse((await AsyncStorage.getItem(CLAVE_POSPONER)) ?? "null") as { version: string; hasta: number } | null;
    if (pospuesta && pospuesta.version === nueva.version && pospuesta.hasta > Date.now()) return null;
    return nueva;
  } catch {
    return null;
  }
}

// «Buscar actualizaciones» de Ajustes (2026-10-30): sin mirar si se pospuso, y lanza
// el error si no hay conexión (para decir «no se pudo revisar» y no «estás al día»).
export async function consultarVersionNueva(): Promise<VersionNueva | null> {
  const res = await fetch(`${ORIGEN_WEB}/api/app/version`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = (await res.json()) as { version: string | null; notas?: string | null };
  if (!d.version || !hayVersionNueva(versionInstalada(), d.version)) return null;
  return { version: d.version, notas: d.notas ?? null };
}

// Ajustes le pide al aviso de actualización (montado en _layout) que se muestre.
const oyentes = new Set<(v: VersionNueva) => void>();
export function alPedirActualizacion(fn: (v: VersionNueva) => void): () => void {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}
export function mostrarActualizacion(v: VersionNueva): void {
  oyentes.forEach((fn) => fn(v));
}

export async function posponer(version: string): Promise<void> {
  await AsyncStorage.setItem(CLAVE_POSPONER, JSON.stringify({ version, hasta: Date.now() + POSPONER_MS }));
}

// Baja el APK al caché de la app (avisando el avance de 0 a 1) y abre el instalador.
export async function descargarEInstalar(version: string, alAvanzar: (fraccion: number) => void): Promise<void> {
  if (!URL_APK) throw new Error("No hay APK publicado.");
  const destino = `${FileSystem.cacheDirectory}Prodigia-${version}.apk`;
  await FileSystem.deleteAsync(destino, { idempotent: true });
  const descarga = FileSystem.createDownloadResumable(URL_APK, destino, {}, (p) => {
    if (p.totalBytesExpectedToWrite > 0) alAvanzar(p.totalBytesWritten / p.totalBytesExpectedToWrite);
  });
  const r = await descarga.downloadAsync();
  if (!r || r.status !== 200) throw new Error("La descarga no terminó bien.");
  alAvanzar(1);
  const uri = await FileSystem.getContentUriAsync(r.uri);
  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
    data: uri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: "application/vnd.android.package-archive",
  });
}

export const URL_DESCARGA_WEB = `${ORIGEN_WEB}/api/app/descargar`;
