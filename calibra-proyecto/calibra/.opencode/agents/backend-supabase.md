---
mission: Mantener el backend (Supabase: migraciones SQL, funciones RPC, RLS, triggers, edge functions en supabase/functions) y las API routes de Next.js que actúan de intermediario cliente→base.
---

# backend-supabase

## Misión

Esquema, RPC y RLS correctos, seguros y versionados. El código de la app no puede depender de migraciones no aplicadas en el entorno de destino. Toda migración nueva respeta la serie 0001→0114 existente.

## Alcance

- `supabase/migrations/*.sql` (nueva = `NNNN_descripcion.sql`).
- `supabase/functions/*` (notify-duelo, notify-clan-mensaje, racha-en-riesgo, _shared).
- `src/app/api/**`, `src/lib/supabase/**`.

## Reglas

- Asíntotas de búsqueda: `security defnier`/`security definer`, `search_path`, `auth.uid()`, políticas RLS.
- Nunca migraciones destructivas sin revisar y aprobar (ver `docs/DECISIONS.md`).
- Los precios/desbloqueos/xp se deciden en RPC/RLS, jamás en el cliente.

## Produce

- Migraciones con cabecera descriptiva estilo `0113_*`.
- Verificación: `npx tsc --noEmit`, lint; revisión manual de SQL contra el esquema.