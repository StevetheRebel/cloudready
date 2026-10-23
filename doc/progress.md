# Implementation progress

Progress is measured from checked tasks in the Implementation order section of `doc/guide.md`. Requirements applied throughout, journey acceptance, and delivery-documentation checklists are excluded from this calculation. They remain separate release conditions, including browser and keyboard validation.

| Milestone                                      | Completed implementation tasks | Checklist completion |
| ---------------------------------------------- | ------------------------------ | -------------------- |
| Diagnostic results, before concept learning    | 36 / 65                        | 55.4%                |
| Concept learning and library                   | 40 / 65                        | 61.5%                |
| Targeted practice and learning-gap connections | 45 / 65                        | 69.2%                |
| Progress analytics and dashboard completion    | 50 / 65                        | 76.9%                |
| Revision queue and recall scheduling           | 54 / 65                        | 83.1%                |
| Settings, export, resets, and unsaved edits    | 59 / 65                        | 90.8%                |
| Demo recovery forms and reset-link states      | 60 / 65                        | 92.3%                |
| Supporting public pages and custom 404         | 63 / 65                        | 96.9%                |

This counts tasks equally. It is not an estimate of remaining engineering time, production readiness, or commercial readiness. A checkbox for a small UI state and a checkbox for real authentication have very different effort. Backend accounts, email, live AI and release validation still require work.

Connected service/data journey acceptance is now covered by `tests/journey.test.ts`; see `doc/acceptance.md`. Adding acceptance evidence does not change the 63/65 implementation count. The user subsequently reported passing core browser/mobile/keyboard checks. The guide distinguishes those reports from automated evidence and unreported edge cases.

The current local demo has home, simulated account entry, onboarding, dashboard, a saved diagnostic, detailed results, concept lessons/library, targeted practice, and progress analytics. Returning learners receive saved-session actions, report links, and study plans within their chosen budget. The revision queue is implemented with recall scheduling and undo. Settings, export, and reset controls are implemented. Demo account recovery forms/states are implemented. Supporting public pages and the custom 404 are implemented. The next phase is full-journey acceptance and release review; the user has reported passing core browser journey, layout, refresh/resume, and keyboard checks. Update the calculation from the guide whenever scope or task completion changes rather than treating this percentage as fixed.
