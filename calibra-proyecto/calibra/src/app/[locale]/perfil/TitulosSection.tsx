"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TituloUsuario } from "@/types/database";

interface Props {
  titulos: TituloUsuario[];
  tituloActivo: string | null;
}

// Fase 2 de Rankeds: el rango se agrega solo como título disponible al
// alcanzarlo (ver desbloquear_titulo en la migración) — acá el usuario
// elige cuál mostrar, sin perder los demás ya alcanzados. Pensado desde
// el esquema para que a futuro haya títulos de otro `origen` además de
// "rango", así que esta pantalla ya lista por `titulos` genérico, no
// algo hardcodeado a rangos.
export default function TitulosSection({ titulos, tituloActivo }: Props) {
  const router = useRouter();
  const [activo, setActivo] = useState(tituloActivo);
  const [cambiando, setCambiando] = useState<string | null>(null);

  async function elegir(slug: string | null) {
    setCambiando(slug ?? "ninguno");
    const supabase = createClient();
    const { error } = await supabase.rpc("elegir_titulo_activo", { p_slug: slug });
    setCambiando(null);
    if (!error) {
      setActivo(slug);
      router.refresh();
    }
  }

  if (titulos.length === 0) {
    return (
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-foreground">Títulos</h2>
        <p className="text-sm text-texto-secundario">
          Todavía no desbloqueaste ninguno — subí de rango en Rankeds para conseguir el primero.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-1 font-display text-lg font-bold text-foreground">Títulos</h2>
      <p className="mb-3 text-xs text-texto-secundario">
        Elegí cuál mostrar junto a tu nombre — activar uno no borra los demás.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => elegir(null)}
          disabled={cambiando !== null}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            activo === null ? "border-primario bg-primario/10 text-primario" : "border-border text-texto-secundario"
          }`}
        >
          Ninguno
        </button>
        {titulos.map((t) => (
          <button
            key={t.slug}
            onClick={() => elegir(t.slug)}
            disabled={cambiando !== null}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
              activo === t.slug ? "border-primario bg-primario/10 text-primario" : "border-border text-texto-secundario"
            }`}
          >
            {t.nombre}
          </button>
        ))}
      </div>
    </section>
  );
}
