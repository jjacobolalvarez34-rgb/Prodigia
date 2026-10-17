"use client";

import { useSyncExternalStore } from "react";
import { ACCESORIOS } from "@/lib/temas/dibujos";
import { capaVisible } from "@/lib/temas/temas";
import { decoracionHabilitada, decoracionHabilitadaServerSnapshot, subscribeDecoracion } from "@/lib/decoracion";
import DibujoTema from "./DibujoTema";
import { useTemaHoy } from "./useTemaHoy";

// Accesorio de la festividad sobre un avatar (gorro navideño, sombrero de bruja…):
// va por encima, sin tapar la cara, y solo en avatares de cierto tamaño.
export default function AccesorioTemporada({ size }: { size: number }) {
  const tema = useTemaHoy();
  const decoracion = useSyncExternalStore(subscribeDecoracion, decoracionHabilitada, decoracionHabilitadaServerSnapshot);
  const id = tema?.tema.accesorio;
  if (!id || !decoracion || size < 36 || !capaVisible(tema, "interfaz")) return null;
  const d = ACCESORIOS[id];
  const estilo: React.CSSProperties =
    d.lugar === "cabeza"
      ? { position: "absolute", width: size * 0.66, height: size * 0.66, left: -size * 0.14, top: -size * 0.3, transform: "rotate(-14deg)" }
      : { position: "absolute", width: size * 0.76, height: size * 0.76, left: size * 0.12, top: size * 0.06 };
  return <DibujoTema dibujo={d} className="pointer-events-none drop-shadow" style={estilo} />;
}
