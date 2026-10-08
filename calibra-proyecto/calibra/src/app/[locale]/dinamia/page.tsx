import { metadataMundo, PaginaHubMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("dinamia", "hub");

export default function Page() {
  return <PaginaHubMundo slug="dinamia" />;
}
