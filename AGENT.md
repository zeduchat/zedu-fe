# Frontend AI Agent Guidelines & Coding Standards

This document outlines mandatory coding conventions, architecture patterns, and testing requirements for AI agents and developers contributing to **`zedu-fe`**.

---

## 1. Tech Stack & Directory Structure

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript (`strict` mode)
- **Styling**: Tailwind CSS, Radix UI Primitives, `clsx`, `tailwind-merge` (`cn` helper)
- **Realtime / Media**: Centrifuge (WebSockets), Agora RTC SDK (Calls/Buzz)
- **Forms & Validation**: `react-hook-form` with `zod`

### Directory Layout
- **`src/app/`**: Next.js App Router pages, layouts, and route handlers.
- **`src/components/`**: Reusable UI components (buttons, modals, avatars, inputs).
- **`src/hooks/`**: Custom React hooks (`useDebounce`, `useMediaQuery`, etc.).
- **`src/lib/`**: Core utilities, API clients (Axios instance), and helper functions.
- **`src/store/`**: Global state management (Zustand / React Context selectors).
- **`src/types/`**: Shared TypeScript definitions and data interfaces.
- **`src/utils/`**: Utility formatters, date helpers, string helpers.

---

## 2. Component & Code Conventions

1. **Client vs. Server Components**:
   - Next.js App Router defaults to Server Components.
   - Add `'use client';` at the very top of files only when using hooks (`useState`, `useEffect`, custom hooks), browser APIs, or event listeners.
   - Keep Server Components as wrappers where possible to maximize performance.

2. **TypeScript Discipline**:
   - Explicitly type all component props using an interface named `<ComponentName>Props`.
   - **Strictly avoid `any`**: Use precise types, generics, or `unknown` with type guards.
   - Define domain entities in `src/types/`.

3. **Styling & Design System**:
   - Use Tailwind utility classes with the `cn()` helper (`clsx` + `twMerge`) for conditional classes.
   - Prefer Radix UI primitives (`@radix-ui/react-*`) for interactive elements (dialogs, dropdowns, popovers) to guarantee accessibility (a11y).
   - Support dark mode using `next-themes` classes.

4. **Form Handling**:
   - Always validate forms using Zod schemas (`zod`) paired with React Hook Form (`@hookform/resolvers/zod`).
   - Display field-level validation errors clearly to the user.

---

## 3. Verification & Quality Commands

Always run and verify these checks before concluding any frontend modification:

```bash
# Type check without emitting files
npm run check-types

# Linting check
npm run check-lint

# Prettier format check
npm run check-format

# Comprehensive validation (CI parity)
npm run test-all
```

---

## 4. Git & Commit Directives

- **Conventional Commits**: Enforced via `@commitlint/cli`. Format: `<type>(<scope>): <message>`.
- **Branching**: Branch off `staging` using `feat/<name>`, `fix/<name>`, or `refactor/<name>`.
- **UI Evidence**: Include screenshots or video recordings in the PR description for any visual modifications.
