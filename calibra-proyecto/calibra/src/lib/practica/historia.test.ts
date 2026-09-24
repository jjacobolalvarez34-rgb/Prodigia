import { describe, expect, it } from "vitest";
import {
  NOMBRE_MODO_HISTORIA,
  conRngSembrado,
  generarDetallado,
  generarPreguntaHistoria,
  type Generada,
  type ModoHistoria,
} from "./historia";
import { ESCALA_HISTORIA, activosEnNivel, firmaDeNivel, tiposDeNivel } from "./historiaEscala";
import { GENERADORES_CRONOLOGIA } from "./historiaCronologia";
import { GENERADORES_PERSONAJES, cumplePistas } from "./historiaPersonajes";
import { GENERADORES_CAUSAS } from "./historiaCausas";
import { GENERADORES_FECHAS, esDeAnioExacto } from "./historiaFechas";
import { HECHO_POR_ID, PERSONAJE_POR_ID, distinguibles, ventanaDeVida, textoRevela } from "@/lib/historia/tabla";
import { EPOCA_POR_ID, epocaDeAnio } from "@/lib/historia/epocas";
import { formatoAnio, sigloEtiqueta, decadaTexto, siglo } from "@/lib/historia/tiempo";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { generarRetoDelDia, generarRetoSemanal, type MundoRetoDiario } from "@/lib/retoDiario";

// Práctica de Historia: escala declarativa, determinación por semilla y ORÁCULO
// independiente: cada respuesta se rehace desde la tabla canónica usando los ids
// (`meta`) de lo que generó el generador, sin confiar en el texto del enunciado.
// Todos los límites de estos tests salen de la regla del generador, no de una
// estimación (un tope arbitrario fallaría una vez cada muchas miles de corridas).

const MODOS: ModoHistoria[] = ["cronologia", "personajes", "causaefecto", "fechas"];
const GENERADORES: Record<ModoHistoria, Record<string, unknown>> = {
  cronologia: GENERADORES_CRONOLOGIA,
  personajes: GENERADORES_PERSONAJES,
  causaefecto: GENERADORES_CAUSAS,
  fechas: GENERADORES_FECHAS,
};

