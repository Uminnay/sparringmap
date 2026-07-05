import { sparringProjectSchema } from "./schemas/project.ts";
import type { SparringProject } from "@/types";

const TRANSFER_FORMAT = "sparringmap-project";
const TRANSFER_VERSION = 1;

interface ProjectTransferFile {
  exportedAt: string;
  format: typeof TRANSFER_FORMAT;
  project: SparringProject;
  version: typeof TRANSFER_VERSION;
}

export function createProjectTransferJSON(project: SparringProject) {
  const transfer: ProjectTransferFile = {
    exportedAt: new Date().toISOString(),
    format: TRANSFER_FORMAT,
    project,
    version: TRANSFER_VERSION,
  };

  return JSON.stringify(transfer, null, 2);
}

export function parseProjectTransfer(text: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      error: "El archivo no contiene JSON válido.",
      ok: false as const,
    };
  }

  const candidate =
    isRecord(parsed) &&
    parsed.format === TRANSFER_FORMAT &&
    parsed.version === TRANSFER_VERSION
      ? parsed.project
      : parsed;
  const result = sparringProjectSchema.safeParse(candidate);

  if (!result.success) {
    return {
      error:
        "El archivo no es un proyecto válido de SparringMap o está incompleto.",
      ok: false as const,
    };
  }

  return {
    ok: true as const,
    project: result.data,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
