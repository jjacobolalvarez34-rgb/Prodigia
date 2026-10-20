"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DECIMALES_PI, DIGITOS_TITULO_PI, guardarDigitosPi, SEGUNDOS_PI, tablaPi, type FilaTablaPi } from "@/lib/pi";
import { reproducirTono } from "@/lib/sonido";

// «Dígitos de π» (0295): escribe de memoria todos los decimales que puedas en 1
// minuto. Un error termina la partida (y te muestra cuál era).
export default function JuegoPi() {
  const [estado, setEstado] = useState<"inicio" | "jugando" | "fin">("inicio");
  const [escrito, setEscrito] = useState("");
  const [quedan, setQuedan] = useState(SEGUNDOS_PI);
  const [fallo, setFallo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ mejor: number; titulo: boolean } | null>(null);
  const [tabla, setTabla] = useState<FilaTablaPi[]>([]);
  const fin = useRef(false);

  const terminar = useCallback(async (digitos: number) => {
    if (fin.current) return;
    fin.current = true;
    setEstado("fin");
    const sb = createClient();
    setResultado(await guardarDigitosPi(sb, digitos));
    setTabla(await tablaPi(sb));
  }, []);

  useEffect(() => {
    tablaPi(createClient()).then(setTabla);
  }, []);

  useEffect(() => {
    if (estado !== "jugando") return;
    const id = setInterval(() => setQuedan((q) => q - 1), 1000);
    return () => clearInterval(id);
  }, [estado]);

  useEffect(() => {
    // Se acabó el minuto (el reloj es un sistema externo al render).
    if (estado === "jugando" && quedan <= 0) terminar(escrito.length);
  }, [quedan, estado, escrito.length, terminar]);

  function tecla(d: string) {
    if (estado !== "jugando") return;
    const i = escrito.length;
    if (DECIMALES_PI[i] === d) {
      setEscrito(escrito + d);
      if ((i + 1) % 10 === 0) reproducirTono("correcto");
    } else {
      setFallo(`Era ${DECIMALES_PI[i]}, no ${d}`);
      reproducirTono("error");
      terminar(i);
    }
  }

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) tecla(e.key);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  const visibles = escrito.slice(-24);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#9B85FF]">Minievento · Día de π</p>
        <h1 className="font-display text-3xl font-bold text-foreground">Dígitos de π</h1>
        <p className="mt-1 text-sm text-texto-secundario">Escribe de memoria todos los decimales que puedas en 1 minuto. Un error y se termina. Desde {DIGITOS_TITULO_PI} dígitos el 14 de marzo, el título «Irracional».</p>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
        <span className="font-mono text-2xl text-foreground">
          3,<span className="text-[#9B85FF]">{escrito.length > 24 ? "…" : ""}{visibles}</span>
          {estado === "jugando" && <span className="animate-pulse text-texto-secundario">_</span>}
        </span>
        <span className="font-mono text-lg text-texto-secundario">{estado === "jugando" ? `${quedan}s` : `${escrito.length} dígitos`}</span>
      </div>

      {estado === "inicio" && (
        <button type="button" onClick={() => setEstado("jugando")} className="rounded-2xl bg-primario px-6 py-4 font-display text-lg font-bold text-white">
          Empezar
        </button>
      )}

      {estado === "jugando" && (
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map((k, i) =>
            k ? (
              <button key={i} type="button" onClick={() => tecla(k)} className="rounded-xl bg-surface py-4 font-mono text-2xl font-bold text-foreground shadow-[0_3px_0_#0E1222] active:translate-y-0.5">
                {k}
              </button>
            ) : (
              <span key={i} />
            )
          )}
        </div>
      )}

      {estado === "fin" && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center">
          <p className="font-display text-5xl font-bold text-foreground">{escrito.length}</p>
          <p className="text-sm text-texto-secundario">{fallo ?? "Se acabó el minuto"} · tu mejor marca de hoy: {resultado?.mejor ?? escrito.length}</p>
          {resultado?.titulo && <p className="font-semibold text-logro">¡Ganaste el título «Irracional»!</p>}
          <button
            type="button"
            onClick={() => {
              fin.current = false;
              setEscrito("");
              setFallo(null);
              setQuedan(SEGUNDOS_PI);
              setResultado(null);
              setEstado("jugando");
            }}
            className="mt-2 rounded-xl bg-primario px-5 py-2.5 font-semibold text-white"
          >
            Otra vez
          </button>
        </div>
      )}

      {tabla.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-2 font-display text-lg font-bold text-foreground">Tabla de hoy</h2>
          {tabla.map((f, i) => (
            <div key={i} className={`flex justify-between py-1 text-sm ${f.yo ? "font-bold text-foreground" : "text-texto-secundario"}`}>
              <span>
                {i + 1}. {f.nombre}
              </span>
              <span className="font-mono">{f.digitos}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
