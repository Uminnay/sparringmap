import { NODE_TYPE_LABELS } from "@/lib/constants";
import type { AINode, NodeReviewStatus, SparringProject } from "@/types";

interface PrintableReportProps {
  project?: SparringProject;
}

export function PrintableReport({ project }: PrintableReportProps) {
  const response = project?.structuredResponse;

  if (!project || !response) {
    return null;
  }

  const versionLabel =
    project.versions?.find((version) => version.id === project.currentVersionId)
      ?.label ?? "Versión actual";
  const nodeStatuses = project.mapLayout?.nodeStatuses ?? {};
  const verdict = response.verdict;

  return (
    <article className="print-report" aria-label="Informe imprimible">
      <section className="report-cover report-page">
        <p className="report-brand">SparringMap</p>
        <h1>{response.project_title}</h1>
        <p className="report-subtitle">{response.summary}</p>
        <dl className="report-meta">
          <MetaItem
            label="Tipo"
            value={
              project.type === "app_product"
                ? "App / producto"
                : "Estrategia de negocio"
            }
          />
          <MetaItem label="Modelo" value={project.aiModelId} />
          <MetaItem label="Versión" value={versionLabel} />
          {project.readinessScore !== undefined ? (
            <MetaItem label="Readiness" value={`${project.readinessScore}/100`} />
          ) : null}
          <MetaItem
            label="Fecha"
            value={new Date(project.updatedAt).toLocaleDateString("es-ES")}
          />
        </dl>
      </section>

      {verdict ? (
        <section className="report-section report-verdict">
          <div>
            <p className="report-kicker">Veredicto ejecutivo</p>
            <h2>{verdict.headline}</h2>
            <p>{verdict.rationale}</p>
          </div>
          <div className="report-verdict-status">
            {verdictStatusLabel[verdict.status]}
          </div>
          <ReportList title="Evidencia" items={verdict.evidence} />
          <ReportList title="Incertidumbre" items={verdict.uncertainty} />
          <div className="report-callout">
            <h3>Siguiente decisión</h3>
            <p>{verdict.next_decision}</p>
          </div>
        </section>
      ) : (
        <section className="report-section report-verdict">
          <div>
            <p className="report-kicker">Veredicto ejecutivo</p>
            <h2>Veredicto pendiente</h2>
            <p>
              Este proyecto se creó antes de incorporar el veredicto estructurado.
              Regenera o refina el mapa para obtener una recomendación accionable
              validada por el schema actual.
            </p>
          </div>
        </section>
      )}

      <section className="report-section">
        <p className="report-kicker">Mapa estratégico</p>
        <h2>{response.central_idea}</h2>
        <div className="report-map">
          <section className="report-map-center">
            <h3>{NODE_TYPE_LABELS.central}</h3>
            <p>{response.summary}</p>
            <StatusPill status={nodeStatuses.central} />
          </section>
          <ReportMapColumn
            items={response.sections.objectives}
            nodeStatuses={nodeStatuses}
            nodeType="objective"
            title={NODE_TYPE_LABELS.objective}
          />
          <ReportMapColumn
            items={response.sections.risks}
            nodeStatuses={nodeStatuses}
            nodeType="risk"
            title={NODE_TYPE_LABELS.risk}
          />
          <ReportMapColumn
            items={response.sections.actions}
            nodeStatuses={nodeStatuses}
            nodeType="action"
            title={NODE_TYPE_LABELS.action}
          />
          <ReportMapColumn
            items={response.sections.hypotheses}
            nodeStatuses={nodeStatuses}
            nodeType="hypothesis"
            title={NODE_TYPE_LABELS.hypothesis}
          />
        </div>
      </section>

      <section className="report-section">
        <p className="report-kicker">Diagnóstico crítico</p>
        <h2>Lectura estratégica</h2>
        <p>{response.diagnostic.summary}</p>
        <div className="report-grid-3">
          <ReportList
            title="Puntos débiles"
            items={response.diagnostic.weak_points}
          />
          <ReportList
            title="Riesgos críticos"
            items={response.diagnostic.critical_risks}
          />
          <ReportList
            title="Próximos pasos"
            items={response.diagnostic.next_steps}
          />
        </div>
      </section>

      <section className="report-section">
        <p className="report-kicker">Plan accionable</p>
        <h2>Acciones e hipótesis</h2>
        <div className="report-grid-2">
          <ReportNodeList
            items={response.sections.actions}
            nodeStatuses={nodeStatuses}
            nodeType="action"
            title="Acciones priorizadas"
          />
          <ReportNodeList
            items={response.sections.hypotheses}
            nodeStatuses={nodeStatuses}
            nodeType="hypothesis"
            title="Hipótesis pendientes"
          />
        </div>
      </section>

      <section className="report-footer">
        <p>
          Informe generado localmente en SparringMap. No incluye claves, respuestas
          técnicas crudas ni datos internos de depuración.
        </p>
      </section>
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ReportMapColumn({
  items,
  nodeStatuses,
  nodeType,
  title,
}: {
  items: AINode[];
  nodeStatuses: Record<string, NodeReviewStatus>;
  nodeType: "objective" | "risk" | "action" | "hypothesis";
  title: string;
}) {
  return (
    <section className={`report-map-column report-map-${nodeType}`}>
      <h3>{title}</h3>
      {items.map((item, index) => (
        <article key={`${nodeType}-${index}`}>
          <strong>{item.label}</strong>
          <span>{priorityLabel[item.priority]}</span>
          <p>{item.description}</p>
          <StatusPill status={nodeStatuses[`${nodeType}-${index}`]} />
        </article>
      ))}
    </section>
  );
}

function ReportNodeList({
  items,
  nodeStatuses,
  nodeType,
  title,
}: {
  items: AINode[];
  nodeStatuses: Record<string, NodeReviewStatus>;
  nodeType: "action" | "hypothesis";
  title: string;
}) {
  return (
    <section>
      <h3>{title}</h3>
      <ol className="report-node-list">
        {items.map((item, index) => (
          <li key={`${nodeType}-list-${index}`}>
            <div>
              <strong>{item.label}</strong>
              <span>{priorityLabel[item.priority]}</span>
              <StatusPill status={nodeStatuses[`${nodeType}-${index}`]} />
            </div>
            <p>{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReportList({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function StatusPill({ status }: { status?: NodeReviewStatus }) {
  return (
    <span className={`report-status report-status-${status ?? "pending"}`}>
      {nodeStatusLabel[status ?? "pending"]}
    </span>
  );
}

const nodeStatusLabel: Record<NodeReviewStatus, string> = {
  blocked: "Bloqueado",
  dismissed: "Descartado",
  pending: "Pendiente",
  validated: "Validado",
};

const priorityLabel: Record<AINode["priority"], string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};

const verdictStatusLabel = {
  advance: "Avanzar",
  discard: "Descartar",
  reframe: "Replantear",
  validate: "Validar",
} as const;
