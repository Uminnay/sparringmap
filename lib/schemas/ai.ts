import { z } from "zod";

export const aiNodeSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
});

export const initialAnalysisSchema = z.object({
  readiness_score: z.number().min(0).max(100),
  questions: z.array(z.string().min(1)).max(3),
});

export const verdictSchema = z.object({
  status: z.enum(["advance", "validate", "reframe", "discard"]),
  headline: z.string().min(1),
  rationale: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1).max(5),
  uncertainty: z.array(z.string().min(1)).min(1).max(5),
  next_decision: z.string().min(1),
});

export const mapGenerationSchema = z.object({
  project_title: z.string().min(1),
  summary: z.string().min(1),
  central_idea: z.string().min(1),
  sections: z.object({
    objectives: z.array(aiNodeSchema).max(4),
    risks: z.array(aiNodeSchema).max(4),
    actions: z.array(aiNodeSchema).max(5),
    hypotheses: z.array(aiNodeSchema).max(4),
  }),
  diagnostic: z.object({
    summary: z.string().min(1),
    weak_points: z.array(z.string().min(1)),
    critical_risks: z.array(z.string().min(1)),
    next_steps: z.array(z.string().min(1)),
  }),
  verdict: verdictSchema.optional(),
});

export const aiMapGenerationSchema = mapGenerationSchema.extend({
  verdict: verdictSchema,
});

export type AIInitialAnalysis = z.infer<typeof initialAnalysisSchema>;
export type AIStructuredResponse = z.infer<typeof mapGenerationSchema>;

export interface AIValidationFailure {
  message: string;
  rawResponse?: string;
  issues: string[];
}

export type AIValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AIValidationFailure };

export interface AIValidationAttempt {
  rawResponse?: string;
  value: unknown;
}

export type AIResponseProducer = () => Promise<AIValidationAttempt>;

export function validateAIResponse<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  rawResponse?: string
): AIValidationResult<T> {
  const result = schema.safeParse(value);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  return {
    ok: false,
    error: {
      message:
        "La IA ha devuelto un resultado incompleto. Volveremos a intentarlo una vez.",
      rawResponse,
      issues: result.error.issues.map((issue) => issue.message),
    },
  };
}

export async function validateAIResponseWithRetry<T>(
  schema: z.ZodSchema<T>,
  produceResponse: AIResponseProducer
): Promise<AIValidationResult<T>> {
  const firstAttempt = await produceResponse();
  const firstResult = validateAIResponse(
    schema,
    firstAttempt.value,
    firstAttempt.rawResponse
  );

  if (firstResult.ok) {
    return firstResult;
  }

  const secondAttempt = await produceResponse();
  const secondResult = validateAIResponse(
    schema,
    secondAttempt.value,
    secondAttempt.rawResponse
  );

  if (secondResult.ok) {
    return secondResult;
  }

  return {
    ok: false,
    error: {
      message:
        "La IA no ha devuelto un resultado utilizable tras dos intentos. Tu contenido anterior se mantiene intacto.",
      rawResponse: secondAttempt.rawResponse ?? firstAttempt.rawResponse,
      issues: secondResult.error.issues,
    },
  };
}
