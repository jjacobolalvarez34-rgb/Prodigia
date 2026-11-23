import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import type { DiaActividad, FilaPanelAlumno, FilaProgresoTarea } from "@/lib/docentes/panel";
import type { FilaEstudio, FilaHabito } from "@/lib/docentes/estudio";
import type { LicenciaDocente } from "../ProfesorClient";
import PanelCursoClient from "./PanelCursoClient";

interface Props {
  params: Promise<{ groupId: string }>;
}

interface FilaResumenViejo {
  user_id: string;
  display_name: string | null;
  precision_promedio: number | null;
  ultima_actividad: string | null;
}

// Panel del curso (piloto para colegios, 0318). Si la 0318 todavía no está aplicada,
// panel_grupo no existe: se arma la lista con resumen_grupo (0014) y se avisa.
export default async function GrupoPage({ params }: Props) {
  const { groupId } = await params;
  const t = await getTranslations("Profesor");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/profesor/${groupId}`);
  bloquearInvitado(user, t("guardLabel"));

  const { data: grupo, error: grupoError } = await supabase
    .from("groups")
    .select("id, nombre, codigo_invitacion")
    .eq("id", groupId)
    .eq("profesor_id", user.id)
    .maybeSingle();

  if (grupoError) {
    throw new Error(`No se pudo cargar el grupo: ${grupoError.message}`);
  }
  if (!grupo) {
    notFound();
  }

  const [panel, tareas, actividad, licencias, estudio, habitos] = await Promise.all([
    supabase.rpc("panel_grupo", { p_group_id: groupId }),
    supabase.rpc("progreso_tareas_grupo", { p_group_id: groupId }),
    supabase.rpc("actividad_grupo_diaria", { p_group_id: groupId, p_dias: 14 }),
    supabase.rpc("mi_licencia_docente"),
    // 0319: sin la migración estas dos no existen y el estudio avisa.
    supabase.rpc("estudio_grupo", { p_group_id: groupId, p_dias: 56 }),
    supabase.rpc("habitos_grupo", { p_group_id: groupId, p_dias: 28 }),
  ]);

  let filas = (panel.data ?? []) as FilaPanelAlumno[];
  const faltaMigracion = !!panel.error;
  if (faltaMigracion) {
    const { data: viejo } = await supabase.rpc("resumen_grupo", { p_group_id: groupId });
    filas = ((viejo ?? []) as FilaResumenViejo[]).map((f) => ({
      user_id: f.user_id,
      display_name: f.display_name,
      avatar_url: null,
      unido_at: new Date().toISOString(),
      ejercicios_7d: 0,
      correctos_7d: 0,
      ejercicios_total: 0,
      correctos_total: 0,
      ultima_actividad: f.ultima_actividad,
      mundo_top_7d: null,
      pro_colegio: false,
    }));
  }

  return (
    <>
      <div className="print:hidden">
        <Header autenticado />
      </div>
      <PanelCursoClient
        grupo={{ id: grupo.id, nombre: grupo.nombre, codigo: grupo.codigo_invitacion }}
        filas={filas}
        tareas={(tareas.data ?? []) as FilaProgresoTarea[]}
        actividad={(actividad.data ?? []) as DiaActividad[]}
        licencia={((licencias.data as LicenciaDocente[] | null) ?? [])[0] ?? null}
        faltaMigracion={faltaMigracion}
        estudio={(estudio.data ?? []) as FilaEstudio[]}
        habitos={(habitos.data ?? []) as FilaHabito[]}
        faltaEstudio={!!estudio.error}
      />
    </>
  );
}
