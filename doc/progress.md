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

This counts tasks equally. It is not an estimate of remaining engineering time, production readiness, or commercial readiness. A checkbox for a small UI state and a checkbox for real authentication have very different effort. Backend accounts, email, live AI, recovery flows, supporting pages, and release validation still require work.

The current local demo has home, simulated account entry, onboarding, dashboard, a saved diagnostic, detailed results, concept lessons/library, targeted practice, and progress analytics. Returning learners receive saved-session actions, report links, and study plans within their chosen budget. The revision queue is implemented with recall scheduling and undo. Settings, export, and reset controls are implemented. Demo account recovery is next; browser acceptance remains unverified. Update the calculation from the guide whenever scope or task completion changes rather than treating this percentage as fixed.
