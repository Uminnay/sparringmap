"use client";

import { useCallback, useState } from "react";

import { Sidebar, type AppView } from "@/components/app-shell/Sidebar";
import { TopBar } from "@/components/app-shell/TopBar";
import { CanvasPlaceholder } from "@/components/canvas/CanvasPlaceholder";
import { MapWorkspaceBar } from "@/components/canvas/MapWorkspaceBar";
import { IdeaForm, type IdeaFormValues } from "@/components/idea/IdeaForm";
import {
  InspectorPanel,
  type AIErrorState,
} from "@/components/inspector/InspectorPanel";
import { ProjectLibrary } from "@/components/projects/ProjectLibrary";
import { PrintableReport } from "@/components/report/PrintableReport";
import { MapChangeConfirmation } from "@/components/sparring/MapChangeConfirmation";
import { RefinementRound } from "@/components/sparring/RefinementRound";
import { SparringActions } from "@/components/sparring/SparringActions";
import { StageContextPanels } from "@/components/sparring/StageContextPanels";
import { WorkflowStatusBanner } from "@/components/sparring/WorkflowStatusBanner";
import { VersionHistory } from "@/components/versions/VersionHistory";
import { useLocalProjects } from "@/hooks/useLocalProjects";
import { formatProjectMarkdown } from "@/lib/markdown";
import type { AIInitialAnalysis } from "@/lib/schemas/ai";
import { cn } from "@/lib/utils";
import { getAvailableStage } from "@/lib/workflow";
import {
  appendProjectVersion,
  deleteProjectVersion,
  normalizeProjectVersions,
  restoreProjectVersion,
  updateCurrentVersionLayout,
} from "@/lib/versions";
import type {
  AIStructuredResponse,
  AIGenerationMetrics,
  MapChangeIntent,
  MapLayoutState,
  MapNodeSelection,
  NodeReviewStatus,
  SparringProject,
  UIStatus,
  WorkflowStage,
} from "@/types";

type ThemeMode = "dark" | "light";

type PendingMapChange =
  | {
      intent: Extract<MapChangeIntent, "reanalyze_idea">;
      values: IdeaFormValues;
    }
  | {
      intent: Extract<MapChangeIntent, "regenerate_map">;
      useAnswers: boolean;
    }
  | {
      intent: Extract<MapChangeIntent, "refine_current_map">;
    };

interface APIResult<T> {
  data: T;
  meta?: AIGenerationMetrics;
}

const stageRank: Record<WorkflowStage, number> = {
  idea: 0,
  questions: 1,
  map: 2,
};

