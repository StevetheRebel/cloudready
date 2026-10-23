# CloudReady demo release handoff

## Release candidate

`e864e34` contains the implemented demo, the connected journey tests, and the user-reported acceptance record. The user confirmed layouts, the diagnostic → lesson → practice → progress flow, refresh/resume, and keyboard checks passed. Automated checks previously passed all 111 tests, lint, TypeScript, and the production build. No application code changed after those checks in this handoff step.

This is a demo release candidate. The implementation checklist remains 63/65 (96.9%); real account integration and live recovery email remain deferred. Current deployment contents and availability have not been verified. No push or deployment was performed while preparing this handoff.

## Short project description

CloudReady is an unofficial AZ-900 study companion that helps learners identify misunderstandings, revisit concepts, practise weak topics, and interpret their learning records. The demo connects confidence-rated diagnostics, introductory lessons, focused practice, spaced recall, progress analytics, and local data controls. It is not affiliated with or endorsed by Microsoft, and its scores do not predict an official exam result.

## Demonstration walkthrough

Use fictional details and a disposable local demo. An existing learner can export saved records in Settings before testing reset actions. Do not reset valued progress as part of an ordinary presentation.

1. **Home / How it works:** Explain the study loop and the difference between a correct guess and a confident mistake. Point out that product-preview figures are labelled illustrations.
2. **Open demo / onboarding:** Choose study days, minutes, timezone, and explanation style. Demo entry resumes an existing setup draft or opens the dashboard for a completed learner.
3. **Diagnostic:** Answer the twelve untimed questions with confidence ratings. Pause after several answers and refresh/resume to demonstrate saved submitted responses.
4. **Results / lesson:** Open a priority concept, compare the related ideas, and mark the lesson reviewed. Reviewed does not mean mastered.
5. **Practice:** Choose a matching concept or weak-area scope. Explain the eligible/fresh/repeated counts. Complete a short session, then show its results and answer review.
6. **Progress:** Show counts beside percentages, attempt-type/date filters, and completed reports. First practice can include a question seen in the diagnostic; retries may benefit from familiarity.
7. **Revision:** Recall before revealing, then choose a rating to schedule the next review. Recall does not change marked-question accuracy. Removal with undo is available.
8. **Settings:** Show saved preferences, immediate theme choices, and JSON export. Explain reset scopes without confirming a reset during a valued demo.

For the separate account-form preview, sign-in uses the public fixture `learner@example.com` / `CloudReadyDemo1!`. Recovery forms use public example states, send no email, and leave that fixture unchanged. These details do not grant access to a real service.

## What to communicate

Available: a 30-question bank including the twelve-question diagnostic, twelve introductory lessons, focused practice, prepared explanations, saved local sessions, recall scheduling, progress analytics, JSON export, and confirmed local resets.

Current limits: partial exam-objective coverage, fictional scenarios, browser/site-specific storage, no cross-device sync or server backup, no JSON import, no live accounts/email/password changes, no live generated explanations, and no checkout. The public learner routes are intentional for the local demo; the profile is not authentication. `/foundation` is an internal demo preview and should be restricted/removed before live account launch.

## Release sequence

1. Review the handoff and retain `e864e34` as the accepted application baseline. Handoff documentation remains uncommitted until the next authorised step under the agreed workflow.
2. When a GitHub push is requested, commit the completed handoff first and push the approved branch. No environment secrets are required for this demo scope.
3. Inspect the actual deployment result and confirm its source commit. Do not assume that a previously hosted URL contains the latest local work.
4. On that deployment, check home/How it works, public navigation and an unknown URL; new/returning demo entry; one saved-answer refresh/resume; progress/report links; and export download. Check mobile and keyboard use on the deployed build too.
5. Record any defects with the route, action, expected result, observed result, and device/browser. Fix reported issues before presenting that deployment as accepted.

The user reported the core local journey passed. Specific export-download, destructive reset/undo dialog, account-preview, and deployed 404/status outcomes were not individually reported, so these remain targeted release spot checks rather than newly inferred passes. See `doc/acceptance.md` for the evidence boundary.

## Next development phase

After the approved demo is published and checked, real-account work needs a separate configuration phase: Neon/Drizzle persistence, Better Auth, and email delivery. Live generated explanations are also separate from the prepared demo content. Credentials belong in local/hosting environment configuration, never in chat or committed files. These integrations must preserve independently usable demo access and require updated account, privacy, and data-flow checks before launch.
