import assert from "node:assert/strict";
import test from "node:test";

import { buildDeterministicNodePositions } from "../lib/map-layout.ts";
import {
  createProjectTransferJSON,
  parseProjectTransfer,
} from "../lib/project-transfer.ts";
import { calculateStrategicQualityScore } from "../lib/evaluation/rubric.ts";
import { strategicEvaluationCases } from "../lib/evaluation/test-cases.ts";
import {
  createExecutiveSummaryText,
  createProjectDocumentHTML,
} from "../lib/document-export.ts";
import { formatProjectMarkdown } from "../lib/markdown.ts";
import { aiMapGenerationSchema } from "../lib/schemas/ai.ts";
import {
  appendProjectVersion,
  compareMapVersions,
  deleteProjectVersion,
  normalizeProjectVersions,
  restoreProjectVersion,
} from "../lib/versions.ts";
import { getAvailableStage } from "../lib/workflow.ts";

test("un proyecto nuevo empieza en Idea", () => {
  assert.equal(getAvailableStage(), "idea");
});

test("un proyecto analizado abre Preguntas, incluso con score cero", () => {
  assert.equal(getAvailableStage({ readinessScore: 0 }), "questions");
});

test("un proyecto con mapa abre Mapa", () => {
  assert.equal(
    getAvailableStage({
      readinessScore: 60,
      structuredResponse: {},
    }),
    "map"
  );
});

test("reorganizar un mapa produce siempre las mismas posiciones", () => {
  const response = {
    central_idea: "Idea",
    diagnostic: {
      critical_risks: [],
      next_steps: [],
      summary: "Diagnóstico",
      weak_points: [],
    },
    project_title: "Proyecto",
    sections: {
      actions: [
        { description: "A", label: "Acción", priority: "high" },
        { description: "B", label: "Acción 2", priority: "medium" },
      ],
      hypotheses: [
        { description: "H", label: "Hipótesis", priority: "low" },
      ],
      objectives: [
        { description: "O", label: "Objetivo", priority: "high" },
      ],
      risks: [
        { description: "R", label: "Riesgo", priority: "high" },
      ],
    },
    summary: "Resumen",
  };

  assert.deepEqual(
    buildDeterministicNodePositions(response),
    buildDeterministicNodePositions(response)
  );
  const positions = buildDeterministicNodePositions(response);

  assert.deepEqual(positions.central, { x: -150, y: -96 });
  assert.equal(positions["risk-0"].x, -760);
  assert.equal(positions["action-0"].x, 520);
});

test("exportar e importar conserva el proyecto completo", () => {
  const project = {
    aiModelId: "gemini-2.5-flash",
    createdAt: "2026-06-25T10:00:00.000Z",
    id: "project-test",
    mapLayout: {
      nodePositions: {
        central: { x: 24, y: 48 },
      },
      nodeStatuses: {
        "risk-0": "blocked",
      },
      viewport: { x: 10, y: 20, zoom: 0.8 },
    },
    rawInput: "Idea de prueba",
    status: "draft",
    title: "Proyecto de prueba",
    type: "app_product",
    updatedAt: "2026-06-25T10:00:00.000Z",
  };
  const result = parseProjectTransfer(createProjectTransferJSON(project));

  assert.equal(result.ok, true);
  assert.deepEqual(result.project, project);
});

test("un JSON inválido se rechaza sin crear proyecto", () => {
  assert.deepEqual(parseProjectTransfer("{sin-json"), {
    error: "El archivo no contiene JSON válido.",
    ok: false,
  });
  assert.equal(parseProjectTransfer('{"title":"incompleto"}').ok, false);
});

test("un mapa antiguo se convierte en Versión 1", () => {
  const project = createMappedProject();
  const normalized = normalizeProjectVersions(project);

  assert.equal(normalized.versions.length, 1);
  assert.equal(normalized.versions[0].label, "Versión 1");
  assert.equal(normalized.currentVersionId, normalized.versions[0].id);
});

