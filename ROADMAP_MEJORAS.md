# SparringMap - Roadmap de mejoras

Documento vivo para ordenar, priorizar e implementar las mejoras de SparringMap.

Ultima actualizacion: 23 de junio de 2026.

## 1. Vision del producto

SparringMap debe ayudar a transformar una idea incierta en una decision
estrategica mas clara mediante este ciclo:

1. Expresar la idea.
2. Recibir preguntas criticas.
3. Responder o avanzar con incertidumbres explicitas.
4. Generar un mapa estrategico.
5. Identificar riesgos, hipotesis y acciones prioritarias.
6. Refinar la idea en rounds sucesivos.
7. Conservar, comparar y exportar el resultado.

La app no debe convertirse en un whiteboard generico, un mind map ni una
interfaz de chat convencional.

## 2. Estado actual

### Funcional

- Next.js App Router, TypeScript strict, Tailwind y shadcn/ui.
- Tema claro y oscuro.
- Paneles laterales plegables.
- Analisis inicial con readiness score y preguntas criticas.
- Generacion de estructura validada con Zod.
- Integracion de Gemini mediante rutas internas.
- Selector preparado para varios modelos.
- Mapa interactivo con `@xyflow/react`.
- Nodos movibles, zoom, pan, controles y minimapa opcional.
- IDs, edges y posiciones generados por el frontend.
- Diagnostico, veredicto, exportacion y refinamiento.
- Guardado local, biblioteca de borradores y archivo.

### Limitaciones actuales

- El flujo completo ocupa demasiado espacio vertical.
- Las posiciones manuales, zoom y viewport del mapa no se guardan.
- Refinar sustituye el mapa anterior y no crea una version recuperable.
- No existe deshacer ni historial de cambios.
- El veredicto se basa en reglas simples, no en un contrato de IA especifico.
- No se ha evaluado sistematicamente la calidad de los modelos.
- La exportacion PDF depende de imprimir la interfaz actual.
- No hay tests automatizados.
- Algunos componentes han crecido demasiado.
- El guardado local no se sincroniza entre dispositivos y puede perderse si
  se borran los datos del navegador.

## 3. Principios de implementacion

- No ampliar el alcance del MVP sin confirmacion.
- No anadir librerias nuevas sin justificar su necesidad.
- Mantener `localStorage` hasta aprobar una fase de persistencia remota.
- Mantener las claves de IA exclusivamente en servidor.
- Validar todas las respuestas de IA con Zod.
- Reintentar una sola vez cuando falle la validacion.
- Nunca crear mapas a partir de respuestas no validadas.
- La IA nunca genera IDs, coordenadas ni edges.
- No usar `Math.random()` para el layout.
- Cada fase debe incluir verificacion funcional, visual y responsive.
- No iniciar una fase nueva hasta cerrar o aparcar conscientemente la anterior.

## 4. Orden recomendado

## Fase 6 - Estabilizacion del flujo principal

Objetivo: conseguir que el ciclo idea -> preguntas -> mapa sea claro, compacto y
predecible antes de anadir mas funciones.

### Plan de ejecucion

#### 6.1 Modelo de etapas

- [x] Introducir un estado explicito de etapa: `idea`, `questions`, `map`.
- [x] Separar el contenido central en componentes de etapa.
- [x] Mantener los datos de las etapas anteriores sin mostrarlos siempre
  completos.
- [x] Mostrar progreso y estado actual en la barra superior.

#### 6.2 Paneles compactos

- [x] Convertir idea y preguntas en paneles contraibles.
- [x] Contraerlos al generar el mapa.
- [x] Permitir editarlos y volver a ejecutar el analisis de forma consciente.
- [x] Mantener el mapa visible durante refinamientos.

#### 6.3 Proteccion de regeneraciones

- [x] Detectar cuando ya existe un mapa.
- [x] Pedir confirmacion antes de regenerar o sustituir contenido.
- [x] Diferenciar entre:
  - regenerar desde la idea;
  - aplicar respuestas;
  - crear un nuevo round;
  - refinar el mapa actual.
