-- ====================================================================
-- PRODIGIA — login con nombre de usuario (pedido del propietario):
-- hoy /login solo acepta email+contraseña. Supabase Auth únicamente
-- sabe autenticar por email (o teléfono) — no existe "signInWithUsername"
-- nativo — así que el único camino real es: si lo que el usuario tipeó
-- NO es un email, resolverlo a su email real ACÁ (server, con permisos
-- para leer auth.users) y recién ahí el cliente llama
-- signInWithPassword con ese email resuelto.
--
-- profiles.display_name YA es único case-insensitive desde 0037
-- (profiles_display_name_lower_idx) — condición necesaria para que
-- esto tenga sentido, ya confirmada.
--
-- Nota de seguridad: esta función es la PRIMERA de todo el proyecto
-- que se otorga a "anon" (nadie más lo necesitaba — todo lo demás
-- corre después de autenticarse). El riesgo real es bajo: no expone
-- nada que ya no sea público (display_name se ve en rankings, clanes,
-- perfiles) — pero SÍ conecta nombre↔email, así que devuelve null en
-- vez de tirar una excepción distinguible cuando el nombre no existe
-- (para no convertirla en un oráculo trivial de "¿existe esta cuenta?"
-- más preciso de lo que ya permite el propio flujo de login).
-- ====================================================================

create or replace function public.resolver_email_por_usuario(p_identificador text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if p_identificador is null or length(trim(p_identificador)) < 2 then
    return null;
  end if;

  select u.email into v_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.display_name) = lower(trim(p_identificador))
  limit 1;

  return v_email;
end;
$$;

grant execute on function public.resolver_email_por_usuario(text) to anon, authenticated;

notify pgrst, 'reload schema';
