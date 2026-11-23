"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MotionConfig, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import MamutHerdSello from "@/components/MamutHerdSello";
import { IconCheck, IconLibro, IconObjetivo, IconCampana, IconEstadistica } from "@/components/icons";
import { Aparece, Encabezado, MiniPanel, SUAVE, clasesBoton } from "@/components/landing/piezas";
import { CajaNeon, Estrellas, LetreroNeon } from "@/components/landing/neon";
import LeadColegioForm from "./LeadColegioForm";

// /docentes (piloto para colegios, 2026-11-23): la página de venta a colegios, con el
// mismo lenguaje visual que la presentación. «Crear mi curso» lleva al panel docente
// (con sesión) o al login; «Pedir el piloto» baja al formulario de siempre.
export default function DocentesLanding({ conSesion, cabecera }: { conSesion: boolean; cabecera?: ReactNode }) {
  const t = useTranslations("Docentes.v2");
  const tPie = useTranslations("Presentacion.pie");
  const itemsDocente = t.raw("planes.docente.items") as string[];
  const itemsColegio = t.raw("planes.colegio.items") as string[];
  const hrefPanel = conSesion ? "/profesor" : "/login?next=/profesor";

  return (
    <MotionConfig reducedMotion="never">
      <div className="noche-prodigia relative isolate flex min-h-screen flex-col overflow-x-clip">
        {cabecera ?? (
          <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-border bg-background">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
                <Logo size={28} colorAro="#6C4CF1" />
                Prodigia
              </Link>
              <div className="flex items-center gap-3">
                <Link href={hrefPanel} className="text-sm font-semibold text-[#B9A8FF] hover:text-white">
                  {t("hero.irPanel")}
                </Link>
              </div>
            </div>
          </header>
        )}

        <main className="flex flex-col gap-28 pb-20 sm:gap-36">
          <section className="relative">
            <Estrellas />
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-24">
              <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
                <LetreroNeon texto={t("hero.etiqueta")} color="#2FD89B" falla={3} className="font-display text-2xl font-bold sm:text-3xl" />
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: SUAVE }}
                  className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
                >
                  {t("hero.titulo")}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: SUAVE }}
                  className="max-w-lg text-lg text-texto-secundario"
                >
                  {t("hero.texto")}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.45, ease: SUAVE }}
                  className="flex flex-wrap items-center justify-center gap-3 md:justify-start"
                >
                  <Link href={hrefPanel} className={clasesBoton("primario", true)}>
                    {conSesion ? t("hero.irPanel") : t("hero.crear")}
                  </Link>
                  <a href="#contacto" className={clasesBoton("secundario", true)}>
                    {t("hero.piloto")}
                  </a>
                  <Link href="/docentes/demo" className="font-display text-base font-semibold text-[#B9A8FF] underline-offset-4 hover:text-white hover:underline" data-prueba="demo-docentes">
                    {t("demo.boton")}
                  </Link>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: SUAVE }}>
                <MiniPanel />
              </motion.div>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <Encabezado titulo={t("funciones.titulo")} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["tareas", <IconObjetivo key="t" className="h-6 w-6" />, "#6C4CF1"],
                  ["panel", <IconEstadistica key="p" className="h-6 w-6" />, "#06B6D4"],
                  ["alertas", <IconCampana key="a" className="h-6 w-6" />, "#FF8A3D"],
                  ["informe", <IconLibro key="i" className="h-6 w-6" />, "#0E9F6E"],
                ] as const
              ).map(([clave, icono, color], i) => (
                <Aparece key={clave} retraso={i * 0.08}>
                  <div className="h-full rounded-3xl border border-border bg-background p-6 transition-colors hover:bg-[#0E1326]">
                    <CajaNeon color={color} retraso={i * 180} className="inline-flex [&_svg]:h-9 [&_svg]:w-9">
                      {icono}
                    </CajaNeon>
                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">{t(`funciones.${clave}.titulo`)}</h3>
                    <p className="mt-1 text-sm text-texto-secundario">{t(`funciones.${clave}.texto`)}</p>
                  </div>
                </Aparece>
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <Encabezado titulo={t("pasos.titulo")} />
            <div className="relative grid gap-6 md:grid-cols-3">
              <motion.div
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-10 hidden h-0.5 origin-left bg-gradient-to-r from-primario via-[#06B6D4] to-correcto md:block"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.2, ease: SUAVE, delay: 0.2 }}
              />
              {(["p1", "p2", "p3"] as const).map((p, i) => (
                <Aparece key={p} retraso={0.15 + i * 0.2} className="relative flex flex-col items-center text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primario font-display text-3xl font-black text-white shadow-[0_16px_40px_-14px_color-mix(in_oklab,var(--primario)_85%,transparent)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-foreground">{t(`pasos.${p}.titulo`)}</h3>
                  <p className="mt-1 text-texto-secundario">{t(`pasos.${p}.texto`)}</p>
                </Aparece>
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 sm:px-6">
            <Encabezado titulo={t("planes.titulo")} />
            <div className="grid gap-4 md:grid-cols-2">
              <Plan
                nombre={t("planes.docente.nombre")}
                precio={t("planes.docente.precio")}
                items={itemsDocente}
                accion={
                  <Link href={hrefPanel} className={clasesBoton("secundario")}>
                    {t("planes.docente.boton")}
                  </Link>
                }
              />
              <Plan
                destacado={t("planes.colegio.destacado")}
                nombre={t("planes.colegio.nombre")}
                precio={t("planes.colegio.precio")}
                detalle={t("planes.colegio.detalle")}
                items={itemsColegio}
                accion={
                  <a href="#contacto" className={clasesBoton("primario")}>
                    {t("planes.colegio.boton")}
                  </a>
                }
              />
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-2xl scroll-mt-24 flex-col gap-8 px-4 sm:px-6">
            <Encabezado titulo={t("contacto.titulo")} />
            <Aparece>
              <LeadColegioForm />
            </Aparece>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-8 text-sm text-texto-secundario md:flex-row sm:px-6">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <MamutHerdSello alto={24} />
              <span className="text-xs">{tPie("hecho")}</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/conoce" className="hover:text-foreground">Prodigia</Link>
              <Link href="/privacidad" className="hover:text-foreground">{tPie("privacidad")}</Link>
              <Link href="/terminos" className="hover:text-foreground">{tPie("terminos")}</Link>
              <span>prodigia.oficial@gmail.com</span>
            </nav>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

function Plan({ nombre, precio, detalle, items, accion, destacado }: { nombre: string; precio: string; detalle?: string; items: string[]; accion: ReactNode; destacado?: string }) {
  return (
    <Aparece className="h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={`relative flex h-full flex-col gap-6 rounded-3xl border bg-background p-7 ${
          destacado ? "tubo-neon border-0" : "border-border"
        }`}
      >
        {destacado && <span className="absolute -top-3 left-7 rounded-full border border-[#3A3F66] bg-[#171D34] px-3 py-1 font-mono text-[11px] text-[#D9D0FF]">{destacado}</span>}
        <div>
          <p className="font-display text-lg font-bold text-foreground">{nombre}</p>
          <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground">{precio}</p>
          {detalle && <p className="mt-1 text-sm text-texto-secundario">{detalle}</p>}
        </div>
        <ul className="flex flex-1 flex-col gap-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-correcto" />
              {item}
            </li>
          ))}
        </ul>
        {accion}
      </motion.div>
    </Aparece>
  );
}
