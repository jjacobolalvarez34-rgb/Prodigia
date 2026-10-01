// Codia: los 4 modos de la web (CodiaSprintRunner.tsx), en Python, Java,
// JavaScript o TypeScript. Igual que /codia/elegir, el lenguaje se elige antes de
// jugar (o todos mezclados). En "Encuentra el error" el código lleva el número de
// línea, porque se pregunta en qué línea está el fallo.
import { codigoConNumeros, generarProblemaCodia, LENGUAJES_CODIA, NOMBRE_LENGUAJE_CODIA, NOMBRE_MODO_CODIA, type LenguajeCodia, type ModoCodia, type ProblemaCodia } from "@/lib/practica/codia";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import type { MundoJugable } from "./tipos";

const clave = (p: ProblemaCodia) => `${p.lenguaje}|${p.enunciado}|${p.codigo}|${p.respuesta}`;

export const CODIA: MundoJugable = {
  slug: "codia",
  modos: [
    { id: "sintaxis", nombre: NOMBRE_MODO_CODIA.sintaxis, simbolo: "{ }", descripcion: "Cómo se escribe cada cosa." },
    { id: "salida", nombre: NOMBRE_MODO_CODIA.salida, simbolo: ">_", descripcion: "Qué imprime el programa." },
    { id: "error", nombre: NOMBRE_MODO_CODIA.error, simbolo: "✗", descripcion: "Dónde y por qué falla." },
    { id: "estructuras", nombre: NOMBRE_MODO_CODIA.estructuras, simbolo: "O(n)", descripcion: "Listas, mapas y complejidad." },
  ],
  filtro: {
    titulo: "Lenguaje",
    opciones: [{ id: "", nombre: "Todos" }, ...LENGUAJES_CODIA.map((l) => ({ id: l, nombre: NOMBRE_LENGUAJE_CODIA[l] }))],
  },
  generar: (modo, nivel, usados, _ctx, _rng, filtro) => {
    const lenguaje = filtro && (LENGUAJES_CODIA as readonly string[]).includes(filtro) ? (filtro as LenguajeCodia) : undefined;
    const p = generarSinRepetir(() => generarProblemaCodia(modo as ModoCodia, nivel, lenguaje), clave, usados);
    return {
      enunciado: p.enunciado,
      entrada: { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: p.codigo ? [{ tipo: "codigo", codigo: p.modo === "error" ? codigoConNumeros(p.codigo) : p.codigo, lenguaje: NOMBRE_LENGUAJE_CODIA[p.lenguaje] }] : undefined,
      clave: clave(p),
    };
  },
};
