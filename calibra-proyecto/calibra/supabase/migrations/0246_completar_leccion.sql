-- ============================================================
-- 0246 — completar_leccion: completar una lección de Aprender desde la app.
--
-- Hace en la base exactamente lo mismo que /api/aprender/completar y
-- /api/enigmia/completar-leccion de la web (que la app Android no puede usar,
-- porque llama directo a Supabase):
--   1. si la lección tiene quiz y es una Clase (requiere_pro), exige plan Pro;
--   2. valida cada respuesta contra contenido.quiz[i].respuesta (o la de
--      contenido_en, misma posición: la persona responde con lo que vio);
--   3. si alguna está mal NO toca el progreso y devuelve qué preguntas fallaron;
--   4. si todo está bien, marca la lección como dominada (+1 intento) y, en las
--      lecciones de `techniques`, desbloquea sus modificadores.
-- Una lección sin quiz se completa siempre (igual que en la web).
-- p_tabla: 'techniques' (12 mundos) o 'logic_techniques' (Enigmia).
-- Los logros y títulos los sigue verificando el cliente después (igual que tras
-- una partida), con las mismas funciones de la web.
-- ============================================================

create or replace function public.completar_leccion(p_tabla text, p_technique_id uuid, p_respuestas text[] default null)
returns table (aprobado boolean, incorrectas integer[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_contenido jsonb;
  v_contenido_en jsonb;
  v_requiere_pro boolean;
  v_quiz jsonb;
  v_quiz_en jsonb;
  v_total integer;
  v_malas integer[] := '{}';
  v_resp text;
  i integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  if p_tabla = 'techniques' then
    select t.contenido, t.contenido_en, coalesce(t.requiere_pro, false)
      into v_contenido, v_contenido_en, v_requiere_pro
    from public.techniques t where t.id = p_technique_id;
  elsif p_tabla = 'logic_techniques' then
    select t.contenido, t.contenido_en, coalesce(t.requiere_pro, false)
      into v_contenido, v_contenido_en, v_requiere_pro
    from public.logic_techniques t where t.id = p_technique_id;
  else
    raise exception 'tabla de lecciones inválida';
  end if;

  if v_contenido is null then
    raise exception 'lección no encontrada';
  end if;

  v_quiz := coalesce(v_contenido->'quiz', '[]'::jsonb);
  v_quiz_en := v_contenido_en->'quiz';
  if jsonb_typeof(v_quiz) <> 'array' then
    v_quiz := '[]'::jsonb;
  end if;
  v_total := jsonb_array_length(v_quiz);

  if v_total > 0 then
    if v_requiere_pro and not exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'pro') then
      raise exception 'esta lección requiere plan Pro';
    end if;

    for i in 0 .. v_total - 1 loop
      v_resp := case when p_respuestas is not null and array_length(p_respuestas, 1) >= i + 1 then p_respuestas[i + 1] else null end;
      if v_resp is null
        or not (
          v_resp = (v_quiz->i->>'respuesta')
          or (v_quiz_en is not null and jsonb_typeof(v_quiz_en) = 'array' and v_resp = (v_quiz_en->i->>'respuesta'))
        ) then
        v_malas := array_append(v_malas, i);
      end if;
    end loop;

    if coalesce(array_length(p_respuestas, 1), 0) <> v_total or array_length(v_malas, 1) > 0 then
      return query select false, v_malas;
      return;
    end if;
  end if;

  if p_tabla = 'techniques' then
    insert into public.technique_progress as tp (user_id, technique_id, dominado, intentos, updated_at)
    values (v_user, p_technique_id, true, 1, now())
    on conflict (user_id, technique_id)
    do update set dominado = true, intentos = tp.intentos + 1, updated_at = now();

    insert into public.unlocked_modifiers (user_id, modifier_id)
    select v_user, tm.modifier_id
    from public.technique_modifiers tm
    where tm.technique_id = p_technique_id
    on conflict do nothing;
  else
    insert into public.logic_technique_progress as tp (user_id, technique_id, dominado, intentos, updated_at)
    values (v_user, p_technique_id, true, 1, now())
    on conflict (user_id, technique_id)
    do update set dominado = true, intentos = tp.intentos + 1, updated_at = now();
  end if;

  return query select true, '{}'::integer[];
end;
$$;

grant execute on function public.completar_leccion(text, uuid, text[]) to authenticated;