function prng(semilla: number) {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sinAcentos(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const hecho = (id: string) => HECHO_POR_ID.get(id)!;
const personaje = (id: string) => PERSONAJE_POR_ID.get(id)!;

describe("escala de dificultad declarativa (1-10 en cada modo)", () => {
  it("cada modo cubre los niveles 1 a 10 y el conjunto de tipos no está vacío", () => {
    for (const modo of MODOS) for (let n = 1; n <= 10; n++) expect(activosEnNivel(modo, n).length, `${modo} nivel ${n}`).toBeGreaterThan(0);
  });

  it("un nivel es DISTINTO del anterior (tipos, pesos, dif y prominencia objetivo) en todos los modos", () => {
    for (const modo of MODOS) {
      for (let n = 2; n <= 10; n++) expect(firmaDeNivel(modo, n), `${modo}: nivel ${n} igual al ${n - 1}`).not.toBe(firmaDeNivel(modo, n - 1));
    }
  });

  it("cada banda de 3 niveles consecutivos trae un tipo que no estaba en los 3 anteriores, salvo la última, y el nivel 10 no repite el conjunto del 1", () => {
    for (const modo of MODOS) {
      const nuevos = (desde: number) => tiposDeNivel(modo, desde).filter((t) => !tiposDeNivel(modo, desde - 1).includes(t));
      // Los tipos que aparecen por primera vez en cada nivel: al menos 3 niveles distintos con novedad.
      const conNovedad = [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => nuevos(n).length > 0);
      expect(conNovedad.length, modo).toBeGreaterThanOrEqual(2);
      expect(tiposDeNivel(modo, 10).sort().join(), `${modo}: nivel 10 = nivel 1`).not.toBe(tiposDeNivel(modo, 1).sort().join());
      // Nada del nivel 10 es exactamente lo que se pregunta en el 1.
      expect(tiposDeNivel(modo, 10).filter((t) => tiposDeNivel(modo, 1).includes(t)).length, modo).toBeLessThan(tiposDeNivel(modo, 10).length);
    }
  });

  it("la prominencia objetivo baja de 10 a 3,25 (de lo más conocido a lo menos conocido)", () => {
    expect(firmaDeNivel("fechas", 1).endsWith("@10")).toBe(true);
    expect(firmaDeNivel("fechas", 10).endsWith("@3.25")).toBe(true);
  });

  it("todo tipo declarado tiene generador y todo generador está declarado", () => {
    for (const modo of MODOS) {
      expect(Object.keys(GENERADORES[modo]).sort(), modo).toEqual(ESCALA_HISTORIA[modo].map((t) => t.tipo).sort());
    }
  });

  it("todo tipo declarado sale de verdad del generador (con su `tipo`) en el nivel en que está activo", () => {
    const rng = prng(11);
    for (const modo of MODOS) {
      for (const t of ESCALA_HISTORIA[modo]) {
        const visto = new Set<string>();
        for (let i = 0; i < 200 && !visto.has(t.tipo); i++) {
          const nivel = t.desde + (i % t.pesos.length);
          visto.add(generarDetallado(modo, nivel, new Set(), rng).tipo);
        }
        expect(visto.has(t.tipo), `${modo}/${t.tipo} nunca salió`).toBe(true);
      }
    }
  });

  it("solo salen tipos activos en el nivel pedido (y con distribución que respeta los pesos aproximadamente)", () => {
    const rng = prng(5);
    for (const modo of MODOS) {
      for (const nivel of [1, 4, 7, 10]) {
        const activos = new Set(activosEnNivel(modo, nivel).map((a) => a.tipo));
        for (let i = 0; i < 80; i++) expect(activos.has(generarDetallado(modo, nivel, new Set(), rng).tipo), `${modo} n${nivel}`).toBe(true);
      }
    }
  });

  it("la dificultad de lo que se pregunta crece con el nivel: la prominencia media baja del nivel 1 al 10 en cada modo", () => {
    const rng = prng(21);
    for (const modo of MODOS) {
      const media = (nivel: number) => {
        let s = 0;
        const n = 300;
        for (let i = 0; i < n; i++) s += generarDetallado(modo, nivel, new Set(), rng).prominencia;
        return s / n;
      };
      const m1 = media(1);
      const m5 = media(5);
      const m10 = media(10);
      // Diferencia mínima de 1 punto de prominencia entre extremos: sale del objetivo (10 vs 3,25) y del radio.
      expect(m1 - m10, `${modo}: ${m1.toFixed(2)} vs ${m10.toFixed(2)}`).toBeGreaterThan(1);
      expect(m1, modo).toBeGreaterThanOrEqual(m5 - 0.5);
      expect(m5, modo).toBeGreaterThanOrEqual(m10 - 0.5);
    }
  }, 60_000);
});

describe("determinismo (reto diario) y firma pública", () => {
  it("misma semilla -> mismas preguntas, en todos los modos y niveles", () => {
    for (const modo of MODOS) {
      for (const nivel of [1, 5, 10]) {
        const a = conRngSembrado(prng(99), () => Array.from({ length: 12 }, () => generarPreguntaHistoria(modo, nivel)));
        const b = conRngSembrado(prng(99), () => Array.from({ length: 12 }, () => generarPreguntaHistoria(modo, nivel)));
        expect(a, `${modo} n${nivel}`).toEqual(b);
      }
    }
  });

  it("semillas distintas dan preguntas distintas", () => {
    const a = conRngSembrado(prng(1), () => generarPreguntaHistoria("cronologia", 5));
    const distintas = Array.from({ length: 10 }, (_, i) => conRngSembrado(prng(i + 2), () => generarPreguntaHistoria("cronologia", 5)).enunciado + "|" + a.opciones.join());
    expect(new Set(distintas).size).toBeGreaterThan(1);
  });

  it("con semilla no se usa Math.random", () => {
    const original = Math.random;
    Math.random = () => {
      throw new Error("Math.random no debe usarse dentro de conRngSembrado");
    };
    try {
      for (const modo of MODOS) conRngSembrado(prng(7), () => generarPreguntaHistoria(modo, 6, new Set()));
    } finally {
      Math.random = original;
    }
  });

  it("conRngSembrado restaura el generador global", () => {
    conRngSembrado(prng(3), () => generarPreguntaHistoria("fechas", 3));
    const a = generarPreguntaHistoria("fechas", 3);
    const b = generarPreguntaHistoria("fechas", 3);
    expect(a.opciones.length).toBe(4);
    expect(b.opciones.length).toBe(4);
  });

  it("la firma pública se mantiene: (modo, nivel, usados?) -> {enunciado, opciones, respuesta, clave, dificultad}", () => {
    const p = generarPreguntaHistoria("personajes", 3);
    expect(Object.keys(p).sort()).toEqual(["clave", "dificultad", "enunciado", "opciones", "respuesta"]);
    expect(NOMBRE_MODO_HISTORIA.causaefecto).toBe("Causa y efecto");
    // niveles fuera de rango o decimales no rompen
    for (const n of [-3, 0, 0.4, 5.6, 99, NaN]) if (!Number.isNaN(n)) expect(() => generarPreguntaHistoria("cronologia", n)).not.toThrow();
  });
});

describe("todas las preguntas: forma común", () => {
  it("la respuesta está entre las opciones, hay 4 opciones distintas, español neutro y sin basura", () => {
    const rng = prng(31);
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 40; i++) {
          const g = generarDetallado(modo, nivel, new Set(), rng);
          const p = g.pregunta;
          const donde = `${modo} n${nivel} ${g.tipo}: ${p.enunciado}`;
          expect(p.opciones, donde).toContain(p.respuesta);
          expect(p.opciones.length, donde).toBe(4);
          expect(new Set(p.opciones).size, donde).toBe(4);
          expect(new Set(p.opciones.map((o) => o.trim().toLowerCase())).size, donde).toBe(4);
          expect(p.dificultad, donde).toBeGreaterThanOrEqual(1);
          expect(p.dificultad, donde).toBeLessThanOrEqual(10);
          expect(p.clave.length, donde).toBeGreaterThan(2);
          expect(detectarVoseo(p.enunciado + " " + p.opciones.join(" ")), donde).toEqual([]);
          expect(p.enunciado + p.opciones.join(""), donde).not.toMatch(/undefined|NaN|\[object|null/);
          expect(p.enunciado, donde).not.toMatch(/"/);
          // La respuesta nunca aparece dentro del enunciado.
          if (!g.tipo.startsWith("ordenar-")) expect(sinAcentos(p.enunciado).includes(sinAcentos(p.respuesta)), donde).toBe(false);
        }
      }
    }
  }, 60_000);

  it("los hechos y personajes de cada pregunta existen y no hay hechos repetidos en una misma pregunta", () => {
    const rng = prng(32);
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel += 3) {
        for (let i = 0; i < 40; i++) {
          const g = generarDetallado(modo, nivel, new Set(), rng);
          for (const id of g.hechos) expect(HECHO_POR_ID.has(id), `${g.tipo}: ${id}`).toBe(true);
          for (const id of g.personajes) expect(PERSONAJE_POR_ID.has(id), `${g.tipo}: ${id}`).toBe(true);
          expect(new Set(g.hechos).size, g.tipo).toBe(g.hechos.length);
        }
      }
    }
  }, 60_000);
});