test("un refinamiento crea una versión y conserva la anterior", () => {
  const project = normalizeProjectVersions(createMappedProject());
  const refinedResponse = {
    ...project.structuredResponse,
    central_idea: "Idea refinada",
    sections: {
      ...project.structuredResponse.sections,
      actions: [
        ...project.structuredResponse.sections.actions,
        { description: "Nueva", label: "Nueva acción", priority: "high" },
      ],
    },
  };
  const refined = appendProjectVersion(project, {
    round: {
      answers: ["Respuesta"],
      note: "Priorizar MVP",
      questions: ["Pregunta"],
    },
    source: "refinement",
    structuredResponse: refinedResponse,
  });

  assert.equal(refined.versions.length, 2);
  assert.equal(refined.versions[1].label, "Versión 2");
  assert.equal(refined.versions[1].round.note, "Priorizar MVP");
  assert.equal(refined.structuredResponse.central_idea, "Idea refinada");
});

test("comparar, restaurar y borrar versiones conserva la activa", () => {
  const first = normalizeProjectVersions(createMappedProject());
  const second = appendProjectVersion(first, {
    source: "refinement",
    structuredResponse: {
      ...first.structuredResponse,
      diagnostic: {
        ...first.structuredResponse.diagnostic,
        summary: "Diagnóstico actualizado",
      },
      sections: {
        ...first.structuredResponse.sections,
        actions: [
          ...first.structuredResponse.sections.actions,
          { description: "Nueva", label: "Nueva acción", priority: "high" },
        ],
      },
    },
  });
  const comparison = compareMapVersions(
    second.versions[0],
    second.versions[1]
  );
  const restored = restoreProjectVersion(second, second.versions[0].id);
  const deleted = deleteProjectVersion(restored, second.versions[1].id);

  assert.deepEqual(comparison.added, ["Nueva acción"]);
  assert.equal(comparison.diagnosticChanged, true);
  assert.equal(restored.currentVersionId, second.versions[0].id);
  assert.equal(restored.structuredResponse.central_idea, "Idea");
  assert.equal(deleted.versions.length, 1);
});

test("el schema estricto de IA exige un veredicto accionable", () => {
  const response = createMappedProject().structuredResponse;
  const result = aiMapGenerationSchema.safeParse({
    ...response,
    verdict: {
      evidence: ["El usuario ha definido un problema concreto."],
      headline: "Validar antes de construir",
      next_decision: "Diseñar una prueba pequeña de demanda.",
      rationale: "La idea es prometedora, pero aún depende de supuestos clave.",
      status: "validate",
      uncertainty: ["No hay evidencia de disposición a pagar."],
    },
  });

  assert.equal(result.success, true);
  assert.equal(aiMapGenerationSchema.safeParse(response).success, false);
});

test("la rúbrica estratégica calcula una puntuación repetible", () => {
  const score = calculateStrategicQualityScore({
    actionability: 5,
    clarity: 4,
    criticality: 4,
    depth: 3,
    low_repetition: 5,
    specificity: 3,
    uncertainty: 4,
    usefulness: 4,
  });

  assert.equal(score, 78);
});

test("el dataset de evaluación cubre suficientes ideas y riesgos", () => {
  assert.equal(strategicEvaluationCases.length >= 15, true);
  assert.equal(
    strategicEvaluationCases.some((item) =>
      item.expectedPressurePoints.includes("regulación")
    ),
    true
  );
});

test("el Markdown profesional incluye veredicto, mapa y estados sin depuración cruda", () => {
  const project = createMappedProject();
  const markdown = formatProjectMarkdown({
    ...project,
    latestGenerationMetrics: {
      attempts: 1,
      estimatedCostLabel: "coste bajo",
      estimatedInputTokens: 100,
      estimatedOutputTokens: 80,
      generatedAt: "2026-06-25T10:00:00.000Z",
      latencyMs: 1200,
      modelId: "gemini-2.5-flash",
    },
    mapLayout: {
      nodePositions: {},
      nodeStatuses: {
        "action-0": "validated",
        "risk-0": "blocked",
      },
    },
    structuredResponse: {
      ...project.structuredResponse,
      verdict: {
        evidence: ["Respuesta a Q1: Hay un problema descrito."],
        headline: "Validar antes de construir",
        next_decision: "Probar demanda con cinco usuarios.",
        rationale: "La idea necesita evidencia antes de pasar a desarrollo.",
        status: "validate",
        uncertainty: ["No hay datos de adopción."],
      },
    },
  });

  assert.equal(markdown.includes("## Veredicto ejecutivo"), true);
  assert.equal(markdown.includes("## Mapa estratégico"), true);
  assert.equal(markdown.includes("**Estado del nodo:** Bloqueado"), true);
  assert.equal(markdown.includes("**Validar** (Alta, Validado)"), true);
  assert.equal(markdown.includes("rawResponse"), false);
});

