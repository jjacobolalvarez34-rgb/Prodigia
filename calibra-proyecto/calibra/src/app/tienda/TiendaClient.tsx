"use client";

import { useState } from "react";
import { COLOR_DIAL_HEX, type ColorDial } from "@/types/database";
import { IconEscudo } from "@/components/icons";
import LevelDial from "@/app/practica/LevelDial";
import Boton from "@/components/Boton";
import { obtenerDescuentoDelDia, precioConDescuento } from "@/lib/descuentoDiario";

const COSTOS = {
  escudo: 80,
  congelamiento: 60,
  boost: 100,
  color_esmeralda: 150,
  color_coral: 150,
  color_dorado: 150,
  marco_plata: 120,
  marco_oro: 220,
} as const;

type ItemComprable = keyof typeof COSTOS;

const NOMBRES_ITEM: Record<ItemComprable, string> = {
  escudo: "Escudo extra",
  congelamiento: "Congelar racha",
  boost: "Boost de Puntos",
  color_esmeralda: "Color Esmeralda",
  color_coral: "Color Coral",
  color_dorado: "Color Dorado",
  marco_plata: "Marco Plata",
  marco_oro: "Marco Oro",
};

const COLORES_COMPRABLES: { color: ColorDial; item: ItemComprable; nombre: string }[] = [
  { color: "esmeralda", item: "color_esmeralda", nombre: "Esmeralda" },
  { color: "coral", item: "color_coral", nombre: "Coral" },
  { color: "dorado", item: "color_dorado", nombre: "Dorado" },
];

const MARCOS_COMPRABLES: { marco: string; item: ItemComprable; nombre: string; estilo: string }[] = [
  { marco: "plata", item: "marco_plata", nombre: "Plata", estilo: "border-4 border-[#C0C5CE]" },
  { marco: "oro", item: "marco_oro", nombre: "Oro", estilo: "border-4 border-[#FFC53D]" },
];

const MONTOS_APUESTA = [25, 50, 100];

interface Props {
  puntosIniciales: number;
  escudosIniciales: number;
  congelamientosIniciales: number;
  boostIniciales: number;
  colorActual: string;
  coloresDesbloqueados: string[];
  marcoActual: string;
  marcosDesbloqueados: string[];
  apuestaActiva: boolean;
  fechaHoy: string;
}

