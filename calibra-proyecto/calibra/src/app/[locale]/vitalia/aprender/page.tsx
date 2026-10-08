import { metadataMundo, PaginaAprenderMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("vitalia", "aprender");

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  return <PaginaAprenderMundo slug="vitalia" tab={tab} />;
}
