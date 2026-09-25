"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { IconCasa, IconFlechaAtras } from "@/components/icons";
import { useTrackearPresenciaGlobal } from "@/lib/presencia/useTrackearPresenciaGlobal";
import { usePedirConfirmacionSalida } from "@/lib/navegacion/guardiaSalida";
import { useMensajesNoLeidos } from "@/lib/mensajes/MensajesNoLeidos";
import { textoInsignia } from "@/lib/mensajes/util";
import RecordatorioInvitado from "./RecordatorioInvitado";
import PedirEdadModal from "./PedirEdadModal";
import Logo from "./Logo";
import MundoSelector from "./MundoSelector";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";

// Fase II: el color de acento del nav sigue al mundo en el que estás
// parado — no solo el ícono del tema, toda la interfaz "viaja" contigo.
function colorDelMundo(pathname: string): string {
  if (pathname.startsWith("/enigmia")) return "#0E9F6E";
  if (pathname.startsWith("/geografia")) return "#1E7A8C";
  if (pathname.startsWith("/quimia")) return "#C026D3";
  if (pathname.startsWith("/anatomia")) return "#8B2942";
  if (pathname.startsWith("/melodia")) return "#B8860B";
  if (pathname.startsWith("/trigonometria")) return "#84CC16";
  if (pathname.startsWith("/historia")) return "#A0522D";
  if (pathname.startsWith("/calculia")) return "#4338CA";
  if (pathname.startsWith("/circuitia")) return "#F59E0B";
  if (pathname.startsWith("/estadistica")) return "#0D9488";
  if (pathname.startsWith("/naipia")) return "#B91C1C";
  if (pathname.startsWith("/codia")) return "#06B6D4";
  return "#6C4CF1"; // Numeria y el resto de Prodigia (fuera de un mundo) usan el violeta de marca
}

interface Props {
  autenticado?: boolean;
  // El tour guiado de onboarding (Fase W) se desactivó — PrimeraVezTip
  // quedaba con un tip pegado sin forma confiable de reproducir/depurar
  // el problema desde acá (sin consola del navegador a mano). El prop
  // se deja para no romper a page.tsx, pero ya no hace nada.
  mostrarTour?: boolean;
  // Un invitado (sesión anónima) no tiene acceso a Rankeds ni a Social —
  // ver src/lib/auth/guard.ts (bloquearInvitado). Se sacan esos links del
  // nav para no mandarlo a un link que solo lo va a rebotar.
  invitado?: boolean;
}

function LogoLink({ colorMundo, onClic }: { colorMundo: string; onClic: (e: React.MouseEvent, href: string) => void }) {
  return (
    <Link
      href="/"
      onClick={(e) => onClic(e, "/")}
      className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground"
    >
      <Logo size={26} colorAro={colorMundo} />
      Prodigia
    </Link>
  );
}

// Pedido 2026-09-24 (referencia visual): "no hay como devolverse a la
// página anterior, siempre toca volver al menú principal". Flechita chica,
// mismo estilo de placa circular que Boton (rediseño 2026-09-24), que hace
// un `router.back()` real en vez de saltar siempre a "/" — respeta la
// guardia de salida (BotonRendirse.tsx / GuardiaSalidaProvider) igual que
// cualquier otro link del Header. Oculta en "/" (no hay a dónde volver).
function BotonVolverAtras({ colorMundo }: { colorMundo: string }) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const pedirConfirmacion = usePedirConfirmacionSalida();
  if (pathname === "/") return null;
  return (
    <button
      type="button"
      aria-label={t("volver")}
      onClick={() => pedirConfirmacion(() => router.back())}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-texto-secundario transition-colors hover:border-[color-mix(in_oklab,var(--boton-acento)_60%,var(--border))] hover:text-foreground"
      style={{ ["--boton-acento" as string]: colorMundo }}
    >
      <IconFlechaAtras className="h-4 w-4" />
    </button>
  );
}

