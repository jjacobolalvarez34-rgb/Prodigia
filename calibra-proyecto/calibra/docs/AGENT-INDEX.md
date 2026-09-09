# Índice de agentes

Proyecto **Prodigia**. Definiciones completas en `.opencode/agents/<slug>.md`.

| Agente | Dominio | Archivo |
|---|---|---|
| orchestrator | Coordina fases, claims y cierres | `.opencode/agents/orchestrator.md` |
| repo-architect | Estructura y arquitectura | `.opencode/agents/repo-architect.md` |
| frontend-ui | UI React/Next/cliente | `.opencode/agents/frontend-ui.md` |
| backend-supabase | Migraciones, RPC, RLS, API routes | `.opencode/agents/backend-supabase.md` |
| auth-security | Auth, sesiones, RLS, roles, seguridad | `.opencode/agents/auth-security.md` |
| matchmaking | Duelos, matchmaking, ELO, fantasmas | `.opencode/agents/matchmaking.md` |
| gameplay | Práctica, dificultad, mundos, paridad | `.opencode/agents/gameplay.md` |
| educational-content | Preguntas, lecciones, retoDiario | `.opencode/agents/educational-content.md` |
| daily-weekly-challenges | Retos diario/semanal, rachas, ranking | `.opencode/agents/daily-weekly-challenges.md` |
| onboarding-landing | Landing, onboarding, 2 mundos | `.opencode/agents/onboarding-landing.md` |
| ux-ui | UX/UI, estados, micro-interacciones | `.opencode/agents/ux-ui.md` |
| mobile-capacitor | Capacitor/Android/push | `.opencode/agents/mobile-capacitor.md` |
| visual-design | Identidad visual, color, tipografía | `.opencode/agents/visual-design.md` |
| store-economy | Tienda y economía de Chispas | `.opencode/agents/store-economy.md` |
| qa-e2e | Tests, QA, Playwright, paridad | `.opencode/agents/qa-e2e.md` |
| performance | Rendimiento web/mobile | `.opencode/agents/performance.md` |
| accessibility-a11y | Accesibilidad | `.opencode/agents/accessibility-a11y.md` |
| observability | Logs, errores, depuración | `.opencode/agents/observability.md` |
| marketing | Copy landing/promos/anuncios | `.opencode/agents/marketing.md` |
| social-content | Feed, amigos, clanes, chat, push | `.opencode/agents/social-content.md` |
| documentation | Docs vivos y estados verificables | `.opencode/agents/documentation.md` |
| release-reviewer | Gate de fases/releases | `.opencode/agents/release-reviewer.md` |

## Cómo se asignan tareas

1. **orchestrator** recibe la tarea, decide agente(s), fecha y fase.
2. El agente crea un **claim** en `docs/agent-work/ACTIVE.md` y actualiza estado.
3. El agente trabaja, verifica (tsc/lint/test/build) y documenta CONSTRUÍ → VERIFIQUÉ → RESULTADO.
4. **release-reviewer** a bordo de fases críticas antes de cerrar.

## Qué puede hacer cada uno

- Agentes de dominio implementan, auditan y documentan su área.
- `documentation` es el dueño de los `.md` de coordinación (no de los de dominio).
- `release-reviewer` NO implementa: aprueba o rechaza.