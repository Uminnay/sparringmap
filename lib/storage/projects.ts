"use client";

import { localProjectsSchema } from "@/lib/schemas/project";
import type { ProjectType, SparringProject } from "@/types";

const STORAGE_KEY = "sparringmap.projects.v1";

export interface CreateDraftProjectInput {
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

    return { projects: result.data };
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
  rawInput,
  type,
}: CreateDraftProjectInput): SparringProject {
  const now = new Date().toISOString();
  const title = inferProjectTitle(rawInput);

  return {
    id: createProjectId(now),
    title,
    type,
    status: "draft",
    rawInput,
    createdAt: now,
    updatedAt: now,
  };
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

function inferProjectTitle(rawInput: string) {
  const firstLine = rawInput.trim().split(/\r?\n/)[0] ?? "";
  const title = firstLine.slice(0, 72).trim();

  return title || "Nuevo mapa";
}
