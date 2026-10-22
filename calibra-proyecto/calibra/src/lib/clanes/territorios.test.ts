import { describe, expect, it } from "vitest";
import {
  PASO_TERRITORIO,
  calcularTerritorios,
  coloresTerritorio,
  etiquetaTerritorio,
  pesoDeClan,
  puntoEnPoligono,
  semillaDeClan,
  territorioEnPunto,
  type ClanParaTerritorio,
  type Punto,
} from "./territorios";

function clanes(n: number, desde = 0): ClanParaTerritorio[] {
  return Array.from({ length: n }, (_, k) => {
    const i = k + desde;
    return {
      clan_id: `clan-${(i * 2654435761) % 1000003}-${i}`,
      cantidad_miembros: 1 + ((i * 7) % 20),
      nivel_clan: 1 + ((i * 3) % 9),
      creado_at: new Date(Date.UTC(2026, 0, 1) + i * 3600_000).toISOString(),
    };
  });
}

function areaPoligono(p: Punto[]): number {
  let s = 0;
  for (let k = 0; k < p.length; k++) s += p[k].x * p[(k + 1) % p.length].y - p[(k + 1) % p.length].x * p[k].y;
  return Math.abs(s / 2);
}

function segmentosSeCruzan(a: Punto, b: Punto, c: Punto, d: Punto): boolean {
  const o = (p: Punto, q: Punto, r: Punto) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(c, d, a);
  const d2 = o(c, d, b);
  const d3 = o(a, b, c);
  const d4 = o(a, b, d);
  const eps = 1e-6;
  return ((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) && ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps));
}

