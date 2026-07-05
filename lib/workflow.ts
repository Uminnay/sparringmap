import type { SparringProject, WorkflowStage } from "@/types";

export function getAvailableStage(
  project?: Pick<SparringProject, "readinessScore" | "structuredResponse">
): WorkflowStage {
  if (project?.structuredResponse) {
    return "map";
  }

  if (project?.readinessScore !== undefined) {
    return "questions";
  }

  return "idea";
}
