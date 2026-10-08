import { redirect } from "next/navigation";
import { CONFIG_MUNDOS_NUEVOS } from "@/lib/mundosNuevos/config";

// /dinamia/practica lleva al primer modo (los duelos usan /dinamia/practica/<modo>).
export default async function Page({ searchParams }: { searchParams: Promise<{ duelo?: string }> }) {
  const { duelo } = await searchParams;
  redirect(`/dinamia/practica/${CONFIG_MUNDOS_NUEVOS.dinamia.modos[0]}${duelo ? `?duelo=${duelo}` : ""}`);
}
