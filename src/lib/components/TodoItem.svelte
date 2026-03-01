<script lang="ts">
  import type { Todo } from '$lib/todos.svelte'

  let {
    todo,
    onToggle,
    onDelete,
  }: {
    todo: Todo
    onToggle: () => void
    onDelete: () => void
  } = $props()
</script>

<div class="group flex items-center gap-2 border-b border-border px-1 py-1 hover:bg-bg-elevated">
  <input
    type="checkbox"
    checked={todo.completed}
    onchange={onToggle}
    class="cursor-pointer accent-accent-blue"
  />
  <span
    class="flex-1 text-sm {todo.completed ? 'text-text-muted line-through' : 'text-text-primary'}"
  >
    {todo.text}
  </span>
  <button
    onclick={onDelete}
    aria-label="Delete todo"
    class="cursor-pointer leading-none text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-text-primary"
  >
    ×
  </button>
</div>
