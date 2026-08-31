import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

// Header minimalista para todo el flujo guiado de landing/demo (Fase 4
// del rediseño): a propósito SIN <Link> en el logo y SIN ningún link de
// nav — el pedido explícito fue que durante el flujo (elegir ciudad,
// mecanismo, sprint, tour, promo Pro, elegir 2 mundos) lo único
// clickeable sea el centro de la pantalla. El Header normal (Header.tsx)
// muestra /leaderboard, /tienda, /pro incluso para invitados, y esas
// rutas redirigen a /onboarding en cuanto detectan mundos_desbloqueados
// vacío — exactamente el bug reportado de "navegar durante el flujo
// termina pidiendo nombre". Acá no hay forma de generar ese click.
export default function HeaderFlujo() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
          <Logo size={26} colorAro="#6C4CF1" />
          Prodigia
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
