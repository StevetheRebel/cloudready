# Targeted practice

Stage 10 adds `/practice`, `/practice/[sessionId]`, and `/practice/[sessionId]/results`. It connects the learning loop from diagnostic results and concept lessons to new practice, saved responses, and contextual results. The shared runner and marking service are reused.

## Content and selection

The source-checked bank now contains 30 original introductory questions, ten per topic group. Eighteen questions were added in `lib/cloudready/practice-content.ts`; the original diagnostic IDs and four-per-topic diagnostic selection remain stable. All questions have four unique options, an answer key, option explanations, concept IDs, a Microsoft Learn reference, and a source-check date. The same twelve introductory concepts are covered; this is not complete AZ-900 objective coverage or an official exam bank.

Added questions use the diagnostic/lesson references plus [IaaS responsibilities](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service), [Azure regions](https://learn.microsoft.com/en-us/azure/reliability/regions-overview), [availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview), and [management groups](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview). Source concepts were checked on 23 October 2026. Questions are original teaching material, not copied official exam items.

Practice setup supports mixed topics, a topic with an optional concept focus, and recorded weak areas. Weak areas are concepts with a flagged latest response or an existing revision item, including manual items. An empty weak-area pool is shown explicitly; it never silently becomes mixed practice.

Question count is limited by the eligible pool and validated again before saving. Mixed practice distributes available questions across topics. Within the requested scope, questions without saved answers are selected before previously answered questions. Selected IDs are unique. Once those questions are exhausted, repeats are allowed and counted clearly.

“Without saved answers” means no diagnostic or practice response for that question in the current local history. It cannot establish that a learner has never seen the question elsewhere or in an unsaved lesson recap. Question exposure at creation is saved as `freshQuestionIds`; older sessions without that field display exposure as unavailable. The optional `practiceFocus` field retains selected topic/concept context. Existing v1 records remain readable.

## Sessions, resume and replacement

Onboarding must be complete to start a new practice session. Setup-draft issues have their own setup/data-control action. Confidence can be on or off; explanations can appear after each answer or after the session. Existing shared-runner rules enforce valid option selection, confidence requirements, answer order, submitted-answer locking, and save-before-success.

Starting with an unfinished practice session resumes it unless its exact ID is explicitly confirmed for replacement. Replacement closes it as `abandoned`, retains submitted responses, and creates the new session in one repository save. A stale confirmation cannot close a newer saved practice. No practice operation replaces an unfinished diagnostic. Failed writes preserve existing records. As with the rest of the demo, simultaneous cross-tab writes lack transactional locking; use one active assessment tab.

Submitted answers persist; unsubmitted choices do not. After-session feedback hides correctness/explanations until completion. Practice routes reject a diagnostic ID with a link to its appropriate screen. Missing, replaced, incomplete, and unreadable-storage states do not invent completed results.

## Results and comparisons

The completion action opens practice results. The report shows overall/topic accuracy with counts, first-practice and retry accuracy, question exposure, rated confidence categories and unrated responses, learning priorities with lesson links, and expandable saved-answer review.

First-practice means the first saved practice response to that question. A prior diagnostic response makes it previously answered for selection purposes, but does not make the first practice response a retry. A retry is a subsequent practice response. These groups may contain different questions; their raw percentages are not an improvement claim.

The matched comparison includes only current retries with an earlier first-practice response for the same question ID. It reports earlier versus current accuracy on that matched set. Missing earlier records are excluded and counted. No comparison is inferred when the matched set is empty. Even matched repeats can benefit from familiarity and do not establish performance on unseen questions or isolate the cause of a change.

Report scores use saved correctness and the existing missing/conflicting-content handling. Reading results changes no responses, revision dates, or activity. Completion activity is recorded by the submission service once.

## Connections

Practice is enabled in learner navigation, dashboard topic cards, and saved-session actions. Concept lessons and diagnostic priorities link to the appropriate topic/concept focus. Diagnostic results can also open practice on current recorded weak areas. The dedicated practice routes preserve compatibility with earlier shared-runner links.

## Verification and review

Thirteen new tests cover bank balance/diagnostic stability, settings and scope validation, eligible limits, fresh-first selection/exposure, mixed-topic distribution, empty weak areas, onboarding prerequisites, independent diagnostic/practice sessions, resume, confirmed/stale replacement, storage failures, shared marking/feedback timing, matched comparisons, unavailable historical exposure, and metadata validation. All 79 project tests, lint, TypeScript checking, and the production build pass. HTTP HEAD checks return 200 for setup, a concept-focus URL, and the dynamic session/result route shells. Missing local sessions are handled client-side, so those HTTP checks do not verify rendered results or interactions.

Browser visual/interaction verification remains blocked by the earlier browser access policy. User validation should cover lesson-to-practice prefill, scope/count changes, empty weak areas, resume/replacement cancellation, confidence-off and delayed explanations, refresh, results, and mobile layout. Domain and HTTP checks do not replace those checks.

The preceding learning milestone was committed locally as `473900d` at the start of this step. New practice work stays uncommitted for review under the agreed workflow. No push is implied.

## Next

Stage 11: progress and dashboard completion, including date-filtered activity/trends, topic and confidence comparisons with denominators, separate first-attempt/retry evidence, current learning actions, and study plans. Keep flashcard recall outside marked-question accuracy.
