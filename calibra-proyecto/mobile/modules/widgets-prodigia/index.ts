import { requireOptionalNativeModule } from "expo";

// Widgets de la pantalla de inicio (módulo nativo propio, ver android/). La app solo
// les pasa los datos; Android los dibuja solo, sin despertar a JavaScript. En Expo
// Go (o fuera de Android) el módulo no existe y estas funciones no hacen nada.
interface ModuloWidgets {
  guardar(datos: string): void;
  anclar(tipo: string): boolean;
  iconoActual?(): string;
  cambiarIcono?(nombre: string): boolean;
  compartirImagen?(uri: string, texto: string, titulo: string): boolean;
}

const nativo = requireOptionalNativeModule<ModuloWidgets>("WidgetsProdigia");

export function guardarDatosWidgets(datos: Record<string, unknown> | null): void {
  nativo?.guardar(datos ? JSON.stringify(datos) : "");
}

export function anclarWidgetNativo(tipo: "Racha" | "Progreso"): boolean {
  return nativo ? nativo.anclar(tipo) : false;
}

export const hayWidgetsNativos = !!nativo;

// Íconos de temporada (alias del launcher, ver plugins/iconos-temporada.js).
export function iconoActualNativo(): string | null {
  return nativo?.iconoActual ? nativo.iconoActual() : null;
}

export function cambiarIconoNativo(nombre: string): boolean {
  return nativo?.cambiarIcono ? nativo.cambiarIcono(nombre) : false;
}

// Compartir una imagen con el menú de Android (APK desde 2026-10-21). En un APK
// anterior la función no existe: devuelve false y la app comparte solo el texto.
export function compartirImagenNativo(uri: string, texto: string, titulo: string): boolean {
  if (!nativo?.compartirImagen) return false;
  try {
    return nativo.compartirImagen(uri, texto, titulo);
  } catch {
    return false;
  }
}
