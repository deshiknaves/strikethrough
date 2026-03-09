# Strikethrough

![Strikethrough](./src/lib/assets/strikethrough.svg)

A todo app built with SvelteKit. Organize tasks by day in week or day view. Drag todos between days or use keyboard shortcuts to navigate and move them.

## Features

- **Week & day views** — Toggle between a full week layout and a focused two-day view (`Shift+W` / `Shift+D`)
- **Drag & drop** — Reorder within a day or move between days
- **Keyboard navigation** — Full keyboard control with vim-style bindings; press `?` to see all shortcuts
- **Dark theme** — Outfit font, Tailwind CSS

## Keyboard Shortcuts

| Key                  | Action                                               |
| -------------------- | ---------------------------------------------------- |
| `?`                  | Show all shortcuts                                   |
| `n`                  | New todo                                             |
| `Shift+W`            | Switch to week view                                  |
| `Shift+D`            | Switch to day view                                   |
| `Shift+N` / `Ctrl+N` | Next week / day                                      |
| `Shift+P` / `Ctrl+P` | Previous week / day                                  |
| `m`                  | Enter move mode (then arrows + Enter/Space to place) |
| `d` / `Cmd+Enter`    | Open todo details                                    |
| `e`                  | Edit todo                                            |
| `Space`              | Toggle complete                                      |
| `x` / `Delete`       | Delete todo                                          |
| `↑↓←→` / `hjkl`      | Navigate between todos                               |

## Tech Stack

- SvelteKit 2
- Svelte 5
- TypeScript
- Tailwind CSS v4
- [pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop/about)
- Temporal API

## Getting Started

```sh
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start dev server         |
| `pnpm build`     | Production build         |
| `pnpm preview`   | Preview production build |
| `pnpm test`      | Run tests                |
| `pnpm test:unit` | Run tests in watch mode  |
| `pnpm check`     | Type check               |
| `pnpm lint`      | Lint and format check    |
| `pnpm format`    | Format with Prettier     |
| `pnpm storybook` | Start Storybook          |
