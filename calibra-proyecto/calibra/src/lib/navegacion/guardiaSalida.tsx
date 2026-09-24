"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";

// Pedido 2026-09-24: "cuando uno esté en una partida o en un multijugador
// y le dé a alguna cosa en el menú (la casita, el logo, tienda...), debe
// aparecer un letrero de '¿seguro quieres abandonar la partida?'. En
// rankeds que avise que perderá ELO, y si confirma, que la partida termine
// y aparezca el resultado aunque esté a medias. Lo mismo en las lecciones
// de Técnicas y Clases." Mismo criterio en todas las ciudades: cualquier
// pantalla con "algo que perder" (una partida en curso, una lección
// empezada) se REGISTRA acá mientras esté activa, y cualquier navegación
// disparada desde fuera de esa pantalla (Header, la flechita de "atrás")
// pasa por `pedirConfirmacion` antes de moverse.
export interface ConfigGuardiaSalida {
  // true mientras haya algo que perder al irse. false (o desmontar el
  // componente) libera la guardia.
  activo: boolean;
  // true = duelo Ranked: el modal avisa la pérdida de ELO y, al confirmar,
  // usa `alConfirmar` (rendirse + mostrar resultado) en vez de navegar al
  // destino que se clickeó — mismo criterio que BotonRendirse/rendirse_duelo
  // (src/components/duelos/BotonRendirse.tsx), pero disparado desde afuera
  // de la pantalla del duelo.
  ranked?: boolean;
  alConfirmar?: () => void | Promise<void>;
}

interface ContextoGuardia {
  registrarGuardia: (config: ConfigGuardiaSalida) => void;
  // Intenta ejecutar `navegar`. Si hay una guardia activa, en vez de
  // ejecutarla abre el modal de confirmación y devuelve `true` (el
  // llamador debe frenar la navegación por defecto, ej. `e.preventDefault()`
  // en un <Link>). Si no hay guardia, ejecuta `navegar` de inmediato y
  // devuelve `false`.
  pedirConfirmacion: (navegar: () => void) => boolean;
}

const GUARDIA_INACTIVA: ConfigGuardiaSalida = { activo: false };
const Contexto = createContext<ContextoGuardia | null>(null);

// Cualquier pantalla con "algo que perder" (una partida en curso — ranked
// o no —, una Técnica/Clase empezada) llama a este hook mientras esté
// activa. Se re-registra en cada cambio de valor, y libera la guardia sola
// al desmontarse o al pasar `activo: false` — nunca hace falta un cleanup
// manual en el caller.
export function useRegistrarGuardiaSalida(config: ConfigGuardiaSalida) {
  const ctx = useContext(Contexto);
  useEffect(() => {
    if (!ctx) return;
    ctx.registrarGuardia(config);
    return () => ctx.registrarGuardia(GUARDIA_INACTIVA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, config.activo, config.ranked, config.alConfirmar]);
}

// Lo usan los puntos de navegación GLOBALES (Header: casita, logo, links
// del nav, la flechita de atrás) — nunca la pantalla que registra la
// guardia (esa navega libremente adentro de sí misma).
export function usePedirConfirmacionSalida(): (navegar: () => void) => boolean {
  const ctx = useContext(Contexto);
  return ctx?.pedirConfirmacion ?? ((navegar: () => void) => { navegar(); return false; });
}

export function GuardiaSalidaProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Common.guardiaSalida");
  const guardiaRef = useRef<ConfigGuardiaSalida>(GUARDIA_INACTIVA);
  const [pendiente, setPendiente] = useState<{ navegar: () => void; ranked: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarGuardia = useCallback((config: ConfigGuardiaSalida) => {
    guardiaRef.current = config;
  }, []);

  const pedirConfirmacion = useCallback((navegar: () => void) => {
    const guardia = guardiaRef.current;
    if (!guardia.activo) {
      navegar();
      return false;
    }
    setError(null);
    setPendiente({ navegar, ranked: !!guardia.ranked });
    return true;
  }, []);

  async function confirmar() {
    if (!pendiente) return;
    const guardia = guardiaRef.current;
    setEnviando(true);
    setError(null);
    try {
      if (pendiente.ranked && guardia.alConfirmar) {
        await guardia.alConfirmar();
        setPendiente(null);
      } else {
        setPendiente(null);
        pendiente.navegar();
      }
    } catch {
      setError(t("error"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Contexto.Provider value={{ registrarGuardia, pedirConfirmacion }}>
      {children}
      {pendiente && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="guardia-salida-titulo" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 text-center shadow-xl">
            <p id="guardia-salida-titulo" className="text-base font-semibold text-foreground">
              {t("titulo")}
            </p>
            <p className="mt-1.5 text-sm text-texto-secundario">{pendiente.ranked ? t("descripcionRanked") : t("descripcion")}</p>
            {error && <p className="mt-2 text-xs text-error">{error}</p>}
            <div className="mt-5 flex flex-col gap-2">
              <Boton variante="peligro" className="w-full" onClick={confirmar} cargando={enviando}>
                {t("confirmar")}
              </Boton>
              <Boton variante="secundario" className="w-full" onClick={() => setPendiente(null)} disabled={enviando}>
                {t("cancelar")}
              </Boton>
            </div>
          </div>
        </div>
      )}
    </Contexto.Provider>
  );
}
