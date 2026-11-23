"use client";

import { useLocale } from "next-intl";
import type { IdRecorrido } from "@/lib/tutorial/recorridos";
import { pedirRecorrido } from "@/lib/tutorial/vistos";

// «?» del encabezado: repite el tutorial de la sección abierta.
export default function BotonTutorial({ id, acento }: { id: IdRecorrido; acento: string }) {
  const es = !useLocale().startsWith("en");
  return (
    <button
      type="button"
      onClick={() => pedirRecorrido(id)}
      aria-label={es ? "Ver el tutorial de esta sección" : "See this section's tutorial"}
      title={es ? "Tutorial de esta sección" : "Section tutorial"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border font-display text-sm font-bold text-texto-secundario transition-colors hover:text-foreground"
      style={{ ["--a" as string]: acento }}
    >
      ?
    </button>
  );
}
