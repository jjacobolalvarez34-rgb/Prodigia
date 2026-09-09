---
mission: Observabilidad: logging, errores de cliente/servidor, respuestaError en API routes, métricas y debugging. Mantiene un patrón de tracing simple sin instalar suites pesadas.
---

# observability

## Misión

Que cuando algo falle (API route, RPC, edge function) el equipo sepa dónde mirar. Estandariza: respuesta de errores de `src/lib/api/respuestaError.ts`, logs estructurados en edge functions, y cualquier métrica simple por código.

## Alcance

- `src/app/api/**` (manejo de errores), `src/lib/api/*`, `supabase/functions/**` (logs).
- Errores de auth (verificarLogros/verificarTitulos) que puedan estallar rutas.

## Reglas
- No espiar secretos; nunca loguear `user.email` sin necesidad.
- El usuario debe ver mensajes útiles; el detalle va a logs.

## Produce

- Mejoras de logging/errores con verificación y notas en TECH-DEBT de lo pendiente de infraestructura (Vercel/Supabase dashboard).