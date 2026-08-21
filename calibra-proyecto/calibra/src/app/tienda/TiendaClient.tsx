"use client";

import { useState, type ReactNode } from "react";
import { RANGOS_ELO, FUENTE_NOMBRE_CLASS, type FuenteNombre } from "@/types/database";
import { IconEscudo } from "@/components/icons";
import Boton from "@/components/Boton";
import GlareHover from "@/components/reactbits/GlareHover";
import BorderGlow from "@/components/reactbits/BorderGlow";
import ScrollFloat from "@/components/reactbits/ScrollFloat";
import { obtenerDescuentoDelDia, precioConDescuento } from "@/lib/descuentoDiario";
import { COSTOS, type ItemComprable } from "@/lib/tienda/costos";

const NOMBRES_ITEM: Record<ItemComprable, string> = {
  escudo: "Escudo extra",
  congelamiento: "Congelar racha",
  boost: "Boost de Chispas",
  fuente_mono: "Fuente Monoespaciada",
  fuente_serif: "Fuente Elegante",
  fuente_manuscrita: "Fuente Manuscrita",
  fuente_impacto: "Fuente Impacto",
  fuente_script: "Fuente Script",
  fuente_futurista: "Fuente Futurista",
  marco_bronce: "Marco Bronce",
  marco_plata: "Marco Plata",
  marco_oro: "Marco Oro",
  marco_platino: "Marco Platino",
  marco_diamante: "Marco Diamante",
  marco_prodigio: "Marco Prodigio",
};

const FUENTES_COMPRABLES: { fuente: FuenteNombre; item: ItemComprable; nombre: string }[] = [
  { fuente: "mono", item: "fuente_mono", nombre: "Monoespaciada" },
  { fuente: "serif", item: "fuente_serif", nombre: "Elegante" },
  { fuente: "manuscrita", item: "fuente_manuscrita", nombre: "Manuscrita" },
  { fuente: "impacto", item: "fuente_impacto", nombre: "Impacto" },
  { fuente: "script", item: "fuente_script", nombre: "Script" },
  { fuente: "futurista", item: "fuente_futurista", nombre: "Futurista" },
];

// Fase 7: reusa la paleta de rangos de Rankeds (RANGOS_ELO) en vez de
// inventar colores nuevos — 6 marcos, uno por rango real.
const MARCOS_COMPRABLES = RANGOS_ELO.map((r) => ({
  marco: r.slug,
  item: `marco_${r.slug}` as ItemComprable,
  nombre: r.nombre,
  colorHex: r.colorHex,
}));

const MONTOS_APUESTA = [25, 50, 100];
const APUESTA_MAXIMA = 200;

type Contexto = "utilidad" | "fuente" | "marco" | "apuesta";

interface Props {
  puntosIniciales: number;
  escudosIniciales: number;
  congelamientosIniciales: number;
  boostIniciales: number;
  fuenteActual: string;
  fuentesDesbloqueadas: string[];
  marcoActual: string;
  marcosDesbloqueados: string[];
  apuestaActiva: boolean;
  ocultarDobleONadaInicial: boolean;
  fechaHoy: string;
}

