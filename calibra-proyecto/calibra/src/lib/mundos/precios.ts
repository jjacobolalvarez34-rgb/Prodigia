// Fase 12 ("Mundos por Chispas"), con el ajuste posterior: ya no hay un
// mundo gratis fijo — cada cuenta elige UNO de los 6 como gratis en el
// onboarding (OnboardingForm, RPC elegir_mundo_inicial) y el resto se
// compra con Chispas. Por eso los 6 mundos, Numeria incluida, cuentan
// acá como "potencialmente pagos" — cuál de ellos es realmente gratis
// depende de qué eligió cada cuenta, no de una lista fija.
// Precio real y definitivo vive DENTRO de desbloquear_mundo()
// (0097_mundos_por_chispas.sql), nunca acá ni en el cliente — este
// número es solo para mostrarlo en la UI antes de comprar (el servidor
// jamás confía en lo que mande el cliente, ver esa migración).
export const PRECIO_MUNDO_CHISPAS = 3000;

export const MUNDOS_PAGOS = ["numeria", "geografia", "enigmia", "quimia", "anatomia", "melodia", "trigonometria", "historia"] as const;

export type MundoPago = (typeof MUNDOS_PAGOS)[number];

export function esMundoPago(valor: string): valor is MundoPago {
  return (MUNDOS_PAGOS as readonly string[]).includes(valor);
}

export const NOMBRE_MUNDO_PAGO: Record<MundoPago, string> = {
  numeria: "Numeria",
  geografia: "Geografía",
  enigmia: "Enigmia",
  quimia: "Quimia",
  anatomia: "Anatomía",
  melodia: "Melodía",
  trigonometria: "Trigonometría",
  historia: "Historia",
};

export const COLOR_MUNDO_PAGO: Record<MundoPago, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
  quimia: "#C026D3",
  anatomia: "#8B2942",
  melodia: "#B8860B",
  trigonometria: "#84CC16",
  historia: "#A0522D",
};

export const RUTA_MUNDO_PAGO: Record<MundoPago, string> = {
  numeria: "/numeria",
  geografia: "/geografia",
  enigmia: "/enigmia",
  quimia: "/quimia",
  anatomia: "/anatomia",
  melodia: "/melodia",
  trigonometria: "/trigonometria",
  historia: "/historia",
};
