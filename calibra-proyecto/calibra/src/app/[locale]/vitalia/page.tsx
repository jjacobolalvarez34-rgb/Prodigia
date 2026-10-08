import { metadataMundo, PaginaHubMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("vitalia", "hub");

export default function Page() {
  return <PaginaHubMundo slug="vitalia" />;
}
