<script lang="ts">
  import { onMount } from 'svelte'
  import { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import { createBoardKeyboardHandler } from '$lib/board-keyboard-navigation'
  import { getKeyboardMoveState, updateTarget, exitMoveMode } from '$lib/keyboard-move-state.svelte'
  import { getTodos, moveTodo } from '$lib/todos.svelte'

  const today = Temporal.Now.plainDateISO()
  const monday = today.subtract({ days: today.dayOfWeek - 1 })
  const weekdays = Array.from({ length: 5 }, (_, i) => monday.add({ days: i }))
  const weekend = Array.from({ length: 2 }, (_, i) => monday.add({ days: 5 + i }))
  const columnOrder = $derived([
    ...weekdays.map((d) => d.toString()),
    ...weekend.map((d) => d.toString()),
  ])

  function date(d: Temporal.PlainDate) {
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short' })
  }

  function weekday(d: Temporal.PlainDate) {
    return d.toLocaleString('en-US', { weekday: 'short' })
  }

  const heading = today.toLocaleString('en-US', { month: 'long', year: 'numeric' })

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
  <h1 class="mb-3 text-2xl font-bold text-text-primary">{heading}</h1>
  <div class="flex min-h-0 flex-1 gap-3">
    {#each weekdays as day (day.toString())}
      <DayColumn
        dateKey={day.toString()}
        label={date(day)}
        sublabel={weekday(day)}
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
        label={date(day)}
        sublabel={weekday(day)}
        isToday={day.toString() === today.toString()}
        {columnOrder}
        class="w-1/2"
      />
    {/each}
  </div>
</div>
