// Detección de voseo residual en messages/es.json (solo reporta, no modifica).
import { readFileSync } from "node:fs";
const src = readFileSync("messages/es.json", "utf8");
const rePresente = /(?<![\p{L}\p{N}_])[a-zñáéíóú]+[áéí]s(?![\p{L}\p{N}_])/giu;
const presentes = [...new Set((src.match(rePresente) || []).map((x) => x.toLowerCase()))];
console.log("Voseo presente (terminación tónica + s):", presentes.join(", ") || "ninguna");

// Imperativos voseo típicos (terminación tónica) — meollo curado.
const IMPERATIVOS = `juega no ... aceptá agregá afiná analizá andá apreta armá buscá cambiá compartí completá
contá copiá dale date decidí dejá empezá entrá enviá esperá fijate guardá intentá jugá levantá mandá
meté mirá mostrá pasá pensá poné practicá probá recordá regulá sacá saltá seguí sigo subí sumá tocá
tomá uní usá validá vení volvé activá borrá bajá creá descargá editá elegí echá gastá golpeá ingresá
liberá navegá observá optimizá probalo probandolo realizá reiniciá seleccioná soltá usalo verificá`.split(/\s+/);
const uniqImpl = new Set();
for (const imp of IMPERATIVOS) {
  const re = new RegExp(`(?<![\\p{L}\\p{N}_])${imp}(?![\\p{L}\\p{N}_])`, "giu");
  if (re.test(src)) uniqImpl.add(imp.toLowerCase());
}
console.log("Imperativos candidatos:", [...uniqImpl].join(", ") || "ninguno");