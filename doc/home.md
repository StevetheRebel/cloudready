# Home page (stage 2)

The public home page at `/` follows the CloudReady brief: product positioning, diagnostic and demo actions, a labelled sample dashboard, learner problems, four learning steps, five feature areas, a fictional local scenario, an interactive question, final account CTA, and footer information.

## Components

- `components/site/marketing-header.tsx` and `marketing-footer.tsx`: public navigation, unofficial disclaimer, and theme control.
- `components/site/product-preview.tsx`: illustrative topic breakdown, revision priority, and first-attempt/retry comparison. Every number is sample data, not a live dashboard metric.
- `components/site/sample-question.tsx`: one original question about guest OS maintenance on an IaaS virtual machine, with required answer/confidence selection, answer locking, confidence-aware feedback, per-option explanations, and retry.
- `components/site/entry-action.tsx`: an accessible availability notice for the full diagnostic and links to sign-up, sign-in, privacy, and terms. Account routes now contain the demo flows implemented in stage 3.

## Boundaries

The interactive sample uses component state only. It creates no account, writes no question responses to local storage, and does not modify the illustrative scores. Refresh clears the sample answer. The theme remains persistent through the shared provider.

Home demo actions now open `/demo`, the independent local learner space added in stage 3. The on-page sample remains available. Account actions open labelled demo forms; the full diagnostic remains unavailable. Privacy and terms link to initial accurate demo information pages. Review and complete those policies before real registration opens.

The preview compares IaaS and PaaS responsibilities using fictional organisations. The original question and explanation reference [Microsoft Learn: Describe cloud service types](https://learn.microsoft.com/training/modules/describe-cloud-service-types/), checked on 23 October 2026. No real exam question or Microsoft logo is used. The main question and lesson banks remain empty pending their separate review.

## Verification

Browser checks cover required selections, confident incorrect feedback, uncertain correct feedback, locked submitted controls, all option explanations, retry, section links, account availability notices, Escape cancellation and restored focus, mobile/desktop layout, and browser console errors. Screenshots are in `doc/home-mobile.png` and `doc/home-desktop.png`.

## Next

The demo scope of stage 3 is complete; see `doc/auth.md`. Next is onboarding. Connect real sign-up/sign-in with Better Auth and Neon when configured, and keep demo access independently usable. The standalone how-it-works page and final policy review remain later work.
