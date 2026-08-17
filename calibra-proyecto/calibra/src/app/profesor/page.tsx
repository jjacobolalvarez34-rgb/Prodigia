import { redirect } from "next/navigation";

// Fase T2: Profesor se renombró "Grupos" y ahora vive dentro de
// /social (pestaña "Grupos"). Se deja este redirect para no romper
// links viejos guardados o compartidos. Las sub-rutas /profesor/[groupId]
// siguen existiendo tal cual — solo cambió el punto de entrada.
export default function ProfesorPage() {
  redirect("/social?tab=grupos");
}
