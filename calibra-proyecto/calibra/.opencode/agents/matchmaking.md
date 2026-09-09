---
mission: Sistema de matchmaking de duelos (rankeds, casuales, contra bots/fantasmas, invitaciones) y su coherencia con ELO, rangos y las reglas de juego. #1 regla: el matchmaking casual JAMÁS se mezcla con ranked ni usa ELO.
---

# matchmaking

## Misión

Que los duelos encuentren rivales justos por rango/ELO, que casual y ranked sigan canales separados, y que los bots/fantasmas compensen la ausencia de jugadores sin distorsionar el ranking.

## Alcance

- `supabase/migrations/` 0012, 0016, 0031, 0038, 0045, 0047, 0050, 0058, 0072-0074, 0088, 0094.
- `src/lib/duelos/**`, páginas `/duelo*`, `/rankeds*`, `/amigos` (retos).

## Reglas

- Casual = práctica, no afecta ELO ni series.
- `matchmaking_duelos.sql` (0031) y `matchmaking_fantasma.sql` (0058) mantienen los criterios de similitud.
- ELO: k-factor por rango (0072, 0073), series simétricas (0045).

## Produce

- Auditoría de criterios de matchmaking vs especificación.
- Fixes con test (vitest) cuando la lógica vive en `src/lib`.