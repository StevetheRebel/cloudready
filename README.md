# CloudReady

CloudReady helps AZ-900 learners identify misunderstandings, practise weak topics, and measure improvement.

Unofficial study tool. Not affiliated with or endorsed by Microsoft.

## Current stage

Stages 1–11 UI are implemented for the local demo: home, simulated account forms, onboarding, dashboard, and a 12-question untimed diagnostic with confidence, per-option explanations, simpler explanations, fictional local examples, saved progress, resume, and confirmed restart. AI help uses an honest source-checked fallback. Detailed diagnostic results include topic/confidence breakdowns, learning priorities, and expandable answer review. Twelve introductory concept lessons and a searchable/filterable learning library are available, with saved reviewed/revision actions. Targeted practice supports a 30-question bank, fresh-first selection, configurable sessions, resume, and contextual results. Progress analytics adds date-filtered trends, topic/confidence breakdowns, and session history. Dashboard plans use saved sessions and concept priorities. Revision, settings, and real authentication remain pending; browser acceptance remains unverified.

## Local setup

```bash
npm install
npm run dev
```

Open the Local URL printed by Next.js. It defaults to http://localhost:3000, choosing another port if occupied. No database, auth, email, or AI credentials are required for this stage.

## Available routes

- `/`: responsive home page with product explanation, labelled sample dashboard, interactive sample question, and account/demo entry links. Diagnostic actions open setup.
- `/sign-up`: validated demo account form with simulated verification, resend, and change-email states.
- `/sign-in`: demo sign-in using the public sample account shown on the page. `?reason=expired` shows the expired-session preview.
- `/demo`: separate demo learner space using local demo storage, without authentication or fabricated progress.
- `/onboarding`: three-step setup for background, study availability, and difficult topics. Changes save as a local draft; completion updates the demo profile. Dashboard completion is connected; diagnostic completion opens setup.
- `/dashboard`: local learner overview with topic metrics, revision priorities, weekly activity, saved-session details, and honest empty states.
- `/assessment/start`: diagnostic introduction and start/resume/confirmed restart.
- `/assessment/[sessionId]`: shared session runner and completion summary with saved answer review.
- `/assessment/[sessionId]/results`: detailed report for one completed diagnostic, with historical scores and answer review.
- `/learn`: searchable library with topic and learning-status filters.
- `/learn/[conceptSlug]`: concept lesson, comparison, fictional local scenario, unsaved recap check, and reviewed/revision actions.
- `/practice`: scope/settings, eligible/fresh/repeated counts, resume, and confirmed replacement.
- `/practice/[sessionId]`: shared practice runner with saved settings.
- `/practice/[sessionId]/results`: contextual practice results, comparisons, and saved-answer review.
- `/progress`: date-filtered answer trends, topic/confidence comparisons, separate learning activity, and completed-session reports.
- `/privacy`, `/terms`: initial information accurately describing the current demo. Review before real account access opens.
- `/foundation`: component and layout preview with themes, validation, notifications, and locally saved demo preferences. Excluded from search indexing; remove or restrict before launch.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Implementation

Next.js App Router, TypeScript, Tailwind CSS v4, Lucide icons, Radix dialog primitives, next-themes, and Zod. Shared layouts and primitives live in `components/`; content, scoring, scheduling, service, and persistence modules live in `lib/cloudready/`.

The foundation and learner demo store only validated demo records in this browser. Account forms use a stateless mock service: they create no account, send no email, store no entered passwords, and return no session tokens. The public fictional sample account is displayed on sign-in. Real authentication, email, database persistence, and live AI remain unimplemented. The 30-question bank, including the stable 12-question diagnostic, is checked against Microsoft Learn sources; the twelve-lesson bank supports those diagnostic concepts. The full learning journey is still being built. The sample question and labelled illustrative scores do not update learner progress.

## Project guides

- [Build order](doc/guide.md)
- [Foundation architecture, demo storage, scoring, scheduling, and limitations](doc/foundation.md)
- [Home page behaviour and verification](doc/home.md)
- [Demo account flows, sample details, and verification limits](doc/auth.md)
- [Onboarding, draft persistence, and completion behaviour](doc/onboarding.md)
- [Dashboard metrics, available actions, and verification limits](doc/dashboard.md)
- [Diagnostic content, sessions, restart semantics, and verification](doc/assessment.md)
- [Shared runner, explanation formats, and AI fallback behaviour](doc/runner.md)
- [Diagnostic results, scoring scope, content limits, and validation](doc/results.md)
- [Concept lessons, library, and saved learning actions](doc/learning.md)
- [Practice pools, saved sessions, results, and comparison limits](doc/practice.md)
- [Progress analytics, filters, denominators, and verification limits](doc/analytics.md)
- [Implementation progress and measurement limits](doc/progress.md)

Neon, Drizzle, and Better Auth will be integrated when real accounts are built. AI explanations will use server-side credentials and reviewed fallback content; no live prompts are implemented in this stage.
