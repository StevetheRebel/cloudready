# Assessment runner

Stage 7 completes the runner at `/assessment/[sessionId]`. Diagnostic setup creates sessions; the runner can now also consume valid persisted practice sessions. Practice creation and its dedicated routes remain stage 10.

## Answer and explanation flow

The shared `QuestionPanel` handles option selection, confidence, answer locking, and feedback. The persisted session controls confidence and feedback timing. Diagnostics always require confidence, including when a saved diagnostic's optional flag is false. Practice may turn confidence off; those submissions store `null`, not a guessed rating.

For after-answer sessions, explanations appear immediately after a successful save. For after-session sessions, submitted responses show only a saved-answer state until the session completes. Answer correctness, explanatory formats, per-option explanations, and source links are hidden during that state. Completed sessions support answer review. Only submitted question IDs can be reviewed, so a stale or future review ID cannot skip questions.

The service re-reads saved records before marking and saving. Practice attempt type is `first-practice` until a prior practice response exists for that question, then `retry`. A prior diagnostic response alone does not make the first practice response a retry. Submitted response records remain unchanged. Unrated correct responses do not create uncertain-correct revision items. Wrong responses and rated uncertain-correct responses retain their normal revision treatment; existing review schedules are preserved.

## Explanation formats

The feedback card offers Standard, Simpler, Local example, and AI help. All 12 initial questions have simpler text and fictional Kenyan teaching scenarios that clarify the same source-checked concepts. Onboarding's saved preference selects the initial format: concise → Simpler, detailed → Standard, example-first → Local example. Learners can switch formats for the current answer without changing their saved preferences or score.

Source links and correct/alternative option explanations remain visible alongside the chosen format. Fictional scenarios are labelled explicitly. If supporting text is missing in future content, the standard explanation is shown with a clear availability message.

AI is not connected in this demo. AI help displays an honest unconfigured notice and source-checked fallback text. If the browser reports being offline, it instead explains that AI and external source links require a connection while the already loaded explanation remains usable. Network status is subscribed to with cleanup. No request is sent, no key is needed, and no loading animation or generated answer is simulated. These are current availability states; provider loading/error/retry handling belongs with a future server-side AI integration.

## Scope and verification

The domain and presentation parts are shared across diagnostic and practice sessions, including saved-session dashboard links. This does not make practice setup, fresh-question selection, practice result routes, or the larger question bank complete.

Seven additional tests cover format support/fallbacks, preference mapping, AI-unconfigured/offline messages, hidden feedback before completion, invalid review IDs, mandatory/optional confidence, unrated revision semantics, immutable response history, completion, and first-practice/retry classification. Together with diagnostic and existing tests, all 49 project tests pass. Lint, TypeScript checking, and the production build verify the implementation.

Browser visual and interaction checks remain unavailable because of the earlier browser access-policy block. Before release, review format-button keyboard access, announcement/focus behaviour, offline messages, after-session feedback, refresh/resume, and small-screen layouts. No browser check is claimed by the domain or route tests.

Next: stage 8, the dedicated detailed-results page with topic and confidence breakdowns, revision priorities, and expandable answer review. Lessons and targeted-practice destinations must only become active when implemented.