export default function TiendaClient({
  puntosIniciales,
  escudosIniciales,
  congelamientosIniciales,
  boostIniciales,
  fuenteActual,
  fuentesDesbloqueadas,
  marcoActual,
  marcosDesbloqueados,
  apuestaActiva,
  ocultarDobleONadaInicial,
  fechaHoy,
}: Props) {
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [congelamientos, setCongelamientos] = useState(congelamientosIniciales);
  const [boost, setBoost] = useState(boostIniciales);
  const [fuentesDesbl, setFuentesDesbl] = useState(fuentesDesbloqueadas);
  const [fuenteElegida, setFuenteElegida] = useState(fuenteActual);
  const [marcosDesbl, setMarcosDesbl] = useState(marcosDesbloqueados);
  const [marcoElegido, setMarcoElegido] = useState(marcoActual);
  const [apostando, setApostando] = useState(false);
  const [apuestaActivaLocal, setApuestaActivaLocal] = useState(apuestaActiva);
  const [confirmando, setConfirmando] = useState<ItemComprable | null>(null);
  const [comprando, setComprando] = useState(false);
  const [cambiandoCosmetico, setCambiandoCosmetico] = useState(false);
  const [error, setError] = useState<{ msg: string; contexto: Contexto } | null>(null);
  const [trastiendaAbierta, setTrastiendaAbierta] = useState(false);

  const oferta = obtenerDescuentoDelDia(fechaHoy);

  function costoDe(item: ItemComprable): number {
    return precioConDescuento(COSTOS[item], item, fechaHoy);
  }

  async function comprar(item: ItemComprable, contexto: Contexto) {
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
        setError({ msg: data.error ?? "No se pudo comprar.", contexto });
        return;
      }
      setPuntos(data.puntos_total);
      setEscudos(data.escudos_extra_pendientes);
      setCongelamientos(data.congelamientos_disponibles);
      setBoost(data.boost_multiplicador_pendiente > 1 ? 1 : 0);
      if (Array.isArray(data.fuentes_desbloqueadas)) setFuentesDesbl(data.fuentes_desbloqueadas);
      if (Array.isArray(data.marcos_desbloqueados)) setMarcosDesbl(data.marcos_desbloqueados);
      setConfirmando(null);
    } catch {
      setError({ msg: "No se pudo comprar. Revisá tu conexión.", contexto });
    } finally {
      setComprando(false);
    }
  }

  async function elegirFuente(fuente: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-fuente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fuente }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ msg: data.error ?? "No se pudo cambiar la fuente.", contexto: "fuente" });
      else setFuenteElegida(fuente);
    } catch {
      setError({ msg: "No se pudo cambiar la fuente. Revisá tu conexión.", contexto: "fuente" });
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
      if (!res.ok) setError({ msg: data.error ?? "No se pudo cambiar el marco.", contexto: "marco" });
      else setMarcoElegido(marco);
    } catch {
      setError({ msg: "No se pudo cambiar el marco. Revisá tu conexión.", contexto: "marco" });
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
        setError({ msg: data.error ?? "No se pudo apostar.", contexto: "apuesta" });
        return;
      }
      setPuntos(data.puntos_total);
      setApuestaActivaLocal(true);
    } catch {
      setError({ msg: "No se pudo apostar. Revisá tu conexión.", contexto: "apuesta" });
    } finally {
      setApostando(false);
    }
  }

  return (
    <div
      className="flex-1"
      style={{ background: "radial-gradient(120% 100% at 50% 0%, #E8C79A 0%, #C97B4A 45%, #8a5a35 100%)" }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#3D2410] drop-shadow-sm">
            🏺 El Bazar de Prodigia
          </h1>
          <p className="mt-1 font-mono text-sm font-semibold text-[#5C3A22]">{puntos} Chispas disponibles</p>
        </div>

        <OfertaDelDia oferta={oferta} nombre={NOMBRES_ITEM[oferta.item as ItemComprable]} />

        <EstanteCategoria titulo="Puesto de utilidad" franja="#6C4CF1">
          <ItemEstante
            icono={<IconEscudo className="h-6 w-6 text-[#6C4CF1]" />}
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
            onComprar={() => comprar("escudo", "utilidad")}
          />
          <ItemEstante
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
            onComprar={() => comprar("congelamiento", "utilidad")}
          />
          <ItemEstante
            icono={<span className="text-2xl">⚡</span>}
            nombre="Boost de Chispas"
            descripcion="×1.5 Chispas en tu próxima partida, cualquier mundo."
            costo={costoDe("boost")}
            costoOriginal={COSTOS.boost}
            cantidad={boost}
            puntos={puntos}
            confirmando={confirmando === "boost"}
            comprando={comprando}
            onConfirmar={() => setConfirmando("boost")}
            onCancelar={() => setConfirmando(null)}
            onComprar={() => comprar("boost", "utilidad")}
          />
          {error?.contexto === "utilidad" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        <EstanteCategoria titulo="Vidriera de tipografías" franja="#A78355">
          <p className="text-sm text-[#F4E4C1]/90">
            Cómo se ve tu nombre en tu perfil, el ranking y el feed. Cosmético — no cambia nada de la partida.
          </p>
          <div className="flex flex-wrap gap-2">
            {(["default", ...FUENTES_COMPRABLES.map((f) => f.fuente)] as FuenteNombre[]).map((fuente) => {
              const desbloqueada = fuentesDesbl.includes(fuente);
              const compra = FUENTES_COMPRABLES.find((f) => f.fuente === fuente);
              const elegida = fuenteElegida === fuente;
              const claseFuente = FUENTE_NOMBRE_CLASS[fuente];
              if (desbloqueada) {
                return (
                  <button
                    key={fuente}
                    onClick={() => elegirFuente(fuente)}
                    disabled={cambiandoCosmetico || elegida}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${claseFuente} ${
                      elegida
                        ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                        : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
                    }`}
                  >
                    {fuente === "default" ? "Normal" : compra?.nombre}
                    {elegida && " · Activa"}
                  </button>
                );
              }
              if (!compra) return null;
              const costo = costoDe(compra.item);
              return (
                <button
                  key={fuente}
                  onClick={() => comprar(compra.item, "fuente")}
                  disabled={comprando || puntos < costo}
                  className={`rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40 ${claseFuente}`}
                >
                  {compra.nombre} · {costo} Chispas
                </button>
              );
            })}
          </div>
          {error?.contexto === "fuente" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        <EstanteCategoria titulo="Herrero de marcos" franja="#E8B34D">
          <p className="text-sm text-[#F4E4C1]/90">
            Un borde cosmético para tu nombre en el perfil — los mismos colores que los rangos de Rankeds.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => elegirMarco("ninguno")}
              disabled={cambiandoCosmetico || marcoElegido === "ninguno"}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                marcoElegido === "ninguno"
                  ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                  : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
              }`}
            >
              Sin marco{marcoElegido === "ninguno" && " · Activo"}
            </button>
            {MARCOS_COMPRABLES.map(({ marco, item, nombre, colorHex }) => {
              const desbloqueado = marcosDesbl.includes(marco);
              const elegido = marcoElegido === marco;
              if (desbloqueado) {
                return (
                  <button
                    key={marco}
                    onClick={() => elegirMarco(marco)}
                    disabled={cambiandoCosmetico || elegido}
                    className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      elegido ? "bg-[#F4E4C1] text-[#3D2410]" : "bg-[#3D2410]/30 text-[#F4E4C1]"
                    }`}
                    style={{ borderColor: colorHex }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorHex }} />
                    {nombre}
                    {elegido && " · Activo"}
                  </button>
                );
              }
              const costo = costoDe(item);
              return (
                <button
                  key={marco}
                  onClick={() => comprar(item, "marco")}
                  disabled={comprando || puntos < costo}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorHex }} />
                  {nombre} · {costo} Chispas
                </button>
              );
            })}
          </div>
          {error?.contexto === "marco" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        {!ocultarDobleONadaInicial && (
          <Trastienda
            abierta={trastiendaAbierta}
            onAbrir={() => setTrastiendaAbierta(true)}
            apuestaActiva={apuestaActivaLocal}
            apostando={apostando}
            puntos={puntos}
            onApostar={apostar}
            error={error?.contexto === "apuesta" ? error.msg : null}
          />
        )}
      </div>
    </div>
  );
}

// ---------- "vidriera" del descuento del día: trato de vendedor destacado ----------
function OfertaDelDia({
  oferta,
  nombre,
}: {
  oferta: { item: string; porcentaje: number };
  nombre: string;
}) {
  return (
    <BorderGlow
      backgroundColor="#3D2410"
      borderRadius={20}
      glowRadius={30}
      colors={["#FFC53D", "#E8B34D", "#A794FF"]}
      glowColor="45 85% 60%"
    >
      <div className="flex items-center gap-3 px-5 py-4 text-center">
        <span className="text-2xl">🏷️</span>
        <p className="text-sm font-semibold text-[#F4E4C1]">
          Oferta del vendedor de hoy: <span className="text-[#FFC53D]">{oferta.porcentaje}% menos</span> en {nombre}
        </p>
      </div>
    </BorderGlow>
  );
}

// ---------- estante con toldo colgante (Fase 1: ambientación de bazar) ----------
function EstanteCategoria({ titulo, franja, children }: { titulo: string; franja: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl shadow-[0_14px_28px_-14px_rgba(61,36,16,0.55)]">
      <div className="relative">
        <div
          className="h-6 w-full"
          style={{
            background: `repeating-linear-gradient(90deg, ${franja} 0 22px, #F4E4C1 22px 44px)`,
            clipPath:
              "polygon(0 0,100% 0,100% 55%,95.5% 100%,91% 55%,86.5% 100%,82% 55%,77.5% 100%,73% 55%,68.5% 100%,64% 55%,59.5% 100%,55% 55%,50.5% 100%,46% 55%,41.5% 100%,37% 55%,32.5% 100%,28% 55%,23.5% 100%,19% 55%,14.5% 100%,10% 55%,5.5% 100%,1% 55%,0 100%)",
          }}
        />
        <div className="bg-[#3D2410] px-4 py-2">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-[#F4E4C1]">{titulo}</span>
        </div>
      </div>
      <div
        className="flex flex-col gap-4 p-5"
        style={{ background: "linear-gradient(180deg, #C1652F 0%, #A85527 100%)" }}
      >
        {children}
      </div>
      <div
        className="h-3 w-full"
        style={{
          background: "linear-gradient(180deg, #8a5a35, #5C3A22)",
          boxShadow: "inset 0 3px 6px -2px rgba(0,0,0,0.5)",
        }}
      />
    </section>
  );
}

function ItemEstante({
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
  icono: ReactNode;
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
    <GlareHover
      width="100%"
      height="auto"
      background="#F4E4C1"
      borderRadius="14px"
      borderColor="#8a5a35"
      glareColor="#FFC53D"
      glareOpacity={0.35}
      className="!flex !flex-col !gap-3 px-5 py-4 shadow-[0_6px_0_0_#8a5a35]"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/60">{icono}</span>
        <div className="flex-1">
          <p className="font-display font-semibold text-[#3D2410]">{nombre}</p>
          <p className="text-sm text-[#5C3A22]">{descripcion}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#3D2410]/10 px-2.5 py-1 font-mono text-xs text-[#3D2410]">
          Tenés: {cantidad}
        </span>
      </div>

      {!confirmando ? (
        <Boton variante="primario" onClick={onConfirmar} disabled={!alcanza} className="self-start px-4 py-2 text-sm">
          {alcanza ? (
            <>
              <ScrollFloat stagger={0.02} animationDuration={0.6}>
                {`Comprar por ${costo} Chispas`}
              </ScrollFloat>
              {enOferta && <span className="ml-1 text-white/70 line-through">{costoOriginal}</span>}
            </>
          ) : (
            `Necesitás ${costo} Chispas`
          )}
        </Boton>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#3D2410]">¿Gastar {costo} Chispas?</span>
          <Boton onClick={onComprar} cargando={comprando} className="px-3 py-1.5 text-sm">
            Confirmar
          </Boton>
          <button onClick={onCancelar} className="text-sm text-[#5C3A22] hover:underline">
            Cancelar
          </button>
        </div>
      )}
    </GlareHover>
  );
}

// ---------- Fase 4: "doble o nada" movido a una trastienda, un paso extra ----------
function Trastienda({
  abierta,
  onAbrir,
  apuestaActiva,
  apostando,
  puntos,
  onApostar,
  error,
}: {
  abierta: boolean;
  onAbrir: () => void;
  apuestaActiva: boolean;
  apostando: boolean;
  puntos: number;
  onApostar: (monto: number) => void;
  error: string | null;
}) {
  if (!abierta) {
    return (
      <button
        onClick={onAbrir}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#3D2410]/40 bg-[#3D2410]/15 px-5 py-4 text-sm font-medium text-[#3D2410]/70 transition-colors hover:bg-[#3D2410]/25"
      >
        🚪 Entrar a la trastienda…
      </button>
    );
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-[#5C1A1A]/40 px-6 py-5 shadow-lg"
      style={{ background: "linear-gradient(180deg, #6B2A2A 0%, #3D2410 100%)" }}
    >
      <div>
        <p className="font-display font-semibold text-[#F4E4C1]">🎲 Doble o nada</p>
        <p className="mt-1 text-sm text-[#F4E4C1]/80">
          Apostá Chispas a que tu próxima partida supera tu precisión histórica. Si ganás, se duplica.
        </p>
        <p className="mt-2 rounded-lg bg-[#F4E4C1]/10 px-3 py-2 text-xs font-medium text-[#F4E4C1]/90">
          ⚠️ Esto nunca usa dinero real — es solo con tus Chispas del juego. Apuesta máxima: {APUESTA_MAXIMA}{" "}
          Chispas. Podés ocultar esta sección desde Ajustes si preferís no verla.
        </p>
      </div>
      {apuestaActiva ? (
        <p className="text-sm font-medium text-[#FFC53D]">Tenés una apuesta activa — se resuelve con tu próxima partida.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {MONTOS_APUESTA.map((monto) => (
            <Boton
              key={monto}
              variante="secundario"
              onClick={() => onApostar(monto)}
              disabled={apostando || puntos < monto}
              cargando={apostando}
              className="px-4 py-2 text-sm"
            >
              Apostar {monto}
            </Boton>
          ))}
        </div>
      )}
      {error && <p className="text-sm font-medium text-[#FF9B9B]">{error}</p>}
    </section>
  );
}
