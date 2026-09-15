"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import { parsearSecuenciaCalcu, type FichaCalcu } from "@/lib/trastienda/calcuParser";
import type { InicioLaCalcu, ResultadoLaCalcu } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const OPS: Array<"+" | "-" | "×" | "÷"> = ["+", "-", "×", "÷"];

// Pedido en vivo (2026-09-15): "debería poder arrastrar las cosas a una
// posición, y permite usar un par de paréntesis — guíate de 4=10" (juego
// de puzzles real donde arrastrás fichas de número/operador/paréntesis a
// una barra de fórmula). Antes esto solo dejaba tocar número→operador en
// alternancia estricta, armando SIEMPRE una cadena a la izquierda sin
// precedencia ni forma de agrupar — resolver_la_calcu ya evaluaba
// cualquier árbol anidado (eval_calcu es recursivo genérico, ver
// 0124_trastienda_minijuegos.sql), esa limitación era 100% del cliente.
//
// Ahora: banco de números (según el puzzle) + paleta de operadores
// (infinita) + un par de paréntesis, todos arrastrables (Pointer Events,
// funciona igual con mouse y con touch) a la barra de "tu expresión" —
// también se puede tocar para agregar al final / sacar, como atajo. La
// secuencia se parsea con orden real de operaciones (× ÷ antes que + −,
// paréntesis explícitos) vía parsearSecuenciaCalcu — el server sigue
// siendo la única fuente de verdad, esto solo arma el AST que se manda.
export default function LaCalcu({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.laCalcu");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [estado, setEstado] = useState<"inicio" | "jugando" | "fin">("inicio");
  const [inicio, setInicio] = useState<InicioLaCalcu | null>(null);
  const [secuencia, setSecuencia] = useState<FichaCalcu[]>([]);
  const [resultado, setResultado] = useState<ResultadoLaCalcu | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const secuenciaRef = useRef<HTMLDivElement>(null);
  const bancoRef = useRef<HTMLDivElement>(null);
  const idContador = useRef(0);

  interface Arrastre {
    ficha: FichaCalcu;
    origen: "banco" | "secuencia";
    x: number;
    y: number;
    startX: number;
    startY: number;
    movido: boolean;
  }
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const [indiceDestino, setIndiceDestino] = useState<number | null>(null);

  const fichasNumeros = useMemo<FichaCalcu[]>(
    () => (inicio?.numeros ?? []).map((n, i) => ({ id: `num-${i}`, tipo: "num" as const, valor: n })),
    [inicio]
  );
  const fichasParen: FichaCalcu[] = useMemo(
    () => [
      { id: "paren-abre", tipo: "paren", valor: "(" },
      { id: "paren-cierra", tipo: "paren", valor: ")" },
    ],
    []
  );

  const idsEnSecuencia = useMemo(() => new Set(secuencia.map((f) => f.id)), [secuencia]);
  const bancoNumeros = fichasNumeros.filter((f) => !idsEnSecuencia.has(f.id));
  const bancoParen = fichasParen.filter((f) => !idsEnSecuencia.has(f.id));

  const astActual = useMemo(() => parsearSecuenciaCalcu(secuencia), [secuencia]);
  const puedeResolver = astActual !== null && bancoNumeros.length === 0;

  function etiquetaFicha(f: FichaCalcu): string {
    return f.tipo === "num" ? String(f.valor) : f.valor;
  }

  function estaSobre(ref: React.RefObject<HTMLDivElement | null>, x: number, y: number, margen = 28): boolean {
    const el = ref.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left - margen && x <= r.right + margen && y >= r.top - margen && y <= r.bottom + margen;
  }

  function calcularIndice(x: number): number {
    const el = secuenciaRef.current;
    if (!el || el.children.length === 0) return 0;
    let idx = 0;
    for (const child of Array.from(el.children)) {
      const r = (child as HTMLElement).getBoundingClientRect();
      if (x > r.left + r.width / 2) idx++;
    }
    return idx;
  }

  const onPointerMoveGlobal = useCallback((e: PointerEvent) => {
    setArrastre((prev) => {
      if (!prev) return prev;
      const dx = e.clientX - prev.startX;
      const dy = e.clientY - prev.startY;
      return { ...prev, x: e.clientX, y: e.clientY, movido: prev.movido || Math.hypot(dx, dy) > 6 };
    });
  }, []);

  function iniciarArrastre(e: React.PointerEvent, ficha: FichaCalcu, origen: "banco" | "secuencia") {
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastre({ ficha, origen, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, movido: false });
  }

  function moverArrastre(e: React.PointerEvent) {
    if (!arrastre) return;
    onPointerMoveGlobal(e.nativeEvent);
    setIndiceDestino(estaSobre(secuenciaRef, e.clientX, e.clientY) ? calcularIndice(e.clientX) : null);
  }

  function soltarArrastre(e: React.PointerEvent) {
    if (!arrastre) return;
    const { ficha, origen, movido } = arrastre;
    const sobreSecuencia = estaSobre(secuenciaRef, e.clientX, e.clientY);

    if (!movido) {
      // Toque simple, sin arrastre real: atajo rápido.
      if (origen === "banco") agregarAlFinal(ficha);
      else quitarDeSecuencia(ficha.id);
    } else if (sobreSecuencia) {
      const destino = calcularIndice(e.clientX);
      if (origen === "banco") insertarEnIndice(ficha, destino);
      else reordenarEnSecuencia(ficha.id, destino);
    } else if (origen === "secuencia") {
      // Se soltó fuera de la barra: sacar del todo.
      quitarDeSecuencia(ficha.id);
    }

    setArrastre(null);
    setIndiceDestino(null);
  }

  function agregarAlFinal(ficha: FichaCalcu) {
    setSecuencia((prev) => [...prev, ficha]);
  }

  function quitarDeSecuencia(id: string) {
    setSecuencia((prev) => prev.filter((f) => f.id !== id));
  }

  function insertarEnIndice(ficha: FichaCalcu, indice: number) {
    setSecuencia((prev) => {
      const copia = [...prev];
      copia.splice(Math.min(indice, copia.length), 0, ficha);
      return copia;
    });
  }

  function reordenarEnSecuencia(id: string, indiceDestinoOriginal: number) {
    setSecuencia((prev) => {
      const indiceActual = prev.findIndex((f) => f.id === id);
      if (indiceActual === -1) return prev;
      const copia = [...prev];
      const [movida] = copia.splice(indiceActual, 1);
      let destino = indiceDestinoOriginal;
      if (indiceActual < destino) destino -= 1;
      copia.splice(Math.max(0, Math.min(destino, copia.length)), 0, movida);
      return copia;
    });
  }

  function nuevoOperador(valor: "+" | "-" | "×" | "÷"): FichaCalcu {
    idContador.current += 1;
    return { id: `op-${valor}-${idContador.current}`, tipo: "op", valor };
  }

  async function iniciar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/la-calcu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "iniciar" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("apuestas"));
        return;
      }
      setInicio(data as InicioLaCalcu);
      setSecuencia([]);
      setResultado(null);
      setEstado("jugando");
      onPuntos((data as InicioLaCalcu).puntos_total);
    } catch {
      setError(terrores("apuestas"));
    } finally {
      setCargando(false);
    }
  }

  async function resolver() {
    if (!inicio || !astActual || bancoNumeros.length > 0) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/la-calcu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "resolver", calcu_id: inicio.id, expresion: astActual }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("laCalcu"));
        return;
      }
      const r = data as ResultadoLaCalcu;
      setResultado(r);
      setEstado("fin");
      onPuntos(r.puntos_total);
      onMovimiento();
    } catch {
      setError(terrores("laCalcu"));
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setSecuencia([]);
  }

  const claseFicha =
    "select-none rounded-xl px-4 py-3 font-mono text-lg font-black transition-transform active:scale-95";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🧮 {t("titulo")}</h3>
      <p className="mt-1 text-sm text-tt-text-muted">{t("descripcion")}</p>

      {estado === "inicio" && (
        <>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 50} className="w-full">
            {cargando ? t("iniciando") : t("jugar", { costo: "50" })}
          </Boton>
          {puntos < 50 && <p className="text-sm font-medium text-tt-danger">{t("sinChispas")}</p>}
        </>
      )}

      {estado === "jugando" && inicio && (
        <>
          <p className="font-mono text-xl font-black text-tt-accent">Objetivo: {inicio.target} 🎯</p>
          <p className="text-xs text-tt-text-muted">{t("completa")}</p>

          {/* Barra de la expresión — soltar acá inserta en la posición. */}
          <div
            ref={secuenciaRef}
            className="flex min-h-16 flex-nowrap items-center gap-1.5 overflow-x-auto rounded-xl border-2 border-dashed border-tt-border bg-tt-surface-2 px-3 py-2.5"
          >
            {secuencia.length === 0 && indiceDestino === null ? (
              <p className="px-1 text-sm text-tt-text-muted">{t("arrastraAqui")}</p>
            ) : (
              secuencia.map((f, i) => (
                <span key={f.id} className="flex shrink-0 items-center gap-1.5">
                  {indiceDestino === i && arrastre?.origen && <span className="h-8 w-0.5 shrink-0 rounded-full bg-tt-accent" aria-hidden />}
                  <button
                    type="button"
                    onPointerDown={(e) => iniciarArrastre(e, f, "secuencia")}
                    onPointerMove={moverArrastre}
                    onPointerUp={soltarArrastre}
                    style={{ touchAction: "none" }}
                    className={`${claseFicha} ${
                      f.tipo === "num"
                        ? "bg-tt-accent text-tt-bg"
                        : f.tipo === "paren"
                          ? "border border-tt-border bg-tt-surface text-tt-text-muted"
                          : "border border-tt-border bg-tt-surface text-tt-text"
                    } ${arrastre?.ficha.id === f.id ? "opacity-30" : ""}`}
                  >
                    {etiquetaFicha(f)}
                  </button>
                </span>
              ))
            )}
            {indiceDestino === secuencia.length && arrastre?.origen && (
              <span className="h-8 w-0.5 shrink-0 rounded-full bg-tt-accent" aria-hidden />
            )}
          </div>

          {astActual !== null && (
            <p className="text-xs font-semibold text-tt-success">✓ {t("expresionValida")}</p>
          )}

          {/* Banco: números del puzzle + paréntesis, cantidad limitada. */}
          <div ref={bancoRef} className="flex flex-wrap gap-2">
            {bancoNumeros.map((f) => (
              <button
                key={f.id}
                type="button"
                onPointerDown={(e) => iniciarArrastre(e, f, "banco")}
                onPointerMove={moverArrastre}
                onPointerUp={soltarArrastre}
                style={{ touchAction: "none" }}
                className={`${claseFicha} bg-tt-surface-2 text-tt-text hover:border hover:border-tt-accent/60 ${
                  arrastre?.ficha.id === f.id ? "opacity-30" : ""
                }`}
              >
                {f.valor}
              </button>
            ))}
            {bancoParen.map((f) => (
              <button
                key={f.id}
                type="button"
                onPointerDown={(e) => iniciarArrastre(e, f, "banco")}
                onPointerMove={moverArrastre}
                onPointerUp={soltarArrastre}
                style={{ touchAction: "none" }}
                className={`${claseFicha} border border-dashed border-tt-border bg-tt-surface text-tt-text-muted hover:border-tt-accent/60 ${
                  arrastre?.ficha.id === f.id ? "opacity-30" : ""
                }`}
              >
                {f.valor}
              </button>
            ))}
          </div>

          {/* Paleta de operadores — provisión infinita, cada toque/arrastre crea una ficha nueva. */}
          <div className="flex flex-wrap gap-2">
            {OPS.map((o) => (
              <button
                key={o}
                type="button"
                onPointerDown={(e) => iniciarArrastre(e, nuevoOperador(o), "banco")}
                onPointerMove={moverArrastre}
                onPointerUp={soltarArrastre}
                style={{ touchAction: "none" }}
                className={`${claseFicha} border border-tt-border bg-tt-surface text-tt-text hover:border-tt-accent/60`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Boton onClick={limpiar} disabled={secuencia.length === 0} variante="fantasma" className="flex-1">
              {t("limpiar")}
            </Boton>
            <Boton onClick={resolver} disabled={!puedeResolver || cargando} cargando={cargando} className="flex-1">
              {t("resolver")}
            </Boton>
          </div>
        </>
      )}

      {estado === "fin" && resultado && (
        <div className="flex flex-col gap-3">
          <p className={`text-sm font-semibold ${resultado.resolvio ? "text-tt-success" : "text-tt-danger"}`}>
            {resultado.resolvio ? t("resuelta", { n: resultado.payout }) : t("fallida")}
          </p>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 50} className="w-full">
            {t("deNuevo")}
          </Boton>
        </div>
      )}
      {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}

      {/* Ficha flotante mientras se arrastra — sigue al puntero, no intercepta hit-testing. */}
      {arrastre?.movido && (
        <div
          className="pointer-events-none fixed z-50 flex h-14 w-14 items-center justify-center rounded-xl bg-tt-accent font-mono text-lg font-black text-tt-bg shadow-2xl"
          style={{ left: arrastre.x - 28, top: arrastre.y - 28 }}
        >
          {etiquetaFicha(arrastre.ficha)}
        </div>
      )}
    </div>
  );
}
