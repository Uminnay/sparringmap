import { NODE_TYPE_LABELS } from "./constants.ts";
import type { AINode, NodeReviewStatus, SparringProject } from "@/types";

export function createProjectDocumentHTML(project: SparringProject) {
  const response = project.structuredResponse;

  if (!response) {
    return "";
  }

  const nodeStatuses = project.mapLayout?.nodeStatuses ?? {};
  const questions = getDocumentQuestions(project);
  const versionLabel =
    project.versions?.find((version) => version.id === project.currentVersionId)
      ?.label ?? "Version actual";

  return [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '<meta charset="utf-8" />',
    `<title>${escapeHTML(response.project_title)}</title>`,
    "<style>",
    "body{font-family:Arial,sans-serif;line-height:1.5;color:#111827;margin:40px;}",
    "h1{font-size:28px;margin:0 0 8px;}",
    "h2{font-size:20px;margin:28px 0 10px;border-bottom:1px solid #d1d5db;padding-bottom:6px;}",
    "h3{font-size:16px;margin:18px 0 6px;}",
    "p{margin:6px 0 12px;}",
    "ul{margin:6px 0 14px 22px;padding:0;}",
    "li{margin:5px 0;}",
    ".meta{color:#4b5563;font-size:13px;margin-bottom:24px;}",
    ".label{font-weight:bold;}",
    ".muted{color:#4b5563;}",
    "</style>",
    "</head>",
    "<body>",
    `<h1>${escapeHTML(response.project_title)}</h1>`,
    `<p class="meta">Documento de trabajo exportado desde SparringMap - ${escapeHTML(versionLabel)} - ${new Date(project.updatedAt).toLocaleDateString("es-ES")}</p>`,
    "<h2>Ficha del proyecto</h2>",
    "<ul>",
    `<li><span class="label">Tipo:</span> ${project.type === "app_product" ? "App / producto" : "Estrategia de negocio"}</li>`,
    project.readinessScore !== undefined
      ? `<li><span class="label">Readiness:</span> ${project.readinessScore}/100</li>`
      : "",
    `<li><span class="label">Modelo:</span> ${escapeHTML(project.aiModelId)}</li>`,
    `<li><span class="label">Version:</span> ${escapeHTML(versionLabel)}</li>`,
    "</ul>",
    "<h2>Resumen ejecutivo</h2>",
    paragraph(response.summary),
    "<h2>Idea central</h2>",
    paragraph(response.central_idea),
    formatQuestionAnswers(questions),
    response.verdict ? formatVerdict(response.verdict, questions) : "",
    formatImmediateActionPlan(response.sections.actions, nodeStatuses),
    "<h2>Mapa en formato de trabajo</h2>",
    formatNodeGroup({
      items: response.sections.objectives,
      nodeStatuses,
      nodeType: "objective",
      title: NODE_TYPE_LABELS.objective,
    }),
    formatNodeGroup({
      items: response.sections.risks,
      nodeStatuses,
      nodeType: "risk",
      title: NODE_TYPE_LABELS.risk,
    }),
    formatNodeGroup({
      items: response.sections.actions,
      nodeStatuses,
      nodeType: "action",
      title: NODE_TYPE_LABELS.action,
    }),
    formatNodeGroup({
      items: response.sections.hypotheses,
      nodeStatuses,
      nodeType: "hypothesis",
      title: NODE_TYPE_LABELS.hypothesis,
    }),
    "<h2>Diagnostico critico</h2>",
    paragraph(response.diagnostic.summary),
    bulletList("Puntos debiles", response.diagnostic.weak_points),
    bulletList("Riesgos criticos", response.diagnostic.critical_risks),
    bulletList("Proximos pasos", response.diagnostic.next_steps),
    "<h2>Checklist de trabajo</h2>",
    "<h3>Acciones</h3>",
    checklist(response.sections.actions, nodeStatuses, "action"),
    "<h3>Hipotesis a validar</h3>",
    checklist(response.sections.hypotheses, nodeStatuses, "hypothesis"),
    "</body>",
    "</html>",
  ].join("\n");
}

