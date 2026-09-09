# Reglas de trabajo para agentes

Reglas transversales en `AGENTS.md` + estas específicas de coordinación.

## 1. Estados de verificación (obligatorios en todo registro)

Todo hallazgo/afirmación se etiqueta con UNO de estos estados, sin ambigüedad:

- `CONFIRMADO` — verificado con evidencia directa (código + ejecución + resultado esperado).
- `VERIFICADO POR CÓDIGO` — se leyó el código/el esquema y se determinó el comportamiento.
- `VERIFICADO EN BROWSER` — visto en un navegador real.
- `VERIFICADO CON TEST` — un test automatizado lo cubre y pasa.
- `NO VERIFICADO` — sin evidencia; puede ser hipótesis o afinidad.
- `BLOQUEADO` — no se pudo verificar por limitación del entorno (ej: sin DB, sin browser, sin git).
- `HIPÓTESIS` — sospecha justificada sin confirmar.
- `PENDIENTE` — agendado, sin ejecutar.

## 2. Ciclo obligatorio: CONSTRUÍ → VERIFIQUÉ → RESULTADO

Al terminar cualquier tarea:

```
CONSTRUÍ: qué cambié (rutas/archivos).
VERIFIQUÉ: npx tsc --noEmit · npm run lint · npm test · npm run build (lo que aplique al cambio).
RESULTADO: estado de verificación + evidencia + impacto (side effects probables).
```

## 3. Claims (evitar pisarse)

- Formato `### CLAIM: <tarea> · <agente> · <fecha>` en `docs/agent-work/ACTIVE.md`.
- Un área con claim activo (sec. con `CLAIM` y sin `CIERRE`) **no se edita** por otro agente.
- Al terminar se escribe `### CIERRE: ...` y se pasa a `COMPLETADO`/`CANCELADO` en la lista.

## 4. No romper

- Cambios acotados. Migrar/refactorizar solo con justificación en `docs/DECISIONS.md`.
- Nunca modificar `docs/PROGRESO.md` (historial vivo): solo AGREGAR notas al final.
- El código manda sobre los docs desactualizados. Si un doc contradice el código, marcar en TECH-DEBT antes de "arreglar" el código por confiarse del doc.

## 5. Migraciones y entorno

- Número siguiente a 0114 para nuevas migraciones (`NNNN_descripcion.sql`).
- El código **no** puede depender de migraciones sin aplicar en el entorno de destino.
- Sin git CLI en este entorno: no se hacen commits; todo queda en working tree (nota en TECH-DEBT).

## 6. Comunicación

- Respuestas cortas y directas, español rioplatense, título/función citando `ruta:línea`.
- No inventar envs, secretos, endpoints ni estados.