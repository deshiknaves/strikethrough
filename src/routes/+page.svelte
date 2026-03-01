<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { browser } from '$app/environment'
  import { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import TodoDetailsModal from '$lib/components/TodoDetailsModal.svelte'
  import { createBoardKeyboardHandler, focusFirstCell } from '$lib/board-keyboard-navigation'
  import { getKeyboardMoveState, updateTarget, exitMoveMode } from '$lib/keyboard-move-state.svelte'
  import { getTodos, moveTodo, loadWeek, addTodo } from '$lib/todos.svelte'
  import {
    getMondayOfWeek,
    getWeekDays,
    getWeekendDays,
    getColumnOrder,
    formatDate,
    formatWeekday,
    formatMonthYear,
    addWeeks,
  } from '$lib/week-utils'

  const today = Temporal.Now.plainDateISO()
  let viewMonday = $state(getMondayOfWeek(today))
  let newTodoModalOpen = $state(false)

  const weekdays = $derived(getWeekDays(viewMonday))
  const weekend = $derived(getWeekendDays(viewMonday))
  const columnOrder = $derived(getColumnOrder(viewMonday))
  const heading = $derived(formatMonthYear(viewMonday))

  $effect(() => {
    if (browser) {
      const monday = viewMonday
      loadWeek(monday, {
        getIsCurrentView: () => viewMonday.toString() === monday.toString(),
      })
    }
  })

  $effect(() => {
    if (browser && !columnOrder.includes(today.toString())) {
      tick().then(() => {
        focusFirstCell({
          getColumnOrder: () => columnOrder,
          getTodos,
          getInitialFocusDateKey: () => columnOrder[0],
        })
      })
    }
  })

  function handleNewTodo(updates: { text: string; description: string; date: string }) {
    addTodo(updates.date, updates.text, updates.description)
    const todoDate = Temporal.PlainDate.from(updates.date)
    const todoMonday = getMondayOfWeek(todoDate)
    if (todoMonday.toString() !== viewMonday.toString()) {
      loadWeek(todoMonday, {
        getIsCurrentView: () => viewMonday.toString() === todoMonday.toString(),
      })
      viewMonday = todoMonday
    }
  }

  onMount(() => {
    const handleKeydown = createBoardKeyboardHandler({
      getColumnOrder: () => columnOrder,
      getTodos,
      moveTodo,
      getKeyboardMoveState,
      updateTarget,
      exitMoveMode,
      onNextWeek: () => (viewMonday = addWeeks(viewMonday, 1)),
      onPreviousWeek: () => (viewMonday = addWeeks(viewMonday, -1)),
      getInitialFocusDateKey: () =>
        columnOrder.includes(today.toString()) ? today.toString() : columnOrder[0],
      onNewTodo: () => (newTodoModalOpen = true),
    })

    document.addEventListener('keydown', handleKeydown, true)

    return () => document.removeEventListener('keydown', handleKeydown, true)
  })
</script>

<div class="flex flex-col overflow-y-auto p-4 min-[501px]:h-dvh min-[501px]:overflow-hidden">
  <header class="mb-3 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-text-primary">{heading}</h1>
    <nav class="flex gap-1" aria-label="Week navigation">
      <button
        type="button"
        aria-label="Previous week"
        aria-keyshortcuts="Shift+P Ctrl+P"
        class="flex size-8 items-center justify-center rounded-full border border-border bg-bg-surface text-text-primary transition-colors hover:bg-bg-elevated"
        onclick={() => (viewMonday = addWeeks(viewMonday, -1))}
      >
        <svg class="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="15,4 15,20 5,12" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next week"
        aria-keyshortcuts="Shift+N Ctrl+N"
        class="flex size-8 items-center justify-center rounded-full border border-border bg-bg-surface text-text-primary transition-colors hover:bg-bg-elevated"
        onclick={() => (viewMonday = addWeeks(viewMonday, 1))}
      >
        <svg class="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="9,4 9,20 19,12" />
        </svg>
      </button>
    </nav>
  </header>
  <div class="flex min-h-0 flex-1 gap-3">
    {#each weekdays as day (day.toString())}
      <DayColumn
        dateKey={day.toString()}
        label={formatDate(day)}
        sublabel={formatWeekday(day)}
        isToday={day.toString() === today.toString()}
        {columnOrder}
        class="min-h-50 flex-1 min-[501px]:min-h-0"
      />
    {/each}
  </div>
  <div class="mt-3 flex min-h-38 gap-3 min-[501px]:h-[35%] min-[501px]:min-h-0">
    {#each weekend as day (day.toString())}
      <DayColumn
        dateKey={day.toString()}
        label={formatDate(day)}
        sublabel={formatWeekday(day)}
        isToday={day.toString() === today.toString()}
        {columnOrder}
        class="w-1/2"
      />
    {/each}
  </div>
  <TodoDetailsModal
    open={newTodoModalOpen}
    onClose={() => (newTodoModalOpen = false)}
    defaultDate={today.toString()}
    onSave={handleNewTodo}
  />
</div>
