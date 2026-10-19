import { filasCatalogoAmpliado, PAQUETES_NUEVOS } from "./catalogoAmpliado";

// Etiqueta «NUEVO» (PLAN_ECONOMIA.md, 2026-10-18): lo que se agregó hace menos de 21
// días la lleva hasta que lo tocas (se recuerda en cada dispositivo). Para sumar algo
// nuevo, agregarlo acá con la fecha en que salió.
export const DIAS_NUEVO = 21;
const DIA_MS = 86_400_000;

export const NOVEDADES: Record<string, string> = {
  // Tienda ampliada (0275).
  ...Object.fromEntries(filasCatalogoAmpliado().map((f) => [f.item, "2026-10-10"])),
  ...Object.fromEntries(PAQUETES_NUEVOS.map((p) => [p.item, "2026-10-10"])),
  // Recompensas (0290).
  fusion: "2026-10-18",
  capsula_alineacion: "2026-10-18",
};

export function esNuevo(clave: string, vistos: ReadonlySet<string>, ahora = Date.now()): boolean {
  const desde = NOVEDADES[clave];
  if (!desde || vistos.has(clave)) return false;
  return ahora - Date.parse(`${desde}T00:00:00Z`) < DIAS_NUEVO * DIA_MS;
}