export default function TiendaClient({
  puntosIniciales,
  escudosIniciales,
  congelamientosIniciales,
  boostIniciales,
  colorActual,
  coloresDesbloqueados,
  marcoActual,
  marcosDesbloqueados,
  apuestaActiva,
  fechaHoy,
}: Props) {
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [congelamientos, setCongelamientos] = useState(congelamientosIniciales);
  const [boost, setBoost] = useState(boostIniciales);
  const [desbloqueados, setDesbloqueados] = useState(coloresDesbloqueados);
  const [colorElegido, setColorElegido] = useState(colorActual);
  const [marcosDesbl, setMarcosDesbl] = useState(marcosDesbloqueados);
  const [marcoElegido, setMarcoElegido] = useState(marcoActual);
  const [apostando, setApostando] = useState(false);
  const [apuestaActivaLocal, setApuestaActivaLocal] = useState(apuestaActiva);
  const [confirmando, setConfirmando] = useState<ItemComprable | null>(null);
  const [comprando, setComprando] = useState(false);
  const [cambiandoCosmetico, setCambiandoCosmetico] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oferta = obtenerDescuentoDelDia(fechaHoy);

  function costoDe(item: ItemComprable): number {
    return precioConDescuento(COSTOS[item], item, fechaHoy);
  }

  async function comprar(item: ItemComprable) {
    setComprando(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo comprar.");
        return;
      }
      setPuntos(data.puntos_total);
      setEscudos(data.escudos_extra_pendientes);
      setCongelamientos(data.congelamientos_disponibles);
      setBoost(data.boost_multiplicador_pendiente > 1 ? 1 : 0);
      if (Array.isArray(data.colores_dial_desbloqueados)) setDesbloqueados(data.colores_dial_desbloqueados);
      if (Array.isArray(data.marcos_desbloqueados)) setMarcosDesbl(data.marcos_desbloqueados);
      setConfirmando(null);
    } catch {
      setError("No se pudo comprar. Revisá tu conexión.");
    } finally {
      setComprando(false);
    }
  }

  async function elegirColor(color: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-color", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "No se pudo cambiar el color.");
      else setColorElegido(color);
    } catch {
      setError("No se pudo cambiar el color. Revisá tu conexión.");
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  async function elegirMarco(marco: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-marco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marco }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "No se pudo cambiar el marco.");
      else setMarcoElegido(marco);
    } catch {
      setError("No se pudo cambiar el marco. Revisá tu conexión.");
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  async function apostar(monto: number) {
    setApostando(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/apostar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo apostar.");
        return;
      }
      setPuntos(data.puntos_total);
      setApuestaActivaLocal(true);
    } catch {
      setError("No se pudo apostar. Revisá tu conexión.");
    } finally {
      setApostando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Tienda</h1>
        <p className="mt-1 font-mono text-sm text-texto-secundario">{puntos} Puntos disponibles</p>
      </div>

      <div className="rounded-2xl bg-logro/15 px-5 py-3 text-center text-sm font-medium text-foreground">
        🏷️ Oferta del día: {oferta.porcentaje}% menos en {NOMBRES_ITEM[oferta.item]}
      </div>

      <div className="flex flex-col gap-4">
        <ItemTienda
          icono={<IconEscudo className="h-6 w-6 text-primario" />}
          nombre="Escudo extra"
          descripcion="Un escudo de calibración de más para tu próxima partida."
          costo={costoDe("escudo")}
          costoOriginal={COSTOS.escudo}
          cantidad={escudos}
          puntos={puntos}
          confirmando={confirmando === "escudo"}
          comprando={comprando}
          onConfirmar={() => setConfirmando("escudo")}
          onCancelar={() => setConfirmando(null)}
          onComprar={() => comprar("escudo")}
        />
        <ItemTienda
          icono={<span className="text-2xl">❄️</span>}
          nombre="Congelar racha"
          descripcion="Si un día no practicás, no se corta tu racha."
          costo={costoDe("congelamiento")}
          costoOriginal={COSTOS.congelamiento}
          cantidad={congelamientos}
          puntos={puntos}
          confirmando={confirmando === "congelamiento"}
          comprando={comprando}
          onConfirmar={() => setConfirmando("congelamiento")}
          onCancelar={() => setConfirmando(null)}
          onComprar={() => comprar("congelamiento")}
        />
        <ItemTienda
          icono={<span className="text-2xl">⚡</span>}
          nombre="Boost de Puntos"
          descripcion="×1.5 Puntos en tu próxima partida, cualquier mundo."
          costo={costoDe("boost")}
          costoOriginal={COSTOS.boost}
          cantidad={boost}
          puntos={puntos}
          confirmando={confirmando === "boost"}
          comprando={comprando}
          onConfirmar={() => setConfirmando("boost")}
          onCancelar={() => setConfirmando(null)}
          onComprar={() => comprar("boost")}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <LevelDial nivel={8} size={44} mostrarEtiqueta={false} colorHex={COLOR_DIAL_HEX[colorElegido as ColorDial]} />
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">Color del dial</p>
            <p className="text-sm text-texto-secundario">Cosmético permanente — cambiá el acento de tu dial de nivel.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["violeta", ...COLORES_COMPRABLES.map((c) => c.color)] as ColorDial[]).map((color) => {
            const desbloqueado = desbloqueados.includes(color);
            const compra = COLORES_COMPRABLES.find((c) => c.color === color);
            const elegido = colorElegido === color;
            if (desbloqueado) {
              return (
                <button
                  key={color}
                  onClick={() => elegirColor(color)}
                  disabled={cambiandoCosmetico || elegido}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    elegido ? "border-foreground/40 bg-surface-2" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: COLOR_DIAL_HEX[color] }} />
                  {color[0].toUpperCase() + color.slice(1)}
                  {elegido && " · Activo"}
                </button>
              );
            }
            if (!compra) return null;
            const costo = costoDe(compra.item);
            return (
              <button
                key={color}
                onClick={() => comprar(compra.item)}
                disabled={comprando || puntos < costo}
                className="flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-texto-secundario disabled:opacity-40"
              >
                <span className="h-3 w-3 rounded-full" style={{ background: COLOR_DIAL_HEX[color] }} />
                {compra.nombre} · {costo} Puntos
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primario/10 ${
              marcoElegido !== "ninguno" ? MARCOS_COMPRABLES.find((m) => m.marco === marcoElegido)?.estilo : ""
            }`}
          >
            <span className="text-lg">👤</span>
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">Marco de perfil</p>
            <p className="text-sm text-texto-secundario">Un borde cosmético alrededor de tu nombre en Perfil.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["ninguno", ...MARCOS_COMPRABLES.map((m) => m.marco)].map((marco) => {
            const desbloqueado = marcosDesbl.includes(marco);
            const compra = MARCOS_COMPRABLES.find((m) => m.marco === marco);
            const elegido = marcoElegido === marco;
            if (marco === "ninguno" || desbloqueado) {
              return (
                <button
                  key={marco}
                  onClick={() => elegirMarco(marco)}
                  disabled={cambiandoCosmetico || elegido}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    elegido ? "border-foreground/40 bg-surface-2" : "border-border hover:border-foreground/30"
                  }`}
                >
                  {marco === "ninguno" ? "Sin marco" : compra?.nombre}
                  {elegido && " · Activo"}
                </button>
              );
            }
            if (!compra) return null;
            const costo = costoDe(compra.item);
            return (
              <button
                key={marco}
                onClick={() => comprar(compra.item)}
                disabled={comprando || puntos < costo}
                className="rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-texto-secundario disabled:opacity-40"
              >
                {compra.nombre} · {costo} Puntos
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm">
        <div>
          <p className="font-display font-semibold text-foreground">🎲 Doble o nada</p>
          <p className="text-sm text-texto-secundario">
            Apostá Puntos a que tu próxima partida supera tu precisión histórica. Si ganás, se duplica.
          </p>
        </div>
        {apuestaActivaLocal ? (
          <p className="text-sm font-medium text-primario">Tenés una apuesta activa — se resuelve con tu próxima partida.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {MONTOS_APUESTA.map((monto) => (
              <Boton
                key={monto}
                variante="secundario"
                onClick={() => apostar(monto)}
                disabled={apostando || puntos < monto}
                cargando={apostando}
                className="px-4 py-2 text-sm"
              >
                Apostar {monto}
              </Boton>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

function ItemTienda({
  icono,
  nombre,
  descripcion,
  costo,
  costoOriginal,
  cantidad,
  puntos,
  confirmando,
  comprando,
  onConfirmar,
  onCancelar,
  onComprar,
}: {
  icono: React.ReactNode;
  nombre: string;
  descripcion: string;
  costo: number;
  costoOriginal: number;
  cantidad: number;
  puntos: number;
  confirmando: boolean;
  comprando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  onComprar: () => void;
}) {
  const alcanza = puntos >= costo;
  const enOferta = costo < costoOriginal;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primario/10">{icono}</span>
        <div className="flex-1">
          <p className="font-display font-semibold text-foreground">{nombre}</p>
          <p className="text-sm text-texto-secundario">{descripcion}</p>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs text-texto-secundario">
          Tenés: {cantidad}
        </span>
      </div>

      {!confirmando ? (
        <Boton variante="primario" onClick={onConfirmar} disabled={!alcanza} className="self-start px-4 py-2 text-sm">
          {alcanza ? (
            <>
              Comprar por {costo} Puntos
              {enOferta && <span className="ml-1 text-white/70 line-through">{costoOriginal}</span>}
            </>
          ) : (
            `Necesitás ${costo} Puntos`
          )}
        </Boton>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">¿Gastar {costo} Puntos?</span>
          <Boton onClick={onComprar} cargando={comprando} className="px-3 py-1.5 text-sm">
            Confirmar
          </Boton>
          <button onClick={onCancelar} className="text-sm text-texto-secundario hover:underline">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
