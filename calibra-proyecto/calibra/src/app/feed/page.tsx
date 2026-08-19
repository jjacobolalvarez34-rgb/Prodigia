import { redirect } from "next/navigation";

// Fase 3 del rediseño de Social: Feed pasó a vivir dentro de /social
// (pestaña por default, ya no hace falta pasarle ?tab). Se deja este
// redirect para no romper links viejos guardados o compartidos — mismo
// patrón que /amigos y /profesor.
export default function FeedPage() {
  redirect("/social");
}
