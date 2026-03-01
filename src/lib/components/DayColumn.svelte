<script lang="ts">
  import { flip } from 'svelte/animate'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import {
    dropTargetForElements,
    monitorForElements,
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import { getTodos, addTodo, toggleTodo, deleteTodo, moveTodo } from '$lib/todos.svelte'
  import { getDragState, updateDropIndicator, clearDragState } from '$lib/drag-state.svelte'
  import type { Todo } from '$lib/todos.svelte'
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

  type DisplayItem = { type: 'todo'; todo: Todo; index: number } | { type: 'placeholder' }

  const dropIndex = $derived(
    getDragState()?.dropIndicator?.toDate === dateKey
      ? getDragState()!.dropIndicator!.index
      : null,
  )
  const isOver = $derived(dropIndex !== null)

  const displayItems = $derived.by<DisplayItem[]>(() => {
    const todos = getTodos(dateKey)
    const dragState = getDragState()
    const idx = dropIndex
    const todoItems: DisplayItem[] = todos.map((todo, i) => ({ type: 'todo', todo, index: i }))
    if (idx === null) return todoItems

    // Don't show placeholder if drop is a no-op: same column, same index (reorder(i,i) = identity)
    if (dragState?.fromDate === dateKey) {
      const fromIndex = todos.findIndex((t) => t.id === dragState.todoId)
      if (fromIndex !== -1 && idx === fromIndex) return todoItems
    }

    return [...todoItems.slice(0, idx), { type: 'placeholder' }, ...todoItems.slice(idx)]
  })

  function setupColumn(node: HTMLElement) {
    const cleanup = combine(
      dropTargetForElements({
        element: node,
        onDragEnter: ({ location, self }) => {
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
    {#each displayItems as item (item.type === 'todo' ? item.todo.id : '__placeholder__')}
      <div animate:flip={{ duration: 200 }}>
        {#if item.type === 'placeholder'}
          <div
            class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
          >
            <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
            <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
          </div>
        {:else}
          <TodoItem
            todo={item.todo}
            fromDate={dateKey}
            index={item.index}
            onToggle={() => toggleTodo(dateKey, item.todo.id)}
            onDelete={() => deleteTodo(dateKey, item.todo.id)}
          />
        {/if}
      </div>
    {/each}
    <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} />
  </div>
</div>
