import { NODE_TYPE_LABELS } from "./constants.ts";
import type { AINode, NodeReviewStatus, SparringProject } from "@/types";

export function formatProjectMarkdown(project: SparringProject) {
  const response = project.structuredResponse;

  if (!response) {
    return "";
  }

  const nodeStatuses = project.mapLayout?.nodeStatuses ?? {};
  const versionLabel =
    project.versions?.find((version) => version.id === project.currentVersionId)
      ?.label ?? "Versión actual";

  return [
    `# ${response.project_title}`,
    "",
    "> Informe estratégico generado en SparringMap.",
    "",
    "## Ficha del proyecto",
    `- **Tipo:** ${project.type === "app_product" ? "App / producto" : "Estrategia de negocio"}`,
    project.readinessScore !== undefined
      ? `- **Readiness score:** ${project.readinessScore}/100`
      : undefined,
    `- **Modelo IA:** ${project.aiModelId}`,
    `- **Versión:** ${versionLabel}`,
    `- **Última actualización:** ${new Date(project.updatedAt).toLocaleDateString("es-ES")}`,
    "",
    "## Resumen ejecutivo",
    response.summary,
    "",
    "## Idea central",
    response.central_idea,
    "",
    response.verdict ? formatVerdict(response.verdict) : undefined,
    "## Mapa estratégico",
    formatNodeSection({
      items: response.sections.objectives,
      nodeStatuses,
      nodeType: "objective",
      title: NODE_TYPE_LABELS.objective,
    }),
    formatNodeSection({
      items: response.sections.risks,
      nodeStatuses,
      nodeType: "risk",
      title: NODE_TYPE_LABELS.risk,
    }),
    formatNodeSection({
      items: response.sections.actions,
      nodeStatuses,
      nodeType: "action",
      title: NODE_TYPE_LABELS.action,
    }),
    formatNodeSection({
      items: response.sections.hypotheses,
      nodeStatuses,
      nodeType: "hypothesis",
      title: NODE_TYPE_LABELS.hypothesis,
    }),
    "## Diagnóstico crítico",
    response.diagnostic.summary,
    "",
    formatList("Puntos débiles", response.diagnostic.weak_points),
    formatList("Riesgos críticos", response.diagnostic.critical_risks),
    formatList("Próximos pasos", response.diagnostic.next_steps),
    "## Acciones priorizadas",
    formatActionChecklist(response.sections.actions, nodeStatuses),
    "## Hipótesis pendientes",
    formatHypothesisChecklist(response.sections.hypotheses, nodeStatuses),
    project.latestGenerationMetrics
      ? formatGenerationMetrics(project.latestGenerationMetrics)
      : undefined,
    "## Privacidad y depuración",
    "Este export no incluye claves de API, respuestas crudas de IA ni datos técnicos internos de depuración.",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function formatVerdict(
  verdict: NonNullable<SparringProject["structuredResponse"]>["verdict"]
) {
  if (!verdict) {
    return "";
  }

  return [
    "## Veredicto ejecutivo",
    `- **Estado:** ${verdictStatusLabel[verdict.status]}`,
    `- **Titular:** ${verdict.headline}`,
    `- **Siguiente decisión:** ${verdict.next_decision}`,
    "",
    verdict.rationale,
    "",
    formatList("Evidencia", verdict.evidence),
    formatList("Incertidumbre", verdict.uncertainty),
  ].join("\n");
}

function formatNodeSection({
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
    `### ${title}`,
    ...items.map((item, index) =>
      [
        `#### ${item.label}`,
        `- **Prioridad:** ${priorityLabel[item.priority]}`,
        `- **Estado del nodo:** ${nodeStatusLabel[nodeStatuses[`${nodeType}-${index}`] ?? "pending"]}`,
        `- **Descripción:** ${item.description}`,
      ].join("\n")
    ),
    "",
  ].join("\n");
}

function formatActionChecklist(
  items: AINode[],
  nodeStatuses: Record<string, NodeReviewStatus>
) {
  return [
    ...items.map((item, index) => {
      const status = nodeStatuses[`action-${index}`] ?? "pending";
      return `- [ ] **${item.label}** (${priorityLabel[item.priority]}, ${nodeStatusLabel[status]}): ${item.description}`;
    }),
    "",
  ].join("\n");
}

function formatHypothesisChecklist(
  items: AINode[],
  nodeStatuses: Record<string, NodeReviewStatus>
) {
  return [
    ...items.map((item, index) => {
      const status = nodeStatuses[`hypothesis-${index}`] ?? "pending";
      return `- [ ] **${item.label}** (${priorityLabel[item.priority]}, ${nodeStatusLabel[status]}): ${item.description}`;
    }),
    "",
  ].join("\n");
}

function formatList(title: string, items: string[]) {
  if (items.length === 0) {
    return "";
  }

  return [`### ${title}`, ...items.map((item) => `- ${item}`), ""].join("\n");
}

function formatGenerationMetrics(
  metrics: NonNullable<SparringProject["latestGenerationMetrics"]>
) {
  return [
    "## Métricas de generación",
    `- **Modelo:** ${metrics.modelId}`,
    `- **Tiempo:** ${(metrics.latencyMs / 1000).toFixed(1)} s`,
    `- **Intentos:** ${metrics.attempts}`,
    `- **Tokens estimados:** ${metrics.estimatedInputTokens} entrada / ${metrics.estimatedOutputTokens} salida`,
    `- **Coste aproximado:** ${metrics.estimatedCostLabel}`,
  ].join("\n");
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