// ---------- ORÁCULO por tipo ----------
function verificar(g: Generada): void {
  const p = g.pregunta;
  const m = g.meta as Record<string, unknown>;
  const donde = `${g.tipo}: ${p.enunciado} → ${p.respuesta}`;
  const idsDeNombres = (nombres: string[], pool: { id: string; nombre: string }[]) => nombres.map((n) => pool.find((x) => x.nombre === n)?.id);
  const todosHechos = [...HECHO_POR_ID.values()];
  const todosPers = [...PERSONAJE_POR_ID.values()];

  switch (g.tipo) {
    case "ordenar-epocas":
    case "ordenar-misma-epoca":
    case "ordenar-cercanos": {
      const hs = g.hechos.map(hecho);
      expect(hs.length, donde).toBe(3);
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) expect(distinguibles(hs[i], hs[j]), `${donde}: orden no garantizado`).toBe(true);
      const ordenados = [...hs].sort((a, b) => a.anio - b.anio);
      expect(p.respuesta, donde).toBe(ordenados.map((h) => h.nombre).join(" → "));
      // Cada opción usa exactamente los mismos tres hechos y solo la respuesta está en orden.
      for (const o of p.opciones) {
        const nombres = o.split(" → ");
        expect([...nombres].sort(), donde).toEqual(ordenados.map((h) => h.nombre).sort());
        const ids = idsDeNombres(nombres, hs) as string[];
        const anios = ids.map((id) => hecho(id).anio);
        const enOrden = anios.every((a, i) => i === 0 || anios[i - 1] < a);
        expect(enOrden, `${donde}: opción «${o}»`).toBe(o === p.respuesta);
      }
      if (g.tipo === "ordenar-epocas") expect(new Set(hs.map((h) => h.epoca)).size, donde).toBe(3);
      if (g.tipo === "ordenar-misma-epoca") expect(new Set(hs.map((h) => h.epoca)).size, donde).toBe(1);
      break;
    }
    case "entre": {
      const x = hecho(m.correcta as string);
      const [a, b] = (m.limites as string[]).map(hecho);
      expect(a.anio + a.margen < x.anio - x.margen && x.anio + x.margen < b.anio - b.margen, donde).toBe(true);
      expect(p.respuesta, donde).toBe(x.nombre);
      for (const id of m.distractores as string[]) {
        const d = hecho(id);
        expect(d.anio + d.margen < a.anio - a.margen || d.anio - d.margen > b.anio + b.margen, `${donde}: distractor ${id} cae entre los límites`).toBe(true);
      }
      break;
    }
    case "siglo": {
      const h = hecho((typeof m.hecho === "string" ? m.hecho : m.correcta) as string);
      expect(p.respuesta, donde).toBe(sigloEtiqueta(h.anio));
      // El margen no cruza el siglo: la respuesta es única.
      const s = siglo(h.anio);
      expect(siglo(h.anio - h.margen === 0 ? -1 : h.anio - h.margen), donde).toEqual(s);
      expect(siglo(h.anio + h.margen === 0 ? 1 : h.anio + h.margen), donde).toEqual(s);
      for (const o of p.opciones) {
        expect(o, donde).toMatch(/^Siglo [IVXL]+( a\. C\.)?$/);
        expect(o.startsWith("Siglo XXII") || o.startsWith("Siglo XXIII"), `${donde}: siglo futuro`).toBe(false);
      }
      break;
    }
    case "mas-antiguo": {
      const hs = g.hechos.map(hecho);
      const primero = [...hs].sort((a, b) => a.anio - b.anio)[0];
      expect(p.respuesta, donde).toBe(primero.nombre);
      for (const h of hs) if (h.id !== primero.id) expect(distinguibles(primero, h), donde).toBe(true);
      expect(new Set(hs.map((h) => h.region)).size, donde).toBeGreaterThanOrEqual(3);
      break;
    }
    case "mismo-siglo": {
      const ref = hecho(m.referencia as string);
      const ok = hecho(m.correcta as string);
      expect(siglo(ok.anio), donde).toEqual(siglo(ref.anio));
      expect(ok.region, donde).not.toBe(ref.region);
      for (const id of m.distractores as string[]) {
        const d = hecho(id);
        expect(siglo(d.anio - d.margen === 0 ? -1 : d.anio - d.margen).n === siglo(ref.anio).n && siglo(d.anio).aC === siglo(ref.anio).aC, `${donde}: distractor ${id} del mismo siglo`).toBe(false);
        expect(siglo(d.anio), `${donde}: distractor ${id}`).not.toEqual(siglo(ref.anio));
      }
      break;
    }
    case "pistas-completas":
    case "rol-y-dato":
    case "solo-dato":
    case "rol-y-vida": {
      const correcto = personaje(m.correcta as string);
      expect(p.respuesta, donde).toBe(correcto.nombre);
      const pistas = m.pistas as ("rol" | "vida" | "dato")[];
      expect(cumplePistas(correcto, correcto, pistas), donde).toBe(true);
      for (const id of m.distractores as string[]) {
        const d = personaje(id);
        expect(cumplePistas(d, correcto, pistas), `${donde}: el distractor ${d.nombre} también cumple las pistas`).toBe(false);
      }
      // La pista no dice el nombre del personaje.
      expect(textoRevela(p.enunciado, correcto), `${donde}: la pista revela el nombre`).toBe(false);
      break;
    }
    case "personaje-de-hecho": {
      const h = hecho(m.hecho as string);
      const ok = personaje(m.correcta as string);
      expect(h.personajes, donde).toContain(ok.id);
      expect(textoRevela(h.nombre, ok), `${donde}: el hecho revela al personaje`).toBe(false);
      for (const id of m.distractores as string[]) {
        const d = personaje(id);
        expect(h.personajes, donde).not.toContain(id);
        const [desde, hasta] = ventanaDeVida(d);
        expect(h.anio + h.margen < desde || h.anio - h.margen > hasta, `${donde}: ${d.nombre} vivía en ${h.anio}`).toBe(true);
      }
      break;
    }
    case "hecho-de-personaje": {
      const pers = personaje(m.personaje as string);
      const ok = hecho(m.correcta as string);
      expect(ok.personajes, donde).toContain(pers.id);
      expect(textoRevela(ok.nombre, pers), donde).toBe(false);
      for (const id of m.distractores as string[]) {
        const d = hecho(id);
        expect(d.personajes, donde).not.toContain(pers.id);
        const [desde, hasta] = ventanaDeVida(pers);
        expect(d.anio + d.margen < desde || d.anio - d.margen > hasta, `${donde}: ${pers.nombre} vivía en ${d.anio}`).toBe(true);
      }
      break;
    }
    case "consecuencia": {
      const causa = hecho(m.causa as string);
      const efecto = hecho(m.correcta as string);
      expect(efecto.causas, donde).toContain(causa.id);
      expect(p.respuesta, donde).toBe(efecto.nombre);
      for (const id of m.distractores as string[]) {
        const d = hecho(id);
        expect(d.causas, `${donde}: ${id} sí es consecuencia`).not.toContain(causa.id);
        expect(d.anio + d.margen < causa.anio - causa.margen, `${donde}: ${id} no es anterior a la causa`).toBe(true);
      }
      break;
    }
    case "causa": {
      const efecto = hecho(m.efecto as string);
      const causa = hecho(m.correcta as string);
      expect(efecto.causas, donde).toContain(causa.id);
      for (const id of m.distractores as string[]) {
        const d = hecho(id);
        expect(efecto.causas, `${donde}: ${id} sí es causa`).not.toContain(id);
        expect(d.anio - d.margen > efecto.anio + efecto.margen, `${donde}: ${id} no es posterior al efecto`).toBe(true);
      }
      break;
    }
    case "cadena-intermedia":
    case "cadena-remota": {
      const [a, b, c] = (m.cadena as string[]).map(hecho);
      expect(b.causas, donde).toContain(a.id);
      expect(c.causas, donde).toContain(b.id);
      const correcta = g.tipo === "cadena-intermedia" ? b : c;
      expect(p.respuesta, donde).toBe(correcta.nombre);
      for (const id of m.distractores as string[]) {
        expect([a.id, b.id, c.id], donde).not.toContain(id);
        const d = hecho(id);
        if (g.tipo === "cadena-intermedia") expect(d.anio + d.margen < a.anio - a.margen || d.anio - d.margen > c.anio + c.margen, `${donde}: ${id} cae dentro de la cadena`).toBe(true);
        else expect(d.anio + d.margen < a.anio - a.margen, `${donde}: ${id} no es anterior a la causa`).toBe(true);
      }
      break;
    }
    case "epoca": {
      const h = hecho(m.hecho as string);
      expect(epocaDeAnio(h.anio), donde).toBe(h.epoca);
      expect(epocaDeAnio(h.anio - h.margen), `${donde}: el margen cruza una frontera`).toBe(h.epoca);
      expect(epocaDeAnio(h.anio + h.margen), `${donde}: el margen cruza una frontera`).toBe(h.epoca);
      expect(h.frontera, `${donde}: un hecho frontera no se pregunta por época`).toBeUndefined();
      expect(p.respuesta, donde).toBe(EPOCA_POR_ID[h.epoca].nombre.es);
      expect(p.opciones.sort(), donde).toEqual(Object.values(EPOCA_POR_ID).map((e) => e.nombre.es).filter((n) => p.opciones.includes(n)).sort());
      break;
    }
    case "decada": {
      const h = hecho(m.hecho as string);
      expect(esDeAnioExacto(h), `${donde}: solo hechos de fecha exacta`).toBe(true);
      expect(p.respuesta, donde).toBe(decadaTexto(h.anio));
      break;
    }
    case "anio": {
      const h = hecho(m.hecho as string);
      expect(esDeAnioExacto(h), `${donde}: solo hechos de fecha exacta`).toBe(true);
      expect(p.respuesta, donde).toBe(formatoAnio(h.anio));
      for (const y of m.distractores as number[]) {
        expect(y, donde).not.toBe(h.anio);
        expect(Math.sign(y), donde).toBe(Math.sign(h.anio));
        expect(p.opciones, donde).toContain(formatoAnio(y));
      }
      break;
    }
    default:
      throw new Error(`Tipo sin oráculo: ${g.tipo}`);
  }
  void todosHechos;
  void todosPers;
}

