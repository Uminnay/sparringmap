import { z } from "zod";

import { mapGenerationSchema } from "./ai.ts";

export const projectTypeSchema = z.enum(["app_product", "business_strategy"]);

export const aiModelIdSchema = z.enum([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash",
  "gpt-5.4-mini",
  "gpt-5.5",
]);

export const nodeTypeSchema = z.enum([
  "objective",
  "risk",
  "action",
  "hypothesis",
  "central",
]);

export const projectStatusSchema = z.enum(["draft", "mapped", "archived"]);

export const uiStatusSchema = z.enum([
  "idle",
  "analyzing",
  "generating",
  "error",
]);

export const mapPositionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

export const mapViewportSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  zoom: z.number().min(0.1).max(4),
});

export const nodeReviewStatusSchema = z.enum([
  "pending",
  "validated",
  "dismissed",
  "blocked",
]);

export const mapLayoutSchema = z.object({
  nodePositions: z.record(z.string(), mapPositionSchema),
  nodeStatuses: z.record(z.string(), nodeReviewStatusSchema).optional(),
  viewport: mapViewportSchema.optional(),
});

export const sparringRoundSchema = z.object({
  answers: z.array(z.string()),
  note: z.string().optional(),
  questions: z.array(z.string()),
});

export const mapVersionSourceSchema = z.enum([
  "initial",
  "regeneration",
  "refinement",
  "restored",
]);

export const aiGenerationMetricsSchema = z.object({
  attempts: z.number().int().min(1),
  estimatedCostLabel: z.string().min(1),
  estimatedInputTokens: z.number().int().min(0),
  estimatedOutputTokens: z.number().int().min(0),
  generatedAt: z.string().datetime(),
  latencyMs: z.number().int().min(0),
  modelId: aiModelIdSchema,
});

export const mapVersionSchema = z.object({
  createdAt: z.string().datetime(),
  generationMetrics: aiGenerationMetricsSchema.optional(),
  id: z.string().min(1),
  label: z.string().min(1),
  mapLayout: mapLayoutSchema.optional(),
  round: sparringRoundSchema.optional(),
  source: mapVersionSourceSchema,
  structuredResponse: mapGenerationSchema,
});

export const sparringProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: projectTypeSchema,
  aiModelId: aiModelIdSchema,
  status: projectStatusSchema,
  rawInput: z.string(),
  readinessScore: z.number().min(0).max(100).optional(),
  sparringQuestions: z.array(z.string()).optional(),
  sparringAnswers: z.array(z.string()).optional(),
  structuredResponse: mapGenerationSchema.optional(),
  mapLayout: mapLayoutSchema.optional(),
  latestGenerationMetrics: aiGenerationMetricsSchema.optional(),
  currentVersionId: z.string().min(1).optional(),
  versions: z.array(mapVersionSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const localProjectsSchema = z.array(sparringProjectSchema);
