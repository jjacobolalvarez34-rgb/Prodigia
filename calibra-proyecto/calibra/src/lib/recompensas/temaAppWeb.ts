"use client";

import { CLAVE_TEMA_APP } from "./temaAppScript";
import { TEMA_CLASICO, temaAppDe, variablesCssTema } from "./temas";

// El tema de la app puesto en la web (0297). Se aplica en caliente: las variables de
// color de globals.css van inline en <html> (ganan a las del modo claro/oscuro) y
// <html> lleva data-tema-app (y data-tema-claro en los temas de fondo claro) para los
// ajustes de globals.css («Temas de la app»). Se guarda en localStorage para que el
// script de arranque del layout lo ponga antes del primer pintado (sin destello del
// tema de siempre). Sin tema (o 'clasico'), <html> queda exactamente como siempre.

export { CLAVE_TEMA_APP };
const VARIABLES = Object.keys(variablesCssTema("suizo") ?? {});

export function temaAppPuestoWeb(): string {
  if (typeof document === "undefined") return TEMA_CLASICO;
  return document.documentElement.dataset.temaApp ?? TEMA_CLASICO;
}

export function aplicarTemaAppWeb(slug: string | null | undefined): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const tema = temaAppDe(slug);
  const vars = variablesCssTema(slug);
  for (const v of VARIABLES) html.style.removeProperty(v);
  if (tema && vars) {
    for (const [k, v] of Object.entries(vars)) html.style.setProperty(k, v);
    html.dataset.temaApp = tema.slug;
    if (tema.paleta.claro) html.dataset.temaClaro = "";
    else delete html.dataset.temaClaro;
  } else {
    delete html.dataset.temaApp;
    delete html.dataset.temaClaro;
  }
  try {
    if (tema && vars) localStorage.setItem(CLAVE_TEMA_APP, JSON.stringify({ slug: tema.slug, claro: tema.paleta.claro, vars }));
    else localStorage.removeItem(CLAVE_TEMA_APP);
  } catch {
    // Sin localStorage: se aplica igual, solo que al recargar llega un instante después.
  }
  window.dispatchEvent(new CustomEvent("prodigia:tema-app", { detail: tema?.slug ?? TEMA_CLASICO }));
}