- [x] Preparar el contrato para crear versiones en la Fase 8.

#### 6.4 Limpieza y verificacion

- [x] Sustituir textos tecnicos por lenguaje de producto.
- [x] Corregir caracteres mal codificados.
- [x] Revisar estados vacios, carga, error y exito.
- [x] Verificar escritorio, portatil y movil.
- [x] Anadir las primeras pruebas del estado de etapas sin nuevas
  dependencias; en caso contrario, proponerlas antes.

### Trabajo

- [x] Convertir el flujo en tres etapas visibles:
  `Idea`, `Preguntas`, `Mapa`.
- [x] Contraer automaticamente la idea y las preguntas al generar el mapa.
- [x] Permitir volver a abrir cualquier etapa sin perder datos.
- [x] Mostrar claramente el round y la version actuales.
- [x] Anadir confirmacion antes de sustituir un mapa existente.
- [x] Diferenciar visualmente:
  - analizando;
  - esperando respuestas;
  - generando;
  - mapa listo;
  - error recuperable.
- [x] Reducir texto tecnico visible para usuarios, por ejemplo referencias a
  Zod o contratos internos.
- [x] Revisar todos los textos, acentos y caracteres mal codificados.

### Criterios de aceptacion

- El usuario siempre sabe en que etapa esta.
- El mapa se convierte en la superficie principal tras generarlo.
- No se pierde texto al abrir o cerrar etapas.
- No se puede sobrescribir un mapa sin una accion consciente.
- No hay saltos o solapes de layout en escritorio y movil.

## Fase 7 - Persistencia completa del mapa

Objetivo: que el trabajo manual realizado en el canvas se conserve.

### Trabajo

- [x] Guardar posiciones de nodos por proyecto.
- [x] Guardar zoom, desplazamiento y viewport.
- [x] Restaurar exactamente el mapa al abrir un proyecto.
- [x] Anadir boton `Reorganizar mapa`.
- [x] Anadir boton `Recentrar`.
- [x] Permitir duplicar proyecto.
- [x] Permitir eliminar definitivamente con confirmacion.
- [x] Anadir exportar e importar proyecto completo en JSON.
- [x] Informar de que el guardado es local y de sus limites.

### Criterios de aceptacion

- Mover nodos, cerrar la app y reabrir el proyecto conserva el layout.
- Reorganizar produce siempre el mismo layout determinista.
- Importar un JSON valido restaura un proyecto completo.
- Los JSON invalidos se rechazan con un error claro.

## Fase 8 - Versiones, rounds y deshacer

Objetivo: permitir iterar sin destruir el trabajo anterior.

### Trabajo

- [x] Cada refinamiento crea una nueva version.
- [x] Mostrar `Version 1`, `Version 2`, etc.
- [x] Guardar preguntas, respuestas e instrucciones de cada round.
- [x] Comparar versiones:
  - elementos anadidos;
  - elementos eliminados;
  - elementos modificados;
  - cambio de diagnostico.
- [x] Restaurar una version anterior.
- [x] Anadir deshacer y rehacer para movimientos de nodos.
- [x] Confirmar antes de eliminar versiones.

### Criterios de aceptacion

- Refinar nunca elimina definitivamente la version anterior.
- El usuario puede volver a cualquier version guardada.
- Los cambios entre versiones se entienden sin leer todo el mapa.

## Fase 9 - Calidad estrategica de la IA

Objetivo: demostrar que SparringMap produce mejores decisiones, no solo
respuestas visualmente atractivas.

### Trabajo

- [x] Crear un conjunto de 15 a 30 ideas de prueba:
  - apps;
  - productos fisicos;
  - SaaS;
  - estrategias de negocio;
  - ideas poco definidas;
  - ideas de alto riesgo.
- [x] Crear una rubrica de evaluacion:
  - profundidad;
  - claridad;
  - especificidad;
  - utilidad;
  - repeticion;
  - capacidad critica;
  - acciones ejecutables;
  - deteccion de incertidumbre.