export function createExecutiveSummaryText(project: SparringProject) {
  const response = project.structuredResponse;

  if (!response) {
    return "";
  }

  return [
    response.project_title,
    "",
    "RESUMEN EJECUTIVO",
    response.summary,
    "",
    response.verdict
      ? [
          "VEREDICTO",
          `${verdictStatusLabel[response.verdict.status]} - ${response.verdict.headline}`,
          `Siguiente decision: ${response.verdict.next_decision}`,
          "",
        ].join("\n")
      : undefined,
    "RIESGOS PRINCIPALES",
    ...response.sections.risks
      .filter((item) => item.priority === "high")
      .map((item) => `- ${item.label}: ${item.description}`),
    "",
    "ACCIONES PRIORITARIAS",
    ...response.sections.actions
      .filter((item) => item.priority === "high")
      .map((item) => `- ${item.label}: ${item.description}`),
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function formatVerdict(
  verdict: NonNullable<SparringProject["structuredResponse"]>["verdict"],
  questions: DocumentQuestion[]
) {
  if (!verdict) {
    return "";
  }

  return [
    "<h2>Veredicto ejecutivo</h2>",
    "<ul>",
    `<li><span class="label">Estado:</span> ${escapeHTML(verdictStatusLabel[verdict.status])}</li>`,
    `<li><span class="label">Titular:</span> ${escapeHTML(verdict.headline)}</li>`,
    `<li><span class="label">Siguiente decision:</span> ${escapeHTML(verdict.next_decision)}</li>`,
    "</ul>",
    paragraph(verdict.rationale),
    bulletList("Evidencia", enrichQuestionReferences(verdict.evidence, questions)),
    bulletList("Incertidumbre", verdict.uncertainty),
  ].join("\n");
}

interface DocumentQuestion {
  answer: string;
  question: string;
}

function getDocumentQuestions(project: SparringProject): DocumentQuestion[] {
  const activeVersion = project.versions?.find(
    (version) => version.id === project.currentVersionId
  );
  const questions = activeVersion?.round?.questions.length
    ? activeVersion.round.questions
    : project.sparringQuestions ?? [];
  const answers = activeVersion?.round?.answers.length
    ? activeVersion.round.answers
    : project.sparringAnswers ?? [];

  return questions.map((question, index) => ({
    answer: answers[index]?.trim() || "Sin respuesta",
    question,
  }));
}

function formatQuestionAnswers(questions: DocumentQuestion[]) {
  if (questions.length === 0) {
    return "";
  }

  return [
    "<h2>Preguntas y respuestas usadas</h2>",
    "<ul>",
    ...questions.map((item, index) =>
      [
        "<li>",
        `<span class="label">Pregunta ${index + 1}:</span> ${escapeHTML(item.question)}`,
        "<ul>",
        `<li><span class="label">Respuesta:</span> ${escapeHTML(item.answer)}</li>`,
        "</ul>",
        "</li>",
      ].join("\n")
    ),
    "</ul>",
  ].join("\n");
}

function formatImmediateActionPlan(
  actions: AINode[],
  nodeStatuses: Record<string, NodeReviewStatus>
) {
  const highPriorityActions = actions.filter((item) => item.priority === "high");
  const selectedActions =
    highPriorityActions.length > 0 ? highPriorityActions : actions.slice(0, 3);

  if (selectedActions.length === 0) {
    return "";
  }

  return [
    "<h2>Plan de accion inmediato</h2>",
    "<ul>",
    ...selectedActions.map((item) => {
      const index = actions.indexOf(item);
      const status = nodeStatuses[`action-${index}`] ?? "pending";

      return `<li>[ ] ${escapeHTML(item.label)} (${escapeHTML(priorityLabel[item.priority])}, ${escapeHTML(nodeStatusLabel[status])}): ${escapeHTML(item.description)}</li>`;
    }),
    "</ul>",
  ].join("\n");
}

function enrichQuestionReferences(
  items: string[],
  questions: DocumentQuestion[]
) {
  return items.map((item) =>
    item.replace(/^Respuesta a Q(\d+):/i, (match, questionNumber: string) => {
      const question = questions[Number(questionNumber) - 1]?.question;

      return question ? `${match} (${question})` : match;
    })
  );
}

function formatNodeGroup({
  items,
  nodeStatuses,
  nodeType,
  title,
}: {
  items: AINode[];
  nodeStatuses: Record<string, NodeReviewStatus>;
  nodeType: "objective" | "risk" | "action" | "hypothesis";
  title: string;
}) {
  return [
    `<h3>${escapeHTML(title)}</h3>`,
    "<ul>",
    ...items.map((item, index) => {
      const status = nodeStatuses[`${nodeType}-${index}`] ?? "pending";

      return [
        "<li>",
        `<span class="label">${escapeHTML(item.label)}</span>`,
        "<ul>",
        `<li>Prioridad: ${escapeHTML(priorityLabel[item.priority])}</li>`,
        `<li>Estado: ${escapeHTML(nodeStatusLabel[status])}</li>`,
        `<li>${escapeHTML(item.description)}</li>`,
        "</ul>",
        "</li>",
      ].join("\n");
    }),
    "</ul>",
  ].join("\n");
}

function bulletList(title: string, items: string[]) {
  if (items.length === 0) {
    return "";
  }

  return [
    `<h3>${escapeHTML(title)}</h3>`,
    "<ul>",
    ...items.map((item) => `<li>${escapeHTML(item)}</li>`),
    "</ul>",
  ].join("\n");
}

function checklist(
  items: AINode[],
  nodeStatuses: Record<string, NodeReviewStatus>,
  nodeType: "action" | "hypothesis"
) {
  if (items.length === 0) {
    return '<p class="muted">Sin elementos pendientes.</p>';
  }

  return [
    "<ul>",
    ...items.map((item, index) => {
      const status = nodeStatuses[`${nodeType}-${index}`] ?? "pending";
      return `<li>[ ] ${escapeHTML(item.label)} (${escapeHTML(priorityLabel[item.priority])}, ${escapeHTML(nodeStatusLabel[status])}): ${escapeHTML(item.description)}</li>`;
    }),
    "</ul>",
  ].join("\n");
}

function paragraph(value: string) {
  return `<p>${escapeHTML(value)}</p>`;
}

function escapeHTML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const priorityLabel: Record<AINode["priority"], string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};

const nodeStatusLabel: Record<NodeReviewStatus, string> = {
  blocked: "Bloqueado",
  dismissed: "Descartado",
  pending: "Pendiente",
  validated: "Validado",
};

const verdictStatusLabel = {
  advance: "Avanzar",
  discard: "Descartar",
  reframe: "Replantear",
  validate: "Validar",
} as const;
