import type { AIStructuredResponse } from "@/lib/schemas/ai";

export type ProjectType = "app_product" | "business_strategy";

export type NodeType =
  | "objective"
  | "risk"
  | "action"
  | "hypothesis"
  | "central";

export type ProjectStatus = "draft" | "mapped" | "archived";

export type UIStatus =
  | "idle"
  | "analyzing"
  | "questioning"
  | "generating"
  | "mapping"
  | "error";

export type AIPriority = "low" | "medium" | "high";

export interface AINode {
  label: string;
  description: string;
  priority: AIPriority;
}

export type { AIStructuredResponse };

export interface SparringProject {
  id: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  rawInput: string;
  readinessScore?: number;
  sparringQuestions?: string[];
  sparringAnswers?: string[];
  structuredResponse?: AIStructuredResponse;
  createdAt: string;
  updatedAt: string;
}
