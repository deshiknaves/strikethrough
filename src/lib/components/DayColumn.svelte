<script lang="ts">
  import { flip } from 'svelte/animate'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import {
    dropTargetForElements,
    monitorForElements,
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
  import {
    getTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    updateTodoDetails,
    moveTodo,
  } from '$lib/todos.svelte'
  import { clearDragState } from '$lib/drag-state.svelte'
  import { getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'
  import TodoItem from './TodoItem.svelte'
  import NewTodoInput from './NewTodoInput.svelte'
  import Badge from './Badge.svelte'

  let {
    dateKey,
    label,
    sublabel,
    isToday = false,
    columnOrder = [],
    class: extraClass = '',
  }: {
    dateKey: string
    label: string
    sublabel: string
    isToday?: boolean
    columnOrder?: string[]
    class?: string
  } = $props()

  let isOver = $state(false)
  const keyboardMoveMode = $derived(getKeyboardMoveState())
  const movingTodo = $derived(
    keyboardMoveMode
      ? (getTodos(keyboardMoveMode.fromDate).find((t) => t.id === keyboardMoveMode.todoId) ?? null)
      : null
  )

  const todos = $derived(getTodos(dateKey))

  function initializeDragAndDrop(node: HTMLElement) {
    const cleanup = combine(
      dropTargetForElements({
        element: node,
        getIsSticky: () => true,
        getData: () => ({ type: 'column' as const, columnId: dateKey }),
        onDragEnter: () => {
          isOver = true
        },
        onDragLeave: () => {
          isOver = false
        },
        onDrop: ({ source, location }) => {
          isOver = false
          const { todoId, fromDate } = source.data as {
            todoId: string
            fromDate: string
          }
          const dropTargets = location.current.dropTargets
          const innermost = dropTargets[0]
          if (!innermost) return

          const data = innermost.data as
            | { type: 'todo'; todoId: string; index: number }
            | { type: 'column'; columnId: string }

          let toIndex: number
          if (data.type === 'todo') {
            const closestEdge = extractClosestEdge(innermost.data)
            toIndex = closestEdge === 'top' ? data.index : data.index + 1
          } else {
            toIndex = getTodos(dateKey).length
          }

          moveTodo(fromDate, dateKey, todoId, toIndex)
        },
      }),
      monitorForElements({ onDrop: () => clearDragState() })
    )

    return { destroy: cleanup }
  }
</script>

<div
  use:initializeDragAndDrop
  role="group"
  aria-labelledby="column-{dateKey}"
  data-date-key={dateKey}
  class="flex flex-col rounded-lg border px-2 py-3 transition-colors {isOver
    ? 'border-accent-blue bg-accent-blue/10'
    : 'border-border bg-bg-surface'} {extraClass}"
>
  <h2
    id="column-{dateKey}"
    class="mb-2 flex items-center justify-between gap-2 text-sm font-semibold"
  >
    <span class="flex items-center gap-2">
      {#if isToday}
        <Badge label="Today" variant="blue" />
        <span class="text-text-primary">{label}</span>
      {:else}
        <span class="text-text-primary">{label}</span>
      {/if}
    </span>
    <span class="text-text-secondary">{sublabel}</span>
  </h2>
  <div class="min-h-0 flex-1 overflow-y-auto px-2 py-2 scroll-pb-2 scroll-pt-2">
    {#each todos as todo, index (todo.id)}
      {@const dropEdge =
        keyboardMoveMode?.targetDateKey === dateKey &&
        keyboardMoveMode.targetIndex === index &&
        keyboardMoveMode.targetIndex < todos.length
          ? 'top'
          : null}
      <div animate:flip={{ duration: 200 }}>
        <TodoItem
          {todo}
          fromDate={dateKey}
          {index}
          {columnOrder}
          {dropEdge}
          movingTodo={dropEdge ? movingTodo : null}
          onToggle={() => toggleTodo(dateKey, todo.id)}
          onDelete={() => deleteTodo(dateKey, todo.id)}
          onUpdate={(text) => updateTodo(dateKey, todo.id, text)}
          onUpdateDetails={(updates) =>
            updateTodoDetails(dateKey, todo.id, {
              text: updates.text,
              description: updates.description,
              date: updates.date,
            })}
        />
      </div>
    {/each}
    {#if keyboardMoveMode?.targetDateKey === dateKey && keyboardMoveMode.targetIndex === todos.length && movingTodo}
      <div
        data-keyboard-move-target
        class="flex items-center gap-2 rounded border-b border-border px-1 py-1 ring-2 ring-accent-blue ring-offset-2 ring-offset-bg-surface"
      >
        <div
          class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-accent-blue {movingTodo.completed
            ? 'bg-accent-blue'
            : 'border-text-muted'}"
        >
          {#if movingTodo.completed}
            <svg
              class="h-2 w-2 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 6l3 3 5-6" />
            </svg>
          {/if}
        </div>
        <span
          class="flex-1 text-sm {movingTodo.completed
            ? 'text-text-muted line-through'
            : 'text-text-primary'}"
        >
          {movingTodo.text}
        </span>
      </div>
    {/if}
    <div data-date-key={dateKey} data-todo-index="new">
      <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} autoFocus={isToday} />
    </div>
  </div>
</div>
