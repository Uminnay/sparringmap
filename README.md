# SparringMap

SparringMap is a visual strategic sparring app. It helps turn early ideas into actionable maps with objectives, risks, actions, hypotheses, and a critical diagnosis.

## Roadmap

The prioritized product and technical improvement plan is maintained in
[`ROADMAP_MEJORAS.md`](./ROADMAP_MEJORAS.md).

Project-specific working instructions for AI agents are in
[`AGENTS.md`](./AGENTS.md). Product strategy, private-use assumptions, and
future beta/monetization decisions are captured in
[`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md).

## Phase 1

This repository currently contains the scaffold and base UI only:

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui primitives
- Three-zone product shell
- Idea input form

## Phase 2

The project now includes the local data foundation:

- Zod schemas for initial analysis and map generation
- `aiNodeSchema` declared before `mapGenerationSchema`
- A one-retry validation helper for AI responses
- `localStorage` persistence for draft projects
- Draft creation from the base UI

AI calls and the real map engine are intentionally reserved for later phases.

## Phase 3

The app now includes the first AI flow:

- Model selector for Gemini and OpenAI options
- Internal Next.js API routes for analysis and map generation
- Structured output requests without provider SDKs
- Zod validation with one retry before showing an error
- Clear raw-response copy path for debugging failed validation
- Validated structured responses saved in `localStorage`

Required local environment variables:

```bash
GEMINI_API_KEY=
OPENAI_API_KEY=
```

The visual map engine with `@xyflow/react`, deterministic IDs, edges, and layout is still reserved for the next phase.

## Phase 4

The map is now interactive:

- `@xyflow/react` canvas with movable nodes, zoom, pan, controls, and minimap
- Deterministic frontend-generated node IDs, edges, and grouped layout
- Click a node to inspect its full description in the side panel
- Copy the validated map and diagnosis to Markdown

## Phase 5

The project workflow now includes:

- Non-overlapping deterministic map layout with directional colored edges
- A central second-round question form for answering refinement prompts
- Explicit project naming and save feedback
- Recoverable local project library under Borradores
- Archive and restore workflow under Archivo

## Phase 6.1

The central workflow now uses three explicit stages:

- Idea
- Preguntas
- Mapa

Only the selected stage is rendered in full. Completed stages can be reviewed
in read-only mode, while future stages remain disabled.

## Phase 6.2

Completed idea and question stages are now shown as compact, collapsible
panels. Editing requires an explicit action, and the map remains the main
surface while later refinement rounds are answered.

## Phase 6.3

Existing maps are protected from accidental replacement. Reanalyzing an idea,
regenerating from answers, and applying a refinement require an explicit
confirmation. Creating another critical round remains non-destructive, and a
failed AI request keeps the current map intact.

## Phase 6.4

The main workflow now shows clear product-facing states for analysis,
questions, generation, map readiness, active refinement rounds, and recoverable
errors. Technical error details remain available only for debugging. The first
stage-state tests run with Node and require no additional dependency.

## Phase 7

Map work now persists per project:

- Node positions, zoom, pan, and viewport are restored when reopening a project
- Reorganize restores the deterministic layout
- Recenter fits the current map without changing node positions
- Projects can be duplicated or permanently deleted with confirmation
- Complete projects can be exported and imported as validated JSON backups
- Local-only storage limitations are shown in the project library

## Phase 8

Strategic iteration is now non-destructive:

- Existing maps migrate automatically to Version 1
- Refinements and regenerations create new recoverable versions
- Every version stores its originating questions, answers, note, diagnosis, and layout
- Versions can be compared by added, removed, and modified elements
- Previous versions can be restored without deleting later ones
- Non-active versions can be deleted only after confirmation
- Node movements support undo and redo

## Phase 9

AI quality is now treated as a measurable product surface:

- New maps include a structured verdict with evidence, uncertainty, and next decision
- Verdict states are `advance`, `validate`, `reframe`, and `discard`
- Refinements preserve useful prior map information unless new answers justify a change
- Each map generation stores approximate latency, attempts, token estimates, and cost tier
- A repeatable AI evaluation rubric and 18-case dataset live under `lib/evaluation`
- The evaluation process is documented in `docs/AI_EVALUATION.md`

## Phase 10

The map and diagnosis are now easier to read and act on:

- The map has filters for objectives, risks, actions, hypotheses, and high-priority nodes
- Nodes can be shown in expanded or compact mode
- High-priority risks and actions are visually highlighted
- Optional derived dependency lines connect actions with related risks and hypotheses
- Each node can be marked as pending, validated, dismissed, or blocked
- Node status is persisted with the local project and version layout
- Save, export, print, and version history now live in the map workspace bar
- The inspector focuses on node detail, verdict, diagnosis, questions, and iteration

## Phase 11

Exports are now suitable for sharing outside the app:

- Printing uses a dedicated report view instead of the working interface
- Navigation, forms, canvas controls, sidebars, and debugging details are excluded from print
- The report includes cover, verdict, strategic map, diagnosis, actions, hypotheses, and next steps
- Markdown export is structured for documentation and Notion-style notes
- Node review statuses are included in Markdown and the printed report
- JSON export remains the complete local backup format
- PNG export was evaluated and left out for now to avoid adding a new dependency without approval
