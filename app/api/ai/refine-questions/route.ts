import { NextResponse } from "next/server";

import { initialAnalysisJsonSchema } from "@/lib/ai/json-schemas";
import { buildRefinementQuestionsPrompt } from "@/lib/ai/prompts";
import { AIProviderError, generateStructuredJSON } from "@/lib/ai/providers";
import { refineQuestionsRequestSchema } from "@/lib/schemas/api";
import {
  initialAnalysisSchema,
  type AIStructuredResponse,
  validateAIResponseWithRetry,
} from "@/lib/schemas/ai";

export async function POST(request: Request) {
  const body = await readRequestBody(request);
  const parsedBody = refineQuestionsRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Solicitud inválida para refinar preguntas." },
      { status: 400 }
    );
  }

  const prompt = buildRefinementQuestionsPrompt({
    rawInput: parsedBody.data.rawInput,
    structuredSummary: summarizeStructuredResponse(
      parsedBody.data.structuredResponse
    ),
    type: parsedBody.data.type,
    userNote: parsedBody.data.userNote,
  });

  try {
    const result = await validateAIResponseWithRetry(
      initialAnalysisSchema,
      () =>
        generateStructuredJSON({
          jsonSchema: initialAnalysisJsonSchema,
          modelId: parsedBody.data.aiModelId,
          prompt,
          schemaName: "sparring_refinement_questions",
        })
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message, details: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return NextResponse.json(
      { error: readErrorMessage(error) },
      { status: error instanceof AIProviderError ? 502 : 500 }
    );
  }
}

async function readRequestBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return undefined;
  }
}

function summarizeStructuredResponse(response: AIStructuredResponse) {
  return [
    `Título: ${response.project_title}`,
    `Resumen: ${response.summary}`,
    `Idea central: ${response.central_idea}`,
    `Objetivos: ${response.sections.objectives.map((item) => item.label).join(", ")}`,
    `Riesgos: ${response.sections.risks.map((item) => item.label).join(", ")}`,
    `Acciones: ${response.sections.actions.map((item) => item.label).join(", ")}`,
    `Hipótesis: ${response.sections.hypotheses.map((item) => item.label).join(", ")}`,
    `Diagnóstico: ${response.diagnostic.summary}`,
    response.verdict
      ? `Veredicto: ${response.verdict.status} - ${response.verdict.headline}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se han podido generar preguntas de refinamiento.";
}
