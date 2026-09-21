"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconCodia } from "@/components/icons";
import { LENGUAJES, NOMBRE_LENGUAJE, type Lenguaje } from "@/lib/codia/tipos";
import { COLOR_CODIA } from "../colores";

const CLAVE_LENGUAJE = "prodigia:codia-lenguaje";

interface ModoCard {
  nombre: string;
  desc: string;
  href: string;
  nivel: number;
}

// Elegir el lenguaje ANTES de practicar (requisito de Codia, ver PARIDAD_MUNDOS.md:
// "opciones que cambian el contenido se eligen antes de empezar"): sin esto
// el sorteo mezclaba Python/Java/JavaScript/TypeScript y no había forma de
// practicar solo el que uno quiere. "Aleatorio" = comportamiento anterior. La
// elección se recuerda en el navegador (conveniencia por dispositivo) y viaja
// a la práctica como ?lang=<lenguaje>; los duelos la ignoran (los dos
// jugadores tienen que ver los mismos problemas).
export default function ModosCodiaClient({ modos }: { modos: ModoCard[] }) {
  const t = useTranslations("Codia.elegir");
  const [lenguaje, setLenguaje] = useState<Lenguaje | "aleatorio">("aleatorio");

  useEffect(() => {
    // setTimeout evita el cascading-render de react-hooks/set-state-in-effect.
    const id = setTimeout(() => {
      try {
        const guardado = localStorage.getItem(CLAVE_LENGUAJE);
        if (guardado && (LENGUAJES as readonly string[]).includes(guardado)) setLenguaje(guardado as Lenguaje);
      } catch {
        // sin localStorage (ventana privada): queda "aleatorio".
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function elegir(l: Lenguaje | "aleatorio") {
    setLenguaje(l);
    try {
      if (l === "aleatorio") localStorage.removeItem(CLAVE_LENGUAJE);
      else localStorage.setItem(CLAVE_LENGUAJE, l);
    } catch {
      // ver arriba
    }
  }

  const opciones: { id: Lenguaje | "aleatorio"; label: string }[] = [
    { id: "aleatorio", label: t("lenguajeAleatorio") },
    ...LENGUAJES.map((l) => ({ id: l, label: NOMBRE_LENGUAJE[l] })),
  ];

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">{t("lenguajeTitulo")}</p>
        <div role="radiogroup" aria-label={t("lenguajeTitulo")} className="flex flex-wrap justify-center gap-2">
          {opciones.map((o) => {
            const activo = lenguaje === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => elegir(o.id)}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activo ? "text-white" : "border-border text-texto-secundario hover:border-primario/40 hover:text-foreground"
                }`}
                style={activo ? { background: COLOR_CODIA, borderColor: COLOR_CODIA } : undefined}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {modos.map((m) => (
          <Link
            key={m.nombre}
            href={lenguaje === "aleatorio" ? m.href : `${m.href}?lang=${lenguaje}`}
            className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: COLOR_CODIA }}>
              <IconCodia className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-foreground">{m.nombre}</p>
              <p className="text-xs text-texto-secundario">{m.desc}</p>
            </div>
            <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_CODIA} />
          </Link>
        ))}
      </div>
    </>
  );
}
