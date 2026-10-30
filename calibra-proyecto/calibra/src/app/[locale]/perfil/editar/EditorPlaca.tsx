"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { ANIMACION_NOMBRE_CLASS, ESTILO_MARCO_PERFIL, FONDO_PERFIL_ESTILO, FUENTE_NOMBRE_CLASS, type AnimacionNombre, type FondoPerfil, type FuenteNombre } from "@/types/database";
import { CATALOGO_NUEVO } from "@/lib/recompensas/catalogo";
import { equiparCosmetico } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { probarPaqueteAcierto, reproducirTono } from "@/lib/sonido";
import { conteo, enlaceTienda, estaPuesta, opcionesDe, type EstadoPlaca, type GrupoOpcion, type NombresPlaca, type OpcionPlaca, type SeccionPlaca } from "@/lib/placa/editorPlaca";
import PlacaVistaPrevia, { type DatosPlacaVista } from "@/components/placa/PlacaVistaPrevia";
import AvatarConMarco from "@/components/AvatarConMarco";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";
import PuntosConFuente, { familiaFuenteNombre, olvidarFuentePuntos } from "@/components/recompensas/PuntosConFuente";
import CiudadSkyline from "@/components/recompensas/CiudadSkyline";
import IconoTrazo from "@/components/IconoTrazo";
import IconoCometa from "@/components/IconoCometa";
import Boton from "@/components/Boton";
import SubirAvatar from "../SubirAvatar";
import SubirFondoPerfil from "../SubirFondoPerfil";

// Editor de la Placa en la web (2026-10-30), a la altura del de la app: la Placa en
// vivo (perfil y lista de amigos) y, por pestañas, todo lo que se le puede poner.
// Lo tuyo se pone con un toque (mismas funciones de la base que usa la app); lo que
// no tienes se prueba sobre tu Placa y dice cómo conseguirlo.

type Pestana = "fondo" | "avatar" | "marco" | "nombre" | "puntos" | "titulo" | "ciudad" | "partida";
const PESTANAS: Pestana[] = ["fondo", "marco", "nombre", "titulo", "avatar", "puntos", "ciudad", "partida"];
const SECCIONES_DE: Record<Pestana, SeccionPlaca[]> = {
  fondo: ["fondo"],
  avatar: [],
  marco: ["marco"],
  nombre: ["fuente", "animacion"],
  puntos: ["puntos"],
  titulo: ["titulo"],
  ciudad: ["ciudad"],
  partida: ["estela", "efecto", "sonido"],
};

const ORDEN_GRUPOS: GrupoOpcion[] = ["base", "ganados", "rango", "mundo", "colores", "clasicas", "nuevas", "ciudades", "galeria", "tienda", "especial"];

// Lo que se prueba sin comprar (solo lo que se ve en la Placa).
type Prueba = Partial<Pick<DatosPlacaVista, "marco" | "fondo" | "fondoUrl" | "fuente" | "animacion" | "colorNombre" | "tituloNombre" | "ciudad" | "fuentePuntos">>;

interface Props {
  userId: string;
  inicial: EstadoPlaca;
  perfil: { nombre: string | null; avatarUrl: string | null; elo: number; nivel: number; chispas: number };
  hoy: string;
}

function aplicarEquipado(e: EstadoPlaca, o: OpcionPlaca): EstadoPlaca {
  switch (o.seccion) {
    case "marco":
      return { ...e, marco: o.valor };
    case "fondo":
      if (o.galeria) return { ...e, fondo: "personalizado", fondoUrl: o.url ?? null };
      return { ...e, fondo: o.valor };
    case "fuente":
      return { ...e, fuente: o.valor };
    case "animacion":
      return { ...e, animacion: o.valor };
    case "puntos":
      return { ...e, fuentePuntos: o.valor };
    case "titulo":
      return { ...e, titulo: o.valor || null };
    case "ciudad":
      return { ...e, cos: { ...e.cos, ciudadPlaca: o.valor || null } };
    case "estela":
      return { ...e, cos: { ...e.cos, estela: o.valor } };
    case "efecto":
      return { ...e, cos: { ...e.cos, efecto: o.valor } };
    case "sonido":
      return { ...e, cos: { ...e.cos, sonido: o.valor } };
  }
}

