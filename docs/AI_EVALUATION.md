# Evaluación de calidad estratégica de IA

Este documento define cómo comparar modelos en SparringMap sin depender de impresiones sueltas.

## Objetivo

Medir si un modelo ayuda a tomar mejores decisiones estratégicas, no solo si redacta bonito.

## Modelos a comparar

- Gemini 2.5 Flash
- Gemini 2.5 Flash-Lite
- Gemini 3.5 Flash
- GPT-5.4 mini
- GPT-5.5

Antes de lanzar una comparativa grande hay que confirmar claves, cuotas y precios vigentes. Por defecto no se ejecutan batches automáticos.

## Dataset

El dataset vive en:

`lib/evaluation/test-cases.ts`

Incluye apps, productos físicos, SaaS, estrategias de negocio, ideas vagas e ideas de alto riesgo.

## Rúbrica

La rúbrica vive en:

`lib/evaluation/rubric.ts`

Cada criterio se puntúa de 0 a 5:

- 0: ausente o dañino.
- 1: muy débil.
- 2: aceptable pero genérico.
- 3: útil.
- 4: fuerte.
- 5: excelente y específico.

## Criterios

- Profundidad.
- Claridad.
- Especificidad.
- Utilidad.
- Baja repetición.
- Capacidad crítica.
- Acciones ejecutables.
- Detección de incertidumbre.

## Veredicto esperado

Cada mapa nuevo debe incluir:

- Estado: avanzar, validar, replantear o descartar.
- Titular ejecutivo.
- Razonamiento.
- Evidencia usada.
- Incertidumbre pendiente.
- Siguiente decisión.

## Métricas guardadas

Cada generación de mapa guarda:

- modelo usado;
- tiempo aproximado;
- intentos de validación;
- tokens estimados de entrada y salida;
- etiqueta de coste aproximado.

## Proceso recomendado

1. Elegir 5 casos pequeños para una primera cata manual.
2. Generar el mismo caso con dos modelos.
3. Puntuar ambos con la rúbrica.
4. Revisar si el veredicto cambia la decisión de producto.
5. Ajustar prompts solo si se observa un patrón repetido.
6. Ampliar a 15-30 casos cuando el coste esté claro.

## Criterio de victoria

Un modelo gana si produce mapas más específicos, críticos y accionables, aunque escriba menos texto.
