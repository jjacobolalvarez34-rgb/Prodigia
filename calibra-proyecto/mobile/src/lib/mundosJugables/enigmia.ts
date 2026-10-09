// Enigmia: la generación es la misma de la web (ENIGMIA_BASE, en
// calibra/src/lib/mundosJugables/enigmia.ts). La app solo le suma lo suyo: el banco
// de deducción (logic_puzzles) y los niveles por categoría (logic_skill_levels),
// con copia en el teléfono para jugar sin conexión, y el guardado con
// insertar_intento_logica.
import { CATEGORIAS_ENIGMIA, ENIGMIA_BASE } from "@/lib/mundosJugables/enigmia";
import type { LogicPuzzle } from "@/types/database";
import { guardarIntentoLogica } from "../partida";
import { conCopia } from "../sinConexion";
import { supabase } from "../supabase";
import type { MundoJugable } from "./tipos";

export const ENIGMIA: MundoJugable = {
  ...ENIGMIA_BASE,
  preparar: async () =>
    (await conCopia("enigmia:banco", async () => {
      const { data, error } = await supabase.from("logic_puzzles").select("id, tipo, dificultad, contenido, respuesta");
      return error ? null : ((data ?? []) as LogicPuzzle[]);
    })) ?? [],
  cargarNiveles: async (userId) => {
    const filas =
      (await conCopia(`niveles:enigmia:${userId}`, async () => {
        const { data, error } = await supabase.from("logic_skill_levels").select("categoria, nivel").eq("user_id", userId);
        return error ? null : ((data ?? []) as { categoria: string; nivel: number }[]);
      })) ?? [];
    const r: Record<string, number> = {};
    for (const c of CATEGORIAS_ENIGMIA) r[c] = filas.find((f) => f.categoria === c)?.nivel ?? 1;
    r.mezcla = r.patrones;
    return r;
  },
  guardar: (p, _modo, nivel, correcto, timeMs, protegido) =>
    guardarIntentoLogica(String(p.datos?.puzzle_id ?? ""), nivel, String(p.datos?.categoria ?? "patrones"), correcto, timeMs, protegido),
};
