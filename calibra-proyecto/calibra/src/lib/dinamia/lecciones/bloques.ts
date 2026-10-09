import type { GrupoDinamia } from "./tipos";

// Orden y nombre de los 6 temas de Aprender (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §3.2).
export const ORDEN_GRUPOS_DINAMIA: GrupoDinamia[] = ["cinematica", "vectores", "newton", "energia", "termo", "fluidos"];

export const NOMBRES_GRUPOS_DINAMIA: Record<GrupoDinamia, { es: string; en: string }> = {
  cinematica: { es: "Cinemática", en: "Kinematics" },
  vectores: { es: "Vectores", en: "Vectors" },
  newton: { es: "Leyes de Newton", en: "Newton's laws" },
  energia: { es: "Trabajo y energía", en: "Work and energy" },
  termo: { es: "Termodinámica", en: "Thermodynamics" },
  fluidos: { es: "Fluidos", en: "Fluids" },
};
