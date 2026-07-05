import { NextResponse } from "next/server";

import { mapGenerationJsonSchema } from "@/lib/ai/json-schemas";
import { createGenerationMetrics } from "@/lib/ai/metrics";
import { buildMapGenerationPrompt } from "@/lib/ai/prompts";
import { AIProviderError, generateStructuredJSON } from "@/lib/ai/providers";
import { generateMapRequestSchema } from "@/lib/schemas/api";
import {
  aiMapGenerationSchema,
  validateAIResponseWithRetry,
} from "@/lib/schemas/ai";

export async function POST(request: Request) {
  const body = await readRequestBody(request);
  const parsedBody = generateMapRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Solicitud inválida para generar el mapa." },
      { status: 400 }
    );
  }

  const prompt = buildMapGenerationPrompt(parsedBody.data);
  const startedAt = Date.now();
  let attempts = 0;
  let rawResponse: string | undefined;

  try {
    const result = await validateAIResponseWithRetry(
      aiMapGenerationSchema,
      async () => {
        attempts += 1;
        const aiResult = await generateStructuredJSON({
          jsonSchema: mapGenerationJsonSchema,
          modelId: parsedBody.data.aiModelId,
          prompt,
          schemaName: "sparring_map_generation",
        });

        rawResponse = aiResult.rawResponse;
        return aiResult;
      }
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message, details: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      data: result.data,
      meta: createGenerationMetrics({
        attempts,
        latencyMs: Date.now() - startedAt,
        modelId: parsedBody.data.aiModelId,
        prompt,
        rawResponse,
      }),
    });
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

  return "No se ha podido generar el mapa.";
}
