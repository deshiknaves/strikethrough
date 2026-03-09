<script module lang="ts">
  export type ViewMode = 'week' | 'day'
  export const VIEW_MODE_STORAGE_KEY = 'strikethrough-view-mode'
</script>

<script lang="ts">
  import { browser } from '$app/environment'
  import SegmentedControl from './SegmentedControl.svelte'

  interface Props {
    value: ViewMode
    onchange: (v: ViewMode) => void
  }

  let { value, onchange }: Props = $props()

  $effect(() => {
    if (browser) {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, value)
    }
  })
</script>

<SegmentedControl
  segments={[
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
  ]}
  {value}
  {onchange}
/>
