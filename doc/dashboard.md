# Initial dashboard

`/dashboard` reads the local demo profile and learner records. It creates an empty demo profile on a first direct visit and prompts for setup. Completed demo entry and onboarding's Go to dashboard action now open this route. An unfinished setup draft remains resumable without replacing the saved profile.

## Available UI

- Personal greeting, study routine, preference editing, and an optional exam-date countdown.
- Setup or diagnostic prompt, three topic cards, revision priorities, a short sample/resource study plan, weekly activity, and recent recorded events.
- An unfinished-session card showing saved answers. View saved session explains that the runner is pending. No session is discarded or replaced.
- Loading, storage-error/retry, unreadable-draft, and empty states. Existing data is retained when reading fails.
- Desktop/sidebar and mobile/bottom navigation, themes, labelled controls, and keyboard-accessible dialogs using the shared components.

Full diagnostic, practice, lessons, revision, progress, and settings actions remain pending. The dashboard exposes only available destinations or clearly explains availability.

## Metric definitions

- Practice accuracy counts submitted first-practice and retry responses, excluding diagnostic responses. An empty denominator displays an em dash; actual zero accuracy displays 0%.
- Questions answered counts submitted responses, including retries. Topics attempted counts topic groups with at least one submitted response.
- Topic percentages include diagnostic and practice responses, with numerator and denominator shown. Confidence counts distinguish confident, uncertain, and unrated responses. Fewer than three responses is labelled Not enough evidence; this is a display guideline, not a mastery threshold.
- Revision priorities use the most recent response per concept: confident incorrect, other incorrect, uncertain correct, then scheduled due items. A newer confident correct response removes the older misunderstanding priority unless the concept is due for review. At most three priorities are shown.
- Due items have a review date today or earlier in the learner's timezone.
- Weekly activity runs Monday through Sunday in the saved timezone and counts unique days containing submitted responses, recorded study events, or session completions. A session started last week can contribute this week. Opening pages and changing preferences add no activity.
- Recent activity uses recorded events only. Future response/event timestamps and future session completions are excluded from current metrics.
- Exam days compare calendar dates in the learner's timezone. No chosen date means no countdown. Past dates invite a preference update; the count is never a readiness prediction.

The initial study plan is an estimated warm-up within the saved session budget. It links to the available sample and, for budgets of at least 15 minutes, the verified [Microsoft Learn cloud service types module](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/). Sample answers and external study do not update recorded progress. Targeted plans will be connected when learning activities exist.

## Persistence and refresh

The dashboard uses the versioned, schema-validated demo repository. It does not seed scores or save new learning records. Data refreshes on mount, tab focus, relevant storage events, a one-minute timer, or manual refresh. The timer also keeps calendar-based information current. Subscriptions and stale reads are cleaned up on unmount. Account-form data remains separate.

## Verification

Seven dashboard tests cover empty records, denominators/retries/confidence, latest-answer revision priorities, data preservation, timezone week boundaries, future-record exclusion, unfinished-session selection, exam dates, and study-plan budgets. All 32 project tests pass, along with lint, TypeScript checking, and the production build. HTTP HEAD checks return 200 for `/dashboard`, `/onboarding`, and `/demo`.

Browser interaction and visual verification remain unavailable following the earlier browser access-policy block. Responsive layout, keyboard interactions, local-storage refresh, and the full onboarding-to-dashboard flow still need browser review before release.

## Next integration

Build diagnostic setup, then the shared assessment runner. Replace the availability notices with real start/resume actions only when those routes can preserve and submit sessions. Keep the guide's unfinished-session continuation task open until then.
