# Zedu Contributor Collaboration & Git Workflow Guide

Welcome to the **Zedu** engineering team! With 50+ engineers actively contributing across frontend, backend, and mobile, following this streamlined workflow ensures zero friction, fast review cycles, and zero repository conflicts.

---

## 1. Repository Ecosystem

| Repository | Tech Stack | Primary Branch |
| :--- | :--- | :--- |
| **`zedu-fe`** | Next.js (TypeScript), Tailwind CSS | `staging` / `main` |
| **`zedu-drongo-be`** | Go, PostgreSQL, Docker | `staging` |
| **`zedu-drongo-mobile`** | React Native, Expo / Bare RN | `main` |

---

## 2. Git Branching & Naming Standards

Direct pushes to protected branches (`main`, `staging`) are **strictly prohibited** by branch rulesets. All work must be conducted on feature/fix branches and merged through Pull Requests.

### Branch Naming Convention
Always create your branch from the latest state of the upstream staging branch:

```bash
git checkout staging      # or main, depending on repository
git pull origin staging
git checkout -b <type>/<concise-name>
```

| Type | When to use | Example |
| :--- | :--- | :--- |
| `feat/` | New functionality or user stories | `feat/user-status-modal` |
| `fix/` | Bug fixes or issue resolution | `fix/voice-call-mute-button` |
| `refactor/` | Code cleanup with no behavior change | `refactor/message-parser` |
| `perf/` | Performance optimizations | `perf/virtualized-chat-list` |
| `test/` | Adding or updating tests | `test/auth-integration` |
| `chore/` | Tooling, dependencies, or config | `chore/update-dependencies` |

---

## 3. Commit Message Standards

Repositories enforce Conventional Commits via commitlint pre-commit hooks and CI. Commits must follow this pattern:

```
<type>(<optional-scope>): <imperative description>
```

**Good Examples:**
- `feat(chat): implement reaction picker for messages`
- `fix(auth): prevent token expiration loop on reconnect`
- `refactor(db): streamline user organization query`

---

## 4. Pull Request (PR) Lifecycle

### 1. Pre-PR Sanity Checks
Run local validation before pushing:
- **Frontend (`zedu-fe`)**: `npm run test-all` or `npm run check-lint && npm run check-types`
- **Backend (`zedu-drongo-be`)**: `make test` or `go test ./...`
- **Mobile (`zedu-drongo-mobile`)**: `npm run lint` and verify on emulator/simulator

### 2. Open the PR
- Target the appropriate base branch (`staging` or `main`).
- The PR title should follow conventional commit formatting.
- Complete all sections of the automated PR template.
- Link the related GitHub issue: `Closes #123`.
- **For UI changes**: Attach side-by-side screenshots or screen recordings (Required).

### 3. Review & Approval
- At least **1 peer review approval** is required.
- Approvals will be dismissed automatically if you push new commits.
- **Conversation resolution**: All comments or discussion threads must be marked as resolved.
- Once approved and CI is green, the PR can be merged.
- Head branches will be **automatically deleted** upon merge to avoid clutter.

---

## 5. Team Tags & Review Requests

Use GitHub team mentions in issues or PR comments to reach the right group:
- `@Zedu-Drongo/frontend` — Frontend engineers
- `@Zedu-Drongo/backend` — Backend engineers
- `@Zedu-Drongo/mobile` — Mobile engineers
- `@Zedu-Drongo/leads` — Tech leads and review escalations

---

## 6. Golden Rules for Frictionless Collaboration
1. **Never commit secrets**: Do not commit `.env`, private keys, or passwords.
2. **Keep PRs small**: Aim for < 300 lines changed per PR. Small PRs get reviewed in minutes; large PRs stall.
3. **Pull often**: Rebase or pull from `staging` daily to prevent painful merge conflicts.
4. **Be kind & construct in reviews**: Point out improvements respectfully and celebrate good work.
