export const strategicEvaluationCriteria = [
  {
    id: "depth",
    label: "Profundidad",
    weight: 15,
    guidance:
      "Detecta dinámicas estratégicas reales, no solo enumera obviedades.",
  },
  {
    id: "clarity",
    label: "Claridad",
    weight: 10,
    guidance:
      "El resultado se entiende rápido y separa idea, riesgos, acciones e hipótesis.",
  },
  {
    id: "specificity",
    label: "Especificidad",
    weight: 15,
    guidance:
      "Usa detalles del caso y evita recomendaciones que servirían para cualquier idea.",
  },
  {
    id: "usefulness",
    label: "Utilidad",
    weight: 15,
    guidance:
      "Ayuda a tomar una decisión o diseñar el siguiente experimento.",
  },
  {
    id: "low_repetition",
    label: "Baja repetición",
    weight: 10,
    guidance:
      "No repite el mismo riesgo, acción o hipótesis con otras palabras.",
  },
  {
    id: "criticality",
    label: "Capacidad crítica",
    weight: 15,
    guidance:
      "Cuestiona supuestos débiles y detecta contraargumentos importantes.",
  },
  {
    id: "actionability",
    label: "Acciones ejecutables",
    weight: 10,
    guidance:
      "Las acciones son concretas, priorizables y no se quedan en deseos vagos.",
  },
  {
    id: "uncertainty",
    label: "Detección de incertidumbre",
    weight: 10,
    guidance:
      "Expresa qué falta por saber y cómo afecta al veredicto.",
  },
] as const;

export type StrategicEvaluationCriterionId =
  (typeof strategicEvaluationCriteria)[number]["id"];

export type StrategicEvaluationScores = Partial<
  Record<StrategicEvaluationCriterionId, number>
>;

export function calculateStrategicQualityScore(
  scores: StrategicEvaluationScores
) {
  const weighted = strategicEvaluationCriteria.reduce((total, criterion) => {
    const rawScore = scores[criterion.id];

    if (rawScore === undefined) {
      return total;
    }

    return total + normalizeScore(rawScore) * criterion.weight;
  }, 0);
  const completedWeight = strategicEvaluationCriteria.reduce(
    (total, criterion) =>
      scores[criterion.id] === undefined ? total : total + criterion.weight,
    0
  );

  if (completedWeight === 0) {
    return 0;
  }

  return Math.round((weighted / completedWeight) * 100);
}

function normalizeScore(score: number) {
  return Math.min(5, Math.max(0, score)) / 5;
}
