"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { ordenarMisTareas, type MiTarea } from "@/lib/docentes/panel";
import TarjetaTarea from "./TarjetaTarea";

// Inicio: las tareas pendientes del curso (piloto para colegios, 0318). No se muestra
// nada si el jugador no está en ningún curso, no tiene tareas vigentes o la 0318 no
// está aplicada.
export default function TareasInicio() {
  const t = useTranslations("Curso.estudiante.inicio");
  const [tareas, setTareas] = useState<MiTarea[] | null>(null);
  const [ahora] = useState(() => Date.now());

  useEffect(() => {
    let vivo = true;
    createClient()
      .rpc("mis_tareas")
      .then(({ data, error }) => {
        if (vivo) setTareas(error ? [] : ((data ?? []) as MiTarea[]));
      });
    return () => {
      vivo = false;
    };
  }, []);

  const pendientes = ordenarMisTareas(tareas ?? [], ahora).filter((x) => x.hechos < x.meta_ejercicios && new Date(x.vence_at).getTime() > ahora);
  if (pendientes.length === 0) return null;

  return (
    <section className="flex flex-col gap-3" data-tour="inicio-tareas">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
        <Link href="/curso" className="text-sm font-semibold text-primario hover:underline">
          {t("verTodas")}
        </Link>
      </div>
      {pendientes.slice(0, 3).map((tarea) => (
        <TarjetaTarea key={tarea.tarea_id} tarea={tarea} ahora={ahora} />
      ))}
    </section>
  );
}
