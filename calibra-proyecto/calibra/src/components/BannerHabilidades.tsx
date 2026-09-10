"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export interface ItemBanner {
  ref: string;
  nombre: string;
  nivel: number;
}

export interface OpcionBanner {
  ref: string;
  nombre: string;
  grupo: string;
}

interface Props {
  itemsIniciales: ItemBanner[];
  opciones: OpcionBanner[];
}

// Banner de afinidad del perfil: listado editable de "con qué mundo o
// ciudad te identificás y tu nivel". Cosmético (el usuario se autodefine);
// el server solo valida forma, tamaños y que sea el dueño del perfil.
export default function BannerHabilidades({ itemsIniciales, opciones }: Props) {
  const t = useTranslations("Perfil.banner");
  const [items, setItems] = useState<ItemBanner[]>(itemsIniciales);
  const [ref, setRef] = useState("");
  const [nivel, setNivel] = useState(1);
  const [estado, setEstado] = useState<"idle" | "saving" | "ok" | "error">("idle");

  const opc = ref ? opciones.find((o) => o.ref === ref) : null;

  function agregar() {
    if (!opc || items.some((i) => i.ref === opc.ref)) return;
    setItems([...items, { ref: opc.ref, nombre: opc.nombre, nivel: Math.min(100, Math.max(1, nivel)) }]);
    setRef("");
    setNivel(1);
    setEstado("idle");
  }

  function quitar(ref: string) {
    setItems(items.filter((i) => i.ref !== ref));
    setEstado("idle");
  }

  async function guardar() {
    setEstado("saving");
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("guardar_afinidad_banner", { p_items: items });
      setEstado(error ? "error" : "ok");
    } catch {
      setEstado("error");
    }
  }

  const group = (g: string) => opciones.find((o) => o.grupo === g)?.grupo ?? g;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-5">
      <div className="flex flex-col gap-3">
        <select
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-primario/60"
        >
          <option value="">{t("referente")}…</option>
          {[...new Set(opciones.map((o) => o.grupo))].map((g) => (
            <optgroup key={g} label={group(g)}>
              {opciones
                .filter((o) => o.grupo === g)
                .map((o) => (
                  <option key={o.ref} value={o.ref}>
                    {o.nombre}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label className="shrink-0 text-xs font-semibold uppercase tracking-wide text-texto-secundario">
            {t("nivel")}
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={nivel}
            onChange={(e) => setNivel(Number(e.target.value) || 1)}
            className="w-24 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-mono font-bold text-foreground outline-none transition-colors focus:border-primario/60"
          />
          <button
            onClick={agregar}
            disabled={!opc || items.some((i) => i.ref === ref)}
            className="ml-auto shrink-0 rounded-xl bg-primario px-4 py-2 text-sm font-display font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {t("agregar")}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-foreground/5 px-3.5 py-2.5 text-sm text-texto-secundario">{t("vacio")}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item.ref}
              className="flex items-center gap-2 rounded-full border border-primario/30 bg-primario/5 px-3.5 py-1.5 text-sm font-medium text-foreground"
            >
              <span>{item.nombre}</span>
              <span className="font-mono text-xs font-bold text-primario">{item.nivel}</span>
              <button
                onClick={() => quitar(item.ref)}
                className="ml-1 text-xs text-texto-secundario transition-colors hover:text-danger"
                aria-label={t("quitar")}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={guardar}
        disabled={estado === "saving" || items.length === 0}
        className="w-full rounded-xl border-2 border-primario/30 px-4 py-2.5 text-sm font-display font-semibold text-primario transition-colors hover:bg-primario/5 disabled:opacity-40"
      >
        {estado === "saving" ? t("guardando") : t("guardar")}
      </button>
      {estado === "ok" && <p className="text-sm font-medium text-correcto">{t("guardado")}</p>}
      {estado === "error" && <p className="text-sm font-medium text-danger">{t("error")}</p>}
    </section>
  );
}