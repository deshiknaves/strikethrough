<script lang="ts">
  import { browser } from '$app/environment'
  import type { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import { loadRange } from '$lib/todos.svelte'
  import { formatDate, formatWeekday } from '$lib/week-utils'

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
      const from = viewDate
      const to = isWide ? viewDate.add({ days: 1 }) : viewDate
      const capturedIsWide = isWide
      loadRange(from, to, {
        getIsCurrentView: () =>
          viewDate.toString() === from.toString() && isWide === capturedIsWide,
      })
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
