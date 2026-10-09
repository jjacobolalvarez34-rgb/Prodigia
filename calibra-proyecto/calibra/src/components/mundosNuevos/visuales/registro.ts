import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import { escenaDinamia } from "@/lib/dinamia/escenas";
import { escenaVitalia } from "@/lib/vitalia/escenas";
import { CONFIG_MUNDOS_NUEVOS, type SlugMundoNuevo } from "@/lib/mundosNuevos/config";
import { crearVisualEscena } from "./VisualEscena";

// Animaciones propias de las lecciones de Dinamia ("dinamia.*") y Vitalia
// ("vitalia.*"). Cada lección las nombra en `contenido.visuales[].tipo`; todas
// son escenas compartidas con la app (src/lib/<mundo>/escenas.ts). Los tipos van
// escritos uno por uno: `npm run paridad` (app) los compara con los de la app.
const VisualDinamia = crearVisualEscena(escenaDinamia, CONFIG_MUNDOS_NUEVOS.dinamia.color) as unknown as ComponenteVisual;
const VisualVitalia = crearVisualEscena(escenaVitalia, CONFIG_MUNDOS_NUEVOS.vitalia.color) as unknown as ComponenteVisual;

export const REGISTRO_VISUALES_MUNDO_NUEVO: Record<SlugMundoNuevo, RegistroVisuales> = {
  dinamia: {
    "dinamia.trayecto": VisualDinamia,
    "dinamia.grafica": VisualDinamia,
    "dinamia.caida": VisualDinamia,
    "dinamia.parabola": VisualDinamia,
    "dinamia.vectores": VisualDinamia,
    "dinamia.cuerpoLibre": VisualDinamia,
    "dinamia.poleas": VisualDinamia,
    "dinamia.circular": VisualDinamia,
    "dinamia.energia": VisualDinamia,
    "dinamia.choque": VisualDinamia,
    "dinamia.termometro": VisualDinamia,
    "dinamia.particulas": VisualDinamia,
    "dinamia.ciclo": VisualDinamia,
    "dinamia.fluido": VisualDinamia,
    "dinamia.tubo": VisualDinamia,
  },
  vitalia: {
    "vitalia.celula": VisualVitalia,
    "vitalia.membrana": VisualVitalia,
    "vitalia.division": VisualVitalia,
    "vitalia.energia": VisualVitalia,
    "vitalia.adn": VisualVitalia,
    "vitalia.punnett": VisualVitalia,
    "vitalia.pedigri": VisualVitalia,
    "vitalia.recorrido": VisualVitalia,
    "vitalia.hormona": VisualVitalia,
    "vitalia.defensa": VisualVitalia,
    "vitalia.arbol": VisualVitalia,
    "vitalia.reinos": VisualVitalia,
    "vitalia.plantas": VisualVitalia,
    "vitalia.cadena": VisualVitalia,
  },
};
