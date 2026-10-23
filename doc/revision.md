# Revision queue

`/revision` uses persisted demo revision items from saved answers and the lesson Add to revision action. It adds no sample items. Navigation, dashboard priorities, and lessons link to the queue. Progress analytics already counts recorded revision review events separately from marked-question accuracy.

## Views and recall

Due today includes dates today or earlier in the saved timezone. Upcoming includes later dates; All includes both. Items sort by review date, then concept ID. The queue distinguishes an empty list, no upcoming items, and being up to date with future reviews scheduled. Loading and storage-error states preserve existing records and offer retry/data controls.

Each known concept asks the learner to explain it before revealing its existing source-checked recap and comparisons. The reveal exposes four self-ratings with the next interval displayed. Revealing or hiding content writes nothing. Reviewing an upcoming item is allowed and schedules from the rating day, as explained on the page. Unknown historical concepts retain their schedule and can be removed, but cannot be rated without review content.

The existing scheduler uses local calendar dates:

| Rating | Next review                                                       |
| ------ | ----------------------------------------------------------------- |
| Again  | 1 day                                                             |
| Hard   | 3 days                                                            |
| Good   | 7 days                                                            |
| Easy   | 16 days, doubling on consecutive Easy ratings, capped at 120 days |

Other ratings reset the Easy streak. Overdue intervals begin on the actual rating day. A successful rating increments the item's review count, saves its rating/timestamp/date, and appends one revision-reviewed activity event. It does not change submitted answers, diagnostic/practice scores, or lesson-reviewed status. A changed item remounts with its explanation hidden, avoiding accidental repeat ratings against the old snapshot.

## Writes, removal, and undo

The service reads current validated records before every mutation. Rating and removal require the displayed revision snapshot still to match. Duplicate/stale actions fail with a refresh message. Unrelated current profile, session, and activity changes survive a valid rating. Local storage does not provide transactional conflict resolution for simultaneous writes across tabs; these checks guard observed stale snapshots.

Removal keeps earlier answers, activity, and lesson reviews. Undo restores the exact pre-removal record, including the original schedule and ordering, only while the complete saved state still matches the post-removal state. Any changed records, a re-added item, or a reset prevent undo from overwriting new data. Only the last successful removal is available; a successful rating/removal replaces the opportunity, and leaving/reloading the page discards the in-memory undo snapshot. Failed saves do not advance the UI or consume undo, allowing retry.

An optional `revisionRemovalId` UUID in the existing v1 schema distinguishes a removal from an otherwise identical fresh/reset dataset. Existing v1 records remain valid. This is a change marker, not an authentication credential. Undo restores the earlier marker, if any. New answers can add a removed concept again when they indicate a learning gap; removal does not suppress future recommendations.

## Verification

All 93 project tests and lint passed. After the final storage-marker adjustment, the seven revision tests passed again and the production build passed with TypeScript checking and `/revision` included. Tests cover local date boundaries, overdue/upcoming/all filtering, queue ordering, missing concepts, persistent scheduling/activity, accuracy separation with a saved marked answer, stale ratings/removals, exact undo, reset/re-add protection, preservation of unrelated data, unavailable storage, and failed-write retry.

Browser visual and interaction checks remain unverified following the earlier access-policy block; preview-server checks were also blocked in the previous milestone and were not retried. Validate reveal-before-rating, each rating, the up-to-date state, persistence after refresh, removal/undo, mobile layouts, keyboard focus, and light/dark themes in your browser. No new credentials are required.

The progress milestone was committed as `ef7a7df` before starting revision. This milestone remains uncommitted for review. Settings is now connected, including profile/preferences, export, reset, and unsaved-change handling. Demo account recovery is implemented. Supporting public pages are implemented. Next: full-journey acceptance.
