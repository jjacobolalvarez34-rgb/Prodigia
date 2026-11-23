-- 0320: tutorial guiado por sección (2026-11-23, docs/PLAN_TUTORIAL_GUIADO.md).
-- Lo que cada jugador ya vio se guarda en su cuenta, así un recorrido visto en la web
-- no se repite en la app (y al revés). El cliente lee la columna de su propio perfil;
-- escribe solo con estas funciones. Idempotente.

alter table public.profiles add column if not exists tutoriales_vistos text[] not null default '{}';

create or replace function public.marcar_tutorial_visto(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_id is null or char_length(p_id) > 40 then
    return;
  end if;
  update public.profiles pr
  set tutoriales_vistos = array_append(pr.tutoriales_vistos, p_id)
  where pr.id = auth.uid() and not (p_id = any(pr.tutoriales_vistos));
end;
$$;
grant execute on function public.marcar_tutorial_visto(text) to authenticated;

-- «Ver los tutoriales otra vez».
create or replace function public.olvidar_tutoriales()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles pr set tutoriales_vistos = '{}' where pr.id = auth.uid();
end;
$$;
grant execute on function public.olvidar_tutoriales() to authenticated;
