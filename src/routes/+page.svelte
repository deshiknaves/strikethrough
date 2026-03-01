<script lang="ts">
  import { Temporal } from 'temporal-polyfill'

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
      <div
        class="min-h-50 flex-1 rounded-lg border border-border bg-bg-surface p-3 min-[501px]:min-h-0"
      >
        <h2 class="flex justify-between text-sm font-semibold">
          <span class="text-text-primary">{date(day)}</span><span class="text-text-secondary"
            >{weekday(day)}</span
          >
        </h2>
      </div>
    {/each}
  </div>
  <div class="mt-3 flex min-h-38 gap-3 min-[501px]:h-[35%] min-[501px]:min-h-0">
    {#each weekend as day (day.toString())}
      <div class="w-1/2 rounded-lg border border-border bg-bg-surface p-3">
        <h2 class="flex justify-between text-sm font-semibold">
          <span class="text-text-primary">{date(day)}</span><span class="text-text-secondary"
            >{weekday(day)}</span
          >
        </h2>
      </div>
    {/each}
  </div>
</div>