export function AppShell() {
  const [draft, setDraft] = useState<IdeaFormValues>({
    aiModelId: "gemini-2.5-flash",
    rawInput: "",
    type: "app_product",
  });
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeView, setActiveView] = useState<AppView>("new");
  const [workflowStage, setWorkflowStage] =
    useState<WorkflowStage>("idea");
  const [editableStage, setEditableStage] = useState<WorkflowStage>();
  const [uiStatus, setUiStatus] = useState<UIStatus>("idle");
  const [activeProject, setActiveProject] = useState<SparringProject>();
  const [aiError, setAIError] = useState<AIErrorState>();
  const [selectedNode, setSelectedNode] = useState<MapNodeSelection>();
  const [refinementQuestions, setRefinementQuestions] = useState<string[]>([]);
  const [refinementAnswers, setRefinementAnswers] = useState<string[]>([]);
  const [refinementNote, setRefinementNote] = useState("");
  const [projectName, setProjectName] = useState("");
  const [savedNotice, setSavedNotice] = useState<string>();
  const [questionAnswers, setQuestionAnswers] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [pendingMapChange, setPendingMapChange] =
    useState<PendingMapChange>();
  const {
    createDraft,
    duplicateProject,
    importProject,
    projects,
    removeProject,
    storageError,
    updateProject,
  } = useLocalProjects();

  const latestProject = activeProject;
  const availableStage = getAvailableStage(latestProject);
  const archivedCount = projects.filter(
    (project) => project.status === "archived"
  ).length;

  const appGrid = cn(
    "grid min-h-screen grid-cols-1 transition-[grid-template-columns] duration-300",
    "lg:grid-cols-[260px_minmax(0,1fr)_320px]",
    !isSidebarOpen &&
      isInspectorOpen &&
      "lg:grid-cols-[56px_minmax(0,1fr)_320px]",
    isSidebarOpen &&
      !isInspectorOpen &&
      "lg:grid-cols-[260px_minmax(0,1fr)_56px]",
    !isSidebarOpen &&
      !isInspectorOpen &&
      "lg:grid-cols-[56px_minmax(0,1fr)_56px]"
  );

  function handleDraftChange(values: IdeaFormValues) {
    setDraft(values);
    setAIError(undefined);
  }

  function handleAnalyzeIdea(values: IdeaFormValues) {
    if (latestProject?.structuredResponse) {
      setPendingMapChange({ intent: "reanalyze_idea", values });
      return;
    }

    void analyzeIdea(values);
  }

  async function analyzeIdea(values: IdeaFormValues) {
    setAIError(undefined);
    setWorkflowStage("idea");
    setEditableStage(undefined);
    setUiStatus("analyzing");

    const project = latestProject
      ? {
          ...latestProject,
          aiModelId: values.aiModelId,
          rawInput: values.rawInput,
          type: values.type,
        }
      : createDraft(values);
    const hasExistingMap = Boolean(project.structuredResponse);

    if (!latestProject) {
      setActiveProject(project);
      setProjectName(project.title);
    }

    try {
      const analysis = await postJSON<AIInitialAnalysis>("/api/ai/analyze", {
        aiModelId: values.aiModelId,
        rawInput: values.rawInput,
        type: values.type,
      });
      const questions = analysis.questions.slice(0, 3);
      const updatedProject: SparringProject = {
        ...project,
        readinessScore: analysis.readiness_score,
        sparringAnswers: [],
        sparringQuestions: questions,
        status: hasExistingMap ? "mapped" : "draft",
        structuredResponse: hasExistingMap
          ? project.structuredResponse
          : undefined,
        mapLayout: hasExistingMap ? project.mapLayout : undefined,
        updatedAt: new Date().toISOString(),
      };

      updateProject(updatedProject);
      setActiveProject(updatedProject);
      setProjectName(updatedProject.title);
      setSelectedNode(undefined);
      setRefinementQuestions([]);
      setRefinementAnswers([]);
      setRefinementNote("");
      setQuestionAnswers(questions.map(() => ""));
      setWorkflowStage("questions");
      setEditableStage(hasExistingMap ? "questions" : undefined);
      setUiStatus("idle");
    } catch (error) {
      setAIError(readClientError(error, "No se ha podido analizar la idea."));
      setWorkflowStage("idea");
      setEditableStage("idea");
      setUiStatus("error");
    }
  }

  async function handleGenerateMap(useAnswers: boolean) {
    if (!latestProject) {
      return;
    }

    if (latestProject.structuredResponse) {
      setPendingMapChange({ intent: "regenerate_map", useAnswers });
      return;
    }

    await generateMap(useAnswers);
  }

  async function generateMap(useAnswers: boolean) {
    if (!latestProject) {
      return;
    }

    setAIError(undefined);
    setWorkflowStage("questions");
    setEditableStage(undefined);
    setUiStatus("generating");
    setSelectedNode(undefined);

    const answers = useAnswers
      ? questionAnswers.map((answer) => answer.trim())
      : [];

    try {
      const generation = await postJSONResult<AIStructuredResponse>(
        "/api/ai/generate-map",
        {
          aiModelId: latestProject.aiModelId,
          answers,
          questions: latestProject.sparringQuestions ?? [],
          rawInput: latestProject.rawInput,
          type: latestProject.type,
        }
      );
      const projectWithVersion = appendProjectVersion(latestProject, {
        generationMetrics: generation.meta,
        round: {
          answers,
          questions: latestProject.sparringQuestions ?? [],
        },
        source:
          latestProject.versions?.length || latestProject.currentVersionId
            ? "regeneration"
            : "initial",
        structuredResponse: generation.data,
      });
      const updatedProject: SparringProject = {
        ...projectWithVersion,
        latestGenerationMetrics: generation.meta,
        sparringAnswers: answers,
        status: "mapped",
        title: generation.data.project_title,
        updatedAt: new Date().toISOString(),
      };

      updateProject(updatedProject);
      setActiveProject(updatedProject);
      setProjectName(updatedProject.title);
      setRefinementQuestions([]);
      setRefinementAnswers([]);
      setRefinementNote("");
      setWorkflowStage("map");
      setEditableStage(undefined);
      setUiStatus("idle");
    } catch (error) {
      setAIError(readClientError(error, "No se ha podido generar el mapa."));
      setWorkflowStage("questions");
      setEditableStage("questions");
      setUiStatus("error");
    }
  }

  async function handleRequestRefinementQuestions() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    setAIError(undefined);
    setWorkflowStage("map");
    setEditableStage(undefined);
    setUiStatus("analyzing");

    try {
      const analysis = await postJSON<AIInitialAnalysis>(
        "/api/ai/refine-questions",
        {
          aiModelId: latestProject.aiModelId,
          rawInput: latestProject.rawInput,
          structuredResponse: latestProject.structuredResponse,
          type: latestProject.type,
          userNote: refinementNote,
        }
      );

      setRefinementQuestions(analysis.questions);
      setRefinementAnswers(analysis.questions.map(() => ""));
      setWorkflowStage("map");
      setEditableStage(undefined);
      setUiStatus("idle");
    } catch (error) {
      setAIError(
        readClientError(error, "No se han podido generar más preguntas.")
      );
      setWorkflowStage("map");
      setEditableStage(undefined);
      setUiStatus("error");
    }
  }

  async function handleRefineMap() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    setPendingMapChange({ intent: "refine_current_map" });
  }

  async function refineMap() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    setAIError(undefined);
    setWorkflowStage("map");
    setEditableStage(undefined);
    setUiStatus("generating");
    setSelectedNode(undefined);

    const currentMarkdown = formatProjectMarkdown(latestProject);
    const nextRawInput = [
      latestProject.rawInput,
      "",
      "Mapa actual validado:",
      currentMarkdown,
      "",
      "Instrucción de refinamiento:",
      "Conserva la información valiosa del mapa actual. No elimines riesgos, acciones o hipótesis importantes salvo que las nuevas respuestas los contradigan claramente. Si cambias el veredicto, explica la incertidumbre que lo justifica.",
      "",
      "Refinamiento solicitado por el usuario:",
      refinementNote || "Refina el mapa a partir del nuevo round crítico.",
    ].join("\n");

    try {
      const generation = await postJSONResult<AIStructuredResponse>(
        "/api/ai/generate-map",
        {
          aiModelId: latestProject.aiModelId,
          answers: refinementAnswers,
          questions: refinementQuestions,
          rawInput: nextRawInput,
          type: latestProject.type,
        }
      );
      const projectWithVersion = appendProjectVersion(latestProject, {
        generationMetrics: generation.meta,
        round: {
          answers: refinementAnswers,
          note: refinementNote || undefined,
          questions: refinementQuestions,
        },
        source: "refinement",
        structuredResponse: generation.data,
      });
      const updatedProject: SparringProject = {
        ...projectWithVersion,
        latestGenerationMetrics: generation.meta,
        title: generation.data.project_title,
        updatedAt: new Date().toISOString(),
      };

      updateProject(updatedProject);
      setActiveProject(updatedProject);
      setProjectName(updatedProject.title);
      setRefinementQuestions([]);
      setRefinementAnswers([]);
      setRefinementNote("");
      setWorkflowStage("map");
      setEditableStage(undefined);
      setUiStatus("idle");
    } catch (error) {
      setAIError(readClientError(error, "No se ha podido refinar el mapa."));
      setWorkflowStage("map");
      setEditableStage(undefined);
      setUiStatus("error");
    }
  }

  function handleSaveProject() {
    if (!latestProject) {
      return;
    }

    const resolvedName =
      projectName.trim() ||
      latestProject.structuredResponse?.project_title ||
      latestProject.title;
    const updatedProject: SparringProject = {
      ...latestProject,
      title: resolvedName,
      updatedAt: new Date().toISOString(),
    };

    updateProject(updatedProject);
    setActiveProject(updatedProject);
    setProjectName(resolvedName);
    setSavedNotice("Proyecto guardado");
    window.setTimeout(() => setSavedNotice(undefined), 1800);
  }

  function handleRefinementAnswerChange(index: number, value: string) {
    setRefinementAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[index] = value;
      return nextAnswers;
    });
  }

  function handleNavigate(view: AppView) {
    setPendingMapChange(undefined);
    setActiveView(view);

    if (view === "new") {
      setActiveProject(undefined);
      setProjectName("");
      setSelectedNode(undefined);
      setRefinementQuestions([]);
      setRefinementAnswers([]);
      setRefinementNote("");
      setQuestionAnswers([]);
      setDraft({
        aiModelId: "gemini-2.5-flash",
        rawInput: "",
        type: "app_product",
      });
      setWorkflowStage("idea");
      setEditableStage(undefined);
      setUiStatus("idle");
    }
  }

  function handleOpenProject(project: SparringProject) {
    const normalizedProject = normalizeProjectVersions(project);

    if (normalizedProject !== project) {
      updateProject(normalizedProject);
    }

    setPendingMapChange(undefined);
    setActiveProject(normalizedProject);
    setProjectName(normalizedProject.title);
    setDraft({
      aiModelId: normalizedProject.aiModelId,
      rawInput: normalizedProject.rawInput,
      type: normalizedProject.type,
    });
    setQuestionAnswers(normalizedProject.sparringAnswers ?? []);
    setRefinementQuestions([]);
    setRefinementAnswers([]);
    setRefinementNote("");
    setSelectedNode(undefined);
    setWorkflowStage(getAvailableStage(normalizedProject));
    setEditableStage(undefined);
    setUiStatus("idle");
    setActiveView("new");
  }

  function handleStageChange(stage: WorkflowStage) {
    if (stageRank[stage] <= stageRank[availableStage]) {
      setWorkflowStage(stage);
      setEditableStage(undefined);
    }
  }

  function handleEditStage(
    stage: Extract<WorkflowStage, "idea" | "questions">
  ) {
    setWorkflowStage(stage);
    setEditableStage(stage);
  }

  function handleArchiveToggle(project: SparringProject) {
    const updatedProject: SparringProject = {
      ...project,
      status:
        project.status === "archived"
          ? project.structuredResponse
            ? "mapped"
            : "draft"
          : "archived",
      updatedAt: new Date().toISOString(),
    };

    updateProject(updatedProject);
    if (activeProject?.id === project.id) {
      setActiveProject(updatedProject);
    }
  }

  function handleAnswerChange(index: number, value: string) {
    setQuestionAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[index] = value;
      return nextAnswers;
    });
  }

  const handleMapLayoutChange = useCallback(
    (layout: MapLayoutState) => {
      if (!latestProject?.structuredResponse) {
        return;
      }

      const updatedProject: SparringProject = {
        ...updateCurrentVersionLayout(latestProject, layout),
        updatedAt: new Date().toISOString(),
      };

      updateProject(updatedProject);
      setActiveProject(updatedProject);
    },
    [latestProject, updateProject]
  );

  function handleDuplicateProject(project: SparringProject) {
    duplicateProject(project);
  }

  function handleDeleteProject(project: SparringProject) {
    removeProject(project.id);

    if (activeProject?.id === project.id) {
      setActiveProject(undefined);
      setProjectName("");
    }
  }

  function handleImportProject(project: SparringProject) {
    importProject(project);
  }

  function handleRestoreVersion(versionId: string) {
    if (!latestProject) {
      return;
    }

    const updatedProject = restoreProjectVersion(latestProject, versionId);
    updateProject(updatedProject);
    setActiveProject(updatedProject);
    setProjectName(updatedProject.title);
    setSelectedNode(undefined);
  }

  function handleDeleteVersion(versionId: string) {
    if (!latestProject) {
      return;
    }

    const updatedProject = deleteProjectVersion(latestProject, versionId);
    updateProject(updatedProject);
    setActiveProject(updatedProject);
  }

  function handleNodeStatusChange(
    nodeId: string,
    status: NodeReviewStatus
  ) {
    if (!latestProject?.structuredResponse) {
      return;
    }

    const nextLayout: MapLayoutState = {
      nodePositions: latestProject.mapLayout?.nodePositions ?? {},
      nodeStatuses: {
        ...(latestProject.mapLayout?.nodeStatuses ?? {}),
        [nodeId]: status,
      },
      viewport: latestProject.mapLayout?.viewport,
    };
    const updatedProject: SparringProject = {
      ...updateCurrentVersionLayout(latestProject, nextLayout),
      updatedAt: new Date().toISOString(),
    };

    updateProject(updatedProject);
    setActiveProject(updatedProject);
    setSelectedNode((currentNode) =>
      currentNode?.id === nodeId
        ? { ...currentNode, reviewStatus: status }
        : currentNode
    );
  }

  function handleCancelMapChange() {
    setPendingMapChange(undefined);
  }

  function handleConfirmMapChange() {
    const change = pendingMapChange;
    setPendingMapChange(undefined);

    if (!change) {
      return;
    }

    if (change.intent === "reanalyze_idea") {
      void analyzeIdea(change.values);
      return;
    }

    if (change.intent === "regenerate_map") {
      void generateMap(change.useAnswers);
      return;
    }

    void refineMap();
  }

  const confirmation = getMapChangeConfirmation(pendingMapChange);

  return (
    <main
      className={cn(
        "min-h-screen bg-background text-foreground antialiased",
        theme === "dark" && "dark"
      )}
    >
      <div className={cn(appGrid, "screen-app-shell")}>
        <Sidebar
          activeView={activeView}
          archivedCount={archivedCount}
          isOpen={isSidebarOpen}
          onNavigate={handleNavigate}
          onToggle={() => setIsSidebarOpen((value) => !value)}
          projectCount={projects.length}
        />
        <section className="flex min-w-0 flex-col border-y bg-canvas lg:min-h-screen lg:border-x lg:border-y-0">
          <TopBar
            activeStage={workflowStage}
            availableStage={availableStage}
            libraryTitle={
              activeView === "drafts"
                ? "Borradores"
                : activeView === "archive"
                  ? "Archivo"
                  : undefined
            }
            onStageChange={handleStageChange}
            onToggleTheme={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
            projectTitle={projectName}
            projectType={draft.type}
            showWorkflow={activeView === "new"}
            theme={theme}
          />
          <div className="min-h-0 flex-1 p-3 md:p-5">
            {activeView === "new" ? (
              <>
                <WorkflowStatusBanner
                  currentVersionLabel={latestProject?.versions?.find(
                    (version) =>
                      version.id === latestProject.currentVersionId
                  )?.label}
                  hasIdea={draft.rawInput.trim().length > 0}
                  hasMap={Boolean(latestProject?.structuredResponse)}
                  questionCount={latestProject?.sparringQuestions?.length ?? 0}
                  refinementQuestionCount={refinementQuestions.length}
                  uiStatus={uiStatus}
                  workflowStage={workflowStage}
                />
                {workflowStage === "idea" ? (
                  <IdeaForm
                    consultationMode={
                      availableStage !== "idea" && editableStage !== "idea"
                    }
                    hasExistingMap={Boolean(latestProject?.structuredResponse)}
                    initialValues={draft}
                    onChange={handleDraftChange}
                    onSubmitDraft={handleAnalyzeIdea}
                    uiStatus={uiStatus}
                  />
                ) : null}

                {workflowStage === "questions" ? (
                  <div className="grid gap-3">
                    <StageContextPanels
                      answers={questionAnswers}
                      draft={draft}
                      includeQuestions={false}
                      onEditStage={handleEditStage}
                      project={latestProject}
                    />
                    <SparringActions
                      answers={questionAnswers}
                      consultationMode={
                        availableStage === "map" &&
                        editableStage !== "questions"
                      }
                      hasExistingMap={Boolean(latestProject?.structuredResponse)}
                      latestProject={latestProject}
                      onAnswerChange={handleAnswerChange}
                      onGenerateMap={(useAnswers) =>
                        void handleGenerateMap(useAnswers)
                      }
                      uiStatus={uiStatus}
                    />
                  </div>
                ) : null}

                {workflowStage === "map" ? (
                  <div className="grid min-h-0 gap-4 md:gap-5">
                    <StageContextPanels
                      answers={questionAnswers}
                      draft={draft}
                      includeQuestions
                      onEditStage={handleEditStage}
                      project={latestProject}
                    />
                    <MapWorkspaceBar
                      latestProject={latestProject}
                      onProjectNameChange={setProjectName}
                      onSaveProject={handleSaveProject}
                      projectName={projectName}
                      savedNotice={savedNotice}
                    >
                      <VersionHistory
                        currentVersionId={latestProject?.currentVersionId}
                        onDeleteVersion={handleDeleteVersion}
                        onRestoreVersion={handleRestoreVersion}
                        versions={latestProject?.versions ?? []}
                      />
                    </MapWorkspaceBar>
                    <CanvasPlaceholder
                      key={`${latestProject?.id ?? "empty-map"}-${latestProject?.currentVersionId ?? "current"}`}
                      hasDraft={draft.rawInput.trim().length > 0}
                      mapLayout={latestProject?.mapLayout}
                      onMapLayoutChange={handleMapLayoutChange}
                      onNodeSelect={setSelectedNode}
                      projectType={draft.type}
                      structuredResponse={latestProject?.structuredResponse}
                    />
                    <RefinementRound
                      answers={refinementAnswers}
                      note={refinementNote}
                      onAnswerChange={handleRefinementAnswerChange}
                      onNoteChange={setRefinementNote}
                      onRefine={() => void handleRefineMap()}
                      questions={refinementQuestions}
                      uiStatus={uiStatus}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <ProjectLibrary
                mode={activeView}
                onArchiveToggle={handleArchiveToggle}
                onDeleteProject={handleDeleteProject}
                onDuplicateProject={handleDuplicateProject}
                onImportProject={handleImportProject}
                onOpenProject={handleOpenProject}
                projects={projects}
              />
            )}
          </div>
        </section>
        <InspectorPanel
          aiError={aiError}
          draft={draft}
          isOpen={isInspectorOpen}
          latestProject={latestProject}
          onNodeStatusChange={handleNodeStatusChange}
          onRefinementNoteChange={setRefinementNote}
          onRequestRefinementQuestions={() =>
            void handleRequestRefinementQuestions()
          }
          onToggle={() => setIsInspectorOpen((value) => !value)}
          refinementNote={refinementNote}
          refinementQuestions={refinementQuestions}
          selectedNode={selectedNode}
          storageError={storageError}
          uiStatus={uiStatus}
          workflowStage={workflowStage}
        />
      </div>
      <MapChangeConfirmation
        confirmLabel={confirmation.confirmLabel}
        description={confirmation.description}
        isOpen={Boolean(pendingMapChange)}
        onCancel={handleCancelMapChange}
        onConfirm={handleConfirmMapChange}
        title={confirmation.title}
      />
      <PrintableReport project={latestProject} />
    </main>
  );
}

function getMapChangeConfirmation(change?: PendingMapChange) {
  if (change?.intent === "reanalyze_idea") {
    return {
      confirmLabel: "Reanalizar idea",
      description:
        "Se calcularán de nuevo el score y las preguntas críticas. Si el análisis termina correctamente, el mapa actual quedará pendiente de regeneración.",
      title: "¿Reanalizar desde la idea?",
    };
  }

  if (change?.intent === "regenerate_map") {
    return {
      confirmLabel: change.useAnswers
        ? "Regenerar con respuestas"
        : "Regenerar sin respuestas",
      description: change.useAnswers
        ? "Las respuestas actuales se usarán para crear una nueva estructura que sustituirá el mapa visible."
        : "Se creará otra estructura sin utilizar las respuestas escritas y sustituirá el mapa visible.",
      title: "¿Sustituir el mapa actual?",
    };
  }

  return {
    confirmLabel: "Aplicar refinamiento",
    description:
      "Las respuestas del nuevo round se incorporarán a una estructura revisada que sustituirá el mapa actual.",
    title: "¿Aplicar este refinamiento?",
  };
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const result = await postJSONResult<T>(url, body);

  return result.data;
}

async function postJSONResult<T>(
  url: string,
  body: unknown
): Promise<APIResult<T>> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 90000);
  let response: Response;
  let payload: unknown;

  try {
    response = await fetch(url, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });
    payload = await response.json().catch(() => undefined);
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(
        "La IA está tardando demasiado. Prueba otra vez o usa Gemini Flash-Lite."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorPayload = isRecord(payload) ? payload : {};
    throw {
      issues: readStringArray(getPath(errorPayload, ["details", "issues"])),
      message:
        readString(errorPayload.error) ??
        `La petición ha fallado con estado ${response.status}.`,
      rawResponse: readString(getPath(errorPayload, ["details", "rawResponse"])),
    };
  }

  if (!isRecord(payload) || !("data" in payload)) {
    throw new Error("La API no ha devuelto datos.");
  }

  return {
    data: payload.data as T,
    meta: isGenerationMetrics(payload.meta) ? payload.meta : undefined,
  };
}

function readClientError(error: unknown, fallback: string): AIErrorState {
  if (isRecord(error)) {
    return {
      issues: readStringArray(error.issues),
      message: readString(error.message) ?? fallback,
      rawResponse: readString(error.rawResponse),
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: fallback };
}

function getPath(source: unknown, path: Array<string | number>): unknown {
  let current = source;

  for (const segment of path) {
    if (typeof segment === "number") {
      if (!Array.isArray(current)) {
        return undefined;
      }
      current = current[segment];
    } else {
      if (!isRecord(current)) {
        return undefined;
      }
      current = current[segment];
    }
  }

  return current;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

function isGenerationMetrics(value: unknown): value is AIGenerationMetrics {
  return (
    isRecord(value) &&
    typeof value.attempts === "number" &&
    typeof value.estimatedCostLabel === "string" &&
    typeof value.estimatedInputTokens === "number" &&
    typeof value.estimatedOutputTokens === "number" &&
    typeof value.generatedAt === "string" &&
    typeof value.latencyMs === "number" &&
    typeof value.modelId === "string"
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
