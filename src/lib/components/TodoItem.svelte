<script lang="ts">
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import {
    attachClosestEdge,
    extractClosestEdge,
  } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
  import { startDrag } from '$lib/drag-state.svelte'
  import { enterMoveMode, getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'
  import type { Todo } from '$lib/todos.svelte'

  let {
    todo,
    fromDate,
    index,
    onToggle,
    onDelete,
    columnOrder = [],
    dropEdge = null,
  }: {
    todo: Todo
    fromDate: string
    index: number
    onToggle: () => void
    onDelete: () => void
    columnOrder?: string[]
    dropEdge?: 'top' | 'bottom' | null
  } = $props()

  const keyboardMoveMode = $derived(getKeyboardMoveState())
  const isKeyboardMoving = $derived(keyboardMoveMode?.todoId === todo.id)

  function handleKeydown(e: KeyboardEvent) {
    if ((e.key === 'm' || e.key === 'M') && !keyboardMoveMode && columnOrder.length > 0) {
      e.preventDefault()
      enterMoveMode(todo.id, fromDate, index)
    }
  }

  type TodoItemState =
    | { type: 'idle' }
    | { type: 'is-dragging' }
    | { type: 'is-dragging-and-left-self' }
    | { type: 'is-over'; closestEdge: 'top' | 'bottom'; draggingRect: DOMRect }

  let state = $state<TodoItemState>({ type: 'idle' })

  const idleState: TodoItemState = { type: 'idle' }

  function initializeDragAndDrop(outerNode: HTMLElement) {
    const innerNode = outerNode.querySelector<HTMLElement>('[data-draggable]')
    if (!innerNode) return { destroy: () => {} }
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
          const edge = extractClosestEdge(self.data) as 'top' | 'bottom' | null
          if (!edge || (edge !== 'top' && edge !== 'bottom')) return
          const rect = data.rect
          if (!rect) return
          state = { type: 'is-over', closestEdge: edge, draggingRect: rect }
        },
        onDrag: ({ source, self }) => {
          const data = source.data as { todoId?: string; rect?: DOMRect }
          if (data.todoId === todo.id) return
          const edge = extractClosestEdge(self.data) as 'top' | 'bottom' | null
          if (!edge || (edge !== 'top' && edge !== 'bottom')) return
          const rect = data.rect
          if (!rect) return
          const proposed: TodoItemState = { type: 'is-over', closestEdge: edge, draggingRect: rect }
          if (state.type === 'is-over' && state.closestEdge === proposed.closestEdge) {
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
  use:initializeDragAndDrop
  data-todo-id={todo.id}
  class="flex flex-col"
>
  {#if (state.type === 'is-over' && state.closestEdge === 'top') || dropEdge === 'top'}
    <div
      class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
      style="min-height: {state.type === 'is-over' && state.closestEdge === 'top'
        ? state.draggingRect.height + 'px'
        : '2rem'}"
    >
      <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
      <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
    </div>
  {/if}
  <div
    data-draggable
    tabindex="0"
    role="option"
    aria-selected={isKeyboardMoving}
    aria-keyshortcuts="m"
    aria-label="Todo: {todo.text}. Press m to move."
    onkeydown={handleKeydown}
    class="group flex cursor-grab items-center gap-2 border-b border-border px-1 py-1 transition-opacity hover:bg-bg-elevated focus-within:bg-bg-elevated active:cursor-grabbing {state.type ===
      'is-dragging'
        ? 'opacity-40'
        : state.type === 'is-dragging-and-left-self' || isKeyboardMoving
          ? 'hidden'
          : 'opacity-100'}"
    >
      <div
        class="flex w-0 min-w-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-out group-hover:w-3.5 group-hover:min-w-3.5 group-focus-within:w-3.5 group-focus-within:min-w-3.5"
      >
        <label class="flex cursor-pointer">
          <input
            type="checkbox"
            checked={todo.completed}
            onchange={onToggle}
            class="peer sr-only"
          />
          <span
            class="peer-checked:border-accent-blue peer-checked:bg-accent-blue peer-checked:text-white
              peer-checked:animate-[pulse_0.4s_ease-out_1]
              peer-checked:hover:bg-transparent peer-checked:hover:border-text-muted peer-checked:hover:text-text-muted
              peer-checked:hover:delay-400
              hover:[&_.check-icon]:opacity-100 peer-checked:[&_.check-icon]:opacity-100 peer-checked:hover:[&_.check-icon]:opacity-0
              peer-checked:hover:[&_.check-icon]:delay-400
              peer-checked:[&_.check-icon]:animate-[check-pop_0.3s_ease-out]
              peer-checked:hover:[&_.x-icon]:opacity-100 peer-checked:hover:[&_.x-icon]:delay-400
              relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border
              opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100
              border-text-muted hover:border-accent-blue
              peer-focus-visible:ring-2 peer-focus-visible:ring-accent-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-surface"
          >
            <svg
              class="check-icon h-2 w-2 opacity-0 transition-opacity"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 6l3 3 5-6" />
            </svg>
            <svg
              class="x-icon absolute inset-0 m-auto h-2 w-2 opacity-0 transition-opacity"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </span>
        </label>
      </div>
      <span
        class="-ml-2 flex-1 text-sm transition-[margin-left] duration-200 ease-out group-hover:ml-0 group-focus-within:ml-0 {todo.completed ? 'text-text-muted line-through' : 'text-text-primary'}"
      >
        {todo.text}
      </span>
      <button
        onclick={onDelete}
        aria-label="Delete todo"
        class="cursor-pointer leading-none text-text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface"
      >
        &times;
      </button>
    </div>
    {#if (state.type === 'is-over' && state.closestEdge === 'bottom') || dropEdge === 'bottom'}
      <div
        class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
        style="min-height: {state.type === 'is-over' && state.closestEdge === 'bottom'
          ? state.draggingRect.height + 'px'
          : '2rem'}"
      >
        <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
        <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
      </div>
    {/if}
</div>
