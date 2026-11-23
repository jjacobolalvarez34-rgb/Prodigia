"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import MamutHerdSello from "@/components/MamutHerdSello";
import { IconCheck, IconRango, IconEscudo, IconJugar, IconLlama } from "@/components/icons";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { preciosPresentacion } from "@/lib/landing/precios";
import { NEON_MUNDO } from "@/lib/landing/rueda";
import { Aparece, Encabezado, MiniPanel, SUAVE, clasesBoton } from "./piezas";
import { CajaNeon, CiudadDeNoche, Estrellas, LetreroNeon } from "./neon";
import RuedaCiudades from "./RuedaCiudades";
import TicketPartida from "./TicketPartida";

// Página de presentación pública (2026-11-23). Segunda versión, a pedido: «la estética
// de Prodigia es neón, pero que no se vea hecha con IA». Es la «Noche de Prodigia» del
// sistema visual de la app (docs/app-nativa/02-SISTEMA-VISUAL.md): siempre oscura,
// fondo liso, y el color de cada ciudad es la luz. El neón imita tubos reales (centro
// blanco, color en el halo, encendido en desorden, una letra que falla) y se usa poco:
// el título, la rueda, los íconos de «Con otros» y el plan recomendado. Nada de
// manchas borrosas, vidrio, texto en degradé, etiquetas en mayúsculas ni cifras de
// relleno. La ve quien entra a «/» sin sesión, y cualquiera en /conoce. «Jugar» abre el
// flujo de siempre (onJugar en «/»; un link a «/» en /conoce). Las animaciones corren
// aunque el sistema pida reducir el movimiento (MotionConfig reducedMotion="never").

const COLORES_CIUDAD = MUNDOS_LANDING.map((m) => NEON_MUNDO[m.slug].neon);

function BotonJugar({ onJugar, children, grande }: { onJugar?: () => void; children: ReactNode; grande?: boolean }) {
  const contenido = (
    <>
      <span>{children}</span>
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        <IconJugar className="h-4 w-4 translate-x-px" />
      </span>
    </>
  );
  if (onJugar) {
    return (
      <button type="button" onClick={onJugar} className={clasesBoton("primario", grande)} data-prueba="jugar">
        {contenido}
      </button>
    );
  }
  return (
    <Link href="/" className={clasesBoton("primario", grande)} data-prueba="jugar">
      {contenido}
    </Link>
  );
}

