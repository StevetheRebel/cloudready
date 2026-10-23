# Diagnostic setup and initial runner

The local demo now supports setup → start/resume → 12 submitted answers with confidence → completion summary → dashboard. No database, authentication, email, or AI credentials are needed.

## Routes and entry

- `/assessment/start`: untimed diagnostic introduction, four questions per topic, confidence guidance, local-save explanation, and start/resume actions.
- `/assessment/[sessionId]`: initial diagnostic runner, per-answer explanations, answer review, pause/return, and a basic completion summary.
- Home and dashboard diagnostic actions link to setup. Onboarding saves preferences and opens setup when Take the diagnostic is selected. Incomplete profiles and resumable drafts are directed through setup completion first.
- Dashboard Resume diagnostic opens the saved session directly. A session URL opened in another browser/site has an honest not-found state; there is no shared account data.

## Content

`lib/cloudready/diagnostic-content.ts` contains 12 original questions, four per topic group. Each has four unique options, one answer key, explanations for every alternative, a stable question/concept ID, a Microsoft Learn source, and a source-check date. The content is checked against the linked pages, not copied from official exam items. The first pool is intentionally fixed and interleaved across topics. Equal topic coverage is not official exam weighting. Repeating the bank is not fresh-question evidence.

Sources checked 23 October 2026:

- [Shared responsibility](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model)
- [Cloud deployment models](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models)
- [Consumption-based pricing](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model)
- [Platform as a service](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service)
- [Azure physical infrastructure](https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/5-describe-azure-physical-infrastructure)
- [Azure management infrastructure](https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/6-describe-azure-management-infrastructure)
- [Pricing calculator](https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/3-compare-pricing-total-cost-of-ownership-calculators)
- [Resource tags](https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/7-describe-purpose-of-tags)
- [Azure Policy](https://learn.microsoft.com/en-us/training/modules/describe-features-tools-azure-for-governance-compliance/3-describe-purpose-azure-policy)
- [Resource locks](https://learn.microsoft.com/en-us/training/modules/describe-features-tools-azure-for-governance-compliance/4-describe-purpose-resource-locks)

This is a small introductory diagnostic bank, not complete AZ-900 coverage. Expanding to the guide's 30 questions and ten per topic remains pending before targeted fresh practice.

## Persistence and correctness

`createAssessmentService` reads the latest versioned repository immediately before each mutation. A session is saved successfully before navigation. Repeated start calls return the existing unfinished diagnostic rather than creating duplicates.

Starting over requires an explicit dialog confirmation identifying the current unfinished diagnostic. Replacement changes that session's status to `abandoned` and creates a new session in the same save. Submitted history is retained and still contributes to response-based dashboard metrics. Existing completed sessions, profile preferences, activity, and revision schedules are preserved. A stale confirmation cannot replace a different newer session. `abandoned` is an additive status in the existing v1 schema; older records remain readable by this app.

Each submission requires a valid option and confidence rating, marks against the source-checked key, and saves the response before showing success. Submitted answers cannot be changed or submitted out of order. A failed save keeps the selected values on screen and reports the failure. Refresh resumes at the next unanswered question; the previous explanation can be reopened. Unsubmitted selections are not saved. Final submission records completion immediately; Finish diagnostic opens the saved summary.

Incorrect and uncertain-correct concepts enter revision due on the learner's current local date when no revision item exists. Existing recall schedules are retained. Completion records one activity event. Dashboard practice accuracy excludes diagnostic answers, while topic accuracy and response counts include them. None of these values predicts an exam result.

## States and limits

Loading, blocked/unreadable storage, failed saves, missing sessions, unavailable question IDs, replaced sessions, and completion are handled explicitly. An insufficient pool blocks a new start; missing content never silently replaces an existing session. Native radio controls provide keyboard selection, submitted controls lock, question/feedback headings receive focus, and the shared confirmation dialog supplies cancellation and focus handling.

The shared learner-data hook refreshes on storage events, focus, a one-minute timer, and manual reload. There is no server or API boundary in this demo. Service operations re-read before writing, but truly simultaneous writes in separate tabs still lack transactional locking; use one active assessment tab. Site-local storage is separate between localhost and Vercel.

The shared runner now also handles persisted practice sessions, optional confidence, and after-session explanations. Simpler/local-example explanations and AI-unconfigured/offline fallback states are implemented; see `doc/runner.md`. Practice setup and the dedicated detailed-results route remain future work. The current completion screen shows score/counts and saved-answer review.

## Verification

Ten new tests cover content structure/balance, start persistence, profile prerequisites, repeated-start resume, confirmed replacement/history retention, stale confirmations, incomplete pools, storage failures, submission validation/immutability, service recreation, completion-event uniqueness, dashboard integration, and existing profile/revision preservation. The diagnostic milestone passed all 42 then-current tests, lint, TypeScript checking, and the production build. Stage 7 adds seven further tests; see `doc/runner.md`. HTTP HEAD checks return 200 for setup, the dynamic session route, and the dashboard. A missing local session is handled client-side, so its URL also returns a 200 page shell.

Browser interaction and visual checks remain unavailable following the earlier browser policy block. Domain tests exercise the full persisted session flow; HTTP route checks do not establish visual or keyboard correctness. Review mobile/desktop layouts, required-field focus, dialog cancellation, refresh/resume, and completion in the browser before release.
