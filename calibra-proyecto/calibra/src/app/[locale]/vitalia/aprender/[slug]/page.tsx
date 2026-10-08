import { PaginaLeccionMundo } from "@/components/mundosNuevos/paginas";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PaginaLeccionMundo slug="vitalia" leccion={slug} />;
}
