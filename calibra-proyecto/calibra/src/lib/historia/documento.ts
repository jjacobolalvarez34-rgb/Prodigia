import { EPOCAS } from "./epocas";
import { HECHOS, PERSONAJES, PERSONAJE_POR_ID, HECHO_POR_ID, NOMBRE_REGION, vidaTexto } from "./tabla";
import { formatoAnio } from "./tiempo";
import type { Certeza, EpocaId, Region } from "./tipos";

// Genera docs/HISTORIA_HECHOS.md desde la tabla canónica, para la REVISIÓN HUMANA
// del contenido. historiaTabla.test.ts compara este texto con el archivo del repo:
// si alguien cambia hechos.ts o personajes.ts sin regenerar el documento, el test
// falla. Regenerar: HISTORIA_ESCRIBIR_DOC=1 npx vitest run src/lib/historia


const ETIQUETA_CERTEZA: Record<Certeza, string> = { exacta: "exacta", convencional: "convencional", aproximada: "aproximada" };

function anioDoc(anio: number, certeza: Certeza, margen: number): string {
  const base = formatoAnio(anio);
  if (certeza === "exacta") return base;
  return margen > 0 ? `${base} (± ${margen >= 10000 ? formatoAnio(margen).replace(" d. C.", "") : margen})` : base;
}

function fila(celdas: (string | number)[]): string {
  return `| ${celdas.map((c) => String(c).replace(/\|/g, "\\|")).join(" | ")} |`;
}

export function generarDocumentoHechos(): string {
  const L: string[] = [];
  L.push("# Historia: tabla canónica de hechos y personajes");
  L.push("");
  L.push("> Archivo GENERADO desde `src/lib/historia/hechos.ts` y `personajes.ts`. No editar a mano:");
  L.push("> `HISTORIA_ESCRIBIR_DOC=1 npx vitest run src/lib/historia` lo regenera y `historiaTabla.test.ts`");
  L.push("> falla si queda desincronizado. Es la lista para REVISIÓN HUMANA: cada fila es un dato que la");
  L.push("> práctica y las lecciones enseñan como cierto. Ante la menor duda, corregir la fila o borrarla.");
  L.push("");
  const porEpoca = (e: EpocaId) => HECHOS.filter((h) => h.epoca === e).length;
  const porCerteza = (c: Certeza) => HECHOS.filter((h) => h.certeza === c).length;
  L.push("## Resumen");
  L.push("");
  L.push(`- **${HECHOS.length} hechos** y **${PERSONAJES.length} personajes**, solo de historia universal (sin bloque nacional).`);
  L.push(`- Hechos por época: ${EPOCAS.map((e) => `${e.nombre.es} ${porEpoca(e.id)}`).join(", ")}.`);
  const regiones = Object.keys(NOMBRE_REGION) as Region[];
  L.push(`- Hechos por región: ${regiones.filter((r) => HECHOS.some((h) => h.region === r)).map((r) => `${NOMBRE_REGION[r]} ${HECHOS.filter((h) => h.region === r).length}`).join(", ")}.`);
  L.push(`- Certeza de la fecha: exacta ${porCerteza("exacta")}, convencional ${porCerteza("convencional")}, aproximada ${porCerteza("aproximada")}.`);
  L.push("");
  L.push("### Glosario de certeza");
  L.push("");
  L.push("- **exacta**: el año es de amplio consenso; los libros no discrepan. Solo estos hechos se preguntan por año exacto o década.");
  L.push("- **convencional**: el año lo fija la tradición o la convención escolar, aunque haya variantes (fundación de Roma, caída de Roma de Occidente en 476...). El margen `±` es la incertidumbre en años.");
  L.push("- **aproximada**: el año es una estimación (`±` margen). Se muestra como «hacia ...» y nunca se pregunta como año exacto.");
  L.push("");
  L.push("### Fronteras de época (convenciones, no hechos)");
  L.push("");
  for (const e of EPOCAS) {
    L.push(`- **${e.nombre.es}**: ${e.frontera ? e.frontera.es : "desde las primeras herramientas de piedra."}`);
  }
  L.push("");
  L.push("## Hechos");
  for (const e of EPOCAS) {
    L.push("");
    L.push(`### ${e.numero}. ${e.nombre.es}`);
    L.push("");
    L.push(fila(["id", "Hecho", "Año", "Certeza", "Región", "Prom.", "Personajes", "Causas"]));
    L.push(fila(["---", "---", "---", "---", "---", "---", "---", "---"]));
    for (const h of HECHOS.filter((x) => x.epoca === e.id).sort((a, b) => a.anio - b.anio)) {
      const pers = h.personajes.map((p) => PERSONAJE_POR_ID.get(p)?.nombre ?? p).join(", ");
      const causas = h.causas.map((c) => HECHO_POR_ID.get(c)?.nombre ?? c).join("; ");
      L.push(fila([h.id, h.nombre + (h.frontera ? " (frontera de época)" : ""), anioDoc(h.anio, h.certeza, h.margen), ETIQUETA_CERTEZA[h.certeza], NOMBRE_REGION[h.region], h.prominencia, pers, causas]));
    }
  }
  L.push("");
  L.push("## Personajes");
  for (const e of EPOCAS) {
    const lista = PERSONAJES.filter((p) => p.epoca === e.id);
    if (lista.length === 0) continue;
    L.push("");
    L.push(`### ${e.numero}. ${e.nombre.es}`);
    L.push("");
    L.push(fila(["id", "Personaje", "Rol", "Vida", "Región", "Prom.", "Dato"]));
    L.push(fila(["---", "---", "---", "---", "---", "---", "---"]));
    for (const p of [...lista].sort((a, b) => a.auge - b.auge)) {
      L.push(fila([p.id, p.nombre, p.rol, vidaTexto(p), NOMBRE_REGION[p.region], p.prominencia, p.logro]));
    }
  }
  L.push("");
  return L.join("\n");
}
