# Progress analytics

Stage 11 adds `/progress` and completes returning-learner dashboard plans/actions. It reads the same schema-validated local demo records as the runner and lessons. Opening the report writes no learning activity or scores. A first direct visit can create an empty demo profile through the existing learner-data hook.

## Filters and definitions

- Last 7 days and last 30 days include today; All time removes the lower date limit. Custom dates must both be valid calendar dates with start on or before end. Both endpoints are inclusive in the learner's saved timezone. Future timestamps are excluded, including within a custom range ending in the future.
- Answer type filters apply to accuracy, daily trends, distinct questions, topics, and confidence groups. All practice excludes diagnostics. First practice and retries use the persisted attempt classification. First practice can include questions previously answered in a diagnostic; it does not mean unseen questions.
- Answer dates use submission time. Responses from unfinished or abandoned sessions remain part of recorded history. Starting a session outside the date range does not exclude answers submitted inside it.
- Accuracy is correct responses divided by submitted responses, rounded to a whole percentage. Retrying a question adds a response; distinct-question counts show the separate question denominator. No responses displays a dash; actual zero correct displays 0%.
- Daily rows appear only on dates with responses. Bars have adjacent exact counts/percentages, semantic table headers, and a written latest-day summary. Missing days are not invented as zero accuracy. Percentages across different question sets or repeated exposure are not evidence of causal improvement, mastery, or exam readiness.
- Confidence comparisons use independent denominators for Confident, Somewhat confident, Guessing, and Unrated. Unrated answers are not silently assigned to uncertain answers.
- Topic rows show exact counts and label samples below three answers. This is a display guideline, not a statistical confidence threshold.
- Lesson and revision event counts use the selected dates across all answer types. They remain outside marked-question accuracy. Recorded recall events do not remark question answers.
- Completed-session counts/history use completion dates across all answer types and link to full-session reports. The answer-type selector does not filter this history, as labelled in the UI. No completed sessions can coexist with submitted answers from unfinished sessions.

## Dashboard integration

The dashboard now links to `/progress`, the latest practice result, and available targets for recent activity. Its estimated plan follows setup/draft, unfinished session, diagnostic, then a priority or unreviewed concept lesson and focused practice. It fits the saved time budget without promising that a full diagnostic or practice will finish within the estimate. See `doc/dashboard.md`.

The approved practice milestone was committed locally as `388a481` before starting this work. Stage 11 is left uncommitted for review, following the requested milestone workflow. No push was requested for this step.

## Verification and acceptance

Domain tests cover timezone boundaries, inclusive dates, invalid ranges, future exclusions, unfinished sessions, independent answer-type/confidence denominators, zero versus missing accuracy, distinct questions, activity separation, session completion dates, data preservation, study-plan routing/budgets, and report links.

All 86 project tests, ESLint, and the production build passed. The build includes `/progress` and completed its TypeScript checks. Automatic approval review rejected the temporary preview-server command with “blocked by policy”; no HTTP route check was completed for this milestone.

Browser visual/interaction checks remain unavailable following the earlier browser access-policy block. Before release, validate `/progress` with an empty learner and with saved diagnostic/practice answers; switch answer types and date ranges, enter reversed custom dates, follow history links, and check mobile layouts, keyboard focus, light/dark themes, and refresh after a saved answer. Check dashboard plans with setup drafts, an unfinished session, and a returning learner. HTTP route checks only validate route availability, not these browser behaviours.

Next: stage 12, revision queue, reveal/recall ratings, scheduled reviews, removal with undo, and an up-to-date empty state.
