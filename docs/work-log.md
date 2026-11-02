## 2026-11-01 — Preserve cohort planner curriculum topics

- Objective and starting point: marketing idea #1686; mixed plain and explicit week lines silently overwrote topics in the public planner.
- Checkpoint 1 — Investigation: reproduced against staging 579004d with the actual parser. Screen, Markdown and print share the generated plan. Existing planner feature reports do not cover collisions.
- Checkpoint 2 — Implementation: reserve explicit weeks before filling remaining slots; retain the first duplicate week and show a specific conflict notice. No data collection or backend changes.
- Outcome: partial; regression and workflow verification pending, Ziki idea approval pending. PR target staging approved by the owner.

## 2026-11-02 — Verification checkpoint

- Idea #1686 received three good votes and became Ziki issue #2233; our reproduction-backed confirmation was recorded. Assignment remains gated on the remaining confirmations.
- Focused parser regressions passed. Full formatting and lint passed (120 warnings, no lint errors). Type checking passed after a frozen-lockfile dependency install.
- Initial reuse of an older dependency junction failed type/build checks because dependencies were missing and Turbopack rejects an external node_modules link. Replaced only the junction with a local locked installation; production build verification is in progress.
- Documentation: added weekly-topic input/conflict rules and linked them from README. Outcome: implementation prepared; final build, browser checks and PR pending.
- Checkpoint 3 — Final verification: four parser/export regressions pass; type check and production build pass after locked installation. Browser generation and the actual downloaded Markdown preserve HTML, Introduction and JavaScript and include the duplicate-week warning. Inspected 375px phone and 1280px desktop layouts in light mode without horizontal overflow. Screenshots/download are session artifacts outside the repository. Clipboard contents and dark-theme rendering were not verified.
- Outcome: code and documentation ready for a draft PR against staging; final Ziki confirmation and assignment still pending. No production deployment is claimed.
