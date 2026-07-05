export const initialAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["readiness_score", "questions"],
  properties: {
    readiness_score: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Score de claridad y preparación de la idea.",
    },
    questions: {
      type: "array",
      maxItems: 3,
      items: {
        type: "string",
      },
      description: "De 0 a 3 preguntas críticas para mejorar el mapa.",
    },
  },
} as const;

const aiNodeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "description", "priority"],
  properties: {
    label: {
      type: "string",
    },
    description: {
      type: "string",
    },
    priority: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
  },
} as const;

export const mapGenerationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "project_title",
    "summary",
    "central_idea",
    "sections",
    "diagnostic",
    "verdict",
  ],
  properties: {
    project_title: {
      type: "string",
    },
    summary: {
      type: "string",
    },
    central_idea: {
      type: "string",
    },
    sections: {
      type: "object",
      additionalProperties: false,
      required: ["objectives", "risks", "actions", "hypotheses"],
      properties: {
        objectives: {
          type: "array",
          maxItems: 4,
          items: aiNodeJsonSchema,
        },
        risks: {
          type: "array",
          maxItems: 4,
          items: aiNodeJsonSchema,
        },
        actions: {
          type: "array",
          maxItems: 5,
          items: aiNodeJsonSchema,
        },
        hypotheses: {
          type: "array",
          maxItems: 4,
          items: aiNodeJsonSchema,
        },
      },
    },
    diagnostic: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "weak_points", "critical_risks", "next_steps"],
      properties: {
        summary: {
          type: "string",
        },
        weak_points: {
          type: "array",
          items: {
            type: "string",
          },
        },
        critical_risks: {
          type: "array",
          items: {
            type: "string",
          },
        },
        next_steps: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
    verdict: {
      type: "object",
      additionalProperties: false,
      required: [
        "status",
        "headline",
        "rationale",
        "evidence",
        "uncertainty",
        "next_decision",
      ],
      properties: {
        status: {
          type: "string",
          enum: ["advance", "validate", "reframe", "discard"],
        },
        headline: {
          type: "string",
        },
        rationale: {
          type: "string",
        },
        evidence: {
          type: "array",
          maxItems: 5,
          items: {
            type: "string",
          },
        },
        uncertainty: {
          type: "array",
          maxItems: 5,
          items: {
            type: "string",
          },
        },
        next_decision: {
          type: "string",
        },
      },
    },
  },
} as const;
