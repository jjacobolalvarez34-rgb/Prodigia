-- ============================================================
-- Prodigia — nombre de usuario único (Fase O3)
-- Correr después de 0036_fix_permisos_xp_tienda.sql
--
-- El email ya es único (lo garantiza auth.users de Supabase — signUp ya
-- rechaza un email repetido, ver src/app/registro/RegistroForm.tsx). Lo
-- que faltaba es display_name: hoy dos cuentas pueden tener exactamente
-- el mismo nombre, sin ningún aviso. Se agrega un índice único
-- case-insensitive (para que "Juan" y "juan" cuenten como el mismo
-- nombre) sobre profiles.display_name.
--
-- ⚠️ IMPORTANTE — leer antes de correr en producción:
-- Si esto falla con "could not create unique index ... duplicate key
-- value violates" es porque YA existen dos o más cuentas reales con el
-- mismo display_name (sin distinguir mayúsculas). Corré esto primero
-- para encontrarlas:
--
--   select lower(display_name) as nombre, count(*), array_agg(id) as ids
--   from public.profiles
--   where display_name is not null
--   group by lower(display_name)
--   having count(*) > 1;
--
-- Para cada grupo, decidí a mano qué cuenta se queda con el nombre
-- "de fábrica" y renombrá las demás, por ejemplo:
--
--   update public.profiles set display_name = display_name || '2'
--   where id = '<uuid de la cuenta a renombrar>';
--
-- Recién ahí volvé a correr esta migración completa.
-- ============================================================

create unique index if not exists profiles_display_name_lower_idx
  on public.profiles (lower(display_name))
  where display_name is not null;
