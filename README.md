# CloudReady

CloudReady helps AZ-900 learners identify misunderstandings, practise weak topics, and measure improvement.

Unofficial study tool. Not affiliated with or endorsed by Microsoft.

## Current stage

Stages 1–5 UI are implemented for the demo: shared foundation, public home page, demo account forms, local learner space, and three-step onboarding with resumable drafts and validated study preferences. The initial dashboard shows saved preferences, genuine record summaries, and empty states. Real authentication, assessments, and session resumption remain subsequent work.

## Local setup

```bash
npm install
npm run dev
```

Open the Local URL printed by Next.js. It defaults to http://localhost:3000, choosing another port if occupied. No database, auth, email, or AI credentials are required for this stage.

## Available routes

- `/`: responsive home page with product explanation, labelled sample dashboard, interactive sample question, and account/demo entry links. The full diagnostic remains unavailable.
- `/sign-up`: validated demo account form with simulated verification, resend, and change-email states.
- `/sign-in`: demo sign-in using the public sample account shown on the page. `?reason=expired` shows the expired-session preview.
- `/demo`: separate demo learner space using local demo storage, without authentication or fabricated progress.
- `/onboarding`: three-step setup for background, study availability, and difficult topics. Changes save as a local draft; completion updates the demo profile. Dashboard completion is connected; the full diagnostic remains pending.
- `/dashboard`: local learner overview with topic metrics, revision priorities, weekly activity, saved-session details, and honest empty states.
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

The foundation and learner demo store only validated demo records in this browser. Account forms use a stateless mock service: they create no account, send no email, store no entered passwords, and return no session tokens. The public fictional sample account is displayed on sign-in. Real authentication, email, database persistence, live AI, and the saved learning journey are not implemented yet. The main question and concept banks are intentionally empty pending source and answer-key review. The sample question and labelled illustrative scores do not update learner progress.

## Project guides

- [Build order](doc/guide.md)
- [Foundation architecture, demo storage, scoring, scheduling, and limitations](doc/foundation.md)
- [Home page behaviour and verification](doc/home.md)
- [Demo account flows, sample details, and verification limits](doc/auth.md)
- [Onboarding, draft persistence, and completion behaviour](doc/onboarding.md)
- [Dashboard metrics, available actions, and verification limits](doc/dashboard.md)

Neon, Drizzle, and Better Auth will be integrated when real accounts are built. AI explanations will use server-side credentials and reviewed fallback content; no live prompts are implemented in this stage.