describe("oráculo: cada respuesta se rehace desde la tabla canónica", () => {
  it("2000 preguntas por modo (todos los niveles) son correctas y cada distractor es realmente incorrecto", () => {
    const rng = prng(2026);
    const vistos = new Set<string>();
    for (const modo of MODOS) {
      for (let i = 0; i < 2000; i++) {
        const nivel = 1 + (i % 10);
        const g = generarDetallado(modo, nivel, new Set(), rng);
        verificar(g);
        vistos.add(`${modo}/${g.tipo}`);
      }
    }
    const declarados = MODOS.flatMap((m) => ESCALA_HISTORIA[m].map((t) => `${m}/${t.tipo}`));
    expect([...vistos].sort()).toEqual(declarados.sort());
  }, 120_000);

  it("los distractores de cronología y fechas nunca son la respuesta correcta en otra forma (siglo y año a. C. vs d. C.)", () => {
    const rng = prng(77);
    for (let i = 0; i < 1500; i++) {
      const g = generarDetallado("fechas", 2 + (i % 9), new Set(), rng);
      if (g.tipo !== "siglo") continue;
      const h = hecho(g.meta.hecho as string);
      const s = siglo(h.anio);
      // Ninguna opción incorrecta describe el mismo siglo en otra escritura.
      const correctas = g.pregunta.opciones.filter((o) => o === sigloEtiqueta(h.anio));
      expect(correctas.length, g.pregunta.enunciado).toBe(1);
      expect(s.n).toBeGreaterThan(0);
    }
  });
});

