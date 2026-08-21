// Fase 7 ("Duelos: llevar el progreso en vivo...", Mundo de Clanes):
// nivel_clan es una curva RPG sin techo (ver nivel_desde_xp_clan en
// 0070_clanes_niveles_y_roles.sql, deliberadamente muy lenta), pero
// solo hay 5 ilustraciones de ciudad (public/clan_rangos/1.png..5.png,
// Asentamiento a Prodigio) — se bucketiza el nivel en 5 escalones.
export interface TierCiudad {
  tier: 1 | 2 | 3 | 4 | 5;
  nombre: string;
  imagen: string;
}

const TIERS: { nivelMin: number; nombre: string }[] = [
  { nivelMin: 1, nombre: "Asentamiento" },
  { nivelMin: 3, nombre: "Aldea" },
  { nivelMin: 6, nombre: "Ciudad" },
  { nivelMin: 11, nombre: "Metrópolis" },
  { nivelMin: 21, nombre: "Prodigio" },
];

export function tierCiudadDeNivel(nivelClan: number): TierCiudad {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (nivelClan >= TIERS[i].nivelMin) idx = i;
  }
  const tier = (idx + 1) as TierCiudad["tier"];
  return { tier, nombre: TIERS[idx].nombre, imagen: `/clan_rangos/${tier}.png` };
}
