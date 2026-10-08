import { metadataMundo, PaginaElegirMundo } from "@/components/mundosNuevos/paginas";

export const generateMetadata = () => metadataMundo("dinamia", "elegir");

export default function Page() {
  return <PaginaElegirMundo slug="dinamia" />;
}
