# Instrucciones locales de SparringMap

Estas instrucciones mandan para este repo y deben leerse antes de tocar codigo,
producto o roadmap.

## Idioma y estilo

- Responder en espanol de Espana.
- Ser claro, directo y accionable.
- No inventar estado del proyecto: comprobar `README.md`, `ROADMAP_MEJORAS.md`
  y `docs/PRODUCT_STRATEGY.md`.
- Si aparecen demasiados frentes, ayudar a decidir si se ejecutan ahora, se
  aparcan o se guardan como idea futura.

## Contexto del producto

SparringMap es una app privada, por ahora para uso de Noelia/Lia, que convierte
ideas iniciales en mapas estrategicos con objetivos, riesgos, acciones,
hipotesis, diagnostico, veredicto y exportaciones.

La app no debe convertirse en:

- un whiteboard generico;
- un mind map generico;
- una interfaz de chat;
- una herramienta de notas sin criterio estrategico.

El valor principal es ayudar a pensar y decidir mejor.

## Estado actual

El estado funcional y tecnico se resume en `README.md`.
El plan vivo y las fases estan en `ROADMAP_MEJORAS.md`.
Las decisiones de producto, beta futura, costes de IA y posible monetizacion
estan en `docs/PRODUCT_STRATEGY.md`.

Antes de proponer o implementar una mejora, revisar esos tres archivos.

## Prioridad actual

El proyecto esta en fase de uso privado y aprendizaje real.

Prioridades:

1. Pulir el flujo diario de uso privado.
2. Mejorar lectura, exportaciones y refinamiento.
3. Evitar aumentar complejidad antes de validar uso real.
4. Reducir deuda tecnica antes de una beta o despliegue publico.

No priorizar todavia:

- login;
- pagos;
- multiusuario;
- Supabase;
- trial publico;
- colaboracion;
- despliegue abierto;
- integraciones externas.

Eso queda para una fase posterior, cuando se decida si sera beta cerrada o SaaS
vendible a pequena escala.

## Criterios tecnicos

- Mantener claves de IA solo en servidor.
- No exponer `GEMINI_API_KEY` ni `OPENAI_API_KEY` al navegador.
- Validar respuestas de IA con Zod.
- No crear mapas desde respuestas no validadas.
- Mantener layout determinista; no usar `Math.random()` para el mapa.
- No anadir dependencias sin justificarlo y sin aprobacion.
- Antes de cerrar cambios, ejecutar:
  - `npm test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build` cuando el cambio afecte a producto o build.

## Git

- No reescribir historial sin permiso.
- Commits pequenos y descriptivos.
- Subir a GitHub cuando Noelia/Lia pida dejar el estado guardado o cerrado.
