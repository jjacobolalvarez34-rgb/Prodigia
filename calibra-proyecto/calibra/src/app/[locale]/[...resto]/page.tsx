import { notFound } from "next/navigation";

// Cualquier ruta que no existe dentro de [locale] cae acá y muestra el 404 de
// Prodigia (app/[locale]/not-found.tsx).
export default function RutaInexistente() {
  notFound();
}
