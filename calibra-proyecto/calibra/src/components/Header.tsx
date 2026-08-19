"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCasa } from "@/components/icons";
import Logo from "./Logo";
import MundoSelector from "./MundoSelector";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";

// Fase II: el color de acento del nav sigue al mundo en el que estás
// parado — no solo el ícono del tema, toda la interfaz "viaja" con vos.
function colorDelMundo(pathname: string): string {
  if (pathname.startsWith("/enigmia")) return "#0E9F6E";
  if (pathname.startsWith("/geografia")) return "#1E7A8C";
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

function LogoLink({ colorMundo }: { colorMundo: string }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground"
    >
      <Logo size={26} colorAro={colorMundo} />
      Prodigia
    </Link>
  );
}

export default function Header({ autenticado = false, invitado = false }: Props) {
  const pathname = usePathname();
  const colorMundo = colorDelMundo(pathname ?? "/");

  // Fase 3 del rediseño de Social: Feed pasó a vivir DENTRO de /social
  // (pestaña por default, con Amigos al lado) — ya no es un link
  // suelto. Grupos (ex "Profesor") volvió a tener su propio acceso acá,
  // separado de Social otra vez (con Social reducido a 2 pestañas, ya
  // no entraba como una tercera).
  const links = [
    { href: "/leaderboard", label: "Ranking" },
    { href: "/rankeds", label: "Rankeds" },
    { href: "/social", label: "Social" },
    { href: "/profesor", label: "Grupos" },
    { href: "/tienda", label: "Tienda" },
  ].filter((link) => !invitado || (link.href !== "/rankeds" && link.href !== "/social" && link.href !== "/profesor"));

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <LogoLink colorMundo={colorMundo} />
          {autenticado && <MundoSelector />}
        </div>
        {/* flex-wrap en vez de overflow-x-auto a propósito: un contenedor
            con overflow-x distinto de "visible" recorta también en el eje Y
            (aunque no se pida), lo que cortaba cualquier desplegable
            posicionado debajo de un link (el menú de cuenta, el tour que
            ya se sacó). Envolver a una segunda línea evita ese problema
            de raíz en vez de pelear con combinaciones de overflow-x/y. */}
        <nav className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-5">
          {autenticado && (
            <Link
              href="/"
              aria-label="Inicio"
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
                className={`shrink-0 whitespace-nowrap text-sm transition-colors ${
                  activo ? "font-semibold" : "font-medium text-texto-secundario hover:text-foreground"
                }`}
                style={activo ? { color: colorMundo } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          {autenticado ? <ProfileMenu /> : <ThemeToggle />}
        </nav>
      </div>
    </header>
  );
}
