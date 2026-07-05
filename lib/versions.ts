import type {
  AIGenerationMetrics,
  AIStructuredResponse,
  MapLayoutState,
  MapVersion,
  MapVersionSource,
  SparringProject,
  SparringRound,
} from "@/types";

interface CreateVersionInput {
  createdAt?: string;
  mapLayout?: MapLayoutState;
  generationMetrics?: AIGenerationMetrics;
  round?: SparringRound;
  source: MapVersionSource;
  structuredResponse: AIStructuredResponse;
  versionNumber: number;
}

export interface VersionComparison {
  added: string[];
  diagnosticChanged: boolean;
  modified: string[];
  removed: string[];
}

export function normalizeProjectVersions(
  project: SparringProject
): SparringProject {
  if (!project.structuredResponse) {
    return project;
  }

  const existingVersions = project.versions ?? [];

  if (existingVersions.length > 0) {
    const activeVersion =
      existingVersions.find(
        (version) => version.id === project.currentVersionId
      ) ?? existingVersions[existingVersions.length - 1];

    return {
      ...project,
      currentVersionId: activeVersion.id,
      versions: existingVersions,
    };
  }

  const firstVersion = createMapVersion({
    createdAt: project.updatedAt,
    mapLayout: project.mapLayout,
    round: {
      answers: project.sparringAnswers ?? [],
      questions: project.sparringQuestions ?? [],
    },
    source: "initial",
    structuredResponse: project.structuredResponse,
    versionNumber: 1,
  });

  return {
    ...project,
    currentVersionId: firstVersion.id,
    versions: [firstVersion],
  };
}

export function appendProjectVersion(
  project: SparringProject,
  input: Omit<CreateVersionInput, "versionNumber">
) {
  const normalized = normalizeProjectVersions(project);
  const versions = normalized.versions ?? [];
  const version = createMapVersion({
    ...input,
    versionNumber: versions.length + 1,
  });

  return {
    ...normalized,
    currentVersionId: version.id,
    latestGenerationMetrics: version.generationMetrics,
    mapLayout: version.mapLayout,
    structuredResponse: version.structuredResponse,
    versions: [...versions, version],
  };
}

export function restoreProjectVersion(
  project: SparringProject,
  versionId: string
) {
  const normalized = normalizeProjectVersions(project);
  const version = normalized.versions?.find((item) => item.id === versionId);

  if (!version) {
    return normalized;
  }

  return {
    ...normalized,
    currentVersionId: version.id,
    mapLayout: version.mapLayout,
    structuredResponse: version.structuredResponse,
    title: version.structuredResponse.project_title,
    updatedAt: new Date().toISOString(),
  };
}

export function deleteProjectVersion(
  project: SparringProject,
  versionId: string
) {
  const normalized = normalizeProjectVersions(project);

  if (normalized.currentVersionId === versionId) {
    return normalized;
  }

  return {
    ...normalized,
    versions: normalized.versions?.filter(
      (version) => version.id !== versionId
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateCurrentVersionLayout(
  project: SparringProject,
  mapLayout: MapLayoutState
) {
  const normalized = normalizeProjectVersions(project);

  return {
    ...normalized,
    mapLayout,
    versions: normalized.versions?.map((version) =>
      version.id === normalized.currentVersionId
        ? { ...version, mapLayout }
        : version
    ),
  };
}

export function compareMapVersions(
  previous: MapVersion,
  next: MapVersion
): VersionComparison {
  const previousNodes = indexVersionNodes(previous);
  const nextNodes = indexVersionNodes(next);
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  for (const [key, node] of nextNodes) {
    const previousNode = previousNodes.get(key);

    if (!previousNode) {
      added.push(node.label);
      continue;
    }

    if (
      previousNode.description !== node.description ||
      previousNode.priority !== node.priority
    ) {
      modified.push(node.label);
    }
  }

  for (const [key, node] of previousNodes) {
    if (!nextNodes.has(key)) {
      removed.push(node.label);
    }
  }

  return {
    added,
    diagnosticChanged:
      JSON.stringify(previous.structuredResponse.diagnostic) !==
      JSON.stringify(next.structuredResponse.diagnostic),
    modified,
    removed,
  };
}

function createMapVersion(input: CreateVersionInput): MapVersion {
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    createdAt,
    generationMetrics: input.generationMetrics,
    id: `version-${input.versionNumber}-${createdAt.replace(/[^0-9]/g, "")}`,
    label: `Versión ${input.versionNumber}`,
    mapLayout: input.mapLayout,
    round: input.round,
    source: input.source,
    structuredResponse: input.structuredResponse,
  };
}

function indexVersionNodes(version: MapVersion) {
  const response = version.structuredResponse;
  const entries = [
    [
      "central",
      {
        description: response.summary,
        label: response.central_idea,
        priority: undefined,
      },
    ],
    ...sectionEntries("objective", response.sections.objectives),
    ...sectionEntries("risk", response.sections.risks),
    ...sectionEntries("action", response.sections.actions),
    ...sectionEntries("hypothesis", response.sections.hypotheses),
  ] as Array<
    [
      string,
      { description: string; label: string; priority: string | undefined },
    ]
  >;

  return new Map(entries);
}

function sectionEntries(
  type: string,
  nodes: Array<{ description: string; label: string; priority: string }>
) {
  return nodes.map((node) => [
    `${type}:${node.label.toLocaleLowerCase("es")}`,
    node,
  ]) as Array<
    [
      string,
      { description: string; label: string; priority: string | undefined },
    ]
  >;
}
