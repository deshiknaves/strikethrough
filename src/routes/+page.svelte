<script lang="ts">
  import { onMount } from 'svelte'
  import { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import { createBoardKeyboardHandler } from '$lib/board-keyboard-navigation'
  import { getKeyboardMoveState, updateTarget, exitMoveMode } from '$lib/keyboard-move-state.svelte'
  import { getTodos, moveTodo } from '$lib/todos.svelte'
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

  const weekdays = $derived(getWeekDays(viewMonday))
  const weekend = $derived(getWeekendDays(viewMonday))
  const columnOrder = $derived(getColumnOrder(viewMonday))
  const heading = $derived(formatMonthYear(viewMonday))

  onMount(() => {
    const handleKeydown = createBoardKeyboardHandler({
      getColumnOrder: () => columnOrder,
      getTodos,
      moveTodo,
      getKeyboardMoveState,
      updateTarget,
      exitMoveMode,
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
        class="rounded border border-border bg-bg-surface px-2 py-1 text-text-primary transition-colors hover:bg-bg-elevated"
        onclick={() => (viewMonday = addWeeks(viewMonday, -1))}
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Next week"
        class="rounded border border-border bg-bg-surface px-2 py-1 text-text-primary transition-colors hover:bg-bg-elevated"
        onclick={() => (viewMonday = addWeeks(viewMonday, 1))}
      >
        →
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
</div>
