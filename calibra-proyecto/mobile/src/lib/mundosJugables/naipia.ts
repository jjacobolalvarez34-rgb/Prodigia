// Naipia: los 5 sistemas de conteo de la web (NaipiaSprintRunner.tsx). Las cartas se
// dibujan a la vista; al empezar la banda de un sistema se muestra su tabla de
// valores, y en niveles altos las cartas salen de a una y desaparecen (modo
// memoria, con el reloj en pausa). Conteo verdadero admite medio mazo (",5").
import {
  BANDA_NAIPIA,
  bandaNaipia,
  claveNaipia,
  generarProblemaNaipia,
  gruposDeSistema,
  NOMBRE_MODO_NAIPIA,
  type ModoNaipia,
  type SistemaConteo,
} from "@/lib/practica/naipia";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import type { MundoJugable, Visual } from "./tipos";

function tablaDe(sistema: SistemaConteo): Visual {
  return {
    tipo: "tabla",
    titulo: `Valores de ${NOMBRE_MODO_NAIPIA[sistema]}`,
    filas: gruposDeSistema(sistema).map((g) => ({ etiqueta: g.rangos.join(" "), valor: g.valor > 0 ? `+${g.valor}` : String(g.valor) })),
  };
}

export const NAIPIA: MundoJugable = {
  slug: "naipia",
  modos: [
    { id: "hilo", nombre: NOMBRE_MODO_NAIPIA.hilo, simbolo: "±1", descripcion: "El sistema clásico: +1, 0 y −1." },
    { id: "ko", nombre: NOMBRE_MODO_NAIPIA.ko, simbolo: "KO", descripcion: "Sin conteo verdadero: el 7 suma." },
    { id: "hiopt2", nombre: NOMBRE_MODO_NAIPIA.hiopt2, simbolo: "±2", descripcion: "Más precisión, valores de 2." },
    { id: "omega2", nombre: NOMBRE_MODO_NAIPIA.omega2, simbolo: "Ω", descripcion: "El más fino de los cuatro." },
    { id: "verdadero", nombre: NOMBRE_MODO_NAIPIA.verdadero, simbolo: "÷", descripcion: "Conteo por mazo que queda." },
  ],
  generar: (modo, nivel, usados) => {
    const m = modo as ModoNaipia;
    const p = generarSinRepetir(() => generarProblemaNaipia(m, nivel), claveNaipia, usados);
    const cartas = p.cartas.map((c) => ({ valor: c.valor, palo: c.palo }));
    const visuales: Visual[] = [];
    if (m !== "verdadero" && bandaNaipia(m, nivel) === BANDA_NAIPIA[m].min) visuales.push(tablaDe(m));
    if (!p.memoria && cartas.length > 0) visuales.push({ tipo: "cartas", cartas });
    return {
      enunciado: p.enunciado,
      entrada: { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, negativos: m !== "verdadero" || p.tipo === "verdadero" || p.tipo === "verdadero2", decimales: p.tipo === "mazos" },
      visuales: visuales.length > 0 ? visuales : undefined,
      memoria: p.memoria && cartas.length > 0 ? { tipo: "cartas", cartas, msPorCarta: p.memoria.msPorCarta } : undefined,
      clave: claveNaipia(p),
    };
  },
};
