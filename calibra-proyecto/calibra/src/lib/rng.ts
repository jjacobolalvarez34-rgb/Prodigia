// PRNG determinístico (mulberry32): misma semilla, misma secuencia de
// números siempre — nunca usa Math.random. Dos usos hoy: el reto diario
// (todos ven los mismos 5 problemas, sembrado por fecha) y los duelos en
// tiempo real (ambos rivales ven exactamente los mismos problemas,
// sembrado por duels.semilla_problemas).
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function rng() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
