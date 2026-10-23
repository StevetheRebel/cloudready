# Demo journey acceptance and release review

Public pages were committed as `d2899ab` before this review. This milestone adds connected service-level journey tests and a release/acceptance record. It does not publish a deployment or add real accounts. The user approved proceeding after reporting that layout and core functional browser checks passed. This acceptance milestone is being committed before release handoff preparation.

## Automated journey evidence

`tests/journey.test.ts` uses the production demo repository adapter and service functions with an isolated in-memory StoragePort. It recreates repositories/services between steps, forcing reads through the same JSON serialization and schema validation used by browser storage. It never reads or changes the user's actual browser data.

The first scenario:

1. Starts an empty learner without sample scores or activity, saves an onboarding draft, then completes setup and clears the draft.
2. Starts the real twelve-question diagnostic, answers four questions, recreates the service, and resumes at the next unanswered question.
3. Completes with one confident mistake, checks the 11/12 result and matching concept priority, then marks the relevant lesson reviewed.
4. Rates recall Good and checks the saved seven-day schedule.
5. Completes every fresh question available for that concept, checks that none appeared in the diagnostic, and confirms that new answers preserve the recall schedule.
6. Completes a repeated scoped session with confidence disabled, checks retry matching, and distinguishes a diagnostic-seen question's first practice attempt from an actual practice retry.
7. Reconciles dashboard, progress, completed-session history, confidence/activity counts, distinct questions, and study-plan budget with the saved records. Reports make no writes and preserve the historical diagnostic.
8. Removes and restores the revision item, edits settings while preserving learning history, exports the exact saved snapshot, then clears learning records while retaining preferences. The earlier exported snapshot remains intact.

The second scenario starts mixed practice, saves one answer, forces the next storage write to fail, and recreates the repository/service. It resumes the original session at the correct unanswered question, finishes it, and confirms that the first answer is retained and completion activity is recorded once.

These are service/data integration tests. They do not establish that controls render correctly, browser downloads complete, navigation works after hydration, or keyboard/mobile interactions pass.

The full suite passed all 111 tests, ESLint passed, and the production build passed with TypeScript checking. The final journey assertions additionally check that after-session feedback remains hidden before completion and becomes available afterward. `git diff --check` passed. No service-level defects were found in these tested scenarios.

## User-reported browser acceptance

The user confirmed that layouts passed, then explicitly confirmed the diagnostic → lesson → practice → progress flow, refresh/resume, and keyboard checks passed. This is user-reported evidence for the current local build, not agent browser automation or a deployment verification. No browser, device, viewport, or deployed commit identifier was supplied.

| Area                                                                         | Evidence/status                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Diagnostic, lesson, practice, progress                                       | Passed, reported by the user                                                                |
| Refresh/resume                                                               | Passed, reported by the user                                                                |
| Layout/mobile and keyboard checks                                            | Passed, reported by the user                                                                |
| New/returning home entry and preference edge cases                           | Automated/data evidence exists; these particular browser cases were not explicitly reported |
| Export download, reset/undo dialogs, recovery-link states, public 404/status | Detailed browser outcomes were not explicitly reported; retain as release spot checks       |

Browser automation and preview-server attempts were blocked in earlier milestones and were not retried or bypassed. The guide records the reported core journey checks as passed and retains unreported cases separately. There are no reported defects from the user's checks.

## Release scope and remaining work

- The demo uses local validated records and public learner routes. It has no authenticated access control, cloud sync, real email/password reset, live model calls, paid plan, or restore/import service.
- Real Neon/Drizzle/Better Auth integration and recovery email remain the two deferred implementation tasks. The 63/65 (96.9%) count is unchanged by adding acceptance tests; it does not measure production readiness.
- Repository inspection found no tracked files matching `.env*`, `*.pem`, `*.key`, `.next/*`, or `node_modules/*`; ignore rules exclude environment files, PEM files, dependencies, and generated build output. This was a names/ignore-rule check, not a comprehensive secret or dependency-security audit.
- `/foundation` remains a public internal demo preview with local data controls. Restrict/remove it before a live account launch, as already documented in the README. It is not a server-admin interface.
- No GitHub push, Vercel deployment, live HTTP check, or agent browser/visual verification was performed in this milestone; core browser acceptance was reported by the user. Build success does not prove deployment availability or behaviour.

The automated review and user-reported core acceptance are complete. Prepare the demo release handoff, retaining the unreported spot checks and the deferred live-account scope. When the user requests a push, commit the approved review milestone first, then push and verify the resulting deployment within available permissions. Real account/AI integration is a separate phase and requires the corresponding service setup; do not describe the demo as production-ready in the meantime.
