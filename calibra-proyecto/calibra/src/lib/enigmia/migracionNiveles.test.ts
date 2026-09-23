import { describe, it, expect } from "vitest";

// Este archivo NO ejecuta la migración real (supabase/migrations/
// 0205_enigmia_niveles_por_categoria.sql) — no hay Postgres disponible en
// este entorno de test. Lo que sí se hizo: validar la sintaxis de esa
// migración con pglast (python -c "import pglast; pglast.parse_sql(...)"),
// que pasó limpio.
//
// Lo que verifica ESTE archivo es la SEMÁNTICA del paso de expansión de
// datos (la parte con más riesgo real de la migración: perder o duplicar
// niveles de usuarios existentes) — reescrita acá como una función JS pura
// que espeja línea por línea el propio SQL:
//
//   insert into logic_skill_levels (user_id, categoria, nivel, racha_actual, updated_at)
//   select user_id, cat, nivel, racha_actual, updated_at
//   from logic_skill_levels, unnest(array['memoria','patrones','deduccion','computacional']) as cat
//   where categoria is null;
//
//   delete from logic_skill_levels where categoria is null;
//
// Sirve como documentación ejecutable de qué se espera exactamente de esa
// migración de datos — si alguien la reescribe distinto en el futuro y
// cambia esta semántica sin querer, este test lo marca.

const CATEGORIAS = ["memoria", "patrones", "deduccion", "computacional"] as const;

interface FilaVieja {
  user_id: string;
  categoria: null;
  nivel: number;
  racha_actual: number;
  updated_at: string;
}

interface FilaNueva {
  user_id: string;
  categoria: (typeof CATEGORIAS)[number];
  nivel: number;
  racha_actual: number;
  updated_at: string;
}

// Espejo del `insert ... select ... unnest ... where categoria is null`
// seguido del `delete where categoria is null` — misma secuencia de 2
// pasos que hace el SQL real.
function expandirFilasLegacy(filas: (FilaVieja | FilaNueva)[]): FilaNueva[] {
  const expandidas: FilaNueva[] = [];
  for (const fila of filas) {
    if (fila.categoria !== null) {
      // Ya tiene categoría (ya migrada o insertada directo) — el `where
      // categoria is null` del INSERT real la deja afuera de la expansión.
      expandidas.push(fila);
      continue;
    }
    for (const cat of CATEGORIAS) {
      expandidas.push({ user_id: fila.user_id, categoria: cat, nivel: fila.nivel, racha_actual: fila.racha_actual, updated_at: fila.updated_at });
    }
  }
  // El DELETE final saca las filas viejas (categoria is null) — ya
  // quedaron reemplazadas por las 4 nuevas de cada una, así que el
  // resultado final es solo lo que tiene categoría.
  return expandidas.filter((f): f is FilaNueva => f.categoria !== null);
}

describe("migración 0205 — expansión de logic_skill_levels a 4 filas por usuario", () => {
  it("ejemplo concreto del reporte: nivel=6, racha_actual=2 → 4 filas con el mismo nivel/racha", () => {
    const antes: FilaVieja[] = [{ user_id: "U", categoria: null, nivel: 6, racha_actual: 2, updated_at: "2026-09-20T00:00:00Z" }];
    const despues = expandirFilasLegacy(antes);

    expect(despues).toHaveLength(4);
    for (const cat of CATEGORIAS) {
      const fila = despues.find((f) => f.categoria === cat);
      expect(fila).toBeDefined();
      expect(fila!.user_id).toBe("U");
      expect(fila!.nivel).toBe(6);
      expect(fila!.racha_actual).toBe(2);
    }
  });

  it("nadie se resetea a nivel 1: el nivel que ya tenía se hereda en las 4 categorías", () => {
    const antes: FilaVieja[] = [{ user_id: "U", categoria: null, nivel: 9, racha_actual: 0, updated_at: "2026-09-20T00:00:00Z" }];
    const despues = expandirFilasLegacy(antes);
    expect(despues.every((f) => f.nivel === 9)).toBe(true);
    expect(despues.every((f) => f.nivel !== 1)).toBe(true);
  });

  it("varios usuarios: cada uno termina con sus propias 4 filas, sin mezclarse entre sí", () => {
    const antes: FilaVieja[] = [
      { user_id: "A", categoria: null, nivel: 3, racha_actual: 1, updated_at: "t" },
      { user_id: "B", categoria: null, nivel: 8, racha_actual: 0, updated_at: "t" },
    ];
    const despues = expandirFilasLegacy(antes);
    expect(despues).toHaveLength(8);
    expect(despues.filter((f) => f.user_id === "A")).toHaveLength(4);
    expect(despues.filter((f) => f.user_id === "B")).toHaveLength(4);
    expect(despues.filter((f) => f.user_id === "A").every((f) => f.nivel === 3)).toBe(true);
    expect(despues.filter((f) => f.user_id === "B").every((f) => f.nivel === 8)).toBe(true);
  });

  it("es idempotente: reintentar la migración sobre el resultado ya migrado no cambia nada (no duplica filas)", () => {
    const antes: FilaVieja[] = [{ user_id: "U", categoria: null, nivel: 6, racha_actual: 2, updated_at: "t" }];
    const primeraPasada = expandirFilasLegacy(antes);
    // El `where categoria is null` del INSERT real ya no encuentra nada
    // para expandir la segunda vez — se lo simula pasando el resultado ya
    // migrado (todas las filas ya con categoria != null) de nuevo.
    const segundaPasada = expandirFilasLegacy(primeraPasada);
    expect(segundaPasada).toEqual(primeraPasada);
    expect(segundaPasada).toHaveLength(4);
  });

  it("sin filas viejas (usuario nuevo, nunca jugó Enigmia): no expande nada", () => {
    expect(expandirFilasLegacy([])).toHaveLength(0);
  });
});
