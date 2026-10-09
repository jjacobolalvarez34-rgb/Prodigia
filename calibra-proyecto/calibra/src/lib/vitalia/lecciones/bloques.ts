import type { GrupoVitalia } from "./tipos";

// Orden y nombre de los 6 temas de Aprender (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §5.2).
export const ORDEN_GRUPOS_VITALIA: GrupoVitalia[] = ["celula", "procesos", "genetica", "sistemas", "reinos", "ecologia"];

export const NOMBRES_GRUPOS_VITALIA: Record<GrupoVitalia, { es: string; en: string }> = {
  celula: { es: "La célula", en: "The cell" },
  procesos: { es: "Procesos celulares", en: "Cell processes" },
  genetica: { es: "Genética", en: "Genetics" },
  sistemas: { es: "Sistemas del cuerpo", en: "Body systems" },
  reinos: { es: "Reinos y clasificación", en: "Kingdoms and classification" },
  ecologia: { es: "Ecología", en: "Ecology" },
};
