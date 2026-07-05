"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  ClipboardCopy,
  Download,
  FileJson,
  Printer,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatProjectMarkdown } from "@/lib/markdown";
import { createProjectTransferJSON } from "@/lib/project-transfer";
import type { SparringProject } from "@/types";

interface MapWorkspaceBarProps {
  children?: ReactNode;
  latestProject?: SparringProject;
  onProjectNameChange: (value: string) => void;
  onSaveProject: () => void;
  projectName: string;
  savedNotice?: string;
}

export function MapWorkspaceBar({
  children,
  latestProject,
  onProjectNameChange,
  onSaveProject,
  projectName,
  savedNotice,
}: MapWorkspaceBarProps) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const canExport = Boolean(latestProject?.structuredResponse);

  async function handleCopyMarkdown() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    await navigator.clipboard.writeText(formatProjectMarkdown(latestProject));
    setCopiedMarkdown(true);
    window.setTimeout(() => setCopiedMarkdown(false), 1800);
  }

  function handleDownloadMarkdown() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    downloadTextFile(
      `${safeFilename(latestProject.title)}.md`,
      formatProjectMarkdown(latestProject),
      "text/markdown"
    );
  }

  function handleDownloadJSON() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    downloadTextFile(
      `${safeFilename(latestProject.title)}.json`,
      createProjectTransferJSON(latestProject),
      "application/json"
    );
  }

  return (
    <section className="rounded-xl border bg-card/90 p-3 shadow-sm backdrop-blur md:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="grid min-w-0 flex-1 gap-1 text-xs font-medium uppercase text-muted-foreground md:grid-cols-[112px_minmax(0,1fr)] md:items-center">
          Proyecto
          <input
            className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm font-normal normal-case text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            disabled={!latestProject}
            onChange={(event) => onProjectNameChange(event.currentTarget.value)}
            placeholder="Nombre para guardar"
            value={projectName}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!latestProject}
            onClick={onSaveProject}
            type="button"
            variant="outline"
          >
            <Save aria-hidden="true" data-icon="inline-start" />
            {savedNotice ?? "Guardar"}
          </Button>
          <Button
            disabled={!canExport}
            onClick={() => void handleCopyMarkdown()}
            type="button"
            variant="outline"
          >
            {copiedMarkdown ? (
              <Check aria-hidden="true" data-icon="inline-start" />
            ) : (
              <ClipboardCopy aria-hidden="true" data-icon="inline-start" />
            )}
            {copiedMarkdown ? "Copiado" : "Copiar"}
          </Button>
          <Button
            disabled={!canExport}
            onClick={handleDownloadMarkdown}
            type="button"
            variant="outline"
          >
            <Download aria-hidden="true" data-icon="inline-start" />
            MD
          </Button>
          <Button
            disabled={!canExport}
            onClick={handleDownloadJSON}
            type="button"
            variant="outline"
          >
            <FileJson aria-hidden="true" data-icon="inline-start" />
            JSON
          </Button>
          <Button
            disabled={!canExport}
            onClick={() => window.print()}
            title="Abrir diálogo de impresión con informe limpio"
            type="button"
            variant="outline"
          >
            <Printer aria-hidden="true" data-icon="inline-start" />
            Informe PDF
          </Button>
        </div>
      </div>

      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

function downloadTextFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "") || "sparringmap"
  );
}
