# Demo account flows (stage 3)

The user selected demo account flows before connecting Neon, Better Auth, or email delivery. The pages are UI previews, not authentication or access-control mechanisms.

## Routes and behaviour

- `/sign-up`: full name, email, password, confirmation, required demo policy acceptance, password visibility toggles, visible requirements, inline validation, loading/error states, and a simulated Check your email screen.
- `/sign-in`: email/password validation, public sample details, invalid-credential and success previews, password visibility, and separate demo entry.
- `/sign-in?reason=expired`: an explicitly labelled expired-session preview. It does not imply that a real session existed.
- `/demo`: creates or resumes the independent local demo learner and shows the sample question. Account-form data is never copied to that profile. No fake learning scores are added.
- `/privacy`, `/terms`: initial pages describing the demo accurately, linked from forms and the public footer. Review before real registration opens.

Home-page account links now navigate to these pages. Demo links open the separate learner space; the original home sample remains available.

## Trying the forms

Use Fill sample details rather than personal credentials. The sign-in fixture is `learner@example.com` with public sample password `CloudReadyDemo1!`. These values do not grant access to a real service.

Sign-up's sample button uses `Amina Demo` and `amina@example.com`. The required checkbox demonstrates acceptance only; the terms explicitly state that no agreement is recorded. Using `learner@example.com` in sign-up triggers the existing-account preview. Newly submitted details never become a working account.

A successful sign-up clears entered form values and shows the supplied email with an explicit statement that no account was created and no email was sent. Resend is simulated, displays a matching notification, and has a 30-second cooldown. Change email returns to the form with the prior address and cleared password fields.

A successful demo sign-in clears the password and displays an explicit preview state. Explore demo is a separate action that opens the public local learner space. Refreshing the sign-in page returns to the empty form: no authenticated session is kept.

Remember me is visibly disabled with an explanation until real authentication exists. Forgot password opens an availability explanation; the full recovery routes remain stage 14 work. No social authentication buttons are shown.

## Service and validation boundaries

- `lib/auth/validation.ts`: Zod validation shared by forms and the mock service. Email is trimmed and lowercased; passwords are not trimmed. Password length is 8–128 characters. Confirmation must match; demo acceptance is required.
- `lib/auth/demo-service.ts`: stateless `AccountService` adapter. No account registry, network requests, persistent user credentials, or session tokens. Its public sample fixture is demonstration data, not a secret.
- `components/auth`: focused account layout content, shared password controls, explicit demo notices, forms, and separate demo entry.

Form inputs remain in component memory while being edited. The mock adapter does not write browser storage. Only entering the independent learner demo creates/resumes the existing validated demo record. Real authentication must enforce checks on the server; these client forms cannot protect routes.

## Verification

All 16 automated tests pass, including eight auth tests covering validation, matching passwords, consent, normalization, existing-account errors, invalid credentials, simulated results without password/token disclosure, lack of account creation, and resend validation.

TypeScript, lint, and production-build checks cover the routes. Local HTTP HEAD checks returned 200 for sign-up, sign-in, the expired-session variant, demo, privacy, and terms.

Browser access was rejected by the browser security policy during this stage. Visual, keyboard-interaction, and responsive browser checks are therefore unverified for these new pages. No browser workaround was used. Review the UI in a browser before release, including error focus, visibility toggles, success-screen focus, resend cooldown, mobile layouts, and demo navigation.

## Deferred live integration

Replace the mock adapter with Better Auth, Neon Postgres, and Drizzle migrations. Add server-side session checks, verification delivery, recovery, Remember me behaviour, and current production policy content. Do not treat the demo success result or local profile as authentication. No credentials are needed for the current demo build.

Onboarding is now implemented at `/onboarding`; see `doc/onboarding.md`. Demo entry goes there for incomplete profiles or saved setup drafts, and to `/dashboard` for completed profiles without drafts. Real accounts remain separate and unimplemented. The initial dashboard is implemented; diagnostic setup and the initial runner are available; see `doc/assessment.md`.