describe("usados / clave: sin repetir preguntas", () => {
  it("45 preguntas seguidas (el reto semanal) no repiten clave en ningún modo ni nivel, sin caer en la pasada de repetición", () => {
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (const semilla of [1, 2, 3]) {
          const rng = prng(semilla * 1000 + nivel);
          const usados = new Set<string>();
          for (let i = 0; i < 45; i++) {
            const g = generarDetallado(modo, nivel, usados, rng);
            expect(usados.has(g.pregunta.clave), `${modo} n${nivel} pregunta ${i + 1}: clave repetida ${g.pregunta.clave}`).toBe(false);
            usados.add(g.pregunta.clave);
          }
        }
      }
    }
  }, 120_000);

  it("con todo el banco usado, sigue generando (repite en vez de fallar)", () => {
    const rng = prng(4);
    const usados = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const p = generarDetallado("causaefecto", 8, usados, rng).pregunta;
      usados.add(p.clave);
    }
    expect(usados.size).toBeGreaterThan(30);
  });

  it("la clave identifica lo que se preguntó: nombra alguno de los hechos o personajes de la pregunta", () => {
    const rng = prng(9);
    for (let i = 0; i < 600; i++) {
      const g = generarDetallado(MODOS[i % 4], 1 + (i % 10), new Set(), rng);
      const ids = [...g.hechos, ...g.personajes];
      expect(ids.some((id) => g.pregunta.clave.includes(id)), `${g.tipo}: ${g.pregunta.clave}`).toBe(true);
    }
  });
});

describe("reto diario y semanal con Historia", () => {
  const SOLO_HISTORIA: MundoRetoDiario[] = ["historia"];

  it("el reto de un día es determinista y sus preguntas de Historia son válidas", () => {
    const a = generarRetoDelDia("2026-09-24", SOLO_HISTORIA);
    const b = generarRetoDelDia("2026-09-24", SOLO_HISTORIA);
    expect(a).toEqual(b);
    for (const q of a) {
      expect(q.mundo).toBe("historia");
      expect(q.opciones).toContain(q.respuesta);
      expect(new Set(q.opciones).size).toBe(q.opciones.length);
    }
  });

  it("el reto semanal (45 preguntas) de solo Historia no repite ninguna pregunta", () => {
    for (const semana of ["2026-09-21", "2026-09-28", "2027-01-04"]) {
      const reto = generarRetoSemanal(semana, SOLO_HISTORIA);
      expect(reto).toHaveLength(45);
      const claves = reto.map((q) => `${q.enunciado}|${q.respuesta}`);
      expect(new Set(claves).size, semana).toBe(45);
    }
  });
});
