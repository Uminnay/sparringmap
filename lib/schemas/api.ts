import { z } from "zod";

import { aiModelIdSchema, projectTypeSchema } from "@/lib/schemas/project";
import { mapGenerationSchema } from "@/lib/schemas/ai";

export const analyzeIdeaRequestSchema = z.object({
  aiModelId: aiModelIdSchema,
  rawInput: z.string().min(1),
  type: projectTypeSchema,
});

export const generateMapRequestSchema = z.object({
  aiModelId: aiModelIdSchema,
  answers: z.array(z.string()).optional(),
  questions: z.array(z.string()).optional(),
  rawInput: z.string().min(1),
  type: projectTypeSchema,
});

export const refineQuestionsRequestSchema = z.object({
  aiModelId: aiModelIdSchema,
  rawInput: z.string().min(1),
  structuredResponse: mapGenerationSchema,
  type: projectTypeSchema,
  userNote: z.string().optional(),
});
