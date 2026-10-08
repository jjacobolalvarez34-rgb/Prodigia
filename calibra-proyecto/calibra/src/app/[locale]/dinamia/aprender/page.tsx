import { metadataMundo, PaginaAprenderMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("dinamia", "aprender");

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  return <PaginaAprenderMundo slug="dinamia" tab={tab} />;
}
