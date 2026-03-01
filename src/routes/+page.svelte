<script lang="ts">
  import { onMount } from 'svelte'
  import { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import {
    getKeyboardMoveState,
    updateTarget,
    exitMoveMode,
  } from '$lib/keyboard-move-state.svelte'
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
    function handleKeydown(e: KeyboardEvent) {
      const mode = getKeyboardMoveState()
      if (!mode) return

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Escape']
      if (!keys.includes(e.key)) return

      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'Escape') {
        exitMoveMode()
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        moveTodo(mode.fromDate, mode.targetDateKey, mode.todoId, mode.targetIndex)
        exitMoveMode()
        return
      }

      const colIndex = columnOrder.indexOf(mode.targetDateKey)
      const maxIndex = getTodos(mode.targetDateKey).length

      if (e.key === 'ArrowUp') {
        updateTarget(mode.targetDateKey, Math.max(0, mode.targetIndex - 1))
      } else if (e.key === 'ArrowDown') {
        updateTarget(mode.targetDateKey, Math.min(maxIndex, mode.targetIndex + 1))
      } else if (e.key === 'ArrowLeft' && colIndex > 0) {
        const prevCol = columnOrder[colIndex - 1]
        const prevMax = getTodos(prevCol).length
        updateTarget(prevCol, Math.min(mode.targetIndex, prevMax))
      } else if (e.key === 'ArrowRight' && colIndex < columnOrder.length - 1) {
        const nextCol = columnOrder[colIndex + 1]
        const nextMax = getTodos(nextCol).length
        updateTarget(nextCol, Math.min(mode.targetIndex, nextMax))
      }
    }

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
        columnOrder={columnOrder}
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
        columnOrder={columnOrder}
        class="w-1/2"
      />
    {/each}
  </div>
</div>
