"use client";

import { CLAVE_LETRA_APP, CLAVE_TEMA_APP } from "./temaAppScript";
import { letraDe, TEMA_CLASICO, temaAppDe, variablesCssTema, variablesLetra } from "./temas";

// El tema de la app puesto en la web (0297). Se aplica en caliente: las variables de
// color, forma y letra de globals.css van inline en <html> (ganan a las del modo
// claro/oscuro) y <html> lleva data-tema-app (y data-tema-claro en los temas de fondo
// claro, data-tema-sombra con su sombra y data-letra con la letra de títulos) para los
// ajustes de globals.css («Temas de la app»). Se guarda en localStorage para que el
// script de arranque del layout lo ponga antes del primer pintado (sin destello del
// tema de siempre). Sin tema (o 'clasico') y sin Letra libre, <html> queda exactamente
// como siempre.

export { CLAVE_LETRA_APP, CLAVE_TEMA_APP };
const VARIABLES = Object.keys(variablesCssTema("suizo") ?? {});

export function temaAppPuestoWeb(): string {
  if (typeof document === "undefined") return TEMA_CLASICO;
  return document.documentElement.dataset.temaApp ?? TEMA_CLASICO;
}

// La letra elegida con la Letra libre (null = la del tema).
export function letraAppPuestaWeb(): string | null {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE_LETRA_APP) ?? "null") as { id?: string } | null;
    return letraDe(l?.id)?.id ?? null;
  } catch {
    return null;
  }
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
    html.dataset.temaSombra = tema.sombra;
    html.dataset.letra = tema.letra;
    if (tema.paleta.claro) html.dataset.temaClaro = "";
    else delete html.dataset.temaClaro;
  } else {
    delete html.dataset.temaApp;
    delete html.dataset.temaClaro;
    delete html.dataset.temaSombra;
    delete html.dataset.letra;
  }
  try {
    if (tema && vars) localStorage.setItem(CLAVE_TEMA_APP, JSON.stringify({ slug: tema.slug, claro: tema.paleta.claro, sombra: tema.sombra, letra: tema.letra, vars }));
    else localStorage.removeItem(CLAVE_TEMA_APP);
  } catch {
    // Sin localStorage: se aplica igual, solo que al recargar llega un instante después.
  }
  // La letra elegida pisa la del tema.
  ponerLetraElegida(letraAppPuestaWeb());
  window.dispatchEvent(new CustomEvent("prodigia:tema-app", { detail: tema?.slug ?? TEMA_CLASICO }));
}

function ponerLetraElegida(id: string | null): void {
  const letra = letraDe(id);
  if (!letra) return;
  const html = document.documentElement;
  for (const [k, v] of Object.entries(variablesLetra(letra))) html.style.setProperty(k, v);
  html.dataset.letra = letra.id;
}

// Letra libre (0314): pone en caliente la letra de títulos elegida (null = vuelve a la
// del tema, o a la de siempre si no hay tema).
export function aplicarLetraAppWeb(id: string | null | undefined): void {
  if (typeof document === "undefined") return;
  const letra = letraDe(id);
  try {
    if (letra) localStorage.setItem(CLAVE_LETRA_APP, JSON.stringify({ id: letra.id, vars: variablesLetra(letra) }));
    else localStorage.removeItem(CLAVE_LETRA_APP);
  } catch {
    // Sin localStorage: se ve igual hasta recargar.
  }
  const html = document.documentElement;
  if (!letra) {
    // Se quita la elegida y vuelve lo del tema (o nada).
    html.style.removeProperty("--fuente-titulos");
    html.style.removeProperty("--escala-letra");
    delete html.dataset.letra;
    aplicarTemaAppWeb(temaAppPuestoWeb());
    return;
  }
  ponerLetraElegida(letra.id);
  window.dispatchEvent(new CustomEvent("prodigia:letra-app", { detail: letra.id }));
}
