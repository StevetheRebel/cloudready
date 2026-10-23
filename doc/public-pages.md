# Supporting public pages and navigation

Stage 15 adds `/how-it-works`, reviews the current-demo privacy/terms copy, connects public navigation to the explanation page, and adds the root 404. Recovery was committed as `707a4c0` before starting this milestone. Current work remains uncommitted for review, with no push requested.

## How it works

The new page explains preferences → diagnostic → concept lessons → focused practice → recall revision → progress, with links to each existing destination. Demo entry reuses the established action that opens onboarding for incomplete profiles/drafts or the dashboard for completed learners. The header’s primary action now opens this working demo rather than the simulated registration flow; sign-in preview remains available.

Four labelled illustrative confidence cases explain why confident mistakes and uncertain correct answers both deserve attention. Practice can disable confidence; unrated responses are not classified as uncertain. An explicit illustrative first-practice/retry comparison shows counts beside percentages and explains why higher retry accuracy does not prove improvement on unseen questions. No sample data is written to learner records.

The page states the current 30-question/twelve-lesson scope, partial objective coverage, fictional scenarios, local storage, no cross-device sync, simulated accounts/recovery, prepared explanations, and unavailable live accounts/email/generated explanations. Home/footer copy now says track learning/practice rather than promising measured improvement, and the account CTA explicitly says preview.

## Privacy and demo terms

The privacy page covers saved names/preferences, diagnostic/practice answers and session metadata, lesson reviews, recall ratings/schedules, onboarding drafts, per-tab settings drafts, theme, and export/reset scope. It explains origin/browser boundaries, no server backup, no live help-provider prompts, external resources, and ordinary page/asset network requests without inventing hosting-log retention claims. Exported files and other tabs’ temporary drafts are outside this tab’s reset controls.

Demo terms describe the implemented study experience, original/non-exam content, confidence/retry limitations, incomplete objective coverage, local-data risks, export without import, unavailable real accounts/payment/credential changes, and the simulated acceptance checkbox. No company identity, contact address, paid-plan terms, legal jurisdiction, or retention period was invented. These pages describe the current demo and must be reviewed again before live account launch.

## Public navigation and 404

Header/footer explanation links now open `/how-it-works`; Features retains the home fragment. Existing home fragments remain available, and home includes a link to the full explanation page. Policy pages link back to How it works. The custom root not-found UI uses the public shell, existing theme/focus styles, an h1, and working home/library/explanation destinations. It performs no learner-data writes. The lesson-specific not-found view remains separate.

The installed Next.js file-convention documentation was read before adding `app/not-found.tsx`. A root layout already exists, so no experimental global-not-found mode was needed. The framework supplies noindex for not-found responses. Streamed not-found responses can keep HTTP 200; generated HTML inspection does not establish live status codes.

## Verification and acceptance

This milestone changes public content/navigation rather than scoring or persistence, so it adds no implementation-mirroring unit tests. Verification uses ESLint, the production build with TypeScript checking, diff checks, and inspection of generated HTML links, route destinations, fragments, and landmarks. No temporary preview server, browser workaround, or external service was used following the earlier access-policy blocks.

ESLint and the production build passed, including TypeScript checking and the new route. Generated HTML inspection passed for 66 internal links/fragments across home, How it works, privacy, terms, and root 404. Each page has one h1, one main, unique IDs, and a valid skip-link target. The 404 includes noindex. Existing domain tests were not rerun for these content-only changes; the preceding milestone passed all 109 tests. `git diff --check` passed.

Browser layout/interaction remains unverified. User review should cover the header/footer on home, How it works, privacy, terms, and a nonexistent route; Features and sample fragments; demo entry for new/returning learners; keyboard navigation/skip link; mobile layouts; and theme contrast. The root 404 should also be checked at a nonexistent URL in the actual running/deployed app.

Next: full demo-journey acceptance and release review. Use the guide’s separate journey checklist, including saved preferences, diagnostic/results, lesson review, fresh practice, progress, refresh/resume, mobile, and keyboard use. The implementation count is 63/65 (96.9%); its remaining two items are real Neon/Drizzle/Better Auth integration and live recovery email, both deferred under the selected demo scope. Browser acceptance and production readiness are separate requirements.