describe("territorios de clanes", () => {
  it("es determinista: los mismos clanes dan exactamente el mismo mapa", () => {
    const a = calcularTerritorios(clanes(40));
    const b = calcularTerritorios(clanes(40));
    expect(a).toEqual(b);
    // El orden de llegada no importa si traen fecha: se ordenan por fundación.
    const c = calcularTerritorios(clanes(40).reverse());
    expect(c.territorios.map((t) => t.d)).toEqual(a.territorios.map((t) => t.d));
  });

  it("la semilla de un clan solo depende de su orden y su id", () => {
    expect(semillaDeClan(5, "x")).toEqual(semillaDeClan(5, "x"));
    expect(semillaDeClan(5, "x")).not.toEqual(semillaDeClan(5, "y"));
  });

  it("todo clan tiene territorio, con su semilla adentro", () => {
    for (const n of [1, 2, 3, 5, 20, 60, 150]) {
      const mapa = calcularTerritorios(clanes(n));
      expect(mapa.territorios).toHaveLength(n);
      for (const t of mapa.territorios) {
        expect(t.celda.length).toBeGreaterThanOrEqual(3);
        expect(t.area).toBeGreaterThan(PASO_TERRITORIO * PASO_TERRITORIO * 0.25);
        expect(puntoEnPoligono(t.semilla, t.contorno)).toBe(true);
        expect(puntoEnPoligono(t.centro, t.contorno)).toBe(true);
        expect(t.radioInterior).toBeGreaterThan(8);
      }
    }
  });

  it("las semillas nunca quedan demasiado juntas", () => {
    const mapa = calcularTerritorios(clanes(300));
    let min = Infinity;
    const s = mapa.territorios.map((t) => t.semilla);
    for (let i = 0; i < s.length; i++)
      for (let j = i + 1; j < s.length; j++) min = Math.min(min, Math.hypot(s[i].x - s[j].x, s[i].y - s[j].y));
    expect(min).toBeGreaterThan(PASO_TERRITORIO * 1.2);
  });

  it("no hay solapes entre territorios (ni en las celdas exactas ni con los bordes ondulados)", () => {
    for (const n of [5, 20, 60]) {
      const mapa = calcularTerritorios(clanes(n));
      const { minX, minY, ancho, alto } = mapa.caja;
      // Muestreo fino: ningún punto cae en dos territorios.
      const paso = 3;
      const solapes: Punto[] = [];
      const cajas = mapa.territorios.map((t) => {
        const xs = t.contorno.map((p) => p.x).concat(t.celda.map((p) => p.x));
        const ys = t.contorno.map((p) => p.y).concat(t.celda.map((p) => p.y));
        return { t, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
      });
      for (let y = minY; y < minY + alto; y += paso) {
        for (let x = minX; x < minX + ancho; x += paso) {
          const p = { x: x + 0.37, y: y + 0.61 };
          let enCeldas = 0;
          let enContornos = 0;
          for (const { t, x0, x1, y0, y1 } of cajas) {
            if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
            if (puntoEnPoligono(p, t.celda)) enCeldas++;
            if (puntoEnPoligono(p, t.contorno)) enContornos++;
          }
          if (enCeldas > 1 || enContornos > 1) solapes.push(p);
        }
      }
      expect(solapes).toEqual([]);
      // Ningún contorno se corta a sí mismo ni corta al de un vecino.
      let cruces = 0;
      for (const t of mapa.territorios) {
        const otros = [t, ...mapa.territorios.filter((o) => t.vecinos.includes(o.clan_id))];
        for (const o of otros) {
          for (let i = 0; i < t.contorno.length; i++) {
            const a = t.contorno[i];
            const b = t.contorno[(i + 1) % t.contorno.length];
            for (let j = 0; j < o.contorno.length; j++) {
              if (o === t && Math.abs(i - j) <= 1) continue;
              if (o === t && (i === 0 || j === 0) && Math.abs(i - j) === t.contorno.length - 1) continue;
              const c = o.contorno[j];
              const d = o.contorno[(j + 1) % o.contorno.length];
              if (segmentosSeCruzan(a, b, c, d)) cruces++;
            }
          }
        }
      }
      expect(cruces).toBe(0);
    }
  });

  it("la frontera entre dos vecinos es la misma línea vista desde los dos lados", () => {
    const mapa = calcularTerritorios(clanes(30));
    const porId = new Map(mapa.territorios.map((t) => [t.clan_id, t]));
    const clave = (p: Punto) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
    for (const t of mapa.territorios) {
      const propios = new Set(t.contorno.map(clave));
      for (const v of t.vecinos) {
        const otro = porId.get(v)!;
        expect(otro.vecinos).toContain(t.clan_id);
        const compartidos = otro.contorno.filter((p) => propios.has(clave(p)));
        expect(compartidos.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("los vecinos de verdad se tocan: no quedan huecos en el interior del mapa", () => {
    const mapa = calcularTerritorios(clanes(60));
    // Cerca del centro (lejos de la costa) todo punto es de algún clan.
    const radio = PASO_TERRITORIO * Math.sqrt(60) * 0.7;
    let huecos = 0;
    for (let y = -radio; y <= radio; y += 5) {
      for (let x = -radio; x <= radio; x += 5) {
        if (Math.hypot(x, y) > radio) continue;
        if (!territorioEnPunto(mapa, { x: x + 0.13, y: y + 0.29 })) huecos++;
      }
    }
    expect(huecos).toBe(0);
  });

  it("un clan nuevo abre su espacio en la frontera y casi no mueve a los demás", () => {
    for (const n of [5, 20, 60]) {
      const antes = calcularTerritorios(clanes(n));
      const despues = calcularTerritorios(clanes(n + 1));
      const nuevo = despues.territorios[n];
      let intactos = 0;
      for (let i = 0; i < n; i++) {
        const a = antes.territorios[i];
        const b = despues.territorios[i];
        expect(b.clan_id).toBe(a.clan_id);
        expect(b.semilla).toEqual(a.semilla);
        if (b.d === a.d) intactos++;
        else expect(nuevo.vecinos).toContain(a.clan_id);
        const movida = Math.hypot(b.centro.x - a.centro.x, b.centro.y - a.centro.y);
        expect(movida).toBeLessThan(PASO_TERRITORIO * 0.45);
        // La celda solo puede achicarse (le ceden espacio al nuevo); el margen cubre
        // la diferencia de muestreo del arco de costa.
        expect(areaPoligono(b.celda)).toBeLessThanOrEqual(areaPoligono(a.celda) * 1.002);
      }
      if (n >= 20) expect(intactos / n).toBeGreaterThan(0.75);
      // El nuevo queda afuera del núcleo: más lejos del centro que la mediana.
      const dist = despues.territorios.map((t) => Math.hypot(t.semilla.x, t.semilla.y)).sort((x, y) => x - y);
      expect(Math.hypot(nuevo.semilla.x, nuevo.semilla.y)).toBeGreaterThanOrEqual(dist[Math.floor(dist.length / 2)]);
    }
  });

  it("los clanes más grandes tienen territorios más grandes", () => {
    expect(pesoDeClan(1, 1)).toBe(0);
    expect(pesoDeClan(10, 3)).toBeGreaterThan(pesoDeClan(3, 1));
    expect(pesoDeClan(20, 30)).toBeLessThan(1);
    const base = clanes(40).map((c) => ({ ...c, cantidad_miembros: 1, nivel_clan: 1 }));
    const chico = calcularTerritorios(base).territorios[12].area;
    base[12] = { ...base[12], cantidad_miembros: 20, nivel_clan: 8 };
    const grande = calcularTerritorios(base).territorios[12].area;
    expect(grande).toBeGreaterThan(chico * 1.5);
  });

  it("tocar un punto devuelve el territorio que está ahí", () => {
    const mapa = calcularTerritorios(clanes(20));
    for (const t of mapa.territorios) expect(territorioEnPunto(mapa, t.centro)?.clan_id).toBe(t.clan_id);
    expect(territorioEnPunto(mapa, { x: mapa.caja.minX - 100, y: 0 })).toBeNull();
  });

  it("sin clanes devuelve un mapa vacío con caja válida; con uno, una isla", () => {
    const vacio = calcularTerritorios([]);
    expect(vacio.territorios).toHaveLength(0);
    expect(vacio.caja.ancho).toBeGreaterThan(0);
    const uno = calcularTerritorios(clanes(1));
    expect(uno.territorios[0].vecinos).toEqual([]);
    expect(uno.territorios[0].d.startsWith("M")).toBe(true);
  });

  it("las etiquetas entran en su territorio y los colores son válidos", () => {
    const e = etiquetaTerritorio("Los Grandísimos Matemáticos del Norte", "LGM", 20);
    expect(e.texto.length * e.tam * 0.58).toBeLessThanOrEqual(20 * 1.9 + 0.001);
    expect(etiquetaTerritorio("Orión", null, 40).texto).toBe("Orión");
    const c = coloresTerritorio("#e11d48");
    for (const v of Object.values(c)) expect(v).toMatch(/^#[0-9a-f]{6}$/);
    expect(coloresTerritorio("no-es-color").color).toBe("#7c5cff");
  });
});
