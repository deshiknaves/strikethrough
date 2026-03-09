<script lang="ts">
  import { browser } from '$app/environment'
  import type { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import { loadWeek } from '$lib/todos.svelte'
  import { getMondayOfWeek, formatDate, formatWeekday } from '$lib/week-utils'

  interface Props {
    viewDate: Temporal.PlainDate
    today: Temporal.PlainDate
    isWide: boolean
    columnOrder?: string[]
  }

  let { viewDate, today, isWide, columnOrder = $bindable([]) }: Props = $props()

  const dayColumns = $derived(isWide ? [viewDate, viewDate.add({ days: 1 })] : [viewDate])

  $effect(() => {
    columnOrder = dayColumns.map((d) => d.toString())
  })

  $effect(() => {
    if (browser) {
      const monday = getMondayOfWeek(viewDate)
      const currentDate = viewDate
      loadWeek(monday, {
        getIsCurrentView: () => viewDate.toString() === currentDate.toString(),
      })
      if (isWide) {
        const nextDay = viewDate.add({ days: 1 })
        const nextMonday = getMondayOfWeek(nextDay)
        if (nextMonday.toString() !== monday.toString()) {
          loadWeek(nextMonday, {
            getIsCurrentView: () => viewDate.toString() === currentDate.toString(),
          })
        }
      }
    }
  })
</script>

<div class="flex min-h-0 flex-1 gap-3">
  {#each dayColumns as day (day.toString())}
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
