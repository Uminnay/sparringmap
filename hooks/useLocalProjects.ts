"use client";

import { useEffect, useState } from "react";

import {
  createProjectCopy,
  createDraftProject,
  loadProjects,
  prepareImportedProject,
  saveProjects,
  type CreateDraftProjectInput,
} from "@/lib/storage/projects";
import type { SparringProject } from "@/types";

export function useLocalProjects() {
  const [projects, setProjects] = useState<SparringProject[]>([]);
  const [storageError, setStorageError] = useState<string>();

  useEffect(() => {
    window.queueMicrotask(() => {
      const snapshot = loadProjects();
      setProjects(snapshot.projects);
      setStorageError(snapshot.error);
    });
  }, []);

  function createDraft(input: CreateDraftProjectInput) {
    const project = createDraftProject(input);

    setProjects((currentProjects) => {
      const nextProjects = [project, ...currentProjects];
      saveProjects(nextProjects);
      return nextProjects;
    });
    setStorageError(undefined);

    return project;
  }

  function updateProject(project: SparringProject) {
    setProjects((currentProjects) => {
      const existingProject = currentProjects.some(
        (item) => item.id === project.id
      );
      const nextProjects = existingProject
        ? currentProjects.map((item) =>
            item.id === project.id ? project : item
          )
        : [project, ...currentProjects];

      saveProjects(nextProjects);
      return nextProjects;
    });
    setStorageError(undefined);

    return project;
  }

  function duplicateProject(project: SparringProject) {
    const copy = createProjectCopy(
      project,
      projects.map((item) => item.id)
    );

    setProjects((currentProjects) => {
      const nextProjects = [copy, ...currentProjects];
      saveProjects(nextProjects);
      return nextProjects;
    });
    setStorageError(undefined);

    return copy;
  }

  function importProject(project: SparringProject) {
    const importedProject = prepareImportedProject(
      project,
      projects.map((item) => item.id)
    );

    setProjects((currentProjects) => {
      const nextProjects = [importedProject, ...currentProjects];
      saveProjects(nextProjects);
      return nextProjects;
    });
    setStorageError(undefined);

    return importedProject;
  }

  function removeProject(projectId: string) {
    setProjects((currentProjects) => {
      const nextProjects = currentProjects.filter(
        (project) => project.id !== projectId
      );
      saveProjects(nextProjects);
      return nextProjects;
    });
    setStorageError(undefined);
  }

  return {
    createDraft,
    duplicateProject,
    importProject,
    projects,
    removeProject,
    storageError,
    updateProject,
  };
}
