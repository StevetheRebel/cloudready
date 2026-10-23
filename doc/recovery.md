# Demo account recovery

Stage 14 adds `/forgot-password` and `/reset-password` within the existing auth layout. Sign-in's Forgot password link now opens the recovery page. Settings was committed as `aae6a3f` before starting this milestone. Recovery changes remain uncommitted for review; no push was requested.

## Recovery request

The request form asks for a fictional example email, validates it using the shared email schema, displays pending/error states, and clears the address after success. Every syntactically valid address receives the same neutral result, including the public sample account and unknown addresses. No account lookup occurs, no address appears in a URL or confirmation, and no email is sent or queued.

The confirmation explicitly explains the demo limit and links to a public reset-form example. Try another example email returns to the empty form and focuses the email field. Errors focus the alert or invalid field; the completion heading receives focus after success. The local preview works offline once loaded, since the adapter has no network dependency.

## Reset-link examples

| URL                                                        | Behaviour                                           |
| ---------------------------------------------------------- | --------------------------------------------------- |
| `/reset-password`                                          | Missing-preview explanation and recovery action     |
| `/reset-password?preview=valid`                            | New example password and matching confirmation form |
| `/reset-password?preview=invalid`                          | Unsupported-link explanation                        |
| `/reset-password?preview=expired`                          | Explicitly labelled expired-link demo state         |
| `/reset-password?preview=used`                             | Explicitly labelled used-link demo state            |
| Any `token` parameter, including alongside `preview=valid` | Unsupported; real reset tokens are not validated    |
| Duplicate or unknown `preview` values                      | Unsupported                                         |

The form uses the existing 8–128 character password policy and visibility controls. Passwords are not trimmed and confirmation must match exactly. Only the valid public fixture can complete the local validation preview. A keyed child clears form/completion state when switching link states. Reloading a valid example starts over; no expiry clock, consumed token, or durable password state exists.

Completion clears both password fields and states that no credentials changed. It links back to sign-in and displays the unchanged public fixture credentials. The account adapter still accepts only its original sample password. Real email/password changes remain unavailable in Settings.

## Service and storage boundaries

`lib/auth/recovery.ts` holds shared reset validation, pure preview-state parsing, and a stateless demo adapter. Valid requests return a neutral unsent result; successful resets return `passwordChanged: false` with no password or token. Injected async pauses allow pending/failure/retry testing. Duplicate submissions are guarded in the UI. This adapter makes no account-service mutation, browser-storage write, HTTP request, or learning-record write.

Emails and example passwords remain in page memory while entered/submitted. The privacy page describes the preview accurately. Both routes are excluded from search indexing; reset query handling uses a client component inside Suspense, matching the existing sign-in route pattern.

## Verification and limits

Domain tests cover identical responses across known/unknown/example addresses, malformed email, all link states, token/preview conflicts, password length/matching/whitespace rules, nonvalid reset rejection, no credential changes, safe result shapes, and failure/retry behaviour. Browser/visual testing remains unavailable following earlier access-policy blocks; no alternate browser or preview-server workaround was attempted.

All 109 project tests, ESLint, and the production build passed. The build completed TypeScript checking and includes both recovery routes. `git diff --check` passed. These checks do not verify browser layout, focus, visibility toggles, or navigation interactions.

User validation: sign-in → Forgot password → example request → neutral confirmation → valid preview → matching invented passwords → completion → unchanged sample sign-in. Also check missing/invalid/expired/used examples, error/success focus, password visibility, repeated submission, mobile layouts, and theme contrast. Use invented details; no credentials or email setup are required for this milestone.

Real recovery is deferred until Better Auth/Neon and email are connected. It will need server-authorised, expiring, single-use reset tokens and server-side password changes. Public preview parameters must never become live authorisation. The live-email task remains unchecked in the guide; the current 60/65 checklist count is not production readiness.

Next: stage 15 supporting public pages, product explanation/confidence examples, privacy/terms review against implemented behaviour, and public navigation/404 completion.
