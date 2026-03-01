<script lang="ts">
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import {
    attachClosestEdge,
    extractClosestEdge,
  } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
  import { startDrag } from '$lib/drag-state.svelte'
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

  type TodoItemState =
    | { type: 'idle' }
    | { type: 'is-dragging' }
    | { type: 'is-dragging-and-left-self' }
    | { type: 'is-over'; closestEdge: 'top' | 'bottom'; draggingRect: DOMRect }

  let state = $state<TodoItemState>({ type: 'idle' })

  const idleState: TodoItemState = { type: 'idle' }

  function setupItem(outerNode: HTMLElement) {
    const innerNode = outerNode.querySelector<HTMLElement>('[data-draggable]')
    if (!innerNode) return () => {}
    const cleanup = combine(
      draggable({
        element: innerNode,
        getInitialData: () => ({
          todoId: todo.id,
          fromDate,
          rect: innerNode.getBoundingClientRect(),
        }),
        onDragStart: () => {
          startDrag(todo.id, fromDate)
          state = { type: 'is-dragging' }
        },
        onDrop: () => {
          state = idleState
        },
      }),
      dropTargetForElements({
        element: outerNode,
        getIsSticky: () => true,
        getData: ({ element, input }) =>
          attachClosestEdge(
            { type: 'todo' as const, todoId: todo.id, fromDate, index },
            { element, input, allowedEdges: ['top', 'bottom'] },
          ),
        onDragEnter: ({ source, self }) => {
          const data = source.data as { todoId?: string; rect?: DOMRect }
          if (data.todoId === todo.id) return
          const closestEdge = extractClosestEdge(self.data)
          if (!closestEdge) return
          const rect = data.rect
          if (!rect) return
          state = { type: 'is-over', closestEdge, draggingRect: rect }
        },
        onDrag: ({ source, self }) => {
          const data = source.data as { todoId?: string; rect?: DOMRect }
          if (data.todoId === todo.id) return
          const closestEdge = extractClosestEdge(self.data)
          if (!closestEdge) return
          const rect = data.rect
          if (!rect) return
          const proposed: TodoItemState = { type: 'is-over', closestEdge, draggingRect: rect }
          if (
            state.type === 'is-over' &&
            state.closestEdge === proposed.closestEdge
          ) {
            return
          }
          state = proposed
        },
        onDragLeave: ({ source }) => {
          const data = source.data as { todoId?: string }
          if (data.todoId === todo.id) {
            state = { type: 'is-dragging-and-left-self' }
            return
          }
          state = idleState
        },
        onDrop: () => {
          state = idleState
        },
      }),
    )
    return { destroy: cleanup }
  }
</script>

<div
  use:setupItem
  data-todo-id={todo.id}
  class="flex flex-col"
>
  {#if state.type === 'is-over' && state.closestEdge === 'top'}
    <div
      class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
      style="min-height: {state.draggingRect.height}px"
    >
      <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
      <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
    </div>
  {/if}
  <div
    data-draggable
    class="group flex cursor-grab items-center gap-2 border-b border-border px-1 py-1 transition-opacity hover:bg-bg-elevated active:cursor-grabbing {state.type ===
      'is-dragging'
        ? 'opacity-40'
        : state.type === 'is-dragging-and-left-self'
          ? 'hidden'
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
    {#if state.type === 'is-over' && state.closestEdge === 'bottom'}
      <div
        class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
        style="min-height: {state.draggingRect.height}px"
      >
        <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
        <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
      </div>
    {/if}
</div>
