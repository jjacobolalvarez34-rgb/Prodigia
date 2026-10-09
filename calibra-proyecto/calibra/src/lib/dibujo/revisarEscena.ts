import type { Escena } from "./escena";

// Revisa que cada cuadro de la escena tenga solo números finitos y textos sanos.
export function revisarEscena(e: Escena): string[] {
  const fallas: string[] = [];
  if (!Number.isInteger(e.pasos) || e.pasos < 1) fallas.push(`pasos ${e.pasos}`);
  if (!(e.ms > 0)) fallas.push(`ms ${e.ms}`);
  if (!e.alternativa || /NaN|undefined|Infinity/.test(e.alternativa)) fallas.push(`alternativa «${e.alternativa}»`);
  for (let paso = 0; paso <= e.pasos; paso++) {
    const ley = e.leyenda(paso);
    if (ley !== null && /NaN|undefined|Infinity/.test(ley)) fallas.push(`leyenda ${paso}: «${ley}»`);
    for (const t of [0, 0.37, 1]) {
      const d = e.dibujar(paso, t);
      if (!(d.ancho > 0 && d.alto > 0)) fallas.push(`tamaño ${paso}/${t}`);
      for (const p of d.prims) {
        for (const [k, val] of Object.entries(p)) {
          if (typeof val === "number" && !Number.isFinite(val)) fallas.push(`${paso}/${t} ${p.t}.${k} = ${val}`);
          if (typeof val === "string" && /NaN|undefined|Infinity/.test(val)) fallas.push(`${paso}/${t} ${p.t}.${k} = «${val}»`);
        }
      }
    }
  }
  return fallas;
}
