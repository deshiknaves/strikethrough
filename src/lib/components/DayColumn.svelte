<script lang="ts">
  import { flip } from 'svelte/animate'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import {
    dropTargetForElements,
    monitorForElements,
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
  import { getTodos, addTodo, toggleTodo, deleteTodo, moveTodo } from '$lib/todos.svelte'
  import { clearDragState } from '$lib/drag-state.svelte'
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

  let isOver = $state(false)

  const todos = $derived(getTodos(dateKey))

  function setupColumn(node: HTMLElement) {
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
    {#each todos as todo, i (todo.id)}
      <div animate:flip={{ duration: 200 }}>
        <TodoItem
          todo={todo}
          fromDate={dateKey}
          index={i}
          onToggle={() => toggleTodo(dateKey, todo.id)}
          onDelete={() => deleteTodo(dateKey, todo.id)}
        />
      </div>
    {/each}
    <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} />
  </div>
</div>
