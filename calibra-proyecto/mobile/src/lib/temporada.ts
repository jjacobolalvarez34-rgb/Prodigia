import { useEffect, useState } from "react";
import { forzarTema, temaActivo, type TemaActivo } from "@/lib/temas/temas";
import type { IdTema } from "@/lib/temas/calendario";
import { useAjustes } from "./ajustes";
import { relojEventos } from "./relojEventos";

// La festividad de hoy en la app (src/lib/temas, igual que la web). Se recalcula en el
// instante exacto en que cambia algo (relojEventos: empieza o termina una fase, al volver
// la app al frente), no cada tantos minutos. Con «Decoración de temporada» apagada no hay tema.
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

function calcular(): TemaActivo | null {
  forzarTema(vistaPrevia);
  return temaActivo();
}

const igual = (a: TemaActivo | null, b: TemaActivo | null) => a?.tema.id === b?.tema.id && a?.fase === b?.fase && a?.hoy.rango.desde === b?.hoy.rango.desde;

export function useTemaHoy(): TemaActivo | null {
  const { decoracion } = useAjustes();
  const [tema, setTema] = useState<TemaActivo | null>(calcular);
  useEffect(() => {
    // Mientras no cambie nada se queda el mismo objeto (así no se repinta todo de balde).
    const actualizar = () => setTema((antes) => {
      const nuevo = calcular();
      return igual(antes, nuevo) ? antes : nuevo;
    });
    oyentes.add(actualizar);
    const soltar = relojEventos.suscribir(actualizar);
    return () => {
      oyentes.delete(actualizar);
      soltar();
    };
  }, []);
  return decoracion ? tema : null;
}
