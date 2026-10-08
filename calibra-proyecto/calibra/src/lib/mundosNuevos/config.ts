// Configuración de los mundos 14 y 15 (Dinamia y Vitalia). Sus páginas son
// genéricas (src/components/mundosNuevos/*) y toman de acá lo propio de cada uno:
// color, ícono, modos, generador y dibujo. Se puede importar desde servidor y cliente.
import type { ReactElement } from "react";
import { IconDinamia, IconVitalia } from "@/components/icons";
import type { Dibujo } from "@/lib/dibujo/primitivas";
import { dibujoDinamia } from "@/lib/dinamia/diagramas";
import type { DiagramaDinamia } from "@/lib/dinamia/tipos";
import { claveDinamia, generarProblemaDinamia, MODOS_DINAMIA, type ModoDinamia } from "@/lib/practica/dinamia";
import { claveVitalia, generarProblemaVitalia, MODOS_VITALIA, type ModoVitalia } from "@/lib/practica/vitalia";
import { dibujoVitalia } from "@/lib/vitalia/diagramas";
import type { DiagramaVitalia } from "@/lib/vitalia/tipos";

export type SlugMundoNuevo = "dinamia" | "vitalia";

export interface ProblemaMundoNuevo {
  modo: string;
  enunciado: string;
  entrada: "numero" | "opciones";
  respuesta: number | string;
  tolerancia?: number;
  opciones?: string[];
  diagrama?: unknown;
}

export interface ConfigMundoNuevo {
  slug: SlugMundoNuevo;
  // Namespace de next-intl con lo propio del mundo (nombre, título, modos…).
  ns: "Dinamia" | "Vitalia";
  color: string;
  colorClaro: string;
  glifo: string;
  Icono: (props: { className?: string }) => ReactElement;
  modos: readonly string[];
  modoDiagnostico: string;
  // Las respuestas numéricas de este mundo pueden ser negativas.
  negativos: boolean;
  generar: (modo: string, nivel: number) => ProblemaMundoNuevo;
  clave: (p: ProblemaMundoNuevo) => string;
  dibujo: (diagrama: unknown) => Dibujo;
}

export const CONFIG_MUNDOS_NUEVOS: Record<SlugMundoNuevo, ConfigMundoNuevo> = {
  dinamia: {
    slug: "dinamia",
    ns: "Dinamia",
    color: "#2563EB",
    colorClaro: "#60A5FA",
    glifo: "⇀",
    Icono: IconDinamia,
    modos: MODOS_DINAMIA,
    modoDiagnostico: "cinematica",
    negativos: true,
    generar: (modo, nivel) => generarProblemaDinamia(modo as ModoDinamia, nivel) as ProblemaMundoNuevo,
    clave: (p) => claveDinamia(p as Parameters<typeof claveDinamia>[0]),
    dibujo: (d) => dibujoDinamia(d as DiagramaDinamia),
  },
  vitalia: {
    slug: "vitalia",
    ns: "Vitalia",
    color: "#16A34A",
    colorClaro: "#4ADE80",
    glifo: "✿",
    Icono: IconVitalia,
    modos: MODOS_VITALIA,
    modoDiagnostico: "celula",
    negativos: false,
    generar: (modo, nivel) => generarProblemaVitalia(modo as ModoVitalia, nivel) as ProblemaMundoNuevo,
    clave: (p) => claveVitalia(p as Parameters<typeof claveVitalia>[0]),
    dibujo: (d) => dibujoVitalia(d as DiagramaVitalia),
  },
};

export function esModoValido(slug: SlugMundoNuevo, modo: string | undefined | null): modo is string {
  return !!modo && CONFIG_MUNDOS_NUEVOS[slug].modos.includes(modo);
}

// "12,5" o "12.5" → 12.5 (el teclado de la web acepta los dos).
export function leerNumero(texto: string): number {
  return Number(texto.trim().replace(",", "."));
}

export function respuestaComoTexto(p: ProblemaMundoNuevo): string {
  return typeof p.respuesta === "number" ? String(p.respuesta).replace(".", ",") : p.respuesta;
}
