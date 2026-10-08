import { redirect } from "next/navigation";
import { CONFIG_MUNDOS_NUEVOS } from "@/lib/mundosNuevos/config";

// /vitalia/practica lleva al primer modo (los duelos usan /vitalia/practica/<modo>).
export default async function Page({ searchParams }: { searchParams: Promise<{ duelo?: string }> }) {
  const { duelo } = await searchParams;
  redirect(`/vitalia/practica/${CONFIG_MUNDOS_NUEVOS.vitalia.modos[0]}${duelo ? `?duelo=${duelo}` : ""}`);
}
