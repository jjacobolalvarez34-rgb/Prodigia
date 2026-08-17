import { redirect } from "next/navigation";

// Fase T2: Amigos ahora vive dentro de /social (pestaña "Amigos"),
// junto con Grupos (ex Profesor). Se deja este redirect para no romper
// links viejos guardados o compartidos.
export default function AmigosPage() {
  redirect("/social?tab=amigos");
}