function pruebaDe(o: OpcionPlaca, e: EstadoPlaca): Prueba | null {
  switch (o.seccion) {
    case "marco":
      return { marco: o.valor };
    case "fondo":
      if (o.galeria) return { fondo: "personalizado", fondoUrl: o.url ?? null };
      return { fondo: o.valor, fondoUrl: o.valor === "personalizado" ? e.fondoUrl : null };
    case "fuente":
      return { fuente: o.valor };
    case "animacion":
      return { animacion: o.valor };
    case "puntos":
      return { fuentePuntos: o.valor };
    case "titulo":
      return { tituloNombre: o.valor ? o.nombre : null };
    case "ciudad":
      return { ciudad: o.valor || null };
    default:
      return null;
  }
}

async function equiparEnLaBase(o: OpcionPlaca): Promise<void> {
  const sb = createClient();
  let r: { error: unknown } = { error: null };
  switch (o.seccion) {
    case "marco":
      r = await sb.rpc("elegir_marco_perfil", { p_marco: o.valor });
      break;
    case "fondo":
      r = o.galeria ? await sb.rpc("elegir_fondo_galeria", { p_slug: o.valor }) : await sb.rpc("elegir_fondo_perfil", { p_fondo: o.valor });
      break;
    case "animacion":
      r = await sb.rpc("elegir_animacion_nombre", { p_animacion: o.valor });
      break;
    case "titulo":
      r = await sb.rpc("elegir_titulo_activo", { p_slug: o.valor || null });
      break;
    case "fuente":
      await equiparCosmetico(sb, "fuente", o.valor);
      break;
    case "puntos":
      await equiparCosmetico(sb, "fuente_puntos", o.valor);
      olvidarFuentePuntos();
      break;
    case "ciudad":
      await equiparCosmetico(sb, "ciudad_placa", o.valor || null);
      break;
    default:
      await equiparCosmetico(sb, o.seccion, o.valor);
  }
  if (r.error) throw r.error;
  if (o.seccion === "estela" || o.seccion === "efecto" || o.seccion === "sonido" || o.seccion === "ciudad") await refrescarCosmeticosWeb();
}

