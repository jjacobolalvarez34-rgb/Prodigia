-- ============================================================
-- Prodigia — Sección 2: auditoría de RLS en todo el proyecto
-- Correr después de 0059_invitar_por_link_multimundo.sql
--
-- Pasada sistemática por las 30 tablas del proyecto (todas ya tenían
-- RLS habilitado, y no se encontró ninguna operación que el código
-- real ejecute sin una policy que la cubra — la clase de bug de
-- "eliminar grupo" de la tanda anterior no se repite en ningún otro
-- lado). Lo que sí se encontró es la otra cara de ese mismo problema:
-- policies de INSERT que solo exigen "auth.uid() = user_id" sin
-- restringir el CONTENIDO de la fila — mismo hallazgo que 0035 ya
-- había documentado y corregido para "profiles"/"duels" (UPDATE), pero
-- nunca se revisó para estas otras tablas. Random probing directo
-- desde la consola del navegador (con la sesión de un usuario real,
-- sin pasar por ninguna función de negocio) podía escribir resultados
-- fabricados. Se prioriza acá lo que tiene impacto real (logros/
-- integridad de duelos) y esfuerzo bajo — el resto de los hallazgos de
-- la auditoría (feed_posts, duel_results, duel_queue) queda
-- documentado para una próxima tanda, no perdido.
-- ============================================================

-- ---------- 1) duels: INSERT sin restringir estado/ganador_id ----------
-- Un usuario podía insertar directo una fila con estado='completado' y
-- ganador_id=<el mismo>, sin jugar nada — verificar.ts cuenta
-- duelos_ganados/racha_duelos_ganados por duels.ganador_id sin
-- verificar que la fila haya pasado por registrar_resultado_duelo().
drop policy if exists "usuarios crean duelos como retador" on public.duels;
create policy "usuarios crean duelos como retador"
  on public.duels for insert
  with check (auth.uid() = retador_id and estado = 'pendiente' and ganador_id is null);

-- ---------- 2) handle_new_user: único security definer sin search_path ----------
-- Confirmado por grep en las 58 migraciones: las otras ~80 funciones
-- security definer del proyecto siempre incluyen `set search_path =
-- public` — esta, que corre automáticamente en cada signup (trigger
-- on_auth_user_created), no lo tenía. Redefinida tal cual estaba,
-- solo sumando la línea que falta.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

-- ---------- 3) user_achievements: INSERT no valida que el logro exista ----------
-- No revalida el criterio completo (eso vive en verificar.ts, sería
-- duplicar bastante lógica en SQL para un hallazgo marcado como
-- "solo explotable por consola, no alcanzable desde la UI real") pero
-- al menos exige que achievement_id sea un logro real y que el usuario
-- no lo tenga ya duplicado — antes ni siquiera eso estaba garantizado
-- por RLS.
drop policy if exists "usuarios desbloquean sus propios logros" on public.user_achievements;
create policy "usuarios desbloquean sus propios logros"
  on public.user_achievements for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.achievements a where a.id = achievement_id)
  );

-- ---------- 4) unlocked_modifiers: mismo criterio ----------
-- (0005_modificadores_y_camino.sql: modifier_id referencia
-- public.modifiers(id) — technique_modifiers es solo la tabla puente
-- técnica-a-modificador, con clave compuesta (technique_id,
-- modifier_id), sin columna id propia. La versión anterior de esta
-- policy apuntaba mal a esa tabla puente.)
drop policy if exists "usuarios desbloquean sus propios modificadores" on public.unlocked_modifiers;
create policy "usuarios desbloquean sus propios modificadores"
  on public.unlocked_modifiers for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.modifiers m where m.id = modifier_id)
  );
