# SparringMap

SparringMap is a visual strategic sparring app. It helps turn early ideas into actionable maps with objectives, risks, actions, hypotheses, and a critical diagnosis.

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
