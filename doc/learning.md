# Concept learning and library

Stage 9 adds `/learn/[conceptSlug]` lessons and the searchable `/learn` library. The twelve current lessons correspond to the twelve concepts in the introductory diagnostic, with four lessons per topic group. They do not cover every AZ-900 objective.

## Lessons and references

Each lesson contains a learning objective, estimated reading time, plain-language explanation, two-column comparison, key terms, fictional Kenyan scenario, misconception, simpler recap, Microsoft Learn reference, and source-check date. The content lives in `lib/cloudready/lesson-content.ts` and uses existing source-checked diagnostic support where appropriate.

Sources were checked on 23 October 2026. Most lesson references match the diagnostic unit URLs documented in `doc/assessment.md`. Architecture lessons also use the official [regions overview](https://learn.microsoft.com/en-us/azure/reliability/regions-overview), [availability zones overview](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview), [resource groups guide](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal), and [management groups overview](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview). These explain physical location, zone configuration, resource management, and governance scope respectively. Organisations and events in local scenarios are explicitly fictional.

Each recap check reuses the matching diagnostic question and states that clearly. It is a local teaching interaction: choices and feedback are not persisted and do not contribute to diagnostic/practice accuracy, attempt history, learning activity, or reviewed status. Refresh clears the selection. It must not be presented as unseen practice or evidence of improvement.

## Saved learning actions

Mark lesson reviewed is an explicit action. It saves one lesson-review record and one activity event, preserves all submitted responses, and does not claim mastery. Repeating it is idempotent: it neither writes another event nor changes the original review timestamp. Opening a lesson alone creates no study event.

Add to revision creates a manual revision item due on the learner's current date in their saved timezone. An existing item keeps its reason and schedule. Adding an item does not mark it reviewed, rate flashcard recall, or change any answer score. The full revision interface remains stage 12.

Both mutations re-read the latest repository, validate the concept ID, and save before reporting success. Unknown concepts and storage errors do not silently overwrite existing records. A failed save leaves the lesson open and reports the error. Browser storage remains local to the site, with the existing multi-tab concurrency limits.

## Library and connections

Search matches all entered terms against titles, summaries, and key terms, ignoring case and extra whitespace. Filters combine topic group with All, Reviewed, Not reviewed, or Needs attention status. Needs attention means an existing revision item or a flagged latest response; it is independent of Reviewed. No-match results offer Clear filters, and the reviewed count is shown without mastery claims.

Learner navigation now enables Learn. Diagnostic result priorities and dashboard revision priorities link to available matching lessons. Unknown historical concepts do not produce invented links. Targeted-practice controls now open the matching concept focus; see `doc/practice.md`. Missing lesson slugs use a lesson-specific not-found page with a library link.

## Verification and validation

Eight new tests cover complete/stable lesson content and recap references, source URLs, balanced topics, reviewed persistence/idempotence, unchanged scores, timezone revision dates, schedule preservation, fresh repository reads, unknown concepts, failed saves, combined search/filter behaviour, latest-answer attention status, and read-only library operations. All 66 project tests, lint, TypeScript checking, and the production build pass. HTTP HEAD checks return 200 for the library and selected lesson routes. The streamed unknown-slug route also returns 200; its not-found content and interaction require browser validation.

Browser interaction and visual checks remain blocked by the earlier browser access policy. User validation should cover searching/filtering, a result-to-lesson link, recap selection/retry and keyboard focus, reviewed/revision actions after refresh, and mobile layouts. Domain tests and HTTP route checks do not replace that validation.

## Delivery and next step

The prior results milestone was committed locally as `4c266d8` when this step began. The learning milestone was committed locally as `473900d` when the user proceeded. Push is separate and only performed when requested.

Targeted practice is now implemented with a 30-question source-checked bank. Next: progress and dashboard completion.
