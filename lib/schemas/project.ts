import { z } from "zod";

import { mapGenerationSchema } from "@/lib/schemas/ai";

export const projectTypeSchema = z.enum(["app_product", "business_strategy"]);

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
  "questioning",
  "generating",
  "mapping",
  "error",
]);

export const sparringProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: projectTypeSchema,
  status: projectStatusSchema,
  rawInput: z.string(),
  readinessScore: z.number().min(0).max(100).optional(),
  sparringQuestions: z.array(z.string()).optional(),
  sparringAnswers: z.array(z.string()).optional(),
  structuredResponse: mapGenerationSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const localProjectsSchema = z.array(sparringProjectSchema);
