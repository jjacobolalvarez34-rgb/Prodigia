// «Mi curso» en la app (piloto para colegios, 0318): las mismas RPC que la web
// (/curso). La lógica de orden y plazos se comparte con la web (@/lib/docentes/panel).
import type { MiTarea } from "@/lib/docentes/panel";
import { supabase } from "./supabase";

export interface MiGrupo {
  group_id: string;
  nombre: string;
  docente_nombre: string | null;
  colegio: string | null;
  con_licencia: boolean;
  unido_at: string;
}

export async function cargarMisTareas(): Promise<MiTarea[]> {
  const { data, error } = await supabase.rpc("mis_tareas");
  return error ? [] : ((data ?? []) as MiTarea[]);
}

export async function cargarMisGrupos(): Promise<MiGrupo[]> {
  const { data, error } = await supabase.rpc("mis_grupos");
  return error ? [] : ((data ?? []) as MiGrupo[]);
}

// Devuelve el nombre del curso, o null si el código no existe.
export async function unirseACurso(codigo: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("unirse_a_grupo", { p_codigo: codigo.trim().toUpperCase() });
  if (error) return null;
  return (data as { nombre: string }[] | null)?.[0]?.nombre ?? "";
}

export async function salirDeCurso(groupId: string): Promise<boolean> {
  const { error } = await supabase.rpc("salir_de_grupo", { p_group_id: groupId });
  return !error;
}
