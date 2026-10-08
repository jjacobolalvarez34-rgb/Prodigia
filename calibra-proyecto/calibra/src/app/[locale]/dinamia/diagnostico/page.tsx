import { metadataMundo, PaginaDiagnosticoMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("dinamia", "diagnostico");

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <PaginaDiagnosticoMundo slug="dinamia" next={next} />;
}
