// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- script de desarrollo: topojson-client no trae tipos; se corre con tsx.
// @ts-nocheck
// Genera src/lib/geografia/centroides.ts: el centro (longitud, latitud) de cada país
// del juego, calculado con d3-geo sobre el mismo mapa que se dibuja
// (public/data/countries-110m.json, world-atlas). Lo usa el «cómo se resuelve» de
// Geografía para decir hacia dónde y a cuántos km está el país correcto.
// Uso (desde calibra/): npx tsx --tsconfig tsconfig.json scripts/generar-centroides.ts
import { readFileSync, writeFileSync } from "node:fs";
import { geoArea, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { PAISES_POR_CONTINENTE } from "../src/lib/practica/geografia";

const topo = JSON.parse(readFileSync("public/data/countries-110m.json", "utf-8")) as Topology;
const fc = feature(topo, topo.objects.countries as GeometryCollection) as unknown as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
const porId = new Map(fc.features.map((f) => [String(f.id), f]));
const ids = new Set(Object.values(PAISES_POR_CONTINENTE).flatMap((l) => l.map((p) => p.id)));

const filas: string[] = [];
for (const id of [...ids].sort()) {
  const f = porId.get(id);
  if (!f) {
    console.warn("sin geometría:", id);
    continue;
  }
  // Países con territorios lejanos (Francia y la Guayana, EE. UU. y Alaska…): se usa el
  // polígono más grande, el territorio principal, para que el centro no quede en el mar.
  let objetivo: GeoJSON.Feature = f;
  if (f.geometry.type === "MultiPolygon") {
    const partes: GeoJSON.Feature[] = f.geometry.coordinates.map((c: GeoJSON.Position[][]) => ({ type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: c } }));
    objetivo = partes.reduce((a: GeoJSON.Feature, b: GeoJSON.Feature) => (geoArea(b) > geoArea(a) ? b : a));
  }
  const [lon, lat] = geoCentroid(objetivo);
  filas.push(`  "${id}": [${lon.toFixed(2)}, ${lat.toFixed(2)}],`);
}
writeFileSync(
  "src/lib/geografia/centroides.ts",
  `// GENERADO por scripts/generar-centroides.ts: no editar a mano.\n// Centro (longitud, latitud) de cada país del juego, con d3-geo sobre countries-110m.\nexport const CENTROIDES: Record<string, [number, number]> = {\n${filas.join("\n")}\n};\n`
);
console.log("países:", filas.length);
