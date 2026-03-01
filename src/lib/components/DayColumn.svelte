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
    moveTodo,
  } from '$lib/todos.svelte'
  import { clearDragState } from '$lib/drag-state.svelte'
  import { getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'
  import TodoItem from './TodoItem.svelte'
  import NewTodoInput from './NewTodoInput.svelte'

  let {
    dateKey,
    label,
    sublabel,
    columnOrder = [],
    class: extraClass = '',
  }: {
    dateKey: string
    label: string
    sublabel: string
    columnOrder?: string[]
    class?: string
  } = $props()

  let isOver = $state(false)
  const keyboardMoveMode = $derived(getKeyboardMoveState())

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
  class="flex flex-col rounded-lg border p-3 transition-colors {isOver
    ? 'border-accent-blue bg-accent-blue/10'
    : 'border-border bg-bg-surface'} {extraClass}"
>
  <h2 id="column-{dateKey}" class="mb-2 flex justify-between text-sm font-semibold">
    <span class="text-text-primary">{label}</span>
    <span class="text-text-secondary">{sublabel}</span>
  </h2>
  <div class="min-h-0 flex-1 overflow-visible">
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
          onToggle={() => toggleTodo(dateKey, todo.id)}
          onDelete={() => deleteTodo(dateKey, todo.id)}
          onUpdate={(text) => updateTodo(dateKey, todo.id, text)}
        />
      </div>
    {/each}
    {#if keyboardMoveMode?.targetDateKey === dateKey && keyboardMoveMode.targetIndex === todos.length}
      <div
        class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
        style="min-height: 2rem"
      >
        <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
        <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
      </div>
    {/if}
    <div data-date-key={dateKey} data-todo-index="new">
      <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} />
    </div>
  </div>
</div>
