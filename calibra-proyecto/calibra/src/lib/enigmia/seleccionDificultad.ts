import type { LogicPuzzle } from "@/types/database";

// Extraído de EnigmiaSprintRunner.tsx (0205_enigmia_niveles_por_categoria)
// para poder testearlo como función pura: elige un puzzle de un banco ya
// filtrado por tipo (típicamente Deducción, la única categoría que no
// tiene generador procedural) dentro de ±1 del nivel de SU categoría,
// evitando repetir `usados` mientras haya opciones nuevas. Mismo criterio
// de ventana ±1 que ya usaba esta función cuando el nivel era único —
// ahora recibe el nivel de la categoría puntual que corresponda, nunca un
// nivel global.
//
// Fallback en 3 capas, de más a menos estricto:
//   1) dentro de la ventana [nivel-1, nivel+1] y sin usar
//   2) cualquier dificultad, pero sin usar (banco grande, nivel raro)
//   3) el banco entero, ya sin filtrar por usados (banco agotado)
// Devuelve null solo si el banco de entrada está vacío.
export function elegirDelBanco(banco: LogicPuzzle[], nivel: number, usados: Set<string>): LogicPuzzle | null {
  if (banco.length === 0) return null;
  const min = Math.max(1, nivel - 1);
  const max = Math.min(10, nivel + 1);
  const enVentana = banco.filter((p) => p.dificultad >= min && p.dificultad <= max && !usados.has(p.id));
  const sinUsar = banco.filter((p) => !usados.has(p.id));
  const pool = enVentana.length > 0 ? enVentana : sinUsar.length > 0 ? sinUsar : banco;
  return pool[Math.floor(Math.random() * pool.length)];
}