export default function Header({ autenticado = false, invitado = false }: Props) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const pedirConfirmacion = usePedirConfirmacionSalida();
  const colorMundo = colorDelMundo(pathname ?? "/");

  // Pedido 2026-09-24: cualquier click en el Header (casita, logo, links)
  // primero pasa por la guardia de salida — si hay una partida o una
  // lección en curso, `pedirConfirmacion` abre el modal en vez de navegar
  // y acá se frena la navegación normal del <Link>.
  function manejarClic(e: React.MouseEvent, href: string) {
    const interceptado = pedirConfirmacion(() => router.push(href));
    if (interceptado) e.preventDefault();
  }
  // Rankeds ("usuarios en línea"): Header renderiza en toda página
  // autenticada, así que trackear presencia acá alcanza para reflejar
  // actividad de la app entera, no solo de quien está mirando Rankeds
  // en ese momento. El hook mismo no hace nada si no hay sesión real
  // (landing pública con autenticado=false igual la llama, sin efecto).
  useTrackearPresenciaGlobal();
  // Avisos de mensajes nuevos: insignia en Social (directos) y en Clanes (chat del clan).
  const { noLeidosDirectos, noLeidosClan } = useMensajesNoLeidos();
  const sinLeerPorLink: Record<string, number> = { "/social": noLeidosDirectos, "/clanes": noLeidosClan };

  // Fase 3 del rediseño de Social: Feed pasó a vivir DENTRO de /social
  // (pestaña por default, con Amigos al lado) — ya no es un link
  // suelto. Grupos (ex "Profesor") volvió a tener su propio acceso acá,
  // separado de Social otra vez (con Social reducido a 2 pestañas, ya
  // no entraba como una tercera).
  // Fase 8 (tanda "Clanes: bugs y sistemas faltantes"): Grupos
  // desactivado temporalmente — sacado del nav, código intacto
  // (/profesor sigue existiendo, solo no se linkea desde acá).
  const links = [
    { href: "/leaderboard", label: t("ranking") },
    { href: "/rankeds", label: t("rankeds") },
    { href: "/social", label: t("social") },
    { href: "/clanes", label: t("clanes") },
    { href: "/tienda", label: t("tienda") },
    { href: "/pro", label: t("pro") },
  ].filter((link) => !invitado || (link.href !== "/rankeds" && link.href !== "/social" && link.href !== "/clanes"));

  return (
    <header className="border-b border-border">
      {invitado && <RecordatorioInvitado />}
      {autenticado && !invitado && <PedirEdadModal />}
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {autenticado && <BotonVolverAtras colorMundo={colorMundo} />}
          <LogoLink colorMundo={colorMundo} onClic={manejarClic} />
          {autenticado && <MundoSelector />}
        </div>
        {/* flex-wrap en vez de overflow-x-auto a propósito: un contenedor
            con overflow-x distinto de "visible" recorta también en el eje Y
            (aunque no se pida), lo que cortaba cualquier desplegable
            posicionado debajo de un link (el menú de cuenta, el tour que
            ya se sacó). Envolver a una segunda línea evita ese problema
            de raíz en vez de pelear con combinaciones de overflow-x/y.
            Pedido en vivo (2026-09-15): "el encabezado es grande en
            celular" — gap-y más chico en mobile (las filas envueltas
            quedan más pegadas), vuelve al espaciado normal desde sm. */}
        <nav className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-1 sm:gap-x-5 sm:gap-y-2">
          {autenticado && (
            <Link
              href="/"
              onClick={(e) => manejarClic(e, "/")}
              aria-label={t("inicio")}
              className="shrink-0 text-texto-secundario transition-colors hover:text-foreground"
              style={pathname === "/" ? { color: colorMundo } : undefined}
            >
              <IconCasa className="h-5 w-5" />
            </Link>
          )}
          {links.map((link) => {
            const activo = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => manejarClic(e, link.href)}
                className={`shrink-0 whitespace-nowrap text-sm transition-colors ${
                  activo ? "font-semibold" : "font-medium text-texto-secundario hover:text-foreground"
                }`}
                style={activo ? { color: colorMundo } : undefined}
              >
                {link.label}
                {autenticado && (sinLeerPorLink[link.href] ?? 0) > 0 && (
                  <span
                    role="status"
                    aria-label={t("mensajesSinLeer", { n: sinLeerPorLink[link.href] })}
                    className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primario px-1 align-middle text-[10px] font-bold leading-none text-white"
                  >
                    {textoInsignia(sinLeerPorLink[link.href])}
                  </span>
                )}
              </Link>
            );
          })}
          {autenticado ? <ProfileMenu /> : <ThemeToggle />}
        </nav>
      </div>
    </header>
  );
}