function Pregunta({ p, r }: { p: string; r: string }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-semibold text-foreground"
      >
        {p}
        <motion.span animate={{ rotate: abierta ? 45 : 0 }} className="font-mono text-2xl leading-none text-[#9B85FF]">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: SUAVE }} className="overflow-hidden">
            <p className="pb-5 text-texto-secundario">{r}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPublica({ onJugar }: { onJugar?: () => void }) {
  const t = useTranslations("Presentacion");
  const locale = useLocale();
  const precios = preciosPresentacion(locale);
  const itemsGratis = t.raw("precios.gratis.items") as string[];
  const itemsPro = t.raw("precios.proItems") as string[];
  const itemsColegio = t.raw("colegios.items") as string[];
  const faq = t.raw("faq.items") as { p: string; r: string }[];

  return (
    <MotionConfig reducedMotion="never">
      <div className="noche-prodigia relative flex min-h-screen flex-col overflow-x-clip">
        <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-border bg-background">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <a href="#inicio" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
              <Logo size={28} colorAro="#7C5CFF" />
              Prodigia
            </a>
            <nav className="hidden items-center gap-7 text-sm font-medium text-texto-secundario md:flex">
              <a href="#ciudades" className="transition-colors hover:text-foreground">{t("nav.ciudades")}</a>
              <a href="#como" className="transition-colors hover:text-foreground">{t("nav.comoFunciona")}</a>
              <a href="#precios" className="transition-colors hover:text-foreground">{t("nav.precios")}</a>
              <a href="#colegios" className="transition-colors hover:text-foreground">{t("nav.colegios")}</a>
            </nav>
            <Link href="/login" className="text-sm font-semibold text-[#B9A8FF] hover:text-white" data-prueba="entrar">
              {t("nav.entrar")}
            </Link>
          </div>
        </header>

        <main id="inicio" className="flex flex-col">
          {/* Inicio: el letrero, la rueda y la ciudad de noche abajo. */}
          <section id="ciudades" className="relative scroll-mt-20 overflow-hidden">
            <Estrellas />
            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-36 pt-12 sm:px-6 md:grid-cols-[1fr_1.05fr] md:pb-44 md:pt-20">
              <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
                <h1 className="font-display font-bold leading-[1.02] tracking-tight">
                  <motion.span
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: SUAVE }}
                    className="block text-5xl text-foreground sm:text-7xl"
                  >
                    {t("hero.titulo")}
                  </motion.span>
                  <LetreroNeon texto={t("neon.hero")} color="#9B85FF" falla={4} retrasoBase={500} className="mt-2 block text-5xl sm:text-7xl" />
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: SUAVE }}
                  className="max-w-md text-lg text-texto-secundario"
                >
                  {t("hero.subtitulo")}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: SUAVE }}
                  className="flex flex-wrap items-center justify-center gap-3 md:justify-start"
                >
                  <BotonJugar onJugar={onJugar} grande>
                    {t("hero.jugar")}
                  </BotonJugar>
                  <Link href="/login" className={clasesBoton("secundario", true)}>
                    {t("hero.yaTengo")}
                  </Link>
                </motion.div>
                <p className="font-mono text-xs text-[#5A6488]">
                  {t("hero.etiqueta")} ·{" "}
                  <Link href="/descargar" className="underline-offset-4 hover:text-[#B9A8FF] hover:underline">
                    {t("hero.android")}
                  </Link>
                </p>
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: SUAVE }}>
                <RuedaCiudades />
              </motion.div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-40">
              <CiudadDeNoche colores={COLORES_CIUDAD} />
            </div>
          </section>

          {/* Cómo se juega: el ticket. */}
          <section id="como" className="scroll-mt-20 border-t border-border bg-[#0B0F1C] py-24 sm:py-32">
            <div className="mx-auto grid w-full max-w-5xl items-center gap-14 px-4 sm:px-6 md:grid-cols-2">
              <TicketPartida />
              <Encabezado alinear="izquierda" titulo={t("ticket.titulo")} texto={t("ticket.texto")} />
            </div>
          </section>

          {/* Con otros: cuatro letreros que se encienden. */}
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-24 sm:px-6 sm:py-32">
            <Encabezado titulo={t("competir.titulo")} />
            <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["rankeds", IconRango, "#9B85FF"],
                  ["amigos", IconJugar, "#4FE0F5"],
                  ["clanes", IconEscudo, "#2FD89B"],
                  ["retos", IconLlama, "#FF8A3D"],
                ] as const
              ).map(([clave, Icono, color], i) => (
                <div key={clave} className="group bg-background p-7 transition-colors hover:bg-[#0E1326]">
                  <CajaNeon color={color} retraso={i * 180} className="inline-flex">
                    <Icono className="h-9 w-9" />
                  </CajaNeon>
                  <h3 className="mt-6 font-display text-xl font-bold text-foreground">{t(`competir.${clave}.titulo`)}</h3>
                  <p className="mt-1 text-texto-secundario">{t(`competir.${clave}.texto`)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Precios: el plan recomendado lleva el tubo encendido. */}
          <section id="precios" className="scroll-mt-20 border-t border-border bg-[#0B0F1C] py-24 sm:py-32">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 sm:px-6">
              <Encabezado titulo={t("precios.titulo")} texto={t("precios.texto")} />
              <div className="grid items-stretch gap-5 lg:grid-cols-3">
                <TarjetaPrecio
                  retraso={0}
                  nombre={t("precios.gratis.nombre")}
                  precio={t("precios.gratis.precio")}
                  detalle={t("precios.gratis.detalle")}
                  items={itemsGratis}
                  accion={<BotonJugar onJugar={onJugar}>{t("precios.gratis.boton")}</BotonJugar>}
                />
                <TarjetaPrecio
                  retraso={0.1}
                  nombre={t("precios.mensual.nombre")}
                  precio={t("precios.mensual.precio", { precio: precios.mensual })}
                  detalle={t("precios.mensual.detalle")}
                  items={itemsPro}
                  accion={
                    <Link href="/pro" className={clasesBoton("secundario")}>
                      {t("precios.mensual.boton")}
                    </Link>
                  }
                />
                <TarjetaPrecio
                  retraso={0.2}
                  encendida
                  destacado={t("precios.anual.destacado")}
                  nombre={t("precios.anual.nombre")}
                  precio={t("precios.anual.precio", { precio: precios.anual })}
                  detalle={t("precios.anual.detalle", { ahorro: precios.ahorro })}
                  items={itemsPro}
                  accion={
                    <Link href="/pro" className={clasesBoton("primario")}>
                      {t("precios.anual.boton")}
                    </Link>
                  }
                />
              </div>
              <p className="text-center text-sm text-texto-secundario">{t("precios.sueltos", { mundo: precios.mundo, minimo: precios.minimo })}</p>
            </div>
          </section>

          {/* Colegios. */}
          <section id="colegios" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
            <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col gap-5">
                <Encabezado alinear="izquierda" titulo={t("colegios.titulo")} texto={t("colegios.texto")} />
                <ul className="flex flex-col gap-2.5">
                  {itemsColegio.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <IconCheck className="h-4 w-4 shrink-0 text-[#3DDC97]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Link href="/docentes/demo" className={clasesBoton("primario")} data-prueba="demo-docentes">
                    {t("colegios.demo")}
                  </Link>
                  <Link href="/docentes" className={clasesBoton("secundario")} data-prueba="colegios">
                    {t("colegios.boton")}
                  </Link>
                </div>
              </div>
              <Aparece retraso={0.1}>
                <MiniPanel />
              </Aparece>
            </div>
          </section>

          {/* Preguntas. */}
          <section className="border-t border-border bg-[#0B0F1C] py-24 sm:py-32">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 sm:px-6">
              <Encabezado titulo={t("faq.titulo")} />
              <div className="border-t border-border">
                {faq.map((f) => (
                  <Pregunta key={f.p} p={f.p} r={f.r} />
                ))}
              </div>
            </div>
          </section>

          {/* Cierre: otro letrero y la ciudad. */}
          <section className="relative overflow-hidden pt-24 sm:pt-32">
            <Estrellas cantidad={18} />
            <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-7 px-4 pb-44 text-center sm:px-6">
              <LetreroNeon texto={t("neon.final")} color="#4FE0F5" falla={2} semilla={3} className="font-display text-5xl font-bold sm:text-7xl" />
              <p className="text-lg text-texto-secundario">
                {t("final.titulo")}. {t("final.texto")}
              </p>
              <BotonJugar onJugar={onJugar} grande>
                {t("final.boton")}
              </BotonJugar>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32">
              <CiudadDeNoche colores={[...COLORES_CIUDAD].reverse()} />
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-background">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-8 text-sm text-texto-secundario md:flex-row sm:px-6">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <MamutHerdSello alto={24} />
              <span className="text-xs">{t("pie.hecho")}</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/docentes" className="hover:text-foreground">{t("pie.docentes")}</Link>
              <Link href="/descargar" className="hover:text-foreground">{t("pie.descargar")}</Link>
              <Link href="/privacidad" className="hover:text-foreground">{t("pie.privacidad")}</Link>
              <Link href="/terminos" className="hover:text-foreground">{t("pie.terminos")}</Link>
              <span>prodigia.oficial@gmail.com</span>
            </nav>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

function TarjetaPrecio({
  nombre,
  precio,
  detalle,
  items,
  accion,
  destacado,
  encendida,
  retraso,
}: {
  nombre: string;
  precio: string;
  detalle: string;
  items: string[];
  accion: ReactNode;
  destacado?: string;
  encendida?: boolean;
  retraso: number;
}) {
  return (
    <Aparece retraso={retraso} className="h-full">
      <div className={`relative flex h-full flex-col gap-6 rounded-3xl bg-background p-7 ${encendida ? "tubo-neon" : "border border-border"}`}>
        {destacado && (
          <span className="absolute -top-3 left-7 rounded-full border border-[#3A3F66] bg-[#171D34] px-3 py-1 font-mono text-[11px] text-[#D9D0FF]">{destacado}</span>
        )}
        <div>
          <p className="font-display text-lg font-semibold text-texto-secundario">{nombre}</p>
          <p className="mt-2 font-mono text-5xl font-bold tracking-tight text-foreground">{precio}</p>
          <p className="mt-1 text-sm text-texto-secundario">{detalle}</p>
        </div>
        <ul className="flex flex-1 flex-col gap-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-foreground">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-[#3DDC97]" />
              {item}
            </li>
          ))}
        </ul>
        {accion}
      </div>
    </Aparece>
  );
}
