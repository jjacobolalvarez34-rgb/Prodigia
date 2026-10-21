import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { forzarTema, temaActivo, type TemaActivo } from "@/lib/temas/temas";
import type { IdTema } from "@/lib/temas/calendario";
import { useAjustes } from "./ajustes";

// La festividad de hoy en la app (src/lib/temas, igual que la web). Se revisa al volver
// a la app y cada 10 minutos. Con «Decoración de temporada» apagada no hay tema.
// verTema(): vista previa de una fiesta fuera de su fecha (solo para pruebas; sin botón en la app).
const oyentes = new Set<() => void>();
let vistaPrevia: IdTema | null = null;

export function verTema(id: IdTema | null) {
  vistaPrevia = id;
  oyentes.forEach((o) => o());
}

export function temaEnVistaPrevia(): IdTema | null {
  return vistaPrevia;
}

export function useTemaHoy(): TemaActivo | null {
  const { decoracion } = useAjustes();
  const calcular = () => {
    forzarTema(vistaPrevia);
    return temaActivo();
  };
  const [tema, setTema] = useState<TemaActivo | null>(calcular);
  useEffect(() => {
    const actualizar = () => setTema(calcular());
    oyentes.add(actualizar);
    const id = setInterval(actualizar, 10 * 60_000);
    const sub = AppState.addEventListener("change", (e) => e === "active" && actualizar());
    return () => {
      oyentes.delete(actualizar);
      clearInterval(id);
      sub.remove();
    };
  }, []);
  return decoracion ? tema : null;
}
