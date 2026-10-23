# Diagnostic results

`/assessment/[sessionId]/results` displays a completed local diagnostic. Finish diagnostic on the last answer opens this report. Reopening a completed runner offers View detailed results, and the dashboard links to the most recently completed diagnostic.

## Report scope and calculations

Every result comes from the selected session's persisted responses. Later practice and diagnostics do not rewrite this report. Reading results does not submit answers, change revision schedules, add study activity, or mark concepts as reviewed/mastered.

- Accuracy is correct submitted responses divided by submitted responses, with the counts displayed beside the percentage.
- All three topic groups have their own numerator and denominator. A topic with no responses displays an em dash; actual zero accuracy displays 0%.
- Confidence categories are confident correct, confident incorrect, uncertain correct, and uncertain incorrect. Somewhat sure and Guessing are grouped as uncertain. Every category shows its count against the session total. Diagnostic responses require a confidence rating.
- Learning priorities use the most recent response for each concept within this diagnostic. Confident incorrect answers rank first, followed by other incorrect answers, then uncertain correct answers. Ties retain question order. Repeated concepts appear once in priorities; every answer remains in the review and accuracy denominator.
- This session's priorities are distinct from the dashboard's current cross-session revision schedule. A perfect small-sample result does not establish mastery or predict an official exam outcome.
- The dashboard chooses the latest diagnostic by completion time, ignoring incomplete, replaced, practice, and future-completed sessions.

## Answer review and content changes

Native expandable details show answers in the session's original question order, independent of response-array or content-bank ordering. Each review includes saved answer/confidence, correctness, an explicit UTC submission time, current correct-option and alternative explanations, the explanation-format switcher, and its Microsoft Learn reference. A learning-priority action opens and focuses the corresponding answer summary.

Historical marking uses the saved response's correctness, not a fresh calculation against today's answer key. Missing questions retain recorded scores and response identifiers. Detectable conflicts between saved topic/concept/option identifiers or correctness and current content show a limitation message and suppress current explanations for that answer.

The v1 records do not snapshot question text or the historical correct-option ID, so this is not full content-version detection. Text-only changes or an answer-key change that leaves the selected option's correctness unchanged cannot be detected. Content review must retain stable IDs and add new question IDs for material changes.

## Available actions and states

The report offers answer review, Microsoft Learn references, and the dashboard. Concept lessons now open from learning priorities and the library. Targeted practice is now available, including concept-focus links and practice on current recorded weak areas.

Loading, unreadable/blocked storage, retry/data controls, missing session, in-progress/resume, replaced-session, and non-diagnostic-session states are provided. An unfinished diagnostic is not shown as a completed report. A practice-session link offers the shared session screen. Records are local to the browser and site, so a URL opened on another device may have no session.

## Verification and user validation

Nine new tests cover score/topic denominators, four confidence categories, zero/perfect results, priority order and repeated concepts, answer order, missing/conflicting content, rejected session states, immutable historical reports, latest-dashboard selection, and a full persisted diagnostic-to-results flow without writes on report calculation.

All 58 project tests, lint, TypeScript checking, and the production build pass. HTTP HEAD checks return 200 for diagnostic setup, the results route, and the dashboard. A missing local session also returns a 200 page shell and is handled in the client; this does not verify a rendered report or browser interaction.

Browser interaction and visual checks remain unavailable under the earlier browser policy block. User validation is needed for desktop/mobile layout, keyboard expansion and priority-link focus, and the end-of-diagnostic navigation. Domain tests and HTTP checks do not replace those checks.

For local review: complete a diagnostic, choose Finish diagnostic on its last feedback card, compare the saved counts with the expanded answers, then reopen the report from the dashboard. Confirm that refreshing keeps the same report and that lessons/practice clearly state their availability.

No credentials or product decisions were needed for this milestone. It was committed as `4c266d8` when the user proceeded to concept learning.

## Next

Concept lessons and the learning library are now implemented and connected; see `doc/learning.md`. Targeted practice and progress analytics are connected. The revision queue is next.
