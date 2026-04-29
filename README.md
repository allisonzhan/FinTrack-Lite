# FinTrack Lite

## Overview
FinTrack Lite is a lightweight personal finance tracker built with React and TypeScript. It helps users log income and expenses, manage recurring and custom categories, view summary charts, and persist data locally.

## How to Run
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open the app in your browser at [http://localhost:3000](http://localhost:3000).
5. Build for production with:
   ```bash
   npm run build
   ```

## Tech Stack
- React
- TypeScript
- Tailwind CSS
- Recharts
- localStorage for persistence

## Architecture
The app uses a simple React context architecture for transaction state management. Key areas:
- `src/context/TransactionContext.tsx` handles transaction CRUD and storage persistence.
- `src/components/` contains reusable UI pieces like charts, forms, and lists.
- `src/pages/` contains screen layouts such as the dashboard and transaction page.
- `src/hooks/useLocalStorage.ts` abstracts localStorage synchronization.
- `src/utils/` contains category logic and calculation helpers.

## AI Tools Used
- Tool: v0 by Vercel for frontend templating
- Tool: Claude Code / ChatGPT / Raptor mini (Preview)
- How I used it: Organized a baseline PRD, scaffolded feature logic, debugged state updates, and refactored UI interaction patterns.
- Prompts that worked well: "Add CSV import/export functionality using plain JavaScript parsing" and "Improve pie chart legend spacing and tooltip details."

## Key Design Decisions
- Used React Context for global transaction state so all pages can share data.
- Persisted transactions in localStorage for an offline-friendly experience and zero backend requirement.
- Built UI with Tailwind CSS for fast responsive styling and consistent spacing.
- Kept CSV parsing library-free to reduce dependencies and maintain control over validation.

## Challenges & How You Solved Them
- Handling CSV import validation and deduplication required careful row-by-row parsing.
- The pie chart legend and label overcrowding were solved by removing direct slice labels and relying on a wrapped legend.
- AI helped accelerate implementation and catch edge cases, but manual validation was necessary to ensure CSV parsing and state persistence behaved correctly.

## What I'd Improve With More Time
- Add a backend and real database (e.g. Node + PostgreSQL) to replace localStorage — enabling multi-device sync, real auth, and a foundation for production use.
- Write unit and integration tests for CSV parsing edge cases, deduplication logic, and state mutations.
- Add multi-month reporting and trend analysis — the current month-scoped view limits how useful the charts actually are over time.
- Improve accessibility for keyboard navigation and screen readers.
- Support OFX/QFX file import to ingest real bank export files directly, which is a more realistic auto-ingestion path than manual CSV entry.
- Integrate with a banking API (e.g. Plaid) to automatically sync transactions from connected accounts and cards, eliminating manual entry entirely.