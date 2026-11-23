"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { olvidarVistos } from "@/lib/tutorial/vistos";

// Ajustes: vuelve a mostrar el tutorial guiado de cada sección la próxima vez que se abra.
export default function RepetirTutoriales() {
  const es = !useLocale().startsWith("en");
  const [listo, setListo] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
      <div>
        <p className="font-display text-sm font-bold text-foreground">{es ? "Ver los tutoriales otra vez" : "See the tutorials again"}</p>
        <p className="text-xs text-texto-secundario">
          {listo ? (es ? "Listo: vuelven a salir al entrar a cada sección." : "Done: they'll show again in each section.") : es ? "También puedes tocar «?» arriba en cada sección." : "You can also tap \"?\" at the top of each section."}
        </p>
      </div>
      <button
        type="button"
        disabled={listo}
        onClick={async () => {
          await olvidarVistos();
          setListo(true);
        }}
        className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
      >
        {es ? "Repetir" : "Reset"}
      </button>
    </div>
  );
}
