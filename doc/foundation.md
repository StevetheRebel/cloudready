# Shared foundation

Stage 1 provides reusable building blocks. No real authentication, database, email, AI service, or learning pages are connected yet.

## Review

Run `npm run dev`, then open `/foundation`. The temporary `/` entry links there. The preview supports learner/public shell switching, light/dark/system themes, form validation, saved demo names, notifications, and confirmed demo reset. Future navigation items are visibly unavailable.

## Structure

- `components/ui`: buttons, cards, badges, labelled fields, confirmation dialogs, notifications, loading/empty/error states.
- `components/layouts`: public header/footer and learner desktop/mobile shell. Pass only implemented routes through `availableRoutes` until navigation is complete. These shells do not enforce authentication; add server-side session checks with Better Auth in stage 3.
- `components/providers.tsx`: theme and toast providers. Default appearance is light; the theme is saved separately from demo progress.
- `lib/cloudready/models.ts`: TypeScript types inferred from Zod validation for learner data, questions, responses, sessions, revision, and activity.
- `lib/cloudready/content.ts`: topic metadata and intentionally empty question/concept banks pending content review.
- `lib/cloudready/scoring.ts`: reviewed-key marking, immutable submitted responses, confidence classification, revision priority, and accuracy.
- `lib/cloudready/scheduler.ts`: calendar-date revision scheduling using the learner's timezone.
- `lib/cloudready/persistence.ts`: versioned, validated demo storage behind a repository interface.
- `lib/cloudready/services.ts`: demo service boundary. Replace with server-backed account services later.
- `tests/foundation.test.ts`: meaningful checks for scoring, persistence, reset scope, validation, and scheduling.

## Demo storage contract

`cloudready:demo:v1` contains only validated demo learner records. Authenticated profiles are rejected. Unknown schema versions or corrupt records produce an error; they are not silently replaced. Storage failures are surfaced. Since stage 4, reset removes that key and the `cloudready:onboarding:v1` setup draft, retaining the independent `cloudready:theme` preference. There are no passwords, tokens, or API keys in the learner schema.

The preview creates a demo record only when saving a valid display name. It starts with no responses, reviews, sessions, or fabricated activity. Recreating the service or refreshing the page reads the same data. Browser storage events update the preview across tabs. There is no multi-tab conflict resolution yet; future session persistence must address competing writes.

## Scoring and revision rules

- Mark against the reviewed question key, not AI output.
- Preserve the submitted option and timestamp; reject repeat submissions and out-of-order questions.
- Require diagnostic confidence. Practice can disable confidence; unrated answers stay separate from uncertain answers.
- Accuracy is marked correct responses divided by submitted responses. Empty sets return `null`, not 0%.
- Revision priority: confident incorrect (3), other incorrect (2), uncertain correct (1), confident correct or unrated correct (0).
- Recall intervals: Again 1 day, Hard 3 days, Good 7 days, Easy 16 days. Consecutive Easy ratings double the interval up to 120 days. Other ratings reset the Easy streak.
- Due dates are `YYYY-MM-DD` in the selected timezone. They represent calendar days rather than elapsed 24-hour periods. Flashcard recall does not contribute to marked-question accuracy.

## Verification

Use `npm test`, `npx tsc --noEmit`, and `npm run build`. Check the preview at mobile and desktop widths and with keyboard navigation, including dialog cancellation and focus restoration. Run `npm run lint` for the React and accessibility lint checks.

## Next

Build stage 2, the complete home page, using these shared components. Remove or restrict `/foundation` before public release. Import and review question/lesson content before assessments become available. Follow `doc/guide.md` for subsequent stages.
