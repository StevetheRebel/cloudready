# CloudReady build guide

This guide records the agreed implementation order. Update the checkboxes as stages are completed. Build a connected learning journey before completing secondary features.

## Milestone review and commits

Finish a milestone, verify it, and report what is ready, what needs user validation, and what comes next. Leave that new work uncommitted for review. When the user asks to proceed to the next milestone, commit the completed previous milestone before starting new work. If it is already committed, do not create an empty commit. Push when requested.

## Project baseline

- Next.js App Router, TypeScript, and Tailwind CSS v4.
- Reuse UI, content, and suitable learning logic from `../../components.md`.
- Adapt React Router navigation to Next.js and replace Base44 dependencies.
- Use Neon Postgres and Better Auth when implementing real accounts; use Drizzle for schema and migrations.
- Keep demo access independently usable, with locally persisted progress and a clearly labelled demo profile.
- Read the relevant installed Next.js documentation before implementation, as required by the project AGENTS.md.

## Main learning journey

Preferences → Diagnostic → Learning gaps → Concept review → Fresh practice → Updated progress.

## Implementation order

### 1. Shared foundation

- [x] Establish theme tokens, typography, spacing, and responsive layouts.
- [x] Build reusable buttons, fields, dialogs, notifications, and state components.
- [x] Create the public layout and learner shell with desktop and mobile navigation.
- [x] Define typed content, profile, session, response, revision, and activity records.
- [x] Separate content, scoring, scheduling, persistence, and UI logic.
- [x] Establish a replaceable service layer and demo persistence.

### 2. Home — `/`

- [x] Establish the visual direction and product positioning.
- [x] Add diagnostic, account, and demo entry actions.
- [x] Label product-preview figures as sample data.

Current entry behaviour: demo actions open `/onboarding` for incomplete profiles or saved drafts, and `/dashboard` for completed profiles, account actions open the demo sign-up/sign-in routes, and diagnostic actions open `/assessment/start`. The home page also retains its interactive on-page sample.

### 3. Account entry — `/sign-up`, `/sign-in`

- [x] Implement validated account forms and a separate demo entry.
- [ ] Integrate Neon, Drizzle, and Better Auth (deferred: demo account flows selected for this stage).
- [x] Add demo sign-in success, invalid-credential, and session-expired preview states.
- [x] Clearly label simulated account and email behaviour.
- [x] Ensure footer and form policy links have usable destinations; initial accurate demo versions are available.

Stage 3 demo scope is complete. No real accounts, authentication sessions, or emails are created. Live session handling, Remember me, verification delivery, and recovery remain deferred until real authentication is connected. See `doc/auth.md` for sample details and verification limits.

### 4. Onboarding — `/onboarding`

- [x] Capture learning background, explanation style, availability, timezone, and difficult topics.
- [x] Validate dates and persist preferences, with resumable local drafts.
- [x] Provide completion states that save preferences and explain the pending destinations.
- [x] Connect completion to the dashboard route.
- [x] Connect diagnostic completion to assessment setup.

Onboarding is implemented for the local demo. New demo entry goes through setup, existing drafts resume, and completed learners can edit preferences. Go to dashboard saves preferences and opens `/dashboard`. The diagnostic action saves preferences and opens `/assessment/start`. A draft-cleanup failure is reported before navigation. See `doc/onboarding.md`.

### 5. Initial dashboard — `/dashboard`

- [x] Show the new learner's empty state and diagnostic availability action.
- [x] Display unfinished-session details without replacing saved answers.
- [x] Connect unfinished diagnostic continuation to the initial runner.
- [x] Connect saved practice-session continuation to the shared runner (practice creation remains pending).
- [x] Use actual learner records rather than fabricated progress.

The initial dashboard UI is implemented. Topic metrics, revision priorities, weekly activity, and countdowns derive from saved records. Diagnostic start/resume is connected. Practice and full revision actions remain pending. See `doc/dashboard.md`.

### 6. Diagnostic setup — `/assessment/start`

- [x] Explain the 12-question, untimed diagnostic and confidence ratings.
- [x] Implement start, resume, and confirmed replacement of an unfinished diagnostic.

Stage 6 includes an initial diagnostic runner so start/resume leads to a working session. The first 12 original questions are source-checked. Replaced sessions retain submitted history. See `doc/assessment.md`.

### 7. Assessment runner — `/assessment/[sessionId]`

- [x] Show one question at a time with answer and confidence selection.
- [x] Require both selections before diagnostic submission.
- [x] Lock submitted answers and preserve the first response.
- [x] Explain the correct answer and every alternative using reviewed content.
- [x] Add simpler explanations, fictional local examples, and honest AI-unconfigured/offline fallback states.
- [x] Save progress, support refresh/resume, and handle unknown sessions.
- [x] Design the runner for reuse by practice sessions, including confidence-off and after-session explanations.

