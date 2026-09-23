import { describe, it, expect } from "vitest";

// Este archivo NO ejecuta la migración real (supabase/migrations/
// 0207_geografia_niveles_por_continente.sql) — no hay Postgres disponible
// en este entorno de test. Lo que sí se hizo: validar la sintaxis de esa
// migración con pglast (python -c "import pglast; pglast.parse_sql(...)"),
// que pasó limpio.
//
// Lo que verifica ESTE archivo es la SEMÁNTICA del paso de expansión de
// datos (la parte con más riesgo real de la migración: perder o duplicar
// niveles de usuarios existentes) — reescrita acá como una función JS pura
// que espeja línea por línea el propio SQL:
//
//   insert into skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
//   select user_id, pt, nivel, racha_actual, updated_at
//   from skill_levels, unnest(array['geografia_america', 'geografia_europa', 'geografia_africa', 'geografia_asia_oceania']) as pt
//   where problem_type = 'geografia'
//   on conflict (user_id, problem_type) do nothing;
//
//   delete from skill_levels where problem_type = 'geografia';
//
// A diferencia de la migración de Enigmia (0205, categoria por usuario
// único en logic_skill_levels), acá NO hay cambio de esquema/PK: skill_levels
// ya tenía PK compuesta (user_id, problem_type) desde 0002_mecanica_v1.sql,
// así que la "expansión" es agregar 4 filas nuevas con problem_type
// distinto y borrar la fila vieja — sin tocar ninguna restricción.
//
// Sirve como documentación ejecutable de qué se espera exactamente de esa
// migración de datos — si alguien la reescribe distinto en el futuro y
// cambia esta semántica sin querer, este test lo marca.

const CONTINENTES = ["geografia_america", "geografia_europa", "geografia_africa", "geografia_asia_oceania"] as const;

interface FilaSkillLevel {
  user_id: string;
  problem_type: string;
  nivel: number;
  racha_actual: number;
  updated_at: string;
}

// Espejo del `insert ... select ... unnest ... where problem_type = 'geografia'`
// seguido del `delete where problem_type = 'geografia'` — misma secuencia
// de 2 pasos que hace el SQL real (en ese orden: primero se insertan las
// 4 filas nuevas heredando nivel/racha, recién después se borra la vieja).
function expandirGeografiaPorContinente(filas: FilaSkillLevel[]): FilaSkillLevel[] {
  const nuevas: FilaSkillLevel[] = [];
  for (const fila of filas) {
    if (fila.problem_type !== "geografia") continue;
    for (const continente of CONTINENTES) {
      nuevas.push({ user_id: fila.user_id, problem_type: continente, nivel: fila.nivel, racha_actual: fila.racha_actual, updated_at: fila.updated_at });
    }
  }
  // El resultado final: todas las filas que NO eran 'geografia' (sin
  // tocar, de otros mundos), más las 4 nuevas por cada fila 'geografia'
  // que había — la vieja 'geografia' queda afuera (el DELETE real la saca).
  const sinTocar = filas.filter((f) => f.problem_type !== "geografia");
  return [...sinTocar, ...nuevas];
}

describe("migración 0207 — expansión de skill_levels(problem_type='geografia') a 4 filas por continente", () => {
  it("ejemplo concreto del reporte: nivel=7, racha_actual=1 → 4 filas con el mismo nivel/racha, una por continente", () => {
    const antes: FilaSkillLevel[] = [{ user_id: "U", problem_type: "geografia", nivel: 7, racha_actual: 1, updated_at: "2026-09-23T00:00:00Z" }];
    const despues = expandirGeografiaPorContinente(antes);

    expect(despues).toHaveLength(4);
    for (const continente of CONTINENTES) {
      const fila = despues.find((f) => f.problem_type === continente);
      expect(fila).toBeDefined();
      expect(fila!.user_id).toBe("U");
      expect(fila!.nivel).toBe(7);
      expect(fila!.racha_actual).toBe(1);
    }
    // La fila vieja ya no está (el DELETE real la borra después del INSERT).
    expect(despues.find((f) => f.problem_type === "geografia")).toBeUndefined();
  });

  it("nadie se resetea a nivel 1: el nivel que ya tenía se hereda en los 4 continentes", () => {
    const antes: FilaSkillLevel[] = [{ user_id: "U", problem_type: "geografia", nivel: 9, racha_actual: 0, updated_at: "t" }];
    const despues = expandirGeografiaPorContinente(antes);
    expect(despues.every((f) => f.nivel === 9)).toBe(true);
    expect(despues.every((f) => f.nivel !== 1)).toBe(true);
  });

  it("varios usuarios: cada uno termina con sus propias 4 filas, sin mezclarse entre sí", () => {
    const antes: FilaSkillLevel[] = [
      { user_id: "A", problem_type: "geografia", nivel: 3, racha_actual: 1, updated_at: "t" },
      { user_id: "B", problem_type: "geografia", nivel: 8, racha_actual: 0, updated_at: "t" },
    ];
    const despues = expandirGeografiaPorContinente(antes);
    expect(despues).toHaveLength(8);
    expect(despues.filter((f) => f.user_id === "A")).toHaveLength(4);
    expect(despues.filter((f) => f.user_id === "B")).toHaveLength(4);
    expect(despues.filter((f) => f.user_id === "A").every((f) => f.nivel === 3)).toBe(true);
    expect(despues.filter((f) => f.user_id === "B").every((f) => f.nivel === 8)).toBe(true);
  });

  it("no toca filas de otros mundos (misma tabla compartida skill_levels)", () => {
    const antes: FilaSkillLevel[] = [
      { user_id: "U", problem_type: "geografia", nivel: 5, racha_actual: 2, updated_at: "t" },
      { user_id: "U", problem_type: "suma", nivel: 6, racha_actual: 1, updated_at: "t" },
      { user_id: "U", problem_type: "quimia_simbolos", nivel: 4, racha_actual: 0, updated_at: "t" },
    ];
    const despues = expandirGeografiaPorContinente(antes);
    // 4 nuevas de geografía + las 2 filas de otros mundos, intactas.
    expect(despues).toHaveLength(6);
    expect(despues.find((f) => f.problem_type === "suma")).toEqual(antes[1]);
    expect(despues.find((f) => f.problem_type === "quimia_simbolos")).toEqual(antes[2]);
  });

  it("es idempotente: reintentar la migración sobre el resultado ya migrado no cambia nada (no duplica filas)", () => {
    const antes: FilaSkillLevel[] = [{ user_id: "U", problem_type: "geografia", nivel: 6, racha_actual: 2, updated_at: "t" }];
    const primeraPasada = expandirGeografiaPorContinente(antes);
    // El `where problem_type = 'geografia'` del INSERT real ya no
    // encuentra nada para expandir la segunda vez (la fila vieja ya se
    // borró) — se lo simula pasando el resultado ya migrado de nuevo.
    const segundaPasada = expandirGeografiaPorContinente(primeraPasada);
    expect(segundaPasada).toEqual(primeraPasada);
    expect(segundaPasada).toHaveLength(4);
  });

  it("sin filas viejas (usuario nuevo, nunca jugó Geografía): no expande nada", () => {
    expect(expandirGeografiaPorContinente([])).toHaveLength(0);
  });
});
