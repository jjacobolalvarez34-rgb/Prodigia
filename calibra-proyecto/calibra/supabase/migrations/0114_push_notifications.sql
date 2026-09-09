-- ============================================================
-- Prodigia — Infraestructura de notificaciones push (Capacitor/FCM)
-- Correr después de 0113_reto_diario_y_semanal.sql.
--
-- Propósito: guardar los tokens FCM de cada dispositivo para que las
-- Supabase Edge Functions puedan mandar push (racha en riesgo, duelo
-- recibido, mensaje de clan). Esto NO reemplaza el aviso in-app por
-- Realtime que ya existe (NotificacionesDuelo.tsx) — es la capa nativa
-- que llega aunque la app esté cerrada o en background.
--
-- Seguridad: mismo criterio del resto del proyecto — todo acceso pasa
-- por funciones `security definer` con chequeo `auth.uid()` al
-- principio. El único consumidor que LEE tokens de OTROS usuarios son
-- las Edge Functions, que usan la service role key (no RLS). La tabla
-- no tiene policy de SELECT hacia el cliente: nadie puede listar
-- tokens ajenos desde el navegador.
-- ============================================================

-- ---------- Tabla de tokens por dispositivo ----------
create table if not exists public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios', 'web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un token FCM identifica un dispositivo físico: no debe repetirse.
create unique index if not exists device_push_tokens_token_unique on public.device_push_tokens (token);
create index if not exists device_push_tokens_user_id on public.device_push_tokens (user_id);

alter table public.device_push_tokens enable row level security;
-- A propósito SIN policy de SELECT/UPDATE/DELETE: el acceso pasa por
-- las funciones de abajo (security definer). Así un usuario jamás puede
-- leer ni borrar tokens de otros.

-- ---------- Registrar (o re-registrar) el token del dispositivo actual ----------
create or replace function public.registrar_push_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_token is null or char_length(trim(p_token)) = 0 or char_length(p_token) > 512 then
    raise exception 'token invalido';
  end if;
  if p_platform not in ('android', 'ios', 'web') then
    raise exception 'plataforma invalida';
  end if;

  insert into public.device_push_tokens (user_id, token, platform)
  values (v_user, p_token, p_platform)
  on conflict (token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform,
        updated_at = now();
end;
$$;

-- ---------- Borrar el token (cierre de sesión / app desinstalada) ----------
create or replace function public.borrar_push_token(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_token is null or char_length(trim(p_token)) = 0 then
    return;
  end if;
  delete from public.device_push_tokens where token = p_token and user_id = v_user;
end;
$$;

grant execute on function public.registrar_push_token(text, text) to authenticated;
grant execute on function public.borrar_push_token(text) to authenticated;

-- Nota de deploy: las colas de mensajería (duelo recibido, mensaje de
-- clan, racha en riesgo) NO se envían acá — las disparan Edge Functions
-- (ver supabase/functions/). La racha usa la función ya existente
-- public.usuarios_con_racha_en_riesgo() (0064), que NO tiene grant al
-- cliente y solo se invoca con la service role key, exactamente como
-- necesita una función programada.