- [x] Comparar Gemini Flash, Gemini Flash-Lite y modelos OpenAI disponibles.
- [x] Revisar prompts por tipo de proyecto.
- [x] Evitar que un refinamiento pierda informacion valiosa.
- [x] Crear schema especifico para veredicto.
- [x] Definir estados de veredicto:
  - avanzar;
  - validar;
  - replantear;
  - descartar.
- [x] Hacer que cada veredicto indique evidencia, incertidumbre y siguiente
  decision.
- [x] Registrar coste y tiempo aproximados por generacion.

### Criterios de aceptacion

- La rubrica permite comparar modelos de forma repetible.
- El veredicto no depende solo del score o del numero de riesgos.
- Las acciones propuestas son concretas y priorizadas.
- El sistema expresa incertidumbre cuando faltan datos.

### Nota de implementacion

La comparativa queda preparada con dataset, rubrica y metricas por generacion.
No se ejecuta un benchmark masivo automatico contra APIs para evitar consumir
cuota o coste sin confirmacion previa.

## Fase 10 - UX del mapa y diagnostico

Objetivo: mejorar lectura, navegacion y toma de decisiones.

### Trabajo

- [x] Expandir y contraer nodos.
- [x] Filtrar objetivos, riesgos, acciones e hipotesis.
- [x] Destacar riesgos criticos y acciones inmediatas.
- [x] Permitir marcar nodos como:
  - validado;
  - pendiente;
  - descartado;
  - bloqueado.
- [x] Anadir relaciones entre nodos mas alla de la idea central.
- [x] Mostrar dependencias entre acciones, riesgos e hipotesis.
- [x] Simplificar el inspector:
  - detalle del nodo;
  - diagnostico;
  - historial.
- [x] Mover guardar, exportar y versiones a una barra del mapa.
- [x] Mejorar la experiencia tactil y movil.
- [x] Definir una personalidad visual propia de SparringMap.

### Criterios de aceptacion

- El usuario puede encontrar rapidamente los tres riesgos y acciones mas
  importantes.
- El inspector no mezcla controles globales con detalle de nodo.
- El mapa sigue siendo usable con el numero maximo de nodos.
- La version movil permite consultar el resultado, aunque la edicion avanzada
  pueda estar limitada.

### Nota de implementacion

Primera pasada completada: filtros, prioridad alta, modo compacto, dependencias
derivadas opcionales, estados manuales por nodo y barra de mapa para guardar,
exportar y versiones. La personalidad visual queda definida de forma funcional
en el mapa; puede pulirse mas en una fase de diseno visual dedicada.

## Fase 11 - Exportacion profesional

Objetivo: convertir el resultado en un entregable util fuera de la app.

### Trabajo

- [x] Crear una vista limpia de impresion.
- [x] Excluir navegacion, formularios y controles del PDF.
- [x] Disenar un informe con:
  - portada;
  - veredicto;
  - mapa;
  - diagnostico;
  - acciones;
  - hipotesis;
  - proximos pasos.
- [x] Mejorar Markdown para documentacion y Notion.
- [x] Mantener exportacion JSON para copia de seguridad.
- [x] Evaluar exportacion visual PNG.
- [x] Pedir confirmacion antes de instalar una libreria para PNG o PDF.

### Criterios de aceptacion

- El PDF impreso se entiende sin abrir SparringMap.
- Markdown y JSON contienen toda la informacion relevante.
- La exportacion no incluye secretos, claves ni datos internos de depuracion.

### Nota de implementacion

La exportacion PDF usa la impresion nativa del navegador sobre una vista
profesional oculta en pantalla. No se instala libreria de PDF ni PNG. La
exportacion PNG queda aparcada porque requiere capturar el canvas o instalar
una dependencia especifica, y eso debe aprobarse por separado.

## Fase 12 - Arquitectura, tests y observabilidad

Objetivo: reducir deuda tecnica antes de publicar o ampliar usuarios.

### Trabajo

