import { metadataMundo, PaginaElegirMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("vitalia", "elegir");

export default function Page() {
  return <PaginaElegirMundo slug="vitalia" />;
}
