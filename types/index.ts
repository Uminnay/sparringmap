import type { AIStructuredResponse } from "@/lib/schemas/ai";

export type ProjectType = "app_product" | "business_strategy";

export type AIModelId =
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite"
  | "gemini-3.5-flash"
  | "gpt-5.4-mini"
  | "gpt-5.5";

export type NodeType =
  | "objective"
  | "risk"
  | "action"
  | "hypothesis"
  | "central";

export type ProjectStatus = "draft" | "mapped" | "archived";

export type WorkflowStage = "idea" | "questions" | "map";

export type UIStatus = "idle" | "analyzing" | "generating" | "error";

export type MapChangeIntent =
  | "reanalyze_idea"
  | "regenerate_map"
  | "create_refinement_round"
  | "refine_current_map";

export type AIPriority = "low" | "medium" | "high";

export type NodeReviewStatus =
  | "pending"
  | "validated"
  | "dismissed"
  | "blocked";

export interface AINode {
  label: string;
  description: string;
  priority: AIPriority;
}

export interface MapNodeSelection {
  description: string;
  id: string;
  kind: NodeType;
  label: string;
  priority?: AIPriority;
  reviewStatus?: NodeReviewStatus;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface MapViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface MapLayoutState {
  nodePositions: Record<string, MapPosition>;
  nodeStatuses?: Record<string, NodeReviewStatus>;
  viewport?: MapViewport;
}

export type MapVersionSource =
  | "initial"
  | "regeneration"
  | "refinement"
  | "restored";

export type VerdictStatus = "advance" | "validate" | "reframe" | "discard";

export interface AIVerdict {
  evidence: string[];
  headline: string;
  next_decision: string;
  rationale: string;
  status: VerdictStatus;
  uncertainty: string[];
}

export interface AIGenerationMetrics {
  attempts: number;
  estimatedCostLabel: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  generatedAt: string;
  latencyMs: number;
  modelId: AIModelId;
}

export interface SparringRound {
  answers: string[];
  note?: string;
  questions: string[];
}

export interface MapVersion {
  createdAt: string;
  id: string;
  label: string;
  mapLayout?: MapLayoutState;
  round?: SparringRound;
  source: MapVersionSource;
  structuredResponse: AIStructuredResponse;
  generationMetrics?: AIGenerationMetrics;
}

export type { AIStructuredResponse };

export interface SparringProject {
  id: string;
  title: string;
  type: ProjectType;
  aiModelId: AIModelId;
  status: ProjectStatus;
  rawInput: string;
  readinessScore?: number;
  sparringQuestions?: string[];
  sparringAnswers?: string[];
  structuredResponse?: AIStructuredResponse;
  mapLayout?: MapLayoutState;
  latestGenerationMetrics?: AIGenerationMetrics;
  currentVersionId?: string;
  versions?: MapVersion[];
  createdAt: string;
  updatedAt: string;
}
