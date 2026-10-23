# Learner dashboard

`/dashboard` reads the local demo profile and learner records. It creates an empty demo profile on a first direct visit and prompts for setup. Completed demo entry and onboarding's Go to dashboard action now open this route. An unfinished setup draft remains resumable without replacing the saved profile.

## Available UI

- Personal greeting, study routine, preference editing, and an optional exam-date countdown.
- Setup or diagnostic prompt, three topic cards, revision priorities, a personalised study plan, weekly activity, and recent recorded events.
- An unfinished-session card showing saved answers. Resume diagnostic and Resume practice open the shared runner for saved sessions. Practice setup is available. No session is discarded or replaced by opening the dashboard.
- Links to the latest completed diagnostic and practice reports, a progress action, and recent-event links to available session reports or lessons. Missing historical targets remain plain text.
- Loading, storage-error/retry, unreadable-draft, and empty states. Existing data is retained when reading fails.
- Desktop/sidebar and mobile/bottom navigation, themes, labelled controls, and keyboard-accessible dialogs using the shared components.

Diagnostic setup, the shared runner, concept lessons/library, targeted practice, and progress analytics are available. The revision queue is available; settings is available. The dashboard exposes only available destinations or clearly explains availability.

## Metric definitions

- Practice accuracy counts submitted first-practice and retry responses, excluding diagnostic responses. An empty denominator displays an em dash; actual zero accuracy displays 0%.
- Questions answered counts submitted responses, including retries. Topics attempted counts topic groups with at least one submitted response.
- Topic percentages include diagnostic and practice responses, with numerator and denominator shown. Confidence counts distinguish confident, uncertain, and unrated responses. Fewer than three responses is labelled Not enough evidence; this is a display guideline, not a mastery threshold.
- Revision priorities use the most recent response per concept: confident incorrect, other incorrect, uncertain correct, then scheduled due items. A newer confident correct response removes the older misunderstanding priority unless the concept is due for review. At most three priorities are shown.
- Due items have a review date today or earlier in the learner's timezone.
- Weekly activity runs Monday through Sunday in the saved timezone and counts unique days containing submitted responses, recorded study events, or session completions. A session started last week can contribute this week. Opening pages and changing preferences add no activity.
- Recent activity uses recorded events only. Future response/event timestamps and future session completions are excluded from current metrics.
- Exam days compare calendar dates in the learner's timezone. No chosen date means no countdown. Past dates invite a preference update; the count is never a readiness prediction.

The study plan first offers unfinished setup (including drafts), then the latest unfinished session, then a diagnostic if none has been completed. Returning learners receive a priority concept lesson, or an unreviewed lesson when no priority exists, followed by concept-scoped practice setup if time remains. Task estimates are clipped to the saved session budget; a session can take longer and remains resumable. The plan explains whether today is a selected study day. Off-day plans are optional. Opening tasks changes no scores or completion records, and lesson review does not imply mastery.

## Persistence and refresh

The dashboard uses the versioned, schema-validated demo repository. It does not seed scores or save new learning records. Data refreshes on mount, tab focus, relevant storage events, a one-minute timer, or manual refresh. The timer also keeps calendar-based information current. Subscriptions and stale reads are cleaned up on unmount. Account-form data remains separate.

## Verification

Dashboard tests cover empty records, denominators/retries/confidence, latest-answer revision priorities, data preservation, timezone week boundaries, future-record exclusion, unfinished-session selection, exam dates, study-plan budgets and routing, and report links. See `doc/analytics.md` for stage 11 verification.

Browser interaction and visual verification remain unavailable following the earlier browser access-policy block. Responsive layout, keyboard interactions, local-storage refresh, and the full onboarding-to-dashboard flow still need browser review before release.

## Next integration

Diagnostic start/resume is connected; see `doc/assessment.md`. Saved practice sessions use the shared runner; practice setup is available. Reports are selected by completion time. Revision priorities link to available concept lessons. Progress analytics is connected; the full revision queue is connected. Settings is connected. Demo account recovery is next.
