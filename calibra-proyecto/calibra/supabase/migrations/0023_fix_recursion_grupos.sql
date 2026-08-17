-- ============================================================
-- Prodigia — arregla "infinite recursion detected in policy" en groups
-- Correr después de 0022_geografia.sql
--
-- Causa: la policy de SELECT de `groups` ("miembros ven los grupos...")
-- consulta `group_members`, y la policy de SELECT de `group_members`
-- ("profesores ven miembros de sus grupos") consulta `groups` de
-- vuelta — un ciclo. Postgres tiene que evaluar RLS de una tabla para
-- resolver RLS de la otra, y así indefinidamente.
--
-- Arreglo estándar: mover el chequeo cruzado a funciones security
-- definer. Al ejecutarse con los privilegios del dueño (no del rol
-- `authenticated`), esas consultas internas no vuelven a disparar RLS
-- de la otra tabla, así que el ciclo se corta ahí.
-- ============================================================

create function public.es_miembro_de_grupo(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = p_group_id and gm.user_id = p_user_id
  );
$$;

grant execute on function public.es_miembro_de_grupo(uuid, uuid) to authenticated;

create function public.es_profesor_del_grupo(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.groups g
    where g.id = p_group_id and g.profesor_id = p_user_id
  );
$$;

grant execute on function public.es_profesor_del_grupo(uuid, uuid) to authenticated;

drop policy "miembros ven los grupos a los que pertenecen" on public.groups;
create policy "miembros ven los grupos a los que pertenecen"
  on public.groups for select
  using (public.es_miembro_de_grupo(id, auth.uid()));

drop policy "profesores ven miembros de sus grupos" on public.group_members;
create policy "profesores ven miembros de sus grupos"
  on public.group_members for select
  using (public.es_profesor_del_grupo(group_id, auth.uid()));

-- Faltaba la policy de DELETE en groups (0014 no la incluyó) — hace
-- falta para poder borrar un grupo. group_members.group_id ya tiene
-- "on delete cascade", así que borrar el grupo borra las membresías solo.
create policy "profesores borran sus propios grupos"
  on public.groups for delete
  using (auth.uid() = profesor_id);
