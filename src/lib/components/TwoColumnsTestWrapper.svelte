<script lang="ts">
  import DayColumn from './DayColumn.svelte'

  let {
    colA,
    colB,
    columnOrder,
  }: {
    colA: string
    colB: string
    columnOrder: string[]
  } = $props()
</script>

<div style="display: flex; gap: 1rem;">
  <DayColumn dateKey={colA} label="Mon" sublabel="24 Feb" {columnOrder} />
  <DayColumn dateKey={colB} label="Tue" sublabel="25 Feb" {columnOrder} />
</div>
