"use client";

import { useEffect, useRef, type ReactNode, type RefCallback } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import { COLOR_MELODIA } from "@/app/[locale]/melodia/colores";
import { frecuenciaDeNota, type NotaMusical } from "@/lib/practica/melodia";
import { reproducirNotaMusical } from "@/lib/sonido";

export { COLOR_MELODIA };

// Marco común de los visuales de Melodía: mismo patrón que
// src/components/anatomia/visuales/comun.tsx (figura accesible, alternativa
// textual sr-only, franja superior con el color del mundo). `nota` es una
// línea chica al pie que dice qué es el dibujo (esquema, no partitura real).
export function MarcoVisual({
  refCont,
  etiqueta,
  titulo,
  alternativa,
  children,
  controles,
  nota,
}: {
  refCont: RefCallback<HTMLElement>;
  etiqueta: string;
  titulo?: string;
  alternativa: ReactNode;
  children: ReactNode;
  controles?: ReactNode;
  nota?: string;
}) {
  return (
    <figure
      ref={refCont}
      role="group"
      aria-label={etiqueta}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground"
      style={{ borderTopColor: COLOR_MELODIA, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex min-w-0 flex-col items-stretch gap-3">
        {children}
      </div>
      {nota && (
        <p aria-hidden="true" className="text-center text-[11px] leading-snug text-texto-secundario">
          {nota}
        </p>
      )}
      <figcaption className="sr-only">{alternativa}</figcaption>
      {controles}
    </figure>
  );
}

export const fondoAcento = (pct: number) => `color-mix(in oklab, ${COLOR_MELODIA} ${pct}%, var(--surface))`;

const MS_ENTRE_NOTAS = 420;

// "Escuchar": SOLO suena cuando el usuario toca el botón (nunca solo, ni al
// aparecer el visual ni al avanzar un paso). Reutiliza el generador de tonos
// del modo Oído absoluto (frecuenciaDeNota + reproducirNotaMusical), que ya
// respeta el silencio de /ajustes. `juntas` = todas a la vez (un acorde); si
// no, una tras otra (una escala). La lección funciona igual sin audio.
export function BotonEscuchar({ notas, juntas = false }: { notas: NotaMusical[]; juntas?: boolean }) {
  const t = useTranslations("Melodia.visuales");
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const lista = temporizadores.current;
    return () => lista.forEach(clearTimeout);
  }, []);

  function escuchar() {
    temporizadores.current.forEach(clearTimeout);
    temporizadores.current = [];
    notas.forEach((nota, i) => {
      const freq = frecuenciaDeNota(nota);
      if (juntas) reproducirNotaMusical(freq);
      else if (i === 0) reproducirNotaMusical(freq);
      else temporizadores.current.push(setTimeout(() => reproducirNotaMusical(freq), i * MS_ENTRE_NOTAS));
    });
  }

  return (
    <button
      type="button"
      onClick={escuchar}
      className="mx-auto inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors hover:bg-surface-2"
      style={{ borderColor: COLOR_MELODIA, color: COLOR_MELODIA }}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 6h3l4-3v10L5 10H2z" />
        <path d="M11.5 5.5a3.5 3.5 0 0 1 0 5" />
      </svg>
      {t("escuchar")}
    </button>
  );
}
