# Settings and local data controls

`/settings` edits the existing local demo profile. The learner shell’s settings icon is now enabled. This milestone preserves the demo-only account scope: it creates no authentication session, changes no server account, and sends no email. The completed revision milestone was committed as `c59afbb` before settings work began. Settings changes remain uncommitted for review.

## Profile and preferences

The form edits full/display names, cloud experience, preparation, explanation style, session minutes, timezone, optional exam date, study days, and difficult topics. Names and timezone are trimmed when saved. Minutes must be a whole number between 5 and 240; timezone and calendar dates are validated. Completed onboarding requires at least one study day. An incomplete learner can save preferences without falsely completing onboarding. A previously saved past exam date can remain, while a newly chosen past date is rejected using the selected timezone.

Every save reads current records, checks that the original profile still matches, and preserves sessions, submitted answers, lesson reviews, revision schedules, and activity. Unrelated learning activity does not block a profile save. A changed profile does block it; Discard edits reloads the latest saved profile. A saved or unreadable onboarding draft must first be completed or explicitly discarded so it cannot later overwrite settings. Existing review calendar dates are not shifted by a timezone change, though activity grouping and today's due status use the new timezone.

Light, Dark, and System are available through the existing header Theme control. It saves immediately and independently of the profile form. No duplicate theme control or duplicate input ID is added.

## Unsaved changes

Field edits are kept in component state and, when available, in `cloudready:settings-draft:v1` in this tab's session storage. The validated draft shape permits incomplete names/timezone/minutes so partially edited fields can be restored. It includes the base profile for stale-edit detection. Corrupt/unavailable storage is reported without clearing the draft silently. Failed saves keep current edits. Save/discard clears the tab draft when possible; a failed cleanup is reported separately from a successful profile save.

Unsaved edits attach a native reload/close warning and a confirmation for ordinary same-tab link navigation, including shell links. Modified clicks, new-tab links, downloads, and same-page anchors leave the current form intact and are not blocked. Listeners are removed when clean or unmounted. Browser Back/Forward and programmatic navigation are not comprehensively blocked; returning to settings restores the tab draft when session storage works. A warning explains when draft storage fails. Session restoration may retain session storage, so do not describe closing a tab as guaranteed deletion.

Discard edits is confirmed. Refresh records warns when edits exist, then remounts from saved records and the available tab draft. Theme changes do not count as unsaved profile edits.

## Account actions and export

Leave demo opens home and retains saved records. Email/password changes and real account deletion are explained as unavailable until authentication exists; there are no pretend account mutations.

Export saved progress prepares a browser download with a local-date filename, format/version, UTC export timestamp, and schema-validated learner data. It includes saved profile/preferences and all saved learning records. It excludes unsaved settings, onboarding drafts, and theme. The download is initiated using a Blob URL which is revoked after use; the app asks users to check browser downloads rather than claiming that the file was saved. Import is not implemented. Exporting changes no learning records. The privacy page now describes tab drafts, export, and reset scope.

## Confirmed resets

| Action                 | Removed                                                                                     | Kept                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Clear learning records | Sessions/answers, lesson reviews, revision schedules, activity, revision removal marker     | Profile/preferences, setup draft, theme, unsaved settings edits |
| Reset entire demo      | Local demo learner/profile/preferences/history, onboarding draft, this tab’s settings draft | Theme, downloaded exports, other tabs' session drafts           |

Both actions use the complete displayed learner snapshot captured when opening confirmation. Changed records require a refresh and renewed confirmation. The dialogs state the irreversible scope and recommend exporting first. Resetting the entire demo creates a new empty local profile on the next learner-data load.

The existing foundation-preview reset also clears this tab’s settings draft and describes the same theme/export/other-tab exclusions.

Browser keys cannot be removed transactionally. An entire-demo reset failure is explicitly reported as potentially partial, with a refresh/retry instruction. A failed single-key profile save or learning reset leaves the previous stored learner intact. Other tabs' temporary settings drafts cannot be cleared by this tab, and local storage has no transactional multi-tab conflict resolution. Old drafts still require profile matching before they can overwrite preferences.

## Verification and next step

Domain tests cover validation, past-date rules, preserved learning history, profile/setup conflicts, read-only export, reset scope, stale confirmations, partial-reset errors, failed writes, corrupt storage, and partial/foreign tab drafts. Browser validation remains unavailable after the earlier access-policy blocks; no alternate browser or preview-server route was attempted.

All 102 project tests passed. After final integration edits, all nine settings tests passed again, ESLint passed, and the production build passed with TypeScript checking and `/settings` included. `git diff --check` passed. Browser download, navigation, dialog, and visual behaviour still require the user checks below.

User validation should cover changing and saving preferences, theme choices, reload/back restoration, navigation cancellation, discard, export download, cancelled and confirmed resets, keyboard/dialog focus, and mobile layouts. Use a disposable demo or export saved records before testing confirmed resets.

Demo recovery forms and neutral confirmation/invalid-link states are now implemented at `/forgot-password` and `/reset-password`. Real email delivery remains deferred until real accounts are connected. Supporting public pages are implemented. Next: full-journey acceptance.
