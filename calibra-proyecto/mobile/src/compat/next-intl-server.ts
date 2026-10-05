// Reemplazo de "next-intl/server" para la app. Las funciones de Aprender de la web
// (lib/i18n-lecciones/localizar.ts → localeServidor) piden el idioma de la petición
// con un import dinámico; en la app no hay petición de Next: el idioma es español.
// metro.config.js redirige "next-intl/server" a este archivo.
export async function getLocale(): Promise<string> {
  return "es";
}
