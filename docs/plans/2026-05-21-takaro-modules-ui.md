# Takaro Modules UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the modules viewer so filtering is clearer and the app reads as part of Takaro.

**Architecture:** Keep the existing Next.js App Router structure and sidebar-driven navigation. Refactor UI in place by updating shared Takaro theme tokens, home content, and sidebar filtering controls without changing module loading or route shape.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, DaisyUI, Vitest, Playwright.

---

### Task 1: Update Brand Tokens

**Files:**

- Modify: `app/globals.css`

**Step 1: Write the failing check**

Run the format check after edits rather than adding a dedicated unit test because this task only changes CSS tokens.

**Step 2: Update Takaro variables and shared components**

Set the Takaro variables to match the website design tokens:

```css
--takaro-primary: #664de5;
--takaro-primary-hover: #7a5ef0;
--takaro-background: #080808;
--takaro-card: #151515;
--takaro-card-hover: #1a1a1a;
--takaro-border: #222222;
```

Keep cards and controls at 8px radius.

**Step 3: Run format check**

Run: `npm run format:check`

Expected: PASS, or formatting-only failures that can be fixed with `npm run format`.

### Task 2: Redesign Home Content

**Files:**

- Modify: `components/HomeContent.tsx`
- Test: existing e2e tests that use `data-testid="category-section-title"` and `data-testid="category-cards-grid"`

**Step 1: Preserve category behavior**

Keep `handleCategoryClick(category)` and existing category card test ids.

**Step 2: Replace the hero**

Create a compact Takaro-branded header:

```tsx
<p>Takaro module library</p>
<h1>Takaro Modules</h1>
<p>Browse installable modules for Takaro servers...</p>
```

Show stats for total modules, categories, and supported games.

**Step 3: Simplify category cards**

Remove emoji icons. Keep category name, description, count, and a short list of example modules.

**Step 4: Run focused tests**

Run: `npm run test:unit`

Expected: PASS.

### Task 3: Streamline Sidebar Filters

**Files:**

- Modify: `components/ModuleSidebar.tsx`
- Potentially modify: `components/ModuleCard.tsx` only if sidebar card density needs small class adjustments.
- Test: `tests/e2e/category-filtering.spec.ts`

**Step 1: Keep existing filter state**

Continue using `searchTerm`, `categoryFilter`, `authorFilter`, `gameFilter`, localStorage persistence, and external category filter support.

**Step 2: Replace chip filters with select controls**

Render three labeled selects:

```tsx
<select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
  <option value="all">All categories</option>
  ...
</select>
```

Do the same for author and supported game when there is more than one option.

**Step 3: Add active filter summary**

Display `Showing X of Y modules` and a `Clear filters` button when any filter is active.

**Step 4: Preserve test hooks**

Keep `data-testid="search-input"`, `data-testid="search-results-count"`, `data-testid="category-filter-buttons"`, and `data-testid="category-filter-${category}"` either on the new controls or hidden-compatible wrappers so existing tests can still locate behavior.

**Step 5: Run focused e2e**

Run through Docker-compatible project scripts where possible:

```bash
npm run test:e2e:prod -- tests/e2e/category-filtering.spec.ts
```

If the script does not accept a path, run the full configured command.

### Task 4: Verify and Polish

**Files:**

- Review: `components/HomeContent.tsx`
- Review: `components/ModuleSidebar.tsx`
- Review: `app/globals.css`

**Step 1: Format**

Run: `npm run format:check`

If needed, run: `npm run format`

Then rerun: `npm run format:check`

**Step 2: Typecheck**

Run: `npm run typecheck`

Expected: PASS.

**Step 3: E2E smoke**

Run: `npm run test:e2e:prod`

Expected: PASS.

**Step 4: Manual review**

Start the app only via Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up
```

Review desktop and mobile:

- Home page shows Takaro Modules branding.
- Sidebar filtering is understandable.
- Category cards filter the sidebar.
- Module detail navigation still works.
- Mobile sidebar opens, filters, and closes.