- [ ] Dividir `AppShell` por responsabilidades.
- [ ] Dividir `InspectorPanel` en modulos pequenos.
- [ ] Separar estado de:
  - proyectos;
  - generacion;
  - refinamiento;
  - mapa;
  - exportacion.
- [ ] Anadir tests unitarios para:
  - schemas Zod;
  - validacion con reintento;
  - layout determinista;
  - Markdown;
  - almacenamiento local.
- [ ] Anadir tests de integracion para rutas IA simuladas.
- [ ] Anadir tests de navegador para el flujo completo.
- [ ] Revisar accesibilidad, foco y teclado.
- [ ] Revisar rendimiento con mapas grandes.
- [ ] Anadir logs seguros sin guardar claves ni respuestas sensibles.

### Criterios de aceptacion

- Los contratos criticos tienen tests.
- Una regresion de schema, layout o almacenamiento se detecta automaticamente.
- Los componentes principales tienen responsabilidades claras.

## Fase 13 - Preparacion para despliegue

Objetivo: publicar una version controlada sin exponer costes ni claves.

### Trabajo

- [ ] Definir entorno de despliegue.
- [ ] Proteger rutas de IA.
- [ ] Anadir limites de uso y control de frecuencia.
- [ ] Controlar costes por modelo.
- [ ] Gestionar errores y cuotas de proveedores.
- [ ] Revisar privacidad y tratamiento de ideas del usuario.
- [ ] Rotar claves expuestas durante desarrollo.
- [ ] Decidir si entra autenticacion.
- [ ] Decidir si se mantiene localStorage o se aprueba Supabase.

### Criterios de aceptacion

- Ninguna clave llega al navegador.
- Un visitante no puede consumir la API sin limites.
- Los errores de proveedor no rompen ni borran proyectos.
- Existe una politica clara de almacenamiento y privacidad.

## 5. Mejoras aparcadas

No implementar sin aprobacion explicita:

- Login.
- Pagos.
- Multiusuario.
- Colaboracion en tiempo real.
- Supabase.
- PowerPoint.
- Integraciones externas.
- Compartir mediante enlaces publicos.
- Plantillas avanzadas por sector.
- Generacion automatica de presentaciones.

## 6. Riesgos principales

### Producto

- Anadir demasiadas funciones antes de perfeccionar el flujo principal.
- Generar mucha informacion sin ayudar a priorizar decisiones.
- Convertirse en una herramienta visual generica.

### IA

- Resultados inconsistentes entre ideas o modelos.
- Diagnosticos convincentes pero poco fundamentados.
- Refinamientos que pierdan informacion.
- Costes o limites de proveedor impredecibles.

### Tecnicos

- Perdida de datos por depender solo de localStorage.
- Componentes demasiado grandes.
- Falta de tests y regresiones silenciosas.
- Exposicion de claves o abuso de rutas al desplegar.

## 7. Definition of Done por fase

Una fase solo se considera terminada cuando:

- [ ] Cumple sus criterios de aceptacion.
- [ ] TypeScript compila en strict mode.
- [ ] ESLint pasa.
- [ ] El build de produccion pasa.
- [ ] No se anaden dependencias sin aprobacion.
- [ ] Se verifica en escritorio y movil.
- [ ] Se prueba el flujo principal en navegador.
- [ ] Se actualiza este roadmap.
- [ ] Se documentan limitaciones o decisiones pendientes.

## 8. Proxima decision

La siguiente fase recomendada es:

**Fase 12 - Arquitectura, tests y observabilidad**

No se recomienda empezar despliegue ni persistencia remota hasta reducir deuda
tecnica, dividir componentes grandes y ampliar tests.

## 9. Estrategia futura

La estrategia de uso privado, posible beta cerrada, control de costes de IA y
monetizacion futura esta documentada en:

[`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md)

Decision actual: mantener el proyecto como herramienta privada hasta validar uso
real con casos propios. No implementar login, pagos, trial, Supabase ni
despliegue publico sin decidir antes si el camino sera herramienta privada, beta
cerrada o producto vendible a pequena escala.
