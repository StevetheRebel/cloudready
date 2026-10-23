# Onboarding (stage 4)

`/onboarding` configures the local demo learner. No real account or authentication is required or created.

## Three steps

1. Preferred display name, cloud experience, previous AZ-900 preparation, and explanation style.
2. Optional exam date or I haven’t chosen a date, at least one study day, 5–240 whole minutes per session, and an editable timezone. New profiles use the browser timezone; returning learners retain their saved choice.
3. Difficult topic groups or the exclusive Not sure yet option. Topic selection does not itself create a learning gap or score.

The wizard includes progress, Back, visited-step navigation, Save and exit, field-level validation, keyboard-focus handling, and storage error states. Future steps cannot be selected until reached. All steps are revalidated before completion, including dates entered in an earlier step.

## Persistence

`cloudready:onboarding:v1` stores a validated draft containing the demo profile ID, current step, editable values, and update timestamp. Changes and step navigation save immediately. Incomplete inputs can be retained in the draft without being accepted as finished preferences. Reloading resumes the saved step; Save and exit returns to `/demo`, whose setup link resumes the draft.

Malformed, unsupported, or mismatched-profile drafts produce an error rather than being silently overwritten. A storage failure leaves values on screen and states that the latest changes were not saved. Drafts contain no credentials. Multi-tab draft writes currently use the last saved draft; there is no conflict-resolution UI.

Completion reads the latest learner records, changes only profile preferences/display name and `onboardingComplete`, persists them, then removes the setup draft. Existing sessions, responses, lesson reviews, revision schedules, and activity remain intact. A failed profile save retains the draft. A failed draft cleanup is reported separately after the successful profile save. Demo reset removes both demo data and setup drafts while retaining the theme.

## Validation rules

- Display name is trimmed and must contain 1–50 characters.
- Study days must be unique, valid day numbers, and include at least one day. Stored day values use Sunday 0 through Saturday 6; the UI displays Monday first.
- Study minutes must be a whole number from 5 to 240.
- Timezone must be recognized by Intl.DateTimeFormat; the suggestions are examples, not a closed list.
- A chosen exam date must be a real calendar date and today or later in the chosen timezone. Opting out saves `null`.
- Not sure yet clears topic selections. Otherwise, at least one unique valid topic is required.
- Completion stores typed, normalized preferences; it does not add learning activity or imply mastery.

## Entry and completion

Home and account demo-entry actions send incomplete learners or learners with drafts to `/onboarding`. Completed learners without drafts open `/demo`, where Edit study preferences remains available. Direct visits to `/onboarding` can also create/resume a local demo profile.

The final Take the diagnostic and Go to dashboard actions both save preferences, then show a clear completion screen explaining that their destination is not yet implemented. That screen offers Continue to demo and Edit preferences. The form explains this before submission. Connect these actions to actual routes when guide stages 5–6 are built.

## Verification

All 25 domain/auth/foundation tests pass. New coverage includes timezone-sensitive past-date rejection, invalid dates, optional exam dates, topic exclusivity, draft refresh/resume, corrupt and cross-profile drafts, preservation of learner records, save failures, cleanup failures, and reset scope. Lint and the production build check the implementation.

Browser interaction and visual verification remain unavailable following the prior browser access-policy block. Review mobile/desktop layout, radio-keyboard controls, error focus, forward/back navigation, refresh, and final action states in the browser before release.

## Next

Build the initial dashboard using the saved profile and genuine empty learning records, then implement diagnostic start/resume. Real account persistence remains deferred.
