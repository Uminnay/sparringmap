import { NextResponse } from "next/server";

import { initialAnalysisJsonSchema } from "@/lib/ai/json-schemas";
import { buildInitialAnalysisPrompt } from "@/lib/ai/prompts";
import { AIProviderError, generateStructuredJSON } from "@/lib/ai/providers";
import { analyzeIdeaRequestSchema } from "@/lib/schemas/api";
import {
  initialAnalysisSchema,
  validateAIResponseWithRetry,
} from "@/lib/schemas/ai";

export async function POST(request: Request) {
  const body = await readRequestBody(request);
  const parsedBody = analyzeIdeaRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Solicitud inválida para analizar la idea." },
      { status: 400 }
    );
  }

  const prompt = buildInitialAnalysisPrompt(parsedBody.data);

  try {
    const result = await validateAIResponseWithRetry(
      initialAnalysisSchema,
      () =>
        generateStructuredJSON({
          jsonSchema: initialAnalysisJsonSchema,
          modelId: parsedBody.data.aiModelId,
          prompt,
          schemaName: "sparring_initial_analysis",
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

function readErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se ha podido analizar la idea.";
}
