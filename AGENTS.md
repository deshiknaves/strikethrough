# AGENTS.md

Guidance for AI agents working on this codebase.

## Project Overview

**Strikethrough** is a week-based todo app built with SvelteKit. Todos are organized in day columns (Mon–Fri, then Sat–Sun). Users can add, complete, delete, and reorder todos via drag-and-drop or keyboard shortcuts.

## Tech Stack

| Area            | Technology                                                   |
| --------------- | ------------------------------------------------------------ |
| Framework       | SvelteKit 2 + Svelte 5                                       |
| Language        | TypeScript                                                   |
| Package manager | pnpm                                                         |
| Styling         | Tailwind CSS v4                                              |
| Testing         | Vitest, @testing-library/svelte, @testing-library/user-event |
| Drag & drop     | @atlaskit/pragmatic-drag-and-drop                            |
| Dates           | Temporal API (temporal-polyfill)                             |
| Component docs  | Storybook                                                    |

## Project Structure

```shell
src/
├── lib/
│   ├── components/       # Reusable Svelte components
│   │   ├── DayColumn.svelte
│   │   ├── TodoItem.svelte
│   │   └── NewTodoInput.svelte
│   ├── todos.svelte.ts    # Global todo state (CRUD, move)
│   ├── drag-state.svelte.ts
│   ├── keyboard-move-state.svelte.ts
│   └── index.ts
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte       # Main week view
│   └── layout.css         # Global styles, Tailwind, theme
├── test/
│   └── setup.ts           # Vitest setup, polyfills
└── stories/               # Storybook stories
```

## Conventions

### Svelte 5

- Use runes: `$state`, `$derived`, `$props` (no `let` reactivity)
- Prefer `$props()` for component props
- Use `$derived()` for computed values

### Styling

- Tailwind utility classes only
- Use semantic tokens from `layout.css`:
  - `text-text-primary`, `text-text-secondary`, `text-text-muted`
  - `bg-bg-surface`, `bg-bg-elevated`
  - `border-border`, `border-accent-blue`
  - `accent-blue`, `accent-orange`
- Dark theme by default

### State

- Todo data lives in `todos.svelte.ts` as `$state<Record<string, Todo[]>>`
- All mutations go through exported functions: `addTodo`, `toggleTodo`, `deleteTodo`, `moveTodo`
- `drag-state.svelte.ts` and `keyboard-move-state.svelte.ts` manage drag/keyboard move UI state

### Accessibility

- Use semantic roles and ARIA where appropriate (e.g. `role="option"`, `aria-selected`, `aria-label`)
- Keyboard move mode: focus a todo and press `m` to enter, then arrow keys + Enter/Space to place
- Provide `aria-label` on icon-only buttons

### Testing

- Unit/component tests: `*.spec.ts` next to source or in the same directory
- Use `@testing-library/svelte`, `userEvent`, and `vi` from Vitest
- Test setup includes drag-drop polyfills and `getAnimations` stub for svelte/animate
- Run: `pnpm test` (single run) or `pnpm test:unit` (watch)

### Svelte MCP

- Use the Svelte MCP server for Svelte/SvelteKit docs and patterns
- Run `svelte-autofixer` on Svelte code before finishing
- Use `list-sections` first, then `get-documentation` for relevant sections

## Key Flows

1. **Adding a todo**: `NewTodoInput` → `addTodo(dateKey, text)` → todos state updates
2. **Moving a todo**: Drag via pragmatic-drag-and-drop, or keyboard (`m` → arrows → Enter) → `moveTodo(fromDate, toDate, todoId, toIndex)`
3. **Date keys**: ISO date strings (e.g. `"2025-02-24"`) from `Temporal.PlainDate.toString()`

## Commands

| Command          | Purpose                 |
| ---------------- | ----------------------- |
| `pnpm dev`       | Start dev server        |
| `pnpm build`     | Production build        |
| `pnpm test`      | Run tests once          |
| `pnpm test:unit` | Run tests in watch mode |
| `pnpm check`     | Type check              |
| `pnpm lint`      | Lint + format check     |
| `pnpm format`    | Format with Prettier    |
| `pnpm storybook` | Start Storybook         |
