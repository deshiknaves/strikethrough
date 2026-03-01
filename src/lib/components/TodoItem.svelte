<script lang="ts">
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import { getDragState, startDrag, updateDropIndicator } from '$lib/drag-state.svelte'
  import type { Todo } from '$lib/todos.svelte'

  let {
    todo,
    fromDate,
    index,
    onToggle,
    onDelete,
  }: {
    todo: Todo
    fromDate: string
    index: number
    onToggle: () => void
    onDelete: () => void
  } = $props()

  const isDragging = $derived(getDragState()?.todoId === todo.id)

  function computeAndSet(node: HTMLElement, location: { current: { input: { clientY: number } } }) {
    const rect = node.getBoundingClientRect()
    const insertIndex =
      location.current.input.clientY < rect.top + rect.height / 2 ? index : index + 1
    updateDropIndicator(fromDate, insertIndex)
  }

  function setupItem(node: HTMLElement) {
    const cleanup = combine(
      draggable({
        element: node,
        getInitialData: () => ({ todoId: todo.id, fromDate }),
        onDragStart: () => startDrag(todo.id, fromDate),
      }),
      dropTargetForElements({
        element: node,
        onDragEnter: ({ location }) => computeAndSet(node, location),
      }),
    )
    return { destroy: cleanup }
  }
</script>

<div
  use:setupItem
  data-todo-id={todo.id}
  class="group flex cursor-grab items-center gap-2 border-b border-border px-1 py-1 transition-opacity hover:bg-bg-elevated active:cursor-grabbing {isDragging
    ? 'opacity-30'
    : 'opacity-100'}"
>
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
