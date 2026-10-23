// Auditoría de variedad de TODOS los mundos (docs/AUDITORIA_PREGUNTAS.md): el mismo
// test que variedadNumeria.test.ts, aplicado a cada modo de cada adaptador
// compartido (src/lib/mundosJugables) y a Geografía. Es solo un reporte: no exige
// mínimos (los arreglos de cada mundo van por separado; cuando un mundo quede
// arreglado, se le agregan pisos como en Numeria). Para ver la tabla:
//   AUDITAR_VARIEDAD=1 npx vitest run src/lib/practica/variedadMundos
import { describe, expect, it } from "vitest";
import { ADAPTADORES, type MundoSlug, type PreguntaMundo } from "@/lib/mundosJugables";
import { elegirPaisAleatorio, PAISES_POR_CONTINENTE, type Continente } from "./geografia";
import { encabezadoTabla, filaTabla, medirVariedad } from "./variedad";

const N = 200;

// Lo que ve el jugador: enunciado + opciones (ordenadas: el orden al azar no cuenta
// como pregunta distinta) + respuesta + lo dibujado arriba.
function clave(p: PreguntaMundo): string {
  const e = p.entrada;
  const opciones = e.tipo === "opciones" ? [...e.opciones].sort().join("|") : "";
  const respuesta = e.tipo === "numero" ? String(e.respuesta) : e.respuesta;
  return `${p.enunciado}#${opciones}#${respuesta}#${JSON.stringify(p.visuales ?? [])}#${JSON.stringify(p.memoria ?? null)}`;
}

function modosDeMundos(): { nombre: string; generar: (nivel: number) => string }[] {
  const modos: { nombre: string; generar: (nivel: number) => string }[] = [];
  for (const [slug, def] of Object.entries(ADAPTADORES) as [MundoSlug, NonNullable<(typeof ADAPTADORES)[MundoSlug]>][]) {
    const filtros = def.filtro ? def.filtro.opciones.map((o) => o.id) : [undefined];
    for (const modo of def.modos) {
      for (const filtro of filtros) {
        modos.push({
          nombre: `${slug} · ${modo.id}${filtro ? ` (${filtro})` : ""}`,
          // Enigmia sin banco de la base: «deducción» cae a patrones generados.
          generar: (nivel) => {
            const niveles = Object.fromEntries(def.modos.map((m) => [m.id, nivel]));
            return clave(def.generar(modo.id, nivel, new Set(), slug === "enigmia" ? [] : null, undefined, filtro, niveles));
          },
        });
      }
    }
  }
  for (const continente of Object.keys(PAISES_POR_CONTINENTE) as Continente[]) {
    modos.push({ nombre: `geografia · ${continente} (mapa)`, generar: (nivel) => elegirPaisAleatorio(PAISES_POR_CONTINENTE[continente], nivel, new Set())?.id ?? "" });
  }
  return modos;
}

describe("auditoría de variedad de todos los mundos (reporte)", () => {
  it("cada adaptador tiene modos para auditar", () => {
    expect(Object.keys(ADAPTADORES).length).toBeGreaterThanOrEqual(13);
  });

  it.runIf(Boolean(process.env.AUDITAR_VARIEDAD))("tabla", () => {
    const filas: string[] = [];
    for (const m of modosDeMundos()) {
      try {
        filas.push(filaTabla(m.nombre, medirVariedad(m.generar, N)));
      } catch (e) {
        filas.push(`| ${m.nombre} | error: ${(e as Error).message.slice(0, 80)} |`);
      }
    }
    console.log(`\n${encabezadoTabla()}\n${filas.join("\n")}\n`);
  });
});
