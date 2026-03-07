# Strikethrough

![Strikethrough](./src/lib/assets/strikethrough.svg)

A week-based todo app built with SvelteKit. Organize tasks by day in a Monday–Sunday layout. Drag todos between days or use keyboard shortcuts to move them.

## Features

- **Week view** — Todos grouped by day (weekdays + weekend)
- **Drag & drop** — Reorder within a day or move between days
- **Keyboard navigation** — Press `m` on a todo to enter move mode, then use arrow keys + Enter/Space to place
- **Dark theme** — Outfit font, Tailwind CSS

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