test("el documento editable convierte el mapa en secciones y bullets", () => {
  const project = {
    ...createMappedProject(),
    mapLayout: {
      nodePositions: {},
      nodeStatuses: {
        "action-0": "validated",
        "risk-0": "blocked",
      },
    },
    structuredResponse: {
      ...createMappedProject().structuredResponse,
      project_title: "Proyecto <piloto>",
      verdict: {
        evidence: ["Respuesta a Q1: Hay un problema descrito."],
        headline: "Validar antes de construir",
        next_decision: "Probar demanda con cinco usuarios.",
        rationale: "La idea necesita evidencia antes de pasar a desarrollo.",
        status: "validate",
        uncertainty: ["No hay datos de adopción."],
      },
    },
  };
  const documentHTML = createProjectDocumentHTML(project);

  assert.equal(documentHTML.includes("<h2>Mapa en formato de trabajo</h2>"), true);
  assert.equal(documentHTML.includes("<h2>Preguntas y respuestas usadas</h2>"), true);
  assert.equal(documentHTML.includes("<h2>Plan de accion inmediato</h2>"), true);
  assert.equal(documentHTML.includes("Pregunta 1:"), true);
  assert.equal(documentHTML.includes("Pregunta inicial"), true);
  assert.equal(documentHTML.includes("Respuesta inicial"), true);
  assert.equal(
    documentHTML.includes("Respuesta a Q1: (Pregunta inicial)"),
    true
  );
  assert.equal(documentHTML.includes("<h3>Acciones</h3>"), true);
  assert.equal(documentHTML.includes("[ ] Validar (Alta, Validado)"), true);
  assert.equal(documentHTML.includes("Estado: Bloqueado"), true);
  assert.equal(documentHTML.includes("Proyecto &lt;piloto&gt;"), true);
  assert.equal(documentHTML.includes("rawResponse"), false);
});

test("el resumen ejecutivo copiable contiene solo lo accionable", () => {
  const project = {
    ...createMappedProject(),
    structuredResponse: {
      ...createMappedProject().structuredResponse,
      verdict: {
        evidence: ["Hay un problema descrito."],
        headline: "Validar antes de construir",
        next_decision: "Probar demanda con cinco usuarios.",
        rationale: "La idea necesita evidencia antes de pasar a desarrollo.",
        status: "validate",
        uncertainty: ["No hay datos de adopcion."],
      },
    },
  };
  const summary = createExecutiveSummaryText(project);

  assert.equal(summary.includes("RESUMEN EJECUTIVO"), true);
  assert.equal(summary.includes("VEREDICTO"), true);
  assert.equal(summary.includes("RIESGOS PRINCIPALES"), true);
  assert.equal(summary.includes("ACCIONES PRIORITARIAS"), true);
  assert.equal(summary.includes("rawResponse"), false);
});

function createMappedProject() {
  return {
    aiModelId: "gemini-2.5-flash",
    createdAt: "2026-06-25T10:00:00.000Z",
    id: "mapped-project",
    rawInput: "Idea",
    readinessScore: 60,
    sparringAnswers: ["Respuesta inicial"],
    sparringQuestions: ["Pregunta inicial"],
    status: "mapped",
    structuredResponse: {
      central_idea: "Idea",
      diagnostic: {
        critical_risks: ["Riesgo"],
        next_steps: ["Paso"],
        summary: "Diagnóstico",
        weak_points: ["Debilidad"],
      },
      project_title: "Proyecto",
      sections: {
        actions: [
          { description: "Acción", label: "Validar", priority: "high" },
        ],
        hypotheses: [
          { description: "Hipótesis", label: "Supuesto", priority: "medium" },
        ],
        objectives: [
          { description: "Objetivo", label: "Aclarar", priority: "high" },
        ],
        risks: [
          { description: "Riesgo", label: "Mercado", priority: "high" },
        ],
      },
      summary: "Resumen",
    },
    title: "Proyecto",
    type: "app_product",
    updatedAt: "2026-06-25T10:00:00.000Z",
  };
}
