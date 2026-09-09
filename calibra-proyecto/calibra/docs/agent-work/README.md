# docs/agent-work — Trabajo de agentes

Este directorio guarda la *memoria operativa* del trabajo automatizado: **quién hace qué y qué dejó**. No es documentación de producto (eso vive en `docs/*.md` de raíz), es coordinación.

## Índice

- `README.md` — este archivo.
- `ACTIVE.md` — **sistema de claims**: tareas en curso, con agente y estado. Es la única fuente de verdad de quién tiene tomado qué.
- `audits/` (en `docs/audits/`) — auditorías de fondo por dominio.
- Notas por dominio se pueden crear como `docs/agent-work/<slug-agente>.md` cuando un agente necesite bitácora propia (opcional).

## Cómo funciona el sistema de claims

Reglas (ver también `docs/AGENT-RULES.md` §3):

1. Antes de arrancar una tarea manual, el agente agrega al final de `ACTIVE.md`:
   ```
   ### CLAIM: <tarea> · <agente> · <YYYY-MM-DD>
   Estado: EN CURSO
   Áreas tocadas: <rutas>
   Plan: <qué va a hacer, en pasos>
   ```
2. Siente el claim y trabaja en silencio (no pise áreas con CLAIM activo de otro).
3. Al terminar marca en la misma sección:
   ```
   ### CIERRE: <tarea> · <agente> · <YYYY-MM-DD>
   Resultado: <CONSTRUÍ → VERIFIQUÉ → RESULTADO, con estados §1 de AGENT-RULES>
   ```
   y en la lista superior mueve el item a COMPLETADO/CANCELADO.

## Formato de bitácora (opcional por agente)

```
## <YYYY-MM-DD> — <tarea>
CONSTRUÍ: ...
VERIFIQUÉ: ...
RESULTADO: <estado válido> + evidencia
```