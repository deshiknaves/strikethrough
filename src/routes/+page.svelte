<script lang="ts">
  import { Temporal } from 'temporal-polyfill'
  import { getTodos, addTodo, toggleTodo, deleteTodo } from '$lib/todos.svelte'
  import TodoItem from '$lib/components/TodoItem.svelte'
  import NewTodoInput from '$lib/components/NewTodoInput.svelte'

  const today = Temporal.Now.plainDateISO()
  const monday = today.subtract({ days: today.dayOfWeek - 1 })
  const weekdays = Array.from({ length: 5 }, (_, i) => monday.add({ days: i }))
  const weekend = Array.from({ length: 2 }, (_, i) => monday.add({ days: 5 + i }))

  function date(d: Temporal.PlainDate) {
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short' })
  }

  function weekday(d: Temporal.PlainDate) {
    return d.toLocaleString('en-US', { weekday: 'short' })
  }

  const heading = today.toLocaleString('en-US', { month: 'long', year: 'numeric' })
</script>

<div class="flex flex-col overflow-y-auto p-4 min-[501px]:h-dvh min-[501px]:overflow-hidden">
  <h1 class="mb-3 text-2xl font-bold text-text-primary">{heading}</h1>
  <div class="flex min-h-0 flex-1 gap-3">
    {#each weekdays as day (day.toString())}
      {@const dateKey = day.toString()}
      <div
        class="flex min-h-50 flex-1 flex-col rounded-lg border border-border bg-bg-surface p-3 min-[501px]:min-h-0"
      >
        <h2 class="mb-2 flex justify-between text-sm font-semibold">
          <span class="text-text-primary">{date(day)}</span><span class="text-text-secondary"
            >{weekday(day)}</span
          >
        </h2>
        <div class="min-h-0 flex-1 overflow-y-auto">
          {#each getTodos(dateKey) as todo (todo.id)}
            <TodoItem
              {todo}
              onToggle={() => toggleTodo(dateKey, todo.id)}
              onDelete={() => deleteTodo(dateKey, todo.id)}
            />
          {/each}
          <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} />
        </div>
      </div>
    {/each}
  </div>
  <div class="mt-3 flex min-h-38 gap-3 min-[501px]:h-[35%] min-[501px]:min-h-0">
    {#each weekend as day (day.toString())}
      {@const dateKey = day.toString()}
      <div class="flex w-1/2 flex-col rounded-lg border border-border bg-bg-surface p-3">
        <h2 class="mb-2 flex justify-between text-sm font-semibold">
          <span class="text-text-primary">{date(day)}</span><span class="text-text-secondary"
            >{weekday(day)}</span
          >
        </h2>
        <div class="min-h-0 flex-1 overflow-y-auto">
          {#each getTodos(dateKey) as todo (todo.id)}
            <TodoItem
              {todo}
              onToggle={() => toggleTodo(dateKey, todo.id)}
              onDelete={() => deleteTodo(dateKey, todo.id)}
            />
          {/each}
          <NewTodoInput onAdd={(text) => addTodo(dateKey, text)} />
        </div>
      </div>
    {/each}
  </div>
</div>
