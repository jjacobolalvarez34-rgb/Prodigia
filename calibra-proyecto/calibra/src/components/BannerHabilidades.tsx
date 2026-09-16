"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MUNDOS_LANDING } from "@/lib/mundos";

interface Props {
  refsIniciales: string[];
  nivelesMundo: Record<string, number>;
}

// Rediseño (2026-09-13, a pedido del propietario: "no tiene sentido
// poner el nivel que uno elija... mi idea era mas como elejir la
// ciudad favorita y que muestre sus estadisticas"). Antes era un
// dropdown + número a mano + lista de pills — ahora es una grilla de
// las 8 ciudades reales, coloreada con el color real de cada una
// (MUNDOS_LANDING, mismo que WorldCard/Header), mostrando el nivel
// REAL (nivelesMundo, derivado de world_progress — nunca un número que
// el usuario escriba). Tocar una ciudad la marca/desmarca como
// favorita; no hay paso separado de "agregar", el toggle Y el guardado
// final son las únicas dos acciones. MUNDOS_LANDING se importa acá
// directo (no llega como prop desde el server component padre) para no
// repetir el bug de RSC de esta sesión: sus objetos traen un componente
// Icono, y una función nunca puede cruzar de Server a Client Component
// como prop.
export default function BannerHabilidades({ refsIniciales, nivelesMundo }: Props) {
  const t = useTranslations("Perfil.banner");
  const tMundos = useTranslations("Mundos.nombres");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set(refsIniciales));
  const [estado, setEstado] = useState<"idle" | "saving" | "ok" | "error">("idle");

  function alternar(slug: string) {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(slug)) siguiente.delete(slug);
      else siguiente.add(slug);
      return siguiente;
    });
    setEstado("idle");
  }

  async function guardar() {
    setEstado("saving");
    try {
      const items = MUNDOS_LANDING.filter((m) => seleccionados.has(m.slug)).map((m) => ({ ref: m.slug, nombre: tMundos(m.slug) }));
      const supabase = createClient();
      const { error } = await supabase.rpc("guardar_afinidad_banner", { p_items: items });
      setEstado(error ? "error" : "ok");
    } catch {
      setEstado("error");
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-bold text-foreground">{t("titulo")}</h2>
        <p className="text-sm text-texto-secundario">{t("descripcion")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MUNDOS_LANDING.map((m) => {
          const activo = seleccionados.has(m.slug);
          const nivel = nivelesMundo[m.slug] ?? 1;
          return (
            <button
              key={m.slug}
              type="button"
              onClick={() => alternar(m.slug)}
              className="flex flex-col items-start gap-1 rounded-xl border-2 px-3.5 py-3 text-left transition-all"
              style={
                activo
                  ? { borderColor: m.colorHex, background: `color-mix(in oklab, ${m.colorHex} 16%, var(--surface))` }
                  : { borderColor: "var(--border)", background: "var(--surface)", opacity: 0.6 }
              }
            >
              <span className="text-sm font-display font-bold" style={{ color: activo ? m.colorHex : "var(--foreground)" }}>
                {tMundos(m.slug)}
              </span>
              <span className="font-mono text-xs font-semibold text-texto-secundario">{t("nivelMundo", { n: nivel })}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={guardar}
        disabled={estado === "saving"}
        className="w-full rounded-xl border-2 border-primario/30 px-4 py-2.5 text-sm font-display font-semibold text-primario transition-colors hover:bg-primario/5 disabled:opacity-40"
      >
        {estado === "saving" ? t("guardando") : t("guardar")}
      </button>
      {estado === "ok" && <p className="text-sm font-medium text-correcto">{t("guardado")}</p>}
      {estado === "error" && <p className="text-sm font-medium text-danger">{t("error")}</p>}
    </section>
  );
}
