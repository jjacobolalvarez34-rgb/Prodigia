// Enigmia: igual que EnigmiaSprintRunner.tsx de la web. 90 s por partida; "Mezcla"
// reparte 75 % acertijos generados (memoria, patrones, computacional) y 25 % de
// deducción del banco de la base (logic_puzzles); cada categoría tiene su propio
// nivel (logic_skill_levels) y se guarda con insertar_intento_logica. Los de
// memoria muestran la secuencia (1,3 s + 0,55 s por elemento) con el reloj en pausa.
import { generarAcertijoProcedural, type CategoriaGenerada } from "@/lib/enigmia/generadores";
import { elegirDelBanco } from "@/lib/enigmia/seleccionDificultad";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { CATEGORIA_DE_TIPO, NOMBRE_CATEGORIA_ENIGMIA, type CategoriaEnigmia, type LogicPuzzle } from "@/types/database";
import type { MundoJugable } from "./tipos";

const CATEGORIAS: CategoriaEnigmia[] = ["memoria", "patrones", "deduccion", "computacional"];
const PROCEDURALES: CategoriaGenerada[] = ["memoria", "patrones", "computacional"];
const PROBABILIDAD_PROCEDURAL = 0.75;

const claveAcertijo = (p: LogicPuzzle) => `${p.contenido.enunciado}|${(p.contenido.secuencia ?? []).join(",")}`;

function deDeduccion(banco: LogicPuzzle[], nivel: number, nivelPatrones: number, usados: Set<string>): LogicPuzzle {
  const solo = banco.filter((p) => p.tipo === "deduccion");
  return elegirDelBanco(solo.length > 0 ? solo : banco, nivel, usados) ?? generarAcertijoProcedural("patrones", nivelPatrones);
}

function elegir(banco: LogicPuzzle[], modo: string, nivelDe: (c: CategoriaEnigmia) => number, usados: Set<string>): LogicPuzzle {
  if (modo !== "mezcla") {
    const c = modo as CategoriaEnigmia;
    if (c === "deduccion") return deDeduccion(banco, nivelDe("deduccion"), nivelDe("patrones"), usados);
    return generarSinRepetir(() => generarAcertijoProcedural(c, nivelDe(c)), claveAcertijo, usados);
  }
  if (Math.random() < PROBABILIDAD_PROCEDURAL) {
    const c = PROCEDURALES[Math.floor(Math.random() * PROCEDURALES.length)];
    return generarSinRepetir(() => generarAcertijoProcedural(c, nivelDe(c)), claveAcertijo, usados);
  }
  return deDeduccion(banco, nivelDe("deduccion"), nivelDe("patrones"), usados);
}

export const CATEGORIAS_ENIGMIA = CATEGORIAS;

// Sin `preparar`, `cargarNiveles` ni `guardar`: los pone cada plataforma.
export const ENIGMIA_BASE: MundoJugable = {
  slug: "enigmia",
  modos: [
    { id: "mezcla", nombre: "Mezcla", simbolo: "✦", descripcion: "Un poco de todo, como en la web." },
    { id: "memoria", nombre: NOMBRE_CATEGORIA_ENIGMIA.memoria, simbolo: "◉", descripcion: "Mira la lista y recuérdala." },
    { id: "patrones", nombre: NOMBRE_CATEGORIA_ENIGMIA.patrones, simbolo: "▲", descripcion: "Qué sigue en la serie." },
    { id: "deduccion", nombre: NOMBRE_CATEGORIA_ENIGMIA.deduccion, simbolo: "?", descripcion: "Pistas y conclusiones." },
    { id: "computacional", nombre: NOMBRE_CATEGORIA_ENIGMIA.computacional, simbolo: "⌘", descripcion: "Seguir instrucciones paso a paso." },
  ],
  duracionMs: 90_000,
  // `contexto` = el banco de acertijos de la base (logic_puzzles); cada plataforma
  // lo carga en su `preparar`.
  generar: (modo, nivel, usados, contexto, _rng, _filtro, niveles) => {
    const banco = (contexto as LogicPuzzle[] | null) ?? [];
    const p = elegir(banco, modo, (c) => niveles?.[c] ?? nivel, usados);
    const categoria = CATEGORIA_DE_TIPO[p.tipo];
    const secuencia = p.contenido.secuencia;
    return {
      enunciado: p.contenido.enunciado,
      entrada: { tipo: "opciones", opciones: p.contenido.opciones, respuesta: p.respuesta },
      memoria: secuencia && secuencia.length > 0 ? { tipo: "lista", items: secuencia, ms: 1300 + 550 * secuencia.length } : undefined,
      // El id: los del banco no se repiten (elegirDelBanco mira `usados`) y los
      // generados ya quedaron registrados por contenido en generarSinRepetir.
      clave: p.id,
      nivel: p.dificultad,
      datos: { puzzle_id: p.id, categoria },
    };
  },
  modoDePregunta: (p) => String(p.datos?.categoria ?? "patrones"),
};
