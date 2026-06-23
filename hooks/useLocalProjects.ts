"use client";

import { useEffect, useState } from "react";

import {
  createDraftProject,
  loadProjects,
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
    const nextProjects = [project, ...projects];

    saveProjects(nextProjects);
    setProjects(nextProjects);
    setStorageError(undefined);

    return project;
  }

  return {
    createDraft,
    projects,
    storageError,
  };
}
