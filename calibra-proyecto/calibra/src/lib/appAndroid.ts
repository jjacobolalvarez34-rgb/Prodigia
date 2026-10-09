// La app de Android mientras no está en Play Store: el APK se descarga desde la
// web (sticker, anuncio y página /descargar). Todo pasa por /api/app/descargar,
// que redirige a URL_APK: así el link que la gente ve y comparte es de Prodigia,
// y para publicar una versión nueva alcanza con cambiar el archivo de destino.
//
// URL_APK = null → no se muestra nada (ni sticker ni anuncio).
// Con GitHub Releases, «releases/latest/download/<archivo>» apunta siempre a la
// última versión publicada.
export const URL_APK: string | null = "https://github.com/jjacobolalvarez34-rgb/Prodigia/releases/latest/download/Prodigia.apk";

// Datos que se muestran junto al botón (actualizar al publicar una versión nueva).
export const APP_ANDROID = {
  version: "0.1.0",
  tamanoMb: 76,
  // Android 7 o más nuevo (minSdk 24 de Expo).
  androidMinimo: "7",
};

export const RUTA_DESCARGA_APK = "/api/app/descargar";
