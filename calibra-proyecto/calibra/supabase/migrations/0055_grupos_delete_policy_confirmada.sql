-- ============================================================
-- Prodigia — confirma la policy de DELETE en groups
-- Correr después de 0054_tienda_rediseno.sql
--
-- Diagnóstico del bug "Eliminar grupo no borra": 0014_plan_academico.sql
-- creó `groups` con RLS habilitado pero SIN policy de DELETE — sin
-- ninguna policy que la permita, Postgres deniega el delete por
-- default, y .delete() de supabase-js no devuelve error cuando RLS
-- filtra las 0 filas que matchean: se ve exactamente igual a "borrado
-- con éxito". 0023_fix_recursion_grupos.sql ya había agregado la policy
-- correcta, pero si esa migración no llegó a correr contra la base real
-- (el patrón de esta sesión: varias migraciones quedaron escritas pero
-- no ejecutadas), el bug seguiría vivo hoy sin que el código tenga nada
-- mal. Esta migración re-asegura la policy de forma idempotente
-- (drop + create, mismo patrón ya usado en todo el proyecto) para que
-- correrla sea segura sin importar si 0023 ya se aplicó o no.
-- ============================================================

drop policy if exists "profesores borran sus propios grupos" on public.groups;
create policy "profesores borran sus propios grupos"
  on public.groups for delete
  using (auth.uid() = profesor_id);
