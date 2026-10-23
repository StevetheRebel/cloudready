# CloudReady project submission

Prepared: 23 October 2026. This document is a submission draft, not evidence of commercial traction or a market-ready launch.

## Project title

CloudReady — Confidence-Aware AZ-900 Study Coach

## Category

Practice & Assessment: Smart Quiz Builder

If the submission form uses broader categories, select Education / EdTech. The proposed product also combines revision, study planning, and progress tracking, but its primary learning loop begins with assessment and explanation.

## Project description

CloudReady is an unofficial AZ-900 study coach designed to help learners identify misunderstandings, practise weak topics, and measure improvement. Its approach pairs each answer with a confidence rating: an incorrect answer given confidently becomes a revision priority, while a correct but uncertain answer still deserves another look.

The intended learning journey connects a diagnostic assessment, clear concept explanations, fictional African business scenarios, fresh practice questions, and progress tracking. Reviewed answer keys determine correctness; optional AI assistance will explain concepts, with reviewed fallback content when AI is unavailable.

The current prototype includes a responsive home page, an interactive question with confidence-based feedback, clearly labelled demo account flows, and three-step onboarding with persistent local preferences and resumable drafts. Development is continuing on the complete diagnostic, lessons, targeted practice, revision queue, and dashboard. CloudReady is not affiliated with or endorsed by Microsoft, and its progress indicators will not predict official exam results.

## Short description, if the form has a tighter limit

CloudReady is an unofficial AZ-900 study coach that pairs answer accuracy with learner confidence to guide revision. The prototype includes an interactive question, demo account flows, and persistent onboarding. The planned learning loop connects diagnostics, clear explanations, local scenarios, fresh practice, and progress tracking.

## Current evidence and product status

Confirmed as of 23 October 2026:

- Next.js App Router, TypeScript, and Tailwind CSS v4 implementation.
- Public home page and an original interactive sample question.
- Demo sign-up/sign-in, explicitly without real accounts or email delivery.
- Three-step onboarding, validated preferences, local draft persistence, and resume.
- 25 passing automated tests; lint and production-build checks pass.
- Source repository: https://github.com/StevetheRebel/cloudready

Not yet established or implemented:

- Commercial user counts, paying customers, revenue, retention, partnerships, or measured learning outcomes.
- Full diagnostic, lesson library, practice sessions, revision queue, and live progress dashboard.
- Real Better Auth/Neon account integration, email delivery, payments, and live AI.
- Browser visual/interaction verification for the newest account and onboarding pages remains outstanding following a browser access-policy block. Passing code checks are not a substitute for that review.

## Presentation companion

Use `doc/canva-presentation-prompt.md` as the detailed Canva prompt. It contains all 12 requested topics, suggested slide copy, presenter notes, layout direction, and motion instructions.

Week 1 starts Monday, 19 October 2026. The proposed 13-week validation roadmap ends Sunday, 17 January 2027. Only the build status through 23 October is reported as achieved. Later milestones are targets.

## Commercial assumptions to review before presenting

These are proposals, not existing business results:

- Initial launch focus: English-speaking AZ-900 learners in Kenyan developer communities and training cohorts; wider African access is an expansion goal.
- Pricing tests: free core learning access; proposed KES 300 for a 30-day study pass or KES 700 for a 90-day pass, plus institution/sponsor-funded cohorts.
- Illustrative SAM model: 20 prospective cohorts/year × 150 unique eligible learners = 3,000 learners/year. Neither cohort access nor this audience size is verified.
- At one KES 700 purchase per eligible learner, that hypothetical SAM represents KES 2.1 million in annual potential spending, not a revenue forecast.
- Illustrative first-year SOM: 150 paying learners, or 5% of that hypothetical SAM. One KES 700 purchase each yields KES 105,000 gross revenue before costs. This is a scenario, not a forecast or a three-month target.
- Suggested pilot request: KES 300,000 in funding and/or equivalent in-kind support over 13 weeks. This is a working proposal, not a costed or approved investment round.
- Quantitative global TAM remains unverified. Do not substitute the whole cloud-computing market, every African internet user, or the hackathon movement's aspirational audience for CloudReady's addressable customer count.

Replace team names, contact details, approved funding amount, and commercial assumptions before submission. Do not invent missing details.

## Sources checked for competitive context

- [Microsoft Azure Fundamentals: intended audience and official preparation resources](https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/).
- [Microsoft Learn: free Practice Assessments](https://learn.microsoft.com/en-us/certifications/practice-assessments-for-microsoft-certifications).
- [Whizlabs AZ-900 offering](https://www.whizlabs.com/microsoft-azure-certification-az-900/) and [its preparation guide](https://www.whizlabs.com/blog/az-900-exam-preparation/).
- [Tutorials Dojo AZ-900 practice exams, review/section modes, and flashcards](https://portal.tutorialsdojo.com/courses/az-900-microsoft-azure-fundamentals-practice-exams/).

Competitor research does not establish that these products lack confidence tracking or local examples. No such absence or exclusivity claim is made.
