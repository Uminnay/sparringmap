"use client";

import { localProjectsSchema } from "@/lib/schemas/project";
import { normalizeProjectVersions } from "@/lib/versions";
import type { AIModelId, ProjectType, SparringProject } from "@/types";

const STORAGE_KEY = "sparringmap.projects.v1";

export interface CreateDraftProjectInput {
  aiModelId: AIModelId;
  rawInput: string;
  type: ProjectType;
}

export interface ProjectStorageSnapshot {
  projects: SparringProject[];
  error?: string;
}

export function loadProjects(): ProjectStorageSnapshot {
  if (typeof window === "undefined") {
    return { projects: [] };
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return { projects: [] };
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    const result = localProjectsSchema.safeParse(parsedValue);

    if (!result.success) {
      return {
        projects: [],
        error:
          "Los proyectos locales no tienen el formato esperado y no se han cargado.",
      };
    }

    return {
      projects: result.data.map((project) =>
        normalizeProjectVersions(project)
      ),
    };
  } catch {
    return {
      projects: [],
      error: "No se han podido leer los proyectos guardados en este navegador.",
    };
  }
}

export function saveProjects(projects: SparringProject[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createDraftProject({
  aiModelId,
  rawInput,
  type,
}: CreateDraftProjectInput): SparringProject {
  const now = new Date().toISOString();
  const title = inferProjectTitle(rawInput);

  return {
    id: createProjectId(now),
    title,
    type,
    aiModelId,
    status: "draft",
    rawInput,
    createdAt: now,
    updatedAt: now,
  };
}

export function createProjectCopy(
  project: SparringProject,
  existingIds: string[],
  titleSuffix = "copia"
) {
  const now = new Date().toISOString();

  return {
    ...project,
    id: createAvailableProjectId(now, existingIds),
    title: `${project.title} (${titleSuffix})`,
    status: project.structuredResponse ? ("mapped" as const) : ("draft" as const),
    createdAt: now,
    updatedAt: now,
  };
}

export function prepareImportedProject(
  project: SparringProject,
  existingIds: string[]
) {
  const now = new Date().toISOString();
  const id = existingIds.includes(project.id)
    ? createAvailableProjectId(now, existingIds)
    : project.id;

  return {
    ...project,
    id,
    status: project.status === "archived" ? ("draft" as const) : project.status,
    title: existingIds.includes(project.id)
      ? `${project.title} (importado)`
      : project.title,
    updatedAt: now,
  };
}

export function replaceProject(project: SparringProject) {
  const { projects } = loadProjects();
  const nextProjects = projects.map((item) =>
    item.id === project.id ? project : item
  );

  saveProjects(nextProjects);
  return nextProjects;
}

export function upsertProject(project: SparringProject) {
  const { projects } = loadProjects();
  const existingIndex = projects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.unshift(project);
  }

  saveProjects(projects);
  return projects;
}

function createProjectId(createdAt: string) {
  return `project-${createdAt.replace(/[^0-9]/g, "")}`;
}

function createAvailableProjectId(createdAt: string, existingIds: string[]) {
  const baseId = createProjectId(createdAt);
  let candidate = baseId;
  let suffix = 2;

  while (existingIds.includes(candidate)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function inferProjectTitle(rawInput: string) {
  const firstLine = rawInput.trim().split(/\r?\n/)[0] ?? "";
  const title = firstLine.slice(0, 72).trim();

  return title || "Nuevo mapa";
}
