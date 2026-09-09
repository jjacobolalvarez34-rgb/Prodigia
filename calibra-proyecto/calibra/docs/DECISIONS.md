# DECISIONS — Decisiones de diseño (ADR)

> Registro de decisiones importantes y su justificación. Agregar nuevas como entrada al final, con fecha y estado.
> Formato: `## <YYYY-MM-DD> — <título>` + contexto + decisión + consecuencias + estado (verificado/pendiente).

## 2026-09-07 — Recrear infraestructura de agentes y documentación base

- **Contexto:** el repo tenía solo el bloque autogenerado de Next.js en AGENTS.md y `.opencode/` no existía. No hay CI/registro de arquitectura; los docs de especificación estaban desactualizados.
- **Decisión:** crear `AGENTS.md` extendido (conservando el bloque Next.js), `.opencode/agents/*.md` (22 agentes de dominio), y `docs/` de coordinación (AGENT-INDEX, AGENT-RULES, PROJECT-STATE, ARCHITECTURE, DECISIONS, TECH-DEBT, EXTERNAL-RESOURCES, agent-work/ACTIVE).
- **Consecuencias:** cualquier agente/desarrollador tiene un punto de entrada normalizado. El estado actual queda CÓDIGO-First (el repo manda, los docs se marcan cuando se desactualizan).
- **Estado:** VERIFICADO POR CÓDIGO (creación de archivos; el contenido refleja lectura real del repo).

## 2026-08-27 — Opción del mundo de referencia para paridad (heredada de PARIDAD_MUNDOS.md)

- **Decisión:** Numeria es el mundo de referencia de la matriz de paridad (por ser el mundo base y el que mejor cubierto está).
- **Estado:** VERIFICADO POR CÓDIGO según matriz en `docs/PARIDAD_MUNDOS.md`.

## Histórico de decisiones previas (resumen, heredadas)

- **Estándar de fecha en retos/rachas:** UTC en cliente (`racha.ts`, `lunesDeEstaSemanaIso`) con el mismo criterio que Postgres (`current_date`, `date_trunc('week',...)`) — `0113`.
- **Onboarding 2 mundos gratis:** `elegir_mundos_iniciales(text[])` se llama UNA vez con los 2 slugs, y se hace parte de `0112` (evita romper el flujo de llamada doble a la RPC vieja de 1 mundo — ver comentario en `FlujoElegirMundos.tsx`).
- **Todos los mundos son "potencialmente pagos"** (incluso Numeria): cuál es gratis depende de la elección inicial de cada cuenta (`precios.ts`, `0097`).
- **Precio real en el servidor:** `desbloquear_mundo()` define el precio; el cliente solo muestra el número de referencia (`PRECIO_MUNDO_CHISPAS`).
- **Ranking público vía `security definer`** con `limit 100`, porque la RLS de filas propias no deja lecturas cruzadas (`0113`).