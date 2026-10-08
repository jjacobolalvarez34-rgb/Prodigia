import { metadataMundo, PaginaDiagnosticoMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("vitalia", "diagnostico");

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <PaginaDiagnosticoMundo slug="vitalia" next={next} />;
}
