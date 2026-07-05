import { StageReviewPanel } from "@/components/sparring/StageReviewPanel";
import { AI_MODEL_OPTIONS, PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import type { IdeaFormValues } from "@/components/idea/IdeaForm";
import type { SparringProject, WorkflowStage } from "@/types";

interface StageContextPanelsProps {
  answers: string[];
  draft: IdeaFormValues;
  includeQuestions: boolean;
  onEditStage: (stage: Extract<WorkflowStage, "idea" | "questions">) => void;
  project?: SparringProject;
}

export function StageContextPanels({
  answers,
  draft,
  includeQuestions,
  onEditStage,
  project,
}: StageContextPanelsProps) {
  const projectType = PROJECT_TYPE_OPTIONS.find(
    (option) => option.value === draft.type
  );
  const model = AI_MODEL_OPTIONS.find(
    (option) => option.value === draft.aiModelId
  );
  const questions = project?.sparringQuestions ?? [];

  return (
    <div className="grid gap-2">
      <StageReviewPanel
        actionLabel="Editar idea"
        onEdit={() => onEditStage("idea")}
        summary={`${projectType?.label ?? "Proyecto"} · ${model?.label ?? "Modelo IA"}`}
        title="Idea completada"
      >
        <div className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_220px]">
          <p className="leading-6 text-foreground">{draft.rawInput}</p>
          <dl className="grid gap-2 text-xs text-muted-foreground">
            <div>
              <dt className="font-medium uppercase">Tipo</dt>
              <dd className="mt-1 text-sm text-foreground">
                {projectType?.label}
              </dd>
            </div>
            <div>
              <dt className="font-medium uppercase">Modelo</dt>
              <dd className="mt-1 text-sm text-foreground">{model?.label}</dd>
            </div>
          </dl>
        </div>
      </StageReviewPanel>

      {includeQuestions && project?.readinessScore !== undefined ? (
        <StageReviewPanel
          actionLabel="Editar respuestas"
          onEdit={() => onEditStage("questions")}
          summary={`${project.readinessScore}/100 · ${questions.length} preguntas críticas`}
          title="Preguntas completadas"
        >
          {questions.length > 0 ? (
            <div className="grid gap-4">
              {questions.map((question, index) => (
                <div className="grid gap-1" key={`${question}-${index}`}>
                  <p className="text-sm font-medium leading-6">
                    {index + 1}. {question}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {answers[index]?.trim() || "Sin respuesta"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              La idea no necesitó preguntas adicionales antes de generar el
              mapa.
            </p>
          )}
        </StageReviewPanel>
      ) : null}
    </div>
  );
}
