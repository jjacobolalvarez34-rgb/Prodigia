import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "./supabase";

export interface Perfil {
  id: string;
  display_name: string | null;
  puntos_total: number;
  streak_dias: number;
  nivel_cuenta: number;
  mundos_desbloqueados: string[];
}

// Perfil del usuario con sesión. Se lee al montar y cada vez que la pantalla gana el
// foco (volver de una partida muestra las Chispas nuevas sin tirar para abajo).
export function usePerfil(userId: string | undefined) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!userId) return;
    const { data, error: e } = await supabase
      .from("profiles")
      .select("id, display_name, puntos_total, streak_dias, nivel_cuenta, mundos_desbloqueados")
      .eq("id", userId)
      .single();
    if (e) setError(e.message);
    else {
      setError(null);
      setPerfil(data as Perfil);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  return { perfil, error, recargar: cargar };
}
