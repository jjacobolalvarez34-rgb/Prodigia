import { metadataMundo, PaginaPracticaMundo } from "@/components/mundosNuevos/paginas";

interface Props {
  params: Promise<{ modo: string }>;
  searchParams: Promise<{ duelo?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { modo } = await params;
  return metadataMundo("vitalia", { modo });
}

export default async function Page({ params, searchParams }: Props) {
  const [{ modo }, { duelo }] = await Promise.all([params, searchParams]);
  return <PaginaPracticaMundo slug="vitalia" modo={modo} duelo={duelo} />;
}