function IconoNota({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

// Muestra chica de cada opción, con tu foto y tu nombre cuando aplica.
function Muestra({ o, e, perfil }: { o: OpcionPlaca; e: EstadoPlaca; perfil: Props["perfil"] }) {
  switch (o.seccion) {
    case "marco":
      return (
        <span className={`inline-flex rounded-full border-2 p-0.5 ${o.valor === "ninguno" ? "border-transparent" : (ESTILO_MARCO_PERFIL[o.valor] ?? "border-border")}`}>
          <AvatarConMarco url={perfil.avatarUrl} nombre={perfil.nombre} marco={o.valor} size={40} />
        </span>
      );
    case "fondo": {
      const url = o.galeria ? o.url : o.valor === "personalizado" ? e.fondoUrl : null;
      const degrade = FONDO_PERFIL_ESTILO[o.valor as FondoPerfil];
      if (o.valor === "ninguno") return <span className="block h-12 w-full rounded-lg border border-dashed border-border bg-surface-2" />;
      if (url) return <span className="block h-12 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />;
      if (o.valor === "personalizado")
        return (
          <span className="flex h-12 w-full items-center justify-center rounded-lg border border-dashed border-primario/50 bg-primario/5 text-primario">
            <IconoTrazo nombre="pincel" className="h-5 w-5" />
          </span>
        );
      return <span className="fondo-perfil-banner block h-12 w-full rounded-lg" style={{ backgroundImage: degrade || undefined }} />;
    }
    case "fuente":
      return (
        <span className={`text-2xl font-bold text-foreground ${FUENTE_NOMBRE_CLASS[o.valor as FuenteNombre] ?? ""}`} style={{ fontFamily: FUENTE_NOMBRE_CLASS[o.valor as FuenteNombre] ? undefined : familiaFuenteNombre(o.valor) }}>
          Aa
        </span>
      );
    case "animacion":
      return (
        <span className={`font-display text-2xl font-bold text-foreground ${ANIMACION_NOMBRE_CLASS[o.valor as AnimacionNombre] ?? ""}`} data-text="Aa">
          Aa
        </span>
      );
    case "puntos":
      return <PuntosConFuente texto="+24" valor={o.valor} tam={22} />;
    case "titulo":
      return o.valor ? (
        <span className="line-clamp-2 rounded-full bg-primario/10 px-2.5 py-1 text-center text-[11px] font-semibold leading-tight text-primario">{o.nombre}</span>
      ) : (
        <span className="h-6 w-16 rounded-full border border-dashed border-border" />
      );
    case "ciudad":
      return o.valor ? <CiudadSkyline ciudad={o.valor} alto={44} ancho={72} redondeado /> : <span className="block h-11 w-[72px] rounded-lg border border-dashed border-border" />;
    case "sonido":
      return <IconoNota className="h-7 w-7 text-primario" />;
    default:
      return <VistaCosmetico categoria={o.seccion} valor={o.valor} tam={44} />;
  }
}

function Precio({ o }: { o: OpcionPlaca }) {
  const t = useTranslations("Perfil.editorPlaca");
  if (!o.como) return <IconoTrazo nombre="candado" className="h-3.5 w-3.5" />;
  if (o.como.tipo === "pro") return <span className="rounded bg-logro/15 px-1.5 text-[10px] font-bold uppercase tracking-wide text-logro">Pro</span>;
  if (o.como.tipo === "nivelMundo") return <span className="text-[10px] font-semibold">{t("nivelCorto", { n: o.como.requerido })}</span>;
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold">
      {o.como.moneda === "cometas" ? <IconoCometa className="h-3 w-3" /> : <span aria-hidden="true" className="h-2 w-2 rotate-45 rounded-[2px] bg-logro" />}
      {o.como.precio.toLocaleString()}
    </span>
  );
}

function Opcion({ o, activa, probando, ocupada, onElegir, children }: { o: OpcionPlaca; activa: boolean; probando: boolean; ocupada: boolean; onElegir: () => void; children: ReactNode }) {
  const t = useTranslations("Perfil.editorPlaca");
  return (
    <button
      type="button"
      onClick={onElegir}
      disabled={ocupada}
      aria-pressed={activa}
      title={o.nombre}
      className={`group relative flex min-h-[112px] flex-col items-center justify-between gap-1.5 rounded-2xl border-2 bg-surface px-2 pb-2 pt-3 text-center transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primario disabled:cursor-wait ${
        activa ? "border-primario shadow-[0_0_0_3px_color-mix(in_oklab,var(--primario)_25%,transparent)]" : probando ? "border-logro" : "border-border hover:border-primario/50"
      }`}
    >
      <span className={`flex h-14 w-full items-center justify-center ${o.tiene ? "" : "opacity-45 grayscale-[35%]"}`}>{children}</span>
      <span className={`line-clamp-2 w-full text-xs font-semibold leading-tight ${o.tiene ? "text-foreground" : "text-texto-secundario"}`}>{o.nombre}</span>
      {activa ? (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-correcto">
          <IconoTrazo nombre="check" className="h-3 w-3" ancho={3} />
          {t("enUso")}
        </span>
      ) : !o.tiene ? (
        <span className="flex items-center gap-1 text-texto-secundario">
          <IconoTrazo nombre="candado" className="h-3 w-3" />
          <Precio o={o} />
        </span>
      ) : (
        <span className="h-[14px]" />
      )}
      {ocupada && <span className="absolute inset-0 animate-pulse rounded-2xl bg-primario/10" />}
    </button>
  );
}

export default function EditorPlaca({ userId, inicial, perfil, hoy }: Props) {
  const t = useTranslations("Perfil.editorPlaca");
  const tPerfil = useTranslations("Perfil");
  const tTienda = useTranslations("Tienda");
  const tRangos = useTranslations("Rankeds.rangos");
  const tMundos = useTranslations("Mundos.nombres");
  const router = useRouter();

  // Lo que viene del servidor, más lo que se fue poniendo hasta que llega la recarga.
  const [base, setBase] = useState(inicial);
  const [e, setE] = useState(inicial);
  if (base !== inicial) {
    setBase(inicial);
    setE(inicial);
  }

  const [pestana, setPestana] = useState<Pestana>("fondo");
  const [soloMios, setSoloMios] = useState(false);
  const [prueba, setPrueba] = useState<Prueba>({});
  const [probando, setProbando] = useState<OpcionPlaca | null>(null);
  const [ocupada, setOcupada] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; error?: boolean } | null>(null);
  const [color, setColor] = useState(e.colorNombre ?? "#6C4CF1");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const nombres: NombresPlaca = useMemo(
    () => ({
      rango: (s) => tRangos(s),
      neon: (s) => tTienda(`marcosNeon.${s}`),
      mundo: (s) => tMundos(s),
      fuente: (v) => tTienda(`fuentes.${v}`),
      animacion: (v) => tTienda(`animaciones.${v === "glitch_intenso" ? "glitchIntenso" : v}`),
      fondo: (v) => (v === "personalizado" ? t("fondoPropio") : tTienda(`fondos.${v}`)),
      ninguno: (s) => t(`ninguno.${s}`),
    }),
    [t, tTienda, tRangos, tMundos]
  );

  const tituloNombre = e.titulo ? (e.titulos.find((x) => x.slug === e.titulo)?.nombre ?? CATALOGO_NUEVO.find((x) => x.categoria === "titulo" && x.valor === e.titulo)?.nombre ?? null) : null;
  const vista: DatosPlacaVista = {
    nombre: perfil.nombre,
    avatarUrl: perfil.avatarUrl,
    marco: e.marco,
    fuente: e.fuente,
    animacion: e.animacion,
    colorNombre: e.colorNombre,
    fondo: e.fondo,
    fondoUrl: e.fondoUrl,
    tituloNombre,
    ciudad: e.cos.ciudadPlaca,
    elo: perfil.elo,
    nivel: perfil.nivel,
    chispas: perfil.chispas,
    fuentePuntos: e.fuentePuntos,
    ...prueba,
  };
  const hayPrueba = Object.keys(prueba).length > 0;

  function avisar(texto: string, error = false) {
    setAviso({ texto, error });
    setTimeout(() => setAviso((a) => (a?.texto === texto ? null : a)), 2600);
  }

  function dejarDeProbar() {
    setPrueba({});
    setProbando(null);
  }

  async function elegir(o: OpcionPlaca) {
    if (o.seccion === "sonido") probarPaqueteAcierto(o.valor);
    if (!o.tiene) {
      const p = pruebaDe(o, e);
      setPrueba(p ?? {});
      setProbando(o);
      return;
    }
    dejarDeProbar();
    if (estaPuesta(o, e)) return;
    setOcupada(`${o.seccion}:${o.id}`);
    try {
      await equiparEnLaBase(o);
      setE((prev) => aplicarEquipado(prev, o));
      if (o.seccion !== "sonido") reproducirTono("tic");
      avisar(t("puesto", { nombre: o.nombre }));
      router.refresh();
    } catch {
      avisar(t("errorGuardar"), true);
    } finally {
      setOcupada(null);
    }
  }

  async function guardarColor(nuevo: string | null) {
    setOcupada("color");
    const { error } = await createClient().rpc("guardar_color_nombre", { p_color: nuevo });
    setOcupada(null);
    if (error) return avisar(tPerfil("colorNombre.errorGuardar"), true);
    setE((prev) => ({ ...prev, colorNombre: nuevo }));
    setPrueba((p) => {
      const resto = { ...p };
      delete resto.colorNombre;
      return resto;
    });
    avisar(t("colorGuardado"));
    router.refresh();
  }

  async function renombrar() {
    if (nombreNuevo.trim().length < 2) return;
    setGuardandoNombre(true);
    const { error } = await createClient().rpc("cambiar_nombre_usuario", { p_nombre: nombreNuevo.trim() });
    setGuardandoNombre(false);
    if (error) return avisar(error.message || tPerfil("nombreEditable.errorGuardar"), true);
    setNombreNuevo("");
    avisar(t("nombreCambiado"));
    router.refresh();
  }

  function textoComo(o: OpcionPlaca): string {
    const c = o.como;
    if (!c) return t("comoOtro");
    if (c.tipo === "pro") return t("comoPro");
    if (c.tipo === "nivelMundo") return t("comoNivel", { requerido: c.requerido, mundo: tMundos(c.mundo), nivel: c.nivel });
    return t("comoTienda", { precio: t(c.moneda === "cometas" ? "precioCometas" : "precioChispas", { n: c.precio.toLocaleString() }) });
  }

  function grilla(seccion: SeccionPlaca) {
    const todas = opcionesDe(seccion, e, nombres, hoy);
    const lista = soloMios ? todas.filter((o) => o.tiene) : todas;
    const { mios, total } = conteo(todas);
    const grupos = ORDEN_GRUPOS.filter((g) => lista.some((o) => o.grupo === g));
    const conTitulos = grupos.filter((g) => g !== "base").length > 1;
    return (
      <div key={seccion} className="flex flex-col gap-3">
        {SECCIONES_DE[pestana].length > 1 && (
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-base font-bold text-foreground">{t(`subsecciones.${seccion}`)}</h3>
            <span className="font-mono text-xs text-texto-secundario">{t("tienes", { mios, total })}</span>
          </div>
        )}
        {SECCIONES_DE[pestana].length === 1 && <p className="font-mono text-xs text-texto-secundario">{t("tienes", { mios, total })}</p>}
        {grupos.map((g) => (
          <div key={g} className="flex flex-col gap-2">
            {conTitulos && g !== "base" && <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-texto-secundario">{t(`grupos.${g}`)}</p>}
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-5">
              {lista
                .filter((o) => o.grupo === g)
                .map((o) => (
                  <Opcion
                    key={o.id}
                    o={o}
                    activa={estaPuesta(o, e)}
                    probando={probando?.seccion === o.seccion && probando.id === o.id}
                    ocupada={ocupada === `${o.seccion}:${o.id}`}
                    onElegir={() => void elegir(o)}
                  >
                    <Muestra o={o} e={e} perfil={perfil} />
                  </Opcion>
                ))}
            </div>
          </div>
        ))}
        {lista.length === 0 && <p className="text-sm text-texto-secundario">{t("nadaTuyo")}</p>}
      </div>
    );
  }

  const panelPrueba = probando && (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-logro/60 bg-logro/10 px-4 py-3" role="status">
      <p className="text-sm font-semibold text-foreground">{t("probando", { nombre: probando.nombre })}</p>
      {!pruebaDe(probando, e) && (
        <div className="flex justify-center py-1">
          <Muestra o={probando} e={e} perfil={perfil} />
        </div>
      )}
      <p className="text-xs text-texto-secundario">{textoComo(probando)}</p>
      <div className="flex flex-wrap gap-2">
        <Link href={enlaceTienda(probando.como, probando.seccion)} className="rounded-xl bg-primario px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5">
          {probando.como?.tipo === "pro" ? t("verPro") : t("irTienda")}
        </Link>
        <button type="button" onClick={dejarDeProbar} className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primario/50">
          {t("dejarDeProbar")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      {/* Teléfono: la Placa chica queda pegada arriba mientras eliges. */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/90 px-4 py-2 backdrop-blur lg:hidden">
        <PlacaVistaPrevia datos={vista} variante="fila" />
        {probando && (
          <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate font-semibold text-logro">{t("probando", { nombre: probando.nombre })}</span>
            <span className="flex shrink-0 gap-2">
              <Link href={enlaceTienda(probando.como, probando.seccion)} className="rounded-lg bg-primario px-2.5 py-1 font-semibold text-white">
                {probando.como?.tipo === "pro" ? t("verPro") : t("irTienda")}
              </Link>
              <button type="button" onClick={dejarDeProbar} aria-label={t("dejarDeProbar")} className="rounded-lg border border-border px-2 py-1 font-semibold text-foreground">
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-texto-secundario">{t("asiTeVen")}</p>
          <PlacaVistaPrevia key={JSON.stringify(prueba)} datos={vista} variante="perfil" />
        </div>
        {panelPrueba}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-texto-secundario">{t("enAmigos")}</p>
          <div className="grid grid-cols-[10.5rem_minmax(0,1fr)] items-start gap-3">
            <PlacaVistaPrevia datos={vista} variante="tarjeta" />
            <div className="flex flex-col gap-2">
              <PlacaVistaPrevia datos={vista} variante="fila" />
              <p className="text-xs text-texto-secundario">{t("enAmigosAyuda")}</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-3 sm:p-5">
        <div role="tablist" aria-label={t("pestanasEtiqueta")} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {PESTANAS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={pestana === p}
              onClick={() => {
                setPestana(p);
                dejarDeProbar();
              }}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${pestana === p ? "bg-primario text-white" : "bg-surface-2 text-texto-secundario hover:text-foreground"}`}
            >
              {t(`pestanas.${p}`)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-texto-secundario">{t(`ayudas.${pestana}`)}</p>
          {pestana !== "avatar" && (
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <input type="checkbox" checked={soloMios} onChange={(ev) => setSoloMios(ev.target.checked)} className="h-4 w-4 accent-[var(--primario)]" />
              {t("soloMios")}
            </label>
          )}
        </div>

        {aviso && (
          <p role="status" className={`rounded-xl px-3 py-2 text-sm font-semibold ${aviso.error ? "bg-error/10 text-error" : "bg-correcto/10 text-correcto"}`}>
            {aviso.texto}
          </p>
        )}

        {pestana === "avatar" && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
            <SubirAvatar userId={userId} nombre={perfil.nombre} avatarUrlInicial={perfil.avatarUrl} marco={vista.marco} />
            <p className="text-xs text-texto-secundario">{tPerfil("editar.fotoAyuda")}</p>
          </div>
        )}

        {SECCIONES_DE[pestana].map((s) => grilla(s))}

        {pestana === "fondo" &&
          (e.fondos.includes("personalizado") ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-4">
              <p className="font-display text-sm font-bold text-foreground">{t("fondoPropio")}</p>
              <p className="text-xs text-texto-secundario">{tPerfil("editar.fondoAyuda")}</p>
              <SubirFondoPerfil userId={userId} urlInicial={e.fondoUrl} />
            </div>
          ) : (
            <p className="text-xs text-texto-secundario">{tPerfil("editar.fondoSinComprar")}</p>
          ))}

        {pestana === "nombre" && (
          <>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-base font-bold text-foreground">{t("subsecciones.color")}</h3>
              {e.colorDesbloqueado ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    aria-label={t("subsecciones.color")}
                    onChange={(ev) => {
                      setColor(ev.target.value);
                      setPrueba((p) => ({ ...p, colorNombre: ev.target.value }));
                    }}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                  />
                  <Boton onClick={() => void guardarColor(color)} cargando={ocupada === "color"} disabled={color === e.colorNombre} className="px-3 py-2 text-sm">
                    {t("guardarColor")}
                  </Boton>
                  {e.colorNombre && (
                    <button type="button" onClick={() => void guardarColor(null)} className="text-xs font-semibold text-texto-secundario underline hover:text-foreground">
                      {t("quitarColor")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-3">
                  <IconoTrazo nombre="candado" className="h-4 w-4 text-texto-secundario" />
                  <p className="text-xs text-texto-secundario">{t("colorBloqueado")}</p>
                  <Link href="/tienda?puesto=caligrafia" className="text-xs font-semibold text-primario hover:underline">
                    {t("irTienda")}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-base font-bold text-foreground">{t("subsecciones.renombrar")}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={nombreNuevo}
                  onChange={(ev) => setNombreNuevo(ev.target.value)}
                  placeholder={perfil.nombre ?? ""}
                  maxLength={40}
                  aria-label={t("subsecciones.renombrar")}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
                />
                <Boton onClick={() => void renombrar()} disabled={nombreNuevo.trim().length < 2} cargando={guardandoNombre} className="px-3 py-2 text-sm">
                  {tPerfil("nombreEditable.guardar")}
                </Boton>
              </div>
              <p className="text-xs text-texto-secundario">{tPerfil("nombreEditable.costoCambiar", { costo: 100 })}</p>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <Link href="/tienda?modo=inventario" className="text-sm font-semibold text-primario hover:underline">
            {tPerfil("editar.aspecto")}
          </Link>
          {hayPrueba && (
            <button type="button" onClick={dejarDeProbar} className="text-xs font-semibold text-texto-secundario underline hover:text-foreground">
              {t("dejarDeProbar")}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
