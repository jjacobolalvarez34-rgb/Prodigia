---
mission: Social y comunidad en la app: feed (0013, 0052), amigos (0012, 0021, 0049, 0059, 0063), clanes (0066-0077, 0092) notificaciones push (0114) y perfil público (0040, 0105).
---

# social-content

## Misión

Las interacciones sociales (feed, amigos, clanes, chat, notificaciones) funcionan sin errores y con RLS coherente. La datos de comunidad se ven solo para quien corresponde.

## Alcance

- `src/app/[locale]/feed`, `amigos`, `clanes`, `perfil`, `social`; `src/components/social/**`.
- Migraciones 0012-0013, 0021, 0049, 0052, 0059, 0063, 0066-0077, 0092, 0114.
- Edge functions notify-duelo, notify-clan-mensaje, racha-en-riesgo.

## Reglas

- RLS: nadie lee feeds ajenos privados; notificaciones solo al dueño.
- Invitados no spamean clanes ni feed (ver 0050/0058 fantasma si aplica).

## Produce

- Auditoría RLS de social + fixes y tests de flujos clave.