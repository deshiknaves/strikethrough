<script lang="ts">
  import { browser } from '$app/environment'
  import { tick } from 'svelte'
  import type { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import { getTodos, loadWeek } from '$lib/todos.svelte'
  import { getWeekDays, getWeekendDays, formatDate, formatWeekday } from '$lib/week-utils'
  import { focusFirstCell } from '$lib/board-keyboard-navigation'

  type Props = {
    viewMonday: Temporal.PlainDate
    today: Temporal.PlainDate
    columnOrder: string[]
  }

  let { viewMonday, today, columnOrder }: Props = $props()

  const weekdays = $derived(getWeekDays(viewMonday))
  const weekend = $derived(getWeekendDays(viewMonday))

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
</script>

<div class="flex min-h-0 flex-1 gap-3">
  {#each weekdays as day (day.toString())}
    <DayColumn
      dateKey={day.toString()}
      label={formatDate(day)}
      sublabel={formatWeekday(day)}
      isToday={day.toString() === today.toString()}
      {columnOrder}
      class="flex-1"
    />
  {/each}
</div>
<div class="mt-3 flex h-[35%] gap-3">
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
