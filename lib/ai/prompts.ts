import type { ProjectType } from "@/types";

const projectTypeLabel: Record<ProjectType, string> = {
  app_product: "producto/app digital",
  business_strategy: "estrategia de negocio",
};

const strategicQualityRules = [
  "Sé específico: evita frases genéricas que servirían para cualquier proyecto.",
  "Distingue hechos, hipótesis e incertidumbres.",
  "Prioriza lo que cambia la decisión, no lo que solo suena bien.",
  "Cuando falten datos, dilo explícitamente y convierte esa incertidumbre en una próxima decisión.",
  "No confundas acciones con deseos: cada acción debe poder ejecutarse o validarse.",
].join("\n");

export function buildInitialAnalysisPrompt(input: {
  rawInput: string;
  type: ProjectType;
}) {
  return [
    "Analiza esta idea como Senior Product Manager escéptico, práctico y constructivo.",
    "No hagas coaching motivacional ni consultoría genérica.",
    "Devuelve solo el objeto JSON solicitado por el schema.",
    "",
    strategicQualityRules,
    "",
    `Tipo de proyecto: ${projectTypeLabel[input.type]}`,
    "Idea:",
    input.rawInput,
    "",
    "Evalúa si hay suficiente claridad para generar un mapa estratégico accionable.",
    "Si el readiness_score es 80 o más, puedes devolver questions vacío.",
    "Si es menor de 80, devuelve de 1 a 3 preguntas críticas.",
    "Cada pregunta debe desbloquear una decisión relevante para el mapa.",
  ].join("\n");
}

export function buildMapGenerationPrompt(input: {
  answers?: string[];
  questions?: string[];
  rawInput: string;
  type: ProjectType;
}) {
  const answeredContext =
    input.questions && input.questions.length > 0
      ? [
          "",
          "Preguntas críticas y respuestas del usuario:",
          ...input.questions.map((question, index) => {
            const answer = input.answers?.[index]?.trim();
            return `Q${index + 1}: ${question}\nA${index + 1}: ${
              answer || "Sin respuesta; generar mapa igualmente."
            }`;
          }),
        ].join("\n")
      : "";

  return [
    "Genera un mapa estratégico estructurado para SparringMap.",
    "Actúa como Senior Product Manager escéptico, práctico, directo y constructivo.",
    "La IA NO debe generar IDs, coordenadas ni edges.",
    "No inventes un canvas visual. Devuelve solo contenido estructurado.",
    "Respeta límites: máximo 4 objetivos, 4 riesgos, 5 acciones y 4 hipótesis.",
    "Cada nodo debe ser concreto, accionable y útil para tomar decisiones.",
    "El diagnóstico debe cuestionar la idea, no solo resumirla.",
    "El veredicto debe decidir entre advance, validate, reframe o discard.",
    "El veredicto debe incluir evidencia, incertidumbre y la siguiente decisión exacta.",
    "Devuelve solo el objeto JSON solicitado por el schema.",
    "",
    strategicQualityRules,
    "",
    "Criterios de salida:",
    "- Objetivos: resultados o validaciones que importan.",
    "- Riesgos: bloqueos reales, no miedos vagos.",
    "- Acciones: pasos priorizados que reducen incertidumbre.",
    "- Hipótesis: supuestos que todavía no se pueden dar por ciertos.",
    "- Veredicto: decisión ejecutiva breve, fundamentada y accionable.",
    "",
    `Tipo de proyecto: ${projectTypeLabel[input.type]}`,
    "Idea original:",
    input.rawInput,
    answeredContext,
  ].join("\n");
}

export function buildRefinementQuestionsPrompt(input: {
  rawInput: string;
  structuredSummary: string;
  type: ProjectType;
  userNote?: string;
}) {
  return [
    "Genera otro round de preguntas críticas para refinar un mapa estratégico existente.",
    "No repitas preguntas obvias ya cubiertas. Busca los supuestos más débiles, decisiones pendientes o riesgos ocultos.",
    "No hagas preguntas decorativas: cada pregunta debe poder cambiar el veredicto, una acción o un riesgo crítico.",
    "Devuelve solo el objeto JSON solicitado por el schema.",
    "",
    strategicQualityRules,
    "",
    `Tipo de proyecto: ${projectTypeLabel[input.type]}`,
    "Idea original:",
    input.rawInput,
    "",
    "Mapa actual resumido:",
    input.structuredSummary,
    "",
    input.userNote ? `Petición del usuario: ${input.userNote}` : "",
    "",
    "Devuelve readiness_score actualizado y de 1 a 3 preguntas críticas nuevas.",
  ].join("\n");
}

export const SPARRING_SYSTEM_PROMPT =
  "Eres SparringMap: una IA de pensamiento visual estratégico. Tu trabajo es poner a prueba ideas, detectar puntos débiles y convertirlas en estructuras accionables. Sé claro, útil y crítico sin ser destructivo.";
