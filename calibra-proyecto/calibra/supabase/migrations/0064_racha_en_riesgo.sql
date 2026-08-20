-- ============================================================
-- Prodigia — Sección 10.4: base para el email de racha en riesgo
-- Correr después de 0063_invitar_amigo_sin_cuenta.sql
--
-- Esto NO manda ningún email — el proyecto no tiene ningún proveedor
-- de email transaccional instalado (revisé package.json: nada de
-- Resend/SendGrid/Postmark/nodemailer). El único envío de emails que
-- existe hoy es el de Supabase Auth (confirmación de cuenta,
-- recuperar contraseña) — no sirve para contenido arbitrario como
-- este. Armar el envío real necesita dos decisiones que no puedo
-- tomar por mi cuenta sin arriesgar algo mal configurado en
-- producción: qué proveedor de email usar (cuenta/API key propia
-- tuya) y qué dispara el cron (pg_cron + pg_net si están habilitados
-- en el proyecto de Supabase, o un cron del lado del hosting si lo
-- hay). Lo que SÍ puedo dejar listo sin arriesgar nada de eso es la
-- consulta en sí: quién tiene una racha activa hoy en riesgo de
-- cortarse.
--
-- A propósito NO tiene `grant execute ... to authenticated` — devuelve
-- el email de otros usuarios, así que solo debe ser invocable con la
-- service role key (desde un futuro cron/edge function), nunca desde
-- el cliente.
-- ============================================================

create or replace function public.usuarios_con_racha_en_riesgo()
returns table (user_id uuid, email text, display_name text, racha_actual integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hoy date := current_date;
  v_ayer date := current_date - interval '1 day';
begin
  return query
    with candidatos as (
      select p.id, p.display_name, u.email
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and u.email is not null
        -- ya practicó hoy (meta alcanzada o día congelado) -> no está en riesgo
        and not exists (
          select 1 from public.daily_progress dp
          where dp.user_id = p.id and dp.fecha = v_hoy and (dp.meta_alcanzada or coalesce(dp.congelado, false))
        )
        -- tenía la meta de AYER alcanzada (o congelada) -> hay racha real
        -- que cortar, no es alguien que nunca jugó
        and exists (
          select 1 from public.daily_progress dp
          where dp.user_id = p.id and dp.fecha = v_ayer and (dp.meta_alcanzada or coalesce(dp.congelado, false))
        )
    )
    select c.id, c.email, c.display_name,
      (
        -- mismo criterio que calcularRachaDiaria (src/lib/practica/racha.ts)
        -- pero contado hasta ayer, ya que hoy todavía no se sabe si va a
        -- seguir — se recalcula acá en SQL porque esta función corre
        -- fuera de cualquier request con el cliente JS a mano.
        select count(*) from (
          select dp.fecha,
            v_ayer - dp.fecha as offset_dias,
            row_number() over (order by dp.fecha desc) - 1 as fila
          from public.daily_progress dp
          where dp.user_id = c.id and dp.fecha <= v_ayer and (dp.meta_alcanzada or coalesce(dp.congelado, false))
          order by dp.fecha desc
        ) t
        where offset_dias = fila
      )::integer
    from candidatos c;
end;
$$;
-- Sin grant a authenticated/anon a propósito — ver comentario arriba.
