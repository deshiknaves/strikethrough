<script lang="ts">
  import { flip } from 'svelte/animate'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import {
    dropTargetForElements,
    monitorForElements,
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import { getTodos, addTodo, toggleTodo, deleteTodo, moveTodo } from '$lib/todos.svelte'
  import { getDragState, updateDropIndicator, clearDragState } from '$lib/drag-state.svelte'
  import TodoItem from './TodoItem.svelte'
  import NewTodoInput from './NewTodoInput.svelte'

  let {
    dateKey,
    label,
    sublabel,
    class: extraClass = '',
  }: {
    dateKey: string
    label: string
    sublabel: string
    class?: string
  } = $props()

  const dropIndex = $derived(
    getDragState()?.dropIndicator?.toDate === dateKey
      ? getDragState()!.dropIndicator!.index
      : null,
  )
  const isOver = $derived(dropIndex !== null)

  function setupColumn(node: HTMLElement) {
    const cleanup = combine(
      dropTargetForElements({
        element: node,
        onDragEnter: ({ location, self }) => {
          if (location.current.dropTargets[0]?.element === self.element) {
            updateDropIndicator(dateKey, getTodos(dateKey).length)
          }
        },
        onDrag: ({ location, self }) => {
          if (location.current.dropTargets[0]?.element === self.element) {
            updateDropIndicator(dateKey, getTodos(dateKey).length)
          }
        },
        onDrop: ({ source }) => {
          const { todoId, fromDate } = source.data as { todoId: string; fromDate: string }
          const state = getDragState()
          const toIndex =
            state?.dropIndicator?.toDate === dateKey ? state.dropIndicator.index : undefined
          moveTodo(fromDate, dateKey, todoId, toIndex)
        },
      }),
      monitorForElements({ onDrop: () => clearDragState() }),
    )
    return { destroy: cleanup }
  }
</script>

<div
  use:setupColumn
  class="flex flex-col rounded-lg border p-3 transition-colors {isOver
    ? 'border-accent-blue bg-accent-blue/10'
    : 'border-border bg-bg-surface'} {extraClass}"
>
  <h2 class="mb-2 flex justify-between text-sm font-semibold">
    <span class="text-text-primary">{label}</span>
    <span class="text-text-secondary">{sublabel}</span>
  </h2>
  <div class="min-h-0 flex-1 overflow-y-auto">
    {#each getTodos(dateKey) as todo, i (todo.id)}
      <div animate:flip={{ duration: 200 }}>
        {#if dropIndex === i}
          <div class="mx-1 mb-1 h-0.5 rounded-full bg-accent-blue"></div>
        {/if}
        <TodoItem
          {todo}
          fromDate={dateKey}
          index={i}
          onToggle={() => toggleTodo(dateKey, todo.id)}
          onDelete={() => deleteTodo(dateKey, todo.id)}
        />
      </div>
    {/each}
    {#if dropIndex === getTodos(dateKey).length}
      <div class="mx-1 mb-1 h-0.5 rounded-full bg-accent-blue"></div>
    {/if}
    <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} />
  </div>
</div>