Stage 7 is implemented without live AI. The shared runner supports persisted diagnostic and practice sessions; practice creation remains stage 10. See `doc/runner.md`.

### 8. Diagnostic results — `/assessment/[sessionId]/results`

- [x] Calculate score, topic breakdown, and confidence categories from responses.
- [x] Prioritise confident incorrect answers for revision.
- [x] Link learning gaps to answer review and Microsoft Learn references available now.
- [ ] Connect learning gaps to concept lessons and targeted practice when stages 9–10 exist.
- [x] Provide expandable answer review.

The detailed diagnostic results page is implemented, including missing/incomplete/replaced-session states and preserved historical scoring. Learning gaps now link to concept lessons; targeted practice is still pending. See `doc/results.md`.

### 9. Concept learning — `/learn/[conceptSlug]`, then `/learn`

- [x] Implement explanations, comparisons, fictional local scenarios, and references.
- [x] Add knowledge checks and reviewed/revision actions.
- [x] Provide searchable, filterable concept cards.
- [x] Handle missing lessons and distinguish reviewed status from mastery.

Stage 9 provides twelve source-checked introductory lessons and the filtered library. Recap checks are labelled as repeated diagnostic material and do not change saved scores. See `doc/learning.md`. Next: targeted practice. Checklist progress is 40/65 (61.5%); see `doc/progress.md`.

### 10. Targeted practice

Routes: `/practice`, `/practice/[sessionId]`, `/practice/[sessionId]/results`.

- [ ] Implement mode, topic, question-count, explanation-timing, and confidence preferences.
- [ ] Enforce the eligible question-pool size and prefer fresh questions.
- [ ] Reuse the assessment runner.
- [ ] Show session results and supported first-attempt/retry comparisons.

### 11. Progress and dashboard completion — `/progress`, `/dashboard`

- [ ] Calculate trends and topic metrics from persisted records.
- [ ] Show response counts alongside percentages and explain small samples.
- [ ] Add date filters, confidence comparisons, and text chart summaries.
- [ ] Complete returning-learner actions, revision priorities, activity, and study plans.
- [ ] Keep flashcard recall separate from marked-question accuracy.

### 12. Revision — `/revision`

- [ ] Build due-today, upcoming, and all-items views.
- [ ] Add reveal, recall ratings, and a documented scheduling rule.
- [ ] Persist next review dates and support removal with undo.
- [ ] Add the up-to-date empty state.

### 13. Settings — `/settings`

- [ ] Edit profile and study preferences.
- [ ] Support light, dark, and system themes.
- [ ] Add account actions and JSON progress export.
- [ ] Confirm learning-data resets and explain demo-reset scope.
- [ ] Handle unsaved changes.

### 14. Account recovery — `/forgot-password`, `/reset-password`

- [ ] Add recovery forms, neutral confirmations, and invalid/expired link states.
- [ ] Connect real email delivery if these flows are live.

### 15. Supporting public pages

Routes: `/how-it-works`, `/privacy`, `/terms`.

- [ ] Complete product explanation, confidence examples, and progress limitations.
- [ ] Ensure privacy and terms accurately describe implemented behaviour.
- [ ] Complete the useful 404 page and verify public navigation.

## Requirements applied throughout

- Implement loading, empty, error, success, offline, and unavailable states where relevant in each stage.
- Verify responsive layouts, keyboard access, visible focus, accessible labels and contrast, and reduced motion as components are built.
- Every visible action must work or explain why it is unavailable.
- Confirm destructive actions.
- Never store passwords or API secrets in browser storage; keep server credentials in environment variables.
- Use reviewed answer keys for marking. AI explains concepts rather than deciding correctness.
- Prepare 30 original questions, ten per topic group, with stable IDs, answer explanations, sources, and review dates.
- Use fictional organisations in local scenarios and reviewed Microsoft Learn references.
- Do not use exam dumps, Microsoft logos, fabricated endorsements, or invented exam-pass probabilities.
- Keep the product clearly labelled unofficial.
- Verify each stage before marking it complete; test scoring, scheduling, and persistence where correctness matters.

## Main-journey acceptance check

- [ ] Enter from home through demo mode or working account access.
- [ ] Save study preferences.
- [ ] Complete a diagnostic with confidence ratings and explanations.
- [ ] Identify and review a weak concept.
- [ ] Complete fresh targeted practice.
- [ ] See progress updated from recorded answers.
- [ ] Resume an unfinished session after refresh.
- [ ] Complete the journey on mobile and using a keyboard.

## Documentation before delivery

- [ ] Maintain a README covering setup, routes, demo access, implemented and simulated features, content sources, scoring, revision scheduling, AI prompts and fallback behaviour, and known limitations.

## Scope and source handling

The original CloudReady brief defines the target behaviour. The sample Markdown file is reference code, not an instruction to copy every dependency or feature unchanged. New component requests should fit this journey; record deliberate changes to the order here.
