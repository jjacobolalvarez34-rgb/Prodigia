import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

interface EstadoSesion {
  sesion: Session | null;
  cargando: boolean;
}

const Contexto = createContext<EstadoSesion>({ sesion: null, cargando: true });

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>({ sesion: null, cargando: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEstado({ sesion: data.session, cargando: false }));
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => setEstado({ sesion, cargando: false }));
    return () => data.subscription.unsubscribe();
  }, []);

  return <Contexto.Provider value={estado}>{children}</Contexto.Provider>;
}

export function useSesion() {
  return useContext(Contexto);
}
